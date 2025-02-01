<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const currentTheme = ref('theme-modern')

const isAuthenticated = computed(() => store.state.auth.isAuthenticated)
const username = computed(() => store.state.auth.user?.username)

const setTheme = (theme) => {
  currentTheme.value = theme
  localStorage.setItem('theme', theme)
  // Refresh the page
  window.location.reload()
}

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
    <nav v-if="!isAuthenticated" class="nav-header">
      <div class="logo">
        <router-link to="/" class="logo-link">Momentum</router-link>
      </div>
      <div class="auth-buttons">
        <router-link to="/login" class="btn-login">Login</router-link>
        <router-link to="/register" class="btn-register">Register</router-link>
      </div>
    </nav>

    <main :class="{ 'main-content': !isAuthenticated, 'full-height': isAuthenticated }">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
:root {
  /* Modern Theme */
  --modern-primary: #315659;
  --modern-secondary: #2978A0;
  --modern-background: #253031;
  --modern-text: #BCAB79;

  /* Retro Theme */
  --retro-primary: #423e37ff;
  --retro-secondary:  #6A8D92;
  --retro-background: #edebd7ff;
  --retro-text: #000;

  /* Dark Theme */
  --dark-primary: #134b42;
  --dark-secondary: #CA763A;
  --dark-background: #121212;
  --dark-text: #ffffff;

  /* Nature Theme */
  --nature-primary: #4caf50;
  --nature-secondary: #81c784;
  --nature-background: #f1f8e9;
  --nature-text: #1b5e20;

  /* Soft Theme */
  --soft-primary: #eac8ca;
  --soft-secondary: #f2d5f8;
  --soft-background: #ffffff;
  --soft-text: #717c89;
}

.theme-modern {
  --primary: var(--modern-primary);
  --secondary: var(--modern-secondary);
  --background: var(--modern-background);
  --text: var(--modern-text);
}

.theme-retro {
  --primary: var(--retro-primary);
  --secondary: var(--retro-secondary);;
  --background: var(--retro-background);
  --text: var(--retro-text);
}

.theme-dark {
  --primary: var(--dark-primary);
  --secondary: var(--dark-secondary);
  --background: var(--dark-background);
  --text: var(--dark-text);
}

.theme-nature {
  --primary: var(--nature-primary);
  --secondary: var(--nature-secondary);
  --background: var(--nature-background);
  --text: var(--nature-text);
}

.theme-soft {
  --primary: var(--soft-primary);
  --secondary: var(--soft-secondary);
  --background: var(--soft-background);
  --text: var(--soft-text);
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
  overflow-y: auto;
}

.full-height {
  min-height: 100vh;
  background-color: var(--background);
  color: var(--text);
  overflow-y: auto;
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