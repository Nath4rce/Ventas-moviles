const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database-sqlite');
const { validateLogin, validateRegister } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { studentId, password } = req.body;
    const db = getDatabase();

    // Buscar usuario por ID estudiantil
    const result = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE student_id = ?', [studentId], (err, row) => {
        if (err) reject(err);
        else resolve({ rows: row ? [row] : [] });
      });
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        studentId: user.student_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respuesta exitosa (sin incluir la contraseña)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { studentId, email, name, password } = req.body;
    const db = getDatabase();

    // Verificar si el usuario ya existe
    const existingUserResult = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE student_id = ? OR email = ?', [studentId, email], (err, row) => {
        if (err) reject(err);
        else resolve({ rows: row ? [row] : [] });
      });
    });

    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El ID estudiantil o correo ya está registrado'
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (student_id, email, name, password, role) VALUES (?, ?, ?, ?, ?)',
        [studentId, email, name, hashedPassword, 'student'],
        function(err) {
          if (err) reject(err);
          else {
            // Obtener el usuario creado
            db.get('SELECT id, student_id, email, name, role, created_at FROM users WHERE id = ?', [this.lastID], (err, row) => {
              if (err) reject(err);
              else resolve({ rows: [row] });
            });
          }
        }
      );
    });

    const newUser = result.rows[0];

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: newUser.id,
        studentId: newUser.student_id,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // En un sistema JWT stateless, el logout se maneja en el frontend
  // eliminando el token del almacenamiento local
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

// POST /api/auth/refresh
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    // Generar nuevo token
    const token = jwt.sign(
      { 
        userId: req.user.id,
        studentId: req.user.student_id,
        role: req.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token
      }
    });
  } catch (error) {
    console.error('Error al renovar token:', error);
    res.status(500).json({
      success: false,
      message: 'Error al renovar el token'
    });
  }
});

module.exports = router;
