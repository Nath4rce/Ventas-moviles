const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Verificar que el usuario aún existe en la base de datos
    const db = getDatabase();
    try {
      const result = await db.query('SELECT id, student_id, email, name, role FROM users WHERE id = $1', [decoded.userId]);
      
      if (result.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      req.user = result.rows[0];
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar usuario'
      });
    }
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const userRole = req.user.role;
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

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }

    const db = getDatabase();
    try {
      const result = await db.query('SELECT id, student_id, email, name, role FROM users WHERE id = $1', [decoded.userId]);
      req.user = result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      req.user = null;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};
