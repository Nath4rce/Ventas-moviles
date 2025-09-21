const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUser, validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// GET /api/admin/stats - Obtener estadísticas generales
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Obtener estadísticas usando la vista
    const stats = await query('SELECT * FROM vista_estadisticas');

    // Obtener estadísticas adicionales
    const recentProducts = await query(`
      SELECT 
        p.id,
        p.titulo,
        p.precio,
        p.created_at,
        u.nombre as vendedor_nombre,
        c.nombre as categoria_nombre
      FROM productos p
      JOIN usuarios u ON p.vendedor_id = u.id
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    const topCategories = await query(`
      SELECT 
        c.nombre,
        COUNT(p.id) as total_productos
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id AND p.is_active = TRUE
      GROUP BY c.id, c.nombre
      ORDER BY total_productos DESC
    `);

    res.json({
      success: true,
      data: {
        ...stats[0],
        recent_products: recentProducts,
        top_categories: topCategories
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/admin/users - Obtener usuarios con filtros
router.get('/users', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      nrc, 
      rol, 
      status,
      search 
    } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    // Filtros
    if (nrc) {
      whereConditions.push('nrc LIKE ?');
      queryParams.push(`%${nrc}%`);
    }

    if (rol && rol !== 'all') {
      whereConditions.push('rol = ?');
      queryParams.push(rol);
    }

    if (status && status !== 'all') {
      const isActive = status === 'active';
      whereConditions.push('is_active = ?');
      queryParams.push(isActive);
    }

    if (search) {
      whereConditions.push('(nombre LIKE ? OR student_id LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Obtener usuarios
    const users = await query(`
      SELECT 
        id,
        student_id,
        email,
        nombre,
        rol,
        nrc,
        is_active,
        created_at,
        updated_at
      FROM usuarios
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    // Contar total de usuarios
    const countQuery = `SELECT COUNT(*) as total FROM usuarios ${whereClause}`;
    const [countResult] = await query(countQuery, queryParams);
    const total = countResult.total;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/admin/users - Crear nuevo usuario
router.post('/users', authenticateToken, requireAdmin, validateUser, async (req, res) => {
  try {
    const { student_id, email, password, nombre, rol, nrc } = req.body;

    // Verificar si el student_id ya existe
    const existingStudentId = await query(
      'SELECT id FROM usuarios WHERE student_id = ?',
      [student_id]
    );

    if (existingStudentId.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ID estudiantil ya registrado'
      });
    }

    // Verificar si el email ya existe
    const existingEmail = await query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email ya registrado'
      });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const result = await query(
      `INSERT INTO usuarios (student_id, email, password_hash, nombre, rol, nrc, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [student_id, email, passwordHash, nombre, rol, nrc]
    );

    const newUserId = result.insertId;

    // Obtener usuario creado
    const newUser = await query(
      'SELECT id, student_id, email, nombre, rol, nrc, is_active, created_at FROM usuarios WHERE id = ?',
      [newUserId]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: { user: newUser[0] }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/admin/users/:id/toggle-status - Activar/desactivar usuario
router.put('/users/:id/toggle-status', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const userId = req.params.id;

    // Verificar que el usuario existe
    const user = await query(
      'SELECT id, is_active, nombre FROM usuarios WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir desactivar al último admin
    if (user[0].is_active && req.user.id === parseInt(userId)) {
      const adminCount = await query(
        'SELECT COUNT(*) as count FROM usuarios WHERE rol = "admin" AND is_active = TRUE'
      );

      if (adminCount[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No puedes desactivar el último administrador'
        });
      }
    }

    // Cambiar estado
    const newStatus = !user[0].is_active;
    await query(
      'UPDATE usuarios SET is_active = ? WHERE id = ?',
      [newStatus, userId]
    );

    res.json({
      success: true,
      message: `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/admin/users/:id/role - Cambiar rol de usuario
router.put('/users/:id/role', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const userId = req.params.id;
    const { rol } = req.body;

    if (!['admin', 'seller', 'buyer'].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    // Verificar que el usuario existe
    const user = await query(
      'SELECT id, rol, nombre FROM usuarios WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir cambiar el rol del último admin
    if (user[0].rol === 'admin' && rol !== 'admin') {
      const adminCount = await query(
        'SELECT COUNT(*) as count FROM usuarios WHERE rol = "admin" AND is_active = TRUE'
      );

      if (adminCount[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No puedes cambiar el rol del último administrador'
        });
      }
    }

    // Cambiar rol
    await query(
      'UPDATE usuarios SET rol = ? WHERE id = ?',
      [rol, userId]
    );

    res.json({
      success: true,
      message: 'Rol cambiado exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar rol del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/admin/products - Obtener todos los productos (admin)
router.get('/products', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (status !== 'all') {
      const isActive = status === 'active';
      whereConditions.push('p.is_active = ?');
      queryParams.push(isActive);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Obtener productos
    const products = await query(`
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.precio,
        p.rating_promedio,
        p.total_resenas,
        p.is_active,
        p.created_at,
        c.nombre as categoria_nombre,
        u.nombre as vendedor_nombre,
        u.student_id as vendedor_id
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    // Contar total de productos
    const countQuery = `SELECT COUNT(*) as total FROM productos p ${whereClause}`;
    const [countResult] = await query(countQuery, queryParams);
    const total = countResult.total;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener productos (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/admin/products/:id/toggle-status - Activar/desactivar producto
router.put('/products/:id/toggle-status', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const productId = req.params.id;

    // Verificar que el producto existe
    const product = await query(
      'SELECT id, is_active, titulo FROM productos WHERE id = ?',
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Cambiar estado
    const newStatus = !product[0].is_active;
    await query(
      'UPDATE productos SET is_active = ? WHERE id = ?',
      [newStatus, productId]
    );

    res.json({
      success: true,
      message: `Producto ${newStatus ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/admin/categories - Obtener categorías
router.get('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categories = await query(
      'SELECT id, nombre, descripcion, icono, is_active, created_at FROM categorias ORDER BY nombre'
    );

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/admin/categories - Crear nueva categoría
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, icono } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'Nombre de categoría es requerido'
      });
    }

    // Verificar si la categoría ya existe
    const existingCategory = await query(
      'SELECT id FROM categorias WHERE nombre = ?',
      [nombre]
    );

    if (existingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Categoría ya existe'
      });
    }

    // Crear categoría
    const result = await query(
      'INSERT INTO categorias (nombre, descripcion, icono) VALUES (?, ?, ?)',
      [nombre, descripcion, icono]
    );

    const categoryId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category_id: categoryId }
    });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
