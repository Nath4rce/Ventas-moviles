<template>
  <div id="app" class="relative min-h-screen flex flex-col">
    <!-- Navbar visible excepto en login/register -->
    <Navbar v-if="!isLoginPage" />

    <!-- 🔹 Overlay global de carga -->
    <LoadingOverlay v-model:active="isLoading" :is-full-page="true" :can-cancel="false" :lock-scroll="true"
      color="#2563eb" background-color="rgba(255,255,255,0.95)" :opacity="1" class="z-[9999]">
      <template #default>
        <div class="flex flex-col items-center justify-center text-center">
          <img src="/upb-logo.png" alt="Logo UPB" class="w-20 h-20 mb-4 animate-pulse" />

          <!-- Mensaje dinámico -->
          <p class="text-gray-700 font-semibold text-center">
            {{ loadingMessage }}
          </p>
        </div>
      </template>
    </LoadingOverlay>

    <!-- Contenido principal -->
    <main class="flex-grow main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <Footer v-if="!isLoginPage" />
    <NotificacionContainer position="top-right" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import NotificacionContainer from './components/NotificacionContainer.vue'
import LoadingOverlay from 'vue-loading-overlay' // install if missing: npm i vue-loading-overlay

const route = useRoute()
const router = useRouter()

const isLoginPage = computed(() => route.name === 'Login' || route.name === 'Register')

// Estado del overlay
const isLoading = ref(true) // Empieza cargando (pantalla inicial)
const loadingMessage = ref('Cargando...')

// Mostrar pantalla de carga inicial
setTimeout(() => {
  isLoading.value = false
}, 1000)

// Activar overlay durante navegación (nota: añadir guards en main.js es más apropiado,
// pero esto funciona si necesitas un guard localizado)
router.beforeEach((to, from, next) => {
  isLoading.value = true
  loadingMessage.value = 'Cargando...'
  next()
})

router.afterEach(() => {
  // Pequeño retardo para una transición más fluida
  setTimeout(() => (isLoading.value = false), 400)
})

// 🔹 Detectar errores globales
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

@media (max-width: 767px) {
  .main-content {
    padding-top: 15px;
  }
}
</style>