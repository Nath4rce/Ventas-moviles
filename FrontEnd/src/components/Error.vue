<template> 
  <div class="flex items-center justify-center min-h-screen bg-gray-50">

   <div class="bg-white shadow-2xl rounded-2xl p-16 w-full max-w-5xl text-center border border-gray-200 min-h-[80vh] ">

      <!-- Ícono de alerta -->
      <div class="text-8xl mb-4 text-red-500 drop-shadow-sm">
        <i class="fas fa-triangle-exclamation fa-6x"></i>
      </div>

      <!-- Título -->
      <h1 class="text-3xl font-bold text-red-600 mb-3">¡Oops! Algo salió mal</h1>

      <!-- Mensaje real del backend -->
      <p v-if="realMessage" class="text-red-500 font-semibold mb-3">
        {{ realMessage }}
      </p>

      <!-- Mensaje amigable -->
      <p class="text-gray-600 mb-5 leading-relaxed">
        {{ friendlyMessage }}
      </p>

      <!-- Detalles técnicos (solo en dev) -->
      <div 
        v-if="isDev && rawError" 
        class="bg-red-50 text-left text-red-700 p-3 rounded-xl mb-5 border border-red-200 overflow-x-auto"
      >
        <h3 class="font-semibold mb-2 text-sm">Detalles del error:</h3>
        <pre class="text-xs font-mono whitespace-pre-wrap">{{ rawErrorDisplay }}</pre>
      </div>

      <!-- Texto de ayuda -->
      <p class="text-gray-500 mb-5 text-sm">
        No te preocupes, nuestro equipo ha sido notificado.<br />
        Puedes intentar las siguientes acciones:
      </p>

      <!-- Botón (sin cambiar estilo original) -->
      <div class="d-flex gap-2 justify-content-center">
        <button class="btn btn-outline-secondary btn-lg px-5 py-2" @click="goHome">Ir al inicio</button>
      </div>

      <!-- Footer -->
      <p class="text-xs text-gray-400 mt-5">
        Si el problema persiste, contacta al administrador del sistema.<br />
        Sistema de Registro de Limpieza - UPB v1.0.0
      </p>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '../stores/ui'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()

const rawError = computed(() => {
  if (ui.error) return ui.error
  try {
    const s = sessionStorage.getItem('backend_error')
    if (s) return JSON.parse(s)
  } catch (e) {}
  if (route?.query?.error) {
    try { return JSON.parse(route.query.error) } catch (e) { return route.query.error }
  }
  return null
})

const realMessage = computed(() => {
  if (!rawError.value) return ''
  if (typeof rawError.value === 'object') {
    return rawError.value.message || rawError.value.error || ''
  }
  return String(rawError.value)
})

const ERROR_MAP = {
  'ER_DUP_ENTRY': 'Recurso duplicado (entrada ya existe).',
  'AUTH_REQUIRED': 'Autenticación requerida.',
}

const friendlyMessage = computed(() => {
  if (!rawError.value) return 'Ha ocurrido un error inesperado en la aplicación.'
  if (typeof rawError.value === 'object') {
    if (rawError.value.code && ERROR_MAP[rawError.value.code]) {
      return ERROR_MAP[rawError.value.code]
    }
    if (rawError.value.message) return rawError.value.message
    if (rawError.value.error) return rawError.value.error
    return JSON.stringify(rawError.value)
  }
  return String(rawError.value)
})

const rawErrorDisplay = computed(() => {
  if (!rawError.value) return ''
  if (typeof rawError.value === 'object') {
    return JSON.stringify(rawError.value, null, 2)
  }
  return String(rawError.value)
})

const isDev = computed(() => import.meta.env.MODE === 'development')
function goHome() { router.push('/') }
</script>
