<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="dashboard-sidebar">
      <div class="sidebar-header">
        <img src="@/assets/logo.png" alt="Momentum Logo" class="sidebar-logo" />
        <div class="time-display">{{ currentTime }}</div>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard/analytics" class="nav-item">
          <span class="nav-icon">📈</span>
          <span>Analytics</span>
        </router-link>
        <router-link to="/dashboard/weeklytasks" class="nav-item">
          <span class="nav-icon">📝</span>
          Weekly To Do
        </router-link>
        <router-link to="/dashboard/tasks" class="nav-item">
          <span class="nav-icon">📝</span>
          Tasks
        </router-link>
        <router-link to="/dashboard/calendar" class="nav-item">
          <span class="nav-icon">📅</span>
          Calendar
        </router-link>
        <router-link to="/dashboard/notes" class="nav-item">
          <span class="nav-icon">📝</span>
          Notes
        </router-link>
        <router-link to="/dashboard/focus" class="nav-item">
          <span class="nav-icon">⏱️</span>
          Focus
        </router-link>
        <router-link to="/dashboard/export" class="nav-item">
          <span class="nav-icon">📤</span>
          <span>Export</span>
        </router-link>
        <router-link to="/dashboard/settings" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span>Settings</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-main">
      <router-view></router-view>
    </main>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const handleLogout = () => {
  store.dispatch('auth/logout')
  router.push('/login')
}

let timeInterval
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: var(--background);
}

.dashboard-sidebar {
  width: 260px;
  background-color: var(--primary);
  padding: 2rem 1rem;
  color: var(--text);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
}

.sidebar-header {
  text-align: center;
  margin-bottom: 2rem;
}

.sidebar-logo {
  width: 180px;
  height: auto;
  margin-bottom: 1rem;
  animation: fadeIn 1s ease-in-out;
}

.time-display {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text);
  padding: 0.5rem;
  border-radius: 6px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  color: var(--text);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-item:hover, .nav-item.router-link-active {
  background-color: var(--secondary);
}

.nav-item i {
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--secondary);
  color: var(--text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  opacity: 0.9;
}

.dashboard-main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  background-color: var(--background);
}

@media (max-width: 768px) {
  .dashboard-sidebar {
    width: 70px;
    padding: 1rem 0.5rem;
  }

  .sidebar-logo {
    width: 40px;
  }

  .time-display {
    font-size: 0.875rem;
    padding: 0.25rem;
  }

  .nav-item span,
  .logout-btn span {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }

  .logout-btn {
    padding: 0.75rem;
  }

  .dashboard-main {
    margin-left: 70px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 