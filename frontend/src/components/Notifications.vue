<template>
  <div class="notifications-container">
    <transition-group name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', notification.type]"
      >
        <div class="notification-content">
          {{ notification.message }}
        </div>
        <button class="notification-close" @click="removeNotification(notification.id)">
          x
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Notifications',
  setup() {
    const store = useStore()

    const notifications = computed(() => store.getters['notifications/notifications'])

    const removeNotification = (id) => {
      store.dispatch('notifications/remove', id)
    }

    return {
      notifications,
      removeNotification
    }
  }
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--primary);
  color: var(--text);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notification.success {
  background-color: #4caf50;
}

.notification.error {
  background-color: #f44336;
}

.notification.warning {
  background-color: #ff9800;
}

.notification-content {
  flex: 1;
  margin-right: 1rem;
}

.notification-close {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 