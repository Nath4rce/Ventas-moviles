const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../config/database-sqlite');
const { validateProfileUpdate, validatePasswordChange } = require('../middleware/validation');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configuración de multer para subida de imágenes de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
    }
  }
});

// GET /api/users/profile - Obtener perfil del usuario actual
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();

    db.get(`
      SELECT id, student_id, email, name, role, profile_image, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [userId], (err, user) => {
      if (err) {
        console.error('Error al obtener perfil:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener perfil'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    });
  } catch (error) {
    console.error('Error en GET /users/profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/profile - Actualizar perfil del usuario
router.put('/profile', authenticateToken, upload.single('profileImage'), validateProfileUpdate, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;
    const db = getDatabase();

    // Obtener datos actuales del usuario
    db.get(`
      SELECT * FROM users WHERE id = ?
    `, [userId], (err, currentUser) => {
      if (err) {
        console.error('Error al obtener usuario actual:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener datos del usuario'
        });
      }

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si el email ya existe en otro usuario
      if (email && email !== currentUser.email) {
        db.get(`
          SELECT id FROM users WHERE email = ? AND id != ?
        `, [email, userId], (err, existingUser) => {
          if (err) {
            console.error('Error al verificar email:', err);
            return res.status(500).json({
              success: false,
              message: 'Error al verificar email'
            });
          }

          if (existingUser) {
            return res.status(409).json({
              success: false,
              message: 'El correo ya está registrado por otro usuario'
            });
          }

          updateUserProfile();
        });
      } else {
        updateUserProfile();
      }

      function updateUserProfile() {
        const updateData = {
          name: name || currentUser.name,
          email: email || currentUser.email,
          profile_image: profileImage || currentUser.profile_image,
          updated_at: new Date().toISOString()
        };

        db.run(`
          UPDATE users 
          SET name = ?, email = ?, profile_image = ?, updated_at = ?
          WHERE id = ?
        `, [
          updateData.name,
          updateData.email,
          updateData.profile_image,
          updateData.updated_at,
          userId
        ], function(err) {
          if (err) {
            console.error('Error al actualizar perfil:', err);
            return res.status(500).json({
              success: false,
              message: 'Error al actualizar perfil'
            });
          }

          // Eliminar imagen anterior si se subió una nueva
          if (profileImage && currentUser.profile_image) {
            const oldImagePath = path.join(process.cwd(), currentUser.profile_image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          // Obtener usuario actualizado
          db.get(`
            SELECT id, student_id, email, name, role, profile_image, created_at, updated_at
            FROM users 
            WHERE id = ?
          `, [userId], (err, updatedUser) => {
            if (err) {
              console.error('Error al obtener usuario actualizado:', err);
              return res.status(500).json({
                success: false,
                message: 'Error al obtener usuario actualizado'
              });
            }

            res.json({
              success: true,
              message: 'Perfil actualizado exitosamente',
              data: { user: updatedUser }
            });
          });
        });
      }
    });
  } catch (error) {
    console.error('Error en PUT /users/profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/password - Cambiar contraseña
router.put('/password', authenticateToken, validatePasswordChange, (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const db = getDatabase();

    // Obtener contraseña actual del usuario
    db.get(`
      SELECT password FROM users WHERE id = ?
    `, [userId], async (err, user) => {
      if (err) {
        console.error('Error al obtener contraseña actual:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al verificar contraseña actual'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Hash de la nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      db.run(`
        UPDATE users 
        SET password = ?, updated_at = ?
        WHERE id = ?
      `, [hashedNewPassword, new Date().toISOString(), userId], function(err) {
        if (err) {
          console.error('Error al actualizar contraseña:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al actualizar contraseña'
          });
        }

        res.json({
          success: true,
          message: 'Contraseña actualizada exitosamente'
        });
      });
    });
  } catch (error) {
    console.error('Error en PUT /users/password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/users/notifications - Obtener notificaciones del usuario
router.get('/notifications', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const db = getDatabase();

    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    let params = [userId];

    if (unreadOnly === 'true') {
      query += ` AND is_read = 0`;
    }

    query += ` ORDER BY created_at DESC`;

    // Aplicar paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    db.all(query, params, (err, notifications) => {
      if (err) {
        console.error('Error al obtener notificaciones:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener notificaciones'
        });
      }

      // Obtener total de notificaciones
      let countQuery = `SELECT COUNT(*) as total FROM notifications WHERE user_id = ?`;
      let countParams = [userId];

      if (unreadOnly === 'true') {
        countQuery += ` AND is_read = 0`;
      }

      db.get(countQuery, countParams, (err, countResult) => {
        if (err) {
          console.error('Error al contar notificaciones:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al obtener notificaciones'
          });
        }

        const total = countResult.total;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
          success: true,
          data: {
            notifications,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: total,
              itemsPerPage: parseInt(limit)
            }
          }
        });
      });
    });
  } catch (error) {
    console.error('Error en GET /users/notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/notifications/:id/read - Marcar notificación como leída
router.put('/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDatabase();

    db.run(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ? AND user_id = ?
    `, [id, userId], function(err) {
      if (err) {
        console.error('Error al marcar notificación como leída:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al marcar notificación como leída'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    });
  } catch (error) {
    console.error('Error en PUT /users/notifications/:id/read:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/notifications/read-all - Marcar todas las notificaciones como leídas
router.put('/notifications/read-all', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();

    db.run(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ? AND is_read = 0
    `, [userId], function(err) {
      if (err) {
        console.error('Error al marcar notificaciones como leídas:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al marcar notificaciones como leídas'
        });
      }

      res.json({
        success: true,
        message: `${this.changes} notificaciones marcadas como leídas`
      });
    });
  } catch (error) {
    console.error('Error en PUT /users/notifications/read-all:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/users/favorites - Obtener productos favoritos del usuario
router.get('/favorites', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const db = getDatabase();

    const offset = (parseInt(page) - 1) * parseInt(limit);

    db.all(`
      SELECT p.*, u.name as seller_name, u.student_id as seller_id
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE f.user_id = ? AND p.status = 'active'
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset], (err, favorites) => {
      if (err) {
        console.error('Error al obtener favoritos:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener productos favoritos'
        });
      }

      // Obtener total de favoritos
      db.get(`
        SELECT COUNT(*) as total
        FROM favorites f
        JOIN products p ON f.product_id = p.id
        WHERE f.user_id = ? AND p.status = 'active'
      `, [userId], (err, countResult) => {
        if (err) {
          console.error('Error al contar favoritos:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al obtener productos favoritos'
          });
        }

        const total = countResult.total;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
          success: true,
          data: {
            favorites,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: total,
              itemsPerPage: parseInt(limit)
            }
          }
        });
      });
    });
  } catch (error) {
    console.error('Error en GET /users/favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/users/favorites/:productId - Agregar producto a favoritos
router.post('/favorites/:productId', authenticateToken, (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const db = getDatabase();

    // Verificar que el producto existe y está activo
    db.get(`
      SELECT id FROM products WHERE id = ? AND status = 'active'
    `, [productId], (err, product) => {
      if (err) {
        console.error('Error al verificar producto:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al verificar producto'
        });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado o no disponible'
        });
      }

      // Verificar si ya está en favoritos
      db.get(`
        SELECT id FROM favorites WHERE user_id = ? AND product_id = ?
      `, [userId, productId], (err, existingFavorite) => {
        if (err) {
          console.error('Error al verificar favorito:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al verificar favorito'
          });
        }

        if (existingFavorite) {
          return res.status(409).json({
            success: false,
            message: 'El producto ya está en tus favoritos'
          });
        }

        // Agregar a favoritos
        db.run(`
          INSERT INTO favorites (user_id, product_id) VALUES (?, ?)
        `, [userId, productId], function(err) {
          if (err) {
            console.error('Error al agregar favorito:', err);
            return res.status(500).json({
              success: false,
              message: 'Error al agregar a favoritos'
            });
          }

          res.status(201).json({
            success: true,
            message: 'Producto agregado a favoritos'
          });
        });
      });
    });
  } catch (error) {
    console.error('Error en POST /users/favorites/:productId:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/users/favorites/:productId - Eliminar producto de favoritos
router.delete('/favorites/:productId', authenticateToken, (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const db = getDatabase();

    db.run(`
      DELETE FROM favorites WHERE user_id = ? AND product_id = ?
    `, [userId, productId], function(err) {
      if (err) {
        console.error('Error al eliminar favorito:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al eliminar de favoritos'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado en favoritos'
        });
      }

      res.json({
        success: true,
        message: 'Producto eliminado de favoritos'
      });
    });
  } catch (error) {
    console.error('Error en DELETE /users/favorites/:productId:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/users/stats - Obtener estadísticas del usuario (solo para vendedores)
router.get('/stats', authenticateToken, requireRole(['seller', 'admin']), (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();

    // Obtener estadísticas de productos
    db.get(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
        COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_products,
        AVG(price) as average_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM products 
      WHERE seller_id = ?
    `, [userId], (err, productStats) => {
      if (err) {
        console.error('Error al obtener estadísticas de productos:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener estadísticas'
        });
      }

      // Obtener productos más populares (por favoritos)
      db.all(`
        SELECT p.id, p.title, p.price, COUNT(f.id) as favorite_count
        FROM products p
        LEFT JOIN favorites f ON p.id = f.product_id
        WHERE p.seller_id = ? AND p.status = 'active'
        GROUP BY p.id
        ORDER BY favorite_count DESC
        LIMIT 5
      `, [userId], (err, popularProducts) => {
        if (err) {
          console.error('Error al obtener productos populares:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
          });
        }

        res.json({
          success: true,
          data: {
            productStats,
            popularProducts
          }
        });
      });
    });
  } catch (error) {
    console.error('Error en GET /users/stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
