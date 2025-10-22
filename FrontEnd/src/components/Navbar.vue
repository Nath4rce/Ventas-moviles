<template>
  <nav class="navbar navbar-expand-lg navbar-dark sticky-top custom-navbar">
    <div class="container">
      <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/landing">
        <img 
          src="/BrandbookUPB.png" 
          alt="Logo UPB" 
          class="upb-logo-navbar me-2"
          style="height: 35px; width: auto;"
        />
        Ventas Moviles UPB
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/landing">
              <i class="fas fa-home me-1"></i>
              Inicio
            </router-link>
          </li>
          <!-- Enlace dinámico para vendedores -->
          <li class="nav-item" v-if="authStore.isSeller">
            <router-link 
              class="nav-link" 
              :to="hasProducts ? `/edit-product/${userProducts[0]?.id}` : '/publish'"
            >
              <i class="fas fa-plus me-1"></i>
              {{ hasProducts ? 'Editar Producto' : 'Publicar' }}
            </router-link>
          </li>
          <!-- Enlace para administradores -->
          <li class="nav-item" v-if="authStore.isAdmin">
            <router-link class="nav-link" to="/admin">
              <i class="fas fa-cog me-1"></i>
              Admin
            </router-link>
          </li>
        </ul>

        <!-- boton de log in-->
        <ul class="navbar-nav">
          <li class="nav-item" v-if="!authStore.isAuthenticated">
            <router-link class="nav-link" to="/login">
              <i class="fas fa-sign-in-alt me-1"></i>
              Iniciar Sesión
            </router-link>
          </li>
        </ul>

        <ul class="navbar-nav">
          <!-- Notificaciones -->
          <li class="nav-item dropdown" v-if="authStore.isAuthenticated">
            <a 
              class="nav-link position-relative d-flex align-items-center" 
              href="#" 
              id="notificationsDropdown" 
              role="button" 
              data-bs-toggle="dropdown"
            >
              <i class="fas fa-bell me-1"></i>
              <span class="dropdown-link-text">Notificaciones</span>
              <span 
                v-if="unreadCount > 0" 
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              >
                {{ unreadCount }}
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
              <li>
                <h6 class="dropdown-header">Notificaciones</h6>
              </li>
              <li v-if="notifications.length === 0">
                <span class="dropdown-item-text text-muted">No hay notificaciones</span>
              </li>
              <li v-for="notification in notifications.slice(0, 5)" :key="notification.id">
                <a class="dropdown-item" href="#" @click="markAsRead(notification.id)">
                  <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">{{ notification.title }}</h6>
                    <small>{{ formatDate(notification.createdAt) }}</small>
                  </div>
                  <p class="mb-1 small">{{ notification.message }}</p>
                </a>
              </li>
              <li v-if="notifications.length > 5">
                <hr class="dropdown-divider">
                <router-link class="dropdown-item text-center" to="/notifications">
                  Ver todas las notificaciones
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Perfil de usuario -->
          <li class="nav-item dropdown" v-if="authStore.isAuthenticated">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="profileDropdown" role="button"
              data-bs-toggle="dropdown">
              <img :src="authStore.user?.avatar" alt="Avatar" class="rounded-circle me-2" width="30" height="30">
              <span class="dropdown-link-text">Perfil</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li>
                <router-link class="dropdown-item" to="/profile">
                  <i class="fas fa-user me-2"></i>
                  Mi Perfil
                </router-link>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click="logout">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  Cerrar Sesión
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'
import { useProductsStore } from '../stores/products' // Importar el store de productos

export default {
  name: 'Navbar',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const notificationsStore = useNotificationsStore()
    const productsStore = useProductsStore() // Inicializar el store de productos

    // Productos del usuario (solo vendedores)
    const userProducts = computed(() => {
      return productsStore.userProducts(authStore.user?.id_institucional) || []
    })

    // Verificación si el usuario tiene productos
    const hasProducts = computed(() => {
      return userProducts.value.length > 0
    })

    const notifications = computed(() =>
      notificationsStore.userNotifications(authStore.user?.id)
    )

    const unreadCount = computed(() =>
      notificationsStore.unreadCount(authStore.user?.id)
    )

    const logout = async () => {
      authStore.logout()
      router.push('/login')
    }

    const markAsRead = (notificationId) => {
      notificationsStore.markAsRead(notificationId)
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
    }

    onMounted(async () => {
      authStore.initAuth()
      if (authStore.isAuthenticated) {
        await notificationsStore.fetchNotifications()
        // Cargar productos si el usuario está autenticado
        await productsStore.fetchProducts()
      }
    })

    return {
      authStore,
      userProducts,
      hasProducts,
      notifications,
      unreadCount,
      logout,
      markAsRead,
      formatDate
    }
  }
}
</script>

<style scoped>
.navbar-brand {
  font-size: 1.5rem;
}

.nav-link {
  font-weight: 500;
}

.dropdown-menu {
  min-width: 300px;
}

.badge {
  font-size: 0.7rem;
}

/* Mostrar texto en enlaces de dropdown solo en móviles y tablets */
@media (max-width: 1199px) {
  .dropdown-link-text {
    display: inline !important;
    margin-left: 0.25rem;
  }
}

/* Ocultar texto en desktop */
@media (min-width: 1200px) {
  .dropdown-link-text {
    display: none !important;
  }
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .navbar-brand {
    font-size: 1.2rem;
  }
  .dropdown-menu {
    min-width: 250px;
  }
  
  /* Ajustar espaciado para los enlaces con texto */
  .nav-link {
    padding: 0.5rem 0.75rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1199px) {
  .dropdown-link-text {
    font-size: 0.9rem;
  }
}

/* Mejorar la legibilidad del texto en el navbar oscuro */
.custom-navbar .nav-link {
  color: rgba(255, 255, 255, 0.9) !important;
}

.custom-navbar .nav-link:hover {
  color: rgba(255, 255, 255, 1) !important;
}
</style>