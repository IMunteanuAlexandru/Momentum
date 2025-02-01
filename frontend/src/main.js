import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

// Use plugins
app.use(router)
app.use(store)

// Check authentication status on app start
store.dispatch('auth/checkAuth')

// Initialize tasks and calendar
store.dispatch('tasks/initTasks')
store.dispatch('calendar/initEvents')

// Mount the app
app.mount('#app')
