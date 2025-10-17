import { defineStore } from 'pinia'

let nextId = 1

export const useNotificacionStore = defineStore('notificacion', {
  state: () => ({
    notificaciones: []
  }),
  actions: {
    push({ title, message, type = 'info', duration = 3000 }) {
      const id = nextId++
      const item = { id, title, message, type }
      this.notificaciones.push(item)
      if (duration > 0) {
        setTimeout(() => {
          this.remove(id)
        }, duration)
      }
      return id
    },
    success(message, title = 'Éxito', duration = 3000) {
      return this.push({ title, message, type: 'success', duration })
    },
    error(message, title = 'Error', duration = 4000) {
      return this.push({ title, message, type: 'danger', duration })
    },
    info(message, title = 'Información', duration = 3000) {
      return this.push({ title, message, type: 'info', duration })
    },
    warning(message, title = 'Advertencia', duration = 3500) {
      return this.push({ title, message, type: 'warning', duration })
    },
    remove(id) {
      this.notificaciones = this.notificaciones.filter(n => n.id !== id)
    },
    clear() {
      this.notificaciones = []
    }
  }
})


