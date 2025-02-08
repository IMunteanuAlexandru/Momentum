<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Create Account</h2>
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="displayName">Username</label>
          <input
            type="text"
            id="displayName"
            v-model="form.displayName"
            required
            class="form-input"
            :class="{ 'error': error }"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            class="form-input"
            :class="{ 'error': error }"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            class="form-input"
            :class="{ 'error': error }"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>

        <div class="divider">
          <span>or</span>
        </div>

        <button type="button" class="btn-google" @click="handleGoogleRegister" :disabled="loading">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" />
          Continue with Google
        </button>

        <p class="auth-link">
          Already have an account? 
          <router-link to="/login">Login here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getAuth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import axios from 'axios'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const store = useStore()
    const auth = getAuth()
    const googleProvider = new GoogleAuthProvider()
    googleProvider.addScope('profile')
    googleProvider.addScope('email')
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    })
    
    const form = ref({
      displayName: '',
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref('')

    const handleGoogleRegister = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const result = await signInWithPopup(auth, googleProvider)
        const token = await result.user.getIdToken()
        
        // Store user data in Vuex
        await store.dispatch('auth/setUser', {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid,
          token
        })

        // Register with backend
        await axios.post('http://localhost:5000/api/auth/google', {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid
        })

        router.push('/dashboard')
      } catch (e) {
        console.error('Registration error:', e)
        error.value = e.message || 'Registration failed'
        if (auth.currentUser) {
          await auth.currentUser.delete()
        }
      } finally {
        loading.value = false
      }
    }

    const handleRegister = async () => {
      loading.value = true
      error.value = ''
      
      try {
        // Create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          form.value.email,
          form.value.password
        )

        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: form.value.displayName
        })

        // Get token
        const token = await userCredential.user.getIdToken()

        // Store user data in Vuex
        await store.dispatch('auth/setUser', {
          email: userCredential.user.email,
          displayName: form.value.displayName,
          uid: userCredential.user.uid,
          token
        })

        // Register with backend
        await axios.post('http://localhost:5000/api/auth/google', {
          email: userCredential.user.email,
          displayName: form.value.displayName,
          uid: userCredential.user.uid
        })

        router.push('/dashboard')
      } catch (e) {
        console.error('Registration error:', e)
        error.value = e.message || 'Registration failed'
        if (auth.currentUser) {
          await auth.currentUser.delete()
        }
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleRegister,
      handleGoogleRegister
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
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary);
  color: var(--text);
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-submit:not(:disabled):hover {
  opacity: 0.9;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--text);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--primary);
}

.divider span {
  padding: 0 1rem;
}

.btn-google {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--background);
  border: 1px solid var(--primary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text);
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-google:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-google:not(:disabled):hover {
  background-color: var(--primary);
}

.btn-google img {
  width: 1.5rem;
  height: 1.5rem;
}

.auth-link {
  text-align: center;
  margin-top: 1.5rem;
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