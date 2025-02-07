<template>
  <div class="overview-container">
    <header class="page-header">
      <h1>Dashboard Overview</h1>
      <div class="header-actions">
        <button class="btn-new-task">
          <i class="fas fa-plus"></i>
          New Task
        </button>
      </div>
    </header>

    <div class="overview-grid">
      <!-- Quick Stats -->
      <div class="overview-card stats-card">
        <h3>Today's Progress</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.completedTasks }}</div>
            <div class="stat-label">Tasks Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.inProgressTasks }}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ Math.round((stats.completedTasks / (stats.completedTasks + stats.inProgressTasks + stats.upcomingTasks)) * 100 || 0) }}%</div>
            <div class="stat-label">Productivity</div>
          </div>
        </div>
      </div>

      <!-- Recent Tasks -->
      <div class="overview-card tasks-card">
        <h3>Recent Tasks</h3>
        <div class="task-list">
          <div v-for="task in recentTasks" :key="task.id" class="task-item">
            <div :class="['task-status', task.status]"></div>
            <div class="task-content">
              <h4>{{ task.title }}</h4>
              <p>Due {{ formatDate(task.dueDate) }}</p>
            </div>
          </div>
          <div v-if="recentTasks.length === 0" class="no-tasks">
            No tasks available
          </div>
        </div>
      </div>

      <!-- Productivity Chart -->
      <div class="overview-card chart-card">
        <h3>Weekly Productivity</h3>
        <div class="chart-container">
          <div class="placeholder-chart">
            <div class="chart-column">
              <div class="chart-bar" style="height: 60%"></div>
              <div class="chart-date">{{ getDayLabel(6) }}</div>
            </div>
            <div class="chart-column">
              <div class="chart-bar" style="height: 80%"></div>
              <div class="chart-date">{{ getDayLabel(5) }}</div>
            </div>
            <div class="chart-column">
              <div class="chart-bar" style="height: 40%"></div>
              <div class="chart-date">{{ getDayLabel(4) }}</div>
            </div>
            <div class="chart-column">
              <div class="chart-bar" style="height: 90%"></div>
              <div class="chart-date">{{ getDayLabel(3) }}</div>
            </div>
            <div class="chart-column">
              <div class="chart-bar" style="height: 70%"></div>
              <div class="chart-date">{{ getDayLabel(2) }}</div>
            </div>
            <div class="chart-column">
              <div class="chart-bar" style="height: 50%"></div>
              <div class="chart-date">{{ getDayLabel(1) }}</div>
            </div>
            <div class="chart-column">
              <div class="chart-bar" style="height: 75%"></div>
              <div class="chart-date">{{ getDayLabel(0) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="overview-card actions-card">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-btn">
            <i class="fas fa-bullseye"></i>
            <span>Set Goal</span>
          </button>
          <button class="action-btn">
            <i class="fas fa-bell"></i>
            <span>Reminders</span>
          </button>
          <button class="action-btn">
            <i class="fas fa-sticky-note"></i>
            <span>Notes</span>
          </button>
          <button class="action-btn">
            <i class="fas fa-chart-bar"></i>
            <span>Reports</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'

export default {
  name: 'DashboardOverview',
  
  setup() {
    const store = useStore()
    const recentTasks = ref([])
    const todayEvents = ref([])
    const lastLogin = ref(null)
    const stats = ref({
      completedTasks: 0,
      inProgressTasks: 0,
      upcomingTasks: 0
    })

    const userDisplayName = computed(() => {
      const user = store.getters['auth/currentUser']
      return user?.displayName || 'User'
    })

    const fetchDashboardData = async () => {
      try {
        const token = store.getters['auth/token']
        const response = await axios.get('http://localhost:5000/api/dashboard/overview', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.data.status === 'success') {
          const data = response.data.data
          recentTasks.value = data.recentTasks || []
          todayEvents.value = data.todayEvents || []
          lastLogin.value = data.lastLogin
          stats.value = data.stats || {
            completedTasks: 0,
            inProgressTasks: 0,
            upcomingTasks: 0
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const formatTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getDayLabel = (daysAgo) => {
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    }

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      userDisplayName,
      recentTasks,
      todayEvents,
      lastLogin,
      stats,
      formatDate,
      formatTime,
      getDayLabel
    }
  }
}
</script>

<style scoped>
.overview-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.btn-new-task {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary);
  color: var(--text);
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-new-task:hover {
  opacity: 0.9;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.overview-card {
  background: var(--primary);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.overview-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 1.5rem;
}

/* Stats Card */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--secondary);
}

/* Tasks Card */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--secondary);
  border-radius: 0.5rem;
}

.task-status {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.task-status.completed {
  background-color: var(--secondary);
}

.task-status.in-progress {
  background-color: var(--text);
}

.task-status.pending {
  background-color: var(--primary);
}

.task-content h4 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  margin: 0 0 0.25rem 0;
}

.task-content p {
  font-size: 0.875rem;
  color: var(--text);
  margin: 0;
}

/* Chart Card */
.chart-container {
  height: 240px;
  display: flex;
  align-items: flex-end;
  padding: 1rem 0;
}

.placeholder-chart {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 1rem;
}

.chart-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.chart-bar {
  width: 2rem;
  background-color: var(--secondary);
  border-radius: 0.25rem;
  transition: height 0.3s ease;
}

.chart-date {
  color: var(--text);
  font-size: 0.75rem;
  text-transform: uppercase;
}

/* Actions Card */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  background: var(--secondary);
  border: none;
  border-radius: 0.5rem;
  color: var(--text);
  cursor: pointer;
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  background: var(--primary);
}

.action-btn i {
  font-size: 1.5rem;
}

.no-tasks {
  text-align: center;
  color: var(--text);
  padding: 1rem;
}

@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .overview-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style> 