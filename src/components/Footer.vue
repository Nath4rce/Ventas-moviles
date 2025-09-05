<template>
  <footer class="custom-footer text-white py-4 mt-5">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <h5 class="fw-bold mb-3">
            <i class="fas fa-graduation-cap me-2"></i>
            Antojitos UPB
          </h5>
          <p class="mb-0">
            El marketplace interno de la universidad. 
            Conectamos estudiantes para comprar y vender productos de manera segura.
          </p>
        </div>
        
        <div class="col-md-3">
          <h6 class="fw-bold mb-3">Enlaces Rápidos</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/landing" class="text-white text-decoration-none">
                <i class="fas fa-home me-1"></i>
                Inicio
              </router-link>
            </li>
            <li class="mb-2" v-if="authStore.isSeller">
              <router-link to="/publish" class="text-white text-decoration-none">
                <i class="fas fa-plus me-1"></i>
                Publicar Producto
              </router-link>
            </li>
            <li class="mb-2" v-if="authStore.isAdmin">
              <router-link to="/admin" class="text-white text-decoration-none">
                <i class="fas fa-cog me-1"></i>
                Administración
              </router-link>
            </li>
          </ul>
        </div>
        
        <div class="col-md-3">
          <h6 class="fw-bold mb-3">Contacto</h6>
          <p class="mb-1">
            <i class="fas fa-envelope me-2"></i>
            ecommerce@universidad.edu
          </p>
          <p class="mb-0">
            <i class="fas fa-phone me-2"></i>
            +1 (555) 123-4567
          </p>
        </div>
      </div>
      
      <hr class="my-4">
      
      <div class="row align-items-center">
        <div class="col-md-6">
          <p class="mb-0">
            &copy; 2024 Universidad eCommerce. Todos los derechos reservados.
          </p>
        </div>
        <div class="col-md-6 text-md-end">
          <small class="text-muted">
            Desarrollado con Vue 3 y Bootstrap
          </small>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Footer',
  setup() {
    const authStore = useAuthStore()
    
    return {
      authStore
    }
  }
}
</script>

<style scoped>
footer a:hover {
  color: #ffd700 !important;
  transition: color 0.3s ease;
}

@media (max-width: 767px) {
  .text-md-end {
    text-align: left !important;
    margin-top: 1rem;
  }
}
</style>
