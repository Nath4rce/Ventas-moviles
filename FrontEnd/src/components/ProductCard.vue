<template>
  <div class="product-card" :class="{ 'list-view': viewMode === 'list' }">
    <div class="card h-100 shadow-sm border-0">
      <!-- Imágenes del producto -->
      <div class="product-images position-relative">
        <div 
          id="carousel-{{ product.id }}" 
          class="carousel slide" 
          data-bs-ride="carousel"
        >
          <div class="carousel-inner">
            <div 
              v-for="(image, index) in product.images" 
              :key="index"
              class="carousel-item"
              :class="{ active: index === 0 }"
            >
              <ImageWithFallback 
                :src="image" 
                :alt="product.title"
                img-class="d-block w-100 product-image"
                :width="300"
                :height="200"
                fallback-text="Imagen no disponible"
              />
            </div>
          </div>
          
          <!-- Controles del carrusel -->
          <button 
            v-if="product.images.length > 1"
            class="carousel-control-prev" 
            type="button" 
            :data-bs-target="`#carousel-${product.id}`" 
            data-bs-slide="prev"
          >
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
          </button>
          <button 
            v-if="product.images.length > 1"
            class="carousel-control-next" 
            type="button" 
            :data-bs-target="`#carousel-${product.id}`" 
            data-bs-slide="next"
          >
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Siguiente</span>
          </button>
        </div>

        <!-- Indicadores de imágenes -->
        <div 
          v-if="product.images.length > 1" 
          class="carousel-indicators"
        >
          <button 
            v-for="(image, index) in product.images" 
            :key="index"
            type="button" 
            :data-bs-target="`#carousel-${product.id}`" 
            :data-bs-slide-to="index"
            :class="{ active: index === 0 }"
            aria-current="true"
            :aria-label="`Imagen ${index + 1}`"
          ></button>
        </div>

        <!-- Badge de categoría -->
        <div class="position-absolute top-0 start-0 m-2">
          <span class="badge bg-primary">
            <i :class="getCategoryIcon(product.category)" class="me-1"></i>
            {{ getCategoryName(product.category) }}
          </span>
        </div>

        <!-- Badge de rating -->
        <div class="position-absolute top-0 end-0 m-2">
          <span class="badge bg-warning text-dark">
            <i class="fas fa-star me-1"></i>
            {{ product.rating }}
          </span>
        </div>
      </div>

      <!-- Contenido del producto -->
      <div class="card-body d-flex flex-column">
        <!-- Título y vendedor -->
        <div class="mb-2">
          <h5 class="card-title fw-bold text-truncate" :title="product.title">
            {{ product.title }}
          </h5>
          <p class="text-muted small mb-0">
            <i class="fas fa-user me-1"></i>
            {{ product.sellerName }}
          </p>
        </div>

        <!-- Descripción -->
        <p class="card-text text-muted small flex-grow-1">
          {{ truncateDescription(product.description) }}
        </p>

        <!-- Rating y reseñas -->
        <div class="rating-section mb-3">
          <div class="d-flex align-items-center mb-1">
            <div class="stars me-2">
              <i 
                v-for="star in 5" 
                :key="star"
                class="fas fa-star"
                :class="star <= Math.round(product.rating) ? 'text-warning' : 'text-muted'"
              ></i>
            </div>
            <span class="text-muted small">
              ({{ product.reviewCount }} reseña{{ product.reviewCount !== 1 ? 's' : '' }})
            </span>
          </div>
        </div>

        <!-- Precio y acciones -->
        <div class="d-flex justify-content-between align-items-center">
          <div class="price-section">
            <span class="h4 text-primary fw-bold mb-0">
              ${{ formatPrice(product.price) }}
            </span>
          </div>
          
          <div class="actions">
            <button 
              class="btn btn-primary btn-sm"
              @click="viewDetails"
            >
              <i class="fas fa-eye me-1"></i>
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ImageWithFallback from './ImageWithFallback.vue'

export default {
  name: 'ProductCard',
  components: {
    ImageWithFallback
  },
  props: {
    product: {
      type: Object,
      required: true
    },
    viewMode: {
      type: String,
      default: 'grid',
      validator: value => ['grid', 'list'].includes(value)
    }
  },
  emits: ['view-details'],
  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()
    const getCategoryIcon = (category) => {
      const icons = {
        alimentos: 'fas fa-utensils',
        accesorios: 'fas fa-laptop',
        papeleria: 'fas fa-pen'
      }
      return icons[category] || 'fas fa-box'
    }

    const getCategoryName = (category) => {
      const names = {
        alimentos: 'Alimentos',
        accesorios: 'Accesorios',
        papeleria: 'Papelería'
      }
      return names[category] || 'Otros'
    }

    const truncateDescription = (description) => {
      const maxLength = props.viewMode === 'list' ? 100 : 80
      return description.length > maxLength 
        ? description.substring(0, maxLength) + '...'
        : description
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX').format(price)
    }

    const viewDetails = () => {
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }
      emit('view-details', props.product.id)
    }


    return {
      getCategoryIcon,
      getCategoryName,
      truncateDescription,
      formatPrice,
      viewDetails
    }
  }
}
</script>

<style scoped>
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.product-images {
  height: 200px;
  overflow: hidden;
  border-radius: 10px 10px 0 0;
}

.product-image {
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.carousel-indicators {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
}

.carousel-indicators button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 2px;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
}

.carousel-indicators button.active {
  background-color: white;
}

.carousel-control-prev,
.carousel-control-next {
  width: 30px;
  height: 30px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

.carousel-control-prev {
  left: 10px;
}

.carousel-control-next {
  right: 10px;
}

.stars i {
  font-size: 0.9rem;
}

.price-section .h4 {
  font-size: 1.5rem;
}

/* Vista de lista */
.product-card.list-view .card {
  flex-direction: row;
}

.product-card.list-view .product-images {
  width: 200px;
  height: 150px;
  border-radius: 10px 0 0 10px;
  flex-shrink: 0;
}

.product-card.list-view .product-image {
  height: 150px;
}

.product-card.list-view .card-body {
  padding: 1.5rem;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .product-images {
    height: 180px;
  }
  
  .product-image {
    height: 180px;
  }
  
  .product-card.list-view .product-images {
    width: 120px;
    height: 120px;
  }
  
  .product-card.list-view .product-image {
    height: 120px;
  }
  
  .product-card.list-view .card-body {
    padding: 1rem;
  }
  
  .price-section .h4 {
    font-size: 1.25rem;
  }
  
  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1199px) {
  .product-images {
    height: 220px;
  }
  
  .product-image {
    height: 220px;
  }
}
</style>
