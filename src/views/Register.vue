<template>
  <div class="register-container">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- Logo y título -->
              <div class="text-center mb-4">
                <i class="fas fa-graduation-cap text-primary mb-3" style="font-size: 3rem;"></i>
                <h2 class="fw-bold text-primary">Antojitos UPB</h2>
                <p class="text-muted">Crea tu cuenta de estudiante</p>
              </div>

              <!-- Formulario de registro -->
              <form @submit.prevent="handleRegister">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="studentId" class="form-label fw-semibold">
                      <i class="fas fa-id-card me-2"></i>
                      ID Estudiantil *
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="studentId"
                      v-model="form.studentId"
                      placeholder="Ej: 20210001"
                      required
                      :class="{ 'is-invalid': errors.studentId }"
                    >
                    <div v-if="errors.studentId" class="invalid-feedback">
                      {{ errors.studentId }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label fw-semibold">
                      <i class="fas fa-envelope me-2"></i>
                      Correo Estudiantil *
                    </label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="form.email"
                      placeholder="tu@universidad.edu"
                      required
                      :class="{ 'is-invalid': errors.email }"
                    >
                    <div v-if="errors.email" class="invalid-feedback">
                      {{ errors.email }}
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="name" class="form-label fw-semibold">
                    <i class="fas fa-user me-2"></i>
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    v-model="form.name"
                    placeholder="Tu nombre completo"
                    :class="{ 'is-invalid': errors.name }"
                  >
                  <div v-if="errors.name" class="invalid-feedback">
                    {{ errors.name }}
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="password" class="form-label fw-semibold">
                      <i class="fas fa-lock me-2"></i>
                      Contraseña *
                    </label>
                    <div class="input-group">
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control"
                        id="password"
                        v-model="form.password"
                        placeholder="Mínimo 6 caracteres"
                        required
                        :class="{ 'is-invalid': errors.password }"
                      >
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="showPassword = !showPassword"
                      >
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                    <div v-if="errors.password" class="invalid-feedback">
                      {{ errors.password }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="confirmPassword" class="form-label fw-semibold">
                      <i class="fas fa-lock me-2"></i>
                      Confirmar Contraseña *
                    </label>
                    <div class="input-group">
                      <input
                        :type="showConfirmPassword ? 'text' : 'password'"
                        class="form-control"
                        id="confirmPassword"
                        v-model="form.confirmPassword"
                        placeholder="Repite tu contraseña"
                        required
                        :class="{ 'is-invalid': errors.confirmPassword }"
                      >
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="showConfirmPassword = !showConfirmPassword"
                      >
                        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                    <div v-if="errors.confirmPassword" class="invalid-feedback">
                      {{ errors.confirmPassword }}
                    </div>
                  </div>
                </div>

                <!-- Términos y condiciones -->
                <div class="mb-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="terms"
                      v-model="form.acceptTerms"
                      required
                      :class="{ 'is-invalid': errors.acceptTerms }"
                    >
                    <label class="form-check-label" for="terms">
                      Acepto los 
                      <a href="#" class="text-primary text-decoration-none">términos y condiciones</a>
                      y la 
                      <a href="#" class="text-primary text-decoration-none">política de privacidad</a>
                    </label>
                    <div v-if="errors.acceptTerms" class="invalid-feedback">
                      {{ errors.acceptTerms }}
                    </div>
                  </div>
                </div>

                <!-- Mensaje de error general -->
                <div v-if="errorMessage" class="alert alert-danger" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <!-- Mensaje de éxito -->
                <div v-if="successMessage" class="alert alert-success" role="alert">
                  <i class="fas fa-check-circle me-2"></i>
                  {{ successMessage }}
                </div>

                <!-- Botón de registro -->
                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2 fw-semibold"
                  :disabled="loading"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-user-plus me-2"></i>
                  {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
                </button>
              </form>

              <!-- Enlace a login -->
              <div class="text-center mt-4">
                <p class="mb-0">
                  ¿Ya tienes cuenta?
                  <router-link to="/login" class="text-primary fw-semibold text-decoration-none">
                    Inicia sesión aquí
                  </router-link>
                </p>
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

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const form = reactive({
      studentId: '',
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    })

    const errors = reactive({})
    const errorMessage = ref('')
    const successMessage = ref('')
    const loading = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const validateForm = () => {
      // Limpiar errores anteriores
      Object.keys(errors).forEach(key => errors[key] = '')

      let isValid = true

      // Validar ID estudiantil
      if (!form.studentId.trim()) {
        errors.studentId = 'El ID estudiantil es requerido'
        isValid = false
      } else if (!/^\d{8}$/.test(form.studentId)) {
        errors.studentId = 'El ID estudiantil debe tener 8 dígitos'
        isValid = false
      }

      // Validar email
      if (!form.email.trim()) {
        errors.email = 'El correo estudiantil es requerido'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Ingresa un correo válido'
        isValid = false
      } else if (!form.email.endsWith('@universidad.edu')) {
        errors.email = 'Debe ser un correo de la universidad'
        isValid = false
      }

      // Validar contraseña
      if (!form.password) {
        errors.password = 'La contraseña es requerida'
        isValid = false
      } else if (form.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres'
        isValid = false
      }

      // Validar confirmación de contraseña
      if (!form.confirmPassword) {
        errors.confirmPassword = 'Confirma tu contraseña'
        isValid = false
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden'
        isValid = false
      }

      // Validar términos y condiciones
      if (!form.acceptTerms) {
        errors.acceptTerms = 'Debes aceptar los términos y condiciones'
        isValid = false
      }

      return isValid
    }

    const handleRegister = async () => {
      if (!validateForm()) return

      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        const result = await authStore.register(form)
        
        if (result.success) {
          successMessage.value = 'Cuenta creada exitosamente. Redirigiendo...'
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          errorMessage.value = result.message
        }
      } catch (error) {
        errorMessage.value = 'Error al crear la cuenta. Inténtalo de nuevo.'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      errors,
      errorMessage,
      successMessage,
      loading,
      showPassword,
      showConfirmPassword,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
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

.form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .register-container {
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
