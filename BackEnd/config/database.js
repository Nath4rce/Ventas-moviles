const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Debug: Verificar que las variables se carguen
console.log('🔍 Verificando configuración:');
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_PORT:', process.env.DB_PORT);

// Configuración de la conexión SQL Server
const config = {
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || 'ventasmoviles_upb',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};




// Validación del server
if (!config.server || typeof config.server !== 'string') {
    console.error('❌ Error: DB_SERVER no está configurado correctamente');
    console.error('Valor actual:', config.server);
    throw new Error('La configuración DB_SERVER es requerida y debe ser un string');
}

// Si usa autenticación de Windows (LocalDB), no incluir user/password
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

if (dbUser && dbUser.trim() !== '') {
    config.user = dbUser;
    config.password = dbPassword || '';
    console.log('🔐 Usando autenticación SQL Server');
} else {
    config.options.trustedConnection = true;
    console.log('🔐 Usando autenticación de Windows (LocalDB)');
}

// Pool de conexiones global
let pool = null;

/**
 * Obtener o crear pool de conexiones
 */
const getPool = async () => {
    if (!pool) {
        try {
            pool = await sql.connect(config);
            console.log('✅ Conectado a SQL Server:', config.database);
            
            // Manejar errores del pool
            pool.on('error', err => {
                console.error('❌ Error en SQL Server pool:', err);
                pool = null;
            });
            
            return pool;
        } catch (err) {
            console.error('❌ Error al conectar a SQL Server:', err.message);
            throw err;
        }
    }
    return pool;
};

/**
 * Ejecutar query con manejo de errores
 */
const query = async (queryString, params = {}) => {
    try {
        const pool = await getPool();
        const request = pool.request();
        
        // Agregar parámetros
        for (const [key, value] of Object.entries(params)) {
            request.input(key, value);
        }
        
        const result = await request.query(queryString);
        return result;
    } catch (err) {
        console.error('❌ Error en query:', err.message);
        throw err;
    }
};

/**
 * Ejecutar stored procedure
 */
const executeProcedure = async (procedureName, params = {}) => {
    try {
        const pool = await getPool();
        const request = pool.request();
        
        // Agregar parámetros
        for (const [key, value] of Object.entries(params)) {
            request.input(key, value);
        }
        
        const result = await request.execute(procedureName);
        return result;
    } catch (err) {
        console.error('❌ Error en stored procedure:', err.message);
        throw err;
    }
};

/**
 * Cerrar pool de conexiones
 */
const closePool = async () => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('✅ Pool de SQL Server cerrado');
        }
    } catch (err) {
        console.error('❌ Error al cerrar pool:', err.message);
    }
};

/**
 * Probar conexión
 */
const testConnection = async () => {
    try {
        const pool = await getPool();
        await pool.request().query('SELECT 1 AS test');
        console.log('✅ Prueba de conexión exitosa');
        return true;
    } catch (err) {
        console.error('❌ Prueba de conexión fallida:', err.message);
        return false;
    }
};

// Exportar funciones y tipos de SQL
module.exports = {
    getPool,
    query,
    executeProcedure,
    closePool,
    testConnection,
    sql // Exportar sql para tipos de datos
};

// Cerrar pool al terminar el proceso
process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closePool();
    process.exit(0);
});
