import axios from 'axios'

const state = {
  notes: [],
  loading: false,
  error: null
}

const mutations = {
  SET_NOTES(state, notes) {
    state.notes = notes
  },
  ADD_NOTE(state, note) {
    state.notes.unshift(note)
  },
  UPDATE_NOTE(state, updatedNote) {
    const index = state.notes.findIndex(note => note.id === updatedNote.id)
    if (index !== -1) {
      state.notes.splice(index, 1, updatedNote)
    }
  },
  DELETE_NOTE(state, noteId) {
    state.notes = state.notes.filter(note => note.id !== noteId)
  },
  SET_LOADING(state, status) {
    state.loading = status
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async fetchNotes({ commit, rootGetters }) {
    commit('SET_LOADING', true)
    try {
      const token = rootGetters['auth/token']
      const response = await axios.get('http://localhost:5000/api/notes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      commit('SET_NOTES', response.data.data || [])
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addNote({ commit, rootGetters }, noteData) {
    try {
      const token = rootGetters['auth/token']
      const response = await axios.post('http://localhost:5000/api/notes', noteData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const newNote = { ...noteData, id: response.data.noteId }
      commit('ADD_NOTE', newNote)
      return newNote
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateNote({ commit, rootGetters }, noteData) {
    try {
      const token = rootGetters['auth/token']
      await axios.put(`http://localhost:5000/api/notes/${noteData.id}`, noteData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      commit('UPDATE_NOTE', noteData)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async deleteNote({ commit, rootGetters }, noteId) {
    try {
      const token = rootGetters['auth/token']
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      commit('DELETE_NOTE', noteId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }
}

const getters = {
  allNotes: state => state.notes || [],
  pinnedNotes: state => (state.notes || []).filter(note => note.pinned),
  notesByCategory: state => category => (state.notes || []).filter(note => note.category === category),
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