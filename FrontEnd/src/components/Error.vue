<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg text-center">
      <div class="text-6xl mb-4 text-red-600">⚠️</div>
      <h1 class="text-2xl font-bold text-red-600 mb-2">¡Oops! Algo salió mal</h1>
      <p class="text-gray-600 mb-4">Ha ocurrido un error inesperado en la aplicación.</p>

      <!-- Detalles en modo dev -->
      <div v-if="isDev && error" class="bg-red-50 text-left text-red-700 p-3 rounded-lg mb-4">
        <h3 class="font-semibold mb-1">Detalles del error:</h3>
        <pre class="text-xs whitespace-pre-wrap">{{ error }}</pre>
      </div>

      <p class="text-gray-500 mb-6">
        No te preocupes, nuestro equipo ha sido notificado.<br />
        Puedes intentar las siguientes acciones:
      </p>

      <div class="flex justify-center gap-3 mb-4">
        <button
          @click="reload"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Recargar
        </button>
        <button
          @click="goHome"
          class="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium"
        >
          Ir al Inicio
        </button>
      </div>

      <p class="text-xs text-gray-400">
        Si el problema persiste, contacta al administrador del sistema.<br />
        Sistema de Registro de Limpieza - UPB v1.0.0
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ErrorScreen",
  props: {
    error: { type: String, default: null },
  },
  computed: {
    isDev() {
      return import.meta.env.MODE === "development";
    },
  },
  methods: {
    reload() {
      window.location.reload();
    },
    goHome() {
      this.$router.push("/");
    },
  },
};
</script>
