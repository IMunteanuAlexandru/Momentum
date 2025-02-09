<template>
  <div class="dashboard-layout">
    <nav class="sidebar">
      <div class="sidebar-header">
        <img src="/logo.png" alt="Logo" class="logo" />
        <h1>Momentum</h1>
      </div>

      <div class="user-info">
        <img :src="userPhotoURL || '/default-avatar.png'" :alt="userDisplayName" class="avatar" />
        <div class="user-details">
          <h3>{{ userDisplayName }}</h3>
          <p>{{ userEmail }}</p>
        </div>
      </div>

      <div class="nav-links">
        <router-link to="/dashboard/overview" class="nav-link" active-class="active">
          <i class="fas fa-home"></i>
          Overview
        </router-link>
        
        <router-link to="/dashboard/tasks" class="nav-link" active-class="active">
          <i class="fas fa-tasks"></i>
          Tasks
        </router-link>
        
        <router-link to="/dashboard/calendar" class="nav-link" active-class="active">
          <i class="fas fa-calendar"></i>
          Calendar
        </router-link>
        
        <router-link to="/dashboard/notes" class="nav-link" active-class="active">
          <i class="fas fa-sticky-note"></i>
          Notes
        </router-link>
      </div>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </nav>

    <main class="main-content">
      <header class="top-bar">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search..." v-model="searchQuery" @input="handleSearch" />
        </div>

        <div class="top-bar-actions">
          <button class="btn-icon" @click="toggleNotifications">
            <i class="fas fa-bell"></i>
            <span v-if="unreadNotifications" class="notification-badge">{{ unreadNotifications }}</span>
          </button>
          
          <button class="btn-icon" @click="toggleTheme">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </header>

      <div class="content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'DashboardLayout',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const searchQuery = ref('')
    const isDarkMode = ref(false)
    const unreadNotifications = ref(0)

    const userDisplayName = computed(() => {
      const user = store.getters['auth/currentUser']
      return user?.displayName || 'User'
    })

    const userEmail = computed(() => {
      const user = store.getters['auth/currentUser']
      return user?.email || ''
    })

    const userPhotoURL = computed(() => {
      const user = store.getters['auth/currentUser']
      return user?.photoURL || null
    })

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    const handleSearch = () => {
      // Implement search functionality
      console.log('Searching for:', searchQuery.value)
    }

    const toggleNotifications = () => {
      // Implement notifications toggle
      console.log('Toggle notifications')
    }

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      document.documentElement.classList.toggle('dark-mode')
    }

    onMounted(() => {
      // Check if dark mode is enabled in localStorage
      const darkMode = localStorage.getItem('darkMode') === 'true'
      isDarkMode.value = darkMode
      if (darkMode) {
        document.documentElement.classList.add('dark-mode')
      }
    })

    return {
      searchQuery,
      isDarkMode,
      unreadNotifications,
      userDisplayName,
      userEmail,
      userPhotoURL,
      handleLogout,
      handleSearch,
      toggleNotifications,
      toggleTheme
    }
  }
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background-color: var(--background);
  border-right: 1px solid var(--primary);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.logo {
  width: 40px;
  height: 40px;
}

.sidebar-header h1 {
  color: var(--text);
  font-size: 1.5rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--background-secondary);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h3 {
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-details p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: var(--text);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link i {
  width: 20px;
  text-align: center;
}

.nav-link:hover {
  background-color: var(--background-secondary);
}

.nav-link.active {
  background-color: var(--primary);
  color: var(--text);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background-color: var(--energy-primary);
  color: var(--text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-logout:hover {
  opacity: 0.9;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--background-secondary);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--background);
  border-bottom: 1px solid var(--primary);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--background-secondary);
  border-radius: 8px;
  width: 300px;
}

.search-bar input {
  border: none;
  background: none;
  color: var(--text);
  width: 100%;
}

.search-bar input:focus {
  outline: none;
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: var(--background-secondary);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--energy-primary);
  color: var(--text);
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    bottom: 0;
    z-index: 100;
    transition: left 0.3s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .main-content {
    margin-left: 0;
  }

  .search-bar {
    width: 200px;
  }
}
</style> 