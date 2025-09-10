const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

/**
 * CONFIGURACIÓN DE LA BASE DE DATOS POSTGRESQL
 * 
 * Este archivo maneja toda la configuración y operaciones de la base de datos
 * para la aplicación Antojitos UPB. Incluye:
 * - Configuración de conexión a PostgreSQL
 * - Creación automática de tablas
 * - Inserción de datos por defecto
 * - Gestión del pool de conexiones
 */

// Configuración de la base de datos PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',           // Host de la base de datos
  port: process.env.DB_PORT || 5432,                  // Puerto de PostgreSQL (puerto por defecto)
  database: process.env.DB_NAME || 'antojitos_upb',   // Nombre de la base de datos
  user: process.env.DB_USER || 'postgres',            // Usuario de la base de datos
  password: process.env.DB_PASSWORD || 'password',    // Contraseña del usuario
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // Configuración SSL
  max: 20,                                            // Máximo de conexiones simultáneas en el pool
  idleTimeoutMillis: 30000,                          // Cerrar conexiones inactivas después de 30 segundos
  connectionTimeoutMillis: 2000,                     // Timeout de conexión de 2 segundos
};

// Crear directorio de uploads si no existe
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Variable global para el pool de conexiones
let pool;

/**
 * INICIALIZACIÓN DE LA BASE DE DATOS
 * 
 * Función principal que se ejecuta al iniciar el servidor.
 * Realiza las siguientes operaciones:
 * 1. Crea el pool de conexiones a PostgreSQL
 * 2. Prueba la conexión
 * 3. Crea todas las tablas necesarias
 * 4. Inserta datos por defecto (usuarios de prueba)
 */
const initializeDatabase = async () => {
  try {
    // Crear pool de conexiones con la configuración definida
    pool = new Pool(dbConfig);
    
    // Probar la conexión para asegurar que la BD está disponible
    const client = await pool.connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');
    client.release(); // Liberar la conexión de prueba
    
    // Crear todas las tablas de la aplicación
    await createTables();
    console.log('✅ Tablas creadas correctamente');
    
    // Insertar datos iniciales (usuarios de prueba)
    await insertDefaultData();
    console.log('✅ Datos por defecto insertados');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error; // Re-lanzar el error para que el servidor no inicie
  }
};

/**
 * CREACIÓN DE TABLAS
 * 
 * Define y crea todas las tablas necesarias para la aplicación.
 * Cada tabla tiene su propósito específico en el marketplace.
 */
const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Definición de todas las tablas de la aplicación
    const tables = [
      /**
       * TABLA USERS - Gestión de usuarios del sistema
       * Almacena información de estudiantes, vendedores y administradores
       */
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,                                    -- ID único auto-incremental
        student_id VARCHAR(8) UNIQUE NOT NULL,                    -- ID estudiantil único (ej: 20210001)
        email VARCHAR(255) UNIQUE NOT NULL,                       -- Correo electrónico único
        name VARCHAR(255) NOT NULL,                               -- Nombre completo del usuario
        password VARCHAR(255) NOT NULL,                           -- Contraseña hasheada con bcrypt
        role VARCHAR(20) DEFAULT 'student' CHECK(role IN ('admin', 'seller', 'student')), -- Rol del usuario
        profile_image TEXT,                                       -- URL de la imagen de perfil
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- Fecha de creación
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP            -- Fecha de última actualización
      )`,
      
      /**
       * TABLA PRODUCTS - Catálogo de productos del marketplace
       * Almacena todos los productos que los vendedores publican
       */
      `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,                                    -- ID único del producto
        title VARCHAR(255) NOT NULL,                              -- Título del producto
        description TEXT,                                         -- Descripción detallada
        price DECIMAL(10,2) NOT NULL,                             -- Precio (máximo 99,999,999.99)
        category VARCHAR(50) NOT NULL,                            -- Categoría del producto
        image_url TEXT,                                           -- URL de la imagen del producto
        stock INTEGER DEFAULT 1,                                  -- Cantidad disponible
        seller_id INTEGER NOT NULL,                               -- ID del vendedor (FK a users)
        status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'sold')), -- Estado del producto
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- Fecha de publicación
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- Fecha de última actualización
        FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE -- Relación con usuarios
      )`,
      
      /**
       * TABLA NOTIFICATIONS - Sistema de notificaciones
       * Almacena notificaciones para los usuarios (mensajes, alertas, etc.)
       */
      `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,                                    -- ID único de la notificación
        user_id INTEGER NOT NULL,                                 -- ID del usuario destinatario
        title VARCHAR(255) NOT NULL,                              -- Título de la notificación
        message TEXT NOT NULL,                                    -- Contenido del mensaje
        type VARCHAR(20) DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error')), -- Tipo de notificación
        is_read BOOLEAN DEFAULT FALSE,                            -- Estado de lectura
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- Fecha de creación
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE -- Relación con usuarios
      )`,
      
      /**
       * TABLA FAVORITES - Productos favoritos de los usuarios
       * Relación many-to-many entre usuarios y productos
       */
      `CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,                                    -- ID único del favorito
        user_id INTEGER NOT NULL,                                 -- ID del usuario
        product_id INTEGER NOT NULL,                              -- ID del producto
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- Fecha de agregado a favoritos
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,     -- Relación con usuarios
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE, -- Relación con productos
        UNIQUE(user_id, product_id)                               -- Evita duplicados (un usuario no puede tener el mismo producto dos veces en favoritos)
      )`
    ];

    // Ejecutar todas las consultas de creación de tablas
    for (const table of tables) {
      await client.query(table);
    }

    /**
     * CREACIÓN DE ÍNDICES PARA OPTIMIZACIÓN
     * 
     * Los índices mejoran significativamente el rendimiento de las consultas
     * al crear estructuras de datos que permiten búsquedas más rápidas.
     */
    const indexes = [
      // Índices para la tabla users
      'CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id)',  // Búsquedas por ID estudiantil (login)
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',            // Búsquedas por email (login, verificación)
      
      // Índices para la tabla products
      'CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id)',  // Productos por vendedor
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',    // Filtros por categoría
      'CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)',        // Filtros por estado (active/inactive/sold)
      'CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)', // Ordenamiento por fecha
      
      // Índices para la tabla notifications
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)', // Notificaciones por usuario
      'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)', // Filtros por estado de lectura
      
      // Índices para la tabla favorites
      'CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)',     // Favoritos por usuario
      'CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id)' // Productos en favoritos
    ];

    // Ejecutar todas las consultas de creación de índices
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

/**
 * INSERCIÓN DE DATOS POR DEFECTO
 * 
 * Crea usuarios de prueba para facilitar el desarrollo y testing.
 * Solo se ejecuta si la base de datos está vacía.
 */
const insertDefaultData = async () => {
  const client = await pool.connect();
  
  try {
    // Verificar si ya existen usuarios para evitar duplicados
    const result = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(result.rows[0].count);

    if (userCount > 0) {
      console.log('✅ Datos por defecto ya existen');
      return;
    }

    // Importar bcrypt para hashear contraseñas
    const bcrypt = require('bcryptjs');
    
    /**
     * USUARIOS DE PRUEBA
     * 
     * Se crean tres tipos de usuarios para probar diferentes funcionalidades:
     * - Admin: Acceso completo al sistema
     * - Vendedor: Puede publicar y gestionar productos
     * - Estudiante: Puede comprar y agregar favoritos
     */
    const defaultUsers = [
      {
        student_id: '20210001',                                    // ID estudiantil del admin
        email: 'admin@universidad.edu',                           // Email del admin
        name: 'Administrador',                                     // Nombre del admin
        password: bcrypt.hashSync('admin123', 10),                // Contraseña hasheada
        role: 'admin'                                              // Rol de administrador
      },
      {
        student_id: '20210002',                                    // ID estudiantil del vendedor
        email: 'vendedor@universidad.edu',                        // Email del vendedor
        name: 'Vendedor Ejemplo',                                  // Nombre del vendedor
        password: bcrypt.hashSync('vendedor123', 10),             // Contraseña hasheada
        role: 'seller'                                             // Rol de vendedor
      },
      {
        student_id: '20210003',                                    // ID estudiantil del estudiante
        email: 'comprador@universidad.edu',                       // Email del estudiante
        name: 'Comprador Ejemplo',                                 // Nombre del estudiante
        password: bcrypt.hashSync('comprador123', 10),            // Contraseña hasheada
        role: 'student'                                            // Rol de estudiante
      }
    ];

    // Insertar cada usuario en la base de datos
    for (const user of defaultUsers) {
      await client.query(`
        INSERT INTO users (student_id, email, name, password, role)
        VALUES ($1, $2, $3, $4, $5)
      `, [user.student_id, user.email, user.name, user.password, user.role]);
    }

    console.log('✅ Usuarios por defecto creados');
    console.log('📝 Credenciales de prueba:');
    console.log('   Admin: 20210001 / admin123');
    console.log('   Vendedor: 20210002 / vendedor123');
    console.log('   Estudiante: 20210003 / comprador123');

  } catch (error) {
    console.error('Error al insertar datos por defecto:', error);
    throw error;
  } finally {
    client.release(); // Siempre liberar la conexión
  }
};

/**
 * OBTENER INSTANCIA DEL POOL DE CONEXIONES
 * 
 * Función utilitaria que devuelve el pool de conexiones.
 * Se usa en las rutas para realizar consultas a la base de datos.
 */
const getDatabase = () => {
  if (!pool) {
    throw new Error('Base de datos no inicializada');
  }
  return pool;
};

/**
 * CERRAR CONEXIONES DE LA BASE DE DATOS
 * 
 * Función para cerrar todas las conexiones del pool.
 * Útil para shutdown graceful del servidor.
 */
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

// Exportar funciones para uso en otros módulos
module.exports = {
  initializeDatabase,  // Función principal para inicializar la BD
  getDatabase,        // Función para obtener el pool de conexiones
  closeDatabase       // Función para cerrar las conexiones
};
