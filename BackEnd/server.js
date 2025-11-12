const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

//console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN)
// Configuración de CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});

// Rate limiting más permisivo para uploads
const uploadLimiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: 'Demasiadas subidas de imágenes. Espera unos minutos.'
});

// ✅ Aplicar rate limiters de forma selectiva
app.use('/api/', (req, res, next) => {
    // Si la ruta es para uploads, usar el limiter específico
    if (req.path.startsWith('/uploads')) {
        return uploadLimiter(req, res, next);
    }
    // Para todas las demás rutas, usar el limiter general
    limiter(req, res, next);
});

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta raíz
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API de Ventas Moviles UPB - Marketplace Universitario',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      reviews: '/api/reviews',
      notifications: '/api/notifications',
      admin: '/api/admin'
    }
  });
});

// Middleware para manejar rutas no encontradas 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: error.errors
    });
  }

  // Error de base de datos
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'El registro ya existe'
    });
  }

  // Error de conexión a base de datos
  if (error.code === 'ECONNREFUSED') {
    return res.status(500).json({
      success: false,
      message: 'Error de conexión a la base de datos'
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, async () => {
      console.log(`\n🚀 Servidor iniciado en puerto ${PORT}`);
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);

      // Probar conexión a BD
      await testConnection();
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;
