<template>
  <div class="calendar-container">
    
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
          Adaugă eveniment
        </button>
      </div>

    <!-- Calendar Grid -->
    <div class="calendar-view" :class="currentView">
      <!-- Month View -->
      <div v-if="currentView === 'month'" class="month-view">
        <div class="weekdays">
          <div v-for="day in weekDays" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>
        <div class="days-grid">
          <div
            v-for="day in daysInMonth"
            :key="day.date"
            class="day-cell"
            :class="{
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'has-events': day.events.length
            }"
            @click="selectDate(day)"
          >
            <div class="day-header">
              <span class="day-number">{{ day.dayNumber }}</span>
            </div>
            <div class="day-events">
              <div
                v-for="event in day.events.slice(0, 3)"
                :key="event.id"
                class="event-pill"
                :class="event.category"
                @click.stop="editEvent(event)"
              >
                {{ event.title }}
              </div>
              <div v-if="day.events.length > 3" class="more-events">
                +{{ day.events.length - 3 }} mai multe
              </div>
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
                  @click="editEvent(event)"
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
              class="event-block"
              :class="event.category"
              :style="getEventStyle(event)"
              @click="editEvent(event)"
            >
              <div class="event-time">{{ formatEventTime(event) }}</div>
              <div class="event-title">{{ event.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Event Modal -->
    <div v-if="showAddEvent || editingEvent" class="modal">
      <div class="modal-content">
        <h2>{{ editingEvent ? 'Editează evenimentul' : 'Adaugă eveniment nou' }}</h2>
        <form @submit.prevent="saveEvent">
          <div class="form-group">
            <label>Titlu</label>
            <input v-model="eventForm.title" required>
          </div>
          <div class="form-group">
            <label>Descriere</label>
            <textarea v-model="eventForm.description"></textarea>
          </div>
          <div class="form-group">
            <label>Data început</label>
            <input type="datetime-local" v-model="eventForm.startDate" required>
          </div>
          <div class="form-group">
            <label>Data sfârșit</label>
            <input type="datetime-local" v-model="eventForm.endDate" required>
          </div>
          <div class="form-group">
            <label>Categorie</label>
            <select v-model="eventForm.category" required>
              <option value="meeting">Întâlnire</option>
              <option value="personal">Personal</option>
              <option value="work">Muncă</option>
              <option value="holiday">Vacanță</option>
            </select>
          </div>
          <div class="form-group">
            <label>Recurență</label>
            <select v-model="eventForm.recurrence">
              <option value="">Fără recurență</option>
              <option value="daily">Zilnic</option>
              <option value="weekly">Săptămânal</option>
              <option value="monthly">Lunar</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notificări</label>
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
              {{ editingEvent ? 'Salvează' : 'Adaugă' }}
            </button>
            <button 
              v-if="editingEvent" 
              type="button" 
              @click="deleteEvent" 
              class="btn-delete"
            >
              Șterge
            </button>
            <button type="button" @click="closeEventModal" class="btn-cancel">
              Anulează
            </button>
          </div>
        </form>
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
    
    const views = [
      { label: 'Lună', value: 'month' },
      { label: 'Săptămână', value: 'week' },
      { label: 'Zi', value: 'day' }
    ]

    const weekDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică']

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
      return currentDate.value.toLocaleDateString('ro-RO', { 
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
          events: getEventsForDay(prevDate)
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
          events: getEventsForDay(currentDate)
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
          events: getEventsForDay(nextDate)
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
          events: getEventsForDay(day)
        })
      }
      
      return week
    })

    const currentDayEvents = computed(() => {
      return getEventsForDay(currentDate.value)
    })

    // Helper functions
    const isSameDay = (date1, date2) => {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    }

    const getEventsForDay = (date) => {
      return store.getters['calendar/eventsForDay'](date)
    }

    const formatHour = (hour) => {
      return `${hour.toString().padStart(2, '0')}:00`
    }

    const formatWeekDay = (date) => {
      return date.toLocaleDateString('ro-RO', { weekday: 'short' })
    }

    const formatDayNumber = (date) => {
      return date.getDate()
    }

    const formatEventTime = (event) => {
      const start = new Date(event.startDate)
      return start.toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    const getEventStyle = (event) => {
      const start = new Date(event.startDate)
      const end = new Date(event.endDate)
      const duration = (end - start) / (1000 * 60) // duration in minutes
      const top = (start.getHours() * 60 + start.getMinutes()) * (100 / 1440)
      const height = duration * (100 / 1440)

      return {
        top: `${top}%`,
        height: `${height}%`
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

    const editEvent = (event) => {
      editingEvent.value = event
      eventForm.value = { ...event }
      showAddEvent.value = true
    }

    const saveEvent = () => {
      if (editingEvent.value) {
        store.dispatch('calendar/updateEvent', {
          id: editingEvent.value.id,
          ...eventForm.value
        })
      } else {
        store.dispatch('calendar/addEvent', {
          ...eventForm.value,
          id: Date.now()
        })
      }
      closeEventModal()
    }

    const deleteEvent = () => {
      if (confirm('Ești sigur că vrei să ștergi acest eveniment?')) {
        store.dispatch('calendar/deleteEvent', editingEvent.value.id)
        closeEventModal()
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

    onMounted(() => {
      // Initialize with current date
      const now = new Date()
      eventForm.value.startDate = now.toISOString().slice(0, 16)
      eventForm.value.endDate = new Date(now.getTime() + 60 * 60 * 1000)
        .toISOString().slice(0, 16)
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
      getEventStyle
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
.month-view .weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.month-view .days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--secondary);
}

.day-cell {
  min-height: 120px;
  padding: 8px;
  background: var(--primary);
  cursor: pointer;
}

.day-cell:hover {
  background: var(--secondary);
}

.day-cell.other-month {
  opacity: 0.5;
}

.day-cell.today {
  background: var(--primary);
}

.day-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-pill {
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.8em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

/* Week View */
.week-view .time-grid {
  display: grid;
  grid-template-columns: 60px 1fr;
  height: 600px;
  overflow-y: auto;
}

.time-slots {
  display: grid;
  grid-template-rows: repeat(24, 1fr);
}

.time-slot {
  text-align: right;
  padding-right: 10px;
  font-size: 0.8em;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--secondary);
}

.week-day {
  background: var(--primary);
  position: relative;
}

/* Day View */
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

.event-block {
  position: absolute;
  left: 4px;
  right: 4px;
  padding: 4px;
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer;
  overflow: hidden;
}

/* Event Categories */
.event-pill.meeting,
.event-block.meeting {
  background: #e3f2fd;
  color: #1976d2;
}

.event-pill.personal,
.event-block.personal {
  background: #f3e5f5;
  color: #7b1fa2;
}

.event-pill.work,
.event-block.work {
  background: #e8f5e9;
  color: #388e3c;
}

.event-pill.holiday,
.event-block.holiday {
  background: #fff3e0;
  color: #f57c00;
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
</style>