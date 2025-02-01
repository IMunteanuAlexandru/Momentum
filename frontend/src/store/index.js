import { createStore } from 'vuex'
import axios from 'axios'

const auth = {
  namespaced: true,
  state: {
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem('token')
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post('/api/auth/login', credentials)
        const { user, token } = response.data
        commit('SET_USER', user)
        commit('SET_TOKEN', token)
        return user
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed')
      }
    },
    async register({ commit }, userData) {
      try {
        const response = await axios.post('/api/auth/register', userData)
        const { user, token } = response.data
        commit('SET_USER', user)
        commit('SET_TOKEN', token)
        return user
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed')
      }
    },
    logout({ commit }) {
      commit('SET_USER', null)
      commit('SET_TOKEN', null)
    },
    async checkAuth({ commit, state }) {
      if (!state.token) return
      
      try {
        const response = await axios.get('/api/auth/me')
        commit('SET_USER', response.data)
      } catch (error) {
        commit('SET_USER', null)
        commit('SET_TOKEN', null)
      }
    }
  }
}

export default createStore({
  modules: {
    auth
  }
}) 