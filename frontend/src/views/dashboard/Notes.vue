<template>
  <div class="notes-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="loading-spinner">⌛</span>
      <p>Loading notes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadNotes" class="btn-retry">
        <span class="icon">🔄</span>
        Try again
      </button>
    </div>

    <!-- Notes Content -->
    <div v-else class="notes-content">
      <!-- Header -->
      <div class="notes-header">
        <div class="search-filter">
          <div class="search-input">
            <span class="icon">🔍</span>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search notes..."
            >
          </div>
          <select v-model="selectedCategory">
            <option 
              v-for="category in categories"
              :key="category.value"
              :value="category.value"
            >
              {{ category.label }}
            </option>
          </select>
        </div>
        <button @click="showAddNoteModal = true" class="btn-add">
          <span class="icon">➕</span>
          Add note
        </button>
      </div>

      <!-- Notes Grid -->
      <div class="notes-grid">
        <!-- Note Editor -->
        <div v-if="activeNote" class="note-editor">
          <div class="editor-header">
            <input 
              v-model="activeNote.title"
              class="note-title"
              placeholder="Note title"
              @input="updateNote"
            >
            <div class="editor-actions">
              <button 
                @click="togglePin(activeNote)"
                class="btn-pin"
                :class="{ active: activeNote.pinned }"
              >
                📌
              </button>
              <select 
                v-model="activeNote.category"
                @change="updateNote"
                class="category-select"
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="learning">Learning</option>
              </select>
              <button 
                @click="deleteNote(activeNote.id)"
                class="btn-delete"
              >
                🗑️
              </button>
            </div>
          </div>
          <textarea
            v-model="activeNote.content"
            class="note-content"
            placeholder="Write your note here..."
            @input="updateNote"
          ></textarea>
          <div class="editor-footer">
            <span class="last-updated">
              Last updated: {{ formatDate(activeNote.updatedAt) }}
            </span>
          </div>
        </div>

        <!-- Notes List -->
        <div class="notes-list">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            class="note-card"
            :class="{
              active: activeNote?.id === note.id,
              pinned: note.pinned
            }"
            @click="selectNote(note)"
          >
            <div class="note-card-header">
              <h3>{{ note.title || 'Note without title' }}</h3>
              <span v-if="note.pinned" class="pin-indicator">📌</span>
            </div>
            <p class="note-preview">{{ note.content }}</p>
            <div class="note-card-footer">
              <span class="note-category" :class="note.category">
                {{ categories.find(c => c.value === note.category)?.label }}
              </span>
              <span class="note-date">
                {{ formatDate(note.updatedAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Note Modal -->
    <div v-if="showAddNoteModal" class="modal">
      <div class="modal-content">
        <h2>Add new note</h2>
        <form @submit.prevent="createNote">
          <div class="form-group">
            <label>Title</label>
            <input v-model="newNote.title" required>
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea v-model="newNote.content" required></textarea>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="newNote.category">
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="learning">Learning</option>
            </select>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newNote.pinned">
              Pin note
            </label>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-save">Save</button>
            <button 
              type="button"
              @click="showAddNoteModal = false"
              class="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Notes',
  setup() {
    const store = useStore()
    const activeNote = ref(null)
    const isLoading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')
    const selectedCategory = ref('all')
    const showAddNoteModal = ref(false)

    const categories = [
      { value: 'all', label: 'All notes' },
      { value: 'work', label: 'Work' },
      { value: 'personal', label: 'Personal' },
      { value: 'learning', label: 'Learning' }
    ]

    const newNote = ref({
      title: '',
      content: '',
      category: 'personal',
      pinned: false
    })

    // Computed properties
    const filteredNotes = computed(() => {
      let notes = store.getters['notes/allNotes']
      
      // Filtrare după categorie
      if (selectedCategory.value !== 'all') {
        notes = notes.filter(note => note.category === selectedCategory.value)
      }
      
      // Filtrare după text căutat
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        notes = notes.filter(note => 
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
        )
      }
      
      // Sortare: mai întâi notițele pinned, apoi după data actualizării
      return notes.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })
    })

    // Methods
    const loadNotes = async () => {
      isLoading.value = true
      error.value = null
      try {
        await store.dispatch('notes/fetchNotes')
        isLoading.value = false
      } catch (err) {
        console.error('Error loading notes:', err)
        error.value = 'Error loading notes'
        isLoading.value = false
      }
    }

    const createNote = async () => {
      try {
        const note = await store.dispatch('notes/addNote', {
          ...newNote.value,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        activeNote.value = note
        showAddNoteModal.value = false
        resetNewNote()
        store.dispatch('notifications/add', {
          type: 'success',
          message: 'Note added successfully'
        })
      } catch (error) {
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error adding note'
        })
      }
    }

    const updateNote = async () => {
      if (!activeNote.value) return
      
      try {
        await store.dispatch('notes/updateNote', {
          ...activeNote.value,
          updatedAt: new Date().toISOString()
        })
        store.dispatch('notifications/add', {
          type: 'success',
          message: 'Note updated successfully'
        })
      } catch (error) {
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error updating note'
        })
      }
    }

    const deleteNote = async (id) => {
      if (!confirm('Are you sure you want to delete this note?')) return
      
      try {
        await store.dispatch('notes/deleteNote', id)
        if (activeNote.value?.id === id) {
          activeNote.value = null
        }
        store.dispatch('notifications/add', {
          type: 'success',
          message: 'Note deleted successfully'
        })
      } catch (error) {
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error deleting note'
        })
      }
    }

    const togglePin = async (note) => {
      try {
        await store.dispatch('notes/updateNote', {
          ...note,
          pinned: !note.pinned,
          updatedAt: new Date().toISOString()
        })
      } catch (error) {
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error updating note'
        })
      }
    }

    const selectNote = (note) => {
      activeNote.value = { ...note }
    }

    const resetNewNote = () => {
      newNote.value = {
        title: '',
        content: '',
        category: 'personal',
        pinned: false
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      loadNotes()
    })

    return {
      activeNote,
      isLoading,
      error,
      searchQuery,
      selectedCategory,
      categories,
      filteredNotes,
      showAddNoteModal,
      newNote,
      createNote,
      updateNote,
      deleteNote,
      togglePin,
      selectNote,
      formatDate,
      resetNewNote
    }
  }
}
</script>

<style scoped>
.notes-container {
  padding: 1.5rem;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-filter {
  display: flex;
  gap: 1rem;
  flex: 1;
  max-width: 600px;
}

.search-input {
  position: relative;
  flex: 1;
}

.search-input input {
  width: 100%;
  padding: 0.75rem 2.5rem;
  border: 1px solid var(--primary);
  border-radius: 8px;
  background: var(--background);
  color: var(--text);
}

.search-input .icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}

select {
  padding: 0.75rem;
  border: 1px solid var(--primary);
  border-radius: 8px;
  background: var(--background);
  color: var(--text);
  min-width: 150px;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--secondary);
  color: var(--text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.notes-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  flex: 1;
  overflow: hidden;
}

.note-editor {
  background: var(--primary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.note-title {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  background: none;
  color: var(--text);
  padding: 0.5rem;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-pin,
.btn-delete {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-pin.active,
.btn-pin:hover,
.btn-delete:hover {
  opacity: 1;
}

.note-content {
  flex: 1;
  resize: none;
  border: none;
  background: none;
  color: var(--text);
  font-size: 1rem;
  line-height: 1.6;
  padding: 0.5rem;
}

.editor-footer {
  color: var(--text);
  opacity: 0.7;
  font-size: 0.875rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--secondary);
}

.notes-list {
  background: var(--primary);
  border-radius: 12px;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-card {
  background: var(--background);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-card:hover,
.note-card.active {
  background: var(--secondary);
}

.note-card.pinned {
  border-left: 3px solid var(--primary);
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.note-card h3 {
  font-size: 1.1rem;
  margin: 0;
  color: var(--text);
}

.pin-indicator {
  opacity: 0.7;
}

.note-preview {
  color: var(--text);
  opacity: 0.8;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.note-category {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.note-category.work {
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2;
}

.note-category.personal {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.note-category.learning {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.note-date {
  color: var(--text);
  opacity: 0.7;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--primary);
  padding: 2rem;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--secondary);
  border-radius: 8px;
  background: var(--background);
  color: var(--text);
}

.form-group textarea {
  height: 150px;
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-save,
.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-save {
  background: var(--secondary);
  color: var(--text);
}

.btn-cancel {
  background: var(--primary);
  color: var(--text);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--secondary);
  color: var(--text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
  
  .search-filter {
    flex-direction: column;
  }
  
  .notes-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-add {
    width: 100%;
    justify-content: center;
  }
}
</style> 