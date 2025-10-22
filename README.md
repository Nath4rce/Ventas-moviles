# Ventas Moviles UPB - Marketplace Estudiantil

Marketplace interno completo para estudiantes de la Universidad Pontificia Bolivariana, desarrollado con Vue 3, Node.js y SQL Server.

## Descripción del Proyecto

Ventas Moviles UPB es una plataforma web completa que permite a los estudiantes de la universidad comprar y vender productos entre ellos. La aplicación incluye un sistema robusto de autenticación JWT, gestión completa de productos, sistema de reseñas, notificaciones dirigidas y un panel administrativo avanzado.

### Características Principales
- **Marketplace completo** con catálogo de productos, filtros y búsqueda
- **Sistema de autenticación** seguro con JWT y roles (Admin, Vendedor, Estudiante)
- **Gestión de productos** con múltiples imágenes y categorías
- **Sistema de reseñas** con calificaciones automáticas
- **Notificaciones dirigidas** por rol y NRC específico
- **Panel administrativo** completo con estadísticas y gestión de usuarios
- **Diseño responsive** optimizado para móviles, tablets y desktop

## Arquitectura del Sistema

### Frontend (Vue 3)
- **Framework**: Vue 3 con Composition API moderna
- **Estado**: Pinia para gestión de estado global reactivo
- **Routing**: Vue Router con guards de autenticación
- **UI**: Bootstrap 5 con diseño responsive mobile-first
- **Build**: Vite para desarrollo rápido y construcción optimizada
- **HTTP**: Axios para comunicación con API REST

### Backend (Node.js)
- **Framework**: Express.js con middleware de seguridad
- **Base de Datos**: SQL Server con triggers y procedimientos almacenados
- **Autenticación**: JWT (JSON Web Tokens) con expiración
- **Validación**: Express-validator con sanitización
- **Seguridad**: Helmet, CORS, Rate Limiting, Bcrypt
- **Archivos**: Sistema de gestión de imágenes con fallback

## Características Principales

### Para Estudiantes/Compradores
- **Registro e inicio de sesión** con ID estudiantil y JWT
- **Navegación completa** por catálogo de productos con filtros
- **Búsqueda avanzada** por texto, categoría y precio
- **Sistema de reseñas** para calificar productos
- **Contacto directo** con vendedores por WhatsApp
- **Gestión de perfil** personal completo
- **Notificaciones dirigidas** por NRC y rol
- **Sistema de favoritos** para productos preferidos

### Para Vendedores
- **Publicación de productos** con múltiples imágenes (máximo 1 activo)
- **Gestión completa** de inventario y productos
- **Estadísticas detalladas** de ventas y reseñas
- **Panel de control** personalizado
- **Sistema de calificaciones** automático
- **Gestión de perfil** y contacto

### Para Administradores
- **Control total** del sistema y usuarios
- **Gestión avanzada** de usuarios (crear, activar, cambiar roles)
- **Gestión de productos** y categorías
- **Envío de notificaciones** masivas dirigidas
- **Estadísticas generales** del sitio
- **Moderación de contenido** y usuarios
- **Habilitar/deshabilitar** el sitio completo

## Estructura del Proyecto

```
Ventas-moviles-main/
├── FrontEnd/                 # Aplicación Vue 3
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── Navbar.vue    # Barra de navegación
│   │   │   ├── Footer.vue    # Pie de página
│   │   │   ├── ProductCard.vue # Tarjeta de producto
│   │   │   └── ImageWithFallback.vue # Imágenes con fallback
│   │   ├── views/           # Páginas principales
│   │   │   ├── Login.vue    # Autenticación
│   │   │   ├── Landing.vue  # Marketplace principal
│   │   │   ├── ProductDetail.vue # Detalle de producto
│   │   │   ├── PublishProduct.vue # Publicar producto
│   │   │   ├── AdminDashboard.vue # Panel admin
│   │   │   └── Notifications.vue # Notificaciones
│   │   ├── stores/          # Gestión de estado (Pinia)
│   │   │   ├── auth.js      # Autenticación
│   │   │   ├── products.js  # Productos
│   │   │   └── notifications.js # Notificaciones
│   │   ├── router/          # Configuración de rutas
│   │   ├── assets/          # Recursos estáticos
│   │   └── utils/           # Utilidades
│   ├── package.json
│   └── vite.config.js
├── BackEnd/                  # API Node.js
│   ├── config/
│   │   └── database.js       # Configuración SQL Server
│   ├── middleware/
│   │   ├── auth.js          # Autenticación JWT
│   │   └── validation.js     # Validaciones
│   ├── routes/
│   │   ├── auth.js          # Autenticación
│   │   ├── products.js      # Productos
│   │   ├── reviews.js       # Reseñas
│   │   ├── notifications.js # Notificaciones
│   │   └── admin.js         # Administración
│   ├── server.js            # Servidor principal
│   └── package.json
├── DataBase/
│   └── database_schema.sql   # Esquema de base de datos
└── README.md                # Este archivo
```

## Instalación y Configuración

### Requisitos Previos
- **Node.js 16+** y npm/yarn
- **SQL Server** (SQL Developer compatible)
- **Git** para clonar el repositorio

### Instalación Completa

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd Ventas-moviles-main
   ```

2. **Configurar la Base de Datos:**
   ```sql
   -- Crear base de datos
   CREATE DATABASE ventasmoviles_upb;
   
   -- Ejecutar el esquema
   SOURCE DataBase/database_schema.sql;
   ```

3. **Configurar el Backend:**
   ```bash
   cd BackEnd
   npm install
   
   # Crear archivo .env con tu configuración
   cp .env.example .env
   # Editar .env con tus datos de SQL Server
   
   npm run dev
   ```

4. **Configurar el Frontend:**
   ```bash
   cd FrontEnd
   npm install
   npm run dev
   ```

5. **Acceder a la aplicación:**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **Health Check**: http://localhost:3000/health

### Usuarios de Prueba

#### Administrador
- **ID**: 20210001
- **Contraseña**: admin123
- **Funciones**: Control total, gestión de usuarios, notificaciones masivas

#### Vendedor
- **ID**: 20210002
- **Contraseña**: vendedor123
- **Funciones**: Publicar productos, gestionar inventario, estadísticas

#### Estudiante/Comprador
- **ID**: 20210003
- **Contraseña**: comprador123
- **Funciones**: Navegar, comprar, reseñar productos, gestionar perfil

## Tecnologías Utilizadas

### Frontend
- **Vue 3**: Framework JavaScript reactivo con Composition API
- **Vue Router**: Enrutamiento con guards de autenticación
- **Pinia**: Gestión de estado global moderna
- **Bootstrap 5**: Framework CSS responsive mobile-first
- **Font Awesome**: Iconografía completa
- **Vite**: Herramienta de construcción rápida
- **Axios**: Cliente HTTP para comunicación con API REST

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web con middleware de seguridad
- **SQL Sever**: Base de datos con triggers y procedimientos almacenados
- **JWT**: Autenticación segura con expiración
- **Bcrypt**: Hash seguro de contraseñas
- **Express-validator**: Validación y sanitización de datos
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Cross-Origin Resource Sharing configurado
- **Rate Limiting**: Protección contra ataques de fuerza bruta

## API Endpoints

### Autenticación (`/api/auth`)
- `POST /login` - Iniciar sesión con ID estudiantil
- `POST /register` - Registrar nuevo usuario
- `GET /me` - Obtener perfil del usuario actual
- `PUT /profile` - Actualizar perfil personal
- `POST /logout` - Cerrar sesión

### Productos (`/api/products`)
- `GET /` - Listar productos con filtros y paginación
- `GET /categories` - Obtener categorías disponibles
- `GET /:id` - Obtener detalle de producto
- `POST /` - Crear producto (vendedores)
- `PUT /:id` - Actualizar producto (propietario/admin)
- `DELETE /:id` - Desactivar producto
- `GET /user/:userId` - Productos de un usuario específico

### Reseñas (`/api/reviews`)
- `GET /product/:productId` - Reseñas de un producto
- `POST /` - Crear reseña (usuarios autenticados)
- `PUT /:id` - Actualizar reseña (propietario)
- `DELETE /:id` - Eliminar reseña (propietario)
- `GET /user/:userId` - Reseñas de un usuario
- `GET /stats/:productId` - Estadísticas de reseñas

### Notificaciones (`/api/notifications`)
- `GET /` - Notificaciones del usuario actual
- `PUT /:id/read` - Marcar notificación como leída
- `PUT /read-all` - Marcar todas como leídas
- `POST /` - Crear notificación (admin)
- `GET /admin` - Todas las notificaciones (admin)
- `DELETE /:id` - Eliminar notificación (admin)
- `GET /site-status` - Estado del sitio
- `PUT /site-status` - Cambiar estado (admin)

### Administración (`/api/admin`)
- `GET /stats` - Estadísticas generales
- `GET /users` - Listar usuarios con filtros
- `POST /users` - Crear usuario
- `PUT /users/:id/toggle-status` - Activar/desactivar usuario
- `PUT /users/:id/role` - Cambiar rol de usuario
- `GET /products` - Todos los productos (admin)
- `PUT /products/:id/toggle-status` - Activar/desactivar producto
- `GET /categories` - Categorías
- `POST /categories` - Crear categoría

## Base de Datos
https://www.microsoft.com/es-es/sql-server/sql-server-downloads

### Tablas Principales

#### Usuarios (`usuarios`)
- `id`: Identificador único
- `student_id`: ID estudiantil único
- `email`: Correo electrónico
- `password_hash`: Contraseña hasheada con Bcrypt
- `nombre`: Nombre completo
- `rol`: Rol del usuario (admin, seller, buyer)
- `nrc`: NRC del estudiante
- `avatar_url`: URL de imagen de perfil
- `is_active`: Estado activo/inactivo
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

#### Productos (`productos`)
- `id`: Identificador único
- `titulo`: Título del producto
- `descripcion`: Descripción detallada
- `precio`: Precio en decimal
- `categoria_id`: ID de la categoría
- `vendedor_id`: ID del vendedor
- `telefono_whatsapp`: Teléfono de contacto
- `rating_promedio`: Calificación promedio (automática)
- `total_resenas`: Total de reseñas (automático)
- `is_active`: Estado activo/inactivo
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

#### Reseñas (`resenas`)
- `id`: Identificador único
- `producto_id`: ID del producto
- `usuario_id`: ID del usuario
- `rating`: Calificación (1-5)
- `comentario`: Comentario opcional
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

#### Notificaciones (`notificaciones`)
- `id`: Identificador único
- `titulo`: Título de la notificación
- `mensaje`: Contenido del mensaje
- `tipo`: Tipo (info, success, warning, danger)
- `destinatario_tipo`: Destinatario (all, sellers, students, nrc)
- `nrc_especifico`: NRC específico (si aplica)
- `is_site_wide`: Notificación global
- `created_at`: Fecha de creación

#### Imágenes de Productos (`producto_imagenes`)
- `id`: Identificador único
- `producto_id`: ID del producto
- `imagen_url`: URL de la imagen
- `orden`: Orden de visualización
- `is_principal`: Imagen principal
- `created_at`: Fecha de creación

### Características de la BD
- **Triggers automáticos** para actualizar ratings
- **Procedimientos almacenados** para notificaciones
- **Vistas optimizadas** para consultas frecuentes
- **Índices** para mejorar rendimiento
- **Integridad referencial** con foreign keys

## Patrones de Desarrollo

### Frontend
- **Composition API**: Vue 3 moderno con setup() y reactive
- **Mobile First**: Diseño responsive con breakpoints adaptativos
- **Component-Based**: Arquitectura modular y reutilizable
- **Reactive Design**: Interfaz reactiva con Pinia stores
- **Progressive Enhancement**: Funcionalidad básica + mejoras

### Backend
- **RESTful API**: Endpoints bien estructurados y documentados
- **Middleware Pattern**: Validación, autenticación y seguridad
- **Error Handling**: Manejo consistente de errores con respuestas estandarizadas
- **Security First**: Validación, sanitización y protección contra ataques
- **Database Triggers**: Lógica de negocio en la base de datos

## Despliegue

### Desarrollo
```bash
# Terminal 1 - Backend
cd BackEnd
npm run dev
# Servidor en http://localhost:3000

# Terminal 2 - Frontend
cd FrontEnd
npm run dev
# Aplicación en http://localhost:5173
```

### Producción
```bash
# Backend
cd BackEnd
npm start

# Frontend
cd FrontEnd
npm run build
# Archivos en carpeta dist/
```

### Servicios Recomendados
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Railway, DigitalOcean, AWS EC2
- **Base de Datos**: SQL Server en la nube (AWS RDS, DigitalOcean)
- **Monitoreo**: PM2 para Node.js en producción

## Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

## Equipo de Desarrollo
s
**Ventas Moviles UPB Team**
- Juan David Parra Sierra
- Natalia Arce Penuela
- Santiago Viana Ayala
- Miguel Angel Ramirez Velasquez
- Sara Soto

**Universidad Pontificia Bolivariana - 2025**

---

## Documentación Adicional

Para más información detallada, consulta los README específicos de cada módulo:
- [📱 Frontend README](FrontEnd/README.md) - Aplicación Vue 3
- [🔧 Backend README](BackEnd/README.md) - API Node.js
- [🗄️ Base de Datos](DataBase/database_schema.sql) - Esquema SQL Server

---

**¡Disfruta comprando y vendiendo en Vsentas Moviles UPB! 🛒✨**