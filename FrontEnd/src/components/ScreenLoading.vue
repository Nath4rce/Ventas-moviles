<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm z-[99999]"
    >
      <!-- Logo o marca -->
      <div class="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center rounded-xl mb-4 shadow-md">
        <span class="text-white text-2xl font-bold">UPB</span>
      </div>

      <!-- Indicador -->
      <div v-if="variant === 'circular'" class="animate-spin rounded-full border-4 w-12 h-12 border-t-4 border-blue-600 border-opacity-70 mb-4"></div>
      <div v-else class="w-64 mb-4">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>

      <div class="text-center">
        <p class="font-semibold mb-2">{{ message }}</p>
        <p v-if="variant === 'linear'" class="text-xs text-gray-500">{{ progress }}%</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: 'Cargando...' },
  variant: { type: String, default: 'circular' },
  progress: { type: Number, default: 0 }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
