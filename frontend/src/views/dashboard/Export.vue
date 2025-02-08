<template>
  <div class="export-container">
    <div class="export-header">
      <h1>Export Date</h1>
      <p class="export-description">Exportă datele tale în diferite formate</p>
    </div>

    <div class="export-grid">
      <!-- Tasks Export -->
      <div class="export-card">
        <div class="card-header">
          <div class="icon-wrapper tasks">
            <span class="icon">📋</span>
          </div>
          <h2>Export Sarcini</h2>
        </div>
        <div class="card-content">
          <div class="format-selector">
            <label>Format</label>
            <div class="format-options">
              <button 
                @click="exportFormat.tasks = 'csv'"
                :class="{ active: exportFormat.tasks === 'csv' }"
                class="format-btn"
              >
                CSV
              </button>
              <button 
                @click="exportFormat.tasks = 'json'"
                :class="{ active: exportFormat.tasks === 'json' }"
                class="format-btn"
              >
                JSON
              </button>
            </div>
          </div>
          <div class="export-options">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="exportOptions.tasks.includeCompleted"
              >
              Include sarcini completate
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="exportOptions.tasks.includeArchived"
              >
              Include sarcini arhivate
            </label>
          </div>
          <button @click="exportTasks" class="btn-export">
            <span class="icon">⬇️</span>
            Exportă Sarcini
          </button>
        </div>
      </div>

      <!-- Calendar Export -->
      <div class="export-card">
        <div class="card-header">
          <div class="icon-wrapper calendar">
            <span class="icon">📅</span>
          </div>
          <h2>Export Calendar</h2>
        </div>
        <div class="card-content">
          <div class="format-selector">
            <label>Format</label>
            <div class="format-options">
              <button 
                @click="exportFormat.calendar = 'csv'"
                :class="{ active: exportFormat.calendar === 'csv' }"
                class="format-btn"
              >
                CSV
              </button>
              <button 
                @click="exportFormat.calendar = 'json'"
                :class="{ active: exportFormat.calendar === 'json' }"
                class="format-btn"
              >
                JSON
              </button>
              <button 
                @click="exportFormat.calendar = 'ical'"
                :class="{ active: exportFormat.calendar === 'ical' }"
                class="format-btn"
              >
                iCal
              </button>
            </div>
          </div>
          <div class="date-range">
            <div class="date-input">
              <label>De la</label>
              <input 
                type="date" 
                v-model="exportOptions.calendar.startDate"
              >
            </div>
            <div class="date-input">
              <label>Până la</label>
              <input 
                type="date" 
                v-model="exportOptions.calendar.endDate"
              >
            </div>
          </div>
          <button @click="exportCalendar" class="btn-export">
            <span class="icon">⬇️</span>
            Exportă Evenimente
          </button>
        </div>
      </div>

      <!-- Notes Export -->
      <div class="export-card">
        <div class="card-header">
          <div class="icon-wrapper notes">
            <span class="icon">📝</span>
          </div>
          <h2>Export Notițe</h2>
        </div>
        <div class="card-content">
          <div class="format-selector">
            <label>Format</label>
            <div class="format-options">
              <button 
                @click="exportFormat.notes = 'txt'"
                :class="{ active: exportFormat.notes === 'txt' }"
                class="format-btn"
              >
                TXT
              </button>
              <button 
                @click="exportFormat.notes = 'md'"
                :class="{ active: exportFormat.notes === 'md' }"
                class="format-btn"
              >
                MD
              </button>
              <button 
                @click="exportFormat.notes = 'json'"
                :class="{ active: exportFormat.notes === 'json' }"
                class="format-btn"
              >
                JSON
              </button>
            </div>
          </div>
          <div class="export-options">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="exportOptions.notes.includeArchived"
              >
              Include notițe arhivate
            </label>
          </div>
          <button @click="exportNotes" class="btn-export">
            <span class="icon">⬇️</span>
            Exportă Notițe
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Export',
  setup() {
    const store = useStore()
    
    const exportFormat = ref({
      tasks: 'csv',
      calendar: 'csv',
      notes: 'txt'
    })

    const exportOptions = ref({
      tasks: {
        includeCompleted: true,
        includeArchived: false
      },
      calendar: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      notes: {
        includeArchived: false
      }
    })

    const exportTasks = async () => {
      const tasks = store.state.tasks.list
      const filteredTasks = tasks.filter(task => {
        if (!exportOptions.value.tasks.includeCompleted && task.completed) return false
        if (!exportOptions.value.tasks.includeArchived && task.archived) return false
        return true
      })

      if (exportFormat.value.tasks === 'csv') {
        const csv = convertTasksToCSV(filteredTasks)
        downloadFile(csv, 'tasks.csv', 'text/csv')
      } else {
        const json = JSON.stringify(filteredTasks, null, 2)
        downloadFile(json, 'tasks.json', 'application/json')
      }
    }

    const exportCalendar = async () => {
      const events = store.state.calendar.events
      const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.startDate)
        const startDate = new Date(exportOptions.value.calendar.startDate)
        const endDate = new Date(exportOptions.value.calendar.endDate)
        return eventDate >= startDate && eventDate <= endDate
      })

      if (exportFormat.value.calendar === 'csv') {
        const csv = convertEventsToCSV(filteredEvents)
        downloadFile(csv, 'events.csv', 'text/csv')
      } else if (exportFormat.value.calendar === 'json') {
        const json = JSON.stringify(filteredEvents, null, 2)
        downloadFile(json, 'events.json', 'application/json')
      } else {
        const ical = convertEventsToICal(filteredEvents)
        downloadFile(ical, 'events.ics', 'text/calendar')
      }
    }

    const exportNotes = async () => {
      const notes = store.state.notes.list
      const filteredNotes = notes.filter(note => {
        if (!exportOptions.value.notes.includeArchived && note.archived) return false
        return true
      })

      if (exportFormat.value.notes === 'txt') {
        const txt = convertNotesToTxt(filteredNotes)
        downloadFile(txt, 'notes.txt', 'text/plain')
      } else if (exportFormat.value.notes === 'md') {
        const md = convertNotesToMd(filteredNotes)
        downloadFile(md, 'notes.md', 'text/markdown')
      } else {
        const json = JSON.stringify(filteredNotes, null, 2)
        downloadFile(json, 'notes.json', 'application/json')
      }
    }

    const convertTasksToCSV = (tasks) => {
      const headers = ['ID', 'Titlu', 'Descriere', 'Prioritate', 'Categorie', 'Data Limită', 'Completat']
      const rows = tasks.map(task => [
        task.id,
        task.title,
        task.description,
        task.priority,
        task.category,
        task.dueDate,
        task.completed
      ])
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    const convertEventsToCSV = (events) => {
      const headers = ['ID', 'Titlu', 'Descriere', 'Data Start', 'Data Sfârșit', 'Categorie']
      const rows = events.map(event => [
        event.id,
        event.title,
        event.description,
        event.startDate,
        event.endDate,
        event.category
      ])
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    const convertEventsToICal = (events) => {
      let ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Momentum//Calendar//RO'
      ]

      events.forEach(event => {
        ical.push('BEGIN:VEVENT')
        ical.push(`UID:${event.id}`)
        ical.push(`DTSTAMP:${formatDateToICal(new Date())}`)
        ical.push(`DTSTART:${formatDateToICal(new Date(event.startDate))}`)
        ical.push(`DTEND:${formatDateToICal(new Date(event.endDate))}`)
        ical.push(`SUMMARY:${event.title}`)
        ical.push(`DESCRIPTION:${event.description}`)
        ical.push(`CATEGORIES:${event.category}`)
        ical.push('END:VEVENT')
      })

      ical.push('END:VCALENDAR')
      return ical.join('\r\n')
    }

    const convertNotesToTxt = (notes) => {
      return notes.map(note => {
        return `${note.title}\n${'-'.repeat(note.title.length)}\n\n${note.content}\n\n`
      }).join('\n')
    }

    const convertNotesToMd = (notes) => {
      return notes.map(note => {
        return `# ${note.title}\n\n${note.content}\n\n---\n`
      }).join('\n')
    }

    const formatDateToICal = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const downloadFile = (content, filename, type) => {
      const blob = new Blob([content], { type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }

    return {
      exportFormat,
      exportOptions,
      exportTasks,
      exportCalendar,
      exportNotes
    }
  }
}
</script>

<style scoped>
.export-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem;
  animation: fadeIn 0.5s ease-out;
}

.export-header {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
}

.export-header::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--primary));
  border-radius: 2px;
}

.export-header h1 {
  font-size: 3rem;
  color: var(--text);
  margin-bottom: 1rem;
  font-weight: 700;
}

.export-description {
  color: var(--text);
  opacity: 0.8;
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
}

.export-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
  perspective: 1000px;
}

.export-card {
  background: var(--primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.export-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.tasks { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
.calendar { background: linear-gradient(135deg, #4CAF50, #8BC34A); }
.notes { background: linear-gradient(135deg, #2196F3, #00BCD4); }

.card-header h2 {
  color: var(--text);
  font-size: 1.6rem;
  margin: 0;
  font-weight: 600;
}

.card-content {
  padding: 2rem;
}

.format-selector {
  margin-bottom: 2rem;
}

.format-selector label {
  display: block;
  color: var(--text);
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.format-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.format-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--primary);
  border-radius: 12px;
  background: var(--background);
  color: var(--text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 80px;
  text-align: center;
}

.format-btn:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.format-btn.active {
  background: var(--secondary);
  border-color: var(--primary);
  color: white;
  font-weight: 600;
}

.export-options {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--background);
  border-radius: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text);
  margin-bottom: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.checkbox-label:hover {
  background: var(--secondary);
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--primary);
  appearance: none;
  cursor: pointer;
  position: relative;
  background: var(--background);
}

.checkbox-label input[type="checkbox"]:checked {
  background: var(--primary);
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.date-input {
  background: var(--background);
  padding: 1.5rem;
  border-radius: 15px;
}

.date-input label {
  display: block;
  color: var(--text);
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.date-input input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--secondary);
  border-radius: 12px;
  background: var(--background);
  color: var(--text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.date-input input:focus {
  border-color: var(--secondary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.btn-export {
  width: 100%;
  padding: 1.25rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--secondary), var(--primary), var(--secondary));
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-export:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.btn-export i {
  font-size: 1.2rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .export-container {
    padding: 1.5rem;
  }

  .export-header h1 {
    font-size: 2.5rem;
  }

  .export-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .date-range {
    grid-template-columns: 1fr;
  }

  .card-header {
    padding: 1.5rem;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
    font-size: 1.3rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  .format-btn {
    padding: 0.6rem 1.2rem;
  }
}

.icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}
</style> 