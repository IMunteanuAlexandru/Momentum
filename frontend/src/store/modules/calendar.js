const state = {
  events: []
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
  }
}

const actions = {
  // Initialize events from localStorage
  initEvents({ commit }) {
    const savedEvents = localStorage.getItem('calendar_events')
    if (savedEvents) {
      commit('SET_EVENTS', JSON.parse(savedEvents))
    }
  },

  // Save events to localStorage after each mutation
  saveEvents({ state }) {
    localStorage.setItem('calendar_events', JSON.stringify(state.events))
  },

  // Add a new event
  addEvent({ commit, dispatch }, event) {
    // Generate recurring events if needed
    if (event.recurrence) {
      const recurringEvents = generateRecurringEvents(event)
      recurringEvents.forEach(e => commit('ADD_EVENT', e))
    } else {
      commit('ADD_EVENT', event)
    }
    dispatch('saveEvents')
  },

  // Update an existing event
  updateEvent({ commit, dispatch }, event) {
    commit('UPDATE_EVENT', event)
    dispatch('saveEvents')
  },

  // Delete an event
  deleteEvent({ commit, dispatch }, eventId) {
    commit('DELETE_EVENT', eventId)
    dispatch('saveEvents')
  }
}

const getters = {
  // Get all events
  allEvents: state => state.events,
  
  // Get events for a specific day
  eventsForDay: state => date => {
    return state.events.filter(event => {
      const eventDate = new Date(event.startDate)
      return isSameDay(eventDate, date)
    })
  },
  
  // Get events for a specific week
  eventsForWeek: state => date => {
    const start = getStartOfWeek(date)
    const end = getEndOfWeek(date)
    return state.events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate >= start && eventDate <= end
    })
  },
  
  // Get events for a specific month
  eventsForMonth: state => date => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return state.events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate >= start && eventDate <= end
    })
  }
}

// Helper functions
const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

const getEndOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + 7
  return new Date(d.setDate(diff))
}

const generateRecurringEvents = (event) => {
  const events = []
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const duration = endDate - startDate

  // Generate events for the next 6 months
  const sixMonthsFromNow = new Date()
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

  let currentDate = new Date(startDate)
  while (currentDate < sixMonthsFromNow) {
    const newEvent = {
      ...event,
      id: Date.now() + Math.random(),
      startDate: new Date(currentDate).toISOString(),
      endDate: new Date(currentDate.getTime() + duration).toISOString()
    }
    events.push(newEvent)

    // Calculate next occurrence based on recurrence type
    switch (event.recurrence) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
    }
  }

  return events
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 