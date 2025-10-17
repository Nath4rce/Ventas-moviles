import { defineStore } from "pinia";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
//import API_URL from '../services/api.js'

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [],
    reviews: [],
    categories: [],
    loading: false,
    error: null,
    filters: {
      category: "all",
      priceRange: { min: null, max: null },
      sortBy: "rating",
    },
  }),

  getters: {
    // Productos filtrados y ordenados
    filteredProducts: (state) => {
      let filtered = state.products.filter((product) => product.isActive);
      // Filtrar por categoría
      if (state.filters.category !== "all") {
        filtered = filtered.filter(
          (product) => product.category === state.filters.category
        );
      }

      // Filtrar por precio
      filtered = filtered.filter((product) => {
        const minPrice = state.filters.priceRange.min || 0;
        const maxPrice = state.filters.priceRange.max || Infinity;
        return product.price >= minPrice && product.price <= maxPrice;
      });

      // Ordenar
      switch (state.filters.sortBy) {
        case "rating":
          return filtered.sort((a, b) => b.rating - a.rating);
        case "price":
          return filtered.sort((a, b) => a.price - b.price);
        case "date":
          return filtered.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        default:
          return filtered;
      }
    },

    // Productos del usuario actual
    userProducts: (state) => (userIdInstitucional) => {
      return state.products.filter((p) => p.sellerId === userIdInstitucional);
    },

    // Obtener producto por ID
    getProductById: (state) => (id) => {
      return state.products.find((product) => product.id === parseInt(id));
    },

    // Obtener reseñas de un producto
    getProductReviews: (state) => (productId) => {
      return state.reviews.filter(
        (review) => review.productId === parseInt(productId)
      );
    },

    // Verificar si el usuario puede dejar reseña
    canUserReview: (state) => (productId, userId) => {
      const userReviews = state.reviews.filter(
        (review) =>
          review.productId === parseInt(productId) && review.userId === userId
      );
      return userReviews.length === 0;
    },
  },

  actions: {
    // Actualizar filtros
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },

    async fetchProducts(filters = {}) {
      this.loading = true;
      this.error = null;
      try {
        const params = new URLSearchParams();
        if (filters.categoria_id)
          params.append("categoria_id", filters.categoria_nombre);
        if (filters.precio_min) params.append("precio_min", filters.precio_min);
        if (filters.precio_max) params.append("precio_max", filters.precio_max);
        if (filters.search) params.append("search", filters.search);
        if (filters.sort_by) params.append("sort_by", filters.sort_by);
        if (filters.sort_order) params.append("sort_order", filters.sort_order);

        const response = await axios.get(`${API_URL}/products?${params}`);

        if (response.data.success) {
          this.products = response.data.data.products.map((p) => ({
            id: p.id,
            title: p.titulo,
            description: p.descripcion,
            price: p.precio,
            category: p.categoria_nombre,
            categoryIcon: p.categoria_icono,
            images: [p.imagen_principal].filter(Boolean), // Usar imagen principal
            sellerId: p.vendedor_id_institucional,
            sellerName: p.vendedor_nombre,
            sellerPhone: p.vendedor_telefono,
            rating: p.rating_promedio || 0,
            reviewCount: p.total_resenas || 0,
            isActive: Boolean(p.is_active),
            createdAt: p.created_at,
          }));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductReviews(productId) {
      try {
        //console.log('Fetching reviews for product:', productId)
        const id = parseInt(productId, 10);
        if (isNaN(id)) {
          console.error("Invalid product ID");
          return;
        }
        const response = await axios.get(`${API_URL}/reviews/product/${id}`);
        //console.log('Reviews response:', response.data)
        if (response.data.success) {
          this.reviews = response.data.data.reviews.map((r) => ({
            id: r.id,
            userName: r.usuario_nombre,
            userInstitutionalId: r.usuario_id_institucional,
            userAvatar: r.usuario_avatar,
            rating: r.rating,
            comment: r.comentario,
            createdAt: r.created_at,
          }));
          //console.log('Mapped reviews:', this.reviews)
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    },

    async fetchCategories() {
      try {
        const response = await axios.get(`${API_URL}/products/categories`);
        if (response.data.success) {
          this.categories = response.data.data.categories;
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
    /*
    // Agregar producto (solo vendedores)
    async addProduct(productData) {
      this.loading = true
      try {
        const response = await axios.post(`${API_URL}/products`, {
          titulo: productData.title,
          descripcion: productData.description,
          precio: productData.price,
          categoria_id: productData.categoria_id,
          imagenes: productData.images
        })

        if (response.data.success) {
          await this.fetchProducts()
          return response.data.data.product
        }
      } catch (error) {
        console.error('Error adding product:', error)
        throw error
      } finally {
        this.loading = false
      }
    },*/

    async addProduct(productData) {
      this.loading = true;
      try {
        const categoriaId = Number(productData.categoria_id);
        if (isNaN(categoriaId)) {
          console.error(
            "❌ Categoría inválida. Debes seleccionar una categoría antes de publicar."
          );
          throw new Error("Debes seleccionar una categoría válida.");
        }

        // Arma el cuerpo validando y limpiando
        const payload = {
          titulo: productData.title?.trim(),
          descripcion: productData.description?.trim(),
          precio: Number(productData.price),
          categoria_id: Number(productData.categoria_id),
        };

        // Solo agregar imágenes si existen
        if (productData.images && productData.images.length > 0) {
          payload.imagenes = productData.images;
        }

        console.log("➡️ Enviando producto:", payload);

        const response = await axios.post(`${API_URL}/products`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          await this.fetchProducts();
          return response.data.data.product;
        }
      } catch (error) {
        console.error(
          "Error adding product:",
          error.response?.data || error.message
        );
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Agregar reseña
    addReview(reviewData) {
      const newReview = {
        id: this.reviews.length + 1,
        ...reviewData,
        createdAt: new Date().toISOString().split("T")[0],
      };
      this.reviews.push(newReview);

      // Actualizar rating del producto
      this.updateProductRating(reviewData.productId);

      return newReview;
    },

    // Actualizar rating promedio del producto
    updateProductRating(productId) {
      const productReviews = this.reviews.filter(
        (review) => review.productId === productId
      );
      if (productReviews.length > 0) {
        const averageRating =
          productReviews.reduce((sum, review) => sum + review.rating, 0) /
          productReviews.length;
        const product = this.products.find((p) => p.id === productId);
        if (product) {
          product.rating = Math.round(averageRating * 10) / 10;
          product.reviewCount = productReviews.length;
        }
      }
    },

    // Cambiar estado de producto (activar/desactivar)
    toggleProductStatus(productId) {
      const product = this.products.find((p) => p.id === productId);
      if (product) {
        product.isActive = !product.isActive;
        return {
          success: true,
          product: product,
          message: `Producto ${
            product.isActive ? "activado" : "desactivado"
          } exitosamente`,
        };
      }
      return {
        success: false,
        message: "Producto no encontrado",
      };
    },
  },
});
