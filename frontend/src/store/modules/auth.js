import { getAuth, signOut } from 'firebase/auth'

export default {
  namespaced: true,
  state: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('token')
    }
  },
  actions: {
    async setUser({ commit }, userData) {
      commit('SET_USER', {
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        uid: userData.uid
      })
      commit('SET_TOKEN', userData.token)
    },
    async logout({ commit }) {
      try {
        const auth = getAuth()
        await signOut(auth)
        commit('CLEAR_AUTH')
      } catch (error) {
        console.error('Logout error:', error)
        throw error
      }
    },
    async checkAuth({ commit }) {
      const auth = getAuth()
      const user = auth.currentUser
      const token = localStorage.getItem('token')

      if (user && token) {
        commit('SET_USER', {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid
        })
        commit('SET_TOKEN', token)
      } else {
        commit('CLEAR_AUTH')
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    token: (state) => state.token,
    loading: (state) => state.loading,
    error: (state) => state.error
  }
} 