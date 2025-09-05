import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [
      // Datos de prueba - en producción vendrían del backend
      {
        id: 1,
        title: 'Stickers para laptop',
        description: 'Stickers :D.',
        price: 5000,
        category: 'accesorios',
        images: [
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop&crop=center'
        ],
        sellerId: 2,
        sellerName: 'Juan Vendedor',
        rating: 4.8,
        reviewCount: 15,
        isActive: true,
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        title: 'Cuadernos',
        description: 'Cuadernos  de 100 hojas personalizados, rayas. Ideal para tomar apuntes no como yo.',
        price: 35000,
        category: 'papeleria',
        images: [
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center'
        ],
        sellerId: 2,
        sellerName: 'Juan Vendedor',
        sellerPhone: '573160571065',
        rating: 4.5,
        reviewCount: 8,
        isActive: true,
        createdAt: '2024-01-10'
      },
      {
        id: 3,
        title: 'Sandwich',
        description: 'Sandwich de pollo con lechuga, tomate y mayonesa. Fresco y delicioso.',
        price: 7000,
        category: 'alimentos',
        images: [
          'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300&h=200&fit=crop&crop=center'
        ],
        sellerId: 2,
        sellerName: 'Juan Vendedor',
        sellerPhone: '573160571065',
        rating: 4.2,
        reviewCount: 12,
        isActive: true,
        createdAt: '2024-01-12'
      },
      {
        id: 4,
        title: 'Calculadora Científica',
        description: 'Calculadora científica Casio fx-que se yo. Para que no te tires integral como yo.',
        price: 80000,
        category: 'accesorios',
        images: [
          'https://images.unsplash.com/photo-1587145820266-a5951ee6f2bb?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1587145820266-a5951ee6f2bb?w=300&h=200&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop&crop=center'
        ],
        sellerId: 2,
        sellerName: 'Juan Vendedor',
        rating: 4.9,
        reviewCount: 25,
        isActive: true,
        createdAt: '2024-01-08'
      }
    ],
    reviews: [
      {
        id: 1,
        productId: 1,
        userId: 3,
        userName: 'María Compradora',
        rating: 5,
        comment: 'Excelente laptop, muy rápida y perfecta para programar.',
        createdAt: '2024-01-16'
      },
      {
        id: 2,
        productId: 1,
        userId: 1,
        userName: 'Administrador',
        rating: 4,
        comment: 'Buena calidad, precio justo.',
        createdAt: '2024-01-17'
      }
    ],
    filters: {
      category: 'all',
      priceRange: { min: 100, max: 150000 },
      sortBy: 'rating' // rating, price, date
    }
  }),

  getters: {
    // Productos filtrados y ordenados
    filteredProducts: (state) => {
      let filtered = state.products.filter(product => product.isActive)
      
      // Filtrar por categoría
      if (state.filters.category !== 'all') {
        filtered = filtered.filter(product => product.category === state.filters.category)
      }
      
      // Filtrar por precio
      filtered = filtered.filter(product => 
        product.price >= state.filters.priceRange.min && 
        product.price <= state.filters.priceRange.max
      )
      
      // Ordenar
      switch (state.filters.sortBy) {
        case 'rating':
          return filtered.sort((a, b) => b.rating - a.rating)
        case 'price':
          return filtered.sort((a, b) => a.price - b.price)
        case 'date':
          return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        default:
          return filtered
      }
    },

    // Obtener producto por ID
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === parseInt(id))
    },

    // Obtener reseñas de un producto
    getProductReviews: (state) => (productId) => {
      return state.reviews.filter(review => review.productId === parseInt(productId))
    },

    // Verificar si el usuario puede dejar reseña
    canUserReview: (state) => (productId, userId) => {
      const today = new Date().toDateString()
      const userReviews = state.reviews.filter(review => 
        review.productId === parseInt(productId) && 
        review.userId === userId &&
        new Date(review.createdAt).toDateString() === today
      )
      return userReviews.length === 0
    }
  },

  actions: {
    // Actualizar filtros
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },

    // Agregar producto (solo vendedores)
    addProduct(productData) {
      const newProduct = {
        id: this.products.length + 1,
        ...productData,
        rating: 0,
        reviewCount: 0,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      }
      this.products.push(newProduct)
      return newProduct
    },

    // Agregar reseña
    addReview(reviewData) {
      const newReview = {
        id: this.reviews.length + 1,
        ...reviewData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      this.reviews.push(newReview)
      
      // Actualizar rating del producto
      this.updateProductRating(reviewData.productId)
      
      return newReview
    },

    // Actualizar rating promedio del producto
    updateProductRating(productId) {
      const productReviews = this.reviews.filter(review => review.productId === productId)
      if (productReviews.length > 0) {
        const averageRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
        const product = this.products.find(p => p.id === productId)
        if (product) {
          product.rating = Math.round(averageRating * 10) / 10
          product.reviewCount = productReviews.length
        }
      }
    }
  }
})
