<template>
  <nav class="navbar navbar-expand-lg navbar-dark sticky-top custom-navbar">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/landing">
        <i class="fas fa-graduation-cap me-2"></i>
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
          <!-- Enlace para vendedores -->
          <li class="nav-item" v-if="authStore.isSeller">
            <router-link class="nav-link" to="/publish">
              <i class="fas fa-plus me-1"></i>
              Publicar
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
              class="nav-link position-relative" 
              href="#" 
              id="notificationsDropdown" 
              role="button" 
              data-bs-toggle="dropdown"
            >
              <i class="fas fa-bell"></i>
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
              {{ authStore.user?.name }}
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

export default {
  name: 'Navbar',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const notificationsStore = useNotificationsStore()

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
      }
    })

    return {
      authStore,
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

/* Mobile optimizations */
@media (max-width: 767px) {
  .navbar-brand {
    font-size: 1.2rem;
  }
  .dropdown-menu {
    min-width: 250px;
  }
}
</style>
