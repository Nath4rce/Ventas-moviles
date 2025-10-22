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

    // Obtener TODOS los productos (para admin)
    async fetchAllProducts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/products/admin/all`);

        if (response.data.success) {
          this.products = response.data.data.products.map((p) => ({
            id: p.id,
            title: p.titulo,
            description: p.descripcion,
            price: p.precio,
            category: p.categoria_nombre,
            categoryIcon: p.categoria_icono,
            images: p.imagenes || [p.imagen_principal].filter(Boolean),
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
        console.error("Error fetching all products:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchProducts(filters = {}) {
      this.loading = true;
      this.error = null;
      try {
        const params = new URLSearchParams();
        if (filters.categoria_id)
          params.append("categoria_id", filters.categoria_id);
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
            images: p.imagenes || [p.imagen_principal].filter(Boolean),
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

    async addProduct(productData) {
      this.loading = true;
      try {
        const categoriaId = Number(productData.categoria_id);
        if (isNaN(categoriaId) || categoriaId <= 0) {
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
          categoria_id: categoriaId,
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
          return true;
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
    async toggleProductStatus(productId) {
      try {
        const product = this.products.find((p) => p.id === productId);
        if (!product) {
          return {
            success: false,
            message: "Producto no encontrado",
          };
        }

        const newStatus = product.isActive ? 0 : 1;

        // Llamada al backend
        const response = await axios.patch(
          `${API_URL}/products/${productId}/status`,
          { isActive: newStatus }
        );

        if (response.data.success) {
          // Actualizar estado local
          product.isActive = newStatus;

          return {
            success: true,
            product: product,
            message: `Producto ${newStatus === 1 ? "activado" : "desactivado"
              } exitosamente`,
          };
        }

        return {
          success: false,
          message: response.data.message || "Error al actualizar el producto",
        };
      } catch (error) {
        console.error("Error en toggleProductStatus:", error);
        return {
          success: false,
          message: "Error al actualizar el estado del producto",
        };
      }
    },

    // Actualizar Producto
    async updateProduct(productId, productData) {
      this.loading = true;
      try {
        const id = parseInt(productId, 10);
        if (isNaN(id) || id <= 0) {
          throw new Error("ID de producto inválido para la actualización.");
        }

        const payload = {
          titulo: productData.title?.trim(),
          descripcion: productData.description?.trim(),
          precio: Number(productData.price),
          categoria_id: Number(productData.categoria_id),
          is_active: productData.isActive,
          imagenes: productData.images,
        };

        console.log(`➡️ Enviando actualización para producto ${id}:`, payload);

        const response = await axios.put(`${API_URL}/products/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log('📥 Respuesta del servidor:', response.data);  // TEMPORAL PARA DEBUG

        if (response.data.success) {
          // Recargar los productos para obtener los datos actualizados
          await this.fetchProducts();
          return response.data;  // ✅ Solo devolver response.data
        } else {
          throw new Error(
            response.data.message || "Error desconocido al actualizar."
          );
        }
      } catch (error) {
        console.error(
          "Error updating product:",
          error.response?.data || error.message || error
        );
        this.error =
          "Error al actualizar el producto: " +
          (error.response?.data?.message || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Eliminar Producto
    async deleteProduct(productId) {
      this.loading = true;
      try {
        const id = parseInt(productId, 10);
        if (isNaN(id) || id <= 0) {
          throw new Error("ID de producto inválido para la eliminación.");
        }

        const response = await axios.delete(`${API_URL}/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          // Eliminar el producto del estado local (opcional, pero más rápido que fetch)
          this.products = this.products.filter((p) => p.id !== id);
        }
        return response.data;
      } catch (error) {
        console.error("Error deleting product:", error);
        this.error =
          "Error al eliminar el producto: " +
          (error.response?.data?.message || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
