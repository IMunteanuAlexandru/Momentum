<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Create Account</h2>
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            class="form-input"
            :class="{ 'error': errors.username }"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="form-input"
            :class="{ 'error': errors.email }"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="form-input"
            :class="{ 'error': errors.password }"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            class="form-input"
            :class="{ 'error': errors.confirmPassword }"
          />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>

        <p class="auth-link">
          Already have an account? 
          <router-link to="/login">Login here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errors = ref({})
const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

let timeInterval
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // If already authenticated, redirect to dashboard
  if (store.state.auth.isAuthenticated) {
    router.push('/dashboard')
  }
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})

const validateForm = () => {
  errors.value = {}
  
  if (!username.value) {
    errors.value.username = 'Username is required'
  } else if (username.value.length < 3) {
    errors.value.username = 'Username must be at least 3 characters'
  }

  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Please enter a valid email'
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  errors.value = {}

  try {
    await store.dispatch('auth/register', {
      username: username.value,
      email: email.value,
      password: password.value
    })
    // Explicitly redirect to dashboard after successful registration
    router.push('/dashboard')
  } catch (error) {
    errors.value.general = error.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.auth-card {
  background-color: var(--background);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  text-align: center;
  color: var(--text);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--primary);
  border-radius: 4px;
  background-color: var(--background);
  color: var(--text);
}

.form-input.error {
  border-color: var(--energy-primary);
}

.error-message {
  color: var(--energy-primary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary);
  color: var(--text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  margin-top: 1rem;
  color: var(--text);
}

.auth-link a {
  color: var(--primary);
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style> 