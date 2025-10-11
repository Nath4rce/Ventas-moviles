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
              <p class="text-muted mb-0">Gestiona el marketplace de Ventas Moviles UPB</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-warning" @click="toggleSiteStatus" :disabled="loading">
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
                  <h4 class="fw-bold">{{ stats.total_usuarios_activos }}</h4>
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
                  <h4 class="fw-bold">{{ stats.total_productos_activos }}</h4>
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
                  <h4 class="fw-bold">{{ stats.total_resenas }}</h4>
                  <p class="mb-0">Reseñas Totales</p>
                </div>
                <i class="fas fa-star fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card bg-danger text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="fw-bold">{{ stats.total_productos_inactivos }}</h4>
                  <p class="mb-0">Productos Inactivos</p>
                </div>
                <i class="fas fa-ban fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="row g-4">
        <!-- Gestión de usuarios -->
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-users me-2"></i>
                  Gestión de Usuarios
                </h5>
                <button class="btn btn-primary btn-sm" @click="showCreateUserModal = true">
                  <i class="fas fa-user-plus me-1"></i>
                  Nuevo Usuario
                </button>
              </div>
            </div>
            <div class="card-body">
              <!-- Filtros de búsqueda -->
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Tipo de Usuario</label>
                  <select class="form-select" v-model="userFilters.rol" @change="applyUserFilters">
                    <option value="all">Todos los tipos</option>
                    <option value="admin">Administrador</option>
                    <option value="seller">Vendedor</option>
                    <option value="buyer">Estudiante</option>
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Estado</label>
                  <select class="form-select" v-model="userFilters.status" @change="applyUserFilters">
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>

              <!-- Tabla de usuarios -->
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>ID Institucional</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in filteredUsers" :key="user.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <img :src="user.avatar_url || '/default-avatar.png'" :alt="user.nombre"
                            class="rounded-circle me-2" width="30" height="30">
                          <div>
                            <div class="fw-semibold">{{ user.nombre }}</div>
                            <small class="text-muted">{{ user.email }}</small> <!-- ← CAMBIAR -->
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ user.id_institucional }}</span> <!-- ← CAMBIAR -->
                      </td>
                      <td>
                        <span class="badge" :class="getRoleBadgeClass(user.rol)">
                          {{ getRoleName(user.rol) }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" :class="user.is_active ? 'bg-success' : 'bg-danger'"> <!-- ← CAMBIAR -->
                          {{ user.is_active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm" rol="group">
                          <button class="btn btn-outline-warning" @click="toggleUserStatus(user.id)"
                            :title="user.isActive ? 'Desactivar' : 'Activar'">
                            <i :class="user.isActive ? 'fas fa-pause' : 'fas fa-play'"></i>
                          </button>
                          <button class="btn btn-outline-primary" @click="openChangeRoleModal(user)"
                            title="Cambiar rol">
                            <i class="fas fa-user-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de productos -->
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-box me-2"></i>
                  Gestión de Productos
                </h5>
              </div>
            </div>
            <div class="card-body">
              <!-- Filtros de búsqueda -->
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Buscar por título</label>
                  <input type="text" class="form-control" v-model="productFilters.title" placeholder="Ej: Calculadora"
                    @input="applyProductFilters">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Categoría</label>
                  <select class="form-select" v-model="productFilters.category" @change="applyProductFilters">
                    <option value="all">Todas las categorías</option>
                    <option value="alimentos">Alimentos</option>
                    <option value="accesorios">Accesorios</option>
                    <option value="papeleria">Papelería</option>
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Estado</label>
                  <select class="form-select" v-model="productFilters.status" @change="applyProductFilters">
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>

              <!-- Tabla de productos -->
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Vendedor</th>
                      <th>Precio</th>
                      <th>Rating</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in filteredProducts" :key="product.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <img :src="product.images[0]" :alt="product.title" class="rounded me-2" width="40" height="40"
                            style="object-fit: cover;">
                          <div>
                            <div class="fw-semibold">{{ product.title }}</div>
                            <small class="text-muted">{{ product.description.substring(0, 50) }}...</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ product.category }}</span>
                      </td>
                      <td>
                        <div class="fw-semibold">{{ product.sellerName }}</div>
                      </td>
                      <td>
                        <span class="fw-semibold">${{ formatPrice(product.price) }}</span>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <i class="fas fa-star text-warning me-1"></i>
                          <span class="fw-semibold">{{ product.rating }}</span>
                          <small class="text-muted ms-1">({{ product.reviewCount }})</small>
                        </div>
                      </td>
                      <td>
                        <span class="badge" :class="product.isActive ? 'bg-success' : 'bg-danger'">
                          {{ product.isActive ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm" rol="group">
                          <button class="btn btn-outline-warning" @click="toggleProductStatus(product.id)"
                            :title="product.isActive ? 'Desactivar' : 'Activar'">
                            <i :class="product.isActive ? 'fas fa-pause' : 'fas fa-play'"></i>
                          </button>
                        </div>
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
                <div v-for="product in recentProducts" :key="product.id"
                  class="d-flex align-items-center mb-3 p-2 border rounded">
                  <img :src="product.images[0]" :alt="product.title" class="rounded me-3" width="50" height="50"
                    style="object-fit: cover;">
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-semibold">{{ product.title }}</h6>
                    <small class="text-muted">
                      {{ product.sellerName }} • ${{ formatPrice(product.price) }}
                    </small>
                  </div>
                  <div class="text-end">
                    <span class="badge bg-primary">{{ product.category }}</span>
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
                    <input type="text" class="form-control" id="notificationTitle" v-model="notificationForm.title"
                      placeholder="Título de la notificación" required>
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="notificationType" class="form-label fw-semibold">Tipo</label>
                    <select class="form-select" id="notificationType" v-model="notificationForm.type" required>
                      <option value="info">Información</option>
                      <option value="success">Éxito</option>
                      <option value="warning">Advertencia</option>
                      <option value="danger">Importante</option>
                    </select>
                  </div>

                  <!-- Filtros de destinatarios -->
                  <div class="col-12 col-md-4">
                    <label class="form-label fw-semibold">Destinatarios</label>
                    <select class="form-select" v-model="notificationForm.recipients" @change="handleRecipientChange">
                      <option value="all">Todos los usuarios</option>
                      <option value="sellers">Solo vendedores</option>
                      <option value="students">Solo estudiantes</option>
                      <option value="idInstitucional ">ID Institucional específico</option>
                    </select>
                  </div>

                  <div v-if="notificationForm.recipients === 'idInstitucional '" class="col-12 col-md-4">
                    <label class="form-label fw-semibold">ID Institucional </label>
                    <input type="text" class="form-control" v-model="notificationForm.id_institucional"
                      placeholder="Ej: 000497849" maxlength="9">
                  </div>

                  <div class="col-12">
                    <label for="notificationMessage" class="form-label fw-semibold">Mensaje</label>
                    <textarea class="form-control" id="notificationMessage" v-model="notificationForm.message" rows="3"
                      placeholder="Escribe tu mensaje aquí..." required></textarea>
                  </div>
                  <div class="col-12">
                    <div class="d-flex gap-2">
                      <button type="submit" class="btn btn-primary" :disabled="sendingNotification">
                        <i v-if="sendingNotification" class="fas fa-spinner fa-spin me-2"></i>
                        <i v-else class="fas fa-paper-plane me-2"></i>
                        {{ sendingNotification ? 'Enviando...' : 'Enviar Notificación' }}
                      </button>
                      <button type="button" class="btn btn-outline-secondary" @click="resetNotificationForm">
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

      <!-- Modal para crear usuario -->
      <div v-if="showCreateUserModal" class="modal show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Crear Nuevo Usuario</h5>
              <button type="button" class="btn-close" @click="showCreateUserModal = false"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createUser">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-semibold">ID Estudiantil *</label>
                    <input type="text" class="form-control" v-model="newUser.idInstitucional" placeholder="Ej: 20210001"
                      required>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">Nombre Completo *</label>
                    <input type="text" class="form-control" v-model="newUser.nombre" placeholder="Nombre del usuario"
                      required>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-semibold">Email *</label>
                    <input type="email" class="form-control" v-model="newUser.email"
                      placeholder="usuario@universidad.edu" required>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-semibold">Rol *</label>
                    <select class="form-select" v-model="newUser.rol" required>
                      <option value="buyer">Estudiante</option>
                      <option value="seller">Vendedor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">Contraseña *</label>
                    <input type="password" class="form-control" v-model="newUser.password"
                      placeholder="Contraseña temporal" required>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="showCreateUserModal = false">Cancelar</button>
                  <button type="submit" class="btn btn-primary" :disabled="creatingUser">
                    <i v-if="creatingUser" class="fas fa-spinner fa-spin me-2"></i>
                    {{ creatingUser ? 'Creando...' : 'Crear Usuario' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para cambiar rol -->
      <div v-if="showChangeRoleModal" class="modal show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Cambiar Rol de Usuario</h5>
              <button type="button" class="btn-close" @click="showChangeRoleModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <strong>Usuario:</strong> {{ selectedUser?.nombre }} ({{ selectedUser?.idInstitucional }})
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Nuevo Rol</label>
                <select class="form-select" v-model="newRole">
                  <option value="buyer">Estudiante</option>
                  <option value="seller">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showChangeRoleModal = false">Cancelar</button>
              <button type="button" class="btn btn-primary" @click="changeUserRole" :disabled="changingRole">
                <i v-if="changingRole" class="fas fa-spinner fa-spin me-2"></i>
                {{ changingRole ? 'Cambiando...' : 'Cambiar Rol' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay para modales -->
      <div v-if="showCreateUserModal || showChangeRoleModal" class="modal-backdrop show"></div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useProductsStore } from '../stores/products'
import { useNotificationsStore } from '../stores/notifications'

import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

export default {
  nombre: 'AdminDashboard',
  setup() {
    const authStore = useAuthStore()
    const productsStore = useProductsStore()
    const notificationsStore = useNotificationsStore()

    const users = ref([])

    // Funciones para fetch
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/stats`)
        if (response.data.success) {
          stats.value = response.data.data
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    const fetchUsers = async () => {
      try {
        const params = new URLSearchParams()
        if (userFilters.value.rol !== 'all') params.append('rol', userFilters.value.rol)
        if (userFilters.value.status !== 'all') params.append('status', userFilters.value.status)
        if (userFilters.value.search) params.append('search', userFilters.value.search)

        console.log('🔍 Fetching users with params:', params.toString()) // ← AGREGAR
        const response = await axios.get(`${API_URL}/admin/users?${params}`)
        console.log('📥 Users response:', response.data) // ← AGREGAR

        if (response.data.success) {
          users.value = response.data.data.users
          console.log('👥 Users array:', users.value) // ← AGREGAR
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    const loading = ref(false)
    const sendingNotification = ref(false)
    const creatingUser = ref(false)
    const changingRole = ref(false)
    const showCreateUserModal = ref(false)
    const showChangeRoleModal = ref(false)
    const selectedUser = ref(null)
    const newRole = ref('buyer')

    const userFilters = ref({
      rol: 'all',
      status: 'all',
      search: ''
    })

    const productFilters = reactive({
      title: '',
      category: 'all',
      status: 'all'
    })

    const newUser = reactive({
      idInstitucional: '',
      nombre: '',
      email: '',
      rol: 'buyer',
      password: ''
    })

    const notificationForm = reactive({
      title: '',
      message: '',
      type: 'info',
      recipients: 'all',
      id_institucional: '',
      priority: 1,
      permanent: false
    })

    // Estadísticas
    const stats = ref({
      total_usuarios_activos: 0,
      total_vendedores: 0,
      total_compradores: 0,
      total_productos_activos: 0,
      total_resenas: 0,
      total_categorias: 0,
      total_productos_inactivos: 0,
    })

    const filteredUsers = computed(() => {
      console.log('🔄 Filtering users. Total:', users.value.length) // ← AGREGAR
      console.log('🔄 Filters:', userFilters.value) // ← AGREGAR
      /*let filtered = users.value


      // Filtrar por rol
      if (userFilters.rol !== 'all') {
        filtered = filtered.filter(u => u.rol === userFilters.role)
      }

      // Filtrar por estado
      if (userFilters.value.status !== 'all') {
        if (userFilters.value.status === 'active') {
          filtered = filtered.filter(u => u.is_active === 1 || u.is_active === true)
        } else {
          filtered = filtered.filter(u => u.is_active === 0 || u.is_active === false)
        }
      }
      console.log('✅ Filtered result:', filtered.length)
      return filtered*/
      return users.value 
    })

    // Productos filtrados
    const filteredProducts = computed(() => {
      let filtered = productsStore.products || []

      // Filtrar por título
      if (productFilters.title) {
        filtered = filtered.filter(product =>
          product.title.toLowerCase().includes(productFilters.title.toLowerCase())
        )
      }

      // Filtrar por categoría
      if (productFilters.category !== 'all') {
        filtered = filtered.filter(product => product.category === productFilters.category)
      }

      // Filtrar por estado
      if (productFilters.status !== 'all') {
        const isActive = productFilters.status === 'active'
        filtered = filtered.filter(product => product.isActive === isActive)
      }

      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })

    // Productos recientes
    const recentProducts = computed(() =>
      (productsStore.products || [])
        .filter(p => p.isActive)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    )

    // Estado del sitio
    const isSiteDisabled = computed(() => notificationsStore.isSiteDisabled)

    const getRoleName = (rol) => {
      const names = {
        admin: 'Administrador',
        seller: 'Vendedor',
        buyer: 'Comprador'
      }
      return names[rol] || 'Usuario'
    }

    const getRoleBadgeClass = (rol) => {
      const classes = {
        admin: 'bg-danger',
        seller: 'bg-warning text-dark',
        buyer: 'bg-primary'
      }
      return classes[rol] || 'bg-secondary'
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
      notificationForm.recipients = 'all'
      notificationForm.nrc = ''
    }

    // Funciones de gestión de usuarios
    const applyUserFilters = () => {
      // Los filtros se aplican automáticamente por computed
    }

    // Funciones de gestión de productos
    const applyProductFilters = () => {
      // Los filtros se aplican automáticamente por computed
    }

    const toggleProductStatus = (productId) => {
      const result = productsStore.toggleProductStatus(productId)
      if (result.success) {
        alert(`Producto ${result.product.isActive ? 'activado' : 'desactivado'} exitosamente`)
      } else {
        alert(result.message)
      }
    }

    const createUser = async () => {
      creatingUser.value = true
      try {
        const result = await authStore.createUser(newUser)
        if (result.success) {
          alert('Usuario creado exitosamente')
          showCreateUserModal.value = false
          resetNewUserForm()
        } else {
          alert(result.message)
        }
      } catch (error) {
        alert('Error al crear el usuario')
      } finally {
        creatingUser.value = false
      }
    }

    const resetNewUserForm = () => {
      newUser.idInstitucional = ''
      newUser.nombre = ''
      newUser.email = ''
      newUser.rol = 'buyer'
      newUser.password = ''
    }

    const toggleUserStatus = (userId) => {
      const result = authStore.toggleUserStatus(userId)
      if (result.success) {
        alert(`Usuario ${result.user.isActive ? 'activado' : 'desactivado'} exitosamente`)
      } else {
        alert(result.message)
      }
    }

    const openChangeRoleModal = (user) => {
      selectedUser.value = user
      newRole.value = user.rol
      showChangeRoleModal.value = true
    }

    const changeUserRole = async () => {
      changingRole.value = true
      try {
        const result = authStore.changeUserRole(selectedUser.value.id, newRole.value)
        if (result.success) {
          alert('Rol cambiado exitosamente')
          showChangeRoleModal.value = false
        } else {
          alert(result.message)
        }
      } catch (error) {
        alert('Error al cambiar el rol')
      } finally {
        changingRole.value = false
      }
    }

    const handleRecipientChange = () => {
      if (notificationForm.recipients !== 'nrc') {
        notificationForm.nrc = ''
      }
    }

    onMounted(async () => {
      // Inicializar autenticación si hay datos guardados
      authStore.initAuth()

      // Cargar usuarios
      /*const result = await authStore.searchUsers({})
      if (result.success) {
        users.value = result.users.map(u => ({
          id: u.id,
          idInstitucional: u.id_institucional,
          name: u.nombre,
          email: u.email,
          rol: u.rol,
          isActive: u.is_active
        }))
      }*/

      await productsStore.fetchProducts()
      await notificationsStore.fetchNotifications()
      await fetchStats()
      await fetchUsers()
    })

    return {
      stats,
      users,
      fetchStats,
      fetchUsers,
      loading,
      sendingNotification,
      creatingUser,
      changingRole,
      showCreateUserModal,
      showChangeRoleModal,
      selectedUser,
      newRole,
      userFilters,
      productFilters,
      newUser,
      notificationForm,
      stats,
      filteredUsers,
      filteredProducts,
      recentProducts,
      isSiteDisabled,
      getRoleName,
      getRoleBadgeClass,
      formatPrice,
      toggleSiteStatus,
      sendNotification,
      resetNotificationForm,
      applyUserFilters,
      applyProductFilters,
      toggleProductStatus,
      createUser,
      resetNewUserForm,
      toggleUserStatus,
      openChangeRoleModal,
      changeUserRole,
      handleRecipientChange
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

.form-control,
.form-select {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
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
