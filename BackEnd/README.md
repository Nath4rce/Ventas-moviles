# Backend - Antojitos UPB

Backend para el marketplace universitario Antojitos UPB desarrollado con Node.js, Express y MySQL.

## Características

- **Autenticación JWT**: Sistema de login/registro seguro
- **Gestión de Productos**: CRUD completo para productos
- **Sistema de Reseñas**: Calificaciones y comentarios
- **Notificaciones**: Sistema de notificaciones dirigidas
- **Panel de Administración**: Gestión completa de usuarios y contenido
- **Seguridad**: Rate limiting, CORS, Helmet, validaciones
- **Base de Datos**: MySQL con triggers y procedimientos almacenados

## Requisitos

- Node.js 16+ 
- MySQL 8.0+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd BackEnd
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` con tu configuración:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=antojitos_upb
   DB_PORT=3306
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=tu_super_secret_jwt_key
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Configurar la base de datos**
   - Crear la base de datos MySQL
   - Ejecutar el script `DataBase/database_schema.sql`

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## API Endpoints

### Autenticación (`/api/auth`)
- `POST /login` - Iniciar sesión
- `POST /register` - Registro de usuario
- `GET /me` - Obtener usuario actual
- `POST /logout` - Cerrar sesión
- `PUT /profile` - Actualizar perfil

### Productos (`/api/products`)
- `GET /` - Listar productos (con filtros)
- `GET /categories` - Obtener categorías
- `GET /:id` - Obtener producto por ID
- `POST /` - Crear producto (autenticado)
- `PUT /:id` - Actualizar producto (propietario/admin)
- `DELETE /:id` - Desactivar producto (propietario/admin)
- `GET /user/:userId` - Productos de un usuario

### Reseñas (`/api/reviews`)
- `GET /product/:productId` - Reseñas de un producto
- `POST /` - Crear reseña (autenticado)
- `PUT /:id` - Actualizar reseña (propietario)
- `DELETE /:id` - Eliminar reseña (propietario)
- `GET /user/:userId` - Reseñas de un usuario
- `GET /stats/:productId` - Estadísticas de reseñas

### Notificaciones (`/api/notifications`)
- `GET /` - Notificaciones del usuario
- `PUT /:id/read` - Marcar como leída
- `PUT /read-all` - Marcar todas como leídas
- `POST /` - Crear notificación (admin)
- `GET /admin` - Todas las notificaciones (admin)
- `DELETE /:id` - Eliminar notificación (admin)
- `GET /site-status` - Estado del sitio
- `PUT /site-status` - Cambiar estado (admin)

### Administración (`/api/admin`)
- `GET /stats` - Estadísticas generales
- `GET /users` - Listar usuarios (con filtros)
- `POST /users` - Crear usuario
- `PUT /users/:id/toggle-status` - Activar/desactivar usuario
- `PUT /users/:id/role` - Cambiar rol de usuario
- `GET /products` - Todos los productos (admin)
- `PUT /products/:id/toggle-status` - Activar/desactivar producto
- `GET /categories` - Categorías
- `POST /categories` - Crear categoría

## Autenticación

El API utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header:

```
Authorization: Bearer <token>
```

## Base de Datos

### Tablas Principales
- `usuarios` - Información de usuarios
- `productos` - Catálogo de productos
- `categorias` - Categorías de productos
- `resenas` - Reseñas de productos
- `notificaciones` - Sistema de notificaciones
- `usuario_notificaciones` - Relación usuario-notificación

### Características de BD
- Triggers automáticos para actualizar ratings
- Procedimientos almacenados para notificaciones
- Vistas optimizadas para consultas frecuentes
- Índices para mejorar rendimiento

## Seguridad

- **Rate Limiting**: Límite de requests por IP
- **CORS**: Configuración de orígenes permitidos
- **Helmet**: Headers de seguridad
- **Validación**: Validación de entrada con express-validator
- **JWT**: Tokens seguros con expiración
- **Bcrypt**: Hash seguro de contraseñas

## Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
DB_HOST=tu_host_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_password_seguro
JWT_SECRET=clave_jwt_muy_segura
CORS_ORIGIN=https://tu-dominio.com
```

### Comandos de Producción
```bash
# Instalar dependencias de producción
npm install --production

# Iniciar servidor
npm start
```

## Logs

El servidor registra:
- Requests HTTP con método, ruta e IP
- Errores de base de datos
- Errores de autenticación
- Errores de validación

## Desarrollo

### Estructura del Proyecto
```
BackEnd/
├── config/
│   └── database.js          # Configuración de BD
├── middleware/
│   ├── auth.js              # Middleware de autenticación
│   └── validation.js        # Validaciones
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── products.js          # Rutas de productos
│   ├── reviews.js           # Rutas de reseñas
│   ├── notifications.js     # Rutas de notificaciones
│   └── admin.js             # Rutas de administración
├── server.js                # Servidor principal
├── package.json             # Dependencias
└── README.md               # Documentación
```

### Scripts Disponibles
```bash
npm start          # Iniciar servidor
npm run dev        # Desarrollo con nodemon
```

## Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---
