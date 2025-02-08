const state = {
  notifications: []
}

const mutations = {
  ADD_NOTIFICATION(state, notification) {
    state.notifications.push({
      id: Date.now(),
      ...notification,
      show: true
    })
  },
  REMOVE_NOTIFICATION(state, id) {
    state.notifications = state.notifications.filter(n => n.id !== id)
  }
}

const actions = {
  add({ commit }, notification) {
    commit('ADD_NOTIFICATION', notification)
    // Auto remove after 5 seconds
    setTimeout(() => {
      commit('REMOVE_NOTIFICATION', notification.id)
    }, 5000)
  },
  remove({ commit }, id) {
    commit('REMOVE_NOTIFICATION', id)
  }
}

const getters = {
  notifications: state => state.notifications
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 