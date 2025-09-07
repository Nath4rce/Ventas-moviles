const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Configuración de la base de datos PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'antojitos_upb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // cerrar conexiones inactivas después de 30 segundos
  connectionTimeoutMillis: 2000, // timeout de conexión de 2 segundos
};

// Crear directorio de uploads si no existe
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let pool;

const initializeDatabase = async () => {
  try {
    pool = new Pool(dbConfig);
    
    // Probar la conexión
    const client = await pool.connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');
    client.release();
    
    await createTables();
    console.log('✅ Tablas creadas correctamente');
    await insertDefaultData();
    console.log('✅ Datos por defecto insertados');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
};

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    const tables = [
      // Tabla de usuarios
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(8) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student' CHECK(role IN ('admin', 'seller', 'student')),
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabla de productos
      `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_url TEXT,
        stock INTEGER DEFAULT 1,
        seller_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'sold')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Tabla de notificaciones
      `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error')),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Tabla de favoritos
      `CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )`
    ];

    for (const table of tables) {
      await client.query(table);
    }

    // Crear índices para mejorar el rendimiento
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)',
      'CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)',
      'CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id)'
    ];

    for (const index of indexes) {
      await client.query(index);
    }

  } catch (error) {
    console.error('Error al crear tablas:', error);
    throw error;
  } finally {
    client.release();
  }
};

const insertDefaultData = async () => {
  const client = await pool.connect();
  
  try {
    // Verificar si ya existen usuarios
    const result = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(result.rows[0].count);

    if (userCount > 0) {
      console.log('✅ Datos por defecto ya existen');
      return;
    }

    const bcrypt = require('bcryptjs');
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

    for (const user of defaultUsers) {
      await client.query(`
        INSERT INTO users (student_id, email, name, password, role)
        VALUES ($1, $2, $3, $4, $5)
      `, [user.student_id, user.email, user.name, user.password, user.role]);
    }

    console.log('✅ Usuarios por defecto creados');

  } catch (error) {
    console.error('Error al insertar datos por defecto:', error);
    throw error;
  } finally {
    client.release();
  }
};

const getDatabase = () => {
  if (!pool) {
    throw new Error('Base de datos no inicializada');
  }
  return pool;
};

const closeDatabase = async () => {
  if (pool) {
    try {
      await pool.end();
      console.log('✅ Base de datos cerrada correctamente');
    } catch (error) {
      console.error('❌ Error al cerrar la base de datos:', error);
    }
  }
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};
