import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Estado para el loading general (botones, secciones, etc.)
  const loading = reactive({
    active: false,
    progress: 0,
    message: 'Cargando...',
    variant: 'circular'
  })

  // Estado para errores globales
  const error = ref(null)

  // Estado para la pantalla completa de carga (overlay)
  const screenLoading = ref(false)
  const screenMessage = ref('Cargando...')

  // FUNCIONES DE LOADING LOCAL

  function showLoading({ message = 'Cargando...', variant = 'circular', progress = 0 } = {}) {
    loading.message = message
    loading.variant = variant
    loading.progress = progress
    loading.active = true
  }

  function hideLoading() {
    loading.active = false
    loading.progress = 0
    loading.message = 'Cargando...'
  }

   //FUNCIONES DE LA PANTALLA DE CARGA COMPLETA

  function showScreenLoading(message = 'Cargando...') {
    screenMessage.value = message
    screenLoading.value = true
  }

  function hideScreenLoading() {
    screenLoading.value = false
    screenMessage.value = 'Cargando...'
  }

  // FUNCIONES DE ERROR GLOBAL
    function setProgress(value) {
    loading.progress = Math.max(0, Math.min(100, Math.round(value)))
  }

  function setError(payload) {
    if (typeof payload === 'string') {
      error.value = { message: payload }
    } else {
      error.value = payload
    }
    try {
      sessionStorage.setItem('backend_error', JSON.stringify(error.value))
    } catch (e) {}
  }

  function clearError() {
    error.value = null
    try {
      sessionStorage.removeItem('backend_error')
    } catch (e) {}
  }

  return {
    // Estados
    loading,
    error,
    screenLoading,
    screenMessage,

    // Acciones
    showLoading,
    hideLoading,
    setProgress,

    showScreenLoading,
    hideScreenLoading,

    setError,
    clearError
  }
})
