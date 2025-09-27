import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [
      {
        id: 1,
        title: 'Bienvenido al eCommerce Universitario',
        message: '¡Gracias por registrarte! Explora nuestros productos y encuentra lo que necesitas.',
        type: 'info',
        userId: null, // null = todos los usuarios
        isRead: false,
        createdAt: '2024-01-20'
      },
      {
        id: 2,
        title: 'Nuevo producto disponible',
        message: 'Se ha agregado un nuevo producto en la categoría de accesorios.',
        type: 'success',
        userId: null,
        isRead: false,
        createdAt: '2024-01-19'
      }
    ],
    isSiteDisabled: false
  }),

  getters: {
    // Notificaciones para el usuario actual
    userNotifications: (state) => (userId) => {
      return state.notifications.filter(notification => 
        notification.userId === null || notification.userId === userId
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },

    // Notificaciones no leídas
    unreadNotifications: (state) => (userId) => {
      return state.notifications.filter(notification => 
        (notification.userId === null || notification.userId === userId) && !notification.isRead
      )
    },

    // Contador de notificaciones no leídas
    unreadCount: (state) => (userId) => {
      return state.unreadNotifications(userId).length
    }
  },

  actions: {
    // Crear nueva notificación
    createNotification(notificationData) {
      const newNotification = {
        id: this.notifications.length + 1,
        ...notificationData,
        isRead: false,
        createdAt: new Date().toISOString().split('T')[0]
      }
      this.notifications.push(newNotification)
      return newNotification
    },

    // Marcar notificación como leída
    markAsRead(notificationId) {
      const notification = this.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
      }
    },

    // Marcar todas las notificaciones como leídas
    markAllAsRead(userId) {
      this.notifications.forEach(notification => {
        if (notification.userId === null || notification.userId === userId) {
          notification.isRead = true
        }
      })
    },

    // Enviar notificación a todos los usuarios
    broadcastNotification(title, message, type = 'info') {
      this.createNotification({
        title,
        message,
        type,
        userId: null
      })
    },

    // Enviar notificación a usuario específico
    sendToUser(userId, title, message, type = 'info') {
      this.createNotification({
        title,
        message,
        type,
        userId
      })
    },

    // Deshabilitar/habilitar sitio
    toggleSiteStatus() {
      this.isSiteDisabled = !this.isSiteDisabled
      
      if (this.isSiteDisabled) {
        this.broadcastNotification(
          'Sitio temporalmente deshabilitado',
          'El sitio está temporalmente fuera de servicio por mantenimiento.',
          'warning'
        )
      } else {
        this.broadcastNotification(
          'Sitio habilitado',
          'El sitio está nuevamente disponible.',
          'success'
        )
      }
    }
  }
})
