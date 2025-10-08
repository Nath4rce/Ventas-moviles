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

    const pool = await getPool();
    const result = await pool.request()
      .input('idInstitucional', sql.Char(9), idInstitucional)
      .query('SELECT id, id_institucional, email, password_hash, nombre, rol, is_active FROM usuarios WHERE id_institucional = @idInstitucional');

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const user = result.recordset[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const token = generateToken(user.id);

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

    const pool = await getPool();
    const checkId = await pool.request()
      .input('idInstitucional', sql.Char(9), idInstitucional)
      .query('SELECT id FROM usuarios WHERE id_institucional = @idInstitucional');

    if (checkId.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ID estudiantil ya registrado'
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
      .input('idInstitucional', sql.Char(9), idInstitucional)
      .input('email', sql.NVarChar(255), email)
      .input('passwordHash', sql.NVarChar(255), passwordHash)
      .input('nombre', sql.NVarChar(255), nombre)
      .query(`INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, is_active) 
          OUTPUT INSERTED.id
          VALUES (@idInstitucional, @email, @passwordHash, @nombre, 'buyer', 1)`);

    const newUserId = insertResult.recordset[0].id;
    const token = generateToken(newUserId);

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

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authenticateToken, async (req, res) => {
  try {
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

    const pool = await getPool();

    if (email) {
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

    const updateFields = [];
    if (nombre) updateFields.push('nombre = @nombre');
    if (email) updateFields.push('email = @email');

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    const request = pool.request().input('userId', sql.Int, userId);
    if (nombre) request.input('nombre', sql.NVarChar(255), nombre);
    if (email) request.input('email', sql.NVarChar(255), email);

    await request.query(`UPDATE usuarios SET ${updateFields.join(', ')}, updated_at = GETDATE() WHERE id = @userId`);

    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT id, id_institucional, email, nombre, rol, is_active FROM usuarios WHERE id = @userId');

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: userResult.recordset[0]
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