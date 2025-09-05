# Antojitos UPB

## Características Tecnincas

### Funcionalidades Actuales
- **Autenticación completa**: Login y registro con ID estudiantil
- **Sistema de roles**: Comprador, Vendedor y Administrador
- **Marketplace**: Catálogo de productos con filtros y búsqueda
- **Sistema de reseñas**: Los usuarios pueden calificar productos (máximo 1 por día)
- **Gestión de productos**: Los vendedores pueden publicar un producto activo a la vez
- **Panel administrativo**: Control total del sitio y envío de notificaciones
- **Diseño responsive**: Mobile first con breakpoints adaptativos

### Tecnologías Utilizadas
- **Vue 3** - Framework JavaScript reactivo
- **Vue Router** - Enrutamiento de la aplicación
- **Pinia** - Gestión de estado global
- **Bootstrap 5** - Framework CSS responsive
- **Font Awesome** - Iconografía
- **Vite** - Herramienta de construcción

## 📱 Diseño Responsive

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


### Comandos de ejecucion

```bash
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
- **Funciones**: Control total, envío de notificaciones, deshabilitar sitio

### Vendedor
- **ID**: 20210002
- **Contraseña**: vendedor123
- **Funciones**: Publicar productos, comprar, dejar reseñas

### Comprador
- **ID**: 20210003
- **Contraseña**: comprador123
- **Funciones**: Navegar, comprar, dejar reseñas

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.vue      # Barra de navegación
│   ├── Footer.vue      # Pie de página
│   └── ProductCard.vue # Tarjeta de producto
├── views/              # Vistas principales
│   ├── Login.vue       # Página de inicio de sesión
│   ├── Register.vue    # Página de registro
│   ├── Landing.vue     # Página principal (marketplace)
│   ├── ProductDetail.vue # Detalle de producto
│   ├── PublishProduct.vue # Publicar producto (vendedor)
│   ├── AdminDashboard.vue # Panel de administración
│   ├── Notifications.vue # Gestión de notificaciones
│   └── Profile.vue     # Perfil de usuario
├── stores/             # Gestión de estado (Pinia)
│   ├── auth.js         # Estado de autenticación
│   ├── products.js     # Estado de productos y reseñas
│   └── notifications.js # Estado de notificaciones
├── router/             # Configuración de rutas
│   └── index.js        # Definición de rutas
├── App.vue             # Componente principal
└── main.js             # Punto de entrada
```

## 🔧 Configuración

### Variables de Entorno
El proyecto está configurado para funcionar sin variables de entorno adicionales. Los datos se simulan localmente usando Pinia stores.

### Personalización
Para personalizar la aplicación:

1. **Colores**: Modifica las variables CSS en `src/App.vue`
2. **Datos**: Actualiza los stores en `src/stores/`
3. **Rutas**: Modifica `src/router/index.js`
4. **Componentes**: Edita los archivos en `src/components/` y `src/views/`

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

## Próximas Mejoras

### Backend Integration
- [ ] API REST con Node.js/Express
- [ ] Base de datos PostgreSQL/MongoDB
- [ ] Autenticación JWT
- [ ] Subida de imágenes real
- [ ] Sistema de pagos

### Funcionalidades Adicionales
- [ ] Chat entre usuarios
- [ ] Sistema de favoritos
- [ ] Historial de compras
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

### Mejoras de UX/UI
- [ ] Animaciones más fluidas
- [ ] Skeleton loaders
- [ ] Mejores transiciones
- [ ] Microinteracciones

## Notas de Desarrollo

### Comentarios en el Código
El código incluye comentarios detallados para facilitar la implementación del backend:

- **Stores**: Preparados para integración con API
- **Componentes**: Estructura escalable
- **Rutas**: Protegidas con guards
- **Validaciones**: Listas para backend

### Patrones Utilizados
- **Composition API**: Vue 3 moderno
- **Mobile First**: Diseño responsive
- **Component-Based**: Arquitectura modular
- **State Management**: Pinia para estado global

## Licencia

Mrk tenemos q hacer licencia 

## Desarrollado por

**Antojitos UPB Team**
   Juan david parra sierra
   Natalia arce penuela
   Santiago viana ayala
   Miguel angel ramirez velasquez
   Sara soto

- Universidad Pontificia Bolivariana
- 2025

---

¡Disfruta comprando y vendiendo en Antojitos UPB!
