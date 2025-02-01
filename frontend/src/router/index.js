import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Export from '@/views/dashboard/Export.vue'

// Lazy-loaded components
const Welcome = () => import('../views/Welcome.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Settings = () => import('../views/Settings.vue')
const Dashboard = () => import('../views/Dashboard.vue')

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome,
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Overview',
        component: () => import('../views/dashboard/Overview.vue')
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('../views/dashboard/Tasks.vue')
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('../views/dashboard/Calendar.vue')
      },
      {
        path: 'export',
        name: 'Export',
        component: Export
      },
      {
        path: 'notes',
        name: 'Notes',
        component: () => import('../views/dashboard/Notes.vue')
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('../views/dashboard/Analytics.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.auth.isAuthenticated
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 