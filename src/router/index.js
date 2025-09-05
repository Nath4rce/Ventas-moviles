import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy loading de componentes
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Landing = () => import('../views/Landing.vue')
const ProductDetail = () => import('../views/ProductDetail.vue')
const PublishProduct = () => import('../views/PublishProduct.vue')
const AdminDashboard = () => import('../views/AdminDashboard.vue')
const Notifications = () => import('../views/Notifications.vue')
const Profile = () => import('../views/Profile.vue')

const routes = [
  {
    path: '/',
    redirect: '/landing'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/landing',
    name: 'Landing',
    component: Landing,
    meta: { requiresAuth: true }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/publish',
    name: 'PublishProduct',
    component: PublishProduct,
    meta: { requiresAuth: true, requiresRole: 'seller' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Verificar si la ruta es solo para invitados
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/landing')
    return
  }
  
  // Verificar roles específicos
  if (to.meta.requiresRole && !authStore.hasRole(to.meta.requiresRole)) {
    next('/landing')
    return
  }
  
  next()
})

export default router
