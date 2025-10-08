import { defineStore } from 'pinia'
import axios from 'axios'

// Configurar la URL base de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Configurar axios con interceptor para el token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.rol === 'admin',
    isSeller: (state) => state.user?.rol === 'seller',
    isBuyer: (state) => state.user?.rol === 'buyer',
    isLoading: (state) => state.loading
  },

  actions: {
    // Login del usuario
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          idInstitucional: credentials.studentId,
          password: credentials.password
        })

        if (response.data.success) {
          const { token, user } = response.data.data

          // Guardar token y usuario
          this.token = token
          this.user = {
            id: user.id,
            studentId: user.idInstitucional,
            id_institucional: user.idInstitucional,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
            role: user.rol, // Mantener compatibilidad
            name: user.nombre,
            isActive: user.isActive
          }
          this.isAuthenticated = true

          // Guardar en localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(this.user))

          return { success: true, user: this.user }
        }

        return { success: false, message: 'Error en el login' }

      } catch (error) {
        console.error('Error en login:', error)
        this.error = error.response?.data?.message || 'Error al iniciar sesión'
        
        return { 
          success: false, 
          message: error.response?.data?.message || 'Credenciales incorrectas' 
        }
      } finally {
        this.loading = false
      }
    },

    // Registro de nuevo usuario
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post(`${API_URL}/auth/register`, {
          idInstitucional: userData.studentId,
          email: userData.email,
          password: userData.password,
          nombre: userData.name
        })

        if (response.data.success) {
          const { token, user } = response.data.data

          this.token = token
          this.user = {
            id: user.id,
            studentId: user.idInstitucional,
            id_institucional: user.idInstitucional,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
            role: user.rol,
            name: user.nombre,
            isActive: user.isActive
          }
          this.isAuthenticated = true

          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(this.user))

          return { success: true, user: this.user }
        }

        return { success: false, message: 'Error en el registro' }

      } catch (error) {
        console.error('Error en registro:', error)
        this.error = error.response?.data?.message || 'Error al registrar'
        
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error al registrar usuario' 
        }
      } finally {
        this.loading = false
      }
    },

    // Obtener usuario actual
    async fetchCurrentUser() {
      this.loading = true

      try {
        const response = await axios.get(`${API_URL}/auth/me`)

        if (response.data.success) {
          const user = response.data.data.user

          this.user = {
            id: user.id,
            studentId: user.id_institucional,
            id_institucional: user.id_institucional,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
            role: user.rol,
            name: user.nombre,
            isActive: user.is_active
          }
          this.isAuthenticated = true

          localStorage.setItem('user', JSON.stringify(this.user))

          return { success: true, user: this.user }
        }

        return { success: false }

      } catch (error) {
        console.error('Error al obtener usuario:', error)
        this.logout()
        return { success: false }
      } finally {
        this.loading = false
      }
    },

    // Actualizar perfil
    async updateProfile(profileData) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.put(`${API_URL}/auth/profile`, {
          nombre: profileData.nombre,
          email: profileData.email
        })

        if (response.data.success) {
          const user = response.data.data.user

          this.user = {
            ...this.user,
            email: user.email,
            nombre: user.nombre,
            name: user.nombre
          }

          localStorage.setItem('user', JSON.stringify(this.user))

          return { success: true, user: this.user }
        }

        return { success: false, message: 'Error al actualizar perfil' }

      } catch (error) {
        console.error('Error al actualizar perfil:', error)
        this.error = error.response?.data?.message || 'Error al actualizar perfil'
        
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error al actualizar perfil' 
        }
      } finally {
        this.loading = false
      }
    },

    // Logout del usuario
    async logout() {
      try {
        // Llamar al endpoint de logout si existe
        if (this.token) {
          await axios.post(`${API_URL}/auth/logout`)
        }
      } catch (error) {
        console.error('Error en logout:', error)
      } finally {
        // Limpiar estado local
        this.user = null
        this.token = null
        this.isAuthenticated = false
        this.error = null

        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    // Verificar si el usuario tiene un rol específico
    hasRole(role) {
      return this.user?.rol === role
    },

    // Inicializar sesión desde localStorage
    initAuth() {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (token && savedUser) {
        this.token = token
        this.user = JSON.parse(savedUser)
        this.isAuthenticated = true

        // Verificar que el token siga válido
        this.fetchCurrentUser()
      }
    },

    // Crear nuevo usuario (solo admin) - ADMIN FEATURES
    async createUser(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post(`${API_URL}/admin/users`, {
          id_institucional: userData.studentId,
          email: userData.email,
          password: userData.password,
          nombre: userData.name,
          rol: userData.role
        })

        if (response.data.success) {
          return { success: true, user: response.data.data.user }
        }

        return { success: false, message: 'Error al crear usuario' }

      } catch (error) {
        console.error('Error al crear usuario:', error)
        this.error = error.response?.data?.message || 'Error al crear usuario'
        
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error al crear usuario' 
        }
      } finally {
        this.loading = false
      }
    },

    // Activar/desactivar usuario (solo admin)
    async toggleUserStatus(userId) {
      this.loading = true

      try {
        const response = await axios.put(`${API_URL}/admin/users/${userId}/toggle-status`)

        if (response.data.success) {
          return { success: true, message: response.data.message }
        }

        return { success: false, message: 'Error al cambiar estado' }

      } catch (error) {
        console.error('Error al cambiar estado:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error al cambiar estado' 
        }
      } finally {
        this.loading = false
      }
    },

    // Cambiar rol de usuario (solo admin)
    async changeUserRole(userId, newRole) {
      this.loading = true

      try {
        const response = await axios.put(`${API_URL}/admin/users/${userId}/role`, {
          rol: newRole
        })

        if (response.data.success) {
          return { success: true, message: response.data.message }
        }

        return { success: false, message: 'Error al cambiar rol' }

      } catch (error) {
        console.error('Error al cambiar rol:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error al cambiar rol' 
        }
      } finally {
        this.loading = false
      }
    },

    // Buscar usuarios por filtros (solo admin)
    async searchUsers(filters = {}) {
      this.loading = true

      try {
        const params = new URLSearchParams()
        if (filters.page) params.append('page', filters.page)
        if (filters.limit) params.append('limit', filters.limit)
        if (filters.rol && filters.rol !== 'all') params.append('rol', filters.rol)
        if (filters.status && filters.status !== 'all') params.append('status', filters.status)
        if (filters.search) params.append('search', filters.search)

        const response = await axios.get(`${API_URL}/admin/users?${params.toString()}`)

        if (response.data.success) {
          return { 
            success: true, 
            users: response.data.data.users,
            pagination: response.data.data.pagination
          }
        }

        return { success: false, users: [] }

      } catch (error) {
        console.error('Error al buscar usuarios:', error)
        return { success: false, users: [] }
      } finally {
        this.loading = false
      }
    }
  }
})