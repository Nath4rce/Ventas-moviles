const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateNotification, validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// GET /api/notifications - Obtener notificaciones del usuario actual
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const userId = req.user.id;
    const idInstitucional = req.user.id_institucional;
    const rol = req.user.rol;
    const { page = 1, limit = 20, unread_only = false } = req.query;

    const pool = await getPool();

    // Usar stored procedure
    const result = await executeProcedure('sp_obtener_notificaciones_usuario', {
      usuario_id: userId,
      id_institucional: idInstitucional,
      rol: rol,
      solo_no_leidas: unread_only === 'true' ? 1 : 0
    });

    const allNotifications = result.recordset;

    // Paginación manual
    const offset = (page - 1) * limit;
    const notifications = allNotifications.slice(offset, offset + parseInt(limit));
    const total = allNotifications.length;

    // Contar no leídas
    const unreadResult = await pool.request()
      .input('usuario_id', sql.Int, userId)
      .query(`
        SELECT COUNT(*) as unread_count 
        FROM notificaciones_leidas nl
        RIGHT JOIN notificaciones n ON nl.notificacion_id = n.id AND nl.usuario_id = @usuario_id
        WHERE nl.id IS NULL
          AND (
            n.destinatario_tipo = 'all'
            OR (n.destinatario_tipo = 'sellers' AND '${rol}' = 'seller')
            OR (n.destinatario_tipo = 'buyers' AND '${rol}' = 'buyer')
            OR (n.destinatario_tipo = 'id_institucional_especifico' AND n.id_institucional_especifico = '${idInstitucional}')
          )
      `);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unread_count: unreadResult.recordset[0].unread_count
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
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const pool = await getPool();

    // Verificar que la notificación existe
    const checkNotif = await pool.request()
      .input('notificationId', sql.Int, notificationId)
      .query('SELECT id FROM notificaciones WHERE id = @notificationId');

    if (checkNotif.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Insertar o actualizar en notificaciones_leidas
    await pool.request()
      .input('notificationId', sql.Int, notificationId)
      .input('userId', sql.Int, userId)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM notificaciones_leidas WHERE notificacion_id = @notificationId AND usuario_id = @userId)
        BEGIN
          INSERT INTO notificaciones_leidas (notificacion_id, usuario_id) 
          VALUES (@notificationId, @userId)
        END
      `);

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

    const pool = await getPool();
    const idInstitucional = req.user.id_institucional;
    const rol = req.user.rol;

    // Obtener todas las notificaciones aplicables al usuario
    const notificationsResult = await pool.request()
      .input('idInstitucional', sql.Char(9), idInstitucional)
      .input('rol', sql.NVarChar(20), rol)
      .query(`
        SELECT id 
        FROM notificaciones 
        WHERE destinatario_tipo = 'all'
          OR (destinatario_tipo = 'sellers' AND @rol = 'seller')
          OR (destinatario_tipo = 'buyers' AND @rol = 'buyer')
          OR (destinatario_tipo = 'id_institucional_especifico' AND id_institucional_especifico = @idInstitucional)
      `);

    // Marcar cada una como leída
    for (const notif of notificationsResult.recordset) {
      await pool.request()
        .input('notificationId', sql.Int, notif.id)
        .input('userId', sql.Int, userId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM notificaciones_leidas WHERE notificacion_id = @notificationId AND usuario_id = @userId)
          BEGIN
            INSERT INTO notificaciones_leidas (notificacion_id, usuario_id) 
            VALUES (@notificationId, @userId)
          END
        `);
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

// POST /api/notifications - Crear nueva notificación (solo admin)
router.post('/', authenticateToken, requireAdmin, validateNotification, async (req, res) => {
  try {
    const { titulo, mensaje, tipo, destinatario_tipo, id_institucional_especifico, prioridad = 1, es_permanente = 0 } = req.body;

    const pool = await getPool();
    const insertResult = await pool.request()
      .input('titulo', sql.NVarChar(255), titulo)
      .input('mensaje', sql.NVarChar(sql.MAX), mensaje)
      .input('tipo', sql.NVarChar(20), tipo)
      .input('destinatario_tipo', sql.NVarChar(20), destinatario_tipo)
      .input('id_institucional_especifico', sql.Char(9), id_institucional_especifico || null)
      .input('prioridad', sql.Int, prioridad)
      .input('es_permanente', sql.Bit, es_permanente ? 1 : 0)
      .input('created_by', sql.Int, req.user.id)
      .query(`
        INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_tipo, id_institucional_especifico, prioridad, es_permanente, created_by, is_site_wide)
        OUTPUT INSERTED.id
        VALUES (@titulo, @mensaje, @tipo, @destinatario_tipo, @id_institucional_especifico, @prioridad, @es_permanente, @created_by, 0)
      `);

    const notificationId = insertResult.recordset[0].id;

    // Contar usuarios afectados
    let countQuery = '';
    if (destinatario_tipo === 'all') {
      countQuery = 'SELECT COUNT(*) as count FROM usuarios WHERE is_active = 1';
    } else if (destinatario_tipo === 'sellers') {
      countQuery = "SELECT COUNT(*) as count FROM usuarios WHERE rol = 'seller' AND is_active = 1";
    } else if (destinatario_tipo === 'buyers') {
      countQuery = "SELECT COUNT(*) as count FROM usuarios WHERE rol = 'buyer' AND is_active = 1";
    } else if (destinatario_tipo === 'id_institucional_especifico' && id_institucional_especifico) {
      countQuery = `SELECT COUNT(*) as count FROM usuarios WHERE id_institucional = '${id_institucional_especifico}' AND is_active = 1`;
    }

    const countResult = await pool.request().query(countQuery);

    res.status(201).json({
      success: true,
      message: 'Notificación creada exitosamente',
      data: {
        notification_id: notificationId,
        recipients_count: targetUsers.length
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
router.get('/admin', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('offset', sql.Int, parseInt(offset))
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT 
          n.id,
          n.titulo,
          n.mensaje,
          n.tipo,
          n.destinatario_tipo,
          n.id_institucional_especifico,
          n.prioridad,
          n.es_permanente,
          n.is_site_wide,
          n.created_at,
          COUNT(nl.id) as read_count
        FROM notificaciones n
        LEFT JOIN notificaciones_leidas nl ON n.id = nl.notificacion_id
        GROUP BY n.id, n.titulo, n.mensaje, n.tipo, n.destinatario_tipo, n.id_institucional_especifico, n.prioridad, n.es_permanente, n.is_site_wide, n.created_at
        ORDER BY n.prioridad DESC, n.created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM notificaciones');

    res.json({
      success: true,
      data: {
        notifications: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.recordset[0].total,
          pages: Math.ceil(countResult.recordset[0].total / limit)
        }
      }
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
    const notificationId = req.params.id;

    // Verificar que la notificación existe
    const pool = await getPool();
    const checkNotif = await pool.request()
      .input('notificationId', sql.Int, notificationId)
      .query('SELECT id FROM notificaciones WHERE id = @notificationId');

    if (checkNotif.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Primero eliminar registros de leídas
    await pool.request()
      .input('notificationId', sql.Int, notificationId)
      .query('DELETE FROM notificaciones_leidas WHERE notificacion_id = @notificationId');

    // Luego eliminar la notificación
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

// GET /api/notifications/site-status - Obtener estado del sitio
router.get('/site-status', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query("SELECT valor FROM configuracion_sitio WHERE clave = 'sitio_activo'");

    const isDisabled = result.recordset.length > 0 ? result.recordset[0].valor === 'false' : false;

    res.json({
      success: true,
      data: {
        is_disabled: isDisabled
      }
    });

  } catch (error) {
    console.error('Error al obtener estado del sitio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/notifications/site-status - Cambiar estado del sitio (solo admin)
router.put('/site-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { is_disabled } = req.body;

    // Actualizar o insertar configuración del sitio
    const pool = await getPool();
await pool.request()
  .input('valor', sql.NVarChar(sql.MAX), (!is_disabled).toString())
  .input('userId', sql.Int, req.user.id)
  .query(`
    IF EXISTS (SELECT 1 FROM configuracion_sitio WHERE clave = 'sitio_activo')
    BEGIN
      UPDATE configuracion_sitio 
      SET valor = @valor, updated_at = GETDATE(), updated_by = @userId
      WHERE clave = 'sitio_activo'
    END
    ELSE
    BEGIN
      INSERT INTO configuracion_sitio (clave, valor, descripcion, updated_by)
      VALUES ('sitio_activo', @valor, 'Estado del sitio (true/false)', @userId)
    END
  `);

    // Si se está deshabilitando el sitio, enviar notificación
    if (is_disabled) {
      const maintenanceMessage = await query(
        'SELECT valor FROM sitio_config WHERE clave = "maintenance_message"'
      );

      const message = maintenanceMessage.length > 0 ?
        maintenanceMessage[0].valor :
        'El sitio está temporalmente fuera de servicio por mantenimiento.';

      // Crear notificación de mantenimiento
      const result = await query(
        'INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_tipo, is_site_wide) VALUES (?, ?, "warning", "all", TRUE)',
        ['Mantenimiento del sitio', message]
      );

      const notificationId = result.insertId;

      // Enviar a todos los usuarios activos
      const users = await query('SELECT id FROM usuarios WHERE is_active = TRUE');
      if (users.length > 0) {
        const userNotifications = users.map(user => [notificationId, user.id]);
        await query(
          'INSERT INTO usuario_notificaciones (notificacion_id, usuario_id) VALUES ?',
          [userNotifications]
        );
      }
    }

    res.json({
      success: true,
      message: `Sitio ${is_disabled ? 'deshabilitado' : 'habilitado'} exitosamente`
    });

  } catch (error) {
    console.error('Error al cambiar estado del sitio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
