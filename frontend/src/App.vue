<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Notifications from './components/Notifications.vue'

const store = useStore()
const router = useRouter()
const currentTheme = ref('theme-modern')
const initialized = ref(false)
const auth = getAuth()

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

const setTheme = (theme) => {
  currentTheme.value = theme
  localStorage.setItem('theme', theme)
  document.documentElement.className = theme
}

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
    document.documentElement.className = savedTheme
  }

  // Monitor auth state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken()
        await store.dispatch('auth/setUser', {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
          token
        })
      } catch (error) {
        console.error('Error setting user:', error)
        await store.dispatch('auth/logout')
      }
    } else {
      await store.dispatch('auth/logout')
    }
    initialized.value = true
  })
})
</script>

<template>
  <div :class="[currentTheme]">
    <Notifications />
    <main :class="{ 'main-content': !isAuthenticated, 'full-height': isAuthenticated }">
      <router-view v-if="initialized"></router-view>
      <div v-else class="loading">
        <span>Loading...</span>
      </div>
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
  --retro-secondary: #6A8D92;
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
  color: var(--text);
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

.main-content {
  min-height: 100vh;
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.2rem;
  color: var(--text);
}
</style>