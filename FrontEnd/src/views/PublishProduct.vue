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
              <form @submit.prevent="handleSubmit" novalidate>
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
                      min="50" step="50" max="300000" required :class="{ 'is-invalid': errors.price }"
                      @input="validatePrice">
                  </div>
                  <div v-if="errors.price" class="invalid-feedback">
                    {{ errors.price }}
                  </div>
                </div>
                <div class="form-text mb-3">
                    El precio debe ser múltiplo de 50 (ej: 50, 100, 150, etc.) y máximo $300.000
                </div>

                <!-- Selector rápido de precios comunes -->
                <div class="mt-3 mb-3">
                  <label class="form-label fw-semibold small">
                    <i class="fas fa-bolt me-1"></i>
                    Precios comunes:
                  </label>
                  <div class="d-flex flex-wrap gap-2">
                    <button type="button" v-for="commonPrice in commonPrices" :key="commonPrice"
                      class="btn btn-outline-primary btn-sm" @click="setCommonPrice(commonPrice)">
                      ${{ formatPrice(commonPrice) }}
                    </button>
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

                <!-- Imágenes (OPCIÓN A: SOLO imágenes reales subidas por el vendedor) -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="fas fa-images me-2"></i>
                    Imágenes del Producto *
                  </label>

                  <div class="image-upload-area mb-3">
                    <div class="row g-3">
                      <div v-for="(img, idx) in form.images" :key="idx" class="col-6 col-md-3">
                        <div class="image-preview">
                          <img :src="img.url" :alt="`Imagen ${idx+1}`" class="img-thumbnail" @error="handleImageError">
                          <button type="button" class="btn btn-sm btn-danger remove-image" @click="removeImage(idx)" :disabled="img.uploading">
                            <i class="fas fa-times"></i>
                          </button>

                          <div v-if="img.uploading" class="mt-2 text-center small">
                            <i class="fas fa-spinner fa-spin me-1"></i> Subiendo...
                          </div>
                        </div>
                      </div>

                      <!-- Upload placeholder / botón -->
                      <div v-if="form.images.length < maxImages" class="col-6 col-md-3">
                        <div class="image-upload-placeholder" @click="openFileDialog">
                          <i class="fas fa-plus"></i>
                          <span>Agregar Imagen</span>
                          <small class="d-block mt-1 text-muted">Máx {{ maxImages }} imágenes</small>
                        </div>

                        <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange">
                      </div>
                    </div>
                  </div>

                  <div v-if="errors.images" class="invalid-feedback d-block">{{ errors.images }}</div>
                  <div class="form-text">Sube imágenes reales desde tu computadora. La primera será la principal.</div>
                </div>

                <!-- Botones -->
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="submitting">
                    <i v-if="submitting" class="fas fa-spinner fa-spin me-2"></i>
                    <i v-else class="fas fa-paper-plane me-2"></i>
                    {{ submitting ? 'Publicando...' : 'Publicar Producto' }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" @click="resetForm" :disabled="submitting">
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
/*
  PublishProduct.vue (OPCIÓN A)
  - Subida real de imágenes a /api/uploads (form-data field: 'image')
  - Almacena en form.images: [{ url, public_id, uploading }]
  - Envía al backend las URLs cuando crea el producto.
*/

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useProductsStore } from '../stores/products'
import { useNotificacion } from '../utils/useNotificacion'

export default {
  name: 'PublishProduct',
  setup() {
    const router = useRouter()
    const productsStore = useProductsStore()
    const authStore = useAuthStore()
    const notificacion = useNotificacion()

    const form = reactive({
      title: '',
      category: '',
      price: 0,
      description: '',
      images: [] // array de objetos { url, public_id, uploading }
    })

    const errors = reactive({})
    const submitting = ref(false)
    const maxImages = 4
    const commonPrices = [2500, 5000, 10000, 15000, 25000, 30000]

    const currentProduct = computed(() => {
      return productsStore.products.find(product =>
        product.sellerId === authStore.user?.id && product.isActive
      )
    })

    const validatePrice = () => {
      if (form.price && (form.price < 50 || form.price > 300000)) {
        errors.price = 'El precio debe estar entre $50 y $300.000'
        return false
      }
      if (form.price && form.price % 50 !== 0) {
        errors.price = 'El precio debe ser múltiplo de 50 (ej: 50, 100, 150, etc.)'
        return false
      }
      delete errors.price
      return true
    }

    const setCommonPrice = (p) => {
      form.price = p
      validatePrice()
    }

    const formatPrice = (price) => new Intl.NumberFormat('es-CO').format(price || 0)

    // Validaciones generales del formulario
    const validateForm = () => {
      // limpiar errores
      Object.keys(errors).forEach(k => delete errors[k])

      let ok = true
      if (!form.title || !form.title.trim()) {
        errors.title = 'El título es requerido'
        ok = false
      } else if (form.title.trim().length < 5) {
        errors.title = 'El título debe tener al menos 5 caracteres'
        ok = false
      }

      if (!form.category) {
        errors.category = 'La categoría es requerida'
        ok = false
      }

      if (!form.price || form.price <= 0) {
        errors.price = 'El precio debe ser mayor a 0'
        ok = false
      } else if (!validatePrice()) {
        ok = false
      }

      if (!form.description || form.description.trim().length < 20) {
        errors.description = 'La descripción debe tener al menos 20 caracteres'
        ok = false
      }

      // Al menos 1 imagen
      if (!form.images || form.images.length === 0) {
        errors.images = 'Debes subir al menos una imagen'
        ok = false
      }

      // Asegurar que no haya imágenes en proceso de subida
      const uploading = form.images.some(i => i.uploading)
      if (uploading) {
        errors.images = 'Espera a que terminen de subirse las imágenes'
        ok = false
      }

      return ok
    }

    // file input ref
    const fileInput = ref(null)

    const openFileDialog = () => {
      if (form.images.length >= maxImages) return
      fileInput.value?.click()
    }

    // Cargar imagen al backend (/api/uploads)
    const uploadImage = async (file) => {
      // Evitar exceder el máximo
      if (form.images.length >= maxImages) {
        notificacion.warning(`Máximo ${maxImages} imágenes`)
        return
      }

      // Añadir placeholder local con estado uploading
      const tempObj = {
        url: URL.createObjectURL(file),
        public_id: null,
        uploading: true
      }
      form.images.push(tempObj)
      const idx = form.images.length - 1

      try {
        const fd = new FormData()
        fd.append('image', file)

        // Ajusta la baseURL si tu API está en otro puerto/dominio (axios base config)
        const res = await axios.post('/api/uploads', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000
        })

        // Reemplazar temporales
        form.images[idx].url = res.data.url
        form.images[idx].public_id = res.data.public_id || null
        form.images[idx].uploading = false

        notificacion.success('Imagen subida')
      } catch (err) {
        console.error('Upload error:', err)
        // revocar objectURL si existe
        try { URL.revokeObjectURL(tempObj.url) } catch(e){}

        // eliminar de la lista
        form.images.splice(idx, 1)

        notificacion.error(err.response?.data?.message || 'Error subiendo la imagen')
      }
    }

    const onFileChange = async (e) => {
      const files = Array.from(e.target.files || [])
      if (!files.length) return
      // si excede, cortar
      const available = maxImages - form.images.length
      const toUpload = files.slice(0, available)
      for (const f of toUpload) {
        // validación tipo y tamaño (ej: <= 5MB)
        if (!f.type.startsWith('image/')) {
          notificacion.warning('Solo se permiten archivos de imagen')
          continue
        }
        if (f.size > 5 * 1024 * 1024) {
          notificacion.warning('Imagen demasiado grande (máx 5 MB)')
          continue
        }
        await uploadImage(f)
      }
      e.target.value = '' // limpiar input
    }

    const removeImage = async (index) => {
      const img = form.images[index]
      if (!img) return

      // Si imagen tiene public_id, eliminar de Cloudinary
      if (img.public_id) {
        try {
          await axios.delete(`/api/uploads/${encodeURIComponent(img.public_id)}`)
        } catch (err) {
          console.warn('No se pudo eliminar en Cloudinary (igual se eliminará local):', err?.response?.data || err.message)
          // no abortar el flujo; seguir con eliminación local
        }
      }

      // revocar objectURL si era blob
      try { if (img.url && img.url.startsWith('blob:')) URL.revokeObjectURL(img.url) } catch(e){}

      form.images.splice(index, 1)
      notificacion.info('Imagen eliminada')
    }

    const handleImageError = (ev) => {
      // fallback simple
      ev.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#666">Error al cargar</text></svg>')}`
    }

    const resetForm = () => {
      form.title = ''
      form.category = ''
      form.price = 0
      form.description = ''
      // revocar objectURLs
      form.images.forEach(i => { try { if (i.url && i.url.startsWith('blob:')) URL.revokeObjectURL(i.url) } catch(e){} })
      form.images = []
      Object.keys(errors).forEach(k => delete errors[k])
    }

    const deactivateCurrentProduct = () => {
      if (currentProduct.value) {
        currentProduct.value.isActive = false
        notificacion.success('Producto desactivado exitosamente')
      }
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      const existingProducts = productsStore.userProducts(authStore.user?.id_institucional)
      if (existingProducts && existingProducts.length > 0) {
        Swal.fire({
          title: 'Ya tienes un producto',
          text: 'Solo puedes tener un producto publicado. Edita el existente.',
          icon: 'warning',
          confirmButtonColor: '#0d6efd'
        })
        router.push(`/edit-product/${existingProducts[0].id}`)
        return
      }

      const existingProducts = productsStore.userProducts(authStore.user?.id_institucional)
      if (existingProducts && existingProducts.length > 0) {
        Swal.fire({
          title: 'Ya tienes un producto',
          text: 'Solo puedes tener un producto publicado. Edita el existente.',
          icon: 'warning',
          confirmButtonColor: '#0d6efd'
        })
        router.push(`/edit-product/${existingProducts[0].id}`)
        return
      }

      if (currentProduct.value) {
        notificacion.warning('Ya tienes un producto activo. Debes desactivarlo primero.')
        return
      }

      submitting.value = true

      try {
        const payload = {
        title: form.title.trim(),
        categoria_id: form.category,
        price: form.price,
        description: form.description.trim(),
        images: form.images.map(i => ({
          url: i.url,
          public_id: i.public_id
        })),
        sellerId: authStore.user.id,
        sellerName: authStore.user.name
      }

        // productsStore.addProduct debe estar preparado para este payload
        await productsStore.addProduct(payload)

        notificacion.success('Producto publicado exitosamente')
        // si productsStore.addProduct devuelve el producto con id:
        router.push('/profile')
      } catch (err) {
        console.error('Error publicando producto:', err)
        notificacion.error(err.response?.data?.message || 'Error al publicar el producto')
      } finally {
        submitting.value = false
      }
    }

    // Carga inicial
    onMounted(async () => {
      try {
        await productsStore.fetchCategories()
        authStore.initAuth && authStore.initAuth()
      } catch (err) {
        console.warn('Error en onMounted:', err)
      }
    })

    return {
      form,
      errors,
      submitting,
      productsStore,
      commonPrices,
      maxImages,
      currentProduct,
      fileInput,
      openFileDialog,
      onFileChange,
      removeImage,
      handleImageError,
      resetForm,
      deactivateCurrentProduct,
      setCommonPrice,
      formatPrice,
      validatePrice,
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
