<template>
  <div class="analytics-container">
    <header class="page-header">
      <h1>Analytics</h1>
      <div class="header-actions">
        <button 
          class="voice-assistant-btn" 
          :class="{ active: voiceAssistant }"
          @click="toggleVoiceAssistant"
        >
          🎤 Voice Assistant
        </button>
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

    <!-- Dialog confirmare Task -->
    <div v-if="showTaskConfirmation" class="modal-overlay">
      <div class="modal-content">
        <h2>Confirmare Task</h2>
        <div class="edit-form">
          <div class="form-group">
            <label>Titlu:</label>
            <input v-model="pendingTask.title" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label>Descriere:</label>
            <textarea v-model="pendingTask.description" class="form-input"></textarea>
          </div>
          <div class="form-group">
            <label>Categorie:</label>
            <select v-model="pendingTask.category" class="form-input">
              <option value="Work">Muncă</option>
              <option value="Personal">Personal</option>
              <option value="Shopping">Cumpărături</option>
              <option value="Health">Sănătate</option>
              <option value="Education">Educație</option>
              <option value="Other">Altele</option>
            </select>
          </div>
          <div class="form-group">
            <label>Prioritate:</label>
            <select v-model="pendingTask.priority" class="form-input">
              <option value="high">Mare</option>
              <option value="medium">Medie</option>
              <option value="low">Mică</option>
            </select>
          </div>
          <div class="form-group">
            <label>Data:</label>
            <input 
              v-model="taskDueDate" 
              type="date" 
              class="form-input"
              :min="new Date().toISOString().split('T')[0]"
            >
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-confirm" @click="confirmTask">Confirmă</button>
          <button class="btn-cancel" @click="cancelTask">Anulează</button>
        </div>
      </div>
    </div>

    <!-- Dialog confirmare Event -->
    <div v-if="showEventConfirmation" class="modal-overlay">
      <div class="modal-content">
        <h2>Confirmare Eveniment</h2>
        <div class="edit-form">
          <div class="form-group">
            <label>Titlu:</label>
            <input v-model="pendingEvent.title" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label>Descriere:</label>
            <textarea v-model="pendingEvent.description" class="form-input"></textarea>
          </div>
          <div class="form-group">
            <label>Categorie:</label>
            <select v-model="pendingEvent.category" class="form-input">
              <option value="Meeting">Întâlnire</option>
              <option value="Event">Eveniment</option>
              <option value="Reminder">Reminder</option>
              <option value="Birthday">Zi de naștere</option>
              <option value="Holiday">Sărbătoare</option>
            </select>
          </div>
          <div class="form-group">
            <label>Data și ora început:</label>
            <input 
              v-model="eventStartDateTime" 
              type="datetime-local" 
              class="form-input"
              :min="new Date().toISOString().slice(0, 16)"
            >
          </div>
          <div class="form-group">
            <label>Data și ora sfârșit:</label>
            <input 
              v-model="eventEndDateTime" 
              type="datetime-local" 
              class="form-input"
              :min="eventStartDateTime"
            >
          </div>
          <div class="form-group">
            <label>Recurență:</label>
            <select v-model="pendingEvent.recurrence" class="form-input">
              <option value="No recurrence">Fără recurență</option>
              <option value="Daily">Zilnic</option>
              <option value="Weekly">Săptămânal</option>
              <option value="Yearly">Anual</option>
            </select>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="pendingEvent.notifications.email"
              >
              Notificări pe email
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-confirm" @click="confirmEvent">Confirmă</button>
          <button class="btn-cancel" @click="cancelEvent">Anulează</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { getAuth } from 'firebase/auth'
import CustomAlert from '@/components/CustomAlert.vue'

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

const voiceAssistant = ref(false)
const recognition = ref(null)

// Adaugă state pentru confirmări
const showTaskConfirmation = ref(false)
const showEventConfirmation = ref(false)
const pendingTask = ref({
  title: '',
  description: '',
  category: 'Personal',
  priority: 'medium',
  dueDate: new Date()
})
const pendingEvent = ref({
  title: '',
  description: '',
  startDate: new Date(),
  endDate: new Date(new Date().getTime() + 3600000), // +1 oră
  category: 'Meeting',
  recurrence: 'No recurrence',
  notifications: { email: false }
})

const formatTaskData = computed(() => {
  const taskData = {
    title: pendingTask.value.title,
    description: pendingTask.value.description,
    category: pendingTask.value.category,
    priority: pendingTask.value.priority,
    dueDate: pendingTask.value.dueDate?.toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return JSON.stringify(taskData, null, 2);
});

const formatEventData = computed(() => {
  const eventData = {
    title: pendingEvent.value.title,
    description: pendingEvent.value.description,
    startDate: pendingEvent.value.startDate?.toISOString(),
    endDate: pendingEvent.value.endDate?.toISOString(),
    category: pendingEvent.value.category,
    recurrence: pendingEvent.value.recurrence,
    notifications: pendingEvent.value.notifications,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return JSON.stringify(eventData, null, 2);
});

const taskDueDate = computed({
  get: () => {
    if (!pendingTask.value.dueDate) return new Date().toISOString().split('T')[0];
    
    // Ajustăm data pentru afișare
    const date = new Date(pendingTask.value.dueDate);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() + (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  },
  set: (value) => {
    // Când setăm o nouă dată, o creăm în UTC
    const date = new Date(value);
    pendingTask.value.dueDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ));
  }
});

const eventStartDateTime = computed({
  get: () => {
    if (!pendingEvent.value.startDate) return new Date().toISOString().slice(0, 16);
    return new Date(pendingEvent.value.startDate).toISOString().slice(0, 16);
  },
  set: (value) => {
    const date = new Date(value);
    pendingEvent.value.startDate = date;
    
    // Actualizează automat data de sfârșit dacă e necesară
    if (pendingEvent.value.endDate < date) {
      pendingEvent.value.endDate = new Date(date.getTime() + 3600000); // +1 oră
    }
  }
});

const eventEndDateTime = computed({
  get: () => {
    if (!pendingEvent.value.endDate) {
      const defaultEnd = new Date();
      defaultEnd.setHours(defaultEnd.getHours() + 1);
      return defaultEnd.toISOString().slice(0, 16);
    }
    return new Date(pendingEvent.value.endDate).toISOString().slice(0, 16);
  },
  set: (value) => {
    pendingEvent.value.endDate = new Date(value);
  }
});

const initializeSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window)) {
    return;
  }

  recognition.value = new webkitSpeechRecognition();
  recognition.value.continuous = true;
  recognition.value.interimResults = false;
  recognition.value.lang = 'ro-RO';

  recognition.value.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    processVoiceCommand(transcript);
  };

  recognition.value.onend = () => {
    if (voiceAssistant.value) {
      recognition.value.start();
    }
  };

  recognition.value.onerror = (event) => {
    console.error('Eroare recunoaștere vocală:', event.error);
  };
}

const startVoiceRecognition = () => {
  if (recognition.value) {
    recognition.value.start();
  }
}

const stopVoiceRecognition = () => {
  if (recognition.value) {
    recognition.value.stop();
  }
}

const toggleVoiceAssistant = async () => {
  if (!voiceAssistant.value) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      voiceAssistant.value = true;
      initializeSpeechRecognition();
      startVoiceRecognition();
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      toast.error('Microphone access denied');
    }
  } else {
    voiceAssistant.value = false;
    stopVoiceRecognition();
  }
}

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

const processVoiceCommand = (transcript) => {
  const lowerTranscript = transcript.toLowerCase();

  // Detectăm tipul comenzii (task sau event)
  if (lowerTranscript.includes('task') || lowerTranscript.includes('sarcină')) {
    processTaskCommand(transcript);
  } else if (lowerTranscript.includes('event') || lowerTranscript.includes('eveniment') || 
             lowerTranscript.includes('întâlnire')) {
    processEventCommand(transcript);
  } else {
    toast.warning('Comandă nerecunoscută. Specificați dacă doriți să creați un task sau un eveniment.');
  }
}

const processTaskCommand = (transcript) => {
  try {
    // Creăm un obiect nou pentru task
    const newTask = {
      title: '',
      description: '',
      category: 'Personal',
      priority: 'medium',
      dueDate: new Date()
    };

    // Extrage titlul
    const titleRegex = /(?:adaugă|crează)\s+(?:task|sarcină|task-ul|sarcina)\s+(.*?)(?:\s+(?:descriere|descrierea|data|dată|pe|prioritate|categorie)|$)/i;
    const titleMatch = transcript.match(titleRegex);
    if (titleMatch && titleMatch[1]) {
      newTask.title = titleMatch[1].trim();
    }

    // Extrage descrierea
    const descRegex = /(?:descriere|descrierea)\s+(.*?)(?:\s+(?:data|dată|pe|prioritate|categorie)|$)/i;
    const descMatch = transcript.match(descRegex);
    if (descMatch && descMatch[1]) {
      newTask.description = descMatch[1].trim();
    }

    // Extrage data
    const dateRegex = /(?:pe|data|dată)\s+(\d{1,2})\s+(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)(?:\s+(\d{4}))?/i;
    const dateMatch = transcript.match(dateRegex);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]) + 1;
      const monthMap = {
        'ianuarie': 0, 'februarie': 1, 'martie': 2, 'aprilie': 3,
        'mai': 4, 'iunie': 5, 'iulie': 6, 'august': 7,
        'septembrie': 8, 'octombrie': 9, 'noiembrie': 10, 'decembrie': 11
      };
      const month = monthMap[dateMatch[2].toLowerCase()];
      const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
      
      // Creăm data folosind UTC pentru a evita problemele cu fusul orar
      const date = new Date(Date.UTC(year, month, day));
      // Ajustăm pentru fusul orar local
      const offset = date.getTimezoneOffset();
      date.setMinutes(date.getMinutes() + offset);
      
      newTask.dueDate = date;
      newTask.dueDate.setHours(0, 0, 0, 0);
    }

    // Extrage categoria și prioritatea (cod existent)
    if (transcript.includes('personal')) {
      newTask.category = 'Personal';
    } else if (transcript.includes('muncă')) {
      newTask.category = 'Work';
    } else if (transcript.includes('cumpărături')) {
      newTask.category = 'Shopping';
    } else if (transcript.includes('sănătate')) {
      newTask.category = 'Health';
    } else if (transcript.includes('educație')) {
      newTask.category = 'Education';
    }

    if (transcript.includes('prioritate mare')) {
      newTask.priority = 'high';
    } else if (transcript.includes('prioritate medie')) {
      newTask.priority = 'medium';
    } else if (transcript.includes('prioritate mică')) {
      newTask.priority = 'low';
    }

    

    // Actualizăm pendingTask direct cu valorile noi
    pendingTask.value = {
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      dueDate: newTask.dueDate
    };

    // Forțăm actualizarea UI-ului
    nextTick(() => {
      showTaskConfirmation.value = true;
    });
    
    stopVoiceRecognition();
    voiceAssistant.value = false;
    localStorage.setItem('voiceAssistant', 'false');

  } catch (error) {
    console.error('Eroare la procesarea task-ului:', error);
    toast.error('Eroare la crearea task-ului. Încercați din nou.');
  }
}

const processEventCommand = (transcript) => {
  try {
    const newEvent = {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      category: 'Meeting',
      recurrence: 'No recurrence',
      notifications: { email: false }
    };

    // Extrage titlul
    const titleRegex = /(?:adaugă|crează)\s+eveniment\s+(.*?)(?:\s+(?:descriere|descrierea|data|dată|pe|categorie))/i;
    const titleMatch = transcript.match(titleRegex);
    if (titleMatch && titleMatch[1]) {
      newEvent.title = titleMatch[1].trim();
    }

    // Extrage descrierea
    const descRegex = /(?:descriere|descrierea)\s+(.*?)(?:\s+(?:data|dată|pe|categorie|recurență|notificare)|$)/i;
    const descMatch = transcript.match(descRegex);
    if (descMatch && descMatch[1]) {
      newEvent.description = descMatch[1].trim();
    }

    // Extrage data și ora - regex modificat pentru a fi mai flexibil
    const dateTimeRegex = /(?:pe|data|dată)\s+(\d{1,2})\s+(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)(?:\s+(\d{4}))?\s+(?:la\s+)?(?:ora\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
    const dateTimeMatch = transcript.match(dateTimeRegex);
    if (dateTimeMatch) {
      const day = parseInt(dateTimeMatch[1]);
      const monthMap = {
        'ianuarie': 0, 'februarie': 1, 'martie': 2, 'aprilie': 3,
        'mai': 4, 'iunie': 5, 'iulie': 6, 'august': 7,
        'septembrie': 8, 'octombrie': 9, 'noiembrie': 10, 'decembrie': 11
      };
      const month = monthMap[dateTimeMatch[2].toLowerCase()];
      const year = dateTimeMatch[3] ? parseInt(dateTimeMatch[3]) : new Date().getFullYear();
      let hours = parseInt(dateTimeMatch[4]);
      const minutes = dateTimeMatch[5] ? parseInt(dateTimeMatch[5]) : 0;
      const ampm = dateTimeMatch[6]?.toLowerCase();

      // Ajustare pentru AM/PM
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;

      // Creăm data folosind UTC pentru a evita probleme cu fusul orar
      const startDate = new Date(Date.UTC(year, month, day));
      startDate.setUTCHours(hours, minutes); // Setăm ora în UTC

      // Data de sfârșit la o oră după start
      const endDate = new Date(startDate.getTime());
      endDate.setUTCHours(hours + 1, minutes);

      newEvent.startDate = startDate;
      newEvent.endDate = endDate;
    }

    // Extrage categoria
    if (transcript.includes('întâlnire') || transcript.includes('meeting')) {
      newEvent.category = 'Meeting';
    } else if (transcript.includes('zi de naștere')) {
      newEvent.category = 'Birthday';
    } else if (transcript.includes('reminder')) {
      newEvent.category = 'Reminder';
    } else if (transcript.includes('sărbătoare')) {
      newEvent.category = 'Holiday';
    }

    // Extrage recurența
    if (transcript.includes('zilnic')) {
      newEvent.recurrence = 'Daily';
    } else if (transcript.includes('săptămânal')) {
      newEvent.recurrence = 'Weekly';
    } else if (transcript.includes('anual')) {
      newEvent.recurrence = 'Yearly';
    }

    // Verifică notificările
    if (transcript.includes('notificare') || transcript.includes('email')) {
      newEvent.notifications.email = true;
    }

    

    // Actualizăm pendingEvent direct cu valorile noi
    pendingEvent.value = {
      title: newEvent.title,
      description: newEvent.description,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      category: newEvent.category,
      recurrence: newEvent.recurrence,
      notifications: { ...newEvent.notifications }
    };

    // Forțăm actualizarea UI-ului
    nextTick(() => {
      showEventConfirmation.value = true;
    });
    
    stopVoiceRecognition();
    voiceAssistant.value = false;
    localStorage.setItem('voiceAssistant', 'false');

  } catch (error) {
    console.error('Eroare la procesarea evenimentului:', error);
    toast.error('Eroare la crearea evenimentului. Încercați din nou.');
  }
}

// Adaugă funcții pentru gestionarea confirmărilor
const confirmTask = async () => {
  await createTask(pendingTask.value);
  showTaskConfirmation.value = false;
  pendingTask.value = {
    title: '',
    description: '',
    category: 'Personal',
    priority: 'medium',
    dueDate: new Date()
  };
}

const cancelTask = () => {
  showTaskConfirmation.value = false;
  pendingTask.value = {
    title: '',
    description: '',
    category: 'Personal',
    priority: 'medium',
    dueDate: new Date()
  };
  toast.info('Crearea task-ului a fost anulată');
}

const confirmEvent = async () => {
  await createEvent(pendingEvent.value);
  showEventConfirmation.value = false;
  pendingEvent.value = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 3600000), // +1 oră
    category: 'Meeting',
    recurrence: 'No recurrence',
    notifications: { email: false }
  };
}

const cancelEvent = () => {
  showEventConfirmation.value = false;
  pendingEvent.value = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 3600000), // +1 oră
    category: 'Meeting',
    recurrence: 'No recurrence',
    notifications: { email: false }
  };
  toast.info('Crearea evenimentului a fost anulată');
}

// Adaugă funcție helper pentru formatarea datei
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Adăugăm funcțiile pentru crearea task-urilor și evenimentelor
const createTask = async (taskData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      toast.error('Trebuie să fiți autentificat pentru a crea task-uri');
      return;
    }

    const token = await user.getIdToken();
    await axios.post('/api/tasks', taskData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    toast.success('Task creat cu succes!');
    fetchAnalyticsData(); // Reîmprospătăm datele
  } catch (error) {
    console.error('Eroare la crearea task-ului:', error);
    toast.error('Eroare la salvarea task-ului');
  }
}

const createEvent = async (eventData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      toast.error('Trebuie să fiți autentificat pentru a crea evenimente');
      return;
    }

    const token = await user.getIdToken();
    await axios.post('/api/events', eventData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    toast.success('Eveniment creat cu succes!');
    fetchAnalyticsData(); // Reîmprospătăm datele
  } catch (error) {
    console.error('Eroare la crearea evenimentului:', error);
    toast.error('Eroare la salvarea evenimentului');
  }
}

onMounted(() => {
  fetchAnalyticsData()
  const savedVoiceAssistant = localStorage.getItem('voiceAssistant') === 'true'
  if (savedVoiceAssistant) {
    toggleVoiceAssistant()
  }
})

onUnmounted(() => {
  stopVoiceRecognition();
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

.voice-assistant-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary);
  color: var(--text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.voice-assistant-btn.active {
  background-color: var(--secondary);
}

.voice-assistant-btn:hover {
  opacity: 0.9;
}

.confirmation-content {
  padding: 1rem;
  background: var(--background);
  border-radius: 8px;
}

.json-preview {
  background: var(--background);
  padding: 1rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  border: 1px solid var(--secondary);
}

.json-preview pre {
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.confirmation-content h3 {
  color: var(--text);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text);
  font-weight: 500;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid var(--secondary);
  border-radius: 8px;
  background: var(--background);
  color: var(--text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:hover, 
.form-input:focus {
  border-color: var(--primary);
  outline: none;
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--background);
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: var(--text);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-confirm {
  background: var(--primary);
  color: var(--text);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: var(--secondary);
  color: var(--text);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-confirm:hover,
.btn-cancel:hover {
  opacity: 0.9;
}
</style>