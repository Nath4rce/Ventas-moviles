<template>
  <div class="product-detail-page">
    <div class="container">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/landing" class="text-decoration-none">
              <i class="fas fa-home me-1"></i>
              Inicio
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ product?.title }}
          </li>
        </ol>
      </nav>

      <!-- Producto no encontrado -->
      <div v-if="!product" class="text-center py-5">
        <i class="fas fa-exclamation-triangle text-warning mb-3" style="font-size: 3rem;"></i>
        <h4>Producto no encontrado</h4>
        <p class="text-muted">El producto que buscas no existe o ha sido eliminado.</p>
        <router-link to="/landing" class="btn btn-primary">
          <i class="fas fa-arrow-left me-2"></i>
          Volver al Inicio
        </router-link>
      </div>

      <!-- Detalle del producto -->
      <div v-else class="row g-4">
        <!-- Galería de imágenes -->
        <div class="col-12 col-lg-6">
          <div class="product-gallery">
            <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-inner">
                <div v-for="(image, index) in product.images" :key="index" class="carousel-item"
                  :class="{ active: index === 0 }">
                  <img :src="image" :alt="product.title" class="d-block w-100 main-image" @error="handleImageError">
                </div>
              </div>

              <!-- Controles del carrusel -->
              <button v-if="product.images.length > 1" class="carousel-control-prev" type="button"
                data-bs-target="#productCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Anterior</span>
              </button>
              <button v-if="product.images.length > 1" class="carousel-control-next" type="button"
                data-bs-target="#productCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Siguiente</span>
              </button>
            </div>

            <!-- Miniaturas -->
            <div v-if="product.images.length > 1" class="thumbnails mt-3">
              <div class="row g-2">
                <div v-for="(image, index) in product.images" :key="index" class="col-3">
                  <img :src="image" :alt="`Imagen ${index + 1}`" class="img-thumbnail thumbnail"
                    :class="{ active: index === 0 }" data-bs-target="#productCarousel" :data-bs-slide-to="index"
                    @error="handleImageError">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del producto -->
        <div class="col-12 col-lg-6">
          <div class="product-info">
            <!-- Categoría y rating -->
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="badge bg-primary fs-6 px-3 py-2">
                <i :class="`fas ${product.categoryIcon}`" class="me-1"></i>
                {{ product.category }}
              </span>
              <div class="rating-display">
                <div class="stars">
                  <i v-for="star in 5" :key="star" class="fas fa-star"
                    :class="star <= Math.round(product.rating) ? 'text-warning' : 'text-muted'"></i>
                </div>
                <span class="ms-2 text-muted">
                  {{ product.rating }} ({{ product.reviewCount }} reseñas)
                </span>
              </div>
            </div>

            <!-- Título -->
            <h1 class="product-title mb-3">{{ product.title }}</h1>

            <!-- Vendedor -->
            <div class="seller-info mb-3">
              <p class="text-muted mb-1">
                <i class="fas fa-user me-2"></i>
                Vendido por: <strong>{{ product.sellerName }}</strong>
              </p>
              <p v-if="product.sellerPhone" class="text-muted mb-1">
                <i class="fab fa-whatsapp me-2"></i>
                WhatsApp:
                <a :href="whatsappLink" target="_blank" rel="noopener noreferrer">
                  <strong>{{ product.sellerPhone }}</strong>
                </a>
              </p>

            </div>

            <!-- Precio -->
            <div class="price-section mb-4">
              <span class="display-4 text-primary fw-bold">
                ${{ formatPrice(product.price) }}
              </span>
            </div>

            <!-- Descripción -->
            <div class="description-section mb-4">
              <h5 class="fw-bold mb-3">
                <i class="fas fa-info-circle me-2"></i>
                Descripción
              </h5>
              <p class="text-muted">{{ product.description }}</p>
            </div>

            <!-- Acciones -->
            <div class="actions-section">
              <div class="d-grid gap-2 d-md-flex">
                <!-- Botón de WhatsApp reemplazando Comprar ahora -->
                <a v-if="product.sellerPhone" :href="whatsappLink" target="_blank" rel="noopener noreferrer"
                  class="btn btn-success btn-lg flex-fill">
                  <i class="fab fa-whatsapp me-2"></i>
                  Comprar por WhatsApp
                </a>
                <button v-else class="btn btn-secondary btn-lg flex-fill" disabled>
                  <i class="fas fa-ban me-2"></i>
                  WhatsApp no disponible
                </button>

                <button class="btn btn-outline-primary btn-lg">
                  <i class="fas fa-heart me-2"></i>
                  Favorito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de reseñas -->
      <div class="reviews-section mt-5">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-light">
                <h4 class="mb-0">
                  <i class="fas fa-star me-2"></i>
                  Reseñas del Producto
                </h4>
              </div>
              <div class="card-body">
                <!-- Formulario de nueva reseña (solo si NO tiene reseña) -->
                <div v-if="canLeaveReview && !userHasReview" class="new-review-form mb-4">
                  <h5 class="fw-bold mb-3">Deja tu reseña</h5>
                  <form @submit.prevent="submitReview">
                    <div class="mb-3">
                      <label class="form-label fw-semibold">Calificación</label>
                      <div class="rating-input">
                        <i v-for="star in 5" :key="star" class="fas fa-star star-input"
                          :class="star <= newReview.rating ? 'text-warning' : 'text-muted'"
                          @click="newReview.rating = star" @mouseenter="hoveredStar = star"
                          @mouseleave="hoveredStar = 0"></i>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="reviewComment" class="form-label fw-semibold">Comentario</label>
                      <textarea id="reviewComment" class="form-control" v-model="newReview.comment" rows="4"
                        placeholder="Comparte tu experiencia con este producto..." required></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary" :disabled="submittingReview || userHasReview">
                      <i v-if="submittingReview" class="fas fa-spinner fa-spin me-2"></i>
                      <i v-else class="fas fa-paper-plane me-2"></i>
                      {{ submittingReview ? 'Enviando...' : 'Enviar Reseña' }}
                    </button>
                  </form>
                </div>

                <!-- Mensaje si ya tiene reseña -->
                <div v-else-if="!canLeaveReview && authStore.isAuthenticated && userHasReview"
                  class="alert alert-info mb-4">
                  <i class="fas fa-info-circle me-2"></i>
                  Ya has dejado una reseña para este producto. Puedes editarla o eliminarla desde abajo.
                </div>

                <!-- Lista de reseñas -->
                <div v-if="reviews.length === 0" class="text-center py-4">
                  <i class="fas fa-comments text-muted mb-3" style="font-size: 2rem;"></i>
                  <p class="text-muted">No hay reseñas para este producto aún.</p>
                </div>

                <div v-else class="reviews-list">
                  <div v-for="review in reviews" :key="review.id" class="review-item border-bottom py-3">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                          <h6 class="fw-bold mb-0">{{ review.userName }}</h6>
                          <span v-if="isReviewAuthor(review)" class="badge bg-primary ms-2">Tu reseña</span>
                        </div>
                        <div class="stars mb-2">
                          <i v-for="star in 5" :key="star" class="fas fa-star"
                            :class="star <= review.rating ? 'text-warning' : 'text-muted'"></i>
                        </div>

                        <!-- Mostrar comentario o formulario de edición -->
                        <div v-if="editingReviewId !== review.id">
                          <p class="text-muted mb-0">{{ review.comment }}</p>
                        </div>
                        <div v-else class="edit-review-form mt-2">
                          <div class="mb-2">
                            <label class="form-label small fw-semibold">Calificación</label>
                            <div class="rating-input">
                              <i v-for="star in 5" :key="star" class="fas fa-star star-input"
                                :class="star <= editForm.rating ? 'text-warning' : 'text-muted'"
                                @click="editForm.rating = star"></i>
                            </div>
                          </div>
                          <div class="mb-2">
                            <textarea class="form-control form-control-sm" v-model="editForm.comment" rows="3"
                              placeholder="Actualiza tu comentario..." required></textarea>
                          </div>
                          <div class="d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-primary" @click="saveEditReview"
                              :disabled="updatingReview">
                              <i v-if="updatingReview" class="fas fa-spinner fa-spin me-1"></i>
                              <i v-else class="fas fa-save me-1"></i>
                              {{ updatingReview ? 'Guardando...' : 'Guardar' }}
                            </button>
                            <button type="button" class="btn btn-sm btn-secondary" @click="cancelEdit"
                              :disabled="updatingReview">
                              <i class="fas fa-times me-1"></i>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="d-flex flex-column align-items-end">
                        <small class="text-muted mb-2">{{ formatDate(review.createdAt) }}</small>

                        <!-- Botones de editar/eliminar (solo para el autor) -->
                        <div v-if="isReviewAuthor(review)" class="btn-group btn-group-sm">
                          <button v-if="editingReviewId !== review.id" type="button" class="btn btn-outline-secondary"
                            @click="startEdit(review)" title="Editar reseña">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button type="button" class="btn btn-outline-danger" @click="confirmDeleteReview(review.id)"
                            title="Eliminar reseña" :disabled="editingReviewId === review.id">
                            <i class="fas fa-trash"></i>
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
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { Carousel } from 'bootstrap'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useAuthStore } from '../stores/auth'
import { useNotificacion } from '../utils/useNotificacion'
import Swal from 'sweetalert2'

export default {
  name: 'ProductDetail',
  setup() {
    const route = useRoute()
    const productsStore = useProductsStore()
    const authStore = useAuthStore()
    const notificacion = useNotificacion()

    const product = computed(() =>
      productsStore.getProductById(route.params.id)
    )

    const reviews = computed(() => productsStore.reviews)

    const canLeaveReview = computed(() =>
      authStore.isAuthenticated &&
      productsStore.canUserReview(route.params.id, authStore.user?.id)
    )

    const userHasReview = computed(() => {
      if (!authStore.isAuthenticated || !authStore.user) return false
      return reviews.value.some(review =>
        review.userInstitutionalId === authStore.user.id_institucional
      )
    })

    const editingReviewId = ref(null)
    const editForm = reactive({
      rating: 0,
      comment: ''
    })
    const updatingReview = ref(false)

    const newReview = reactive({
      rating: 0,
      comment: ''
    })

    const hoveredStar = ref(0)
    const submittingReview = ref(false)

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX').format(price)
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const goToSlide = (index) => {
      const carousel = document.getElementById('productCarousel')
      if (carousel) {
        const bsCarousel = new bootstrap.Carousel(carousel)
        bsCarousel.to(index)
      }
    }

    const handleImageError = (event) => {
      const fallbackSvg = `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
          <rect width="600" height="400" fill="#fef2f2"/>
          <rect x="100" y="100" width="400" height="200" fill="#dc2626" opacity="0.1" rx="20"/>
          <circle cx="240" cy="160" r="40" fill="#dc2626" opacity="0.3"/>
          <rect x="220" y="190" width="40" height="20" fill="#dc2626" opacity="0.3" rx="4"/>
          <text x="300" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#dc2626">
            Imagen no disponible
          </text>
        </svg>
      `)}`
      event.target.src = fallbackSvg
    }

    const whatsappLink = computed(() => {
      if (!product.value?.sellerPhone) return null
      const message = `Hola, estoy interesado en el producto: ${product.value.title} por $${formatPrice(product.value.price)}`
      return `https://wa.me/${product.value.sellerPhone}?text=${encodeURIComponent(message)}`
    })

    const submitReview = async () => {
      if (!newReview.rating || !newReview.comment.trim()) {
        notificacion.error('Por favor completa todos los campos')
        return
      }

      // Verificar nuevamente si puede dejar reseña (por si acaso)
      if (!canLeaveReview.value) {
        notificacion.error('Ya has dejado una reseña para este producto')
        return
      }

      submittingReview.value = true

      try {
        await axios.post(`${API_URL}/reviews`, {
          producto_id: parseInt(route.params.id),
          rating: newReview.rating,
          comentario: newReview.comment.trim()
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        // Recargar reseñas primero
        await productsStore.fetchProductReviews(route.params.id)

        // Luego recargar productos para actualizar el rating
        await productsStore.fetchProducts()

        // Limpiar formulario
        newReview.rating = 0
        newReview.comment = ''

        notificacion.success('Reseña enviada exitosamente')
      } catch (error) {
        console.error('Error al enviar reseña:', error)

        // Mostrar mensaje de error específico
        if (error.response?.status === 400) {
          notificacion.error(error.response.data.message || 'Ya has dejado una reseña para este producto')
        } else {
          notificacion.error('Error al enviar la reseña')
        }
      } finally {
        submittingReview.value = false
      }
    }

    // Verificar si el usuario es autor de una reseña
    const isReviewAuthor = (review) => {
      if (!authStore.isAuthenticated || !authStore.user) return false
      return review.userInstitutionalId === authStore.user.id_institucional
    }

    // Iniciar edición de reseña
    const startEdit = (review) => {
      editingReviewId.value = review.id
      editForm.rating = review.rating
      editForm.comment = review.comment
    }

    // Cancelar edición
    const cancelEdit = () => {
      editingReviewId.value = null
      editForm.rating = 0
      editForm.comment = ''
    }

    // Guardar edición de reseña
    const saveEditReview = async () => {
      if (!editForm.rating || !editForm.comment.trim()) {
        notificacion.error('Por favor completa todos los campos')
        return
      }

      updatingReview.value = true

      try {
        const response = await productsStore.updateReview(editingReviewId.value, {
          rating: editForm.rating,
          comentario: editForm.comment.trim()
        })

        if (response.success) {
          // Recargar reseñas
          await productsStore.fetchProductReviews(route.params.id)

          // También recargar el producto para actualizar el rating
          await productsStore.fetchProducts()

          notificacion.success('Reseña actualizada exitosamente')
          cancelEdit()
        }
      } catch (error) {
        notificacion.error(error.response?.data?.message || 'Error al actualizar la reseña')
      } finally {
        updatingReview.value = false
      }
    }

    // Confirmar eliminación de reseña
    // Confirmar eliminación de reseña
    const confirmDeleteReview = async (reviewId) => {
      const result = await Swal.fire({
        title: '¿Eliminar reseña?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        reverseButtons: true
      })

      if (!result.isConfirmed) return

      try {
        // ✅ Agregar headers con token
        await axios.delete(`${API_URL}/reviews/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        // Recargar reseñas
        await productsStore.fetchProductReviews(route.params.id)

        // También recargar el producto para actualizar el rating
        await productsStore.fetchProducts()

        await Swal.fire({
          title: '¡Eliminada!',
          text: 'Tu reseña ha sido eliminada',
          icon: 'success',
          confirmButtonColor: '#198754',
          timer: 1500,
          showConfirmButton: false
        })
      } catch (error) {
        console.error('Error al eliminar reseña:', error)
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar la reseña',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
      }
    }

    onMounted(async () => {
      authStore.initAuth()
      //await productsStore.fetchCategories()
      await productsStore.fetchProducts()
      await productsStore.fetchProductReviews(route.params.id)
    })

    return {
      product,
      reviews,
      canLeaveReview,
      newReview,
      hoveredStar,
      submittingReview,
      authStore,
      formatPrice,
      formatDate,
      goToSlide,
      handleImageError,
      submitReview,
      whatsappLink,
      editingReviewId,
      editForm,
      updatingReview,
      isReviewAuthor,
      startEdit,
      cancelEdit,
      saveEditReview,
      confirmDeleteReview,
      userHasReview
    }
  }
}
</script>

<style scoped>
.product-gallery {
  position: sticky;
  top: 20px;
}

.main-image {
  height: 400px;
  object-fit: cover;
  border-radius: 10px;
}

.thumbnail {
  height: 60px;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.thumbnail:hover,
.thumbnail.active {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.rating-display .stars i {
  font-size: 1.1rem;
}

.price-section .display-4 {
  font-size: 2.5rem;
}

.rating-input {
  display: flex;
  gap: 5px;
}

.star-input {
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star-input:hover {
  transform: scale(1.1);
}

.review-item:last-child {
  border-bottom: none !important;
}

.reviews-list .stars i {
  font-size: 0.9rem;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .main-image {
    height: 250px;
  }

  .thumbnail {
    height: 50px;
  }

  .price-section .display-4 {
    font-size: 2rem;
  }

  .product-gallery {
    position: static;
  }

  .rating-input .star-input {
    font-size: 1.2rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1199px) {
  .main-image {
    height: 350px;
  }

  .price-section .display-4 {
    font-size: 2.2rem;
  }
}

.edit-review-form {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.review-item {
  transition: background-color 0.2s ease;
}

.review-item:hover {
  background-color: #f8f9fa;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.rating-input .star-input {
  font-size: 1.2rem;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .review-item .d-flex {
    flex-direction: column;
  }

  .review-item .btn-group {
    margin-top: 0.5rem;
    align-self: flex-start;
  }

  .edit-review-form {
    padding: 0.75rem;
  }
}
</style>
