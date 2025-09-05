<template>
  <div class="notifications-page">
    <div class="container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="fw-bold mb-1">
                <i class="fas fa-bell me-2"></i>
                Notificaciones
              </h2>
              <p class="text-muted mb-0">Mantente al día con las últimas novedades</p>
            </div>
            <div class="d-flex gap-2">
              <button 
                class="btn btn-outline-primary btn-sm"
                @click="markAllAsRead"
                :disabled="unreadCount === 0"
              >
                <i class="fas fa-check-double me-1"></i>
                Marcar Todas como Leídas
              </button>
              <router-link to="/landing" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left me-2"></i>
                Volver
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12 col-md-6 col-lg-4">
                  <label class="form-label fw-semibold">Filtrar por tipo</label>
                  <select 
                    class="form-select" 
                    v-model="filterType"
                    @change="applyFilters"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="info">Información</option>
                    <option value="success">Éxito</option>
                    <option value="warning">Advertencia</option>
                    <option value="danger">Importante</option>
                  </select>
                </div>
                <div class="col-12 col-md-6 col-lg-4">
                  <label class="form-label fw-semibold">Estado</label>
                  <select 
                    class="form-select" 
                    v-model="filterStatus"
                    @change="applyFilters"
                  >
                    <option value="all">Todas</option>
                    <option value="unread">No leídas</option>
                    <option value="read">Leídas</option>
                  </select>
                </div>
                <div class="col-12 col-md-6 col-lg-4">
                  <label class="form-label fw-semibold">Ordenar por</label>
                  <select 
                    class="form-select" 
                    v-model="sortBy"
                    @change="applyFilters"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="oldest">Más antiguas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contador de notificaciones -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fas fa-list me-2"></i>
              Notificaciones
              <span class="badge bg-primary ms-2">{{ filteredNotifications.length }}</span>
            </h5>
            <div v-if="unreadCount > 0" class="text-muted">
              <i class="fas fa-circle text-primary me-1"></i>
              {{ unreadCount }} sin leer
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de notificaciones -->
      <div class="row">
        <div class="col-12">
          <div v-if="filteredNotifications.length === 0" class="text-center py-5">
            <i class="fas fa-bell-slash text-muted mb-3" style="font-size: 3rem;"></i>
            <h5 class="text-muted">No hay notificaciones</h5>
            <p class="text-muted">No se encontraron notificaciones con los filtros aplicados</p>
          </div>

          <div v-else class="notifications-list">
            <div 
              v-for="notification in filteredNotifications" 
              :key="notification.id"
              class="notification-item"
              :class="{ 
                'unread': !notification.isRead,
                'read': notification.isRead 
              }"
              @click="markAsRead(notification.id)"
            >
              <div class="card mb-3">
                <div class="card-body">
                  <div class="d-flex align-items-start">
                    <!-- Icono de tipo -->
                    <div class="notification-icon me-3">
                      <i 
                        class="fas fa-2x"
                        :class="getNotificationIcon(notification.type)"
                        :style="{ color: getNotificationColor(notification.type) }"
                      ></i>
                    </div>

                    <!-- Contenido -->
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="notification-title mb-0 fw-bold">
                          {{ notification.title }}
                        </h6>
                        <div class="d-flex align-items-center gap-2">
                          <!-- Badge de estado -->
                          <span 
                            v-if="!notification.isRead" 
                            class="badge bg-primary"
                          >
                            Nuevo
                          </span>
                          <!-- Fecha -->
                          <small class="text-muted">
                            {{ formatDate(notification.createdAt) }}
                          </small>
                        </div>
                      </div>
                      
                      <p class="notification-message text-muted mb-0">
                        {{ notification.message }}
                      </p>
                    </div>

                    <!-- Indicador de no leída -->
                    <div v-if="!notification.isRead" class="unread-indicator">
                      <i class="fas fa-circle text-primary"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'

export default {
  name: 'Notifications',
  setup() {
    const authStore = useAuthStore()
    const notificationsStore = useNotificationsStore()

    const filterType = ref('all')
    const filterStatus = ref('all')
    const sortBy = ref('newest')

    // Notificaciones filtradas
    const filteredNotifications = computed(() => {
      let notifications = notificationsStore.userNotifications(authStore.user?.id)

      // Filtrar por tipo
      if (filterType.value !== 'all') {
        notifications = notifications.filter(n => n.type === filterType.value)
      }

      // Filtrar por estado
      if (filterStatus.value === 'unread') {
        notifications = notifications.filter(n => !n.isRead)
      } else if (filterStatus.value === 'read') {
        notifications = notifications.filter(n => n.isRead)
      }

      // Ordenar
      if (sortBy.value === 'newest') {
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      } else {
        notifications.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      }

      return notifications
    })

    // Contador de no leídas
    const unreadCount = computed(() => 
      notificationsStore.unreadCount(authStore.user?.id)
    )

    const getNotificationIcon = (type) => {
      const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        danger: 'fa-exclamation-circle'
      }
      return icons[type] || 'fa-bell'
    }

    const getNotificationColor = (type) => {
      const colors = {
        info: '#17a2b8',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545'
      }
      return colors[type] || '#6c757d'
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        return 'Ayer'
      } else if (diffDays < 7) {
        return `Hace ${diffDays} días`
      } else {
        return date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      }
    }

    const markAsRead = (notificationId) => {
      notificationsStore.markAsRead(notificationId)
    }

    const markAllAsRead = () => {
      notificationsStore.markAllAsRead(authStore.user?.id)
    }

    const applyFilters = () => {
      // Los filtros se aplican automáticamente por computed
    }

    onMounted(() => {
      // Inicializar autenticación si hay datos guardados
      authStore.initAuth()
    })

    return {
      filterType,
      filterStatus,
      sortBy,
      filteredNotifications,
      unreadCount,
      getNotificationIcon,
      getNotificationColor,
      formatDate,
      markAsRead,
      markAllAsRead,
      applyFilters
    }
  }
}
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.notification-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:hover {
  transform: translateY(-2px);
}

.notification-item .card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.notification-item.unread .card {
  border-left: 4px solid var(--primary-color);
  background-color: #f8f9ff;
}

.notification-item.read .card {
  opacity: 0.8;
}

.notification-icon {
  flex-shrink: 0;
}

.notification-title {
  color: #333;
}

.notification-message {
  line-height: 1.5;
}

.unread-indicator {
  flex-shrink: 0;
  margin-left: 1rem;
}

.badge {
  font-size: 0.7rem;
}

.form-control, .form-select {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(139, 0, 0, 0.25);
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .notifications-page {
    padding: 1rem 0;
  }
  
  .d-flex.gap-2 {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .notification-item .card-body {
    padding: 1rem;
  }
  
  .notification-icon i {
    font-size: 1.5rem !important;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .d-flex.align-items-center.gap-2 {
    margin-top: 0.5rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1199px) {
  .notifications-page {
    padding: 1.5rem 0;
  }
  
  .notification-item .card-body {
    padding: 1.25rem;
  }
}
</style>
