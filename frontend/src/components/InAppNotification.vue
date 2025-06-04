<template>
  <div class="notification-center" v-if="notifications.length > 0">
    <div class="notification-header">
      <h3>Notificări</h3>
      <div class="notification-controls">
        <button @click="toggleSound" class="sound-toggle" :title="soundEnabled ? 'Dezactivează sunetul' : 'Activează sunetul'">
          {{ soundEnabled ? '🔊' : '🔇' }}
        </button>
        <button @click="clearAll" class="clear-all">Șterge toate</button>
      </div>
    </div>
    <div class="notifications-list">
      <div v-for="notification in notifications" 
           :key="notification.id" 
           class="notification-item"
           :class="notification.type">
        <div class="notification-icon">
          {{ notification.icon }}
        </div>
        <div class="notification-content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
          <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
        </div>
        <button @click="removeNotification(notification.id)" class="close-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import soundService from '@/services/SoundService'

export default {
  name: 'InAppNotification',
  setup() {
    const notifications = ref([])
    const soundEnabled = ref(localStorage.getItem('notificationSound') !== 'false')

    const addNotification = (notification) => {
      const id = Date.now()
      notifications.value.unshift({
        id,
        ...notification,
        timestamp: new Date()
      })
      
      // Play sound if enabled
      if (soundEnabled.value) {
        soundService.play()
      }
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        removeNotification(id)
      }, 5000)
    }

    const removeNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }

    const clearAll = () => {
      notifications.value = []
    }

    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value
      localStorage.setItem('notificationSound', soundEnabled.value)
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - timestamp
      
      if (diff < 60000) return 'chiar acum'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m în urmă`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h în urmă`
      return timestamp.toLocaleDateString()
    }

    // Expose methods to parent
    onMounted(() => {
      window.notificationCenter = {
        addNotification
      }
    })

    return {
      notifications,
      removeNotification,
      clearAll,
      formatTime,
      soundEnabled,
      toggleSound
    }
  }
}
</script>

<style scoped>
.notification-center {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  max-height: 80vh;
  background: var(--primary);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: var(--secondary);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.notification-header h3 {
  margin: 0;
  color: var(--text);
}

.notification-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.clear-all {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.clear-all:hover {
  opacity: 1;
}

.notifications-list {
  max-height: calc(80vh - 50px);
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  font-size: 1.5rem;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-content {
  flex-grow: 1;
}

.notification-content h4 {
  margin: 0 0 5px 0;
  color: var(--text);
}

.notification-content p {
  margin: 0;
  color: var(--text);
  opacity: 0.8;
  font-size: 0.9rem;
}

.notification-time {
  font-size: 0.8rem;
  color: var(--text);
  opacity: 0.6;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text);
  opacity: 0.5;
  cursor: pointer;
  padding: 0 5px;
  font-size: 1.2rem;
  transition: opacity 0.3s;
}

.close-btn:hover {
  opacity: 1;
}

/* Notification types */
.notification-item.event {
  border-left: 4px solid #4CAF50;
}

.notification-item.task {
  border-left: 4px solid #2196F3;
}

.notification-item.warning {
  border-left: 4px solid #FFC107;
}

.notification-item.error {
  border-left: 4px solid #F44336;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.sound-toggle {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
  font-size: 1.2rem;
  padding: 0.25rem;
}

.sound-toggle:hover {
  opacity: 1;
}
</style> 