const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

/**
 * CONFIGURACIÓN DE LA BASE DE DATOS SQLITE
 * 
 * Versión simplificada para desarrollo que usa SQLite en lugar de PostgreSQL.
 * SQLite es más fácil de configurar y no requiere instalación de servidor.
 */

// Ruta de la base de datos SQLite
const dbPath = path.join(__dirname, '../../database.sqlite');

// Variable global para la conexión
let db;

/**
 * INICIALIZACIÓN DE LA BASE DE DATOS SQLITE
 * 
 * Crea la base de datos y todas las tablas necesarias.
 */
const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    try {
      // Crear conexión a la base de datos SQLite
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Error al conectar a SQLite:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Conectado a la base de datos SQLite');
      });

      // Crear todas las tablas
      createTables()
        .then(() => {
          console.log('✅ Tablas creadas correctamente');
          return insertDefaultData();
        })
        .then(() => {
          console.log('✅ Datos por defecto insertados');
          resolve();
        })
        .catch(reject);

    } catch (error) {
      console.error('❌ Error al inicializar la base de datos:', error);
      reject(error);
    }
  });
};

/**
 * CREACIÓN DE TABLAS
 */
const createTables = async () => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Tabla de usuarios
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student' CHECK(role IN ('admin', 'seller', 'student')),
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabla de productos
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        stock INTEGER DEFAULT 1,
        seller_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'sold')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Tabla de notificaciones
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error')),
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Tabla de favoritos
      `CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )`
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach((table, index) => {
      db.run(table, (err) => {
        if (err) {
          console.error(`Error al crear tabla ${index + 1}:`, err.message);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === total) {
          resolve();
        }
      });
    });
  });
};

/**
 * INSERCIÓN DE DATOS POR DEFECTO
 */
const insertDefaultData = async () => {
  return new Promise((resolve, reject) => {
    // Verificar si ya existen usuarios
    db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      if (result.count > 0) {
        console.log('✅ Datos por defecto ya existen');
        resolve();
        return;
      }

      const defaultUsers = [
        {
          student_id: '20210001',
          email: 'admin@universidad.edu',
          name: 'Administrador',
          password: bcrypt.hashSync('admin123', 10),
          role: 'admin'
        },
        {
          student_id: '20210002',
          email: 'vendedor@universidad.edu',
          name: 'Vendedor Ejemplo',
          password: bcrypt.hashSync('vendedor123', 10),
          role: 'seller'
        },
        {
          student_id: '20210003',
          email: 'comprador@universidad.edu',
          name: 'Comprador Ejemplo',
          password: bcrypt.hashSync('comprador123', 10),
          role: 'student'
        }
      ];

      let completed = 0;
      const total = defaultUsers.length;

      defaultUsers.forEach((user) => {
        db.run(
          'INSERT INTO users (student_id, email, name, password, role) VALUES (?, ?, ?, ?, ?)',
          [user.student_id, user.email, user.name, user.password, user.role],
          (err) => {
            if (err) {
              console.error('Error al insertar usuario:', err.message);
              reject(err);
              return;
            }
            
            completed++;
            if (completed === total) {
              console.log('✅ Usuarios por defecto creados');
              console.log('📝 Credenciales de prueba:');
              console.log('   Admin: 20210001 / admin123');
              console.log('   Vendedor: 20210002 / vendedor123');
              console.log('   Estudiante: 20210003 / comprador123');
              resolve();
            }
          }
        );
      });
    });
  });
};

/**
 * OBTENER INSTANCIA DE LA BASE DE DATOS
 */
const getDatabase = () => {
  if (!db) {
    throw new Error('Base de datos no inicializada');
  }
  return db;
};

/**
 * CERRAR CONEXIÓN
 */
const closeDatabase = async () => {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Error al cerrar la base de datos:', err.message);
        } else {
          console.log('✅ Base de datos cerrada correctamente');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};
