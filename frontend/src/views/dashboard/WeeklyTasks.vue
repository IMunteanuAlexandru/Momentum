<template>
  <div class="weekly-tasks">
    <!-- Header Section -->
    <div class="header">
      <div class="header-content">
        <h1>Weekly Task & Event Management</h1>
        <p>Organize and track your tasks and events throughout the week</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container loading">
      <div class="state-content">
        <div class="spinner"></div>
        <p>Loading your items...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-container error">
      <div class="state-content">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-large" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{{ error }}</p>
        <button @click="fetchTasks" class="btn btn-retry">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try again
        </button>
      </div>
    </div>

    <!-- Kanban Board -->
    <div v-else class="board-container">
      <div class="board">
        <div v-for="(items, day) in weeklyTasks" :key="day" class="column">
          <div class="column-header">
            <h2>{{ day }}</h2>
            <span class="task-count">{{ items.length }} items</span>
          </div>
          <draggable
            :list="items"
            :animation="200"
            ghost-class="ghost-card"
            group="items"
            @change="handleDragChange($event, day)"
            item-key="id"
          >
            <template #item="{ element }">
              <TaskCard
                v-if="element.type === 'task'"
                :task="element"
                @click="handleCardClick(element)"
                @edit="editTask(element)"
                @delete="deleteTask(element)"
                @toggle="toggleTaskStatus(element.id)"
              />
              <EventCard
                v-else-if="element.type === 'event'"
                :event="element"
                @click="handleCardClick(element)"
                @edit="editEvent(element)"
                @delete="deleteTask(element)"
              />
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <div v-if="showEditTaskModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Edit Task</h2>
          <button @click="closeEditTaskModal" class="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveTask" class="form">
          <div class="form-group">
            <label>Title</label>
            <input 
              v-model="taskForm.title"
              type="text"
              placeholder="Enter task title"
              required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="taskForm.description"
              rows="3"
              placeholder="Enter task description"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Due Date</label>
              <input 
                v-model="taskForm.dueDate"
                type="date"
                required>
            </div>
            <div class="form-group">
              <label>Priority</label>
              <select v-model="taskForm.priority" required>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="taskForm.category" required>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeEditTaskModal" class="btn btn-text">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Event Modal -->
    <div v-if="showEditEventModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Edit Event</h2>
          <button @click="closeEditEventModal" class="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveEvent" class="form">
          <div class="form-group">
            <label>Title</label>
            <input 
              v-model="eventForm.title"
              type="text"
              placeholder="Enter event title"
              required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="eventForm.description"
              rows="3"
              placeholder="Enter event description"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date & Time</label>
              <input 
                v-model="eventForm.startDate"
                type="datetime-local"
                required>
            </div>
            <div class="form-group">
              <label>End Date & Time</label>
              <input 
                v-model="eventForm.endDate"
                type="datetime-local"
                required>
            </div>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="eventForm.category" required>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeEditEventModal" class="btn btn-text">
              Cancel
            </button>
            <button type="submit" class="btn btn-secondary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Read Task Modal -->
    <div v-if="showReadModal && selectedItem?.type === 'task'" class="modal-overlay">
      <div class="modal read-modal">
        <div class="modal-header">
          <h2>Task Details</h2>
          <button @click="closeReadModal" class="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="read-content">
          <div class="read-section">
            <h3>{{ selectedItem?.title }}</h3>
            <p class="description">{{ selectedItem?.description || 'No description provided' }}</p>
          </div>
          <div class="read-section">
            <div class="meta-info">
              <div class="meta-item">
                <span class="label">Status:</span>
                <span class="value">{{ selectedItem?.completed ? 'Completed' : 'Pending' }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Due Date:</span>
                <span class="value">{{ formatDate(selectedItem?.dueDate) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Priority:</span>
                <span class="value priority-badge" :class="selectedItem?.priority">{{ selectedItem?.priority }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Category:</span>
                <span class="value category-badge">{{ selectedItem?.category }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeReadModal" class="btn btn-text">Close</button>
        </div>
      </div>
    </div>

    <!-- Read Event Modal -->
    <div v-if="showReadModal && selectedItem?.type === 'event'" class="modal-overlay">
      <div class="modal read-modal">
        <div class="modal-header">
          <h2>Event Details</h2>
          <button @click="closeReadModal" class="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="read-content">
          <div class="read-section">
            <h3>{{ selectedItem?.title }}</h3>
            <p class="description">{{ selectedItem?.description || 'No description provided' }}</p>
          </div>
          <div class="read-section">
            <div class="meta-info">
              <div class="meta-item">
                <span class="label">Start Time:</span>
                <span class="value">{{ formatDateTime(selectedItem?.startDate) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">End Time:</span>
                <span class="value">{{ formatDateTime(selectedItem?.endDate) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Category:</span>
                <span class="value category-badge">{{ selectedItem?.category }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeReadModal" class="btn btn-text">Close</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <div class="warning-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3>Confirm Action</h3>
        </div>
        <p>{{ confirmMessage }}</p>
        <div class="modal-footer">
          <button @click="closeConfirmModal" class="btn btn-text">
            Cancel
          </button>
          <button @click="handleConfirm" class="btn btn-danger">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete {{ itemType }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import draggable from 'vuedraggable'
import TaskCard from '@/components/TaskCard.vue'
import EventCard from '@/components/EventCard.vue'

export default {
  name: 'WeeklyTasks',
  components: {
    draggable,
    TaskCard,
    EventCard
  },
  setup() {
    const store = useStore()
    const toast = useToast()
    const loading = computed(() => store.getters['tasks/loading'])
    const error = computed(() => store.getters['tasks/error'])
    const tasks = computed(() => store.getters['tasks/allTasks'] || [])
    const events = computed(() => store.getters['calendar/allEvents'] || [])

    const showAddTaskModal = ref(false)
    const editingTask = ref(null)
    const showConfirmModal = ref(false)
    const confirmMessage = ref('')
    const pendingAction = ref(null)
    const pendingTaskId = ref(null)
    const itemType = ref('task')
    const showReadModal = ref(false)
    const selectedItem = ref(null)

    const categories = [
      'Work',
      'Personal',
      'Shopping',
      'Health',
      'Education',
      'Other'
    ]

    const taskForm = ref({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      category: '',
      completed: false,
      type: 'task'
    })

    const eventForm = ref({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      category: '',
      type: 'event'
    })

    const showEditTaskModal = ref(false)
    const showEditEventModal = ref(false)

    // Update the weeklyTasks computed property
    const weeklyTasks = computed(() => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const result = {}
      
      // Get current week's start and end dates
      const now = new Date()
      const currentDay = now.getDay()
      const diff = currentDay === 0 ? 6 : currentDay - 1 // Adjust when Sunday is 0
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - diff)
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      
      
      days.forEach(day => {
        result[day] = []
        
        // Process tasks
        if (Array.isArray(tasks.value)) {
          const dayTasks = tasks.value.filter(task => {
            if (!task.dueDate) return false
            const taskDate = new Date(task.dueDate)
            taskDate.setHours(0, 0, 0, 0)
            const taskDay = taskDate.toLocaleDateString('en-US', { weekday: 'long' })
            const isInWeek = taskDate >= weekStart && taskDate <= weekEnd
            
            return taskDay === day && isInWeek
          })
          result[day].push(...dayTasks.map(task => ({ ...task, type: 'task' })))
        }

        // Process events
        if (Array.isArray(events.value)) {
          const dayEvents = events.value.filter(event => {
            if (!event.startDate) return false
            const eventDate = new Date(event.startDate)
            eventDate.setHours(0, 0, 0, 0)
            const eventDay = eventDate.toLocaleDateString('en-US', { weekday: 'long' })
            const isInWeek = eventDate >= weekStart && eventDate <= weekEnd
            
            return eventDay === day && isInWeek
          })
          result[day].push(...dayEvents.map(event => ({ ...event, type: 'event' })))
        }

      })

      return result
    })

    const handleDragChange = async (event, toDay) => {
      if (event.moved) {
        const item = event.moved.element
        try {
          if (item.type === 'task') {
            const updatedTask = {
              ...item,
              dueDate: new Date(item.dueDate)
            }
            await store.dispatch('tasks/updateTask', updatedTask)
          } else {
            const updatedEvent = {
              ...item,
              startDate: new Date(item.startDate)
            }
            await store.dispatch('events/updateEvent', updatedEvent)
          }
          toast.success('Item moved successfully')
        } catch (error) {
          console.error('Error moving item:', error)
          toast.error('Failed to move item')
        }
      }
    }

    const editTask = (item) => {
      taskForm.value = {
        ...item,
        dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ''
      }
      showEditTaskModal.value = true
    }

    const editEvent = (item) => {
      eventForm.value = {
        ...item,
        startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 16) : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 16) : ''
      }
      showEditEventModal.value = true
    }

    const deleteTask = (item) => {
      pendingTaskId.value = item.id
      pendingAction.value = 'delete'
      itemType.value = item.type
      confirmMessage.value = `Are you sure you want to delete this ${item.type}? This action cannot be undone.`
      showConfirmModal.value = true
    }

    const saveTask = async () => {
      try {
        await store.dispatch('tasks/updateTask', {
          id: taskForm.value.id,
          ...taskForm.value
        })
        toast.success('Task updated successfully')
        closeEditTaskModal()
      } catch (error) {
        toast.error('Error updating task')
      }
    }

    const saveEvent = async () => {
      try {
        await store.dispatch('calendar/updateEvent', {
          id: eventForm.value.id,
          ...eventForm.value
        })
        toast.success('Event updated successfully')
        closeEditEventModal()
      } catch (error) {
        toast.error('Error updating event')
      }
    }

    const closeEditTaskModal = () => {
      showEditTaskModal.value = false
      taskForm.value = {
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        category: '',
        completed: false,
        type: 'task'
      }
    }

    const closeEditEventModal = () => {
      showEditEventModal.value = false
      eventForm.value = {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        category: '',
        type: 'event'
      }
    }

    const closeConfirmModal = () => {
      showConfirmModal.value = false
      confirmMessage.value = ''
      pendingAction.value = null
      pendingTaskId.value = null
    }

    const handleConfirm = async () => {
      try {
        if (pendingAction.value === 'delete') {
          if (itemType.value === 'task') {
            await store.dispatch('tasks/deleteTask', pendingTaskId.value)
          } else {
            await store.dispatch('events/deleteEvent', pendingTaskId.value)
          }
          toast.success(`${itemType.value} deleted successfully`)
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error processing request')
      }
      closeConfirmModal()
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const fetchTasks = async () => {
      try {
        await Promise.all([
          store.dispatch('tasks/fetchTasks'),
          store.dispatch('calendar/fetchEvents')
        ])
      } catch (error) {
        toast.error('Error loading items')
      }
    }

    const handleCardClick = (item) => {
      selectedItem.value = item
      showReadModal.value = true
    }

    const closeReadModal = () => {
      showReadModal.value = false
      selectedItem.value = null
    }

    onMounted(() => {
      fetchTasks()
    })

    return {
      loading,
      error,
      weeklyTasks,
      showAddTaskModal,
      editingTask,
      taskForm,
      eventForm,
      categories,
      showConfirmModal,
      confirmMessage,
      handleDragChange,
      editTask,
      editEvent,
      deleteTask,
      saveTask,
      saveEvent,
      closeEditTaskModal,
      closeEditEventModal,
      closeConfirmModal,
      handleConfirm,
      fetchTasks,
      itemType,
      showReadModal,
      selectedItem,
      handleCardClick,
      closeReadModal,
      formatDateTime,
      formatDate,
      showEditTaskModal,
      showEditEventModal
    }
  }
}
</script>

<style scoped>
.weekly-tasks {
  min-height: 100vh;
  background-color: var(--background);
  padding: 1.5rem;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.header-content p {
  color: var(--text);
  opacity: 0.75;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary);
  color: var(--text);
  border: none;
}

.btn-primary:hover {
  background: var(--secondary);
}

.btn-text {
  background: transparent;
  color: var(--text);
  border: none;
}

.btn-text:hover {
  color: var(--primary);
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--text);
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  color: var(--primary);
  background: var(--primary);
}

/* State Containers */
.state-container {
  text-align: center;
  padding: 4rem;
  background: var(--background);
  border-radius: 1rem;
  margin-top: 2rem;
  border: 1px solid var(--primary);
}

.state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid var(--primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Board Styles */
.board-container {
  display: flex;
  justify-content: center;
}

.board {
  display: flex;
  min-height: calc(100vh - 12rem);
  overflow-x: auto;
  padding: 3rem 1rem;
  gap: 1.5rem;
}

.column {
  min-width: 360px;
  width: 360px;

  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid var(--primary);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--primary);
}

.column-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.task-count {
  font-size: 0.875rem;
  color: var(--text);
  opacity: 0.75;
  background: var(--primary);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

/* Task Card Styles */
.task-card {
  margin-top: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  background-color:  var(--primary);
}

.ghost-card {
  opacity: 0.5;
  background: var(--background);
  border: 2px dashed var(--primary);
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  background: var(--background);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
  border: 1px solid var(--primary);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}

.warning-icon {
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 9999px;
}

.warning-icon .icon {
  color: #ef4444;
  width: 1.5rem;
  height: 1.5rem;
}

/* Form Styles */
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--primary);
  background: var(--background);
  color: var(--text);
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
}

/* Icon Styles */
.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-large {
  width: 3rem;
  height: 3rem;
}

/* Scrollbar Styles */
.board::-webkit-scrollbar {
  height: 0.5rem;
}

.board::-webkit-scrollbar-track {
  background: var(--background);
}

.board::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 0.25rem;
}

.board::-webkit-scrollbar-thumb:hover {
  background: var(--secondary);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-secondary {
  background: var(--secondary);
  color: var(--text);
  border: none;
}

.btn-secondary:hover {
  background: var(--primary);
}

.event-card {
  border-left: 4px solid var(--secondary);
}

.event-card .card-title {
  color: var(--secondary);
}

.read-modal {
  max-width: 600px;
}

.read-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.read-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.read-section h3 {
  font-size: 1.5rem;
  color: var(--text);
  margin: 0;
}

.description {
  color: var(--text);
  opacity: 0.8;
  line-height: 1.6;
  margin: 0;
}

.meta-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  color: var(--text);
  opacity: 0.7;
}

.value {
  font-size: 1rem;
  color: var(--text);
}

.priority-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  text-transform: capitalize;
}

.priority-badge.high {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.priority-badge.medium {
  background: rgba(255, 167, 38, 0.1);
  color: #ffa726;
}

.priority-badge.low {
  background: rgba(102, 187, 106, 0.1);
  color: #66bb6a;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: var(--primary);
  color: var(--text);
  font-weight: 500;
}
</style>
