<template>
  <div class="analytics-container">
    <header class="page-header">
      <h1>Analytics</h1>
      <div class="header-actions">
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
          <h3>Current Month Events</h3>
          <div class="stat-value">
            {{ analyticsData.stats.monthTotalEvents }}
            <span class="trend up" v-if="analyticsData.stats.monthTotalEvents > 0">⬆️</span>
          </div>
        </div>

        <div class="stat-card">
          <span class="icon">✅</span>
          <h3>Past Events</h3>
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
          <div v-for="(bar, index) in analyticsData.progressData" :key="index" class="chart-bar-wrapper">
            <div class="chart-bar" :style="{ height: bar.height + '%' }">
              <span class="bar-value">{{ bar.value }}%</span>
            </div>
            <span class="bar-label">{{ bar.label }}</span>
            <div class="bar-details">
              <small>{{ bar.details }}</small>
            </div>
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

    // Fetch events data
    const eventsResponse = await axios.get('/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (tasksResponse.data.status === 'success') {
      const tasks = tasksResponse.data.data
      const events = eventsResponse.data.status === 'success' ? eventsResponse.data.data : []
      const now = new Date()
      let startDate

      // Calculate start date based on selected time range
      if (timeRange.value === 'week') {
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange.value === 'month') {
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
      } else {
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
      }
      startDate.setHours(0, 0, 0, 0)  // Set to start of day

      // Filter tasks by date range
      // Check if 'tasks' is a valid array
      if (!Array.isArray(tasks)) {
        console.error("Tasks are not in a valid array format");
        return;
      }

      // Filter the tasks based on the 'createdAt' date
      const filteredTasks = tasks.filter(task => {
        // Check if 'createdAt' exists and is a valid string
        if (!task.createdAt || typeof task.createdAt !== 'string') {
          console.error("Invalid createdAt format:", task.createdAt);
          return false;
        }

        // Convert 'createdAt' to a Date object
        const taskDate = new Date(task.createdAt);

        // Check if the date is valid
        if (isNaN(taskDate)) {
          console.error("Invalid date format:", task.createdAt);
          return false;
        }

        // Filter tasks with 'createdAt' greater than or equal to a specific date
        return taskDate >= new Date("2025-01-01");
      });

      // Calculate task statistics
      const totalTasks = filteredTasks.length
      const completedTasks = filteredTasks.filter(task => task.completed).length
      const pendingTasks = totalTasks - completedTasks

      // Calculate events statistics for current month
      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      lastDayOfMonth.setHours(23, 59, 59, 999)  // Set to end of the day

      // Filter events for current month
      const currentMonthEvents = events.filter(event => {
        const eventStartDate = new Date(event.startDate)
        const eventEndDate = new Date(event.endDate)

        // Event is in current month if:
        // 1. Start date is in current month OR
        // 2. End date is in current month OR
        // 3. Event spans over current month (starts before and ends after)
        return (
          (eventStartDate >= firstDayOfMonth && eventStartDate <= lastDayOfMonth) ||
          (eventEndDate >= firstDayOfMonth && eventEndDate <= lastDayOfMonth) ||
          (eventStartDate <= firstDayOfMonth && eventEndDate >= lastDayOfMonth)
        )
      })

      // Calculate past events (events that have already occurred)
      const pastEvents = currentMonthEvents.filter(event => {
        const eventEndDate = new Date(event.endDate)
        return eventEndDate < currentDate
      })

      // Calculate progress data
      const progressData = {}

      // Generate data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(now.getDate() - i)
        date.setHours(0, 0, 0, 0) // Reset time to start of day
        // Use local date string to avoid timezone issues
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        progressData[dateStr] = {
          tasks: { total: 0, completed: 0 },
          events: { total: 0, completed: 0 }
        }
      }

      // Fill in the task data
      filteredTasks.forEach(task => {
        const dueDate = new Date(task.dueDate)
        // Use local date string to avoid timezone issues
        const dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`

        // Only count tasks that are due in our 7-day window
        if (progressData.hasOwnProperty(dueDateStr)) {
          progressData[dueDateStr].tasks.total++
          if (task.completed) {
            progressData[dueDateStr].tasks.completed++
          }
        }
      })

      // Fill in the events data
      events.forEach(event => {
        const eventDate = new Date(event.endDate)
        // Use local date string to avoid timezone issues
        const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`

        // Only count events that end in our 7-day window
        if (progressData.hasOwnProperty(eventDateStr)) {
          progressData[eventDateStr].events.total++
          // Consider an event completed if it has ended
          if (eventDate <= now) {
            progressData[eventDateStr].events.completed++
          }
        }
      })

      // Format progress data for chart
      const formattedProgress = Object.entries(progressData)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, data]) => {
          const totalItems = data.tasks.total + data.events.total
          const completedItems = data.tasks.completed + data.events.completed
          const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
          return {
            label: new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }),
            value: Math.round(completionRate),
            height: Math.max(Math.round(completionRate), 5), // Minimum 5% height for visibility
            total: totalItems,
            completed: completedItems,
            details: `Tasks: ${data.tasks.completed}/${data.tasks.total}, Events: ${data.events.completed}/${data.events.total}`
          }
        })

      // Update analytics data with all statistics
      analyticsData.value = {
        stats: {
          totalTasks,
          completedTasks,
          pendingTasks,
          productivityScore: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          monthTotalEvents: currentMonthEvents.length,
          monthPastEvents: pastEvents.length
        },
        progressData: formattedProgress,
        recentActivity: [
          ...filteredTasks
            .filter(task => task.completed || task.status === 'in-progress')
            .map(task => ({
              id: task.id,
              type: task.completed ? 'task_completed' : 'task_updated',
              description: `${task.completed ? 'Completed' : 'Updated'} task: ${task.title}`,
              time: new Date(task.updatedAt).toISOString()
            })),
          ...currentMonthEvents.map(event => ({
            id: event.id,
            type: 'event',
            description: `${event.title}${event.description ? ` - ${event.description}` : ''}`,
            time: new Date(event.startDate).toISOString(),
            category: event.category
          }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10)
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
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      toast.error('Please login to generate report')
      return
    }

    const token = await user.getIdToken()

    // Get the current date for the filename and report
    const date = new Date()
    const dateStr = date.toLocaleDateString('en-En', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')

    // Format recent activity data with better date formatting
    const formattedActivity = analyticsData.value.recentActivity.map(activity => {
      // Extract title and location from description, removing timestamp
      const description = activity.description.replace(/\s*-\s*\d{4}-\d{2}-\d{2}T.*$/, '')
      const parts = description.split(' - ')
      const title = parts[0]
      const location = parts.length > 1 ? parts[1] : ''

      // Format date and time using formatTime function
      const formattedDate = formatTime(activity.time)

      // Build new formatted description
      let formattedDescription = title
      if (location) {
        formattedDescription += `\n${location}`
      }
      formattedDescription += `\n${formattedDate}`

      return {
        ...activity,
        description: formattedDescription
      }
    })

    // Create report data
    const reportData = {
      generatedAt: formatTime(date),
      stats: analyticsData.value.stats,
      progressData: analyticsData.value.progressData,
      recentActivity: formattedActivity
    }

    // Send request to generate report
    const response = await axios.post('/api/reports/generate',
      { reportData },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    )

    // Create a download link for the report
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `analytics-report-${dateStr}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Report generated successfully')
  } catch (error) {
    console.error('Error generating report:', error)
    toast.error('Error generating report')
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
    'event': '📅',
    'event_created': '📅',
    'event_updated': '✏️',
    'event_deleted': '🗑️'
  }
  return icons[type] || '❓'
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'long' })
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedHours = hours % 12 || 12

  return `${day} ${month} ${year} at ${formattedHours}:${minutes} ${ampm}`
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
  margin-bottom: 2rem;
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
  padding: 2rem 0;
  position: relative;
}

.chart-bar-wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.chart-bar {
  width: 100%;
  background-color: var(--secondary);
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: height 0.3s ease;
  min-height: 2px;
}

.bar-label {
  margin-top: 8px;
  color: var(--text);
  font-size: 0.875rem;
  text-align: center;
}

.bar-value {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--text);
  font-size: 0.875rem;
  white-space: nowrap;
}

.bar-details {
  margin-top: 4px;
  color: var(--text);
  opacity: 0.7;
  font-size: 0.75rem;
  text-align: center;
}

/* Add hover effect */
.chart-bar:hover {
  opacity: 0.8;
  cursor: pointer;
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
  font-style: italic;
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