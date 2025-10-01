const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateNotification, validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// GET /api/notifications - Obtener notificaciones del usuario actual
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['un.usuario_id = ?'];
    let queryParams = [userId];

    if (unread_only === 'true') {
      whereConditions.push('un.is_read = FALSE');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Obtener notificaciones del usuario
    const notifications = await query(`
      SELECT 
        n.id,
        n.titulo,
        n.mensaje,
        n.tipo,
        n.destinatario_tipo,
        n.nrc_especifico,
        n.is_site_wide,
        n.created_at,
        un.is_read,
        un.read_at
      FROM notificaciones n
      JOIN usuario_notificaciones un ON n.id = un.notificacion_id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    // Contar total de notificaciones
    const countQuery = `
      SELECT COUNT(*) as total
      FROM notificaciones n
      JOIN usuario_notificaciones un ON n.id = un.notificacion_id
      ${whereClause}
    `;

    const [countResult] = await query(countQuery, queryParams);
    const total = countResult.total;

    // Contar notificaciones no leídas
    const unreadCount = await query(`
      SELECT COUNT(*) as unread_count
      FROM notificaciones n
      JOIN usuario_notificaciones un ON n.id = un.notificacion_id
      WHERE un.usuario_id = ? AND un.is_read = FALSE
    `, [userId]);

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
        unread_count: unreadCount[0].unread_count
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

    // Verificar que la notificación existe y pertenece al usuario
    const notification = await query(
      'SELECT id FROM usuario_notificaciones WHERE notificacion_id = ? AND usuario_id = ?',
      [notificationId, userId]
    );

    if (notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Marcar como leída
    await query(
      'UPDATE usuario_notificaciones SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE notificacion_id = ? AND usuario_id = ?',
      [notificationId, userId]
    );

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

    await query(
      'UPDATE usuario_notificaciones SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE usuario_id = ? AND is_read = FALSE',
      [userId]
    );

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
    const { titulo, mensaje, tipo, destinatario_tipo, nrc_especifico } = req.body;

    // Insertar notificación
    const result = await query(
      'INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_tipo, nrc_especifico) VALUES (?, ?, ?, ?, ?)',
      [titulo, mensaje, tipo, destinatario_tipo, nrc_especifico]
    );

    const notificationId = result.insertId;

    // Crear notificaciones para usuarios según el tipo de destinatario
    let targetUsers = [];

    if (destinatario_tipo === 'all') {
      targetUsers = await query('SELECT id FROM usuarios WHERE is_active = TRUE');
    } else if (destinatario_tipo === 'sellers') {
      targetUsers = await query('SELECT id FROM usuarios WHERE rol = "seller" AND is_active = TRUE');
    } else if (destinatario_tipo === 'students') {
      targetUsers = await query('SELECT id FROM usuarios WHERE rol = "buyer" AND is_active = TRUE');
    } else if (destinatario_tipo === 'nrc' && nrc_especifico) {
      targetUsers = await query('SELECT id FROM usuarios WHERE nrc = ? AND is_active = TRUE', [nrc_especifico]);
    }

    // Insertar notificaciones para usuarios
    if (targetUsers.length > 0) {
      const userNotifications = targetUsers.map(user => [notificationId, user.id]);
      await query(
        'INSERT INTO usuario_notificaciones (notificacion_id, usuario_id) VALUES ?',
        [userNotifications]
      );
    }

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
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Obtener todas las notificaciones
    const notifications = await query(`
      SELECT 
        n.id,
        n.titulo,
        n.mensaje,
        n.tipo,
        n.destinatario_tipo,
        n.nrc_especifico,
        n.is_site_wide,
        n.created_at,
        COUNT(un.id) as recipients_count,
        COUNT(CASE WHEN un.is_read = TRUE THEN 1 END) as read_count
      FROM notificaciones n
      LEFT JOIN usuario_notificaciones un ON n.id = un.notificacion_id
      GROUP BY n.id
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    // Contar total de notificaciones
    const [countResult] = await query('SELECT COUNT(*) as total FROM notificaciones');
    const total = countResult.total;

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
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
    const notification = await query(
      'SELECT id FROM notificaciones WHERE id = ?',
      [notificationId]
    );

    if (notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Eliminar notificación (las relaciones se eliminan automáticamente por CASCADE)
    await query('DELETE FROM notificaciones WHERE id = ?', [notificationId]);

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
    const siteConfig = await query(
      'SELECT valor FROM sitio_config WHERE clave = "site_disabled"'
    );

    const isDisabled = siteConfig.length > 0 ? siteConfig[0].valor === 'true' : false;

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
    await query(
      `INSERT INTO sitio_config (clave, valor, descripcion) 
       VALUES ('site_disabled', ?, 'Estado del sitio (true/false)')
       ON DUPLICATE KEY UPDATE valor = ?`,
      [is_disabled.toString(), is_disabled.toString()]
    );

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