import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    users: [
      // Datos de prueba - en producción vendrían del backend
      {
        id: 1,
        studentId: '20210001',
        email: 'admin@universidad.edu',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        isActive: true,
        nrc: '00000'
      },
      {
        id: 2,
        studentId: '20210002',
        email: 'vendedor@universidad.edu',
        password: 'vendedor123',
        role: 'seller',
        name: 'Juan Vendedor',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        isActive: true,
        nrc: '11111'
      },
      {
        id: 3,
        studentId: '20210003',
        email: 'comprador@universidad.edu',
        password: 'comprador123',
        role: 'buyer',
        name: 'María Compradora',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        isActive: true,
        nrc: '12345'
      },
      {
        id: 4,
        studentId: '20210004',
        email: 'estudiante@universidad.edu',
        password: 'estudiante123',
        role: 'buyer',
        name: 'Carlos Estudiante',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        isActive: true,
        nrc: '67890'
      },
      {
        id: 5,
        studentId: '20210005',
        email: 'vendedor2@universidad.edu',
        password: 'vendedor123',
        role: 'seller',
        name: 'Ana Vendedora',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        isActive: false,
        nrc: '54321'
      }
    ]
  }),

  getters: {
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isSeller: (state) => state.user?.role === 'seller',
    isBuyer: (state) => state.user?.role === 'buyer'
  },

  actions: {
    // Login del usuario
    async login(credentials) {
      const user = this.users.find(u => 
        u.studentId === credentials.studentId && 
        u.password === credentials.password
      )
      
      if (user) {
        this.user = user
        this.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(user))
        return { success: true, user }
      }
      
      return { success: false, message: 'Credenciales incorrectas' }
    },

    // Registro de nuevo usuario
    async register(userData) {
      // Verificar si el ID estudiantil ya existe
      const existingUser = this.users.find(u => u.studentId === userData.studentId)
      if (existingUser) {
        return { success: false, message: 'ID estudiantil ya registrado' }
      }

      // Verificar si el email ya existe
      const existingEmail = this.users.find(u => u.email === userData.email)
      if (existingEmail) {
        return { success: false, message: 'Email ya registrado' }
      }

      // Crear nuevo usuario
      const newUser = {
        id: this.users.length + 1,
        studentId: userData.studentId,
        email: userData.email,
        password: userData.password,
        role: 'buyer', // Por defecto es comprador
        name: userData.name || `Usuario ${userData.studentId}`,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
      }

      this.users.push(newUser)
      return { success: true, user: newUser }
    },

    // Logout del usuario
    logout() {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('user')
    },

    // Verificar si el usuario tiene un rol específico
    hasRole(role) {
      return this.user?.role === role
    },

    // Inicializar sesión desde localStorage
    initAuth() {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        this.user = JSON.parse(savedUser)
        this.isAuthenticated = true
      }
    },

    // Crear nuevo usuario (solo admin)
    async createUser(userData) {
      // Verificar si el ID estudiantil ya existe
      const existingUser = this.users.find(u => u.studentId === userData.studentId)
      if (existingUser) {
        return { success: false, message: 'ID estudiantil ya registrado' }
      }

      // Verificar si el email ya existe
      const existingEmail = this.users.find(u => u.email === userData.email)
      if (existingEmail) {
        return { success: false, message: 'Email ya registrado' }
      }

      // Crear nuevo usuario
      const newUser = {
        id: Math.max(...this.users.map(u => u.id)) + 1,
        studentId: userData.studentId,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'buyer',
        name: userData.name,
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        isActive: true,
        nrc: userData.nrc
      }

      this.users.push(newUser)
      return { success: true, user: newUser }
    },

    // Activar/desactivar usuario
    toggleUserStatus(userId) {
      const user = this.users.find(u => u.id === userId)
      if (user) {
        user.isActive = !user.isActive
        return { success: true, user }
      }
      return { success: false, message: 'Usuario no encontrado' }
    },

    // Cambiar rol de usuario
    changeUserRole(userId, newRole) {
      const user = this.users.find(u => u.id === userId)
      if (user) {
        user.role = newRole
        return { success: true, user }
      }
      return { success: false, message: 'Usuario no encontrado' }
    },

    // Buscar usuarios por filtros
    searchUsers(filters = {}) {
      let filteredUsers = [...this.users]

      if (filters.nrc) {
        filteredUsers = filteredUsers.filter(u => u.nrc.includes(filters.nrc))
      }

      if (filters.role && filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.role === filters.role)
      }

      if (filters.status && filters.status !== 'all') {
        const isActive = filters.status === 'active'
        filteredUsers = filteredUsers.filter(u => u.isActive === isActive)
      }

      return filteredUsers
    }
  }
})
