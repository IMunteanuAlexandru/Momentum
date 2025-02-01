<template>
  <div class="tasks-container">
    <div class="tasks-header">
      <h1>Sarcini</h1>
      <div class="task-controls">
        <div class="search-filter">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Caută sarcini..."
            class="search-input"
          >
          <select v-model="filterPriority" class="filter-select">
            <option value="">Toate prioritățile</option>
            <option value="high">Prioritate înaltă</option>
            <option value="medium">Prioritate medie</option>
            <option value="low">Prioritate joasă</option>
          </select>
          <select v-model="filterCategory" class="filter-select">
            <option value="">Toate categoriile</option>
            <option v-for="category in categories" 
                    :key="category" 
                    :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <button @click="showAddTask = true" class="btn-add">
          Adaugă sarcină nouă
        </button>
      </div>
    </div>

    <!-- Task List -->
    <div class="tasks-list">
      <div v-for="task in filteredTasks" 
           :key="task.id" 
           class="task-item"
           :class="{ 'task-completed': task.completed }">
        <div class="task-content">
          <input 
            type="checkbox" 
            :checked="task.completed"
            @change="toggleTaskStatus(task.id)"
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
          <button @click="editTask(task)" class="btn-edit">
            Editează
          </button>
          <button @click="deleteTask(task.id)" class="btn-delete">
            Șterge
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
    <div v-if="showAddTask || editingTask" class="modal">
      <div class="modal-content">
        <h2>{{ editingTask ? 'Editează sarcina' : 'Adaugă sarcină nouă' }}</h2>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label>Titlu</label>
            <input v-model="taskForm.title" required>
          </div>
          <div class="form-group">
            <label>Descriere</label>
            <textarea v-model="taskForm.description"></textarea>
          </div>
          <div class="form-group">
            <label>Prioritate</label>
            <select v-model="taskForm.priority" required>
              <option value="high">Înaltă</option>
              <option value="medium">Medie</option>
              <option value="low">Joasă</option>
            </select>
          </div>
          <div class="form-group">
            <label>Categorie</label>
            <select v-model="taskForm.category" required>
              <option v-for="category in categories" 
                      :key="category" 
                      :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Data limită</label>
            <input type="date" v-model="taskForm.dueDate" required>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-save">
              {{ editingTask ? 'Salvează' : 'Adaugă' }}
            </button>
            <button type="button" @click="closeTaskModal" class="btn-cancel">
              Anulează
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Tasks',
  setup() {
    const store = useStore()
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
      dueDate: ''
    })

    const categories = [
      'Muncă',
      'Personal',
      'Cumpărături',
      'Sănătate',
      'Educație',
      'Altele'
    ]

    // Computed property for filtered tasks
    const filteredTasks = computed(() => {
      let tasks = store.state.tasks.list
      
      if (searchQuery.value) {
        tasks = tasks.filter(task => 
          task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }
      
      if (filterPriority.value) {
        tasks = tasks.filter(task => task.priority === filterPriority.value)
      }
      
      if (filterCategory.value) {
        tasks = tasks.filter(task => task.category === filterCategory.value)
      }
      
      return tasks
    })

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ro-RO')
    }

    const toggleTaskStatus = (taskId) => {
      store.dispatch('tasks/toggleTaskStatus', taskId)
    }

    const editTask = (task) => {
      editingTask.value = task
      taskForm.value = { ...task }
      showAddTask.value = true
    }

    const deleteTask = (taskId) => {
      if (confirm('Ești sigur că vrei să ștergi această sarcină?')) {
        store.dispatch('tasks/deleteTask', taskId)
      }
    }

    const saveTask = () => {
      if (editingTask.value) {
        store.dispatch('tasks/updateTask', {
          id: editingTask.value.id,
          ...taskForm.value
        })
      } else {
        store.dispatch('tasks/addTask', {
          ...taskForm.value,
          id: Date.now(),
          completed: false
        })
      }
      closeTaskModal()
    }

    const closeTaskModal = () => {
      showAddTask.value = false
      editingTask.value = null
      taskForm.value = {
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        dueDate: ''
      }
    }

    return {
      searchQuery,
      filterPriority,
      filterCategory,
      categories,
      filteredTasks,
      showAddTask,
      editingTask,
      taskForm,
      formatDate,
      toggleTaskStatus,
      editTask,
      deleteTask,
      saveTask,
      closeTaskModal
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

.search-input,
.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--secondary);
  border-radius: 10px;
  background: var(--background);
  color: var(--text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input {
  flex: 2;
  min-width: 200px;
}

.filter-select {
  flex: 1;
  min-width: 150px;
}

.search-input:focus,
.filter-select:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tasks-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.task-item {
  background: var(--primary);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.task-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.task-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary);
  opacity: 0.5;
}

.task-item.task-completed {
  opacity: 0.7;
  background: var(--background);
}

.task-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.task-content input[type="checkbox"] {
  width: 24px;
  height: 24px;
  border: 2px solid var(--primary);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  appearance: none;
  background: var(--background);
  transition: all 0.3s ease;
}

.task-content input[type="checkbox"]:checked {
  background: var(--primary);
}

.task-content input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
}

.task-details {
  flex: 1;
}

.task-details h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.task-details p {
  color: var(--text);
  opacity: 0.8;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.completed-text {
  text-decoration: line-through;
  opacity: 0.7;
}

.task-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.priority,
.category,
.due-date {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.priority {
  color: white;
}

.priority.high {
  background: #f44336;
}

.priority.medium {
  background: #ff9800;
}

.priority.low {
  background: #4caf50;
}

.category {
  background: var(--secondary);
  color: var(--text);
}

.due-date {
  background: var(--background);
  color: var(--text);
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--secondary);
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
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
  background: var(--primary);
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
  border: 2px solid var(--secondary);
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

  .tasks-list {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }
}
</style> 