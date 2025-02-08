import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth'
import store from '../store'

// Lazy-loaded components
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Tasks = () => import('../views/dashboard/Tasks.vue')
const Calendar = () => import('../views/dashboard/Calendar.vue')
const Notes = () => import('../views/dashboard/Notes.vue')
const Analytics = () => import('../views/dashboard/Analytics.vue')
const Export = () => import('../views/dashboard/Export.vue')
const Settings = () => import('../views/Settings.vue')

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
        redirect: { name: 'Tasks' }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: Tasks
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: Calendar
      },
      {
        path: 'notes',
        name: 'Notes',
        component: Notes
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics
      },
      {
        path: 'export',
        name: 'Export',
        component: Export
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
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  try {
    // Așteaptă inițializarea Firebase Auth
    const user = await new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe()
        resolve(user)
      })
    })

    // Verifică dacă userul este autentificat în Vuex
    const isAuthenticated = store.getters['auth/isAuthenticated']
    
    // Dacă avem user în Firebase dar nu în Vuex, încercăm să-l setăm
    if (user && !isAuthenticated) {
      const token = await user.getIdToken()
      await store.dispatch('auth/setUser', {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
        token
      })
    }

    // Actualizăm starea de autentificare după potențiala setare
    const finalAuthState = store.getters['auth/isAuthenticated']

    if (requiresAuth && !finalAuthState) {
      next('/login')
    } else if (requiresGuest && finalAuthState) {
      next('/dashboard/tasks')
    } else {
      next()
    }
  } catch (error) {
    console.error('Navigation guard error:', error)
    if (requiresAuth) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router 