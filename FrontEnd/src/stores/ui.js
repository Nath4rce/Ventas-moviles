import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Estado para loaders locales (botones, secciones)
  const loading = reactive({
    active: false,
    progress: 0,
    message: 'Cargando...',
    variant: 'circular'
  })

  // Estado para errores globales
  const error = ref(null)

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

  function setProgress(value) {
    loading.progress = Math.max(0, Math.min(100, Math.round(value)))
  }

  // FUNCIONES DE ERROR GLOBAL
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

    // Acciones
    showLoading,
    hideLoading,
    setProgress,
    setError,
    clearError
  }
})
