<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm z-[00000]"
      data-testid="screen-loading-overlay"
    >
      <div class="bg-white shadow-2xl rounded-2xl p-8 flex flex-col items-center w-80 border border-gray-200">
        <!-- Logo / Branding -->
        <div class="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center rounded-xl mb-4 shadow-md">
          <span class="text-white text-2xl font-bold">UPB</span>
        </div>

        <!-- Indicador -->
        <div v-if="variant === 'circular'" class="animate-spin rounded-full border-4 w-12 h-12 border-t-4 border-blue-600 border-opacity-70 mb-4"></div>
        <div v-else class="w-full mb-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: showProgress ? progress + '%' : '100%' }"
            ></div>
          </div>
        </div>

        <!-- Mensajes -->
        <div class="text-center">
          <p class="font-semibold mb-2">{{ displayMessage }}</p>
          <p v-if="showProgress" class="text-xs text-gray-500">{{ progress }}%</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '../stores/ui'

const ui = useUIStore()

// Ahora se conecta con screenLoading en lugar de loading
const visible = computed(() => ui.screenLoading)
const displayMessage = computed(() => ui.screenMessage)

// Mantiene compatibilidad si luego decides usar una barra de progreso
const variant = computed(() => ui.loading.variant)
const showProgress = computed(() => ui.loading.variant === 'linear')
const progress = computed(() => ui.loading.progress)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
