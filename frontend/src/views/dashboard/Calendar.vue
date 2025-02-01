<template>
  <div class="calendar-container">
    <header class="page-header">
      <h1>Calendar</h1>
      <button class="add-event-btn" @click="addEvent">
        <i class="fas fa-plus"></i>
        Add Event
      </button>
    </header>
    
    <div class="calendar-grid">
      <div class="calendar-navigation">
        <button @click="previousMonth">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h2>{{ currentMonthYear }}</h2>
        <button @click="nextMonth">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="calendar-header">
        <div v-for="day in weekDays" :key="day" class="calendar-cell">{{ day }}</div>
      </div>
      
      <div class="calendar-body">
        <div 
          v-for="date in calendarDates" 
          :key="date.day"
          class="calendar-cell"
          :class="{ 
            'current-month': date.currentMonth,
            'today': date.isToday,
            'has-events': hasEvents(date)
          }"
        >
          <span class="date-number">{{ date.day }}</span>
          <div class="event-indicators" v-if="hasEvents(date)">
            <div 
              v-for="event in getEvents(date)" 
              :key="event.id"
              class="event-dot"
              :style="{ backgroundColor: event.color }"
              :title="event.title"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentDate = ref(new Date())
const events = ref([
  {
    id: 1,
    title: 'Team Meeting',
    date: new Date(2024, 2, 15),
    color: '#4CAF50'
  },
  {
    id: 2,
    title: 'Project Deadline',
    date: new Date(2024, 2, 20),
    color: '#F44336'
  }
])

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const dates = []
  
  // Add days from previous month
  for (let i = firstDay.getDay(); i > 0; i--) {
    const prevDate = new Date(year, month, -i + 1)
    dates.push({
      day: prevDate.getDate(),
      currentMonth: false,
      isToday: isSameDate(prevDate, new Date()),
      date: prevDate
    })
  }
  
  // Add days from current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currentDate = new Date(year, month, i)
    dates.push({
      day: i,
      currentMonth: true,
      isToday: isSameDate(currentDate, new Date()),
      date: currentDate
    })
  }
  
  // Add days from next month
  const remainingDays = 42 - dates.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(year, month + 1, i)
    dates.push({
      day: i,
      currentMonth: false,
      isToday: isSameDate(nextDate, new Date()),
      date: nextDate
    })
  }
  
  return dates
})

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const isSameDate = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const hasEvents = (date) => {
  return events.value.some(event => isSameDate(event.date, date.date))
}

const getEvents = (date) => {
  return events.value.filter(event => isSameDate(event.date, date.date))
}

const addEvent = () => {
  // TODO: Implement add event functionality
  console.log('Add event clicked')
}
</script>

<style scoped>
.calendar-container {
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

.add-event-btn {
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

.add-event-btn:hover {
  opacity: 0.9;
}

.calendar-grid {
  background-color: var(--primary);
  border-radius: 12px;
  padding: 2rem;
}

.calendar-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.calendar-navigation button {
  background: none;
  border: none;
  color: var(--text);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.calendar-navigation button:hover {
  background-color: var(--secondary);
}

.calendar-navigation h2 {
  color: var(--text);
  font-size: 1.5rem;
  font-weight: 600;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--secondary);
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.calendar-header .calendar-cell {
  background-color: var(--primary);
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: var(--text);
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--secondary);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.calendar-cell {
  background-color: var(--primary);
  min-height: 100px;
  padding: 0.5rem;
  position: relative;
}

.calendar-cell:not(.current-month) {
  opacity: 0.5;
}

.calendar-cell.today {
  background-color: var(--secondary);
}

.date-number {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text);
}

.event-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 1rem;
  }
  
  .calendar-cell {
    min-height: 80px;
    padding: 0.25rem;
  }
  
  .date-number {
    font-size: 0.9rem;
  }
}
</style> 