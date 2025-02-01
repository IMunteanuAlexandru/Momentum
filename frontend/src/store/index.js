import { createStore } from 'vuex'

// Hardcoded users for testing
const users = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: 'demo123' // In real app, passwords should be hashed
  },
  {
    id: 2,
    username: 'test',
    email: 'test@example.com',
    password: 'test123'
  }
]

const auth = {
  namespaced: true,
  state: {
    user: JSON.parse(localStorage.getItem('user')),
    isAuthenticated: !!localStorage.getItem('user'),
    token: localStorage.getItem('token')
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  },
  actions: {
    async login({ commit }, credentials) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const user = users.find(u => 
        u.email === credentials.email && 
        u.password === credentials.password
      )

      if (user) {
        // Create a copy without the password
        const userWithoutPassword = { ...user }
        delete userWithoutPassword.password

        commit('SET_USER', userWithoutPassword)
        commit('SET_TOKEN', 'fake-jwt-token-' + user.id)
        return userWithoutPassword
      } else {
        throw new Error('Invalid email or password')
      }
    },
    async register({ commit }, userData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check if email already exists
      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email already registered')
      }

      // Create new user
      const newUser = {
        id: users.length + 1,
        username: userData.username,
        email: userData.email,
        password: userData.password
      }

      // Add to users array (in real app, this would be saved to a database)
      users.push(newUser)

      // Create a copy without the password
      const userWithoutPassword = { ...newUser }
      delete userWithoutPassword.password

      commit('SET_USER', userWithoutPassword)
      commit('SET_TOKEN', 'fake-jwt-token-' + newUser.id)
      return userWithoutPassword
    },
    logout({ commit }) {
      commit('SET_USER', null)
      commit('SET_TOKEN', null)
    },
    async checkAuth({ commit, state }) {
      // Simulate checking token validity
      const user = JSON.parse(localStorage.getItem('user'))
      if (user && users.some(u => u.id === user.id)) {
        commit('SET_USER', user)
        return user
      } else {
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