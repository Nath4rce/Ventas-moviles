<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section custom-hero text-white py-5 mb-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-3">
              <i class="fas fa-shopping-cart me-3"></i>
              Bienvenido a Antojitos UPB
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
                <input
                  type="text"
                  class="form-control"
                  v-model="searchQuery"
                  placeholder="Buscar por título o descripción..."
                  @input="handleSearch"
                >
              </div>

              <!-- Filtro por categoría -->
              <div class="col-12 col-md-6 col-lg-3">
                <label class="form-label fw-semibold">
                  <i class="fas fa-tags me-2"></i>
                  Categoría
                </label>
                <select 
                  class="form-select" 
                  v-model="filters.category"
                  @change="applyFilters"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="papeleria">Papelería</option>
                </select>
              </div>

              <!-- Filtro por precio -->
              <div class="col-12 col-md-6 col-lg-3">
                <label class="form-label fw-semibold">
                  <i class="fas fa-dollar-sign me-2"></i>
                  Precio Máximo
                </label>
                <select 
                  class="form-select" 
                  v-model="filters.priceRange.max"
                  @change="applyFilters"
                >
                  <option :value="50000">Sin límite</option>
                  <option :value="100">$100</option>
                  <option :value="500">$500</option>
                  <option :value="1000">$1,000</option>
                  <option :value="5000">$5,000</option>
                  <option :value="10000">$10,000</option>
                </select>
              </div>

              <!-- Ordenar por -->
              <div class="col-12 col-md-6 col-lg-2">
                <label class="form-label fw-semibold">
                  <i class="fas fa-sort me-2"></i>
                  Ordenar
                </label>
                <select 
                  class="form-select" 
                  v-model="filters.sortBy"
                  @change="applyFilters"
                >
                  <option value="rating">Mejor Calificados</option>
                  <option value="price">Menor Precio</option>
                  <option value="date">Más Recientes</option>
                </select>
              </div>
            </div>

            <!-- Botón de limpiar filtros -->
            <div class="row mt-3">
              <div class="col-12">
                <button 
                  class="btn btn-outline-secondary btn-sm"
                  @click="clearFilters"
                >
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
                <span class="badge bg-primary ms-2">{{ filteredProducts.length }}</span>
              </h4>
              <div class="d-flex gap-2">
                <!-- Botón de vista -->
                <div class="btn-group" role="group">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary"
                    :class="{ active: viewMode === 'grid' }"
                    @click="viewMode = 'grid'"
                  >
                    <i class="fas fa-th"></i>
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary"
                    :class="{ active: viewMode === 'list' }"
                    @click="viewMode = 'list'"
                  >
                    <i class="fas fa-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de productos -->
        <div v-if="filteredProducts.length === 0" class="text-center py-5">
          <i class="fas fa-search text-muted mb-3" style="font-size: 3rem;"></i>
          <h5 class="text-muted">No se encontraron productos</h5>
          <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
        </div>

        <div v-else class="row g-4">
          <div 
            v-for="product in paginatedProducts" 
            :key="product.id"
            :class="viewMode === 'grid' ? 'col-12 col-sm-6 col-lg-4' : 'col-12'"
          >
            <ProductCard 
              :product="product" 
              :view-mode="viewMode"
              @view-details="viewProductDetails"
            />
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="row mt-4">
          <div class="col-12">
            <nav aria-label="Paginación de productos">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button 
                    class="page-link" 
                    @click="changePage(currentPage - 1)"
                    :disabled="currentPage === 1"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button 
                    class="page-link" 
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                </li>
                
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button 
                    class="page-link" 
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
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
    const currentPage = ref(1)
    const itemsPerPage = 9

    const filters = ref({
      category: 'all',
      priceRange: { min: 0, max: 50000 },
      sortBy: 'rating'
    })

    // Productos filtrados
    const filteredProducts = computed(() => {
      let products = productsStore.filteredProducts

      // Aplicar búsqueda por texto
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        products = products.filter(product => 
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        )
      }

      return products
    })

    // Productos paginados
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredProducts.value.slice(start, end)
    })

    // Paginación
    const totalPages = computed(() => 
      Math.ceil(filteredProducts.value.length / itemsPerPage)
    )

    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // Métodos
    const handleSearch = () => {
      currentPage.value = 1
    }

    const applyFilters = () => {
      productsStore.updateFilters(filters.value)
      currentPage.value = 1
    }

    const clearFilters = () => {
      searchQuery.value = ''
      filters.value = {
        category: 'all',
        priceRange: { min: 0, max: 50000 },
        sortBy: 'rating'
      }
      productsStore.updateFilters(filters.value)
      currentPage.value = 1
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    const viewProductDetails = (productId) => {
      router.push(`/product/${productId}`)
    }

    // Watchers
    watch(searchQuery, () => {
      currentPage.value = 1
    })

    onMounted(() => {
      // Aplicar filtros iniciales
      productsStore.updateFilters(filters.value)
    })

    return {
      searchQuery,
      viewMode,
      currentPage,
      filters,
      filteredProducts,
      paginatedProducts,
      totalPages,
      visiblePages,
      handleSearch,
      applyFilters,
      clearFilters,
      changePage,
      viewProductDetails
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

.form-control, .form-select {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(139, 0, 0, 0.25);
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
