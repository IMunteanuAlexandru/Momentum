<template>
  <div class="task-card">
    <div class="task-content" @click="$emit('click')">
      <div class="task-header">
        <div class="checkbox-wrapper">
          <input 
            type="checkbox" 
            :checked="task.completed"
            @click.stop="$emit('toggle')"
            class="task-checkbox"
          >
          <span class="checkmark"></span>
        </div>
        <h3 class="task-title" :class="{ 'completed': task.completed }">{{ task.title }}</h3>
      </div>
      <div class="task-meta">
        <span class="task-priority" :class="task.priority.toLowerCase()">{{ task.priority }}</span>
        <span class="task-date">{{ formatDate(task.dueDate) }}</span>
      </div>
    </div>

    <div class="task-actions">
      <button v-if="!task.completed" class="btn-edit" @click.stop="$emit('edit')" title="Edit task">
        <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.05c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      </button>
      <button class="btn-delete" @click.stop="$emit('delete')" title="Delete task">
        <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'edit', 'delete', 'toggle'])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.task-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(56, 142, 60, 0.2);
}

.task-card:hover {
  background: rgba(56, 142, 60, 0.05);
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.checkbox-wrapper {
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.task-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 16px;
  width: 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.task-checkbox:checked ~ .checkmark {
  background-color: var(--primary);
  border-color: var(--primary);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.task-checkbox:checked ~ .checkmark:after {
  display: block;
}

.task-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-title.completed {
  text-decoration: line-through;
  color: var(--text);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text);
}

.task-priority {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: capitalize;
}

.task-priority.high { 
  background: rgba(211, 47, 47, 0.1); 
  color: #d32f2f; 
}
.task-priority.medium { 
  background: rgba(245, 124, 0, 0.1); 
  color: #f57c00; 
}
.task-priority.low { 
  background: rgba(56, 142, 60, 0.1); 
  color: #388e3c; 
}

.task-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: var(--text);
}

.btn-edit:hover {
  color: var(--primary);
}

.btn-delete:hover {
  color: #d32f2f;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>