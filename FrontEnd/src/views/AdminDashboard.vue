<template>
  <div class="admin-dashboard">
    <div class="container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="fw-bold mb-1">
                <i class="fas fa-cog me-2"></i>
                Panel de Administración
              </h2>
              <p class="text-muted mb-0">Gestiona el marketplace de Antojitos UPB</p>
            </div>
            <div class="d-flex gap-2">
              <button 
                class="btn btn-warning"
                @click="toggleSiteStatus"
                :disabled="loading"
              >
                <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
                <i v-else :class="isSiteDisabled ? 'fas fa-play' : 'fas fa-pause'"></i>
                {{ isSiteDisabled ? 'Habilitar Sitio' : 'Deshabilitar Sitio' }}
              </button>
              <router-link to="/landing" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left me-2"></i>
                Volver
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado del sitio -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="alert" :class="isSiteDisabled ? 'alert-danger' : 'alert-success'">
            <i :class="isSiteDisabled ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'" class="me-2"></i>
            <strong>Estado del Sitio:</strong> 
            {{ isSiteDisabled ? 'Deshabilitado temporalmente' : 'Operativo' }}
          </div>
        </div>
      </div>

      <!-- Estadísticas generales -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card custom-card-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="fw-bold">{{ stats.totalUsers }}</h4>
                  <p class="mb-0">Usuarios Registrados</p>
                </div>
                <i class="fas fa-users fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card custom-card-accent text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="fw-bold">{{ stats.totalProducts }}</h4>
                  <p class="mb-0">Productos Activos</p>
                </div>
                <i class="fas fa-box fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="fw-bold">{{ stats.totalReviews }}</h4>
                  <p class="mb-0">Reseñas Totales</p>
                </div>
                <i class="fas fa-star fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card bg-warning text-dark">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="fw-bold">{{ stats.totalNotifications }}</h4>
                  <p class="mb-0">Notificaciones</p>
                </div>
                <i class="fas fa-bell fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="row g-4">
        <!-- Gestión de usuarios -->
        <div class="col-12 col-lg-6">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-users me-2"></i>
                Gestión de Usuarios
              </h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <img 
                            :src="user.avatar" 
                            :alt="user.name"
                            class="rounded-circle me-2"
                            width="30"
                            height="30"
                          >
                          <div>
                            <div class="fw-semibold">{{ user.name }}</div>
                            <small class="text-muted">{{ user.studentId }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge" :class="getRoleBadgeClass(user.role)">
                          {{ getRoleName(user.role) }}
                        </span>
                      </td>
                      <td>
                        <span class="badge bg-success">Activo</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Productos recientes -->
        <div class="col-12 col-lg-6">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-box me-2"></i>
                Productos Recientes
              </h5>
            </div>
            <div class="card-body">
              <div v-if="recentProducts.length === 0" class="text-center py-3">
                <i class="fas fa-box text-muted mb-2" style="font-size: 2rem;"></i>
                <p class="text-muted mb-0">No hay productos</p>
              </div>
              <div v-else>
                <div 
                  v-for="product in recentProducts" 
                  :key="product.id"
                  class="d-flex align-items-center mb-3 p-2 border rounded"
                >
                  <img 
                    :src="product.images[0]" 
                    :alt="product.title"
                    class="rounded me-3"
                    width="50"
                    height="50"
                    style="object-fit: cover;"
                  >
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-semibold">{{ product.title }}</h6>
                    <small class="text-muted">
                      {{ product.sellerName }} • ${{ formatPrice(product.price) }}
                    </small>
                  </div>
                  <div class="text-end">
                    <span class="badge bg-primary">{{ getCategoryName(product.category) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Envío de notificaciones -->
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-bell me-2"></i>
                Enviar Notificación
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="sendNotification">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label for="notificationTitle" class="form-label fw-semibold">Título</label>
                    <input
                      type="text"
                      class="form-control"
                      id="notificationTitle"
                      v-model="notificationForm.title"
                      placeholder="Título de la notificación"
                      required
                    >
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="notificationType" class="form-label fw-semibold">Tipo</label>
                    <select 
                      class="form-select" 
                      id="notificationType"
                      v-model="notificationForm.type"
                      required
                    >
                      <option value="info">Información</option>
                      <option value="success">Éxito</option>
                      <option value="warning">Advertencia</option>
                      <option value="danger">Importante</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label for="notificationMessage" class="form-label fw-semibold">Mensaje</label>
                    <textarea
                      class="form-control"
                      id="notificationMessage"
                      v-model="notificationForm.message"
                      rows="3"
                      placeholder="Escribe tu mensaje aquí..."
                      required
                    ></textarea>
                  </div>
                  <div class="col-12">
                    <div class="d-flex gap-2">
                      <button 
                        type="submit" 
                        class="btn btn-primary"
                        :disabled="sendingNotification"
                      >
                        <i v-if="sendingNotification" class="fas fa-spinner fa-spin me-2"></i>
                        <i v-else class="fas fa-paper-plane me-2"></i>
                        {{ sendingNotification ? 'Enviando...' : 'Enviar a Todos' }}
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary"
                        @click="resetNotificationForm"
                      >
                        <i class="fas fa-undo me-2"></i>
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useProductsStore } from '../stores/products'
import { useNotificationsStore } from '../stores/notifications'

export default {
  name: 'AdminDashboard',
  setup() {
    const authStore = useAuthStore()
    const productsStore = useProductsStore()
    const notificationsStore = useNotificationsStore()

    const loading = ref(false)
    const sendingNotification = ref(false)

    const notificationForm = reactive({
      title: '',
      message: '',
      type: 'info'
    })

    // Estadísticas
    const stats = computed(() => ({
      totalUsers: authStore.users.length,
      totalProducts: productsStore.products.filter(p => p.isActive).length,
      totalReviews: productsStore.reviews.length,
      totalNotifications: notificationsStore.notifications.length
    }))

    // Usuarios
    const users = computed(() => authStore.users)

    // Productos recientes
    const recentProducts = computed(() => 
      productsStore.products
        .filter(p => p.isActive)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    )

    // Estado del sitio
    const isSiteDisabled = computed(() => notificationsStore.isSiteDisabled)

    const getRoleName = (role) => {
      const names = {
        admin: 'Administrador',
        seller: 'Vendedor',
        buyer: 'Comprador'
      }
      return names[role] || 'Usuario'
    }

    const getRoleBadgeClass = (role) => {
      const classes = {
        admin: 'bg-danger',
        seller: 'bg-warning text-dark',
        buyer: 'bg-primary'
      }
      return classes[role] || 'bg-secondary'
    }

    const getCategoryName = (category) => {
      const names = {
        alimentos: 'Alimentos',
        accesorios: 'Accesorios',
        papeleria: 'Papelería'
      }
      return names[category] || 'Otros'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX').format(price)
    }

    const toggleSiteStatus = async () => {
      loading.value = true
      try {
        notificationsStore.toggleSiteStatus()
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      } finally {
        loading.value = false
      }
    }

    const sendNotification = async () => {
      sendingNotification.value = true
      try {
        notificationsStore.broadcastNotification(
          notificationForm.title,
          notificationForm.message,
          notificationForm.type
        )
        resetNotificationForm()
        alert('Notificación enviada exitosamente')
      } catch (error) {
        alert('Error al enviar la notificación')
      } finally {
        sendingNotification.value = false
      }
    }

    const resetNotificationForm = () => {
      notificationForm.title = ''
      notificationForm.message = ''
      notificationForm.type = 'info'
    }

    onMounted(() => {
      // Inicializar autenticación si hay datos guardados
      authStore.initAuth()
    })

    return {
      loading,
      sendingNotification,
      notificationForm,
      stats,
      users,
      recentProducts,
      isSiteDisabled,
      getRoleName,
      getRoleBadgeClass,
      getCategoryName,
      formatPrice,
      toggleSiteStatus,
      sendNotification,
      resetNotificationForm
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  border-bottom: 1px solid #e9ecef;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75rem;
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
  .admin-dashboard {
    padding: 1rem 0;
  }
  
  .d-flex.gap-2 {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .card-body {
    padding: 1rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1199px) {
  .admin-dashboard {
    padding: 1.5rem 0;
  }
}
</style>
