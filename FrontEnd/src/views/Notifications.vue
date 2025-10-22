<template>
  <div class="notifications-page">
    <div class="container py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">
          <i class="fas fa-bell me-2"></i>
          Notificaciones
        </h2>
        <button 
          v-if="unreadCount > 0" 
          @click="markAllAsReadHandler"
          class="btn btn-outline-primary"
          :disabled="loading"
        >
          <i class="fas fa-check-double me-2"></i>
          Marcar todas como leídas
        </button>
      </div>

      <!-- Alerta de éxito/error -->
      <div v-if="alertMessage" :class="`alert alert-${alertType} alert-dismissible fade show`" role="alert">
        {{ alertMessage }}
        <button type="button" class="btn-close" @click="alertMessage = ''"></button>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold">Filtrar por estado</label>
              <select v-model="filter" @change="loadNotifications" class="form-select">
                <option value="all">Todas</option>
                <option value="unread">No leídas</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Filtrar por tipo</label>
              <select v-model="typeFilter" class="form-select">
                <option value="all">Todos los tipos</option>
                <option value="info">Información</option>
                <option value="success">Éxito</option>
                <option value="warning">Advertencia</option>
                <option value="danger">Importante</option>
              </select>
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button @click="loadNotifications" class="btn btn-primary w-100" :disabled="loading">
                <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': loading }"></i>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading && notifications.length === 0" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3">Cargando notificaciones...</p>
      </div>

      <!-- Lista de notificaciones -->
      <div v-else-if="filteredNotifications.length > 0" class="notifications-list">
        <div 
          v-for="notification in filteredNotifications" 
          :key="notification.id"
          class="notification-card mb-3"
          :class="[
            `notification-${notification.tipo}`,
            { 'notification-unread': !notification.is_read }
          ]"
          @click="markAsReadHandler(notification)"
        >
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <!-- Icono y título -->
                  <div class="d-flex align-items-center mb-2">
                    <i 
                      :class="getNotificationIcon(notification.tipo)" 
                      class="me-2 fs-5"
                    ></i>
                    <h5 class="mb-0 me-2">{{ notification.titulo }}</h5>
                    <span 
                      v-if="!notification.is_read" 
                      class="badge bg-primary"
                    >
                      Nueva
                    </span>
                    <span 
                      v-if="notification.prioridad > 1" 
                      class="badge bg-danger ms-2"
                    >
                      <i class="fas fa-exclamation-circle me-1"></i>
                      Importante
                    </span>
                  </div>

                  <!-- Mensaje -->
                  <p class="mb-2">{{ notification.mensaje }}</p>

                  <!-- Metadata -->
                  <div class="d-flex gap-3 text-muted small">
                    <span>
                      <i class="far fa-clock me-1"></i>
                      {{ formatDate(notification.created_at) }}
                    </span>
                    <span v-if="notification.destinatario_tipo !== 'all'">
                      <i class="fas fa-users me-1"></i>
                      {{ getRecipientType(notification.destinatario_tipo) }}
                    </span>
                  </div>
                </div>

                <!-- Botón de marcar como leída -->
                <button 
                  v-if="!notification.is_read"
                  @click.stop="markAsReadHandler(notification)"
                  class="btn btn-sm btn-outline-primary"
                  title="Marcar como leída"
                >
                  <i class="fas fa-check"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-5">
        <i class="fas fa-bell-slash fa-4x text-muted mb-3"></i>
        <h4>No hay notificaciones</h4>
        <p class="text-muted">
          {{ filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No se encontraron notificaciones con los filtros aplicados' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '../stores/notifications'

const notificationsStore = useNotificationsStore()

const filter = ref('all')
const typeFilter = ref('all')
const loading = ref(false)
const alertMessage = ref('')
const alertType = ref('success')

const notifications = computed(() => notificationsStore.sortedNotifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  // Filtrar por tipo
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(n => n.tipo === typeFilter.value)
  }

  return filtered
})

const showAlert = (message, type = 'success') => {
  alertMessage.value = message
  alertType.value = type
  setTimeout(() => {
    alertMessage.value = ''
  }, 3000)
}

const loadNotifications = async () => {
  loading.value = true
  try {
    await notificationsStore.fetchNotifications(filter.value === 'unread')
  } catch (error) {
    showAlert('Error al cargar notificaciones', 'danger')
  } finally {
    loading.value = false
  }
}

const markAsReadHandler = async (notification) => {
  if (notification.is_read) return
  
  try {
    await notificationsStore.markAsRead(notification.id)
  } catch (error) {
    showAlert('Error al marcar notificación como leída', 'danger')
  }
}

const markAllAsReadHandler = async () => {
  try {
    await notificationsStore.markAllAsRead()
    showAlert('Todas las notificaciones marcadas como leídas', 'success')
  } catch (error) {
    showAlert('Error al marcar todas como leídas', 'danger')
  }
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

const getRecipientType = (type) => {
  const types = {
    all: 'Todos',
    sellers: 'Vendedores',
    buyers: 'Compradores',
    id_institucional_especifico: 'Específico'
  }
  return types[type] || type
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } else if (days > 0) {
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  } else if (minutes > 0) {
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  } else {
    return 'Justo ahora'
  }
}

onMounted(() => {
  loadNotifications()
  // Polling cada 30 segundos
  notificationsStore.startPolling()
})

onUnmounted(() => {
  notificationsStore.stopPolling()
})
</script>

<style scoped>
.notifications-page {
  min-height: calc(100vh - 200px);
  background-color: #f8f9fa;
}

.notification-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.notification-unread {
  border-left: 4px solid #0d6efd;
}

.notification-unread .card {
  background-color: #f0f7ff;
}

.notification-info { border-left-color: #0dcaf0; }
.notification-success { border-left-color: #198754; }
.notification-warning { border-left-color: #ffc107; }
.notification-danger { border-left-color: #dc3545; }
</style>
