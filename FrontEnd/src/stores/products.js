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
      // Primero filtrar solo productos activos
      let filtered = state.products.filter((product) => product.isActive === true);
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
    /*
        // Productos del usuario actual
        userProducts: (state) => (userIdInstitucional) => {
          return state.products.filter((p) => p.sellerId === userIdInstitucional);
        },*/

    // Productos del usuario actual (TODOS: activos e inactivos)
    allUserProducts: (state) => (userIdInstitucional) => {
      const products = state.products.filter((p) => {
        const match = String(p.sellerId) === String(userIdInstitucional)
        return match
      })

      return products
    },

    // Productos del usuario actual (ALIAS de allUserProducts)
    userProducts: (state) => (userIdInstitucional) => {
      return state.products.filter((p) =>
        String(p.sellerId) === String(userIdInstitucional)
      )
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
          const newProducts = response.data.data.products.map((p) => ({
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

          // ✅ CAMBIO CRÍTICO: No borrar productos del usuario actual
          // Primero, identificar el ID institucional del usuario autenticado
          const currentUserIdInstitucional = localStorage.getItem('user')
            ? JSON.parse(localStorage.getItem('user')).id_institucional
            : null;

          if (currentUserIdInstitucional) {
            // Mantener productos del usuario actual
            const userProducts = this.products.filter(p => p.sellerId === currentUserIdInstitucional);

            // Eliminar productos que NO son del usuario y actualizar con los nuevos
            const otherProducts = newProducts.filter(p => p.sellerId !== currentUserIdInstitucional);

            // Combinar: productos del usuario + otros productos nuevos
            this.products = [...userProducts, ...otherProducts];

          } else {
            // Si no hay usuario autenticado, simplemente reemplazar todo
            this.products = newProducts;
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    // Obtener productos de un usuario específico (activos e inactivos)
    async fetchUserProducts(userIdInstitucional) {
      if (!userIdInstitucional) {
        console.warn('⚠️ No se proporcionó ID institucional');
        return;
      }

      this.loading = true;
      this.error = null;

      try {

        const response = await axios.get(`${API_URL}/products/user/${userIdInstitucional}`);

        if (response.data.success) {
          const userProducts = response.data.data.products.map((p) => ({
            id: p.id,
            title: p.titulo,
            description: p.descripcion,
            price: p.precio,
            category: p.categoria_nombre,
            categoryIcon: p.categoria_icono,
            categoria_id: p.categoria_id,
            images: p.imagenes || [p.imagen_principal].filter(Boolean),
            sellerId: userIdInstitucional,
            sellerName: p.vendedor_nombre,
            sellerPhone: p.vendedor_telefono,
            rating: p.rating_promedio || 0,
            reviewCount: p.total_resenas || 0,
            isActive: Boolean(p.is_active),
            createdAt: p.created_at,
          }));

          // Eliminar productos antiguos de este usuario del state
          this.products = this.products.filter(p => p.sellerId !== userIdInstitucional);

          // Agregar los productos del usuario (activos e inactivos)
          this.products.push(...userProducts);

          return userProducts;
        }
      } catch (error) {
        console.error("Error fetching user products:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductReviews(productId) {
      try {
        const id = parseInt(productId, 10);
        if (isNaN(id)) {
          console.error("Invalid product ID");
          return;
        }
        const response = await axios.get(`${API_URL}/reviews/product/${id}`);
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

    // Editar reseña existente
    async updateReview(reviewId, reviewData) {
      try {
        const response = await axios.put(
          `${API_URL}/reviews/${reviewId}`,
          reviewData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )

        if (response.data.success) {
          // Recargar reseñas del producto
          return response.data
        }
      } catch (error) {
        console.error('Error updating review:', error)
        throw error
      }
    },

    // Eliminar reseña
    async deleteReview(reviewId) {
      try {
        const response = await axios.delete(
          `${API_URL}/reviews/${reviewId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )

        if (response.data.success) {
          return response.data
        }
      } catch (error) {
        console.error('Error deleting review:', error)
        throw error
      }
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
    // Cambiar estado de producto (activar/desactivar) con confirmación
    async toggleProductStatus(productId, currentStatus) {
      try {
        const newStatus = currentStatus ? 0 : 1;
        const action = newStatus === 1 ? "activar" : "desactivar";

        // Llamada al backend
        const response = await axios.patch(
          `${API_URL}/products/${productId}/status`,
          { isActive: newStatus },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          // Actualizar estado local
          const product = this.products.find((p) => p.id === productId);
          if (product) {
            product.isActive = Boolean(newStatus);
          }

          return {
            success: true,
            product: product,
            message: response.data.message,
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
          message: error.response?.data?.message || "Error al actualizar el estado del producto",
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
          imagenes: productData.images.map(img => ({
            url: img.url,
            public_id: img.public_id
          }))
        };

        const response = await axios.put(`${API_URL}/products/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {

          // ✅ Actualizar localmente sin recargar todo
          const index = this.products.findIndex(p => p.id === id);
          if (index !== -1) {
            this.products[index] = {
              ...this.products[index],
              title: payload.titulo,
              description: payload.descripcion,
              price: payload.precio,
              images: payload.imagenes,
              isActive: payload.is_active
            };
          }

          return response.data;
        } else {
          throw new Error(response.data.message);
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

    // Obtener estado de inhabilitación de un producto
    async getDisabilityStatus(productId) {
      try {
        const response = await axios.get(`${API_URL}/products/${productId}/disability-status`)

        if (response.data.success) {
          return response.data.data
        }
        return { isDisabled: false }
      } catch (error) {
        console.error('Error al obtener estado de inhabilitación:', error)
        throw error
      }
    },

    // Enviar apelación
    async sendAppeal(productId, mensaje) {
      try {
        const response = await axios.post(`${API_URL}/products/${productId}/appeal`, {
          mensaje
        })

        return response.data
      } catch (error) {
        console.error('Error al enviar apelación:', error)
        throw error
      }
    }

  },
});
