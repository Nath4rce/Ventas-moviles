<template>
  <div id="app">
    <Navbar v-if="!isLoginPage" />
    <main class="main-content">
      <router-view />
    </main>
    <Footer v-if="!isLoginPage" />
        <ScreenLoading v-if="loading" message="Cargando página..." />
    <Error v-else-if="hasError" :error="errorMessage" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import ScreenLoading from "./components/ScreenLoading.vue";
import Error from "./components/Error.vue";

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
    ScreenLoading,
    Error
  },
  setup() {
    const route = useRoute()
    
    const isLoginPage = computed(() => {
      return route.name === 'Login' || route.name === 'Register'
    })

    return {
      isLoginPage
    }
  },
  data() {
    return {
      loading: false,
      hasError: false,
      errorMessage: null,
    };
  },
  created() {
    // Exponer el estado global para que el router lo controle
    window.$app = this;
  },
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
