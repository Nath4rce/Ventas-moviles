const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/database');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/login - Iniciar sesión
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { idInstitucional, password } = req.body;

    // Buscar usuario por id_institucional
    const pool = await getPool();
    const result = await pool.request()
      .input('idInstitucional', sql.Char(9), idInstitucional)
      .query('SELECT id, id_institucional, email, password_hash, nombre, rol, is_active FROM usuarios WHERE id_institucional = @idInstitucional'
      );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const users = result.recordset;

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
          idInstitucional: user.id_institucional,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
          isActive: user.is_active
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
    const { idInstitucional, email, password, nombre } = req.body;

    // Verificar si el student_id ya existe
    const pool = await getPool();
    const checkId = await pool.request()
      .input('idInstitucional', sql.Char(9), idInstitucional)
      .query('SELECT id FROM usuarios WHERE id_institucional = @idInstitucional');


    if (existingStudentId.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ID estudiantil ya registrado'
      });
    }

    // Verificar si el email ya existe
    const checkEmail = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT id FROM usuarios WHERE email = @email');

    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email ya registrado'
      });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const insertResult = await pool.request()
      .input('idInstitucional', sql.Char(9), idInstitucional)
      .input('email', sql.NVarChar(255), email)
      .input('passwordHash', sql.NVarChar(255), passwordHash)
      .input('nombre', sql.NVarChar(255), nombre)
      .query(`INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, is_active) 
          OUTPUT INSERTED.id
          VALUES (@idInstitucional, @email, @passwordHash, @nombre, 'buyer', 1)`);

    const newUserId = insertResult.recordset[0].id;

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
          idInstitucional,
          email,
          nombre,
          rol: 'buyer',
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
    const { nombre, email } = req.body;
    const userId = req.user.id;

    // Verificar si el email ya existe en otro usuario
    if (email) {
      const pool = await getPool();
      const checkEmail = await pool.request()
        .input('email', sql.NVarChar(255), email)
        .input('userId', sql.Int, userId)
        .query('SELECT id FROM usuarios WHERE email = @email AND id != @userId');

      if (checkEmail.recordset.length > 0) {
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

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    updateValues.push(userId);

    const request = pool.request().input('userId', sql.Int, userId);
    updateValues.forEach((val, idx) => {
      const fieldName = updateFields[idx].split(' = ')[0];
      request.input(fieldName, sql.NVarChar(255), val);
    });
    await request.query(`UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = @userId`);


    // Obtener usuario actualizado
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT id, id_institucional, email, nombre, rol, is_active FROM usuarios WHERE id = @userId');

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
