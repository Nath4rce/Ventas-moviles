const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUser, validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Helper para ejecutar stored procedures
async function executeProcedure(procedureName, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  
  // Agregar parámetros dinámicamente
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (typeof value === 'number') {
      request.input(key, sql.Int, value);
    } else if (typeof value === 'string') {
      request.input(key, sql.NVarChar, value);
    } else if (typeof value === 'boolean') {
      request.input(key, sql.Bit, value ? 1 : 0);
    }
  });
  
  return await request.execute(procedureName);
}

// GET /api/admin/stats - Obtener estadísticas generales
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    // Usar stored procedure para estadísticas generales
    const statsResult = await executeProcedure('sp_estadisticas_generales', {});
    const stats = statsResult.recordset[0];

    // Productos recientes
    const recentResult = await pool.request()
      .query(`
        SELECT TOP 5
          p.id,
          p.titulo,
          p.precio,
          p.created_at,
          u.nombre as vendedor_nombre,
          c.nombre as categoria_nombre
        FROM productos p
        JOIN usuarios u ON p.vendedor_id = u.id
        JOIN categorias c ON p.categoria_id = c.id
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
      `);

    // Top categorías
    const topCategoriesResult = await pool.request()
      .query(`
        SELECT 
          c.nombre,
          COUNT(p.id) as total_productos
        FROM categorias c
        LEFT JOIN productos p ON c.id = p.categoria_id AND p.is_active = 1
        GROUP BY c.id, c.nombre
        ORDER BY total_productos DESC
      `);

    res.json({
      success: true,
      data: {
        ...stats,
        recent_products: recentResult.recordset,
        top_categories: topCategoriesResult.recordset
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
      rol,
      status,
      search
    } = req.query;
    const offset = (page - 1) * limit;

    const pool = await getPool();
    const request = pool.request();

    let whereConditions = [];

    if (rol && rol !== 'all') {
      whereConditions.push('rol = @rol');
      request.input('rol', sql.NVarChar(20), rol);
    }

    if (status && status !== 'all') {
      const isActive = status === 'active' ? 1 : 0;
      whereConditions.push('is_active = @isActive');
      request.input('isActive', sql.Bit, isActive);
    }

    if (search) {
      whereConditions.push('(nombre LIKE @search OR id_institucional LIKE @search OR email LIKE @search)');
      request.input('search', sql.NVarChar(255), `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    request.input('offset', sql.Int, parseInt(offset));
    request.input('limit', sql.Int, parseInt(limit));

    const result = await request.query(`
      SELECT 
        id,
        id_institucional,
        email,
        nombre,
        rol,
        is_active,
        created_at,
        updated_at
      FROM usuarios
      ${whereClause}
      ORDER BY created_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    // Count query
    const countRequest = pool.request();
    if (rol && rol !== 'all') countRequest.input('rol', sql.NVarChar(20), rol);
    if (status && status !== 'all') countRequest.input('isActive', sql.Bit, status === 'active' ? 1 : 0);
    if (search) countRequest.input('search', sql.NVarChar(255), `%${search}%`);

    const countResult = await countRequest.query(`SELECT COUNT(*) as total FROM usuarios ${whereClause}`);
    const total = countResult.recordset[0].total;

    res.json({
      success: true,
      data: {
        users: result.recordset,
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
    const { id_institucional, email, password, nombre, rol } = req.body;

    const pool = await getPool();

    const checkId = await pool.request()
      .input('idInstitucional', sql.Char(9), id_institucional)
      .query('SELECT id FROM usuarios WHERE id_institucional = @idInstitucional');

    if (checkId.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ID institucional ya registrado'
      });
    }

    const checkEmail = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT id FROM usuarios WHERE email = @email');

    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email ya registrado'
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertResult = await pool.request()
      .input('idInstitucional', sql.Char(9), id_institucional)
      .input('email', sql.NVarChar(255), email)
      .input('passwordHash', sql.NVarChar(255), passwordHash)
      .input('nombre', sql.NVarChar(255), nombre)
      .input('rol', sql.NVarChar(20), rol)
      .query(`
        INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, is_active) 
        OUTPUT INSERTED.id
        VALUES (@idInstitucional, @email, @passwordHash, @nombre, @rol, 1)
      `);

    const newUserId = insertResult.recordset[0].id;

    const newUserResult = await pool.request()
      .input('userId', sql.Int, newUserId)
      .query('SELECT id, id_institucional, email, nombre, rol, is_active, created_at FROM usuarios WHERE id = @userId');

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: { user: newUserResult.recordset[0] }
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
    const pool = await getPool();

    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT id, is_active, nombre FROM usuarios WHERE id = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.recordset[0];

    if (user.is_active && req.user.id === parseInt(userId)) {
      const adminCountResult = await pool.request()
        .query("SELECT COUNT(*) as count FROM usuarios WHERE rol = 'admin' AND is_active = 1");

      if (adminCountResult.recordset[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No puedes desactivar el último administrador'
        });
      }
    }

    const newStatus = user.is_active ? 0 : 1;
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('newStatus', sql.Bit, newStatus)
      .query('UPDATE usuarios SET is_active = @newStatus WHERE id = @userId');

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

    const pool = await getPool();

    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT id, rol, nombre FROM usuarios WHERE id = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.recordset[0];

    if (user.rol === 'admin' && rol !== 'admin') {
      const adminCountResult = await pool.request()
        .query("SELECT COUNT(*) as count FROM usuarios WHERE rol = 'admin' AND is_active = 1");

      if (adminCountResult.recordset[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No puedes cambiar el rol del último administrador'
        });
      }
    }

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('rol', sql.NVarChar(20), rol)
      .query('UPDATE usuarios SET rol = @rol WHERE id = @userId');

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

    const pool = await getPool();
    const request = pool.request();

    let whereConditions = [];

    if (status !== 'all') {
      const isActive = status === 'active' ? 1 : 0;
      whereConditions.push('p.is_active = @isActive');
      request.input('isActive', sql.Bit, isActive);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    request.input('offset', sql.Int, parseInt(offset));
    request.input('limit', sql.Int, parseInt(limit));

    const result = await request.query(`
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
        u.id_institucional as vendedor_id_institucional
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    const countRequest = pool.request();
    if (status !== 'all') countRequest.input('isActive', sql.Bit, status === 'active' ? 1 : 0);

    const countResult = await countRequest.query(`SELECT COUNT(*) as total FROM productos p ${whereClause}`);
    const total = countResult.recordset[0].total;

    res.json({
      success: true,
      data: {
        products: result.recordset,
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
    const pool = await getPool();

    const productResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query('SELECT id, is_active, titulo FROM productos WHERE id = @productId');

    if (productResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const product = productResult.recordset[0];
    const newStatus = product.is_active ? 0 : 1;

    await pool.request()
      .input('productId', sql.Int, productId)
      .input('newStatus', sql.Bit, newStatus)
      .query('UPDATE productos SET is_active = @newStatus WHERE id = @productId');

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
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id, nombre, descripcion, icono, is_active, created_at FROM categorias ORDER BY nombre');

    res.json({
      success: true,
      data: { categories: result.recordset }
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

    const pool = await getPool();

    const checkCategory = await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .query('SELECT id FROM categorias WHERE nombre = @nombre');

    if (checkCategory.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Categoría ya existe'
      });
    }

    const insertResult = await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .input('descripcion', sql.NVarChar(500), descripcion)
      .input('icono', sql.NVarChar(50), icono)
      .query(`
        INSERT INTO categorias (nombre, descripcion, icono) 
        OUTPUT INSERTED.id
        VALUES (@nombre, @descripcion, @icono)
      `);

    const categoryId = insertResult.recordset[0].id;

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