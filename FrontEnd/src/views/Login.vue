<template>
  <div class="login-container">
    <div class="container">
      <!-- Botón de regresar - Posicionado arriba del card -->
      <div class="row justify-content-center mb-3">
        <div class="col-12 col-md-6 col-lg-4">
          <router-link class="btn btn-link text-white ps-0" to="/landing">
            <i class="fas fa-arrow-left me-2"></i>
            Regresar al Inicio
          </router-link>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- Logo y título -->
              <div class="text-center mb-4">
                <img src="/BrandbookUPB.png" alt="Logo UPB" class="upb-logo-login mb-3"
                  style="height: 80px; width: auto;" />
                <h2 class="fw-bold text-primary">Ventas Moviles UPB</h2>
                <p class="text-muted">Inicia sesión en tu cuenta</p>
              </div>

              <!-- Formulario de login -->
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="idInstitucional" class="form-label fw-semibold">
                    <i class="fas fa-id-card me-2"></i>
                    ID Institucional
                  </label>
                  <input type="text" class="form-control" id="idInstitucional" v-model="form.idInstitucional"
                    placeholder="Ej: 000497849" required :class="{ 'is-invalid': errors.idInstitucional }">
                  <div v-if="errors.idInstitucional" class="invalid-feedback">
                    {{ errors.idInstitucional }}
                  </div>
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label fw-semibold">
                    <i class="fas fa-lock me-2"></i>
                    Contraseña
                  </label>
                  <div class="input-group">
                    <input :type="showPassword ? 'text' : 'password'" class="form-control" id="password"
                      v-model="form.password" placeholder="Tu contraseña" required
                      :class="{ 'is-invalid': errors.password }">
                    <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword"
                      title="Mostrar/ocultar contraseña">
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="errors.password" class="invalid-feedback">
                    {{ errors.password }}
                  </div>
                </div>

                <!-- Mensaje de error general -->
                <div v-if="errorMessage" class="alert alert-danger" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <!-- Botón de login -->
                <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" :disabled="loading">
                  <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-sign-in-alt me-2"></i>
                  {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                </button>
              </form>

              <!-- Mensaje informativo -->
              <div class="text-center mt-4">
                <p class="mb-0 text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  El registro debe ser realizado por un administrador
                </p>
              </div>

              <!-- Credenciales de prueba - Solo en desarrollo -->
              <div v-if="isDevelopment" class="mt-4 p-3 bg-light rounded">
                <h6 class="fw-semibold text-muted mb-2">
                  <i class="fas fa-info-circle me-1"></i>
                  Credenciales de prueba:
                </h6>
                <div class="small">
                  <div><strong>Admin:</strong> 000000001 / admin123</div>
                  <div><strong>Vendedor Activo:</strong> 000111111 / seller123</div>
                  <div><strong>Vendedor (Producto Pausado):</strong> 000111112 / seller123</div>
                  <div><strong>Usuario Suspendido:</strong> 000111113 / buyer123</div>
                  <div><strong>Usuario con Notificación VIP:</strong> 000111114 / buyer123</div>
                  <div><strong>Comprador Normal:</strong> 000111115 / buyer123</div>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUIStore } from '../stores/ui'
import Swal from 'sweetalert2'

const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.MODE === 'development'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const ui = useUIStore()

    const form = reactive({
      idInstitucional: '',
      password: ''
    })

    const errors = reactive({})
    const errorMessage = ref('')
    const loading = ref(false)
    const showPassword = ref(false)

    const validateForm = () => {
      errors.idInstitucional = ''
      errors.password = ''

      if (!form.idInstitucional.trim()) {
        errors.idInstitucional = 'El ID Institucional es requerido'
        return false
      }

      if (!form.password) {
        errors.password = 'La contraseña es requerida'
        return false
      }

      return true
    }

    // Función para mostrar detalles de sanción
    const mostrarDetallesSancion = (sancion) => {
      if (!sancion) {
        // Si no hay información de sanción, mostrar mensaje genérico
        Swal.fire({
          title: '⚠️ Cuenta Inactiva',
          text: 'Tu cuenta está inactiva. Contacta al administrador.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        })
        return
      }

      // Formatear fecha de fin si existe
      let fechaFinTexto = ''
      if (sancion.tipo === 'temporal' && sancion.fechaFin) {
        const fechaFin = new Date(sancion.fechaFin)
        fechaFinTexto = fechaFin.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      // Mapeo de motivos a texto legible
      const motivosTexto = {
        'venta_sin_autorizacion': 'Venta sin autorización',
        'producto_no_autorizado': 'Producto no autorizado',
        'venta_estacionaria': 'Venta estacionaria no permitida',
        'incumplimiento_horario': 'Incumplimiento de horario',
        'recipiente_no_conforme': 'Recipiente no conforme',
        'productos_prohibidos': 'Venta de productos prohibidos',
        'publicidad_no_autorizada': 'Publicidad no autorizada',
        'subarrendamiento': 'Subarrendamiento no permitido',
        'otro': 'Otra razón'
      }

      const motivoTexto = motivosTexto[sancion.motivo] || sancion.motivo

      // Construir mensaje HTML
      let html = `
        <div class="text-start">
          <div class="mb-3">
            <strong class="text-danger">Motivo:</strong> 
            <span class="d-block mt-1">${motivoTexto}</span>
          </div>
          
          <div class="mb-3">
            <strong class="text-danger">Descripción:</strong>
            <p class="mt-1 mb-0">${sancion.descripcion}</p>
          </div>
      `

      if (sancion.tipo === 'temporal') {
        html += `
          <div class="mb-3">
            <strong class="text-warning">Tipo de Sanción:</strong> 
            <span class="badge bg-warning text-dark ms-2">Temporal</span>
          </div>
          
          <div class="mb-3">
            <strong class="text-success">Vigente hasta:</strong>
            <p class="mt-1 mb-0">📅 ${fechaFinTexto}</p>
          </div>
        `
      } else {
        html += `
          <div class="mb-3">
            <strong class="text-danger">Tipo de Sanción:</strong> 
            <span class="badge bg-danger ms-2">Permanente</span>
          </div>
          
          <div class="alert alert-danger mb-3">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Debes contactar al administrador para solicitar la reactivación de tu cuenta.
          </div>
        `
      }

      html += `
          <hr>
          <p class="mb-0 text-muted small">
            <i class="fas fa-info-circle me-1"></i>
            Si consideras que esta sanción es injusta, puedes contactar al administrador 
            del marketplace para presentar una apelación.
          </p>
        </div>
      `

      Swal.fire({
        title: '⚠️ Cuenta Suspendida',
        html: html,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc3545',
        width: '600px',
        customClass: {
          popup: 'text-start'
        }
      })
    }

    const handleLogin = async () => {
      if (!validateForm()) return

      // Mostrar pantalla de carga global
      ui.showLoading({ message: 'Iniciando sesión...', variant: 'circular' })
      loading.value = true
      errorMessage.value = ''

      let sancionDetected = false // Variable para controlar si se detectó sanción

      try {
        // Aplicar trim a los campos antes de enviar
        const result = await authStore.login({
          idInstitucional: form.idInstitucional.trim(),
          password: form.password.trim()
        })

        if (result.success) {
          // Espera un momento antes de redirigir
          await new Promise(resolve => setTimeout(resolve, 1200))
          router.push('/landing')
        } else {
          errorMessage.value = result.message || 'Credenciales incorrectas.'
        }
      } catch (error) {
        console.log('Error capturado:', error) // Debug

        // Si el error tiene información de sanción, mostrar modal detallado
        if (error.sancionInfo) {
          sancionDetected = true
          ui.hideLoading()
          loading.value = false
          mostrarDetallesSancion(error.sancionInfo)
          return // Salir aquí para no ejecutar el finally
        }

        // Manejo de otros errores
        errorMessage.value = error.response?.data?.message || 'Error al iniciar sesión. Credenciales incorrectas.'
        
      } finally {
        // Solo ejecutar si no se detectó sanción
        if (!sancionDetected) {
          await new Promise(resolve => setTimeout(resolve, 1500))
          loading.value = false
          ui.hideLoading()
        }
      }
    }


    return {
      form,
      errors,
      errorMessage,
      loading,
      showPassword,
      handleLogin,
      isDevelopment
    }
  }
}
</script>


<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.card {
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.form-control {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(139, 0, 0, 0.25);
}

.btn-primary {
  border-radius: 10px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 0, 0, 0.3);
}

.input-group .btn {
  border-radius: 0 10px 10px 0;
  border-left: none;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .login-container {
    padding: 1rem 0;
  }

  .card-body {
    padding: 2rem !important;
  }

  .btn-primary {
    font-size: 1rem;
  }
}
</style>