import axios from 'axios'

const state = {
  events: [],
  loading: false,
  error: null
}

const mutations = {
  SET_EVENTS(state, events) {
    state.events = events
  },
  ADD_EVENT(state, event) {
    state.events.push(event)
  },
  UPDATE_EVENT(state, updatedEvent) {
    const index = state.events.findIndex(event => event.id === updatedEvent.id)
    if (index !== -1) {
      state.events.splice(index, 1, updatedEvent)
    }
  },
  DELETE_EVENT(state, eventId) {
    state.events = state.events.filter(event => event.id !== eventId)
  },
  SET_LOADING(state, status) {
    state.loading = status
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async initEvents({ dispatch, rootGetters }) {
    try {
      const token = rootGetters['auth/token']
      if (token) {
        await dispatch('fetchEvents')
      } else {
        console.log('No authentication token available')
      }
    } catch (error) {
      console.error('Error initializing events:', error)
    }
  },

  async fetchEvents({ commit, rootGetters }) {
    commit('SET_LOADING', true)
    try {
      const token = rootGetters['auth/token']
      const response = await axios.get('http://localhost:5000/api/events', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      commit('SET_EVENTS', response.data.data || [])
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addEvent({ commit, rootGetters }, eventData) {
    try {
      const token = rootGetters['auth/token']
      const response = await axios.post('http://localhost:5000/api/events', eventData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const newEvent = {
        ...eventData,
        id: response.data.eventId
      }
      commit('ADD_EVENT', newEvent)
      return newEvent
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateEvent({ commit, rootGetters }, eventData) {
    try {
      const token = rootGetters['auth/token']
      await axios.put(`http://localhost:5000/api/events/${eventData.id}`, eventData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      commit('UPDATE_EVENT', eventData)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async deleteEvent({ commit, rootGetters }, eventId) {
    try {
      const token = rootGetters['auth/token']
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      commit('DELETE_EVENT', eventId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }
}

const getters = {
  allEvents: state => state.events,
  eventsForDay: state => date => {
    const targetDate = new Date(date)
    return state.events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.getFullYear() === targetDate.getFullYear() &&
             eventDate.getMonth() === targetDate.getMonth() &&
             eventDate.getDate() === targetDate.getDate()
    })
  },
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