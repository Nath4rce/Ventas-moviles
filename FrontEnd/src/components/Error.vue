<template> 
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg text-center">
      <div class="text-6xl mb-4 text-red-600">⚠️</div>
      <h1 class="text-2xl font-bold text-red-600 mb-2">¡Oops! Algo salió mal</h1>

      <!-- Mensaje real del backend -->
      <p v-if="realMessage" class="text-red-500 font-semibold mb-2">
        {{ realMessage }}
      </p>

      <p class="text-gray-600 mb-4">{{ friendlyMessage }}</p>

      <!-- Detalles en modo dev -->
      <div v-if="isDev && rawError" class="bg-red-50 text-left text-red-700 p-3 rounded-lg mb-4">
        <h3 class="font-semibold mb-1">Detalles del error:</h3>
        <pre class="text-xs whitespace-pre-wrap">{{ rawErrorDisplay }}</pre>
      </div>

      <p class="text-gray-500 mb-6">
        No te preocupes, nuestro equipo ha sido notificado.<br />
        Puedes intentar las siguientes acciones:
      </p>

      <div class="d-flex gap-2 justify-content-center">
        <button class="btn btn-outline-secondary" @click="goHome">Ir al inicio</button>
      </div>
      <p class="text-xs text-gray-400">
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

// ✅ Mensaje que se mostrará justo debajo del "Oops"
const realMessage = computed(() => {
  if (!rawError.value) return ''
  if (typeof rawError.value === 'object') {
    return rawError.value.message || rawError.value.error || ''
  }
  return String(rawError.value)
})

// Map de códigos (si el backend envía `code`) a mensajes amigables
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
