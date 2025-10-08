<template>
  <div class="login-container">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- Logo y título -->
              <div class="text-center mb-4">
                <i class="fas fa-graduation-cap text-primary mb-3" style="font-size: 3rem;"></i>
                <h2 class="fw-bold text-primary">Ventas Moviles UPB</h2>
                <p class="text-muted">Inicia sesión en tu cuenta</p>
              </div>

              <!-- Formulario de login -->
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="studentId" class="form-label fw-semibold">
                    <i class="fas fa-id-card me-2"></i>
                    ID Estudiantil
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

                <div class="mb-4">
                  <label for="password" class="form-label fw-semibold">
                    <i class="fas fa-lock me-2"></i>
                    Contraseña
                  </label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      v-model="form.password"
                      placeholder="Tu contraseña"
                      required
                      :class="{ 'is-invalid': errors.password }"
                    >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPassword = !showPassword"
                      title="Mostrar/ocultar contraseña"
                    >
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
                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2 fw-semibold"
                  :disabled="loading"
                >
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

              <!-- Credenciales de prueba -->
              <div class="mt-4 p-3 bg-light rounded">
                <h6 class="fw-semibold text-muted mb-2">
                  <i class="fas fa-info-circle me-1"></i>
                  Credenciales de prueba:
                </h6>
                <div class="small">
                  <div><strong>Admin:</strong> 20210001 / admin123</div>
                  <div><strong>Vendedor:</strong> 20210002 / vendedor123</div>
                  <div><strong>Comprador:</strong> 20210003 / comprador123</div>
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

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const ui = useUIStore()

    const form = reactive({
      studentId: '',
      password: ''
    })

    const errors = reactive({})
    const errorMessage = ref('')
    const loading = ref(false)
    const showPassword = ref(false)

    const validateForm = () => {
      errors.studentId = ''
      errors.password = ''

      if (!form.studentId.trim()) {
        errors.studentId = 'El ID estudiantil es requerido'
        return false
      }

      if (!form.password) {
        errors.password = 'La contraseña es requerida'
        return false
      }

      return true
    }

    const handleLogin = async () => {
      if (!validateForm()) return

      // Mostrar pantalla de carga global
      ui.showLoading({ message: 'Iniciando sesión...', variant: 'circular' });
      loading.value = true;
      errorMessage.value = '';

      try {
        // Simulamos un pequeño retardo (puedes quitarlo si usas backend real)
        await new Promise(resolve => setTimeout(resolve, 800));

        const result = await authStore.login(form);

        if (result.success) {
          // Espera un momento antes de redirigir, para ver la pantalla de carga
          await new Promise(resolve => setTimeout(resolve, 1200));
          router.push('/landing');
        } else {
          errorMessage.value = result.message || 'Credenciales incorrectas.';
        }
      } catch (error) {
        const payload = (error.response && error.response.data)
          ? error.response.data
          : { message: error.message || 'Error al iniciar sesión' };

        ui.setError(payload);
        try { sessionStorage.setItem('backend_error', JSON.stringify(payload)) } catch (e) {}
        router.push({ name: 'Error', query: { error: JSON.stringify(payload) } });
        errorMessage.value = 'Error al iniciar sesión. Inténtalo de nuevo.';
      } finally {
        // Mantenemos la pantalla visible por unos segundos para notar el efecto
        await new Promise(resolve => setTimeout(resolve, 1500));
        loading.value = false;
        ui.hideLoading();
      }
    }

    return {
      form,
      errors,
      errorMessage,
      loading,
      showPassword,
      handleLogin
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
