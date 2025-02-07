import { getAuth } from 'firebase/auth'

export const auth = {
  namespaced: true,
  
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),

  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
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
        await auth.signOut()
        localStorage.removeItem('token')
        commit('CLEAR_AUTH')
      } catch (error) {
        console.error('Logout error:', error)
        throw error
      }
    },

    async checkAuth({ commit }) {
      const token = localStorage.getItem('token')
      if (token) {
        const auth = getAuth()
        const user = auth.currentUser
        if (user) {
          commit('SET_USER', {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            uid: user.uid
          })
          commit('SET_TOKEN', token)
        }
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