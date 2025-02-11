<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>Setări</h1>
      <p class="settings-description">Personalizează experiența ta în aplicație</p>
    </div>

    <div class="settings-grid">
      <!-- Appearance Section -->
      <div class="settings-card">
        <div class="card-header">
          <div class="icon-wrapper appearance">
            🎨
          </div>
          <h2>Aspect</h2>
        </div>
        <div class="card-content">
          <div class="setting-group">
            <label for="theme-select">Temă</label>
            <select 
              id="theme-select" 
              v-model="currentTheme" 
              @change="handleThemeChange" 
              class="select-input"
            >
              <option value="theme-modern">Temă Modernă</option>
              <option value="theme-retro">Temă Retro</option>
              <option value="theme-dark">Temă Întunecată</option>
              <option value="theme-nature">Temă Natură</option>
              <option value="theme-soft">Temă Soft</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notification Section -->
      <div class="settings-card">
        <div class="card-header">
          <div class="icon-wrapper notifications">
            🔔
          </div>
          <h2>Notificări</h2>
        </div>
        <div class="card-content">
          <div class="setting-group">
            <label class="switch-label">
              <span>Email Notificări</span>
              <div class="switch">
                <input type="checkbox" v-model="emailNotifications">
                <span class="slider round"></span>
              </div>
            </label>
          </div>
          <div class="setting-group">
            <label class="switch-label">
              <span>Notificări Push</span>
              <div class="switch">
                <input type="checkbox" v-model="pushNotifications" @change="handlePushNotificationChange">
                <span class="slider round"></span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-actions">
      <button @click="resetSettings" class="btn-reset">
        <span class="icon">↺</span>
        Resetează Setările
      </button>
      <button @click="saveSettings" class="btn-save">
        <span class="icon">💾</span>
        Salvează Modificările
      </button>
    </div>

    <!-- All CustomAlerts -->
    <CustomAlert
      v-model:show="showPermissionAlert"
      title="Permisiune Notificări"
      message="Pentru a primi notificări despre evenimente și task-uri, vă rugăm să acordați permisiunea necesară."
      type="info"
      confirmText="Permite"
      cancelText="Nu acum"
      :showCancel="true"
      @confirm="requestNotificationPermission"
      @cancel="handlePermissionDenied"
    />

    <CustomAlert
      v-model:show="showUnsupportedAlert"
      title="Incompatible Browser"
      message="This browser does not support push notifications!"
      type="error"
      confirmText="I understand"
      @confirm="handleUnsupportedBrowser"
    />

    <CustomAlert
      v-model:show="showSuccessAlert"
      title="Success"
      message="Settings have been saved successfully!"
      type="success"
      confirmText="OK"
      @confirm="hideSuccessAlert"
    />

    <CustomAlert
      v-model:show="showResetAlert"
      title="Reset Confirmation"
      message="Are you sure you want to reset all settings to default values?"
      type="warning"
      confirmText="Yes, reset"
      cancelText="No, cancel"
      :showCancel="true"
      @confirm="confirmReset"
      @cancel="hideResetAlert"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import notificationService from '@/services/NotificationService'
import CustomAlert from '@/components/CustomAlert.vue'

export default {
  name: 'Settings',
  components: {
    CustomAlert
  },
  setup() {
    const store = useStore()
    const currentTheme = ref('theme-modern')
    const emailNotifications = ref(true)
    const pushNotifications = ref(true)
    
    // Alert states
    const showPermissionAlert = ref(false)
    const showUnsupportedAlert = ref(false)
    const showSuccessAlert = ref(false)
    const showResetAlert = ref(false)

    // Alert handlers
    const hideSuccessAlert = () => {
      showSuccessAlert.value = false;
    }

    const hideResetAlert = () => {
      showResetAlert.value = false;
    }

    const handleUnsupportedBrowser = () => {
      showUnsupportedAlert.value = false;
      pushNotifications.value = false;
    }

    const handlePermissionDenied = () => {
      pushNotifications.value = false;
      showPermissionAlert.value = false;
    }

    const requestNotificationPermission = async () => {
      if (!("Notification" in window)) {
        showUnsupportedAlert.value = true;
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          pushNotifications.value = false;
        } else {
          notificationService.start();
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        pushNotifications.value = false;
      }
      showPermissionAlert.value = false;
    }

    const handlePushNotificationChange = async () => {
      if (pushNotifications.value) {
        if (Notification.permission === "default") {
          showPermissionAlert.value = true;
        } else if (Notification.permission === "granted") {
          notificationService.start();
        } else {
          pushNotifications.value = false;
        }
      } else {
        notificationService.stop();
      }
    }

    const handleThemeChange = () => {
      localStorage.setItem('theme', currentTheme.value)
      document.documentElement.className = currentTheme.value
      window.location.reload()
    }

    const saveSettings = () => {
      localStorage.setItem('emailNotifications', emailNotifications.value)
      localStorage.setItem('pushNotifications', pushNotifications.value)
      showSuccessAlert.value = true;
    }

    const confirmReset = () => {
      currentTheme.value = 'theme-modern'
      emailNotifications.value = true
      pushNotifications.value = true
      handleThemeChange()
      showResetAlert.value = false;
    }

    const resetSettings = () => {
      showResetAlert.value = true;
    }

    onMounted(() => {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        currentTheme.value = savedTheme
        document.documentElement.className = savedTheme
      }
      
      emailNotifications.value = localStorage.getItem('emailNotifications') !== 'false'
      pushNotifications.value = localStorage.getItem('pushNotifications') !== 'false'
      
      if (pushNotifications.value) {
        requestNotificationPermission();
      }
    })

    onUnmounted(() => {
      notificationService.stop();
    })

    return {
      currentTheme,
      emailNotifications,
      pushNotifications,
      showPermissionAlert,
      showUnsupportedAlert,
      showSuccessAlert,
      showResetAlert,
      handlePushNotificationChange,
      handleThemeChange,
      saveSettings,
      resetSettings,
      requestNotificationPermission,
      handlePermissionDenied,
      handleUnsupportedBrowser,
      hideSuccessAlert,
      hideResetAlert,
      confirmReset
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-header {
  text-align: center;
  margin-bottom: 3rem;
}

.settings-header h1 {
  font-size: 2.5rem;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.settings-description {
  color: var(--text);
  opacity: 0.8;
  font-size: 1.1rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.settings-card {
  background: var(--primary);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-5px);
}

.card-header {
  padding: 1.5rem;
  background: var(--secondary);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.appearance { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
.notifications { background: linear-gradient(135deg, #4CAF50, #8BC34A); }

.card-header h2 {
  color: var(--text);
  font-size: 1.3rem;
  margin: 0;
}

.card-content {
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group label {
  color: var(--text);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.select-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--secondary);
  border-radius: 8px;
  background: var(--background);
  color: var(--text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.select-input:hover, .select-input:focus {
  border-color: var(--primary);
  outline: none;
}

/* Switch styles */
.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

input:checked + .slider {
  background: var(--secondary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Action buttons */
.settings-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
}

.btn-reset, .btn-save {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-reset {
  background: #f44336;
  color: white;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-reset:hover, .btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 1rem;
  }

  .settings-header h1 {
    font-size: 2rem;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .settings-actions {
    flex-direction: column;
  }

  .btn-reset, .btn-save {
    width: 100%;
    justify-content: center;
  }
}
</style> 