const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/login - Iniciar sesión
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Buscar usuario por student_id
    const users = await query(
      'SELECT id, student_id, email, password_hash, nombre, rol, is_active, nrc FROM usuarios WHERE student_id = ?',
      [studentId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const user = users[0];

    // Verificar si el usuario está activo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Generar token JWT
    const token = generateToken(user.id);

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: {
          id: user.id,
          studentId: user.student_id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
          nrc: user.nrc,
          isActive: user.is_active
        }
      }
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

// POST /api/auth/register - Registro de usuario
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { studentId, email, password, nombre, nrc } = req.body;

    // Verificar si el student_id ya existe
    const existingStudentId = await query(
      'SELECT id FROM usuarios WHERE student_id = ?',
      [studentId]
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
       VALUES (?, ?, ?, ?, 'buyer', ?, TRUE)`,
      [studentId, email, passwordHash, nombre, nrc]
    );

    const newUserId = result.insertId;

    // Generar token JWT
    const token = generateToken(newUserId);

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: newUserId,
          studentId,
          email,
          nombre,
          rol: 'buyer',
          nrc,
          isActive: true
        }
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

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/logout - Cerrar sesión (opcional, ya que JWT es stateless)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // En un sistema más complejo, aquí podrías invalidar el token
    // Por ahora, solo confirmamos el logout
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nombre, email, nrc } = req.body;
    const userId = req.user.id;

    // Verificar si el email ya existe en otro usuario
    if (email) {
      const existingEmail = await query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email ya registrado por otro usuario'
        });
      }
    }

    // Actualizar perfil
    const updateFields = [];
    const updateValues = [];

    if (nombre) {
      updateFields.push('nombre = ?');
      updateValues.push(nombre);
    }

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (nrc) {
      updateFields.push('nrc = ?');
      updateValues.push(nrc);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    updateValues.push(userId);

    await query(
      `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Obtener usuario actualizado
    const updatedUser = await query(
      'SELECT id, student_id, email, nombre, rol, nrc, is_active FROM usuarios WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: updatedUser[0]
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
