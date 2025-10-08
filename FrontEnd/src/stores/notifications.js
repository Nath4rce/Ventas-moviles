import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL
//import API_URL from '../services/api.js'


export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false,
    error: null,
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

    async fetchNotifications() {
      this.loading = true
      try {
        const response = await axios.get(`${API_URL}/notifications`)
        if (response.data.success) {
          this.notifications = response.data.data.notifications
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        this.loading = false
      }
    },

    async markAsRead(notificationId) {
      try {
        await axios.put(`${API_URL}/notifications/${notificationId}/read`)
        await this.fetchNotifications()
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    },

    async sendNotification(data) {
      try {
        const response = await axios.post(`${API_URL}/notifications`, {
          titulo: data.title,
          mensaje: data.message,
          tipo: data.type,
          destinatario_tipo: data.recipients === 'nrc' ? 'id_institucional_especifico' : data.recipients,
          id_institucional_especifico: data.id_institucional || null,
          prioridad: data.priority || 1,
          es_permanente: data.permanent || false
        })
        return response.data
      } catch (error) {
        console.error('Error sending notification:', error)
        throw error
      }
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
