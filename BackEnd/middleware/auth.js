const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de acceso requerido' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Verificar que el usuario existe y está activo
    const user = await query(
      'SELECT id, student_id, email, nombre, rol, is_active FROM usuarios WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (user.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado o inactivo' 
      });
    }

    req.user = user[0];
    next();
  } catch (error) {
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
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
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
    const product = await query(
      'SELECT vendedor_id FROM productos WHERE id = ?',
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }

    if (product[0].vendedor_id !== userId) {
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
