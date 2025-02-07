import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth'
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
    redirect: '/login'
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
    path: '/dashboard',
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
        component: Settings
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
router.beforeEach(async (to, from, next) => {
  const auth = getAuth()
  
  // Așteaptă inițializarea Firebase Auth
  await new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe()
      resolve(user)
    })
  })

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const isAuthenticated = !!auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 