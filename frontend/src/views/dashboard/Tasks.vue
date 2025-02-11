<template>
  <div class="tasks-container">
    <div class="tasks-header">
      <h1>Tasks</h1>
      <div class="task-controls">
        <div class="search-filter">
          <div class="search-input-wrapper">
            <span class="search-icon">📝</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search tasks..."
              class="search-input"
            >
          </div>
          <div class="select-wrapper">
            <span class="priority-icon">⏰</span>
            <select v-model="filterPriority" class="filter-select">
              <option value="">All priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>
          <div class="select-wrapper">
            <span class="category-icon">📁</span>
            <select v-model="filterCategory" class="filter-select">
              <option value="">All categories</option>
              <option v-for="category in categories" 
                      :key="category" 
                      :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
        <button @click="showAddTask = true" class="btn-add">
          ➕ Add new task
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchTasks" class="btn-retry">Try again</button>
    </div>

    <!-- Tasks List -->
    <div v-else class="tasks-list">
      <!-- Current Tasks -->
      <div v-for="task in filteredTasks.currentTasks" 
           :key="task.id" 
           class="task-item"
           :class="{ 'task-completed': task.completed }">
        <div class="task-content">
          <input 
            type="checkbox" 
            :checked="task.completed"
            @change="toggleTaskStatus(task.id)"
            :disabled="task.completed"
            class="task-checkbox"
          >
          <div class="task-details">
            <h3 :class="{ 'completed-text': task.completed }">{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <div class="task-meta">
              <span class="priority" :class="task.priority">
                {{ task.priority }}
              </span>
              <span class="category">{{ task.category }}</span>
              <span class="due-date">{{ formatDate(task.dueDate) }}</span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button 
            @click="editTask(task)" 
            class="btn-edit"
            :disabled="task.completed"
            :class="{ 'btn-disabled': task.completed }"
          >
            ✎ Edit
          </button>
          <button @click="deleteTask(task.id)" class="btn-delete">
            🗑️ Delete
          </button>
        </div>
      </div>

      <!-- Past Tasks Divider -->
      <div v-if="filteredTasks.pastTasks.length > 0" class="past-tasks-divider">
        <span>Past tasks</span>
      </div>

      <!-- Past Tasks -->
      <div v-for="task in filteredTasks.pastTasks" 
           :key="task.id" 
           class="task-item"
           :class="{ 'task-completed': task.completed }">
        <div class="task-content">
          <input 
            type="checkbox" 
            :checked="task.completed"
            @change="toggleTaskStatus(task.id)"
            :disabled="task.completed"
            class="task-checkbox"
          >
          <div class="task-details">
            <h3 :class="{ 'completed-text': task.completed }">{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <div class="task-meta">
              <span class="priority" :class="task.priority">
                {{ task.priority }}
              </span>
              <span class="category">{{ task.category }}</span>
              <span class="due-date">{{ formatDate(task.dueDate) }}</span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button 
            @click="editTask(task)" 
            class="btn-edit"
            :disabled="task.completed"
            :class="{ 'btn-disabled': task.completed }"
          >
            ✎ Edit
          </button>
          <button @click="deleteTask(task.id)" class="btn-delete">
            🗑️ Delete
          </button>
        </div>
      </div>

      <!-- No Tasks State -->
      <div v-if="filteredTasks.currentTasks.length === 0 && filteredTasks.pastTasks.length === 0" class="no-tasks">
        No tasks available
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
    <div v-if="showAddTask || editingTask" class="modal">
      <div class="modal-content">
        <h2>{{ editingTask ? 'Edit task' : 'Add new task' }}</h2>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label>Title</label>
            <input v-model="taskForm.title" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="taskForm.description"></textarea>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select v-model="taskForm.priority" required>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="taskForm.category" required>
              <option v-for="category in categories" 
                      :key="category" 
                      :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Due date</label>
            <input type="date" v-model="taskForm.dueDate" required>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-save">
              {{ editingTask ? 'Save' : 'Add' }}
            </button>
            <button type="button" @click="closeTaskModal" class="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Adăugăm modalul de confirmare -->
    <div v-if="showConfirmModal" class="confirm-modal">
      <div class="confirm-modal-content">
        <h3>Confirm action</h3>
        <p>{{ confirmMessage }}</p>
        <div class="confirm-modal-actions">
          <button @click="handleConfirm" class="btn-confirm">Confirm</button>
          <button @click="closeConfirmModal" class="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Tasks',
  setup() {
    const store = useStore()
    const router = useRouter()
    const searchQuery = ref('')
    const filterPriority = ref('')
    const filterCategory = ref('')
    const showAddTask = ref(false)
    const editingTask = ref(null)
    
    const taskForm = ref({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      dueDate: '',
      completed: false
    })

    const categories = [
      'Work',
      'Personal',
      'Shopping',
      'Health',
      'Education',
      'Other'
    ]

    const loading = computed(() => store.getters['tasks/loading'])
    const error = computed(() => store.getters['tasks/error'])
    const tasks = computed(() => store.getters['tasks/allTasks'])

    // Computed property for filtered and sorted tasks
    const filteredTasks = computed(() => {
      let filtered = tasks.value
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
        )
      }
      
      if (filterPriority.value) {
        filtered = filtered.filter(task => task.priority === filterPriority.value)
      }
      
      if (filterCategory.value) {
        filtered = filtered.filter(task => task.category === filterCategory.value)
      }

      // Sort tasks by date and completion status
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Priority weight for sorting
      const priorityWeight = {
        high: 3,
        medium: 2,
        low: 1
      }

      const currentTasks = filtered.filter(task => {
        const taskDate = new Date(task.dueDate)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate >= today
      }).sort((a, b) => {
        const dateA = new Date(a.dueDate)
        const dateB = new Date(b.dueDate)
        dateA.setHours(0, 0, 0, 0)
        dateB.setHours(0, 0, 0, 0)

        // First sort by completion status (completed tasks at the end)
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }

        // For tasks with same completion status, sort by date
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB
        }

        // If same date, sort by priority (High to Low)
        return priorityWeight[b.priority] - priorityWeight[a.priority]
      })

      const pastTasks = filtered.filter(task => {
        const taskDate = new Date(task.dueDate)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate < today
      }).sort((a, b) => {
        const dateA = new Date(a.dueDate)
        const dateB = new Date(b.dueDate)
        dateA.setHours(0, 0, 0, 0)
        dateB.setHours(0, 0, 0, 0)

        // First sort by completion status (completed tasks at the end)
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }

        // For tasks with same completion status, sort by date (descending for past tasks)
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA
        }

        // If same date, sort by priority (High to Low)
        return priorityWeight[b.priority] - priorityWeight[a.priority]
      })

      return { currentTasks, pastTasks }
    })

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('en-US')
    }

    const fetchTasks = async () => {
      try {
        await store.dispatch('tasks/fetchTasks')
      } catch (error) {
        console.error('Error fetching tasks:', error)
        if (error.response?.status === 401) {
          store.dispatch('auth/logout')
          router.push('/login')
        }
      }
    }

    const showConfirmModal = ref(false)
    const confirmMessage = ref('')
    const pendingAction = ref(null)
    const pendingTaskId = ref(null)

    const closeConfirmModal = () => {
      showConfirmModal.value = false
      confirmMessage.value = ''
      pendingAction.value = null
      pendingTaskId.value = null
    }

    const handleConfirm = async () => {
      try {
        if (pendingAction.value === 'complete') {
          await store.dispatch('tasks/toggleTaskStatus', pendingTaskId.value)
          const taskToUpdate = tasks.value.find(t => t.id === pendingTaskId.value)
          if (taskToUpdate) {
            taskToUpdate.completed = true
          }
          store.dispatch('notifications/add', {
            type: 'success',
            message: 'Task marked as completed'
          })
        } else if (pendingAction.value === 'delete') {
          await store.dispatch('tasks/deleteTask', pendingTaskId.value)
          store.dispatch('notifications/add', {
            type: 'success',
            message: 'Task deleted successfully'
          })
        }
      } catch (error) {
        console.error('Error:', error)
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error processing request'
        })
      }
      closeConfirmModal()
    }

    const toggleTaskStatus = async (taskId) => {
      const task = tasks.value.find(t => t.id === taskId)
      if (task && task.completed) {
        return
      }

      pendingTaskId.value = taskId
      pendingAction.value = 'complete'
      confirmMessage.value = 'Are you sure you want to mark this task as completed? This action cannot be undone.'
      showConfirmModal.value = true
    }

    const editTask = (task) => {
      editingTask.value = task
      // Format the date to YYYY-MM-DD for the date input
      const formattedDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      taskForm.value = { 
        ...task,
        dueDate: formattedDate
      }
      showAddTask.value = true
    }

    const deleteTask = async (taskId) => {
      pendingTaskId.value = taskId
      pendingAction.value = 'delete'
      confirmMessage.value = 'Are you sure you want to delete this task? This action cannot be undone.'
      showConfirmModal.value = true
    }

    const saveTask = async () => {
      try {
        if (editingTask.value) {
          await store.dispatch('tasks/updateTask', {
            id: editingTask.value.id,
            ...taskForm.value
          })
          store.dispatch('notifications/add', {
            type: 'success',
            message: 'Task updated successfully'
          })
        } else {
          await store.dispatch('tasks/addTask', taskForm.value)
          store.dispatch('notifications/add', {
            type: 'success',
            message: 'Task added successfully'
          })
        }
        closeTaskModal()
      } catch (error) {
        console.error('Error saving task:', error)
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error saving task'
        })
      }
    }

    const closeTaskModal = () => {
      showAddTask.value = false
      editingTask.value = null
      taskForm.value = {
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        dueDate: '',
        completed: false
      }
    }

    onMounted(() => {
      fetchTasks()
    })

    return {
      searchQuery,
      filterPriority,
      filterCategory,
      categories,
      filteredTasks,
      showAddTask,
      editingTask,
      taskForm,
      loading,
      error,
      formatDate,
      fetchTasks,
      toggleTaskStatus,
      editTask,
      deleteTask,
      saveTask,
      closeTaskModal,
      showConfirmModal,
      confirmMessage,
      pendingAction,
      pendingTaskId,
      closeConfirmModal,
      handleConfirm
    }
  }
}
</script>

<style scoped>
.tasks-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tasks-header {
  margin-bottom: 2.5rem;
}

.tasks-header h1 {
  font-size: 2.5rem;
  color: var(--text);
  margin-bottom: 1.5rem;
}

.task-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-filter {
  display: flex;
  gap: 1rem;
  flex: 1;
  flex-wrap: wrap;
}

.search-input-wrapper,
.select-wrapper {
  position: relative;
  flex: 1;
  background: var(--background);
  border-radius: 8px;
  border: 1px solid var(--primary);
  transition: all 0.3s ease;
}

.search-input-wrapper:hover,
.select-wrapper:hover {
  border-color: var(--secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-icon,
.priority-icon,
.category-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text);
  opacity: 0.7;
  font-size: 1.1rem;
  pointer-events: none;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
}

.filter-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.filter-select option {
  background: var(--background);
  color: var(--text);
  padding: 0.5rem;
}

/* Priority colors */
.priority {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 500;
  text-transform: capitalize;
}

.priority.high {
  background: rgba(239, 83, 80, 0.2);
  color: #ef5350;
  border: 1px solid #ef5350;
}

.priority.medium {
  background: rgba(255, 167, 38, 0.2);
  color: #ffa726;
  border: 1px solid #ffa726;
}

.priority.low {
  background: rgba(102, 187, 106, 0.2);
  color: #66bb6a;
  border: 1px solid #66bb6a;
}

.category {
  background: var(--primary);
  color: var(--text);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 500;
}

.due-date {
  background: var(--secondary);
  color: var(--text);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 500;
}

.btn-add,
.btn-edit,
.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-add span,
.btn-edit span,
.btn-delete span {
  font-size: 1.1rem;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--primary);
  border-left: 4px solid var(--secondary);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.task-item:hover {
  transform: translateX(5px);
  background: var(--background);
}

.task-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.task-details {
  flex: 1;
}

.task-details h3 {
  font-size: 1.1rem;
  margin: 0;
  color: var(--text);
}

.task-details p {
  margin: 0.25rem 0;
  color: var(--text);
  opacity: 0.8;
  font-size: 0.9rem;
}

.task-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}

.btn-edit {
  background: var(--primary);
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--background);
  border: 1px solid var(--primary);
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  color: var(--text);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text);
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--primary);
  border-radius: 8px;
  background: var(--background);
  color: var(--text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-save,
.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save {
  background: var(--primary);
  color: white;
}

.btn-cancel {
  background: var(--secondary);
  color: var(--text);
}

.btn-save:hover,
.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .tasks-container {
    padding: 1rem;
  }

  .tasks-header h1 {
    font-size: 2rem;
  }

  .task-controls {
    flex-direction: column;
  }

  .search-filter {
    width: 100%;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .task-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .task-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }
}

/* Add new styles for loading and error states */
.loading-state,
.error-state,
.no-tasks {
  text-align: center;
  padding: 2rem;
  background: var(--primary);
  border-radius: 1rem;
  margin-top: 2rem;
}

.error-state {
  color: #f44336;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-retry:hover {
  opacity: 0.9;
}

.task-item.task-completed {
  opacity: 0.7;
  background: var(--background);
  border-left-color: #9e9e9e;
}

.task-item.task-completed .task-details h3 {
  text-decoration: line-through;
  color: var(--text);
  opacity: 0.7;
}

.task-item.task-completed .task-details p {
  text-decoration: line-through;
  opacity: 0.5;
}

.task-item.task-completed .priority,
.task-item.task-completed .category,
.task-item.task-completed .due-date {
  opacity: 0.6;
}

.past-tasks-divider {
  width: 100%;
  text-align: center;
  margin: 2rem 0;
  position: relative;
  color: var(--text);
  opacity: 0.7;
}

.past-tasks-divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: var(--primary);
  z-index: 1;
}

.past-tasks-divider span {
  background: var(--background);
  padding: 0 1rem;
  position: relative;
  z-index: 2;
  font-size: 0.9rem;
}

.task-checkbox {
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.task-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  background: var(--background) !important;
  color: var(--text) !important;
  transform: none !important;
  box-shadow: none !important;
}

.btn-disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal-content {
  background: var(--background);
  border: 1px solid var(--primary);
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.confirm-modal-content h3 {
  color: var(--text);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.confirm-modal-content p {
  color: var(--text);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.confirm-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-confirm {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: var(--background);
  color: var(--text);
  border: 1px solid var(--primary);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 