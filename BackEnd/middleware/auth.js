const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la BD
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, decoded.userId)
      .query('SELECT id, id_institucional, email, nombre, rol, is_active FROM usuarios WHERE id = @userId');

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = result.recordset[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo o deshabilitado'
      });
    }

    // Agregar usuario completo a req
    req.user = {
      id: user.id,
      id_institucional: user.id_institucional,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol
    };

    next();
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const userRole = req.user.rol;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes para esta acción'
      });
    }

    next();
  };
};

// Middleware para verificar si es admin
const requireAdmin = requireRole('admin');

// Middleware para verificar si es vendedor o admin
const requireSeller = requireRole(['seller', 'admin']);

// Middleware para verificar si es comprador o superior
const requireBuyer = requireRole(['buyer', 'seller', 'admin']);

// Función para generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN}
  );
};

// Función para verificar si el usuario puede realizar una acción en un producto
const canModifyProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.rol;

    // Los admins pueden modificar cualquier producto
    if (userRole === 'admin') {
      return next();
    }

    // Verificar si el usuario es el vendedor del producto
    const pool = await getPool();
    const result = await pool.request()
      .input('productId', sql.Int, productId)
      .query('SELECT vendedor_id FROM productos WHERE id = @productId');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (result.recordset[0].vendedor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar este producto'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSeller,
  requireBuyer,
  generateToken,
  canModifyProduct
};
