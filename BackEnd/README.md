# Antojitos UPB - Backend API

Backend API para el marketplace interno de estudiantes de la Universidad Pontificia Bolivariana.

## Características

- **Autenticación JWT**: Sistema seguro de login y registro
- **Gestión de Productos**: CRUD completo para productos
- **Gestión de Usuarios**: Perfiles, notificaciones y favoritos
- **Subida de Archivos**: Imágenes para productos y perfiles
- **Base de Datos SQLite**: Base de datos ligera para desarrollo
- **Validación de Datos**: Middleware de validación robusto
- **Rate Limiting**: Protección contra abuso de API
- **CORS**: Configurado para desarrollo y producción

## Requisitos

- Node.js 16+
- npm o yarn

## Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

4. **Ejecutar en producción:**
   ```bash
   npm start
   ```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener perfil actual
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token

### Productos
- `GET /api/products` - Listar productos (con filtros)
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (vendedores)
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/products/user/:userId` - Productos de un usuario

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/password` - Cambiar contraseña
- `GET /api/users/notifications` - Obtener notificaciones
- `PUT /api/users/notifications/:id/read` - Marcar notificación como leída
- `PUT /api/users/notifications/read-all` - Marcar todas como leídas
- `GET /api/users/favorites` - Obtener favoritos
- `POST /api/users/favorites/:productId` - Agregar a favoritos
- `DELETE /api/users/favorites/:productId` - Eliminar de favoritos
- `GET /api/users/stats` - Estadísticas (vendedores)

### Utilidades
- `GET /api/health` - Estado del servidor

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Incluye el token en el header:

```
Authorization: Bearer <tu_token>
```

## Base de Datos

La aplicación utiliza SQLite como base de datos para facilitar el desarrollo. Se crean automáticamente las siguientes tablas:

- **users**: Información de usuarios
- **products**: Catálogo de productos
- **notifications**: Sistema de notificaciones
- **favorites**: Productos favoritos de usuarios

### Scripts de Base de Datos

- `npm run setup-db`: Crear la base de datos y verificar conexión
- `npm run reset-db`: Eliminar todas las tablas (solo desarrollo)

## Roles de Usuario

- **admin**: Acceso completo al sistema
- **seller**: Puede crear y gestionar productos
- **student**: Usuario estándar, puede comprar y marcar favoritos

## Estructura del Proyecto

```
BackEnd/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de PostgreSQL
│   │   └── database-sqlite.js   # Configuración de SQLite
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticación
│   │   └── validation.js        # Validaciones de datos
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   ├── products.js          # Rutas de productos
│   │   └── users.js             # Rutas de usuarios
│   └── server.js                # Servidor principal
├── scripts/
│   ├── setup-database.js        # Script de configuración de DB
│   └── reset-database.js        # Script de reset de DB
├── uploads/                     # Archivos subidos
├── .env                        # Variables de entorno
├── package.json                # Dependencias y scripts
└── README.md                   # Este archivo
```

## Scripts Disponibles

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo con nodemon
- `npm test` - Ejecutar tests
- `npm run setup-db` - Configurar base de datos
- `npm run reset-db` - Resetear base de datos (solo desarrollo)

## Notas de Seguridad

- Las contraseñas se hashean con bcrypt
- Rate limiting configurado para prevenir abuso
- Validación de archivos para subidas
- Headers de seguridad con Helmet
- CORS configurado apropiadamente

## Usuarios de Prueba

El sistema incluye usuarios de prueba por defecto:

- **Admin**: ID: 20210001, Contraseña: admin123
- **Vendedor**: ID: 20210002, Contraseña: vendedor123  
- **Estudiante**: ID: 20210003, Contraseña: comprador123

## Desarrollo

### Cambiar de SQLite a PostgreSQL

Para usar PostgreSQL en lugar de SQLite:

1. Instalar PostgreSQL
2. Cambiar la importación en `server.js`:
   ```javascript
   const { initializeDatabase } = require('./config/database');
   ```
3. Configurar las variables de entorno de PostgreSQL

### Migración de Base de Datos

La aplicación crea automáticamente las tablas al iniciar. Para desarrollo, puedes usar:

```bash
npm run reset-db  # Eliminar todas las tablas
npm run dev       # Recrear tablas con datos de prueba
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request