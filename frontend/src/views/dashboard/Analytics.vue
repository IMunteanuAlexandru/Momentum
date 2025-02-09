<template>
  <div class="analytics-container">
    <header class="page-header">
      <h1>Analytics</h1>
      <div class="header-actions">
        <select v-model="timeRange" class="time-range-select" @change="fetchAnalyticsData">
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
        <button class="generate-report-btn" @click="generateReport">
          Generate Report
        </button>
      </div>
    </header>

    <div class="analytics-grid">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="stat-card">
          <span class="icon">📊</span>
          <h3>Total Tasks</h3>
          <div class="stat-value">{{ analyticsData.stats.totalTasks }}</div>
        </div>

        <div class="stat-card">
          <span class="icon">✅</span>
          <h3>Completed Tasks</h3>
          <div class="stat-value">
            {{ analyticsData.stats.completedTasks }}
            <span class="trend up"
              v-if="analyticsData.stats.completedTasks > analyticsData.stats.pendingTasks">⬆️</span>
          </div>
        </div>

        <div class="stat-card">
          <span class="icon">⏰</span>
          <h3>Pending Tasks</h3>
          <div class="stat-value">
            {{ analyticsData.stats.pendingTasks }}
            <span class="trend down"
              v-if="analyticsData.stats.pendingTasks < analyticsData.stats.completedTasks">⬇️</span>
          </div>
        </div>

        <div class="stat-card">
          <span class="icon">📈</span>
          <h3>Productivity Score</h3>
          <div class="stat-value">
            {{ analyticsData.stats.productivityScore }}%
            <div>
              <span class="trend up" v-if="analyticsData.stats.productivityScore >= 70">⬆️</span>
              <span class="trend down" v-else>⬇️</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <span class="icon">📅</span>
          <h3>Evenimente Luna Curentă</h3>
          <div class="stat-value">
            {{ analyticsData.stats.monthTotalEvents }}
            <span class="trend up"
              v-if="analyticsData.stats.monthTotalEvents > 0">⬆️</span>
          </div>
        </div>

        <div class="stat-card">
          <span class="icon">✅</span>
          <h3>Evenimente Trecute</h3>
          <div class="stat-value">
            {{ analyticsData.stats.monthPastEvents }}
            <span class="trend up"
              v-if="analyticsData.stats.monthPastEvents === analyticsData.stats.monthTotalEvents">⬆️</span>
          </div>
        </div>
      </div>

      <!-- Progress Chart -->
      <div class="chart-container">
        <h2>Task Completion Progress</h2>
        <div class="progress-chart">
          <div v-for="(bar, index) in analyticsData.progressData" :key="index" class="chart-bar"
            :style="{ height: bar.height + '%' }">
            <span class="bar-label">{{ bar.label }}</span>
            <span class="bar-value">{{ bar.value }}%</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-container">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div v-for="activity in analyticsData.recentActivity" :key="activity.id" class="activity-item">
            <span class="icon">{{ getActivityIcon(activity.type) }}</span>
            <div class="activity-content">
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { getAuth } from 'firebase/auth'

const toast = useToast()
const timeRange = ref('week')
const analyticsData = ref({
  stats: {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    productivityScore: 0,
    totalEvents: 0,
    monthTotalEvents: 0,
    monthPastEvents: 0
  },
  progressData: [],
  recentActivity: []
})

const fetchAnalyticsData = async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      toast.error('Please login to view analytics')
      return
    }

    const token = await user.getIdToken()

    // Fetch tasks data
    const tasksResponse = await axios.get('/api/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (tasksResponse.data.status === 'success') {
      const tasks = tasksResponse.data.data
      const now = new Date()
      let startDate

      // Calculate start date based on selected time range
      if (timeRange.value === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (timeRange.value === 'month') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else {
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      }

      // Filter tasks by date range
      const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= startDate && taskDate <= now
      })

      // Calculate task statistics
      const totalTasks = filteredTasks.length
      const completedTasks = filteredTasks.filter(task => task.completed).length
      const pendingTasks = totalTasks - completedTasks

      // Calculate daily progress data
      const progressData = {}
      
      // Generate data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(now.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        progressData[dateStr] = { total: 0, completed: 0 }
      }

      // Fill in the task data
      filteredTasks.forEach(task => {
        const date = new Date(task.dueDate).toISOString().split('T')[0]
        if (progressData[date]) {
          progressData[date].total++
          if (task.completed) {
            progressData[date].completed++
          }
        }
      })

      // Format progress data for chart
      const formattedProgress = Object.entries(progressData)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, data]) => {
          const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0
          return {
            label: new Date(date).toLocaleDateString('en-US', { 
              month: 'short',
              day: 'numeric'
            }),
            value: Math.round(completionRate),
            height: Math.round(completionRate),
            total: data.total,
            completed: data.completed
          }
        })

      // Fetch events count
      const eventsResponse = await axios.get('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const totalEvents = eventsResponse.data.status === 'success' ? eventsResponse.data.data.length : 0

      // Calculate current month events statistics
      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const monthEvents = eventsResponse.data.status === 'success' ? 
        eventsResponse.data.data.filter(event => {
          const eventDate = new Date(event.date)
          return eventDate >= firstDayOfMonth && eventDate <= lastDayOfMonth
        }) : []

      const pastMonthEvents = monthEvents.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate < currentDate
      })

      // Update analytics data
      analyticsData.value = {
        stats: {
          totalTasks,
          completedTasks,
          pendingTasks,
          productivityScore: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          totalEvents,
          monthTotalEvents: monthEvents.length,
          monthPastEvents: pastMonthEvents.length
        },
        progressData: formattedProgress.slice(-7), // Last 7 days
        recentActivity: filteredTasks
          .filter(task => task.completed || task.status === 'in-progress')
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 10)
          .map(task => ({
            id: task.id,
            type: task.completed ? 'task_completed' : 'task_updated',
            description: `${task.completed ? 'Completed' : 'Updated'} task: ${task.title}`,
            time: task.updatedAt
          }))
      }
    } else {
      toast.error('Failed to fetch analytics data')
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    toast.error('Error loading analytics data')
  }
}

const generateReport = async () => {
  try {
    // TODO: Implement report generation
    toast.info('Report generation will be implemented soon')
  } catch (error) {
    console.error('Error generating report:', error)
    toast.error('Failed to generate report')
  }
}

const getActivityIcon = (type) => {
  const icons = {
    'task_created': '➕',
    'task_completed': '✅',
    'task_updated': '✏️',
    'task_deleted': '🗑️',
    'note_created': '📝',
    'note_updated': '✏️',
    'note_deleted': '🗑️',
    'event_created': '📅',
    'event_updated': '✏️',
    'event_deleted': '🗑️'
  }
  return icons[type] || '❓'
}

const formatTime = (timestamp) => {
  return ''
}

onMounted(() => {
  fetchAnalyticsData()
})
</script>

<style scoped>
.analytics-container {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  color: var(--text);
  font-size: 2rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.time-range-select {
  padding: 0.75rem;
  border: 1px solid var(--primary);
  border-radius: 8px;
  background-color: var(--primary);
  color: var(--text);
  font-size: 1rem;
  cursor: pointer;
}

.generate-report-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary);
  color: var(--text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.generate-report-btn:hover {
  opacity: 0.9;
}

.analytics-grid {
  display: grid;
  gap: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: var(--primary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
}

.icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.stat-info h3 {
  color: var(--text);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  color: var(--text);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.trend.up {
  color: #4CAF50;
}

.trend.down {
  color: #F44336;
}

.chart-container {
  background-color: var(--primary);
  border-radius: 12px;
  padding: 1.5rem;
}

.chart-container h2 {
  color: var(--text);
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.progress-chart {
  height: 300px;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding: 1rem 0;
}

.chart-bar {
  flex: 1;
  background-color: var(--secondary);
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: height 0.3s ease;
  min-height: 30px;
}

.bar-label {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--text);
  font-size: 0.875rem;
}

.bar-value {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--text);
  font-size: 0.875rem;
}

.activity-container {
  background-color: var(--primary);
  border-radius: 12px;
  padding: 1.5rem;
}

.activity-container h2 {
  color: var(--text);
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--background);
  border-radius: 8px;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  color: var(--text);
  margin-bottom: 0.25rem;
}

.activity-time {
  color: var(--text);
  opacity: 0.7;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .analytics-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
  }

  .time-range-select,
  .generate-report-btn {
    flex: 1;
  }

  .progress-chart {
    height: 200px;
  }
}
</style>