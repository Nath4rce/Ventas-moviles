<template>
  <div class="profile-page">
    <div class="container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="fw-bold mb-1">
                <i class="fas fa-user me-2"></i>
                Mi Perfil
              </h2>
              <p class="text-muted mb-0">Gestiona tu información personal y actividad</p>
            </div>
            <router-link to="/landing" class="btn btn-outline-secondary">
              <i class="fas fa-arrow-left me-2"></i>
              Volver
            </router-link>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Información del usuario -->
        <div class="col-12 col-lg-4">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="fas fa-user-circle me-2"></i>
                Información Personal
              </h5>
            </div>
            <div class="card-body text-center">
              <!-- Avatar -->
              <div class="mb-3">
                <img :src="user?.avatar" :alt="user?.name" class="rounded-circle border border-3 border-primary"
                  width="120" height="120" style="object-fit: cover;">
              </div>

              <!-- Información básica -->
              <h4 class="fw-bold mb-1">{{ user?.name }}</h4>
              <p class="text-muted mb-2">{{ user?.idInstitucional }}</p>
              <p class="text-muted mb-3">{{ user?.email }}</p>

              <!-- Rol -->
              <span class="badge fs-6 px-3 py-2" :class="getRoleBadgeClass(user?.rol)">
                <i :class="getRoleIcon(user?.rol)" class="me-1"></i>
                {{ getRoleName(user?.rol) }}
              </span>

              <!-- Estadísticas del usuario -->
              <div class="row g-2 mt-4">
                <div class="col-6">
                  <div class="stat-item">
                    <div class="stat-number">{{ userStats.productsCount }}</div>
                    <div class="stat-label">Productos</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="stat-item">
                    <div class="stat-number">{{ userStats.reviewsCount }}</div>
                    <div class="stat-label">Reseñas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="card mt-4">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-bolt me-2"></i>
                Acciones Rápidas
              </h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <router-link v-if="authStore.isSeller" to="/publish" class="btn btn-primary">
                  <i class="fas fa-plus me-2"></i>
                  Publicar Producto
                </router-link>

                <router-link v-if="authStore.isAdmin" to="/admin" class="btn btn-warning">
                  <i class="fas fa-cog me-2"></i>
                  Panel de Admin
                </router-link>

                <router-link to="/notifications" class="btn btn-outline-primary">
                  <i class="fas fa-bell me-2"></i>
                  Notificaciones
                  <span v-if="unreadNotifications > 0" class="badge bg-danger ms-2">
                    {{ unreadNotifications }}
                  </span>
                </router-link>
              </div>
            </div>
          </div>
        </div>

      <!-- Contenido principal -->
        <div class="col-12 col-lg-8">
          <!-- Mis productos (solo vendedores) -->
          <div v-if="authStore.isSeller" class="card mb-4">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-box me-2"></i>
                Mis Productos
              </h5>
            </div>
            <div class="card-body">
              <div v-if="userProducts.length === 0" class="text-center py-4">
                <i class="fas fa-box text-muted mb-3" style="font-size: 2rem;"></i>
                <p class="text-muted mb-3">No tienes productos publicados</p>
                <router-link to="/publish" class="btn btn-primary">
                  <i class="fas fa-plus me-2"></i>
                  Publicar mi Primer Producto
                </router-link>
              </div>
              <div v-else>
                <div v-for="product in userProducts" :key="product.id"
                  class="product-item d-flex align-items-center mb-3 p-3 border rounded">
                  <img :src="product.images[0]" :alt="product.title" class="rounded me-3" width="60" height="60"
                    style="object-fit: cover;">
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-semibold">{{ product.title }}</h6>
                    <p class="text-muted mb-1 small">{{ product.description.substring(0, 80) }}...</p>
                    <div class="d-flex align-items-center gap-3">
                      <span class="text-primary fw-bold">${{ formatPrice(product.price) }}</span>
                      <span class="badge" :class="product.isActive ? 'bg-success' : 'bg-secondary'">
                        {{ product.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                      <div class="rating">
                        <i class="fas fa-star text-warning me-1"></i>
                        <span class="text-muted small">{{ product.rating }} ({{ product.reviewCount }})</span>
                      </div>
                    </div>
                  </div>
                  <div class="actions d-flex gap-2">
                    <router-link :to="`/edit-product/${product.id}`" class="btn btn-sm btn-outline-secondary">
                      <i class="fas fa-edit"></i>
                    </router-link>
                    <router-link :to="`/product/${product.id}`" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-eye"></i>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mis reseñas -->
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-star me-2"></i>
                Mis Reseñas
              </h5>
            </div>
            <div class="card-body">
              <div v-if="myReviews.length === 0" class="text-center py-4">
                <i class="fas fa-star text-muted mb-3" style="font-size: 2rem;"></i>
                <p class="text-muted">No has dejado reseñas aún</p>
              </div>
              <div v-else>
                <div v-for="review in myReviews" :key="review.id" class="review-item border-bottom pb-3 mb-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 class="mb-1 fw-semibold">{{ getProductTitle(review.productId) }}</h6>
                      <div class="stars">
                        <i v-for="star in 5" :key="star" class="fas fa-star"
                          :class="star <= review.rating ? 'text-warning' : 'text-muted'"></i>
                      </div>
                    </div>
                    <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                  </div>
                  <p class="text-muted mb-0">{{ review.comment }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Configuración de cuenta -->
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-cog me-2"></i>
                Configuración de Cuenta
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12">
                  <div class="d-flex justify-content-between align-items-center p-3 border rounded">
                    <div>
                      <h6 class="mb-1">Cambiar Contraseña</h6>
                      <p class="text-muted mb-0 small">Actualiza tu contraseña de seguridad</p>
                    </div>
                    <button class="btn btn-outline-primary btn-sm">
                      <i class="fas fa-key me-1"></i>
                      Cambiar
                    </button>
                  </div>
                </div>
                <div class="col-12">
                  <div class="d-flex justify-content-between align-items-center p-3 border rounded">
                    <div>
                      <h6 class="mb-1">Notificaciones</h6>
                      <p class="text-muted mb-0 small">Gestiona tus preferencias de notificación</p>
                    </div>
                    <router-link to="/notifications" class="btn btn-outline-primary btn-sm">
                      <i class="fas fa-bell me-1"></i>
                      Configurar
                    </router-link>
                  </div>
                </div>
                <div class="col-12">
                  <div class="d-flex justify-content-between align-items-center p-3 border rounded">
                    <div>
                      <h6 class="mb-1 text-danger">Cerrar Sesión</h6>
                      <p class="text-muted mb-0 small">Salir de tu cuenta de forma segura</p>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" @click="logout">
                      <i class="fas fa-sign-out-alt me-1"></i>
                      Cerrar Sesión
                    </button>
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProductsStore } from '../stores/products'
import { useNotificationsStore } from '../stores/notifications'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const productsStore = useProductsStore()
    const notificationsStore = useNotificationsStore()

    const user = computed(() => authStore.user)

    // Productos del usuario (solo vendedores)
    const userProducts = computed(() => {
      return productsStore.userProducts(authStore.user?.id_institucional) || []
    })

    // Reseñas del usuario
    const myReviews = computed(() =>
      productsStore.reviews.filter(review =>
        review.userId === authStore.user?.id
      )
    )

    // Estadísticas del usuario
    const userStats = computed(() => ({
      productsCount: userProducts.value.length,
      reviewsCount: myReviews.value.length
    }))

    // Notificaciones no leídas
    const unreadNotifications = computed(() =>
      notificationsStore.unreadCount(authStore.user?.id)
    )


    const getRoleName = (rol) => {
      const names = {
        admin: 'Administrador',
        seller: 'Vendedor',
        buyer: 'Comprador'
      }
      return names[rol] || 'Usuario'
    }

    const getRoleIcon = (rol) => {
      const icons = {
        admin: 'fas fa-crown',
        seller: 'fas fa-store',
        buyer: 'fas fa-shopping-cart'
      }
      return icons[rol] || 'fas fa-user'
    }

    const getRoleBadgeClass = (rol) => {
      const classes = {
        admin: 'bg-danger',
        seller: 'bg-warning text-dark',
        buyer: 'bg-primary'
      }
      return classes[rol] || 'bg-secondary'
    }

    const getProductTitle = (productId) => {
      const product = productsStore.getProductById(productId)
      return product?.title || 'Producto eliminado'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX').format(price)
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Cierre de sesión con pantalla de carga
    const logout = async () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        authStore.logout()
        router.push('/login')
      }
    }

    onMounted(async () => {
      authStore.initAuth()
      //console.log('👤 Usuario actual:', authStore.user)
      //console.log('🔑 Usuario ID:', authStore.user?.id)
      if (authStore.isAuthenticated) {
        await productsStore.fetchProducts()
        //console.log('📦 Productos en store:', productsStore.products)
        //console.log('🛒 Productos del usuario:', userProducts.value)
      }
    })

    return {
      user,
      userProducts,
      myReviews,
      userStats,
      unreadNotifications,
      authStore,
      getRoleName,
      getRoleIcon,
      getRoleBadgeClass,
      getProductTitle,
      formatPrice,
      formatDate,
      logout
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  border-bottom: 1px solid #e9ecef;
}

.stat-item {
  text-align: center;
  padding: 0.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-item {
  transition: all 0.3s ease;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.review-item:last-child {
  border-bottom: none !important;
}

.stars i {
  font-size: 0.9rem;
}

.badge {
  font-size: 0.75rem;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .profile-page {
    padding: 1rem 0;
  }

  .d-flex.gap-2 {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .product-item {
    flex-direction: column;
    text-align: center;
  }

  .product-item .actions {
    margin-top: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
  }
  .d-flex.align-items-center.gap-3 {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.5rem !important;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1199px) {
  .profile-page {
    padding: 1.5rem 0;
  }
  .product-item {
    flex-direction: row;
  }
}
</style>
