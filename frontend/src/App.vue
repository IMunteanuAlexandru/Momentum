<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const currentTheme = ref('theme-light')

const isAuthenticated = computed(() => store.state.auth.isAuthenticated)
const username = computed(() => store.state.auth.user?.username)

const logout = () => {
  store.dispatch('auth/logout')
  router.push('/login')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
    document.documentElement.className = savedTheme
  }
})
</script>

<template>
  <div :class="[currentTheme]">
    <nav class="nav-header">
      <div class="logo">
        <router-link to="/" class="logo-link">Momentum</router-link>
      </div>
      <div v-if="!isAuthenticated" class="auth-buttons">
        <router-link to="/login" class="btn-login">Login</router-link>
        <router-link to="/register" class="btn-register">Register</router-link>
      </div>
      <div v-else class="user-menu">
        <router-link to="/settings" class="btn-settings">Settings</router-link>
        <span>{{ username }}</span>
        <button @click="logout" class="btn-logout">Logout</button>
      </div>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
:root {
  /* Retro Theme */
  --retro-primary: #f4a460;
  --retro-secondary: #8b4513;
  --retro-background: #faf0e6;
  --retro-text: #654321;

  /* Dark Theme */
  --dark-primary: #134b42;
  --dark-secondary: #CA763A;
  --dark-background: #121212;
  --dark-text: #ffffff;

  /* Light Theme */
  --light-primary: #6200ee;
  --light-secondary: #03dac6;
  --light-background: #ffffff;
  --light-text: #000000;

  /* Nature Theme */
  --nature-primary: #4caf50;
  --nature-secondary: #81c784;
  --nature-background: #f1f8e9;
  --nature-text: #1b5e20;

  /* Energy Theme (Soft Pink) */
  --energy-primary: #ff9ecd;
  --energy-secondary: #ffb7e3;
  --energy-background: #fff0f7;
  --energy-text: #d4367a;
}

.theme-retro {
  --primary: var(--retro-primary);
  --secondary: var(--retro-secondary);
  --background: var(--retro-background);
  --text: var(--retro-text);
}

.theme-dark {
  --primary: var(--dark-primary);
  --secondary: var(--dark-secondary);
  --background: var(--dark-background);
  --text: var(--dark-text);
}

.theme-light {
  --primary: var(--light-primary);
  --secondary: var(--light-secondary);
  --background: var(--light-background);
  --text: var(--light-text);
}

.theme-nature {
  --primary: var(--nature-primary);
  --secondary: var(--nature-secondary);
  --background: var(--nature-background);
  --text: var(--nature-text);
}

.theme-energy {
  --primary: var(--energy-primary);
  --secondary: var(--energy-secondary);
  --background: var(--energy-background);
  --text: var(--energy-text);
}

/* Global Styles */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--background);
}

/* Hide scrollbar globally */
::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

html {
  scrollbar-width: none;
}

body {
  -ms-overflow-style: none;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--primary);
  color: var(--text);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.btn-login, .btn-register, .btn-logout, .btn-settings {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  color: var(--text);
  background-color: var(--secondary);
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.btn-login:hover, .btn-register:hover, .btn-logout:hover, .btn-settings:hover {
  opacity: 0.9;
}

.main-content {
  min-height: calc(100vh - 64px);
  background-color: var(--background);
  color: var(--text);
  padding: 2rem;
  overflow-y: auto; /* Ensure scrolling is enabled */
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu span {
  color: var(--text);
  font-weight: 500;
}

.logo-link {
  color: var(--text);
  text-decoration: none;
  font-weight: 700;
}
</style>