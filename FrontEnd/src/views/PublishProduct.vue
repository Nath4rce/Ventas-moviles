<template>
  <div class="publish-product-page">
    <div class="container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="fw-bold mb-1">
                <i class="fas fa-plus-circle me-2"></i>
                Publicar Producto
              </h2>
              <p class="text-muted mb-0">Comparte tus productos con la comunidad universitaria</p>
            </div>
            <router-link to="/landing" class="btn btn-outline-secondary">
              <i class="fas fa-arrow-left me-2"></i>
              Volver
            </router-link>
          </div>
        </div>
      </div>

      <!-- Información importante -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Importante:</strong> Como vendedor, solo puedes tener un producto activo a la vez.
            Si ya tienes un producto publicado, deberás desactivarlo antes de publicar uno nuevo.
          </div>
        </div>
      </div>

      <!-- Formulario de publicación -->
      <div class="row">
        <div class="col-12 col-lg-8">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="fas fa-edit me-2"></i>
                Información del Producto
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
                <!-- Título -->
                <div class="mb-4">
                  <label for="title" class="form-label fw-semibold">
                    <i class="fas fa-tag me-2"></i>
                    Título del Producto *
                  </label>
                  <input type="text" class="form-control" id="title" v-model="form.title"
                    placeholder="Ej: Laptop Gaming ASUS" required :class="{ 'is-invalid': errors.title }">
                  <div v-if="errors.title" class="invalid-feedback">
                    {{ errors.title }}
                  </div>
                </div>

                <!-- Categoría -->
                <div class="mb-4">
                  <label for="category" class="form-label fw-semibold">
                    <i class="fas fa-tags me-2"></i>
                    Categoría *
                  </label>
                  <select class="form-select" id="category" v-model="form.category" required
                    :class="{ 'is-invalid': errors.category }">
                    <option value="">Selecciona una categoría</option>
                    <option v-for="cat in productsStore.categories" :key="cat.id" :value="cat.id">
                      {{ cat.nombre }}
                    </option>
                  </select>
                  <div v-if="errors.category" class="invalid-feedback">
                    {{ errors.category }}
                  </div>
                </div>

                <!-- Precio -->
                <div class="mb-4">
                  <label for="price" class="form-label fw-semibold">
                    <i class="fas fa-dollar-sign me-2"></i>
                    Precio *
                  </label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control" id="price" v-model.number="form.price" placeholder="0"
                      min="0" step="0.01" required :class="{ 'is-invalid': errors.price }">
                  </div>
                  <div v-if="errors.price" class="invalid-feedback">
                    {{ errors.price }}
                  </div>
                </div>

                <!-- Descripción -->
                <div class="mb-4">
                  <label for="description" class="form-label fw-semibold">
                    <i class="fas fa-align-left me-2"></i>
                    Descripción *
                  </label>
                  <textarea class="form-control" id="description" v-model="form.description" rows="4"
                    placeholder="Describe tu producto en detalle..." required
                    :class="{ 'is-invalid': errors.description }"></textarea>
                  <div v-if="errors.description" class="invalid-feedback">
                    {{ errors.description }}
                  </div>
                  <div class="form-text">
                    Mínimo 20 caracteres. Sé específico sobre el estado, características y condiciones del producto.
                  </div>
                </div>

                <!-- Imágenes -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="fas fa-images me-2"></i>
                    Imágenes del Producto *
                  </label>
                  <div class="image-upload-area">
                    <div class="row g-3">
                      <div v-for="(image, index) in form.images" :key="index" class="col-6 col-md-3">
                        <div class="image-preview">
                          <img :src="image" :alt="`Imagen ${index + 1}`" class="img-thumbnail"
                            @error="handleImageError">
                          <button type="button" class="btn btn-sm btn-danger remove-image" @click="removeImage(index)">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>

                      <div v-if="form.images.length < 4" class="col-6 col-md-3">
                        <div class="image-upload-placeholder" @click="addImage">
                          <i class="fas fa-plus"></i>
                          <span>Agregar Imagen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="errors.images" class="invalid-feedback d-block">
                    {{ errors.images }}
                  </div>
                  <div class="form-text">
                    Puedes subir hasta 4 imágenes. La primera será la imagen principal.
                  </div>
                </div>

                <!-- Botones -->
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="submitting">
                    <i v-if="submitting" class="fas fa-spinner fa-spin me-2"></i>
                    <i v-else class="fas fa-paper-plane me-2"></i>
                    {{ submitting ? 'Publicando...' : 'Publicar Producto' }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" @click="resetForm">
                    <i class="fas fa-undo me-2"></i>
                    Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Panel lateral -->
        <div class="col-12 col-lg-4">
          <!-- Consejos -->
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-lightbulb me-2"></i>
                Consejos para Vender
              </h6>
            </div>
            <div class="card-body">
              <ul class="list-unstyled mb-0">
                <li class="mb-2">
                  <i class="fas fa-check text-success me-2"></i>
                  Toma fotos claras y desde diferentes ángulos
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-success me-2"></i>
                  Describe el estado real del producto
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-success me-2"></i>
                  Establece un precio justo y competitivo
                </li>
                <li class="mb-2">
                  <i class="fas fa-check text-success me-2"></i>
                  Responde rápidamente a los compradores
                </li>
                <li>
                  <i class="fas fa-check text-success me-2"></i>
                  Mantén tu producto actualizado
                </li>
              </ul>
            </div>
          </div>

          <!-- Producto actual -->
          <div v-if="currentProduct" class="card">
            <div class="card-header bg-warning text-dark">
              <h6 class="mb-0">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Producto Actual
              </h6>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-2">
                Ya tienes un producto activo. Debes desactivarlo para publicar uno nuevo.
              </p>
              <div class="d-flex gap-2">
                <button class="btn btn-warning btn-sm" @click="deactivateCurrentProduct">
                  <i class="fas fa-eye-slash me-1"></i>
                  Desactivar
                </button>
                <router-link :to="`/product/${currentProduct.id}`" class="btn btn-outline-primary btn-sm">
                  <i class="fas fa-eye me-1"></i>
                  Ver
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProductsStore } from '../stores/products'

export default {
  name: 'PublishProduct',
  setup() {
    const router = useRouter()
    const productsStore = useProductsStore()
    const authStore = useAuthStore()

    const form = reactive({
      title: '',
      category: '',
      price: 0,
      description: '',
      images: []
    })

    const errors = reactive({})
    const submitting = ref(false)

    // Verificar si ya tiene un producto activo
    const currentProduct = computed(() => {
      return productsStore.products.find(product =>
        product.sellerId === authStore.user?.id && product.isActive
      )
    })

    const validateForm = () => {
      // Limpiar errores anteriores
      Object.keys(errors).forEach(key => errors[key] = '')

      let isValid = true

      // Validar título
      if (!form.title.trim()) {
        errors.title = 'El título es requerido'
        isValid = false
      } else if (form.title.trim().length < 5) {
        errors.title = 'El título debe tener al menos 5 caracteres'
        isValid = false
      }

      // Validar categoría
      if (!form.category) {
        errors.category = 'La categoría es requerida'
        isValid = false
      }

      // Validar precio
      if (!form.price || form.price <= 0) {
        errors.price = 'El precio debe ser mayor a 0'
        isValid = false
      }

      // Validar descripción
      if (!form.description.trim()) {
        errors.description = 'La descripción es requerida'
        isValid = false
      } else if (form.description.trim().length < 20) {
        errors.description = 'La descripción debe tener al menos 20 caracteres'
        isValid = false
      }

      // Validar imágenes
      if (form.images.length === 0) {
        errors.images = 'Debes agregar al menos una imagen'
        isValid = false
      }

      return isValid
    }

    const addImage = () => {
      if (form.images.length < 4) {
        // En una implementación real, aquí se abriría un modal para subir imágenes
        // Por ahora, agregamos imágenes de placeholder
        const placeholderImages = [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center'
        ]

        form.images.push(placeholderImages[form.images.length])
      }
    }

    const removeImage = (index) => {
      form.images.splice(index, 1)
    }

    const handleImageError = (event) => {
      // Crear una imagen de fallback con SVG
      const fallbackSvg = `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
          <rect width="300" height="200" fill="#fef2f2"/>
          <rect x="50" y="50" width="200" height="100" fill="#dc2626" opacity="0.1" rx="10"/>
          <circle cx="120" cy="80" r="20" fill="#dc2626" opacity="0.3"/>
          <rect x="110" y="95" width="20" height="10" fill="#dc2626" opacity="0.3" rx="2"/>
          <text x="150" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#dc2626">
            Error al cargar
          </text>
        </svg>
      `)}`
      event.target.src = fallbackSvg
    }

    const resetForm = () => {
      form.title = ''
      form.category = ''
      form.price = 0
      form.description = ''
      form.images = []
      Object.keys(errors).forEach(key => errors[key] = '')
    }

    const deactivateCurrentProduct = () => {
      if (currentProduct.value) {
        currentProduct.value.isActive = false
        alert('Producto desactivado exitosamente')
      }
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      // Verificar si ya tiene un producto activo
      if (currentProduct.value) {
        alert('Ya tienes un producto activo. Debes desactivarlo primero.')
        return
      }

      submitting.value = true

      try {
        const productData = {
          title: form.title.trim(),
          category: form.category,
          price: form.price,
          description: form.description.trim(),
          images: form.images,
          sellerId: authStore.user.id,
          sellerName: authStore.user.name
        }

        const newProduct = productsStore.addProduct(productData)

        alert('Producto publicado exitosamente')
        router.push(`/product/${newProduct.id}`)
      } catch (error) {
        alert('Error al publicar el producto')
      } finally {
        submitting.value = false
      }
    }

    onMounted(async () => {
      authStore.initAuth()
      await productsStore.fetchCategories()
    })

    return {
      form,
      errors,
      submitting,
      currentProduct,
      addImage,
      removeImage,
      handleImageError,
      resetForm,
      deactivateCurrentProduct,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.image-upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.image-upload-area:hover {
  border-color: var(--primary-color);
  background-color: #f8f9fa;
}

.image-preview {
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-placeholder {
  width: 100%;
  height: 120px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
}

.image-upload-placeholder:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: #f8f9fa;
}

.image-upload-placeholder i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.image-upload-placeholder span {
  font-size: 0.8rem;
  font-weight: 500;
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

  .image-preview img,
  .image-upload-placeholder {
    height: 100px;
  }

  .d-flex.gap-2 {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
