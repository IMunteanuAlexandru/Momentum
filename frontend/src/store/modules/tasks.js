import axios from 'axios'

const state = {
  list: [],
  loading: false,
  error: null
}

const mutations = {
  SET_TASKS(state, tasks) {
    state.list = tasks
  },
  ADD_TASK(state, task) {
    state.list.push(task)
  },
  UPDATE_TASK(state, updatedTask) {
    const index = state.list.findIndex(task => task.id === updatedTask.id)
    if (index !== -1) {
      state.list.splice(index, 1, updatedTask)
    }
  },
  DELETE_TASK(state, taskId) {
    state.list = state.list.filter(task => task.id !== taskId)
  },
  SET_LOADING(state, status) {
    state.loading = status
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async initTasks({ dispatch, rootGetters }) {
    try {
      const token = rootGetters['auth/token']
      if (token) {
        await dispatch('fetchTasks')
      } else {
        console.log('No authentication token available')
      }
    } catch (error) {
      console.error('Error initializing tasks:', error)
    }
  },

  async fetchTasks({ commit, rootGetters }) {
    commit('SET_LOADING', true)
    try {
      const token = rootGetters['auth/token']
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      commit('SET_TASKS', response.data.data || [])
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addTask({ commit, rootGetters }, taskData) {
    try {
      const token = rootGetters['auth/token']
      const response = await axios.post('http://localhost:5000/api/tasks', taskData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const newTask = { ...taskData, id: response.data.taskId }
      commit('ADD_TASK', newTask)
      return newTask
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateTask({ commit, rootGetters }, taskData) {
    try {
      const token = rootGetters['auth/token']
      await axios.put(`http://localhost:5000/api/tasks/${taskData.id}`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      commit('UPDATE_TASK', taskData)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async deleteTask({ commit, rootGetters }, taskId) {
    try {
      const token = rootGetters['auth/token']
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      commit('DELETE_TASK', taskId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async toggleTaskStatus({ commit, state, rootGetters }, taskId) {
    try {
      const task = state.list.find(t => t.id === taskId)
      if (task && !task.completed) {
        await axios.put(`http://localhost:5000/api/tasks/${taskId}/toggle`, {}, {
          headers: {
            Authorization: `Bearer ${rootGetters['auth/token']}`
          }
        })
        const updatedTask = { ...task, completed: true }
        commit('UPDATE_TASK', updatedTask)
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }
}

const getters = {
  allTasks: state => state.list,
  taskById: state => id => state.list.find(task => task.id === id),
  loading: state => state.loading,
  error: state => state.error
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 