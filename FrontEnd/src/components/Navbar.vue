<template>
  <nav class="navbar navbar-expand-lg navbar-dark sticky-top custom-navbar">
    <div class="container">
      <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/landing">
        <img src="/BrandbookUPB.png" alt="Logo UPB" class="upb-logo-navbar me-2" style="height: 35px; width: auto;" />
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
            <router-link class="nav-link" :to="hasProducts ? `/edit-product/${userProducts[0]?.id}` : '/publish'">
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
            <a class="nav-link position-relative d-flex align-items-center" href="#" id="notificationsDropdown"
              role="button" data-bs-toggle="dropdown" @click="loadNotifications">
              <i class="fas fa-bell me-1"></i>
              <span class="dropdown-link-text">Notificaciones</span>
              <span v-if="unreadCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge">
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            </a>

            <ul class="dropdown-menu dropdown-menu-end notifications-dropdown" aria-labelledby="notificationsDropdown">
              <li class="dropdown-header d-flex justify-content-between align-items-center px-3">
                <span class="fw-bold">Notificaciones</span>
                <router-link to="/notifications" class="btn btn-sm btn-link text-decoration-none p-0">
                  Ver todas
                </router-link>
              </li>
              <li>
                <hr class="dropdown-divider my-0">
              </li>

              <!-- Loading state -->
              <li v-if="notificationsStore.loading" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </li>

              <!-- Empty state -->
              <li v-else-if="recentNotifications.length === 0" class="text-center py-4">
                <i class="fas fa-bell-slash fa-2x text-muted mb-2 d-block"></i>
                <p class="mb-0 small text-muted">No hay notificaciones</p>
              </li>

              <!-- Notificaciones -->
              <li v-for="notification in recentNotifications" :key="notification.id" class="notification-item"
                :class="{ 'unread': !notification.is_read }">
                <a class="dropdown-item py-2 px-3" href="#" @click.prevent="handleNotificationClick(notification)">
                  <div class="d-flex align-items-start">
                    <i :class="getNotificationIcon(notification.tipo)" class="me-2 mt-1"></i>
                    <div class="flex-grow-1 notification-content">
                      <p class="mb-1 fw-semibold notification-title">
                        {{ notification.titulo }}
                        <span v-if="notification.prioridad > 1" class="badge bg-danger ms-1" style="font-size: 0.6rem;">
                          <i class="fas fa-exclamation-circle"></i>
                        </span>
                      </p>
                      <p class="mb-1 text-muted notification-message">
                        {{ truncate(notification.mensaje, 80) }}
                      </p>
                      <small class="text-muted notification-time">
                        <i class="far fa-clock me-1"></i>
                        {{ formatDate(notification.created_at) }}
                      </small>
                    </div>
                  </div>
                </a>
              </li>

              <!-- Ver más -->
              <li v-if="unreadCount > 5">
                <hr class="dropdown-divider my-0">
              </li>
              <li v-if="unreadCount > 5" class="text-center py-2">
                <router-link to="/notifications" class="dropdown-item text-primary small fw-semibold">
                  <i class="fas fa-arrow-right me-1"></i>
                  Ver {{ unreadCount - 5 }} más notificaciones
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Perfil de usuario -->
          <li class="nav-item dropdown" v-if="authStore.isAuthenticated">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="profileDropdown" role="button"
              data-bs-toggle="dropdown">
              <img :src="getAvatarUrl(authStore.user)" alt="Avatar" class="rounded-circle" width="32" height="32">
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
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'
import { useProductsStore } from '../stores/products'

export default {
  name: 'Navbar',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const notificationsStore = useNotificationsStore()
    const productsStore = useProductsStore()

    // Productos del usuario (solo vendedores)
    const userProducts = computed(() => {
      return productsStore.userProducts(authStore.user?.id_institucional) || []
    })

    // Verificación si el usuario tiene productos
    const hasProducts = computed(() => {
      return userProducts.value.length > 0
    })

    // Notificaciones recientes (últimas 5 no leídas)
    const recentNotifications = computed(() => {
      return notificationsStore.recentNotifications
    })

    // Contador de no leídas
    const unreadCount = computed(() => {
      return notificationsStore.unreadCount
    })

    const loadNotifications = async () => {
      if (authStore.isAuthenticated) {
        try {
          await notificationsStore.fetchNotifications()
        } catch (error) {
          console.error('Error al cargar notificaciones:', error)
        }
      }
    }


    const handleNotificationClick = async (notification) => {
      try {
        await notificationsStore.markAsRead(notification.id)
        router.push('/notifications')
      } catch (error) {
        console.error('Error al marcar notificación:', error)
      }
    }

    const logout = async () => {
      notificationsStore.stopPolling()
      authStore.logout()
      router.push('/login')
    }

    const getNotificationIcon = (type) => {
      const icons = {
        info: 'fas fa-info-circle text-info',
        success: 'fas fa-check-circle text-success',
        warning: 'fas fa-exclamation-triangle text-warning',
        danger: 'fas fa-exclamation-circle text-danger'
      }
      return icons[type] || icons.info
    }

    const truncate = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    const getAvatarUrl = (user) => {
      if (user?.avatar_url) return user.avatar_url
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'Usuario')}&background=8B0000&color=fff&size=128`
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 7) {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        })
      } else if (days > 0) {
        return `Hace ${days} día${days > 1 ? 's' : ''}`
      } else if (hours > 0) {
        return `Hace ${hours}h`
      } else if (minutes > 0) {
        return `Hace ${minutes}m`
      } else {
        return 'Ahora'
      }
    }

    onMounted(async () => {
      authStore.initAuth()
      if (authStore.isAuthenticated) {
        await loadNotifications()
        await productsStore.fetchProducts()
        // Iniciar polling cada 30 segundos
        notificationsStore.startPolling(30000)
      }
    })

    onUnmounted(() => {
      notificationsStore.stopPolling()
    })

    return {
      authStore,
      notificationsStore,
      userProducts,
      hasProducts,
      recentNotifications,
      unreadCount,
      logout,
      loadNotifications,
      handleNotificationClick,
      getNotificationIcon,
      truncate,
      formatDate,
      getAvatarUrl
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

/* Dropdown de notificaciones */
.notifications-dropdown {
  min-width: 350px;
  max-width: 400px;
  max-height: 500px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-badge {
  font-size: 0.65rem;
  padding: 0.25em 0.5em;
}

.notification-item {
  transition: background-color 0.2s ease;
  border-left: 3px solid transparent;
}

.notification-item.unread {
  background-color: #f0f7ff;
  border-left-color: #0d6efd;
}

.notification-item:hover {
  background-color: #e9ecef;
}

.notification-content {
  max-width: 280px;
}

.notification-title {
  font-size: 0.9rem;
  line-height: 1.3;
  margin-bottom: 0.25rem !important;
}

.notification-message {
  font-size: 0.8rem;
  line-height: 1.3;
  margin-bottom: 0.25rem !important;
}

.notification-time {
  font-size: 0.75rem;
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

  .notifications-dropdown {
    min-width: 300px;
    max-width: 90vw;
  }

  .notification-content {
    max-width: 220px;
  }

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

/* Scrollbar personalizado para el dropdown */
.notifications-dropdown::-webkit-scrollbar {
  width: 6px;
}

.notifications-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.notifications-dropdown::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.notifications-dropdown::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
