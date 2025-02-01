<template>
  <div class="notes-container">
    <header class="page-header">
      <h1>Notes</h1>
      <button class="add-note-btn" @click="createNote">
        <i class="fas fa-plus"></i>
        Add Note
      </button>
    </header>
    
    <div class="notes-grid">
      <!-- Note Editor -->
      <div v-if="activeNote" class="note-editor">
        <input 
          v-model="activeNote.title" 
          class="note-title" 
          placeholder="Note Title"
          @input="updateNote"
        >
        <textarea 
          v-model="activeNote.content" 
          class="note-content" 
          placeholder="Write your note here..."
          @input="updateNote"
        ></textarea>
        <div class="editor-footer">
          <span class="last-updated">Last updated: {{ formatDate(activeNote.updatedAt) }}</span>
          <button class="delete-note-btn" @click="deleteNote(activeNote.id)">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>

      <!-- Notes List -->
      <div class="notes-list">
        <div 
          v-for="note in sortedNotes" 
          :key="note.id"
          class="note-card"
          :class="{ active: activeNote?.id === note.id }"
          @click="selectNote(note)"
        >
          <h3>{{ note.title || 'Untitled Note' }}</h3>
          <p>{{ truncateContent(note.content) }}</p>
          <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const notes = ref([
  {
    id: 1,
    title: 'Welcome Note',
    content: 'Welcome to your notes! Click the "Add Note" button to create a new note.',
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

const activeNote = ref(null)

// Select first note by default
if (notes.value.length > 0 && !activeNote.value) {
  activeNote.value = { ...notes.value[0] }
}

const sortedNotes = computed(() => {
  return [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt)
})

const createNote = () => {
  const newNote = {
    id: Date.now(),
    title: '',
    content: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  notes.value.unshift(newNote)
  activeNote.value = { ...newNote }
}

const selectNote = (note) => {
  activeNote.value = { ...note }
}

const updateNote = () => {
  if (!activeNote.value) return
  
  activeNote.value.updatedAt = new Date()
  const index = notes.value.findIndex(n => n.id === activeNote.value.id)
  if (index !== -1) {
    notes.value[index] = { ...activeNote.value }
  }
}

const deleteNote = (id) => {
  const index = notes.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notes.value.splice(index, 1)
    activeNote.value = notes.value.length > 0 ? { ...notes.value[0] } : null
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateContent = (content) => {
  return content.length > 100 ? content.slice(0, 100) + '...' : content
}
</script>

<style scoped>
.notes-container {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  color: var(--text);
  font-size: 2rem;
  font-weight: 600;
}

.add-note-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary);
  color: var(--text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.add-note-btn:hover {
  opacity: 0.9;
}

.notes-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  height: calc(100vh - 150px);
}

.note-editor {
  background-color: var(--primary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-title {
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  background: none;
  color: var(--text);
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
}

.note-title:focus {
  outline: none;
  background-color: var(--background);
}

.note-content {
  flex: 1;
  border: none;
  background: none;
  color: var(--text);
  resize: none;
  font-size: 1rem;
  line-height: 1.6;
  padding: 0.5rem;
  border-radius: 4px;
}

.note-content:focus {
  outline: none;
  background-color: var(--background);
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--secondary);
}

.last-updated {
  color: var(--text);
  opacity: 0.7;
  font-size: 0.875rem;
}

.delete-note-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: opacity 0.2s;
}

.delete-note-btn:hover {
  opacity: 0.9;
}

.notes-list {
  background-color: var(--primary);
  border-radius: 12px;
  padding: 1rem;
  overflow-y: auto;
}

.note-card {
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.note-card:hover, .note-card.active {
  background-color: var(--secondary);
}

.note-card h3 {
  color: var(--text);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.note-card p {
  color: var(--text);
  opacity: 0.8;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  white-space: pre-line;
}

.note-date {
  color: var(--text);
  opacity: 0.7;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
  
  .note-editor {
    height: 60vh;
  }
  
  .notes-list {
    height: 40vh;
  }
}
</style> 