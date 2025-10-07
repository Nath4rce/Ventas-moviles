const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireBuyer } = require('../middleware/auth');
const { validateReview, validateId } = require('../middleware/validation');

const router = express.Router();

// GET /api/reviews/product/:productId - Obtener reseñas de un producto
router.get('/product/:productId', validateId, async (req, res) => {
  try {
    const productId = req.params.productId;
    const pool = await getPool();

    // Verificar que el producto existe
    const productResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query('SELECT id, titulo FROM productos WHERE id = @productId AND is_active = 1');

    if (productResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Obtener reseñas del producto
    const reviewsResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query(`
        SELECT 
          r.id,
          r.rating,
          r.comentario,
          r.created_at,
          u.nombre as usuario_nombre,
          u.id_institucional as usuario_id_institucional,
          u.avatar_url as usuario_avatar
        FROM resenas r
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE r.producto_id = @productId
        ORDER BY r.created_at DESC
      `);

    res.json({
      success: true,
      data: {
        reviews: reviewsResult.recordset,
        product: productResult.recordset[0]
      }
    });

  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/reviews - Crear nueva reseña
router.post('/', authenticateToken, requireBuyer, validateReview, async (req, res) => {
  try {
    const { producto_id, rating, comentario } = req.body;
    const usuarioId = req.user.id;
    const pool = await getPool();

    // Verificar que el producto existe
    const productResult = await pool.request()
      .input('productoId', sql.Int, producto_id)
      .query('SELECT id, titulo, vendedor_id FROM productos WHERE id = @productoId AND is_active = 1');

    if (productResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el usuario no es el vendedor
    if (productResult.recordset[0].vendedor_id === usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes reseñar tu propio producto'
      });
    }

    // Verificar si ya existe una reseña del usuario para este producto
    const existingResult = await pool.request()
      .input('productoId', sql.Int, producto_id)
      .input('usuarioId', sql.Int, usuarioId)
      .query('SELECT id FROM resenas WHERE producto_id = @productoId AND usuario_id = @usuarioId');

    if (existingResult.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este producto'
      });
    }

    // Insertar nueva reseña
    await pool.request()
      .input('productoId', sql.Int, producto_id)
      .input('usuarioId', sql.Int, usuarioId)
      .input('rating', sql.Int, rating)
      .input('comentario', sql.NVarChar(1000), comentario)
      .query('INSERT INTO resenas (producto_id, usuario_id, rating, comentario) VALUES (@productoId, @usuarioId, @rating, @comentario)');

    // El trigger se encarga de actualizar el rating del producto automáticamente

    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente'
    });

  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/reviews/:id - Actualizar reseña
router.put('/:id', authenticateToken, validateReview, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comentario } = req.body;
    const usuarioId = req.user.id;

    // Verificar que la reseña existe y pertenece al usuario
    const pool = await getPool();
    const reviewResult = await pool.request()
      .input('reviewId', sql.Int, reviewId)
      .input('usuarioId', sql.Int, usuarioId)
      .query('SELECT id, producto_id FROM resenas WHERE id = @reviewId AND usuario_id = @usuarioId');

    if (reviewResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada o no tienes permisos para modificarla'
      });
    }

    // Actualizar reseña
    await pool.request()
      .input('reviewId', sql.Int, reviewId)
      .input('rating', sql.Int, rating)
      .input('comentario', sql.NVarChar(1000), comentario)
      .query('UPDATE resenas SET rating = @rating, comentario = @comentario, updated_at = GETDATE() WHERE id = @reviewId');

    // El trigger se encarga de actualizar el rating del producto automáticamente

    res.json({
      success: true,
      message: 'Reseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/reviews/:id - Eliminar reseña
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const usuarioId = req.user.id;

    // Verificar que la reseña existe y pertenece al usuario
    const pool = await getPool();
    const reviewResult = await pool.request()
      .input('reviewId', sql.Int, reviewId)
      .input('usuarioId', sql.Int, usuarioId)
      .query('SELECT id, producto_id FROM resenas WHERE id = @reviewId AND usuario_id = @usuarioId');


    if (reviewResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada o no tienes permisos para eliminarla'
      });
    }

    // Eliminar reseña
    await pool.request()
      .input('reviewId', sql.Int, reviewId)
      .query('DELETE FROM resenas WHERE id = @reviewId');

    // El trigger se encarga de actualizar el rating del producto automáticamente

    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/reviews/user/:userId - Obtener reseñas de un usuario
router.get('/user/:userId', validateId, async (req, res) => {
  try {
    const userId = req.params.userId;

    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          r.id,
          r.rating,
          r.comentario,
          r.created_at,
          p.id as producto_id,
          p.titulo as producto_titulo,
          p.precio as producto_precio,
          (SELECT TOP 1 imagen_url FROM producto_imagenes WHERE producto_id = p.id AND is_principal = 1) as producto_imagen
        FROM resenas r
        JOIN productos p ON r.producto_id = p.id
        WHERE r.usuario_id = @userId
        ORDER BY r.created_at DESC
      `);

    res.json({
      success: true,
      data: { reviews: result.recordset }
    });

  } catch (error) {
    console.error('Error al obtener reseñas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/reviews/stats/:productId - Obtener estadísticas de reseñas de un producto
router.get('/stats/:productId', validateId, async (req, res) => {
  try {
    const productId = req.params.productId;

    // Verificar que el producto existe
    const pool = await getPool();
    const productResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query('SELECT id, titulo FROM productos WHERE id = @productId AND is_active = 1');

    if (productResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    // Obtener estadísticas
    const statsResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query(`
        SELECT 
          COUNT(*) as total_resenas,
          AVG(CAST(rating AS DECIMAL(3,2))) as rating_promedio,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as cinco_estrellas,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as cuatro_estrellas,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as tres_estrellas,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as dos_estrellas,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as una_estrella
        FROM resenas 
        WHERE producto_id = @productId
      `);

    res.json({
      success: true,
      data: {
        stats: statsResult.recordset[0],
        product: productResult.recordset[0]
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
