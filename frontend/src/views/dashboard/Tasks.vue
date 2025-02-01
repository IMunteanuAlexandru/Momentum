<template>
  <div class="tasks-container">
    <header class="page-header">
      <h1>Tasks</h1>
      <div class="header-actions">
        <button class="delete-completed-btn" @click="deleteCompletedTasks">
          <i class="fas fa-trash"></i>
          Delete Completed
        </button>
        <button class="add-task-btn">
          <i class="fas fa-plus"></i>
          Add Task
        </button>
      </div>
    </header>

    <div class="tasks-grid">
      <div class="task-column">
        <h2>To Do</h2>
        <div class="task-list">
          <div class="task-card">
            <h3>Project Planning</h3>
            <p>Create project timeline and milestones</p>
            <div class="task-meta">
              <span class="priority high">High</span>
              <span class="due-date">Today</span>
            </div>
          </div>
        </div>
      </div>

      <div class="task-column">
        <h2>In Progress</h2>
        <div class="task-list">
          <div class="task-card">
            <h3>Feature Development</h3>
            <p>Implement user authentication system</p>
            <div class="task-meta">
              <span class="priority medium">Medium</span>
              <span class="due-date">Tomorrow</span>
            </div>
          </div>
        </div>
      </div>

      <div class="task-column">
        <h2>Completed</h2>
        <div class="task-list">
          <div class="task-card completed">
            <h3>Setup Project</h3>
            <p>Initialize Vue.js project structure</p>
            <div class="task-meta">
              <span class="priority low">Low</span>
              <span class="due-date">Done</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const deleteCompletedTasks = () => {
  store.dispatch('tasks/deleteCompletedTasks')
}
</script>

<style scoped>
.tasks-container {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  color: var(--text);
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.delete-completed-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.delete-completed-btn:hover {
  opacity: 0.9;
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary);
  color: var(--text);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.add-task-btn:hover {
  opacity: 0.9;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.task-column {
  background-color: var(--primary);
  border-radius: 8px;
  padding: 1rem;
}

.task-column h2 {
  color: var(--text);
  font-size: 1.25rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--secondary);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  background-color: var(--background);
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-card h3 {
  color: var(--text);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.task-card p {
  color: var(--text);
  opacity: 0.8;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.priority {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.priority.high {
  background-color: #ef4444;
  color: white;
}

.priority.medium {
  background-color: #f59e0b;
  color: white;
}

.priority.low {
  background-color: #10b981;
  color: white;
}

.due-date {
  font-size: 0.8rem;
  color: var(--text);
  opacity: 0.8;
}

.task-card.completed {
  opacity: 0.7;
}

@media (max-width: 768px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}
</style> 