const state = {
  list: []
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
  TOGGLE_TASK_STATUS(state, taskId) {
    const task = state.list.find(task => task.id === taskId)
    if (task) {
      task.completed = !task.completed
    }
  }
}

const actions = {
  // Initialize tasks from localStorage
  initTasks({ commit }) {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      commit('SET_TASKS', JSON.parse(savedTasks))
    }
  },

  // Save tasks to localStorage after each mutation
  saveTasks({ state }) {
    localStorage.setItem('tasks', JSON.stringify(state.list))
  },

  // Add a new task
  addTask({ commit, dispatch }, task) {
    commit('ADD_TASK', task)
    dispatch('saveTasks')
  },

  // Update an existing task
  updateTask({ commit, dispatch }, task) {
    commit('UPDATE_TASK', task)
    dispatch('saveTasks')
  },

  // Delete a task
  deleteTask({ commit, dispatch }, taskId) {
    commit('DELETE_TASK', taskId)
    dispatch('saveTasks')
  },

  // Toggle task completion status
  toggleTaskStatus({ commit, dispatch }, taskId) {
    commit('TOGGLE_TASK_STATUS', taskId)
    dispatch('saveTasks')
  }
}

const getters = {
  // Get all tasks
  allTasks: state => state.list,
  
  // Get tasks by completion status
  completedTasks: state => state.list.filter(task => task.completed),
  pendingTasks: state => state.list.filter(task => !task.completed),
  
  // Get tasks by priority
  tasksByPriority: state => priority => 
    state.list.filter(task => task.priority === priority),
  
  // Get tasks by category
  tasksByCategory: state => category => 
    state.list.filter(task => task.category === category)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 