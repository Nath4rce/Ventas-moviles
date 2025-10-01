<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center w-80">
      <!-- Logo / Branding -->
      <div class="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center rounded-xl mb-4">
        <span class="text-white text-2xl font-bold">UPB</span>
      </div>

      <!-- Indicador -->
      <div v-if="variant === 'circular'" class="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-70 mb-4"></div>
      <div v-else class="w-full mb-4">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: showProgress ? progress + '%' : '100%' }"
          ></div>
        </div>
        <p v-if="showProgress" class="text-xs text-gray-500 mt-1">{{ Math.round(progress) }}%</p>
      </div>

      <!-- Mensaje -->
      <h2 class="text-gray-700 font-semibold mb-1">{{ message }}</h2>
      <p class="text-xs text-gray-400">Sistema de Registro de Limpieza y Desinfección</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ScreenLoading",
  props: {
    message: { type: String, default: "Cargando..." },
    variant: { type: String, default: "circular" },
    showProgress: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
  },
};
</script>
