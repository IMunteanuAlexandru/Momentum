<template>
  <div class="settings-container">
    <h1>Settings</h1>
    
    <div class="settings-section">
      <h2>Appearance</h2>
      <div class="setting-item">
        <label for="theme-select">Theme</label>
        <select 
          id="theme-select" 
          v-model="currentTheme" 
          @change="handleThemeChange" 
          class="theme-select"
        >
          <option value="theme-modern">Modern Theme</option>
          <option value="theme-retro">Retro Theme</option>
          <option value="theme-dark">Dark Theme</option>
          <option value="theme-nature">Nature Theme</option>
          <option value="theme-soft">Soft Theme</option>
        </select>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const currentTheme = ref('theme-modern')

const hasAccentColors = computed(() => {
  return ['theme-modern', 'theme-retro', 'theme-soft'].includes(currentTheme.value)
})

const handleThemeChange = () => {
  localStorage.setItem('theme', currentTheme.value)
  document.documentElement.className = currentTheme.value
  // Refresh the page
  window.location.reload()
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
  }
})
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: var(--text);
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.settings-section {
  background-color: var(--background);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--primary);
}

h2 {
  color: var(--text);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 500;
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-item label {
  display: block;
  color: var(--text);
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 1.1rem;
}

.theme-select {
  width: 100%;
  max-width: 300px;
  padding: 0.75rem;
  border: 2px solid var(--primary);
  border-radius: 6px;
  background-color: var(--background);
  color: var(--text);
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
}

.theme-select:hover {
  border-color: var(--secondary);
}

.theme-select:focus {
  outline: none;
  border-color: var(--secondary);
  box-shadow: 0 0 0 2px rgba(var(--secondary), 0.2);
}

@media (max-width: 640px) {
  .settings-container {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .settings-section {
    padding: 1.5rem;
  }

}
</style> 