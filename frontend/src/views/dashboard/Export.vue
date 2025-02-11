<template>
  <div class="export-container">
    <div class="export-header">
      <h1>Export Data</h1>
      <p class="export-description">Export your data in different formats</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="loading-spinner">⌛</span>
      <p>Loading data...</p>
    </div>

    <!-- Export Grid -->
    <div v-else class="export-grid">
      <!-- Tasks Export -->
      <div class="export-card">
        <div class="card-header">
          <div class="icon-wrapper tasks">
            <span class="icon">📋</span>
          </div>
          <h2>Export Tasks</h2>
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
              <button 
                @click="exportFormat.tasks = 'pdf'"
                :class="{ active: exportFormat.tasks === 'pdf' }"
                class="format-btn"
              >
                PDF
              </button>
            </div>
          </div>
          <div class="export-options">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="exportOptions.tasks.includeCompleted"
              >
              Include completed tasks
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="exportOptions.tasks.includeArchived"
              >
              Include archived tasks
            </label>
          </div>
          <button 
            @click="exportTasks" 
            class="btn-export"
            :disabled="!tasks.length"
          >
            <span class="icon">⬇️</span>
            {{ tasksButtonText }}
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
              <button 
                @click="exportFormat.calendar = 'pdf'"
                :class="{ active: exportFormat.calendar === 'pdf' }"
                class="format-btn"
              >
                PDF
              </button>
            </div>
          </div>
          <div class="date-range">
            <div class="date-input">
              <label>From</label>
              <input 
                type="date" 
                v-model="exportOptions.calendar.startDate"
              >
            </div>
            <div class="date-input">
              <label>To</label>
              <input 
                type="date" 
                v-model="exportOptions.calendar.endDate"
              >
            </div>
          </div>
          <button 
            @click="exportCalendar" 
            class="btn-export"
            :disabled="!events.length"
          >
            <span class="icon">⬇️</span>
            {{ eventsButtonText }}
          </button>
        </div>
      </div>

      <!-- Notes Export -->
      <div class="export-card">
        <div class="card-header">
          <div class="icon-wrapper notes">
            <span class="icon">📝</span>
          </div>
          <h2>Export Notes</h2>
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
              <button 
                @click="exportFormat.notes = 'pdf'"
                :class="{ active: exportFormat.notes === 'pdf' }"
                class="format-btn"
              >
                PDF
              </button>
            </div>
          </div>
          <div class="export-options">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="exportOptions.notes.includeArchived"
              >
              Include archived notes
            </label>
          </div>
          <button 
            @click="exportNotes" 
            class="btn-export"
            :disabled="!notes.length"
          >
            <span class="icon">⬇️</span>
            {{ notesButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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

    const isLoading = ref(false)

    // Computed properties for store data
    const tasks = computed(() => store.getters['tasks/allTasks'])
    const events = computed(() => store.getters['calendar/allEvents'])
    const notes = computed(() => store.getters['notes/allNotes'])

    // Computed properties for button text
    const tasksButtonText = computed(() => tasks.value.length ? 'Export Tasks' : 'No tasks available')
    const eventsButtonText = computed(() => events.value.length ? 'Export Events' : 'No events available')
    const notesButtonText = computed(() => notes.value.length ? 'Export Notes' : 'No notes available')

    const loadData = async () => {
      isLoading.value = true
      try {
        await Promise.all([
          store.dispatch('tasks/fetchTasks'),
          store.dispatch('calendar/fetchEvents'),
          store.dispatch('notes/fetchNotes')
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error loading data'
        })
      } finally {
        isLoading.value = false
      }
    }

    const exportTasks = async () => {
      if (!tasks.value.length) {
        await store.dispatch('tasks/fetchTasks')
      }

      const filteredTasks = tasks.value.filter(task => {
        if (!exportOptions.value.tasks.includeCompleted && task.completed) return false
        if (!exportOptions.value.tasks.includeArchived && task.archived) return false
        return true
      })

      try {
        if (exportFormat.value.tasks === 'csv') {
          const csv = convertTasksToCSV(filteredTasks)
          downloadFile(csv, 'tasks.csv', 'text/csv')
        } else if (exportFormat.value.tasks === 'json') {
          const json = JSON.stringify(filteredTasks, null, 2)
          downloadFile(json, 'tasks.json', 'application/json')
        } else if (exportFormat.value.tasks === 'pdf') {
          const doc = new jsPDF('l', 'mm', 'a4', true)
          doc.setFont('helvetica')
          doc.setFontSize(20)
          doc.text('Tasks List', 20, 15)
          
          const tableData = filteredTasks.map(task => [
            task.title,
            task.description || '',
            task.priority,
            task.category || '',
            formatDateFriendly(task.dueDate),
            task.completed ? 'Completed' : 'In Progress'
          ])

          doc.autoTable({
            head: [['Title', 'Description', 'Priority', 'Category', 'Due Date', 'Status']],
            body: tableData,
            startY: 25,
            styles: { 
              font: 'helvetica',
              fontSize: 10, 
              cellPadding: 4,
              overflow: 'linebreak'
            },
            headStyles: { 
              fillColor: [41, 128, 185], 
              textColor: 255,
              font: 'helvetica',
              fontStyle: 'bold',
              halign: 'center'
            },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 80 },
              2: { cellWidth: 25 },
              3: { cellWidth: 35 },
              4: { cellWidth: 45 },
              5: { cellWidth: 25 }
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            theme: 'grid'
          })

          doc.save('tasks.pdf')
        }
        store.dispatch('notifications/add', {
          type: 'success',
          message: 'Tasks exported successfully'
        })
      } catch (error) {
        console.error('Error exporting tasks:', error)
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error exporting tasks'
        })
      }
    }

    const exportCalendar = async () => {
      if (!events.value.length) {
        await store.dispatch('calendar/fetchEvents')
      }

      const startDate = new Date(exportOptions.value.calendar.startDate)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(exportOptions.value.calendar.endDate)
      endDate.setHours(23, 59, 59, 999)

      const filteredEvents = events.value.filter(event => {
        const eventStart = new Date(event.startDate)
        return eventStart >= startDate && eventStart <= endDate
      })

      try {
        if (filteredEvents.length === 0) {
          store.dispatch('notifications/add', {
            type: 'warning',
            message: 'No events in the selected time range'
          })
          return
        }

        if (exportFormat.value.calendar === 'csv') {
          const csv = convertEventsToCSV(filteredEvents)
          downloadFile(csv, `events_${formatDateForFilename(startDate)}_${formatDateForFilename(endDate)}.csv`, 'text/csv')
        } else if (exportFormat.value.calendar === 'json') {
          const cleanedEvents = filteredEvents.map(event => ({
            title: event.title,
            description: event.description,
            startDate: formatDateFriendly(event.startDate, true),
            endDate: formatDateFriendly(event.endDate, true),
            category: event.category,
            recurrence: formatRecurrenceText(event.recurrence),
            notifications: formatNotifications(event.notifications)
          }))
          const json = JSON.stringify(cleanedEvents, null, 2)
          downloadFile(json, `events_${formatDateForFilename(startDate)}_${formatDateForFilename(endDate)}.json`, 'application/json')
        } else if (exportFormat.value.calendar === 'ical') {
          const ical = convertEventsToICal(filteredEvents)
          downloadFile(ical, `events_${formatDateForFilename(startDate)}_${formatDateForFilename(endDate)}.ics`, 'text/calendar')
        } else if (exportFormat.value.calendar === 'pdf') {
          const doc = new jsPDF('l', 'mm', 'a4', true)
          doc.setFont('helvetica')
          doc.setFontSize(20)
          doc.text('Calendar Events', 20, 15)
          
          const tableData = filteredEvents.map(event => [
            event.title,
            event.description || '',
            formatDateFriendly(event.startDate, true),
            formatDateFriendly(event.endDate, true),
            event.category || '',
            formatRecurrenceText(event.recurrence)
          ])

          doc.autoTable({
            head: [['Title', 'Description', 'Start', 'End', 'Category', 'Recurrence']],
            body: tableData,
            startY: 25,
            styles: { 
              font: 'helvetica',
              fontSize: 10, 
              cellPadding: 4,
              overflow: 'linebreak'
            },
            headStyles: { 
              fillColor: [46, 204, 113], 
              textColor: 255,
              font: 'helvetica',
              fontStyle: 'bold',
              halign: 'center'
            },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 80 },
              2: { cellWidth: 45 },
              3: { cellWidth: 45 },
              4: { cellWidth: 25 },
              5: { cellWidth: 25 }
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            theme: 'grid'
          })

          doc.save(`events_${formatDateForFilename(startDate)}_${formatDateForFilename(endDate)}.pdf`)
        }
        store.dispatch('notifications/add', {
          type: 'success',
          message: 'Calendar exported successfully'
        })
      } catch (error) {
        console.error('Error exporting calendar:', error)
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error exporting calendar'
        })
      }
    }

    const exportNotes = async () => {
      if (!notes.value.length) {
        await store.dispatch('notes/fetchNotes')
      }

      const filteredNotes = notes.value.filter(note => {
        if (!exportOptions.value.notes.includeArchived && note.archived) return false
        return true
      })

      try {
        if (exportFormat.value.notes === 'txt') {
          const txt = convertNotesToTxt(filteredNotes)
          downloadFile(txt, 'notes.txt', 'text/plain')
        } else if (exportFormat.value.notes === 'md') {
          const md = convertNotesToMd(filteredNotes)
          downloadFile(md, 'notes.md', 'text/markdown')
        } else if (exportFormat.value.notes === 'json') {
          const json = JSON.stringify(filteredNotes, null, 2)
          downloadFile(json, 'notes.json', 'application/json')
        } else if (exportFormat.value.notes === 'pdf') {
          const doc = new jsPDF('p', 'mm', 'a4', true)
          doc.setFont('helvetica')
          doc.setFontSize(20)
          doc.text('Notes', 14, 15)
          
          const tableData = filteredNotes.map(note => {
            const metadata = `Created: ${formatDateFriendly(note.createdAt)}\nUpdated: ${formatDateFriendly(note.updatedAt)}`
            return [
              note.title || '',
              note.content || '',
              note.category || '',
              metadata
            ]
          })

          doc.autoTable({
            head: [['Title', 'Content', 'Category', 'Metadata']],
            body: tableData,
            startY: 25,
            styles: { 
              font: 'helvetica',
              fontSize: 10, 
              cellPadding: 6,
              overflow: 'linebreak',
              cellWidth: 'wrap',
              valign: 'top',
              minCellHeight: 10
            },
            headStyles: { 
              fillColor: [33, 150, 243], 
              textColor: 255,
              font: 'helvetica',
              fontStyle: 'bold',
              halign: 'center',
              minCellHeight: 10
            },
            columnStyles: {
              0: { cellWidth: 40, fontStyle: 'bold' },
              1: { cellWidth: 75 },
              2: { cellWidth: 35 },
              3: { cellWidth: 35, fontSize: 8 }
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            theme: 'grid',
            margin: { left: 10, right: 10 }
          })

          doc.save('notes.pdf')
        }
        store.dispatch('notifications/add', {
          type: 'success',
          message: 'Notes exported successfully'
        })
      } catch (error) {
        console.error('Error exporting notes:', error)
        store.dispatch('notifications/add', {
          type: 'error',
          message: 'Error exporting notes'
        })
      }
    }

    const convertTasksToCSV = (tasks) => {
      const headers = ['Title', 'Description', 'Priority', 'Category', 'Due Date', 'Status', 'Created', 'Updated']
      const rows = tasks.map(task => [
        escapeCsvField(task.title),
        escapeCsvField(task.description),
        task.priority,
        escapeCsvField(task.category),
        formatDateFriendly(task.dueDate),
        task.completed ? 'Completed' : 'In Progress',
        formatDateFriendly(task.createdAt),
        formatDateFriendly(task.updatedAt)
      ])
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    const convertEventsToCSV = (events) => {
      const headers = ['Title', 'Description', 'Start', 'End', 'Category', 'Recurrence', 'Notifications']
      const rows = events.map(event => [
        escapeCsvField(event.title),
        escapeCsvField(event.description),
        formatDateFriendly(event.startDate, true),
        formatDateFriendly(event.endDate, true),
        event.category,
        formatRecurrenceText(event.recurrence),
        formatNotifications(event.notifications)
      ])
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    const convertEventsToICal = (events) => {
      let ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Momentum//Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Momentum Calendar',
        'X-WR-TIMEZONE:Europe/Bucharest'
      ]

      events.forEach(event => {
        ical.push('BEGIN:VEVENT')
        ical.push(`DTSTAMP:${formatDateToICal(new Date())}`)
        ical.push(`DTSTART:${formatDateToICal(new Date(event.startDate))}`)
        ical.push(`DTEND:${formatDateToICal(new Date(event.endDate))}`)
        ical.push(`SUMMARY:${escapeIcalField(event.title)}`)
        if (event.description) {
          ical.push(`DESCRIPTION:${escapeIcalField(event.description)}`)
        }
        if (event.category) {
          ical.push(`CATEGORIES:${escapeIcalField(event.category)}`)
        }
        if (event.recurrence) {
          ical.push(`RRULE:${formatRecurrenceRule(event.recurrence)}`)
        }
        ical.push('END:VEVENT')
      })

      ical.push('END:VCALENDAR')
      return ical.join('\r\n')
    }

    const convertNotesToTxt = (notes) => {
      return notes.map(note => {
        const header = `${note.title}\n${'-'.repeat(note.title.length)}\n`
        const metadata = `Category: ${note.category}\nCreated: ${formatDateFriendly(note.createdAt)}\nUpdated: ${formatDateFriendly(note.updatedAt)}\n`
        const content = `\n${note.content}\n`
        return `${header}${metadata}${content}\n${'='.repeat(80)}\n`
      }).join('\n')
    }

    const convertNotesToMd = (notes) => {
      return notes.map(note => {
        const header = `# ${note.title}\n\n`
        const metadata = `> **Category:** ${note.category}  \n> **Created:** ${formatDateFriendly(note.createdAt)}  \n> **Updated:** ${formatDateFriendly(note.updatedAt)}\n\n`
        const content = `${note.content}\n\n`
        return `${header}${metadata}${content}---\n`
      }).join('\n')
    }

    // Helper functions
    const escapeCsvField = (field) => {
      if (field === null || field === undefined) return ''
      const stringField = String(field)
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`
      }
      return stringField
    }

    const escapeIcalField = (field) => {
      if (!field) return ''
      return field
        .replace(/[\\;,]/g, (match) => `\\${match}`)
        .replace(/\n/g, '\\n')
    }

    const formatDateFriendly = (date, includeTime = false) => {
      if (!date) return ''
      const d = new Date(date)
      const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      
      const day = d.getDate()
      const month = months[d.getMonth()]
      const year = d.getFullYear()
      const weekDay = weekDays[d.getDay()]
      
      if (!includeTime) {
        return `${weekDay}, ${day} ${month} ${year}`
      }
      
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${weekDay}, ${day} ${month} ${year} at ${hours}:${minutes}`
    }

    const formatDateToICal = (date) => {
      return date.toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '')
        .replace(/[+-]\d{2}:\d{2}/, 'Z')
    }

    const formatRecurrenceText = (recurrence) => {
      const map = {
        'daily': 'Daily',
        'weekly': 'Weekly',
        'monthly': 'Monthly',
        'yearly': 'Yearly'
      }
      return map[recurrence] || 'No recurrence'
    }

    const formatNotifications = (notifications) => {
      if (!notifications) return 'No notifications'
      const types = []
      if (notifications.email) types.push('Email')
      if (notifications.push) types.push('Push notification')
      return types.length ? types.join(', ') : 'No notifications'
    }

    const formatRecurrenceRule = (recurrence) => {
      switch (recurrence) {
        case 'daily': return 'FREQ=DAILY'
        case 'weekly': return 'FREQ=WEEKLY'
        case 'monthly': return 'FREQ=MONTHLY'
        case 'yearly': return 'FREQ=YEARLY'
        default: return ''
      }
    }

    const formatDateForFilename = (date) => {
      const d = new Date(date)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}_${month}_${year}`
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

    onMounted(() => {
      loadData()
    })

    return {
      exportFormat,
      exportOptions,
      exportTasks,
      exportCalendar,
      exportNotes,
      isLoading,
      tasks,
      events,
      notes,
      tasksButtonText,
      eventsButtonText,
      notesButtonText
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

@media (max-width: 1400px) {
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text);
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--primary);
}
</style> 