<template>
  <div class="analytics-container">
    <header class="page-header">
      <h1>Analytics</h1>
      <div class="header-actions">
        <select v-model="timeRange" class="time-range-select">
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
          <span class="icon"></span>
          <h3>Total Tasks</h3>
          <div class="stat-value">{{ stats.totalTasks }}</div>
        </div>

        <div class="stat-card">
          <span class="icon">✅</span>
          <h3>Completed Tasks</h3>
          <div class="stat-value">
            {{ stats.completedTasks }}
            <span class="trend up">⬆️</span>
          </div>
        </div>

        <div class="stat-card">
          <span class="icon">⏰</span>
          <h3>Pending Tasks</h3>
          <div class="stat-value">
            {{ stats.pendingTasks }}
            <span class="trend down">⬇️</span>
          </div>
        </div>

        <div class="stat-card">
          <span class="icon">📈</span>
          <h3>Productivity Score</h3>
          <div class="stat-value">
            {{ stats.productivityScore }}%
            <span class="trend up">⬆️</span>
          </div>
        </div>
      </div>

      <!-- Progress Chart -->
      <div class="chart-container">
        <h2>Task Completion Progress</h2>
        <div class="progress-chart">
          <div 
            v-for="(bar, index) in progressData" 
            :key="index"
            class="chart-bar"
            :style="{ height: bar.height + '%' }"
          >
            <span class="bar-label">{{ bar.label }}</span>
            <span class="bar-value">{{ bar.value }}%</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-container">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <span class="icon">{{ getActivityIcon(activity.type) }}</span>
            <div class="activity-content">
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const timeRange = ref('week')

// Mock data
const stats = ref({
  totalTasks: 32,
  completedTasks: 24,
  pendingTasks: 8,
  productivityScore: 85
})

const progressData = ref([
  { label: 'Mon', value: 65, height: 65 },
  { label: 'Tue', value: 80, height: 80 },
  { label: 'Wed', value: 45, height: 45 },
  { label: 'Thu', value: 90, height: 90 },
  { label: 'Fri', value: 75, height: 75 },
  { label: 'Sat', value: 50, height: 50 },
  { label: 'Sun', value: 70, height: 70 }
])

const recentActivity = ref([
  {
    id: 1,
    type: 'task_completed',
    description: 'Completed task: Project Planning',
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'task_created',
    description: 'Created new task: Review Documentation',
    time: '4 hours ago'
  },
  {
    id: 3,
    type: 'task_updated',
    description: 'Updated task: Team Meeting Notes',
    time: '6 hours ago'
  }
])

const generateReport = () => {
  console.log('Generating report for:', timeRange.value)
  // TODO: Implement report generation
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