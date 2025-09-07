<template>
  <div id="app">
    <Navbar v-if="!isLoginPage" />
    <main class="main-content">
      <router-view />
    </main>
    <Footer v-if="!isLoginPage" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  setup() {
    const route = useRoute()
    
    const isLoginPage = computed(() => {
      return route.name === 'Login' || route.name === 'Register'
    })

    return {
      isLoginPage
    }
  }
}
</script>

<style>
/* Estilos específicos del componente App.vue */
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
