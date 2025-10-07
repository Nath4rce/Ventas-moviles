const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para autenticación
const validateLogin = [
  body('idInstitucional')
    .notEmpty()
    .withMessage('ID institucional es requerido')
    .matches(/^\d{9}$/)
    .withMessage('ID institucional debe tener exactamente 9 dígitos'),
  body('password')
    .notEmpty()
    .withMessage('Contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

const validateRegister = [
  body('idInstitucional')
    .notEmpty()
    .withMessage('ID institucional es requerido')
    .matches(/^\d{9}$/)
    .withMessage('ID institucional debe tener exactamente 9 dígitos'),
  body('email')
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('nombre')
    .notEmpty()
    .withMessage('Nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  handleValidationErrors
];

// Validaciones para productos
const validateProduct = [
  body('titulo')
    .notEmpty()
    .withMessage('Título es requerido')
    .isLength({ min: 5, max: 200 })
    .withMessage('Título debe tener entre 5 y 200 caracteres'),
  body('descripcion')
    .notEmpty()
    .withMessage('Descripción es requerida')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Descripción debe tener entre 20 y 1000 caracteres'),
  body('precio')
    .isFloat({ min: 0 })
    .withMessage('Precio debe ser un número positivo'),
  body('categoria_id')
    .isInt({ min: 1 })
    .withMessage('Categoría es requerida'),
  handleValidationErrors
];

// Validaciones para reseñas
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating debe ser entre 1 y 5'),
  body('comentario')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comentario no puede exceder 500 caracteres'),
  handleValidationErrors
];

// Validaciones para notificaciones
const validateNotification = [
  body('titulo')
    .notEmpty()
    .withMessage('Título es requerido')
    .isLength({ min: 5, max: 200 })
    .withMessage('Título debe tener entre 5 y 200 caracteres'),
  body('mensaje')
    .notEmpty()
    .withMessage('Mensaje es requerido')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mensaje debe tener entre 10 y 1000 caracteres'),
  body('tipo')
    .isIn(['info', 'success', 'warning', 'danger'])
    .withMessage('Tipo de notificación inválido'),
  body('destinatario_tipo')
    .isIn(['all', 'sellers', 'buyers', 'id_institucional_especifico'])
    .withMessage('Tipo de destinatario inválido'),
  body('id_institucional_especifico')
    .optional()
    .matches(/^\d{9}$/)
    .withMessage('ID institucional debe tener 9 dígitos'),
  handleValidationErrors
];

// Validaciones para usuarios (admin)
const validateUser = [
  body('id_institucional')
    .notEmpty()
    .withMessage('ID institucional es requerido')
    .matches(/^\d{9}$/)
    .withMessage('ID institucional debe tener exactamente 9 dígitos'),
  body('email')
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('nombre')
    .notEmpty()
    .withMessage('Nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('rol')
    .isIn(['admin', 'seller', 'buyer'])
    .withMessage('Rol inválido'),
  handleValidationErrors
];

// Validaciones para parámetros
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  handleValidationErrors
];

// Validaciones para consultas
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser entre 1 y 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateProduct,
  validateReview,
  validateNotification,
  validateUser,
  validateId,
  validatePagination
};
