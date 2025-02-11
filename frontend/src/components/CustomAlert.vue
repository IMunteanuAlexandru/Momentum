<template>
  <transition name="fade">
    <div v-if="show" class="custom-alert-overlay" @click="handleOverlayClick">
      <div class="custom-alert" :class="type">
        <div class="alert-icon">
          <span v-if="type === 'info'">ℹ️</span>
          <span v-else-if="type === 'success'">✅</span>
          <span v-else-if="type === 'warning'">⚠️</span>
          <span v-else-if="type === 'error'">❌</span>
        </div>
        <div class="alert-content">
          <h3 v-if="title" class="alert-title">{{ title }}</h3>
          <p class="alert-message">{{ message }}</p>
        </div>
        <div class="alert-actions">
          <button class="btn-primary" @click="handleConfirm">{{ confirmText }}</button>
          <button v-if="showCancel" class="btn-secondary" @click="handleCancel">{{ cancelText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'CustomAlert',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['info', 'success', 'warning', 'error'].includes(value)
    },
    confirmText: {
      type: String,
      default: 'OK'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    showCancel: {
      type: Boolean,
      default: false
    }
  },
  emits: ['confirm', 'cancel'],
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleCancel() {
      this.$emit('cancel');
    },
    handleOverlayClick(e) {
      if (e.target.classList.contains('custom-alert-overlay')) {
        this.handleCancel();
      }
    }
  }
}
</script>

<style scoped>
.custom-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.custom-alert {
  background: var(--background, white);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.alert-icon {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1rem;
}

.alert-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.alert-title {
  font-size: 1.25rem;
  color: var(--text);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.alert-message {
  color: var(--text);
  opacity: 0.9;
  line-height: 1.5;
}

.alert-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: var(--primary, #4CAF50);
  color: white;
}

.btn-secondary {
  background: var(--secondary, #9e9e9e);
  color: white;
}

.btn-primary:hover, .btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Alert types */
.info .alert-icon { color: #2196F3; }
.success .alert-icon { color: #4CAF50; }
.warning .alert-icon { color: #FFC107; }
.error .alert-icon { color: #F44336; }

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .custom-alert {
    width: 95%;
    padding: 1rem;
  }
  
  .alert-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
</style> 