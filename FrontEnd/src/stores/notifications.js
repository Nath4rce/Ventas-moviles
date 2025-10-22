import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    _pollingInterval: null
  }),

  getters: {
    // Notificaciones ordenadas por prioridad y fecha
    sortedNotifications: (state) => {
      return [...state.notifications].sort((a, b) => {
        if (a.prioridad !== b.prioridad) {
          return b.prioridad - a.prioridad
        }
        return new Date(b.created_at) - new Date(a.created_at)
      })
    },

    // Notificaciones no leídas
    unreadNotifications: (state) => {
      return state.notifications.filter(n => !n.is_read)
    },

    // Últimas 5 notificaciones para el navbar
    recentNotifications: (state) => {
      return state.notifications
        .filter(n => !n.is_read)
        .slice(0, 5)
    }
  },

  actions: {
    // Obtener notificaciones del usuario actual
    async fetchNotifications(unreadOnly = false) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const params = unreadOnly ? { unread_only: true } : {}
        const response = await axios.get(`${API_URL}/notifications`, {
          params,
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.success) {
          this.notifications = response.data.data.notifications
          this.unreadCount = response.data.data.unread_count
        }
      } catch (error) {
        console.error('Error al obtener notificaciones:', error)
        this.error = 'Error al cargar notificaciones'
      } finally {
        this.loading = false
      }
    },

    // Marcar notificación como leída
    async markAsRead(notificationId) {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await axios.put(
          `${API_URL}/notifications/${notificationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (response.data.success) {
          // Actualizar el estado local
          const notification = this.notifications.find(n => n.id === notificationId)
          if (notification && !notification.is_read) {
            notification.is_read = true
            notification.leida_at = new Date().toISOString()
            this.unreadCount = Math.max(0, this.unreadCount - 1)
          }
        }
      } catch (error) {
        console.error('Error al marcar como leída:', error)
        throw error
      }
    },

    // Marcar todas como leídas
    async markAllAsRead() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await axios.put(
          `${API_URL}/notifications/read-all`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (response.data.success) {
          // Actualizar todas las notificaciones localmente
          this.notifications.forEach(n => {
            if (!n.is_read) {
              n.is_read = true
              n.leida_at = new Date().toISOString()
            }
          })
          this.unreadCount = 0
        }
      } catch (error) {
        console.error('Error al marcar todas como leídas:', error)
        throw error
      }
    },

    // Crear notificación (admin)
    async sendNotification(data) {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await axios.post(
          `${API_URL}/notifications`,
          {
            titulo: data.title,
            mensaje: data.message,
            tipo: data.type,
            destinatario_tipo: data.recipients === 'idInstitucional' ? 'id_institucional_especifico' : data.recipients,
            id_institucional_especifico: data.id_institucional || null
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        return response.data
      } catch (error) {
        console.error('Error al enviar notificación:', error)
        throw error
      }
    },

    // Polling automático
    startPolling(interval = 30000) {
      this.stopPolling()
      this._pollingInterval = setInterval(() => {
        this.fetchNotifications()
      }, interval)
    },

    stopPolling() {
      if (this._pollingInterval) {
        clearInterval(this._pollingInterval)
        this._pollingInterval = null
      }
    }
  }
})
