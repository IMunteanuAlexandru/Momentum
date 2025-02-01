<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Login to Momentum</h2>
      <form @submit.prevent="handleSubmit" class="auth-form">
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

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <p class="auth-link">
          Don't have an account? 
          <router-link to="/register">Register here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const errors = ref({})

    const validateForm = () => {
      errors.value = {}
      if (!email.value) {
        errors.value.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(email.value)) {
        errors.value.email = 'Please enter a valid email'
      }
      if (!password.value) {
        errors.value.password = 'Password is required'
      }
      return Object.keys(errors.value).length === 0
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      loading.value = true
      try {
        await store.dispatch('auth/login', {
          email: email.value,
          password: password.value
        })
        router.push('/')
      } catch (error) {
        errors.value.general = error.message
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      loading,
      errors,
      handleSubmit
    }
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