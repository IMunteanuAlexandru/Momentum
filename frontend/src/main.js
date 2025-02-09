import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import Toast Notification
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Import Firebase
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase Auth
const auth = getAuth(firebaseApp)
auth.useDeviceLanguage()

const app = createApp(App)

// Toast Configuration
const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Use plugins
app.use(router)
app.use(store)
app.use(Toast, toastOptions)

// Check authentication status on app start
store.dispatch('auth/checkAuth')

// Initialize tasks and calendar
store.dispatch('tasks/initTasks')
store.dispatch('calendar/initEvents')

// Mount the app
app.mount('#app')
