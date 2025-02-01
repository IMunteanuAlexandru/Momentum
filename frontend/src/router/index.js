import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// Lazy-loaded components
const Welcome = () => import('../views/Welcome.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Settings = () => import('../views/Settings.vue')

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome
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
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.auth.isAuthenticated
  
  // Routes that require guest access
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
    return
  }

  // Routes that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  next()
})

export default router 