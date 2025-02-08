<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Login to Momentum</h2>
      <form @submit.prevent="handleLogin" class="auth-form">
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
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <div class="divider">
          <span>or</span>
        </div>

        <button type="button" class="btn-google" @click="handleGoogleLogin" :disabled="loading">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" />
          Continue with Google
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
import { useRouter } from 'vue-router'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import axios from 'axios'
import { useStore } from 'vuex'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const auth = getAuth()
    const googleProvider = new GoogleAuthProvider()
    googleProvider.addScope('profile')
    googleProvider.addScope('email')
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    })
    
    const form = ref({
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref('')
    const store = useStore()

    const handleGoogleLogin = async () => {
      loading.value = true
      error.value = ''
      
      try {
        console.log('Starting Google login...')
        
        // Verifică dacă Firebase este inițializat corect
        if (!auth) {
          throw new Error('Firebase Auth is not initialized')
        }

        // Verifică configurația Firebase
        console.log('Firebase config:', {
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
        })

        // Încearcă autentificarea cu Google
        const result = await signInWithPopup(auth, googleProvider)
          .catch(error => {
            console.error('PopUp error:', error)
            if (error.code === 'auth/popup-blocked') {
              throw new Error('Please allow popups for this website')
            }
            if (error.code === 'auth/cancelled-popup-request') {
              throw new Error('Authentication cancelled')
            }
            throw error
          })

        if (!result?.user) {
          throw new Error('No user data received')
        }

        console.log('Google login successful:', {
          email: result.user.email,
          displayName: result.user.displayName,
          uid: result.user.uid
        })
        
        const token = await result.user.getIdToken()
        console.log('Got ID token')
        localStorage.setItem('token', token)

        // Register/Login with backend
        console.log('Sending data to backend...')
        try {
          const userData = {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            uid: result.user.uid
          }
          console.log('User data being sent:', userData)
          
          const response = await axios.post('http://localhost:5000/api/auth/google', userData)
          console.log('Backend response:', response.data)
          
          if (response.data.status === 'success') {
            // Store user data in Vuex
            await store.dispatch('auth/setUser', {
              ...userData,
              token
            })
            
            console.log('Login successful, redirecting to dashboard...')
            router.push('/dashboard/tasks')
          } else {
            throw new Error(response.data.message || 'Login failed')
          }
        } catch (backendError) {
          console.error('Backend error:', backendError)
          if (backendError.response) {
            console.error('Backend response:', backendError.response.data)
            throw new Error(backendError.response.data.message || 'Could not complete login with backend')
          }
          throw new Error('Could not connect to backend')
        }
      } catch (e) {
        console.error('Google authentication error:', e)
        error.value = e.message || 'Google authentication failed'
        
        // Curăță token-ul dacă există o eroare
        localStorage.removeItem('token')
      } finally {
        loading.value = false
      }
    }

    const handleLogin = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          form.value.email,
          form.value.password
        )

        const token = await userCredential.user.getIdToken()
        localStorage.setItem('token', token)

        // Store user data in Vuex
        const userData = {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          uid: userCredential.user.uid,
          token
        }
        await store.dispatch('auth/setUser', userData)

        router.push('/dashboard/tasks')
      } catch (e) {
        error.value = 'Invalid email or password'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleLogin,
      handleGoogleLogin
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

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--primary);
  opacity: 0.2;
}

.divider span {
  padding: 0 1rem;
  color: var(--text);
  opacity: 0.7;
  font-size: 0.875rem;
}

.btn-google {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--background);
  color: var(--text);
  border: 1px solid var(--primary);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
}

.btn-google:hover {
  opacity: 0.9;
}

.btn-google:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-google img {
  width: 18px;
  height: 18px;
}
</style> 