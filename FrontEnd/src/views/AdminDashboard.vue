<template>
  <div class="admin-dashboard">
    <div class="container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="fw-bold mb-1">
                <i class="fas fa-cog me-2"></i>
                Panel de Administración
              </h2>
              <p class="text-muted mb-0">Gestiona el marketplace de Ventas Moviles UPB</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-warning" @click="toggleSiteStatus" :disabled="loading">
                <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
                <i v-else :class="isSiteDisabled ? 'fas fa-play' : 'fas fa-pause'"></i>
                {{ isSiteDisabled ? 'Habilitar Sitio' : 'Deshabilitar Sitio' }}
              </button>
              <router-link to="/landing" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left me-2"></i>
                Volver
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerta de éxito/error -->
      <div v-if="alertMessage" :class="`alert alert-${alertType} alert-dismissible fade show`" role="alert">
        {{ alertMessage }}
        <button type="button" class="btn-close" @click="alertMessage = ''"></button>
      </div>

      <!-- Estado del sitio -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="alert" :class="isSiteDisabled ? 'alert-danger' : 'alert-success'">
            <i :class="isSiteDisabled ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'" class="me-2"></i>
            <strong>Estado del Sitio:</strong>
            {{ isSiteDisabled ? 'Deshabilitado temporalmente' : 'Operativo' }}
          </div>
        </div>
      </div>

      <!-- Estadísticas generales -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card custom-card-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="fw-bold">{{ stats.total_usuarios_activos }}</h4>
                  <p class="mb-0">Usuarios Registrados</p>
                </div>
                <i class="fas fa-users fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card custom-card-accent text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="fw-bold">{{ stats.total_productos_activos }}</h4>
                  <p class="mb-0">Productos Activos</p>
                </div>
                <i class="fas fa-box fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="fw-bold">{{ stats.total_resenas }}</h4>
                  <p class="mb-0">Reseñas Totales</p>
                </div>
                <i class="fas fa-star fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card bg-danger text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="fw-bold">{{ stats.total_productos_inactivos }}</h4>
                  <p class="mb-0">Productos Inactivos</p>
                </div>
                <i class="fas fa-ban fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card bg-warning bg-opacity-10 border-warning">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h4 class="fw-bold">{{ appeals.length }}</h4>
              <p class="mb-0">Apelaciones Pendientes</p>
            </div>
            <i class="fas fa-gavel fa-2x opacity-75 text-warning"></i>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="row g-4">
        <!-- Gestión de usuarios -->
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-users me-2"></i>
                  Gestión de Usuarios
                </h5>
                <button class="btn btn-primary btn-sm" @click="showCreateUserModal = true">
                  <i class="fas fa-user-plus me-1"></i>
                  Nuevo Usuario
                </button>
              </div>
            </div>
            <div class="card-body">
              <!-- Filtros de búsqueda -->
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Tipo de Usuario</label>
                  <select class="form-select" v-model="userFilters.rol">
                    <option value="all">Todos los tipos</option>
                    <option value="admin">Administrador</option>
                    <option value="seller">Vendedor</option>
                    <option value="buyer">Estudiante</option>
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Estado</label>
                  <select class="form-select" v-model="userFilters.status">
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>

              <!-- Tabla de usuarios -->
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>ID Institucional</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in paginatedUsers" :key="user.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <img :src="getAvatarUrl(user)" :alt="user.nombre" class="rounded-circle me-2" width="30"
                            height="30">
                          <div>
                            <div class="fw-semibold">{{ user.nombre }}</div>
                            <small class="text-muted">{{ user.email }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ user.id_institucional }}</span>
                      </td>
                      <td>
                        <span class="badge" :class="getRoleBadgeClass(user.rol)">
                          {{ getRoleName(user.rol) }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" :class="user.is_active ? 'bg-success' : 'bg-danger'">
                          {{ user.is_active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm" role="group">
                          <button class="btn btn-outline-warning"
                            @click="user.is_active ? openSanctionModal(user) : reactivateUser(user)"
                            :title="user.is_active ? 'Sancionar' : 'Reactivar'">
                            <i :class="user.is_active ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                          </button>
                          <button class="btn btn-outline-primary" @click="openChangeRoleModal(user)"
                            title="Cambiar rol">
                            <i class="fas fa-user-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <!-- Paginación de usuarios -->
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <div class="text-muted">
                    Mostrando {{ (userPagination.currentPage - 1) * userPagination.itemsPerPage + 1 }}
                    a {{ Math.min(userPagination.currentPage * userPagination.itemsPerPage, filteredUsers.length) }}
                    de {{ filteredUsers.length }} usuarios
                  </div>
                  <nav v-if="totalUserPages > 1">
                    <ul class="pagination pagination-sm mb-0">
                      <li class="page-item" :class="{ disabled: userPagination.currentPage === 1 }">
                        <button class="page-link"
                          @click="changePage('users', userPagination.currentPage - 1)">Anterior</button>
                      </li>
                      <li v-for="page in totalUserPages" :key="page" class="page-item"
                        :class="{ active: page === userPagination.currentPage }">
                        <button class="page-link" @click="changePage('users', page)">{{ page }}</button>
                      </li>
                      <li class="page-item" :class="{ disabled: userPagination.currentPage === totalUserPages }">
                        <button class="page-link"
                          @click="changePage('users', userPagination.currentPage + 1)">Siguiente</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de productos -->
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-box me-2"></i>
                  Gestión de Productos
                </h5>
              </div>
            </div>
            <div class="card-body">
              <!-- Filtros de búsqueda -->
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Buscar por título</label>
                  <input type="text" class="form-control" v-model="productFilters.title" placeholder="Ej: Calculadora"
                    @input="applyProductFilters">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Categoría</label>
                  <select class="form-select" v-model="productFilters.category" @change="applyProductFilters">
                    <option value="all">Todas las categorías</option>
                    <option value="alimentos">Alimentos</option>
                    <option value="accesorios">Accesorios</option>
                    <option value="papelería">Papelería</option>
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Estado</label>
                  <select class="form-select" v-model="productFilters.status" @change="applyProductFilters">
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>

              <!-- Tabla de productos -->
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Vendedor</th>
                      <th>Precio</th>
                      <th>Rating</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in paginatedProducts" :key="product.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <img :src="product.images[0]" :alt="product.title" class="rounded me-2" width="40" height="40"
                            style="object-fit: cover;">
                          <div>
                            <div class="fw-semibold">{{ product.title }}</div>
                            <small class="text-muted">{{ product.description.substring(0, 50) }}...</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ product.category }}</span>
                      </td>
                      <td>
                        <div class="fw-semibold">{{ product.sellerName }}</div>
                      </td>
                      <td>
                        <span class="fw-semibold">${{ formatPrice(product.price) }}</span>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <i class="fas fa-star text-warning me-1"></i>
                          <span class="fw-semibold">{{ product.rating }}</span>
                          <small class="text-muted ms-1">({{ product.reviewCount }})</small>
                        </div>
                      </td>
                      <td>
                        <span class="badge" :class="product.isActive ? 'bg-success' : 'bg-danger'">
                          {{ product.isActive ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm" rol="group">
                          <button class="btn btn-outline-warning"
                            @click="product.isActive ? openDisableProductModal(product) : reactivateProduct(product)"
                            :title="product.isActive ? 'Inhabilitar' : 'Reactivar'">
                            <i :class="product.isActive ? 'fas fa-ban' : 'fas fa-check-circle'"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- AGREGAR AQUÍ ↓ Paginación de productos -->
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="text-muted small">
                  Mostrando {{ (productPagination.currentPage - 1) * productPagination.itemsPerPage + 1 }}
                  a {{ Math.min(productPagination.currentPage * productPagination.itemsPerPage, filteredProducts.length)
                  }}
                  de {{ filteredProducts.length }} productos
                </div>
                <nav v-if="totalProductPages > 1">
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: productPagination.currentPage === 1 }">
                      <button class="page-link" @click="changePage('products', productPagination.currentPage - 1)">
                        <i class="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    <li v-for="page in totalProductPages" :key="page" class="page-item"
                      :class="{ active: page === productPagination.currentPage }">
                      <button class="page-link" @click="changePage('products', page)">{{ page }}</button>
                    </li>
                    <li class="page-item" :class="{ disabled: productPagination.currentPage === totalProductPages }">
                      <button class="page-link" @click="changePage('products', productPagination.currentPage + 1)">
                        <i class="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <!-- Productos recientes -->
        <div class="col-12 col-lg-6">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-box me-2"></i>
                Productos Recientes
              </h5>
            </div>
            <div class="card-body">
              <div v-if="recentProducts.length === 0" class="text-center py-3">
                <i class="fas fa-box text-muted mb-2" style="font-size: 2rem;"></i>
                <p class="text-muted mb-0">No hay productos</p>
              </div>
              <div v-else>
                <div v-for="product in recentProducts" :key="product.id"
                  class="d-flex align-items-center mb-3 p-2 border rounded">
                  <img :src="product.images[0]" :alt="product.title" class="rounded me-3" width="50" height="50"
                    style="object-fit: cover;">
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-semibold">{{ product.title }}</h6>
                    <small class="text-muted">
                      {{ product.sellerName }} • ${{ formatPrice(product.price) }}
                    </small>
                  </div>
                  <div class="text-end">
                    <span class="badge bg-primary">{{ product.category }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Apelaciones -->
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-gavel me-2"></i>
                Apelaciones Pendientes
              </h5>
            </div>
            <div class="card-body">
              <!-- Sin apelaciones -->
              <div v-if="appeals.length === 0" class="text-center py-5">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p class="text-muted">No hay apelaciones pendientes</p>
              </div>

              <!-- Lista de apelaciones -->
              <div v-else class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Vendedor</th>
                      <th>Motivo Original</th>
                      <th>Mensaje de Apelación</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="appeal in appeals" :key="appeal.id">
                      <td>
                        <strong>{{ appeal.producto_titulo }}</strong>
                      </td>
                      <td>
                        {{ appeal.vendedor_nombre }}
                        <br>
                        <small class="text-muted">{{ appeal.id_institucional }}</small>
                      </td>
                      <td>
                        <span class="badge bg-warning">{{ appeal.motivo }}</span>
                      </td>
                      <td>
                        <small>{{ appeal.apelacion_mensaje?.substring(0, 100) }}...</small>
                      </td>
                      <td>
                        <small>{{ new Date(appeal.apelacion_fecha).toLocaleDateString('es-ES') }}</small>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-success" @click="approveAppeal(appeal.id)" title="Aprobar">
                            <i class="fas fa-check"></i>
                          </button>
                          <button class="btn btn-danger" @click="rejectAppeal(appeal.id)" title="Rechazar">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>


        <!-- Envío de notificaciones -->
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="fas fa-bell me-2"></i>
                Enviar Notificación
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="sendNotification">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label for="notificationTitle" class="form-label fw-semibold">Título</label>
                    <input type="text" class="form-control" id="notificationTitle" v-model="notificationForm.title"
                      placeholder="Título de la notificación" required>
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="notificationType" class="form-label fw-semibold">Tipo</label>
                    <select class="form-select" id="notificationType" v-model="notificationForm.type" required>
                      <option value="info">Información</option>
                      <option value="success">Éxito</option>
                      <option value="warning">Advertencia</option>
                      <option value="danger">Importante</option>
                    </select>
                  </div>

                  <!-- Filtros de destinatarios -->
                  <div class="col-12 col-md-4">
                    <label class="form-label fw-semibold">Destinatarios</label>
                    <select class="form-select" v-model="notificationForm.recipients" @change="handleRecipientChange">
                      <option value="all">Todos los usuarios</option>
                      <option value="sellers">Solo vendedores</option>
                      <option value="students">Solo estudiantes</option>
                      <option value="idInstitucional">ID Institucional específico</option>
                    </select>
                  </div>

                  <div v-if="notificationForm.recipients === 'idInstitucional'" class="col-12 col-md-4">
                    <label class="form-label fw-semibold">ID Institucional </label>
                    <input type="text" class="form-control" v-model="notificationForm.id_institucional"
                      placeholder="Ej: 000497849" maxlength="9">
                  </div>

                  <div class="col-12">
                    <label for="notificationMessage" class="form-label fw-semibold">Mensaje</label>
                    <textarea class="form-control" id="notificationMessage" v-model="notificationForm.message" rows="3"
                      placeholder="Escribe tu mensaje aquí..." required></textarea>
                  </div>
                  <div class="col-12">
                    <div class="d-flex gap-2">
                      <button type="submit" class="btn btn-primary" :disabled="sendingNotification">
                        <i v-if="sendingNotification" class="fas fa-spinner fa-spin me-2"></i>
                        <i v-else class="fas fa-paper-plane me-2"></i>
                        {{ sendingNotification ? 'Enviando...' : 'Enviar Notificación' }}
                      </button>
                      <button type="button" class="btn btn-outline-secondary" @click="resetNotificationForm">
                        <i class="fas fa-undo me-2"></i>
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para crear usuario -->
      <div v-if="showCreateUserModal" class="modal show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Crear Nuevo Usuario</h5>
              <button type="button" class="btn-close" @click="showCreateUserModal = false"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createUser">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-semibold">ID Estudiantil *</label>
                    <input type="text" class="form-control" v-model="newUser.idInstitucional" placeholder="Ej: 20210001"
                      required>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">Nombre Completo *</label>
                    <input type="text" class="form-control" v-model="newUser.nombre" placeholder="Nombre del usuario"
                      required>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-semibold">Email *</label>
                    <input type="email" class="form-control" v-model="newUser.email"
                      placeholder="usuario@universidad.edu" required>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-semibold">Rol *</label>
                    <select class="form-select" v-model="newUser.rol" required>
                      <option value="buyer">Estudiante</option>
                      <option value="seller">Vendedor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">Contraseña *</label>
                    <input type="password" class="form-control" v-model="newUser.password"
                      placeholder="Contraseña temporal" required>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="showCreateUserModal = false">Cancelar</button>
                  <button type="submit" class="btn btn-primary" :disabled="creatingUser">
                    <i v-if="creatingUser" class="fas fa-spinner fa-spin me-2"></i>
                    {{ creatingUser ? 'Creando...' : 'Crear Usuario' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para cambiar rol -->
      <div v-if="showChangeRoleModal" class="modal show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Cambiar Rol de Usuario</h5>
              <button type="button" class="btn-close" @click="showChangeRoleModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <strong>Usuario:</strong> {{ selectedUser?.nombre }} ({{ selectedUser?.idInstitucional }})
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Nuevo Rol</label>
                <select class="form-select" v-model="newRole">
                  <option value="buyer">Estudiante</option>
                  <option value="seller">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showChangeRoleModal = false">Cancelar</button>
              <button type="button" class="btn btn-primary" @click="changeUserRole" :disabled="changingRole">
                <i v-if="changingRole" class="fas fa-spinner fa-spin me-2"></i>
                {{ changingRole ? 'Cambiando...' : 'Cambiar Rol' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay para modales -->
      <div v-if="showCreateUserModal || showChangeRoleModal" class="modal-backdrop show"></div>
    </div>

    <!-- Modal: Sancionar Usuario -->
    <div v-if="showSanctionModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title">
              <i class="fas fa-user-slash me-2"></i>
              Sancionar Usuario
            </h5>
            <button type="button" class="btn-close" @click="showSanctionModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedUser" class="alert alert-info">
              <strong>Usuario:</strong> {{ selectedUser.nombre }} ({{ selectedUser.id_institucional }})
            </div>

            <!-- Motivo de sanción -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                Motivo de Sanción <span class="text-danger">*</span>
              </label>
              <select v-model="sanctionForm.motivo" class="form-select" required>
                <option value="">Selecciona un motivo...</option>
                <option value="venta_sin_autorizacion">Venta sin autorización (Art. 16 literal a)</option>
                <option value="producto_no_autorizado">Producto no autorizado (Art. 16 literal b)</option>
                <option value="venta_estacionaria">Venta estacionaria (Art. 16 literal c)</option>
                <option value="incumplimiento_horario">Incumplimiento de horario (Art. 16 literal d)</option>
                <option value="recipiente_no_conforme">Recipiente no conforme (Art. 16 literal e)</option>
                <option value="productos_prohibidos">Productos prohibidos (Art. 16 literal f)</option>
                <option value="publicidad_no_autorizada">Publicidad no autorizada (Art. 16 literal g)</option>
                <option value="subarrendamiento">Subarrendamiento de espacio (Art. 16 literal h)</option>
                <option value="otro">Otro motivo</option>
              </select>
            </div>

            <!-- Descripción detallada -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                Descripción Detallada <span class="text-danger">*</span>
              </label>
              <textarea v-model="sanctionForm.descripcion" class="form-control" rows="4"
                placeholder="Describe los detalles de la infracción..." required maxlength="1000"></textarea>
              <small class="text-muted">
                {{ sanctionForm.descripcion.length }}/1000 caracteres
              </small>
            </div>

            <!-- Tipo de suspensión -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                Tipo de Suspensión <span class="text-danger">*</span>
              </label>
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" id="temporal" v-model="sanctionForm.tipo_suspension"
                  value="temporal">
                <label class="btn btn-outline-primary" for="temporal">
                  <i class="fas fa-clock me-2"></i>Temporal
                </label>

                <input type="radio" class="btn-check" id="permanente" v-model="sanctionForm.tipo_suspension"
                  value="permanente">
                <label class="btn btn-outline-danger" for="permanente">
                  <i class="fas fa-ban me-2"></i>Permanente
                </label>
              </div>
            </div>

            <!-- Duración (solo si es temporal) -->
            <div v-if="sanctionForm.tipo_suspension === 'temporal'" class="mb-3">
              <label class="form-label fw-semibold">Duración de la Suspensión</label>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small">Número de días</label>
                  <input type="number" v-model.number="sanctionForm.dias_suspension" @input="calculateEndDate"
                    class="form-control" min="1" max="365" placeholder="Ej: 15">
                </div>
                <div class="col-md-6">
                  <label class="form-label small">O selecciona fecha de fin</label>
                  <input type="date" v-model="sanctionForm.fecha_fin" @change="clearDays" class="form-control"
                    :min="today">
                </div>
              </div>

              <div v-if="sanctionEndDate" class="alert alert-info mt-2 mb-0">
                <i class="fas fa-calendar-check me-2"></i>
                La suspensión finalizará el: <strong>{{ formatDate(sanctionEndDate) }}</strong>
              </div>
            </div>

            <div v-else class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Atención:</strong> Esta suspensión será permanente hasta que un administrador la revoque
              manualmente.
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showSanctionModal = false">
              Cancelar
            </button>
            <button type="button" class="btn btn-warning" @click="confirmSanction" :disabled="!canSubmitSanction">
              <i class="fas fa-user-slash me-2"></i>
              Aplicar Sanción
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Inhabilitar Producto -->
    <div v-if="showDisableProductModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="fas fa-box-open me-2"></i>
              Inhabilitar Producto
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showDisableProductModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedProduct" class="alert alert-info">
              <div class="d-flex align-items-center">
                <img :src="selectedProduct.images?.[0] || 'https://via.placeholder.com/80'" class="rounded me-3"
                  width="80" height="80" style="object-fit: cover;">
                <div>
                  <strong>Producto:</strong> {{ selectedProduct.title }}<br>
                  <strong>Vendedor:</strong> {{ selectedProduct.sellerName }}
                </div>
              </div>
            </div>

            <!-- Motivo de inhabilitación -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                Motivo de Inhabilitación <span class="text-danger">*</span>
              </label>
              <select v-model="disableForm.motivo" class="form-select" required>
                <option value="">Selecciona un motivo...</option>
                <option value="producto_prohibido">Producto prohibido (Art. 9)</option>
                <option value="informacion_incorrecta">Información incorrecta o engañosa</option>
                <option value="imagenes_inadecuadas">Imágenes inadecuadas o de baja calidad</option>
                <option value="precio_no_conforme">Precio no conforme o no especificado</option>
                <option value="categoria_incorrecta">Categoría incorrecta</option>
                <option value="productos_vencidos">Productos vencidos o en mal estado</option>
                <option value="recipiente_no_conforme">Recipiente no conforme (Art. 12)</option>
                <option value="otro">Otro motivo</option>
              </select>
            </div>

            <!-- Feedback detallado -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                Feedback para el Vendedor <span class="text-danger">*</span>
              </label>
              <textarea v-model="disableForm.feedback" class="form-control" rows="5"
                placeholder="Explica qué cambios debe realizar el vendedor para que el producto pueda ser aprobado nuevamente..."
                required maxlength="1000"></textarea>
              <small class="text-muted">
                {{ disableForm.feedback.length }}/1000 caracteres
              </small>
            </div>

            <div class="alert alert-warning">
              <i class="fas fa-info-circle me-2"></i>
              <strong>Nota:</strong> El vendedor recibirá una notificación con este feedback y podrá apelar la decisión
              después de realizar las correcciones necesarias.
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDisableProductModal = false">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDisableProduct" :disabled="!canSubmitDisable">
              <i class="fas fa-ban me-2"></i>
              Inhabilitar Producto
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay para modales -->
    <div v-if="showSanctionModal || showDisableProductModal" class="modal-backdrop show"></div>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useProductsStore } from '../stores/products'
import { useNotificationsStore } from '../stores/notifications'
import { useNotificacion } from '../utils/useNotificacion'
import Swal from 'sweetalert2'


import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

export default {
  nombre: 'AdminDashboard',
  setup() {
    const authStore = useAuthStore()
    const productsStore = useProductsStore()
    const notificationsStore = useNotificationsStore()
    const notificacion = useNotificacion()

    const users = ref([])

    const alertMessage = ref('')
    const alertType = ref('success')

    const showAlert = (message, type = 'success') => {
      alertMessage.value = message
      alertType.value = type
      setTimeout(() => {
        alertMessage.value = ''
      }, 3000)
    }

    const showSwalAlert = (title, text, icon = 'success') => {
      Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: '#0d6efd',
        timer: 3000,
        timerProgressBar: true
      })
    }

    //SANCIONES E INHABILITACIONES

    // Variables para controlar visibilidad de modales
    const showSanctionModal = ref(false)
    const showDisableProductModal = ref(false)


    // Usuario/Producto seleccionado
    const selectedProduct = ref(null)

    // Formulario de sanción
    const sanctionForm = ref({
      motivo: '',
      descripcion: '',
      tipo_suspension: 'temporal',
      dias_suspension: null,
      fecha_fin: null
    })

    // Formulario de inhabilitación
    const disableForm = ref({
      motivo: '',
      feedback: ''
    })

    // Fecha de hoy (para el input date)
    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })

    // Fecha de fin calculada
    const sanctionEndDate = computed(() => {
      if (sanctionForm.value.tipo_suspension === 'permanente') return null

      if (sanctionForm.value.fecha_fin) {
        return new Date(sanctionForm.value.fecha_fin)
      }

      if (sanctionForm.value.dias_suspension) {
        const end = new Date()
        end.setDate(end.getDate() + sanctionForm.value.dias_suspension)
        return end
      }

      return null
    })

    // Validación formulario sanción
    const canSubmitSanction = computed(() => {
      const basic = sanctionForm.value.motivo &&
        sanctionForm.value.descripcion.length >= 10 &&
        sanctionForm.value.tipo_suspension

      if (sanctionForm.value.tipo_suspension === 'temporal') {
        return basic && (sanctionForm.value.dias_suspension > 0 || sanctionForm.value.fecha_fin)
      }

      return basic
    })

    // Validación formulario inhabilitación
    const canSubmitDisable = computed(() => {
      return disableForm.value.motivo &&
        disableForm.value.feedback.length >= 10
    })

    const appeals = ref([])

    // Cargar apelaciones
    const fetchAppeals = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/appeals`)
        if (response.data.success) {
          appeals.value = response.data.data.appeals
        }
      } catch (error) {
        console.error('Error al cargar apelaciones:', error)
      }
    }

    // Funciones para fetch
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/stats`)
        if (response.data.success) {
          stats.value = response.data.data
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    const fetchUsers = async () => {
      try {
        // Pedir 100 usuarios (máximo permitido por validación)
        const response = await axios.get(`${API_URL}/admin/users?limit=100`)

        if (response.data.success) {
          users.value = response.data.data.users
          console.log('👥 Usuarios cargados:', users.value.length)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    const loading = ref(false)
    const sendingNotification = ref(false)
    const creatingUser = ref(false)
    const changingRole = ref(false)
    const showCreateUserModal = ref(false)
    const showChangeRoleModal = ref(false)
    const selectedUser = ref(null)
    const newRole = ref('buyer')

    const userFilters = ref({
      rol: 'all',
      status: 'all',
      search: ''
    })

    const productFilters = ref({
      title: '',
      category: 'all',
      status: 'all'
    })

    const userPagination = ref({
      currentPage: 1,
      itemsPerPage: 10
    })

    const productPagination = ref({
      currentPage: 1,
      itemsPerPage: 10
    })

    const newUser = reactive({
      idInstitucional: '',
      nombre: '',
      email: '',
      rol: 'buyer',
      password: ''
    })

    const notificationForm = reactive({
      title: '',
      message: '',
      type: 'info',
      recipients: 'all',
      id_institucional: '',
      priority: 1,
      permanent: false
    })

    // Estadísticas
    const stats = ref({
      total_usuarios_activos: 0,
      total_vendedores: 0,
      total_compradores: 0,
      total_productos_activos: 0,
      total_resenas: 0,
      total_categorias: 0,
      total_productos_inactivos: 0,
    })

    //filteredUsers
    const filteredUsers = computed(() => {
      let filtered = users.value

      if (userFilters.value.rol !== 'all') {
        filtered = filtered.filter(u => u.rol === userFilters.value.rol)
      }

      if (userFilters.value.status !== 'all') {
        const isActive = userFilters.value.status === 'active'
        filtered = filtered.filter(u => Boolean(u.is_active) === isActive)
      }

      if (userFilters.value.search) {
        const searchTerm = userFilters.value.search.toLowerCase()
        filtered = filtered.filter(u =>
          u.nombre.toLowerCase().includes(searchTerm) ||
          u.email?.toLowerCase().includes(searchTerm) ||
          u.id_institucional?.toString().includes(searchTerm)
        )
      }

      return filtered
    })

    // Paginación de usuarios
    const paginatedUsers = computed(() => {
      const start = (userPagination.value.currentPage - 1) * userPagination.value.itemsPerPage
      const end = start + userPagination.value.itemsPerPage
      return filteredUsers.value.slice(start, end)
    })

    const totalUserPages = computed(() =>
      Math.ceil(filteredUsers.value.length / userPagination.value.itemsPerPage)
    )

    // Paginación de productos
    const paginatedProducts = computed(() => {
      const start = (productPagination.value.currentPage - 1) * productPagination.value.itemsPerPage
      const end = start + productPagination.value.itemsPerPage
      return filteredProducts.value.slice(start, end)
    })

    const totalProductPages = computed(() =>
      Math.ceil(filteredProducts.value.length / productPagination.value.itemsPerPage)
    )

    const changePage = (pagination, page) => {
      if (page >= 1 && page <= (pagination === 'users' ? totalUserPages.value : totalProductPages.value)) {
        if (pagination === 'users') {
          userPagination.value.currentPage = page
        } else {
          productPagination.value.currentPage = page
        }
      }
    }

    // Productos filtrados
    const filteredProducts = computed(() => {
      let filtered = productsStore.products || []

      // Filtrar por título
      if (productFilters.value.title && productFilters.value.title.trim()) {
        const searchTerm = productFilters.value.title.toLowerCase().trim()
        filtered = filtered.filter(product =>
          product.titulo?.toLowerCase().includes(searchTerm) ||
          product.title?.toLowerCase().includes(searchTerm) ||
          product.descripcion?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm)
        )
      }

      // Filtrar por categoría
      if (productFilters.value.category !== 'all') {
        console.log('Filtrando por categoría:', productFilters.value.category)

        // Ver todas las categorías únicas antes de filtrar
        const uniqueCategories = [...new Set(filtered.map(p => p.categoria || p.category))]
        console.log('📂 Categorías disponibles:', uniqueCategories)

        filtered = filtered.filter(product => {
          const productCategory = (product.categoria || product.category || '').toLowerCase()
          const filterCategory = productFilters.value.category.toLowerCase()
          const match = productCategory === filterCategory

          if (!match && filtered.length < 10) {
            console.log('❌ No coincide:', productCategory, '!==', filterCategory)
          }

          return match
        })
        console.log('Después de filtrar por categoría:', filtered.length)
      }

      // Filtrar por estado
      if (productFilters.value.status !== 'all') {
        const isActive = productFilters.value.status === 'active'
        filtered = filtered.filter(product => {
          const status = product.isActive ?? product.is_active ?? product.activo
          return Boolean(status) === isActive
        })
        console.log('✅ Después de filtrar por estado:', filtered.length)
      }

      return filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || a.fecha_creacion || 0)
        const dateB = new Date(b.createdAt || b.created_at || b.fecha_creacion || 0)
        return dateB - dateA
      })
    })

    // Productos recientes
    const recentProducts = computed(() =>
      (productsStore.products || [])
        .filter(p => p.isActive)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    )

    // Estado del sitio
    const isSiteDisabled = computed(() => notificationsStore.isSiteDisabled)

    const getAvatarUrl = (user) => {
      if (user?.avatar_url) return user.avatar_url
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'U')}&background=random&size=128`
    }

    const getRoleName = (rol) => {
      const names = {
        admin: 'Administrador',
        seller: 'Vendedor',
        buyer: 'Comprador'
      }
      return names[rol] || 'Usuario'
    }

    const getRoleBadgeClass = (rol) => {
      const classes = {
        admin: 'bg-danger',
        seller: 'bg-warning text-dark',
        buyer: 'bg-primary'
      }
      return classes[rol] || 'bg-secondary'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX').format(price)
    }

    const toggleSiteStatus = async () => {
      loading.value = true
      try {
        notificationsStore.toggleSiteStatus()
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      } finally {
        loading.value = false
      }
    }

    const sendNotification = async () => {
      sendingNotification.value = true
      try {
        await notificationsStore.sendNotification({
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type,
          recipients: notificationForm.recipients,
          id_institucional: notificationForm.id_institucional
        })

        resetNotificationForm()
        showAlert('Notificación enviada exitosamente', 'success')
      } catch (error) {
        console.log('Error completo:', error.response?.data) // Para ver el error del backend
        showAlert(error.response?.data?.message || 'Error al enviar la notificación', 'danger')
      } finally {
        sendingNotification.value = false
      }
    }

    const resetNotificationForm = () => {
      notificationForm.title = ''
      notificationForm.message = ''
      notificationForm.type = 'info'
      notificationForm.recipients = 'all'
      notificationForm.nrc = ''
    }

    // Funciones de gestión de usuarios
    const applyUserFilters = () => {
      // Los filtros se aplican automáticamente por computed
    }

    // Funciones de gestión de productos
    const applyProductFilters = () => {
      // Los filtros se aplican automáticamente por computed
    }

    // admin-dashboard.vue (Tu código actualizado en <script>)

    const toggleProductStatus = async (productId) => {
      console.log('Attempting to toggle product ID:', productId);

      try {
        // Asegúrate de usar 'await' aquí
        const result = await productsStore.toggleProductStatus(productId);

        if (result.success) {
          notificacion.success(`Producto ${result.product.isActive ? 'activado' : 'desactivado'} exitosamente`);
          await fetchStats(); // Si es necesario actualizar las estadísticas del dashboard
        } else {
          // Este mensaje proviene de un error controlado en la store
          notificacion.error(result.message);
        }
      } catch (error) {
        // Este catch maneja errores de red, de CORS, o errores no controlados de la store
        console.error('Error al ejecutar toggleProductStatus:', error);
        notificacion.error('Error de red o servidor. No se pudo actualizar el producto.');
      }
    }

    const createUser = async () => {
      creatingUser.value = true
      try {
        const result = await authStore.createUser(newUser)
        if (result.success) {
          notificacion.success('Usuario creado exitosamente')
          showCreateUserModal.value = false
          resetNewUserForm()
        } else {
          notificacion.error(result.message)
        }
      } catch (error) {
        notificacion.error('Error al crear el usuario')
      } finally {
        creatingUser.value = false
      }
    }

    const resetNewUserForm = () => {
      newUser.idInstitucional = ''
      newUser.nombre = ''
      newUser.email = ''
      newUser.rol = 'buyer'
      newUser.password = ''
    }

    const toggleUserStatus = async (user) => {
      if (!user || user.id === undefined) {
        notificacion.error('Error: Información de usuario incompleta.');
        return;
      }

      try {
        // Llama a la tienda con el ID
        const result = await authStore.toggleUserStatus(user.id)

        if (result.success) {

          const updatedUser = users.value.find(u => u.id === user.id);
          await fetchUsers()

          if (updatedUser) {
            notificacion.success(`Usuario ${updatedUser.is_active ? 'activado' : 'desactivado'} exitosamente`);
          } else {
            notificacion.success(`Estado cambiado exitosamente (ID: ${user.id}).`);
          }

        } else {
          notificacion.error(result.message || 'Error al cambiar el estado del usuario');
        }
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        notificacion.error('Error al cambiar el estado del usuario');
      }
    }

    const openChangeRoleModal = (user) => {
      selectedUser.value = user
      newRole.value = user.rol
      showChangeRoleModal.value = true
    }

    const changeUserRole = async () => {
      changingRole.value = true
      try {
        const result = authStore.changeUserRole(selectedUser.value.id, newRole.value)
        if (result.success) {
          notificacion.success('Rol cambiado exitosamente')
          showChangeRoleModal.value = false
        } else {
          notificacion.error(result.message)
        }
      } catch (error) {
        notificacion.error('Error al cambiar el rol')
      } finally {
        changingRole.value = false
      }
    }

    const handleRecipientChange = () => {
      if (notificationForm.recipients !== 'nrc') {
        notificationForm.nrc = ''
      }
    }

    // Calcular fecha de fin basada en días
    const calculateEndDate = () => {
      if (sanctionForm.value.dias_suspension) {
        sanctionForm.value.fecha_fin = null // Limpiar fecha manual
      }
    }

    // Limpiar días cuando se selecciona fecha manual
    const clearDays = () => {
      if (sanctionForm.value.fecha_fin) {
        sanctionForm.value.dias_suspension = null
      }
    }

    // Formatear fecha para mostrar
    const formatDate = (date) => {
      if (!date) return ''
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(date))
    }

    // Abrir modal de sanción
    const openSanctionModal = (user) => {
      selectedUser.value = user
      sanctionForm.value = {
        motivo: '',
        descripcion: '',
        tipo_suspension: 'temporal',
        dias_suspension: null,
        fecha_fin: null
      }
      showSanctionModal.value = true
    }

    // Abrir modal de inhabilitación
    const openDisableProductModal = (product) => {
      selectedProduct.value = product
      disableForm.value = {
        motivo: '',
        feedback: ''
      }
      showDisableProductModal.value = true
    }

    // Confirmar sanción
    const confirmSanction = async () => {
      if (!canSubmitSanction.value) return

      try {
        const payload = {
          usuario_id: selectedUser.value.id,
          motivo: sanctionForm.value.motivo,
          descripcion: sanctionForm.value.descripcion,
          tipo_suspension: sanctionForm.value.tipo_suspension
        }

        if (sanctionForm.value.tipo_suspension === 'temporal') {
          if (sanctionForm.value.dias_suspension) {
            payload.dias_suspension = sanctionForm.value.dias_suspension
          } else if (sanctionForm.value.fecha_fin) {
            payload.fecha_fin = sanctionForm.value.fecha_fin
          }
        }

        const response = await axios.post(`${API_URL}/admin/users/sanction`, payload)

        if (response.data.success) {
          const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id)
          if (userIndex !== -1) {
            users.value[userIndex].is_active = 0
          }

          showSanctionModal.value = false // Cerrar modal

          Swal.fire({
            title: '¡Usuario sancionado!',
            text: 'La sanción ha sido aplicada y el usuario ha sido notificado.',
            icon: 'success',
            confirmButtonColor: '#0d6efd'
          })
        }
      } catch (error) {
        console.error('Error al sancionar usuario:', error)
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Error al aplicar sanción',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
      }
    }


    // Confirmar inhabilitación
    const confirmDisableProduct = async () => {
      if (!canSubmitDisable.value) return

      try {
        const response = await axios.post(`${API_URL}/admin/products/disable`, {
          producto_id: selectedProduct.value.id,
          motivo: disableForm.value.motivo,
          feedback: disableForm.value.feedback
        })

        if (response.data.success) {
          const product = productsStore.products.find(p => p.id === selectedProduct.value.id)
          if (product) {
            product.isActive = false
            product.is_active = false
          }

          showDisableProductModal.value = false // Cerrar modal

          Swal.fire({
            title: '¡Producto inhabilitado!',
            text: 'El vendedor ha sido notificado sobre la inhabilitación.',
            icon: 'success',
            confirmButtonColor: '#0d6efd'
          })

          await fetchStats()
        }
      } catch (error) {
        console.error('Error al inhabilitar producto:', error)
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo inhabilitar el producto',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
      }
    }


    // Reactivar usuario
    const reactivateUser = async (user) => {
      const result = await Swal.fire({
        title: '¿Reactivar usuario?',
        text: `Se reactivará a ${user.nombre}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, reactivar',
        cancelButtonText: 'Cancelar'
      })

      if (!result.isConfirmed) return

      try {
        await axios.post(`${API_URL}/admin/users/${user.id}/reactivate`)

        // Actualizar localmente
        const userIndex = users.value.findIndex(u => u.id === user.id)
        if (userIndex !== -1) {
          users.value[userIndex].is_active = 1
        }

        Swal.fire({
          title: '¡Usuario reactivado!',
          icon: 'success',
          confirmButtonColor: '#0d6efd',
          timer: 2000,
          timerProgressBar: true
        })
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo reactivar el usuario',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
      }
    }

    // Reactivar producto
    const reactivateProduct = async (product) => {
      const result = await Swal.fire({
        title: '¿Reactivar producto?',
        text: `Se reactivará "${product.title}"`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, reactivar',
        cancelButtonText: 'Cancelar'
      })

      if (!result.isConfirmed) return

      try {
        await axios.post(`${API_URL}/admin/products/${product.id}/reactivate`)

        // Actualizar en el store
        const storeProduct = productsStore.products.find(p => p.id === product.id)
        if (storeProduct) {
          storeProduct.isActive = true
          storeProduct.is_active = true
        }

        Swal.fire({
          title: '¡Producto reactivado!',
          icon: 'success',
          confirmButtonColor: '#0d6efd',
          timer: 2000,
          timerProgressBar: true
        })

        await fetchStats() // Actualizar estadísticas
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo reactivar el producto',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
      }
    }

    // Aprobar apelación
    const approveAppeal = async (appealId) => {
      const result = await Swal.fire({
        title: '¿Aprobar apelación?',
        text: 'El producto será reactivado',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, aprobar',
        cancelButtonText: 'Cancelar'
      })

      if (!result.isConfirmed) return

      try {
        await axios.post(`${API_URL}/admin/appeals/${appealId}/approve`)

        Swal.fire({
          title: '¡Apelación aprobada!',
          text: 'El producto ha sido reactivado',
          icon: 'success',
          confirmButtonColor: '#0d6efd'
        })

        await fetchAppeals()
        await fetchStats()
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo aprobar la apelación',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
      }
    }

    // Rechazar apelación
    const rejectAppeal = async (appealId) => {
      const result = await Swal.fire({
        title: '¿Rechazar apelación?',
        text: 'El producto permanecerá inhabilitado',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, rechazar',
        cancelButtonText: 'Cancelar'
      })

      if (!result.isConfirmed) return

      try {
        await axios.post(`${API_URL}/admin/appeals/${appealId}/reject`)

        Swal.fire({
          title: 'Apelación rechazada',
          icon: 'info',
          confirmButtonColor: '#0d6efd'
        })

        await fetchAppeals()
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo rechazar la apelación',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        })
      }
    }


    onMounted(async () => {
      // Inicializar autenticación si hay datos guardados
      authStore.initAuth()

      await productsStore.fetchAllProducts()
      await notificationsStore.fetchNotifications()
      await fetchStats()
      await fetchUsers()
      await fetchAppeals()
    })

    return {
      stats,
      users,
      fetchStats,
      fetchUsers,
      loading,
      sendingNotification,
      creatingUser,
      changingRole,
      showCreateUserModal,
      showChangeRoleModal,
      selectedUser,
      newRole,
      userFilters,
      productFilters,
      newUser,
      notificationForm,
      alertMessage,
      alertType,
      stats,
      filteredUsers,
      filteredProducts,
      recentProducts,
      isSiteDisabled,
      getRoleName,
      getRoleBadgeClass,
      formatPrice,
      toggleSiteStatus,
      sendNotification,
      resetNotificationForm,
      applyUserFilters,
      applyProductFilters,
      toggleProductStatus,
      createUser,
      resetNewUserForm,
      toggleUserStatus,
      openChangeRoleModal,
      changeUserRole,
      handleRecipientChange,
      getAvatarUrl,
      paginatedUsers,
      paginatedProducts,
      userPagination,
      productPagination,
      totalUserPages,
      totalProductPages,
      changePage,
      selectedUser,
      selectedProduct,
      sanctionForm,
      disableForm,
      today,
      sanctionEndDate,
      canSubmitSanction,
      canSubmitDisable,
      calculateEndDate,
      clearDays,
      formatDate,
      showSanctionModal,
      showDisableProductModal,
      openSanctionModal,
      openDisableProductModal,
      confirmSanction,
      confirmDisableProduct,
      reactivateUser,
      reactivateProduct,
      showSwalAlert,
      appeals,
      fetchAppeals,
      approveAppeal,
      rejectAppeal
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  border-bottom: 1px solid #e9ecef;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75rem;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(139, 0, 0, 0.25);
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .admin-dashboard {
    padding: 1rem 0;
  }

  .d-flex.gap-2 {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .card-body {
    padding: 1rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1199px) {
  .admin-dashboard {
    padding: 1.5rem 0;
  }
}
</style>
