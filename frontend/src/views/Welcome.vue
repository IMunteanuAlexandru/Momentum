<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <h1>Welcome to Momentum</h1>
      <div class="welcome-text">
        <p>
          Momentum is a web application designed to help users manage their time effectively. 
          It features task planning, productivity statistics, and an AI-powered voice assistant 
          for simple commands. The app includes user authentication, customizable design, 
          interactive charts, and notifications to keep users on track.
        </p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📋</div>
          <h3>Task Planning</h3>
          <p>Organize your tasks efficiently</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Statistics</h3>
          <p>Track your productivity</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>Goals</h3>
          <p>Set and achieve your goals</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>Themes</h3>
          <p>Customize your experience</p>
        </div>
      </div>

      <div class="cta-buttons" v-if="!isAuthenticated">
        <router-link to="/register" class="btn-primary">Get Started</router-link>
        <router-link to="/login" class="btn-secondary">Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Welcome',
  setup() {
    const store = useStore()
    const isAuthenticated = computed(() => store.state.auth.isAuthenticated)

    return {
      isAuthenticated
    }
  }
}
</script>

<style scoped>
.welcome-container {
  min-height: calc(100vh - 64px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: var(--background);
}

.welcome-content {
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

h1 {
  font-size: 3rem;
  color: var(--text);
  margin-bottom: 2rem;
  font-weight: bold;
}

.welcome-text {
  max-width: 800px;
  margin: 0 auto 4rem;
  color: var(--text);
  font-size: 1.2rem;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.feature-card {
  background-color: var(--background);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: var(--text);
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.feature-card p {
  color: var(--text);
  opacity: 0.8;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}

.btn-primary {
  background-color: var(--primary);
  color: var(--text);
}

.btn-secondary {
  background-color: var(--secondary);
  color: var(--text);
}

.btn-primary:hover, .btn-secondary:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .welcome-text {
    font-size: 1rem;
    padding: 0 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
}
</style> 