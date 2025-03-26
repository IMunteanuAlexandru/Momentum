<template>
  <div class="calendar-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="loading-spinner">⌛</span>
      <p>Loading calendar...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="retryLoading" class="btn-retry">
        <span class="icon">🔄</span>
        Try again
      </button>
    </div>

    <!-- Calendar Content -->
    <div v-else>
      <div class="calendar-controls">
        <div class="view-controls">
          <button 
            v-for="view in views" 
            :key="view.value"
            @click="currentView = view.value"
            :class="{ active: currentView === view.value }"
            class="view-btn"
          >
            {{ view.label }}
          </button>
        </div>
        <div class="navigation-controls">
          <button @click="navigateCalendar('prev')" class="nav-btn">
            ←
          </button>
          <h2>{{ currentMonthYear }}</h2>
          <button @click="navigateCalendar('next')" class="nav-btn">
            →
          </button>
        </div>
        <button @click="showAddEvent = true" class="btn-add">
          <span class="icon">➕</span>
          Add event
        </button>
      </div>
      
      <!-- Calendar Grid -->
      <div class="calendar-view" :class="currentView">
        <!-- Month View -->
        <div v-if="currentView === 'month'" class="month-view">
          <div class="calendar-grid">
            <div
              v-for="day in daysInMonth"
              :key="day.date"
              class="calendar-day"
              :class="{
                'today': day.isToday,
                'different-month': !day.isCurrentMonth
              }"
              @click="selectDate(day)"
            >
              <div class="day-number">
                {{ day.dayNumber }}
              </div>
              <div class="event-pill" 
                   v-for="event in day.events.slice(0, 3)" 
                   :key="event.id" 
                   :class="event.category" 
                   @click.stop="showEventCard(event)">
                {{ event.title }}
              </div>
              <div v-if="day.events.length > 3" class="more-events" @click.stop="showAllEvents(day)">
                +{{ day.events.length - 3 }} more
              </div>
            </div>
          </div>
        </div>
        
        <!-- Week View -->
        <div v-else-if="currentView === 'week'" class="week-view">
          <div class="time-grid">
            <div class="time-slots">
              <div v-for="hour in 24" :key="hour" class="time-slot">
                {{ formatHour(hour - 1) }}
              </div>
            </div>
            <div class="week-days">
              <div
                v-for="day in currentWeek"
                :key="day.date"
                class="week-day"
              >
                <div class="day-header">
                  <div class="day-name">{{ formatWeekDay(day.date) }}</div>
                  <div class="day-number">{{ formatDayNumber(day.date) }}</div>
                </div>
                <div class="day-events">
                  <div
                    v-for="event in day.events"
                    :key="event.id"
                    class="event-block"
                    :class="event.category"
                    :style="getEventStyle(event)"
                    @click="showEventCard(event)"
                  >
                    {{ event.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Day View -->
        <div v-else class="day-view">
          <div class="day-header">
            <h3>{{ formatSelectedDate }}</h3>
          </div>
          <div class="time-grid">
            <div class="time-slots">
              <div v-for="hour in 24" :key="hour" class="time-slot">
                {{ formatHour(hour - 1) }}
              </div>
            </div>
            <div class="events-column">
              <div
                v-for="event in currentDayEvents"
                :key="event.id"
                class="event-block day-event"
                :class="event.category"
                :style="getEventStyle(event)"
                @click="showEventCard(event)"
              >
                <div class="event-title">{{ event.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Event Modal -->
      <div v-if="showAddEvent || editingEvent" class="modal">
        <div class="modal-content">
          <h2>{{ editingEvent ? 'Edit event' : 'Add new event' }}</h2>
          <form @submit.prevent="saveEvent">
            <div class="form-group">
              <label>Title</label>
              <input v-model="eventForm.title" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="eventForm.description"></textarea>
            </div>
            <div class="form-group">
              <label>Start date</label>
              <input type="datetime-local" v-model="eventForm.startDate" required>
            </div>
            <div class="form-group">
              <label>End date</label>
              <input type="datetime-local" v-model="eventForm.endDate" required>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select v-model="eventForm.category" required>
                <option value="meeting">Meeting</option>
                <option value="event">Event</option>
                <option value="reminder">Reminder</option>
                <option value="birthday">Birthday</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
            <div class="form-group">
              <label>Recurrence</label>
              <select v-model="eventForm.recurrence">
                <option value="">No recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div class="form-group">
              <label>Notifications</label>
              <div class="notification-options">
                <label>
                  <input 
                    type="checkbox" 
                    v-model="eventForm.notifications.email"
                  > Email
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    v-model="eventForm.notifications.push"
                  > Push
                </label>
              </div>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn-save">
                {{ editingEvent ? 'Save' : 'Add' }}
              </button>
              <button 
                v-if="editingEvent" 
                type="button" 
                @click="deleteEvent" 
                class="btn-delete"
              >
                Delete
              </button>
              <button type="button" @click="closeEventModal" class="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Event Details Modal -->
      <div v-if="showEventDetails" class="event-details-modal" @click.self="closeEventDetails">
        <div class="event-details-card">
          <div class="event-header" :class="selectedEvent.category">
            <h2>{{ selectedEvent.title }}</h2>
            <button class="close-btn" @click="closeEventDetails">×</button>
          </div>
          
          <div class="event-body">
            <div class="detail-row">
              <span class="icon">🕒</span>
              <div class="detail-content">
                <div>{{ formatDetailDate(selectedEvent.startDate) }}</div>
                <div>{{ formatDetailDate(selectedEvent.endDate) }}</div>
              </div>
            </div>

            <div class="detail-row" v-if="selectedEvent.description">
              <span class="icon">📝</span>
              <div class="detail-content">{{ selectedEvent.description }}</div>
            </div>

            <div class="detail-row">
              <span class="icon">🏷️</span>
              <div class="detail-content">{{ capitalizeFirst(selectedEvent.category) }}</div>
            </div>

            <div class="detail-row" v-if="selectedEvent.recurrence">
              <span class="icon">🔄</span>
              <div class="detail-content">Repeats {{ selectedEvent.recurrence }}</div>
            </div>

            <div class="detail-row" v-if="hasNotifications">
              <span class="icon">🔔</span>
              <div class="detail-content">
                Notifications: 
                <span v-if="selectedEvent.notifications.email">Email</span>
                <span v-if="selectedEvent.notifications.push">Push</span>
              </div>
            </div>
          </div>

          <div class="event-actions">
            <button class="btn-edit" @click="startEditing">
              <span class="icon">✏️</span> Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Calendar',
  setup() {
    const store = useStore()
    const currentView = ref('month')
    const currentDate = ref(new Date())
    const showAddEvent = ref(false)
    const editingEvent = ref(null)
    const isLoading = ref(true)
    const error = ref(null)
    const user = computed(() => store.getters['auth/currentUser'])
    
    const views = [
      { label: 'Month', value: 'month' },
      { label: 'Week', value: 'week' },
      { label: 'Day', value: 'day' }
    ]

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    const eventForm = ref({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      category: 'meeting',
      recurrence: '',
      notifications: {
        email: false,
        push: false
      }
    })

    // Computed properties for calendar data
    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleDateString('en-En', { 
        month: 'long', 
        year: 'numeric' 
      })
    })

    const daysInMonth = computed(() => {
      const date = currentDate.value
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const days = []
  
      // Add days from previous month
      const firstDayOfWeek = firstDay.getDay() || 7
      for (let i = 1; i < firstDayOfWeek; i++) {
        const prevDate = new Date(year, month, 1 - i)
        days.unshift({
          date: prevDate,
          dayNumber: prevDate.getDate(),
          isCurrentMonth: false,
          isToday: isSameDay(prevDate, new Date()),
          events: store.getters['calendar/eventsForDay'](prevDate)
        })
      }

      // Add days of current month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const currentDate = new Date(year, month, i)
        days.push({
          date: currentDate,
          dayNumber: i,
          isCurrentMonth: true,
          isToday: isSameDay(currentDate, new Date()),
          events: store.getters['calendar/eventsForDay'](currentDate)
        })
      }
  
      // Add days from next month
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(year, month + 1, i)
        days.push({
          date: nextDate,
          dayNumber: nextDate.getDate(),
          isCurrentMonth: false,
          isToday: isSameDay(nextDate, new Date()),
          events: store.getters['calendar/eventsForDay'](nextDate)
        })
      }

      return days
    })

    const currentWeek = computed(() => {
      const date = currentDate.value
      const week = []
      const first = date.getDate() - date.getDay() + 1
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(date.getFullYear(), date.getMonth(), first + i)
        week.push({
          date: day,
          events: store.getters['calendar/eventsForDay'](day)
        })
      }
      
      return week
    })

    const currentDayEvents = computed(() => {
      return store.getters['calendar/eventsForDay'](currentDate.value)
    })

    // Helper functions
    const isSameDay = (date1, date2) => {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    }

    const formatHour = (hour) => {
      return `${hour.toString().padStart(2, '0')}:00`
    }

    const formatWeekDay = (date) => {
      return date.toLocaleDateString('en-En', { weekday: 'short' })
    }

    const formatDayNumber = (date) => {
      return date.getDate()
    }

    const formatEventTime = (event) => {
      const start = new Date(event.startDate)
      return start.toLocaleTimeString('en-En', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    const getEventStyle = (event) => {
      const start = new Date(event.startDate)
      const end = new Date(event.endDate)
      
      // Calculate position and height
      const minutesInDay = 24 * 60
      const startMinutes = start.getHours() * 60 + start.getMinutes()
      const endMinutes = end.getHours() * 60 + end.getMinutes()
      const duration = endMinutes - startMinutes
      
      // Convert to pixels (30px per hour = 0.5px per minute)
      const top = startMinutes * 0.5
      const height = Math.max(duration * 0.5, 20) // Minimum height of 20px
      
      return {
        top: `${top}px`,
        height: `${height}px`,
        width: 'calc(100% - 4px)' // Account for left/right margin
      }
    }

    // Event handlers
    const navigateCalendar = (direction) => {
      const date = new Date(currentDate.value)
      
      if (currentView.value === 'month') {
        date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1))
      } else if (currentView.value === 'week') {
        date.setDate(date.getDate() + (direction === 'next' ? 7 : -7))
      } else {
        date.setDate(date.getDate() + (direction === 'next' ? 1 : -1))
      }
      
      currentDate.value = date
    }

    const selectDate = (day) => {
      currentDate.value = day.date
      if (currentView.value === 'month') {
        currentView.value = 'day'
      }
    }

    const showEventCard = (event) => {
      selectedEvent.value = event
      showEventDetails.value = true
    }

    const closeEventDetails = () => {
      showEventDetails.value = false
      selectedEvent.value = null
    }

    const startEditing = () => {
      editingEvent.value = selectedEvent.value
      eventForm.value = { 
        ...selectedEvent.value,
        startDate: selectedEvent.value.startDate.slice(0, 16), // Format for datetime-local input
        endDate: selectedEvent.value.endDate.slice(0, 16),
        notifications: {
          email: selectedEvent.value.notifications?.email || false,
          push: selectedEvent.value.notifications?.push || false
        }
      }
      showAddEvent.value = true
      closeEventDetails() // Close the details modal before showing edit modal
    }

    const formatDetailDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const capitalizeFirst = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const hasNotifications = computed(() => {
      if (!selectedEvent.value?.notifications) return false
      return selectedEvent.value.notifications.email || selectedEvent.value.notifications.push
    })

    const editEvent = (event) => {
      editingEvent.value = event
      eventForm.value = { ...event }
      showAddEvent.value = true
    }

    const saveEvent = async () => {
      if (!user.value) {
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'You need to be authenticated to save events'
        })
        return
      }

      try {
        if (editingEvent.value) {
          await store.dispatch('calendar/updateEvent', {
            id: editingEvent.value.id,
            ...eventForm.value,
            userId: user.value.uid
          })
          store.dispatch('notifications/add', {
            type: 'success',
            message: 'Event updated successfully'
          })
        } else {
          await store.dispatch('calendar/addEvent', {
            ...eventForm.value,
            id: Date.now(),
            userId: user.value.uid
          })
          store.dispatch('notifications/add', {
            type: 'success',
            message: 'Event added successfully'
          })
        }
        closeEventModal()
      } catch (error) {
        console.error('Error saving event:', error)
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error saving event'
        })
      }
    }

    const deleteEvent = async () => {
      if (confirm('Are you sure you want to delete this event?')) {
        try {
          await store.dispatch('calendar/deleteEvent', editingEvent.value.id)
          store.dispatch('notifications/add', {
            type: 'success',
            message: 'Event deleted successfully'
          })
          closeEventModal()
        } catch (error) {
          console.error('Error deleting event:', error)
          store.dispatch('notifications/add', {
            type: 'error',
            message: 'Error deleting event'
          })
        }
      }
    }

    const closeEventModal = () => {
      showAddEvent.value = false
      editingEvent.value = null
      eventForm.value = {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        category: 'meeting',
        recurrence: '',
        notifications: {
          email: false,
          push: false
        }
      }
    }

    const loadCalendarData = async () => {
      isLoading.value = true
      error.value = null
      
      try {
        // Wait for user authentication
        await store.dispatch('auth/checkAuth')
        
        // Fetch events from the server
        await store.dispatch('calendar/fetchEvents')
        
        isLoading.value = false
      } catch (err) {
        console.error('Error loading calendar data:', err)
        error.value = 'An error occurred while loading the calendar. Please try again.'
        isLoading.value = false
      }
    }

    const retryLoading = () => {
      loadCalendarData()
    }

    const showEventDetails = ref(false)
    const selectedEvent = ref(null)

    const formatSelectedDate = computed(() => {
      return currentDate.value.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    onMounted(() => {
      // Initialize with current date
      const now = new Date()
      eventForm.value.startDate = now.toISOString().slice(0, 16)
      eventForm.value.endDate = new Date(now.getTime() + 60 * 60 * 1000)
        .toISOString().slice(0, 16)
      
      loadCalendarData()
    })

    return {
      currentView,
      views,
      weekDays,
      currentMonthYear,
      daysInMonth,
      currentWeek,
      currentDayEvents,
      showAddEvent,
      editingEvent,
      eventForm,
      navigateCalendar,
      selectDate,
      editEvent,
      saveEvent,
      deleteEvent,
      closeEventModal,
      formatHour,
      formatWeekDay,
      formatDayNumber,
      formatEventTime,
      getEventStyle,
      isLoading,
      error,
      user,
      retryLoading,
      showEventDetails,
      selectedEvent,
      showEventCard,
      closeEventDetails,
      formatDetailDate,
      capitalizeFirst,
      hasNotifications,
      startEditing,
      formatSelectedDate
    }
  }
}
</script>

<style scoped>
.calendar-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.view-controls {
  display: flex;
  gap: 10px;
}

.view-btn {
  padding: 8px 16px;
  border: 1px solid var(--primary);
  background: transparent;
  color: var(--text);
  border-radius: 4px;
  cursor: pointer;
}

.view-btn.active {
  background: var(--primary);
  color: var(--text);
}

.navigation-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-btn {
  padding: 8px 16px;
  border: none;
  background: var(--primary);
  color: var(--text);
  border-radius: 4px;
  cursor: pointer;
}

.calendar-view {
  background: var(--primary);
  border-radius: 8px;
  padding: 20px;
}

/* Month View */
.month-view .calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--primary);
  border-radius: 12px;
  overflow: hidden;
  height: calc(100vh - 250px);
}

.month-view .calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--primary);
  padding: 1rem;
  margin-bottom: 1px;
}

.month-view .weekday-header {
  text-align: center;
  font-weight: 600;
  color: var(--text);
  padding: 0.5rem;
  background: var(--secondary);
}

.month-view .calendar-day {
  background: var(--background);
  min-height: 120px;
  padding: 0.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.month-view .calendar-day:hover {
  background: var(--secondary);
}

.month-view .calendar-day.today {
  background: var(--primary);
}

.month-view .calendar-day.different-month {
  opacity: 0.5;
}

.month-view .day-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.month-view .today .day-number {
  background: var(--primary);
  color: white;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.month-view .event-pill {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
}

.month-view .event-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.month-view .more-events {
  font-size: 0.8rem;
  color: var(--text);
  opacity: 0.7;
  cursor: pointer;
  text-align: center;
  padding: 0.25rem;
  background: var(--primary);
  border-radius: 4px;
}

.month-view .more-events:hover {
  opacity: 1;
}

/* Week View */
.week-view .time-grid {
  display: grid;
  grid-template-columns: 60px 1fr;
  height: 720px; /* 24 hours * 30px per hour */
  overflow-y: auto;
  border: 1px solid var(--secondary);
  border-radius: 8px;
  background: var(--primary);
}

.time-slots {
  display: grid;
  grid-template-rows: repeat(24, 30px);
  border-right: 1px solid var(--secondary);
  background: var(--background);
}

.time-slot {
  height: 30px;
  padding: 5px 10px;
  text-align: right;
  font-size: 0.8em;
  border-bottom: 1px solid var(--secondary);
  color: var(--text);
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
}

.week-day {
  border-right: 1px solid var(--secondary);
  min-width: 120px;
}

.week-day:last-child {
  border-right: none;
}

.day-header {
  padding: 5px;
  text-align: center;
  border-bottom: 1px solid var(--secondary);
  background: var(--background);
  position: sticky;
  top: 0;
  z-index: 1;
}

.day-name {
  font-weight: bold;
  color: var(--text);
}

.day-number {
  font-size: 0.9em;
  color: var(--text);
  opacity: 0.8;
}

.day-events {
  position: relative;
  height: calc(24 * 30px); /* 24 hours * 30px per hour */
}

.event-block {
  position: absolute;
  left: 2px;
  right: 2px;
  min-height: 20px;
  padding: 4px;
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(255, 0, 0, 0.1);
}

.event-block:hover {
  z-index: 2;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}


.event-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-top: 0;
  padding-top: 0;
}

/* Update event category colors */
.event-block.meeting {
  background: rgba(25, 118, 210, 0.1);
  border-left: 3px solid #1976d2;
  color: #1976d2;
}

.event-block.event {
  background: rgba(76, 175, 80, 0.1);
  border-left: 3px solid #4caf50;
  color: #4caf50;
}

.event-block.reminder {
  background: rgba(255, 152, 0, 0.1);
  border-left: 3px solid #ff9800;
  color: #ff9800;
}

.event-block.birthday {
  background: rgba(233, 30, 99, 0.1);
  border-left: 3px solid #e91e63;
  color: #e91e63;
}

.event-block.holiday {
  background: rgba(156, 39, 176, 0.1);
  border-left: 3px solid #9c27b0;
  color: #9c27b0;
}

/* Event pills should match event blocks */
.event-pill.meeting {
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2;
}

.event-pill.event {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.event-pill.reminder {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.event-pill.birthday {
  background: rgba(233, 30, 99, 0.1);
  color: #e91e63;
}

.event-pill.holiday {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

/* Day View */
.day-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.day-view .day-header {
  background: var(--primary);
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.day-view .day-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.5rem;
  text-align: center;
}

.day-view .time-grid {
  display: grid;
  grid-template-columns: 60px 1fr;
  height: 600px;
  overflow-y: auto;
}

.events-column {
  position: relative;
  background: var(--primary);
}

.event-block.day-event {
  background: var(--background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-block.day-event:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-block.day-event {
  font-size: 0.9rem;
  font-weight: 600;
  color: inherit;
}

.event-block.day-event .event-title {
  font-size: 1rem;
  font-weight: 500;
}

.event-block.day-event .event-description {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 4px;
}

/* Update day view event category styles */
.event-block.day-event.meeting {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
}

.event-block.day-event.event {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
}

.event-block.day-event.reminder {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.event-block.day-event.birthday {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #6a1b9a;
}

.event-block.day-event.holiday {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
  color: #c2185b;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: var(--primary);
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--secondary);
  border-radius: 4px;
  background: var(--background);
  color: var(--text);
}

.notification-options {
  display: flex;
  gap: 20px;
}

.notification-options label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-add,
.btn-save,
.btn-delete,
.btn-cancel {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-add {
  background: #4CAF50;
  color: white;
}

.btn-save {
  background: #2196F3;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
}

@media (max-width: 768px) {
  .calendar-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .day-cell {
    min-height: 80px;
  }
  
  .event-pill {
    font-size: 0.7em;
  }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

.error-state {
  color: var(--text);
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--primary);
  color: var(--text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-retry:hover {
  opacity: 0.9;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Event Details Modal */
.event-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9998;
}

.event-details-card {
  background: var(--background);
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.event-header {
  padding: 20px;
  position: relative;
  color: white;
}

.event-header.meeting { background: #1976d2; }
.event-header.event { background: #4caf50; }
.event-header.reminder { background: #ff9800; }
.event-header.birthday { background: #e91e63; }
.event-header.holiday { background: #9c27b0; }

.event-header h2 {
  margin: 0;
  font-size: 1.5rem;
  padding-right: 30px;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.event-body {
  padding: 20px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
  color: var(--text);
}

.detail-row .icon {
  font-size: 1.2rem;
  width: 24px;
}

.detail-content {
  flex: 1;
  line-height: 1.4;
}

.event-actions {
  padding: 15px 20px;
  border-top: 1px solid var(--secondary);
  display: flex;
  justify-content: flex-end;
}

.btn-edit {
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  opacity: 0.9;
}
</style> 