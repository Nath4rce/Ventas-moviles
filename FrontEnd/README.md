# Antojitos UPB - Frontend

Frontend del marketplace interno de estudiantes de la Universidad Pontificia Bolivariana, desarrollado con Vue 3 y conectado a un backend Node.js completo.

## Características Técnicas

### Funcionalidades Implementadas
- **Autenticación completa**: Login y registro con ID estudiantil y JWT
- **Sistema de roles**: Comprador, Vendedor y Administrador con permisos específicos
- **Marketplace completo**: Catálogo de productos con filtros, búsqueda y paginación
- **Gestión de productos**: Los vendedores pueden publicar, editar y gestionar productos
- **Sistema de reseñas**: Calificaciones y comentarios de productos
- **Panel administrativo**: Control total del sitio, gestión de usuarios y notificaciones
- **Diseño responsive**: Mobile first con breakpoints adaptativos
- **Sistema de notificaciones**: Notificaciones dirigidas por rol y NRC
- **Gestión de imágenes**: Múltiples imágenes por producto con fallback

### Tecnologías Utilizadas
- **Vue 3** - Framework JavaScript reactivo con Composition API
- **Vue Router** - Enrutamiento de la aplicación con guards de autenticación
- **Pinia** - Gestión de estado global moderna
- **Bootstrap 5** - Framework CSS responsive
- **Font Awesome** - Iconografía completa
- **Vite** - Herramienta de construcción rápida
- **Axios** - Cliente HTTP para comunicación con API REST

## Diseño Responsive

### Breakpoints
- **Mobile**: < 768px
- **Tablet/Laptop**: 768px - 1199px  
- **Desktop**: ≥ 1200px

### Paleta de Colores
- **Primario**: #dc2626 (Rojo principal)
- **Secundario**: #ea580c (Naranja)
- **Acento**: #c2410c (Naranja oscuro)
- **Texto oscuro**: #1f2937
- **Texto claro**: #6b7280
- **Fondo claro**: #fef7f7 (Rojo muy claro)

## Instalación y Ejecución

### Requisitos Previos
- Node.js 16+
- npm o yarn
- Backend Node.js funcionando (puerto 3000)

### Configuración del Proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Crear archivo `.env` en la raíz del frontend:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_APP_NAME=Antojitos UPB
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

4. **Construcción para producción:**
   ```bash
   npm run build
   ```

5. **Vista previa de la construcción:**
   ```bash
   npm run preview
   ```

### Configuración del Backend
Asegúrate de que el backend esté funcionando en `http://localhost:3000` antes de iniciar el frontend.

## Usuarios de Prueba

### Administrador
- **ID**: 20210001
- **Contraseña**: admin123
- **Funciones**: 
  - Control total del sistema
  - Gestión de usuarios (crear, activar/desactivar, cambiar roles)
  - Gestión de productos y categorías
  - Envío de notificaciones masivas
  - Estadísticas generales del sitio
  - Habilitar/deshabilitar el sitio

### Vendedor
- **ID**: 20210002
- **Contraseña**: vendedor123
- **Funciones**: 
  - Publicar productos (máximo 1 activo)
  - Gestionar inventario
  - Ver estadísticas de productos
  - Responder a compradores
  - Gestionar perfil

### Comprador/Estudiante
- **ID**: 20210003
- **Contraseña**: comprador123
- **Funciones**: 
  - Navegar por el catálogo
  - Buscar y filtrar productos
  - Ver detalles de productos
  - Contactar vendedores por WhatsApp
  - Dejar reseñas y calificaciones
  - Gestionar perfil personal
  - Recibir notificaciones

## Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── Navbar.vue          # Barra de navegación
│   ├── Footer.vue          # Pie de página
│   ├── ProductCard.vue     # Tarjeta de producto
│   └── ImageWithFallback.vue # Componente para imágenes con fallback
├── views/                  # Vistas principales
│   ├── Login.vue           # Página de inicio de sesión
│   ├── Register.vue        # Página de registro
│   ├── Landing.vue         # Página principal (marketplace)
│   ├── ProductDetail.vue   # Detalle de producto
│   ├── PublishProduct.vue  # Publicar producto (vendedor)
│   ├── AdminDashboard.vue  # Panel de administración
│   ├── Notifications.vue   # Gestión de notificaciones
│   └── Profile.vue         # Perfil de usuario
├── stores/                 # Gestión de estado (Pinia)
│   ├── auth.js             # Estado de autenticación
│   ├── products.js         # Estado de productos
│   └── notifications.js    # Estado de notificaciones
├── router/                 # Configuración de rutas
│   └── index.js            # Definición de rutas y guards
├── utils/                  # Utilidades
│   └── imageFallback.js    # Utilidad para manejo de imágenes
├── assets/                 # Recursos estáticos
│   └── css/                # Estilos CSS
├── App.vue                 # Componente principal
└── main.js                 # Punto de entrada
```

## Configuración

### Variables de Entorno
El proyecto está configurado para conectarse al backend en `http://localhost:3000`. Para cambiar la URL del backend, modifica el archivo `src/stores/auth.js` y otros stores según sea necesario.

### Proxy de Desarrollo
El archivo `vite.config.js` incluye un proxy que redirige las llamadas `/api` al backend:

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### Personalización
Para personalizar la aplicación:

1. **Colores**: Modifica las variables CSS en `src/assets/css/variables.css`
2. **Componentes**: Edita los archivos en `src/components/` y `src/views/`
3. **Rutas**: Modifica `src/router/index.js`
4. **Estado**: Actualiza los stores en `src/stores/`

## Integración con API

### Autenticación
- **Login**: POST `/api/auth/login` con ID estudiantil y contraseña
- **Registro**: POST `/api/auth/register` para nuevos usuarios
- **Perfil**: GET `/api/auth/me` para obtener datos del usuario
- **JWT**: Tokens seguros con expiración de 24 horas
- **Logout**: POST `/api/auth/logout` para cerrar sesión

### Productos
- **Listado**: GET `/api/products` con filtros, búsqueda y paginación
- **Detalle**: GET `/api/products/:id` para información completa
- **Crear**: POST `/api/products` (solo vendedores autenticados)
- **Actualizar**: PUT `/api/products/:id` (propietario o admin)
- **Eliminar**: DELETE `/api/products/:id` (desactivar producto)
- **Categorías**: GET `/api/products/categories`

### Reseñas
- **Listar**: GET `/api/reviews/product/:productId`
- **Crear**: POST `/api/reviews` (usuarios autenticados)
- **Actualizar**: PUT `/api/reviews/:id` (propietario)
- **Eliminar**: DELETE `/api/reviews/:id` (propietario)
- **Estadísticas**: GET `/api/reviews/stats/:productId`

### Notificaciones
- **Listar**: GET `/api/notifications` (del usuario actual)
- **Marcar leída**: PUT `/api/notifications/:id/read`
- **Marcar todas**: PUT `/api/notifications/read-all`
- **Estado del sitio**: GET `/api/notifications/site-status`

### Administración
- **Estadísticas**: GET `/api/admin/stats`
- **Usuarios**: GET `/api/admin/users` con filtros
- **Crear usuario**: POST `/api/admin/users`
- **Cambiar estado**: PUT `/api/admin/users/:id/toggle-status`
- **Cambiar rol**: PUT `/api/admin/users/:id/role`

## Despliegue

### Construcción para Producción
```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist/` y pueden ser desplegados en cualquier servidor web estático.

### Servicios Recomendados
- **Netlify**: Despliegue automático desde Git
- **Vercel**: Despliegue con optimizaciones automáticas
- **GitHub Pages**: Hosting gratuito para proyectos públicos

## Desarrollo

### Estructura de Componentes
Los componentes siguen la Composition API de Vue 3:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Lógica del componente
</script>

<template>
  <!-- Template del componente -->
</template>

<style scoped>
/* Estilos específicos del componente */
</style>
```

### Gestión de Estado
El estado se maneja con Pinia stores:

```javascript
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),
  actions: {
    async login(credentials) {
      // Lógica de login
    }
  }
})
```

### Rutas Protegidas
Las rutas están protegidas con guards de autenticación:

```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  next()
})
```

## Notas de Desarrollo

### Patrones Utilizados
- **Composition API**: Vue 3 moderno
- **Mobile First**: Diseño responsive
- **Component-Based**: Arquitectura modular
- **State Management**: Pinia para estado global
- **Reactive Design**: Interfaz reactiva y fluida

### Comentarios en el Código
El código incluye comentarios detallados para facilitar el mantenimiento:

- **Componentes**: Estructura clara y documentada
- **Stores**: Preparados para integración con API
- **Rutas**: Protegidas con guards de autenticación
- **Utilidades**: Funciones auxiliares documentadas

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

## Desarrollado por

**Antojitos UPB Team**
- Juan David Parra Sierra
- Natalia Arce Penuela
- Santiago Viana Ayala
- Miguel Angel Ramirez Velasquez
- Sara Soto

Universidad Pontificia Bolivariana - 2025