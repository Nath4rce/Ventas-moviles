<template>
  <div id="app" class="relative">
    <!-- Navbar y Footer visibles excepto en login -->
    <Navbar v-if="!isLoginPage" />

    <!-- Contenido principal -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <Footer v-if="!isLoginPage" />

    <!-- 🔹 Pantalla de carga automática al navegar -->
    <transition name="fade">
      <div
        v-if="router.isNavigating"
        class="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-80 mb-4"></div>
        <p class="text-gray-700 font-semibold">{{ loadingMessage }}</p>
      </div>
    </transition>

    <!-- 🔹 Pantalla de error global -->
    <Error v-if="hasError" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Error from './components/Error.vue'

// Router
const router = useRouter()
const route = useRoute()

// Mostrar u ocultar Navbar y Footer
const isLoginPage = computed(() => route.name === 'Login' || route.name === 'Register')

// Mensaje dinámico del loader (opcional)
const loadingMessage = ref('Cargando...')

// Si quieres personalizar el mensaje dependiendo de la ruta:
watch(
  () => router.isNavigating,
  (navigating) => {
    if (navigating) {
      if (route.name === 'Login') loadingMessage.value = 'Iniciando sesión...'
      else if (route.name === 'Logout') loadingMessage.value = 'Cerrando sesión...'
      else loadingMessage.value = 'Cargando...'
    }
  }
)

// Si tienes errores globales
const hasError = computed(() => {
  try {
    return !!sessionStorage.getItem('backend_error')
  } catch {
    return false
  }
})
</script>

<style>
.main-content {
  min-height: calc(100vh - 120px);
  padding-top: 20px;
}

/* Animaciones de transición */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile */
@media (max-width: 767px) {
  .main-content {
    padding-top: 15px;
  }
}
</style>
