# Antojitos UPB - Marketplace Estudiantil

Marketplace interno para estudiantes de la Universidad Pontificia Bolivariana, desarrollado con Vue 3 y Node.js.

## Descripción del Proyecto

Antojitos UPB es una plataforma web que permite a los estudiantes de la universidad comprar y vender productos entre ellos. La aplicación incluye un sistema completo de autenticación, gestión de productos, notificaciones y un panel administrativo.

## Arquitectura del Sistema

### Frontend (Vue 3)
- **Framework**: Vue 3 con Composition API
- **Estado**: Pinia para gestión de estado global
- **Routing**: Vue Router con guards de autenticación
- **UI**: Bootstrap 5 con diseño responsive
- **Build**: Vite para desarrollo y construcción

### Backend (Node.js)
- **Framework**: Express.js
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Express-validator
- **Archivos**: Multer para subida de imágenes

## Características Principales

### Para Estudiantes
- Registro e inicio de sesión con ID estudiantil
- Navegación por catálogo de productos
- Búsqueda y filtros avanzados
- Sistema de favoritos
- Gestión de perfil personal
- Notificaciones en tiempo real

### Para Vendedores
- Publicación de productos con imágenes
- Gestión de inventario
- Estadísticas de ventas
- Panel de control personalizado

### Para Administradores
- Control total del sistema
- Gestión de usuarios y productos
- Envío de notificaciones masivas
- Estadísticas generales
- Moderación de contenido

## Estructura del Proyecto

```
Ventas-moviles-main/
├── FrontEnd/                 # Aplicación Vue 3
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── views/           # Páginas principales
│   │   ├── stores/          # Gestión de estado (Pinia)
│   │   ├── router/          # Configuración de rutas
│   │   └── assets/          # Recursos estáticos
│   ├── package.json
│   └── vite.config.js
├── BackEnd/                  # API Node.js
│   ├── src/
│   │   ├── config/          # Configuración de BD
│   │   ├── routes/          # Endpoints de la API
│   │   ├── middleware/      # Middleware personalizado
│   │   └── server.js        # Servidor principal
│   ├── scripts/             # Scripts de BD
│   ├── uploads/             # Archivos subidos
│   └── package.json
└── README.md                # Este archivo
```

## Instalación y Configuración

### Requisitos Previos
- Node.js 16 o superior
- npm o yarn
- Git

### Instalación Completa

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd Ventas-moviles-main
   ```

2. **Configurar el Backend:**
   ```bash
   cd BackEnd
   npm install
   npm run dev
   ```

3. **Configurar el Frontend:**
   ```bash
   cd FrontEnd
   npm install
   npm run dev
   ```

4. **Acceder a la aplicación:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Usuarios de Prueba

#### Administrador
- **ID**: 20210001
- **Contraseña**: admin123
- **Funciones**: Control total del sistema

#### Vendedor
- **ID**: 20210002
- **Contraseña**: vendedor123
- **Funciones**: Publicar y gestionar productos

#### Estudiante
- **ID**: 20210003
- **Contraseña**: comprador123
- **Funciones**: Navegar y comprar productos

## Tecnologías Utilizadas

### Frontend
- **Vue 3**: Framework JavaScript reactivo
- **Vue Router**: Enrutamiento de la aplicación
- **Pinia**: Gestión de estado global
- **Bootstrap 5**: Framework CSS responsive
- **Font Awesome**: Iconografía
- **Vite**: Herramienta de construcción
- **Axios**: Cliente HTTP para API

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **SQLite/PostgreSQL**: Base de datos
- **JWT**: Autenticación
- **Bcrypt**: Hash de contraseñas
- **Multer**: Subida de archivos
- **Express-validator**: Validación de datos
- **Helmet**: Seguridad HTTP
- **CORS**: Cross-Origin Resource Sharing

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener perfil actual
- `POST /api/auth/logout` - Cerrar sesión

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users/notifications` - Obtener notificaciones
- `GET /api/users/favorites` - Obtener favoritos

## Desarrollo

### Estructura de Base de Datos

#### Tabla Users
- `id`: Identificador único
- `student_id`: ID estudiantil único
- `email`: Correo electrónico
- `name`: Nombre completo
- `password`: Contraseña hasheada
- `role`: Rol del usuario (admin, seller, student)
- `profile_image`: Imagen de perfil
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

#### Tabla Products
- `id`: Identificador único
- `title`: Título del producto
- `description`: Descripción
- `price`: Precio
- `category`: Categoría
- `image_url`: URL de la imagen
- `stock`: Cantidad disponible
- `seller_id`: ID del vendedor
- `status`: Estado (active, inactive, sold)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

#### Tabla Notifications
- `id`: Identificador único
- `user_id`: ID del usuario destinatario
- `title`: Título de la notificación
- `message`: Contenido del mensaje
- `type`: Tipo de notificación
- `is_read`: Estado de lectura
- `created_at`: Fecha de creación

#### Tabla Favorites
- `id`: Identificador único
- `user_id`: ID del usuario
- `product_id`: ID del producto
- `created_at`: Fecha de agregado

### Patrones de Desarrollo

#### Frontend
- **Composition API**: Vue 3 moderno
- **Mobile First**: Diseño responsive
- **Component-Based**: Arquitectura modular
- **Reactive Design**: Interfaz reactiva

#### Backend
- **RESTful API**: Endpoints bien estructurados
- **Middleware Pattern**: Validación y autenticación
- **Error Handling**: Manejo consistente de errores
- **Security First**: Validación y sanitización

## Despliegue

### Desarrollo
```bash
# Backend
cd BackEnd
npm run dev

# Frontend
cd FrontEnd
npm run dev
```

### Producción
```bash
# Backend
cd BackEnd
npm start

# Frontend
cd FrontEnd
npm run build
```

### Servicios Recomendados
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Base de Datos**: PostgreSQL en la nube

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

## Equipo de Desarrollo

**Antojitos UPB Team**
- Juan David Parra Sierra
- Natalia Arce Penuela
- Santiago Viana Ayala
- Miguel Angel Ramirez Velasquez
- Sara Soto

Universidad Pontificia Bolivariana - 2025

---

Para más información detallada, consulta los README específicos de cada módulo:
- [Frontend README](FrontEnd/README.md)
- [Backend README](BackEnd/README.md)