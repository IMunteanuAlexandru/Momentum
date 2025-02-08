import { createStore } from 'vuex'
import auth from './modules/auth'
import tasks from './modules/tasks'
import notifications from './modules/notifications'
import calendar from './modules/calendar'
import notes from './modules/notes'

export default createStore({
  modules: {
    auth,
    tasks,
    notifications,
    calendar,
    notes
  }
}) 