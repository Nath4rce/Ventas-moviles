#!/usr/bin/env node

/**
 * Script para resetear la base de datos PostgreSQL
 * Uso: node scripts/reset-database.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'antojitos_upb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

async function resetDatabase() {
  const pool = new Pool(dbConfig);

  try {
    console.log('🗑️  Eliminando tablas existentes...');
    
    // Eliminar tablas en orden correcto (respetando foreign keys)
    const dropTables = [
      'DROP TABLE IF EXISTS favorites CASCADE',
      'DROP TABLE IF EXISTS notifications CASCADE',
      'DROP TABLE IF EXISTS products CASCADE',
      'DROP TABLE IF EXISTS users CASCADE'
    ];

    for (const query of dropTables) {
      await pool.query(query);
    }

    console.log('✅ Tablas eliminadas exitosamente');
    console.log('💡 Ejecuta "npm run dev" para recrear las tablas con datos por defecto');

  } catch (error) {
    console.error('❌ Error al resetear la base de datos:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos');
  console.log('📋 Base de datos:', process.env.DB_NAME || 'antojitos_upb');
  
  // En un entorno de producción, podrías querer confirmación del usuario
  if (process.env.NODE_ENV === 'production') {
    console.log('❌ No se puede resetear la base de datos en producción');
    process.exit(1);
  }

  try {
    await resetDatabase();
    console.log('\n🎉 Base de datos reseteada exitosamente');
  } catch (error) {
    console.error('❌ Error durante el reset:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { resetDatabase };
