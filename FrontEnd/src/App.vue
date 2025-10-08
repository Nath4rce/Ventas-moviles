<template>
  <div id="app">
    <Navbar v-if="!isLoginPage" />
    <main class="main-content">
      <router-view />
    </main>
    <Footer v-if="!isLoginPage" />

    <!-- Pantalla de carga -->
    <ScreenLoading v-if="ui.screenLoading"/>
    
    <!-- Pantalla de error global -->
    <Error v-if="hasError" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import ScreenLoading from './components/ScreenLoading.vue'
import Error from './components/Error.vue'
import { useUIStore } from './stores/ui'

const route = useRoute()
const ui = useUIStore()

// Detectar si estamos en Login o Register
const isLoginPage = computed(() => {
  return route.name === 'Login' || route.name === 'Register'
})

// Mostrar Error.vue si el store o sessionStorage tiene un error guardado
const hasError = computed(() => {
  if (ui.error) return true
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

/* Estilos específicos para mobile */
@media (max-width: 767px) {
  .main-content {
    padding-top: 15px;
  }
}
</style>
