const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateNotification, validateId, validatePagination } = require('../middleware/validation');
const router = express.Router();

// Helper para ejecutar stored procedures
async function executeProcedure(procedureName, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (typeof value === 'number') {
      request.input(key, sql.Int, value);
    } else if (typeof value === 'string') {
      if (value.length === 9) {
        request.input(key, sql.Char(9), value);
      } else {
        request.input(key, sql.NVarChar, value);
      }
    } else if (typeof value === 'boolean') {
      request.input(key, sql.Bit, value ? 1 : 0);
    }
  });
  
  return await request.execute(procedureName);
}

// GET /api/notifications - Obtener notificaciones del usuario actual
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const idInstitucional = req.user.id_institucional;
    const rol = req.user.rol;
    const soloNoLeidas = req.query.unread_only === 'true';

    const result = await executeProcedure('sp_obtener_notificaciones_usuario', {
      usuario_id: userId,
      id_institucional: idInstitucional,
      rol: rol,
      solo_no_leidas: soloNoLeidas
    });

    const notifications = result.recordset.map(n => ({
      id: n.id,
      titulo: n.titulo,
      mensaje: n.mensaje,
      tipo: n.tipo,
      destinatario_tipo: n.destinatario_tipo,
      id_institucional_especifico: n.id_institucional_especifico,
      is_site_wide: n.is_site_wide,
      prioridad: n.prioridad,
      es_permanente: n.es_permanente,
      created_at: n.created_at,
      is_read: n.leida === 1,
      leida_at: n.leida_at
    }));

    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount
      }
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/notifications/:id/read - Marcar notificación como leída
router.put('/:id/read', authenticateToken, validateId, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;
    const pool = await getPool();

    // Verificar si ya está marcada como leída
    const checkResult = await pool.request()
      .input('notificationId', sql.Int, notificationId)
      .input('userId', sql.Int, userId)
      .query('SELECT id FROM notificaciones_leidas WHERE notificacion_id = @notificationId AND usuario_id = @userId');

    if (checkResult.recordset.length > 0) {
      return res.json({
        success: true,
        message: 'La notificación ya estaba marcada como leída'
      });
    }

    // Insertar registro de lectura
    await pool.request()
      .input('notificationId', sql.Int, notificationId)
      .input('userId', sql.Int, userId)
      .query('INSERT INTO notificaciones_leidas (notificacion_id, usuario_id) VALUES (@notificationId, @userId)');

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/notifications/read-all - Marcar todas las notificaciones como leídas
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const idInstitucional = req.user.id_institucional;
    const rol = req.user.rol;
    const pool = await getPool();

    // Obtener todas las notificaciones del usuario
    const result = await executeProcedure('sp_obtener_notificaciones_usuario', {
      usuario_id: userId,
      id_institucional: idInstitucional,
      rol: rol,
      solo_no_leidas: false
    });

    // Insertar en batch todas las notificaciones no leídas
    for (const notification of result.recordset) {
      if (notification.leida === 0) {
        await pool.request()
          .input('notificationId', sql.Int, notification.id)
          .input('userId', sql.Int, userId)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM notificaciones_leidas WHERE notificacion_id = @notificationId AND usuario_id = @userId)
            BEGIN
              INSERT INTO notificaciones_leidas (notificacion_id, usuario_id) VALUES (@notificationId, @userId)
            END
          `);
      }
    }

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/notifications - Crear notificación (solo admin)
router.post('/', authenticateToken, requireAdmin, validateNotification, async (req, res) => {
  try {
    const { titulo, mensaje, tipo, destinatario_tipo, id_institucional_especifico } = req.body;
    const createdBy = req.user.id;
    const pool = await getPool();

    const result = await pool.request()
      .input('titulo', sql.NVarChar, titulo)
      .input('mensaje', sql.NVarChar, mensaje)
      .input('tipo', sql.NVarChar, tipo || 'info')
      .input('destinatario_tipo', sql.NVarChar, destinatario_tipo)
      .input('id_institucional_especifico', sql.Char(9), id_institucional_especifico || null)
      .input('is_site_wide', sql.Bit, destinatario_tipo === 'all' ? 1 : 0)
      .input('created_by', sql.Int, createdBy)
      .query(`
        INSERT INTO notificaciones 
        (titulo, mensaje, tipo, destinatario_tipo, id_institucional_especifico, is_site_wide, created_by)
        VALUES 
        (@titulo, @mensaje, @tipo, @destinatario_tipo, @id_institucional_especifico, @is_site_wide, @created_by);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    res.status(201).json({
      success: true,
      message: 'Notificación creada exitosamente',
      data: {
        id: result.recordset[0].id
      }
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/notifications/admin - Obtener todas las notificaciones (solo admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT * FROM notificaciones ORDER BY created_at DESC');

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error al obtener notificaciones (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/notifications/:id - Eliminar notificación (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const pool = await getPool();

    // Eliminar registros de lectura primero
    await pool.request()
      .input('notificationId', sql.Int, notificationId)
      .query('DELETE FROM notificaciones_leidas WHERE notificacion_id = @notificationId');

    // Eliminar la notificación
    await pool.request()
      .input('notificationId', sql.Int, notificationId)
      .query('DELETE FROM notificaciones WHERE id = @notificationId');

    res.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
