# Antojitos UPB - Frontend

Frontend del marketplace interno de estudiantes de la Universidad Pontificia Bolivariana, desarrollado con Vue 3.

## Características Técnicas

### Funcionalidades Actuales
- **Autenticación completa**: Login y registro con ID estudiantil
- **Sistema de roles**: Comprador, Vendedor y Administrador
- **Marketplace**: Catálogo de productos con filtros y búsqueda
- **Gestión de productos**: Los vendedores pueden publicar productos
- **Panel administrativo**: Control del sitio y envío de notificaciones
- **Diseño responsive**: Mobile first con breakpoints adaptativos
- **Sistema de favoritos**: Los usuarios pueden marcar productos como favoritos
- **Notificaciones**: Sistema de notificaciones en tiempo real

### Tecnologías Utilizadas
- **Vue 3** - Framework JavaScript reactivo
- **Vue Router** - Enrutamiento de la aplicación
- **Pinia** - Gestión de estado global
- **Bootstrap 5** - Framework CSS responsive
- **Font Awesome** - Iconografía
- **Vite** - Herramienta de construcción
- **Axios** - Cliente HTTP para API

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

### Requisitos
- Node.js 16+
- npm o yarn

### Comandos de Ejecución

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Vista previa de la construcción
npm run preview
```

## Usuarios de Prueba

### Administrador
- **ID**: 20210001
- **Contraseña**: admin123
- **Funciones**: Control total, envío de notificaciones, gestión de usuarios

### Vendedor
- **ID**: 20210002
- **Contraseña**: vendedor123
- **Funciones**: Publicar productos, gestionar inventario, ver estadísticas

### Comprador
- **ID**: 20210003
- **Contraseña**: comprador123
- **Funciones**: Navegar, comprar, marcar favoritos, gestionar perfil

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

## API Integration

### Autenticación
- Login con ID estudiantil y contraseña
- Registro de nuevos usuarios
- Renovación automática de tokens JWT
- Logout seguro

### Productos
- Listado con filtros y paginación
- Búsqueda por texto y categoría
- Detalles de producto individual
- Gestión de productos (vendedores)

### Usuarios
- Perfil de usuario
- Gestión de favoritos
- Sistema de notificaciones
- Estadísticas (vendedores)

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

---

¡Disfruta comprando y vendiendo en Antojitos UPB!