<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section custom-hero text-white py-5 mb-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-3">
              <i class="fas fa-shopping-cart me-3"></i>
              Bienvenido a Ventas Moviles UPB
            </h1>
            <p class="lead mb-4">
              El marketplace interno de la universidad.
              Compra y vende productos de manera segura entre estudiantes.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge bg-light text-primary fs-6 px-3 py-2">
                <i class="fas fa-shield-alt me-1"></i>
                Seguro
              </span>
              <span class="badge bg-light text-primary fs-6 px-3 py-2">
                <i class="fas fa-users me-1"></i>
                Solo Estudiantes
              </span>
              <span class="badge bg-light text-primary fs-6 px-3 py-2">
                <i class="fas fa-star me-1"></i>
                Calidad Garantizada
              </span>
            </div>
          </div>
          <div class="col-lg-6 text-center">
            <i class="fas fa-graduation-cap" style="font-size: 8rem; opacity: 0.3;"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- Filtros y Búsqueda -->
    <section class="filters-section mb-4">
      <div class="container">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="row g-3">
              <!-- Búsqueda -->
              <div class="col-12 col-md-6 col-lg-4">
                <label class="form-label fw-semibold">
                  <i class="fas fa-search me-2"></i>
                  Buscar Productos
                </label>
                <input type="text" class="form-control" v-model="searchQuery"
                  placeholder="Buscar por título o descripción..." @input="searchProducts">
              </div>

              <!-- Filtro por categoría -->
              <div class="col-12 col-md-6 col-lg-3">
                <label class="form-label fw-semibold">
                  <i class="fas fa-tags me-2"></i>
                  Categoría
                </label>
                <select class="form-select" v-model="filters.category" @change="applyFilters">
                  <option value="all">Todas las categorías</option>
                  <option v-for="cat in productsStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.nombre }}
                  </option>
                </select>
              </div>

              <!-- Filtro por precio -->
              <div class="col-12 col-md-6 col-lg-3 price-filter">
                <label class="form-label fw-semibold">
                  <i class="fas fa-dollar-sign me-2"></i>
                  Rango de Precio
                </label>
                <div class="row g-2">
                  <div class="col-6">
                    <input type="number" class="form-control form-control-sm" v-model.number="filters.priceRange.min"
                      placeholder="Mín" min="0" @change="applyFilters">
                  </div>
                  <div class="col-6">
                    <input type="number" class="form-control form-control-sm" v-model.number="filters.priceRange.max"
                      placeholder="Máx" min="0" @change="applyFilters">
                  </div>
                </div>
                <small class="text-muted">Deja vacío para sin límite</small>
              </div>

              <!-- Ordenar por -->
              <div class="col-12 col-md-6 col-lg-2">
                <label class="form-label fw-semibold">
                  <i class="fas fa-sort me-2"></i>
                  Ordenar
                </label>
                <select class="form-select" v-model="filters.sortBy" @change="applyFilters">
                  <option value="rating">Mejor Calificados</option>
                  <option value="price">Menor Precio</option>
                  <option value="date">Más Recientes</option>
                </select>
              </div>
            </div>

            <!-- Botón de limpiar filtros -->
            <div class="row mt-3">
              <div class="col-12">
                <button class="btn btn-outline-secondary btn-sm" @click="clearFilters">
                  <i class="fas fa-times me-1"></i>
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Productos -->
    <section class="products-section">
      <div class="container">
        <!-- Contador de resultados -->
        <div class="row mb-3">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="mb-0">
                <i class="fas fa-box me-2"></i>
                Productos Disponibles
                <span class="badge bg-primary ms-2">{{ displayedProducts.length }}</span>
              </h4>
              <div class="d-flex gap-2">
                <!-- Botón de vista -->
                <div class="btn-group" role="group">
                  <button type="button" class="btn btn-outline-secondary" :class="{ active: viewMode === 'grid' }"
                    @click="viewMode = 'grid'">
                    <i class="fas fa-th"></i>
                  </button>
                  <button type="button" class="btn btn-outline-secondary" :class="{ active: viewMode === 'list' }"
                    @click="viewMode = 'list'">
                    <i class="fas fa-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="productsStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <!-- Sin productos -->
        <div v-else-if="displayedProducts.length === 0" class="text-center py-5">
          <i class="fas fa-search text-muted mb-3" style="font-size: 3rem;"></i>
          <h5 class="text-muted">No se encontraron productos</h5>
          <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
          <button @click="clearFilters" class="btn btn-primary mt-2">
            <i class="fas fa-times me-1"></i>
            Limpiar Filtros
          </button>
        </div>

        <!-- Lista de productos -->
        <div v-else class="row g-4">
          <div v-for="product in displayedProducts" :key="product.id"
            :class="viewMode === 'grid' ? 'col-12 col-sm-6 col-lg-4' : 'col-12'">
            <ProductCard :product="product" :view-mode="viewMode" @view-details="viewProductDetails" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'Landing',
  components: {
    ProductCard
  },
  setup() {
  const router = useRouter()
  const productsStore = useProductsStore()

  const searchQuery = ref('')
  const viewMode = ref('grid')

  const filters = ref({
    category: 'all',
    priceRange: { min: null, max: null },
    sortBy: 'rating'
  })

  // Usar productos directamente del store
  const displayedProducts = computed(() => {
    let products = productsStore.products || []

    // Filtro local solo para búsqueda en tiempo real
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      products = products.filter(product =>
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
    }

    return products
  })

  // Aplicar filtros llamando al backend
  const applyFilters = async () => {
    const params = {}
    
    if (filters.value.category !== 'all') {
      params.categoria_id = filters.value.category
    }
    
    if (filters.value.priceRange.min) {
      params.precio_min = filters.value.priceRange.min
    }
    
    if (filters.value.priceRange.max) {
      params.precio_max = filters.value.priceRange.max
    }

    if (filters.value.sortBy) {
      params.sort_by = filters.value.sortBy === 'rating' ? 'rating_promedio' : 
                       filters.value.sortBy === 'price' ? 'precio' : 'created_at'
      params.sort_order = 'DESC'
    }

    await productsStore.fetchProducts(params)
  }

  // Búsqueda con debounce
  const searchProducts = async () => {
    if (searchQuery.value.trim().length > 2) {
      await productsStore.fetchProducts({ search: searchQuery.value })
    } else if (searchQuery.value.trim().length === 0) {
      await productsStore.fetchProducts()
    }
  }

  const viewProductDetails = (productId) => {
    router.push(`/product/${productId}`)
  }

  const clearFilters = async () => {
    filters.value = {
      category: 'all',
      priceRange: { min: null, max: null },
      sortBy: 'rating'
    }
    searchQuery.value = ''
    await productsStore.fetchProducts()
  }

  onMounted(async () => {
    await productsStore.fetchCategories()
    await productsStore.fetchProducts()
  })

  return {
    searchQuery,
    viewMode,
    filters,
    displayedProducts,
    productsStore,
    applyFilters,
    searchProducts,
    viewProductDetails,
    clearFilters
  }
}
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #8B0000 0%, #6b0000 100%);
}

.filters-section .card {
  border: none;
  border-radius: 15px;
}

.form-control,
.form-select {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(139, 0, 0, 0.25);
}

/* Price filter specific styles */
.price-filter .form-control-sm {
  font-size: 0.875rem;
  padding: 0.375rem 0.5rem;
}

.price-filter .text-muted {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.btn-outline-primary.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.pagination .page-link {
  color: var(--primary-color);
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.pagination .page-link:hover {
  color: #6b0000;
  background-color: #f8f9fa;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .hero-section .lead {
    font-size: 1rem;
  }

  .filters-section .card-body {
    padding: 1rem;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1199px) {
  .hero-section h1 {
    font-size: 2.5rem;
  }
}
</style>
