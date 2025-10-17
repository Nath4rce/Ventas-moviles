<template>
  <div class="toast-container position-fixed p-3" :class="positionClass" style="z-index: 1080;">
    <div
      v-for="n in notificaciones"
      :key="n.id"
      class="toast show align-items-center text-white border-0 mb-2"
      :class="mapTypeToBg(n.type)"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">
          <strong class="me-2">{{ n.title }}</strong>
          <span>{{ n.message }}</span>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="remove(n.id)"></button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useNotificacionStore } from '../stores/notificacion'

export default {
  name: 'NotificacionContainer',
  props: {
    position: {
      type: String,
      default: 'top-right'
    }
  },
  setup(props) {
    const store = useNotificacionStore()
    const notificaciones = computed(() => store.notificaciones)

    const positionClass = computed(() => {
      switch (props.position) {
        case 'top-left':
          return 'top-0 start-0'
        case 'bottom-right':
          return 'bottom-0 end-0'
        case 'bottom-left':
          return 'bottom-0 start-0'
        default:
          return 'top-0 end-0'
      }
    })

    const mapTypeToBg = (type) => {
      const map = {
        success: 'bg-success',
        danger: 'bg-danger',
        info: 'bg-primary',
        warning: 'bg-warning text-dark'
      }
      return map[type] || 'bg-secondary'
    }

    const remove = (id) => store.remove(id)

    return { notificaciones, positionClass, mapTypeToBg, remove }
  }
}
</script>

<style scoped>
.toast-container { pointer-events: none; }
.toast-container .toast { pointer-events: auto; min-width: 260px; }
</style>


