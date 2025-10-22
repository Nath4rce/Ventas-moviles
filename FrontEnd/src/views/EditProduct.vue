<template>
  <div class="edit-product-page">
    <div class="container">
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="fw-bold mb-1">
                <i class="fas fa-edit me-2"></i>
                Editar Producto
              </h2>
              <p class="text-muted mb-0">Actualiza la información de tu producto</p>
            </div>
            <router-link to="/profile" class="btn btn-outline-secondary">
              <i class="fas fa-arrow-left me-2"></i>
              Volver al Perfil
            </router-link>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="fas fa-box me-2"></i>
                Información del Producto
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
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

                <div class="mb-4">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="isActive" v-model="form.isActive">
                    <label class="form-check-label fw-semibold" for="isActive">
                      <i class="fas fa-eye me-2"></i>
                      Producto visible (activo)
                    </label>
                  </div>
                  <div class="form-text">
                    Si está desactivado, el producto no aparecerá en las búsquedas.
                  </div>
                </div>

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
                        <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*" class="d-none">

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

                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="submitting || deleting">
                    <i v-if="submitting" class="fas fa-spinner fa-spin me-2"></i>
                    <i v-else class="fas fa-save me-2"></i>
                    {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" @click="handleCancel"
                    :disabled="submitting || deleting">
                    <i class="fas fa-times me-2"></i>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-box-open me-2"></i>
                Producto Actual
              </h6>
            </div>
            <div class="card-body">
              <div v-if="product?.images?.length > 0" class="mb-3">
                <img :src="product.images[0]" alt="Producto actual" class="img-fluid rounded"
                  style="width: 100%; height: 200px; object-fit: cover;">
              </div>
              <div v-else class="text-center py-5 bg-light rounded mb-3">
                <i class="fas fa-image text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-2 mb-0">Sin imagen</p>
              </div>

              <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="badge bg-primary px-3 py-2">
                  <i class="fas fa-tag me-1"></i>
                  {{ getCategoryName(product?.categoria_id || product?.category) }}
                </span>
                <div class="rating-display">
                  <div class="stars">
                    <i v-for="star in 5" :key="star" class="fas fa-star"
                      :class="star <= Math.round(product?.rating || 0) ? 'text-warning' : 'text-muted'"></i>
                  </div>
                  <span class="ms-1 text-muted small">
                    {{ product?.rating || 0 }}
                  </span>
                </div>
              </div>

              <h6 class="fw-bold mb-2">{{ product?.title || 'Sin título' }}</h6>

              <div class="seller-info mb-3">
                <p class="text-muted small mb-1">
                  <i class="fas fa-user me-2"></i>
                  <strong>{{ product?.sellerName || authStore.user?.name }}</strong>
                </p>
                <p v-if="product?.sellerPhone" class="text-muted small mb-0">
                  <i class="fab fa-whatsapp me-2"></i>
                  {{ product.sellerPhone }}
                </p>
              </div>

              <div class="mb-3">
                <span class="text-primary fw-bold fs-5">
                  ${{ formatPrice(product?.price) }}
                </span>
              </div>

              <p class="text-muted small mb-3">
                {{ product?.description ? (product.description.length > 100 ? product.description.substring(0, 100) +
                  '...' : product.description) : 'Sin descripción' }}
              </p>

              <div class="d-flex justify-content-between align-items-center">
                <span class="badge" :class="product?.isActive ? 'bg-success' : 'bg-secondary'">
                  {{ product?.isActive ? 'Activo' : 'Inactivo' }}
                </span>
                <small class="text-muted">{{ product?.reviewCount || 0 }} reseñas</small>
              </div>
            </div>
          </div>

          <div class="card mb-4 border-warning">
            <div class="card-header bg-warning text-dark">
              <h6 class="mb-0">
                <i class="fas fa-eye me-2"></i>
                Vista Previa de Cambios
              </h6>
            </div>
            <div class="card-body">
              <div v-if="form.images?.length > 0" class="mb-3">
                <img :src="form.images[0]" alt="Vista previa" class="img-fluid rounded"
                  style="width: 100%; height: 150px; object-fit: cover;">
              </div>
              <div v-else class="text-center py-4 bg-light rounded mb-3">
                <i class="fas fa-image text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted small mt-2 mb-0">Sin imagen</p>
              </div>

              <h6 class="fw-bold mb-2">{{ form.title || 'Título del producto' }}</h6>
              <p class="text-muted small mb-2">
                {{ form.description ? (form.description.length > 80 ? form.description.substring(0, 80) + '...' :
                  form.description) : 'Descripción del producto...' }}
              </p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-primary fw-bold">
                  ${{ formatPrice(form.price) }}
                </span>
                <span class="badge" :class="form.isActive ? 'bg-success' : 'bg-secondary'">
                  {{ form.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-info-circle me-2"></i>
                Información
              </h6>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <small class="text-muted">Creado:</small>
                <small class="fw-semibold">{{ formatDate(product?.createdAt) }}</small>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <small class="text-muted">Última edición:</small>
                <small class="fw-semibold">{{ formatDate(product?.updatedAt) }}</small>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <small class="text-muted">Vistas:</small>
                <small class="fw-semibold">{{ product?.views || 0 }}</small>
              </div>
              <div class="d-flex justify-content-between">
                <small class="text-muted">Calificación:</small>
                <small class="fw-semibold">
                  <i class="fas fa-star text-warning me-1"></i>
                  {{ product?.rating || 0 }} ({{ product?.reviewCount || 0 }})
                </small>
              </div>
            </div>
          </div>

          <div class="card border-danger">
            <div class="card-header bg-danger text-white">
              <h6 class="mb-0">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Zona de Peligro
              </h6>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Una vez eliminado, no podrás recuperar este producto.
              </p>
              <button type="button" class="btn btn-danger w-100" @click="deleteProduct"
                :disabled="submitting || deleting">
                <i class="fas fa-trash me-2"></i>
                Eliminar Producto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'

export default {
  name: 'EditProduct',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const productsStore = useProductsStore()
    const authStore = useAuthStore()

    const productId = route.params.id
    const product = computed(() => productsStore.getProductById(productId))

    const form = reactive({
      title: '',
      category: '',
      price: 0,
      description: '',
      isActive: true,
      images: []
    })

    const errors = reactive({})
    const submitting = ref(false)
    const deleting = ref(false)
    const fileInput = ref(null)

    // Cargar datos del producto
    const loadProductData = () => {
      if (product.value) {
        //console.log('📝 Cargando datos del producto:', product.value) // TEMPORAL PARA DEBUG

        form.title = product.value.title || ''

        if (product.value.categoria_id) {
          form.category = product.value.categoria_id
        } else if (product.value.category) {
          // Buscar el ID de la categoría por su nombre
          const categoryObj = productsStore.categories?.find(
            cat => cat.nombre === product.value.category
          )
          form.category = categoryObj ? categoryObj.id : ''

          console.log('🔍 Categoría encontrada:', categoryObj)
          console.log('🔍 ID asignado a form.category:', form.category)
        } else {
          form.category = ''
        }

        form.price = product.value.price || 0
        form.description = product.value.description || ''
        form.isActive = product.value.isActive !== undefined ? product.value.isActive : true
        form.images = [...(product.value.images || [])]

        //console.log('✅ Formulario cargado:', form) // TEMPORAL PARA DEBUG
      } else {
        console.error('❌ No hay producto para cargar')
      }
    }

    // Validar formulario
    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])

      let isValid = true

      // Validar título
      if (!form.title || !form.title.trim()) {
        errors.title = 'El título es obligatorio'
        isValid = false
      } else if (form.title.trim().length < 5) {
        errors.title = 'El título debe tener al menos 5 caracteres'
        isValid = false
      }

      // Validar categoría
      if (!form.category) {
        errors.category = 'Debes seleccionar una categoría'
        isValid = false
      }

      // Validar precio
      if (!form.price || form.price <= 0) {
        errors.price = 'El precio debe ser un valor positivo'
        isValid = false
      }

      // Validar descripción
      if (!form.description || !form.description.trim()) {
        errors.description = 'La descripción es obligatoria'
        isValid = false
      } else if (form.description.trim().length < 20) {
        errors.description = 'La descripción debe tener al menos 20 caracteres'
        isValid = false
      }

      // Validar imágenes
      if (!form.images || form.images.length === 0) {
        errors.images = 'Debes tener al menos una imagen'
        isValid = false
      }

      return isValid
    }

    const addImage = () => {
      if (form.images.length < 4) {
        const placeholderImages = [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center'
        ]
        form.images.push(placeholderImages[form.images.length])
      }
    }

    // Manejar la selección de archivos
    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        return
      }
      //VERIFICAR
      if (form.images.length >= 4) {
        event.target.value = ''
        return
      }

      const imageUrl = URL.createObjectURL(file)
      form.images.push(imageUrl)
      event.target.value = ''
    }

    // Eliminar imagen
    const removeImage = (index) => {
      const image = form.images[index]
      if (image.startsWith('blob:')) {
        URL.revokeObjectURL(image)
      }
      form.images.splice(index, 1)
    }

    // Manejar error de carga de imagen
    const handleImageError = (event) => {
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
      if (event.target.src.startsWith('blob:')) {
        URL.revokeObjectURL(event.target.src)
      }
    }

    // Actualizar producto
    const handleSubmit = async () => {
      if (!validateForm()) {
        await Swal.fire({
          title: 'Formulario incompleto',
          text: 'Por favor corrige los errores antes de continuar',
          icon: 'warning',
          confirmButtonColor: '#0d6efd'
        })
        return
      }

      const confirmResult = await Swal.fire({
        title: '¿Guardar cambios?',
        text: '¿Estás seguro de que quieres actualizar este producto?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        reverseButtons: true
      })

      if (!confirmResult.isConfirmed) {
        return
      }

      submitting.value = true

      try {
        // ✅ DEFINIR productData AQUÍ
        const productData = {
          title: form.title.trim(),
          categoria_id: parseInt(form.category, 10),
          price: form.price,
          description: form.description.trim(),
          isActive: form.isActive,
          images: form.images.filter(img => !img.startsWith('blob:'))
        }

        console.log('📦 form.category:', form.category)
        console.log('📦 productData a enviar:', productData)

        await productsStore.updateProduct(productId, productData)

        await Swal.fire({
          title: '¡Actualizado!',
          text: 'El producto ha sido actualizado exitosamente',
          icon: 'success',
          confirmButtonColor: '#198754',
          timer: 1500,
          showConfirmButton: false
        })

        router.push('/profile')
      } catch (error) {
        console.error('Error al actualizar producto:', error)
        await Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Error al actualizar el producto. Por favor intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
      } finally {
        submitting.value = false
      }
    }

    // Manejar cancelación
    const handleCancel = async () => {
      const result = await Swal.fire({
        title: '¿Cancelar edición?',
        text: 'Los cambios no guardados se perderán',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar editando',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        reverseButtons: true
      })

      if (result.isConfirmed) {
        router.push('/profile')
      }
    }

    // Eliminar producto
    const deleteProduct = async () => {
      if (submitting.value) {
        alert('Espera a que se complete el guardado antes de eliminar')
        return
      }

      const result = await Swal.fire({
        title: '¿Eliminar producto?',
        text: `¿Estás seguro de que quieres eliminar el producto?. Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        reverseButtons: true,
      })

      if (!result.isConfirmed) {
        return
      }

      deleting.value = true

      try {
        Swal.fire({
          title: 'Eliminando producto...',
          text: 'Espera un momento por favor',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        await productsStore.deleteProduct(productId)

        await Swal.fire({
          title: '¡Producto eliminado!',
          text: 'El producto ha sido eliminado exitosamente',
          icon: 'success',
          confirmButtonColor: '#198754',
          timer: 1500,
          showConfirmButton: false
        })

        router.push('/profile')
      } catch (error) {
        console.error('Error al eliminar producto:', error)
        await Swal.fire({
          title: 'Error',
          text: 'Error al eliminar el producto. Por favor intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
      } finally {
        deleting.value = false
      }
    }

    // Formatear precio
    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX').format(price || 0)
    }

    // Formatear fecha
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Obtener nombre de categoría
    const getCategoryName = (categoryId) => {
      if (!categoryId) return 'Sin categoría'
      const category = productsStore.categories?.find(cat => cat.id === categoryId)
      return category?.nombre || 'Sin categoría'
    }
    //await authStore.initializeUserSession()
    onMounted(async () => {
      try {
        //console.log('🔍 Métodos disponibles en authStore:', Object.keys(authStore))
        //console.log('🔍 Usuario actual:', authStore.user)
        // 1. Verificar autenticación
        if (authStore.isAuthenticated) {
          await authStore.initAuth() // o el método que uses para cargar el usuario
        }

        // Verificar que el usuario esté cargado
        //console.log('👤 Usuario cargado:', authStore.user)

        if (!authStore.user) {
          await Swal.fire({
            title: 'Sesión no válida',
            text: 'Debes iniciar sesión para editar productos',
            icon: 'warning',
            confirmButtonColor: '#0d6efd'
          })
          router.push('/login')
          return
        }
        // Verificar que el producto existe
        if (!product.value) {
          await Swal.fire({
            title: 'Producto no encontrado',
            text: 'El producto que intentas editar no existe',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          })
          router.push('/profile')
          return
        }

        // 2. Cargar categorías y productos
        await productsStore.fetchCategories()
        //console.log('📦 Categorías cargadas:', productsStore.categories)

        await productsStore.fetchProducts()
        //console.log('🔍 Producto encontrado:', product.value)

        // 4. Verificar permisos
        const productSellerId = String(product.value.sellerId)
        const userIdInstitucional = String(authStore.user?.id_institucional)

        //console.log('🔍 User ID:', userIdInstitucional)
        //console.log('🔍 Seller ID:', productSellerId)

        if (!userIdInstitucional || productSellerId !== userIdInstitucional) {
          await Swal.fire({
            title: 'Acceso denegado',
            text: 'No tienes permiso para editar este producto. Solo el creador puede editarlo.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          })
          router.push('/profile')
          return
        }

        // Si todo está bien, cargar los datos del producto en el formulario
        loadProductData()
      } catch (error) {
        console.error('Error al cargar datos:', error)
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al cargar el producto',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
        router.push('/profile')
      }
    })
    return {
      product,
      form,
      errors,
      submitting,
      deleting,
      fileInput,
      productsStore,
      authStore,
      addImage,
      removeImage,
      handleImageError,
      handleImageUpload,
      handleSubmit,
      handleCancel,
      deleteProduct,
      formatPrice,
      formatDate,
      getCategoryName
    }
  }
}
</script>

<style scoped>
.edit-product-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

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
  height: 120px;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rating-display .stars {
  display: flex;
  gap: 2px;
}

.rating-display .stars i {
  font-size: 0.75rem;
}

.seller-info p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.seller-info strong {
  color: #212529;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .edit-product-page {
    padding: 1rem 0;
  }

  .image-preview,
  .image-upload-placeholder {
    height: 100px;
  }

  .d-flex.gap-2 {
    flex-direction: column;
  }

  .btn:not(.btn-sm) {
    width: 100%;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.5rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1199px) {
  .edit-product-page {
    padding: 1.5rem 0;
  }
}
</style>