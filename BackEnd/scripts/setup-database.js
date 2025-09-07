#!/usr/bin/env node

/**
 * Script para configurar la base de datos PostgreSQL
 * Uso: node scripts/setup-database.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

const databaseName = process.env.DB_NAME || 'antojitos_upb';

async function createDatabase() {
  const adminPool = new Pool({
    ...dbConfig,
    database: 'postgres' // Conectar a la base de datos por defecto
  });

  try {
    console.log('🔍 Verificando si la base de datos existe...');
    
    // Verificar si la base de datos existe
    const result = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (result.rows.length === 0) {
      console.log(`📦 Creando base de datos: ${databaseName}`);
      await adminPool.query(`CREATE DATABASE "${databaseName}"`);
      console.log('✅ Base de datos creada exitosamente');
    } else {
      console.log('✅ La base de datos ya existe');
    }

  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error.message);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

async function testConnection() {
  const pool = new Pool({
    ...dbConfig,
    database: databaseName
  });

  try {
    console.log('🔗 Probando conexión a la base de datos...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión exitosa:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log('🚀 Configurando base de datos PostgreSQL para Antojitos UPB\n');
  
  try {
    await createDatabase();
    await testConnection();
    
    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ejecuta: npm install');
    console.log('2. Ejecuta: npm run dev');
    console.log('\n💡 La aplicación creará automáticamente las tablas al iniciar');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { createDatabase, testConnection };
