<template>
  <div class="event-card" @click="$emit('click')">
    <div class="event-content">
      <div class="event-time">{{ formatTime(event.startDate) }}</div>
      <h3 class="event-title">{{ event.title }}</h3>
      <div class="event-meta">
        <span class="event-category" :class="event.category.toLowerCase()">{{ event.category }}</span>
        <span class="event-date">{{ formatDate(event.startDate) }}</span>
      </div>
    </div>

    <div class="event-actions">
      <button class="btn-edit" @click.stop="$emit('edit')" title="Edit event">
        <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.05c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      </button>
      <button class="btn-delete" @click.stop="$emit('delete')" title="Delete event">
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
  event: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'edit', 'delete'])

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit'
  })
}
</script>

<style scoped>
.event-card {

  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid var(--primary);
}

.event-card:hover {
  background: var(--primary);
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-time {
  font-size: 0.875rem;
  color: var(--text);
  margin-bottom: 4px;
}

.event-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--text);
}

.event-category {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: capitalize;
}

.event-category.meeting { 
  background: rgba(25, 118, 210, 0.1); 
  color: #1976d2; 
}
.event-category.event { 
  background: rgba(123, 31, 162, 0.1); 
  color: #7b1fa2; 
}
.event-category.reminder { 
  background: rgba(56, 142, 60, 0.1); 
  color: #388e3c; 
}
.event-category.birthday { 
  background: rgba(245, 124, 0, 0.1); 
  color: #f57c00; 
}
.event-category.holiday { 
  background: rgba(194, 24, 91, 0.1); 
  color: #c2185b; 
}

.event-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.event-card:hover .event-actions {
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