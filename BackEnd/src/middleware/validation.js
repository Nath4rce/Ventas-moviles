const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validaciones para autenticación
const validateLogin = [
  body('studentId')
    .notEmpty()
    .withMessage('El ID estudiantil es requerido')
    .isLength({ min: 8, max: 8 })
    .withMessage('El ID estudiantil debe tener exactamente 8 dígitos')
    .isNumeric()
    .withMessage('El ID estudiantil debe contener solo números'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  handleValidationErrors
];

const validateRegister = [
  body('studentId')
    .notEmpty()
    .withMessage('El ID estudiantil es requerido')
    .isLength({ min: 8, max: 8 })
    .withMessage('El ID estudiantil debe tener exactamente 8 dígitos')
    .isNumeric()
    .withMessage('El ID estudiantil debe contener solo números'),
  
  body('email')
    .notEmpty()
    .withMessage('El correo es requerido')
    .isEmail()
    .withMessage('Debe ser un correo válido')
    .custom((value) => {
      if (!value.endsWith('@universidad.edu')) {
        throw new Error('Debe ser un correo de la universidad');
      }
      return true;
    }),
  
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmación de contraseña es requerida')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validaciones para productos
const validateProduct = [
  body('title')
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('price')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser mayor a 0'),
  
  body('category')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isIn(['comida', 'bebidas', 'snacks', 'dulces', 'otros'])
    .withMessage('Categoría inválida'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
  
  handleValidationErrors
];

const validateProductId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido'),
  
  handleValidationErrors
];

// Validaciones para usuarios
const validateProfileUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un correo válido')
    .custom((value) => {
      if (!value.endsWith('@universidad.edu')) {
        throw new Error('Debe ser un correo de la universidad');
      }
      return true;
    }),
  
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una letra mayúscula, una minúscula y un número'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmación de contraseña es requerida')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validaciones para búsquedas y filtros
const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),
  
  query('category')
    .optional()
    .isIn(['comida', 'bebidas', 'snacks', 'dulces', 'otros'])
    .withMessage('Categoría inválida'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser mayor o igual a 0'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser mayor o igual a 0'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser un número entre 1 y 50'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateProduct,
  validateProductId,
  validateProfileUpdate,
  validatePasswordChange,
  validateSearch
};
