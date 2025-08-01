<template>
  <div class="calendar-container">
    <!-- Header del calendario -->
    <div class="calendar-header">
      <div class="calendar-controls">
        <button class="btn-nav" @click="previousMonth">
          <i class="ti-angle-left"></i>
        </button>
        <h3 class="current-month">{{ currentMonthYear }}</h3>
        <button class="btn-nav" @click="nextMonth">
          <i class="ti-angle-right"></i>
        </button>
      </div>
      <div class="calendar-actions">
        <button class="btn-today" @click="goToToday">
          <i class="ti-calendar"></i> Hoy
        </button>
        <select v-model="selectedView" class="view-selector">
          <option value="month">Mes</option>
          <option value="week">Semana</option>
        </select>
      </div>
    </div>

    <!-- Vista de mes -->
    <div v-if="selectedView === 'month'" class="calendar-grid">
      <!-- Indicador de carga -->
      <div v-if="loading" class="calendar-loading">
        <div class="loading-spinner"></div>
        <p>Cargando eventos...</p>
      </div>
      <!-- Días de la semana -->
      <div class="calendar-weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>
      
      <!-- Días del mes -->
      <div class="calendar-days">
        <div 
          v-for="day in calendarDays" 
          :key="day.date" 
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-events': day.events.length > 0
          }"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          <div class="day-events">
            <div 
              v-for="(event, index) in day.events.slice(0, 2)" 
              :key="`event-${index}-${event.id || 'no-id'}`"
              class="event-item"
              :style="{ backgroundColor: getEventColor(event) }"
              @click.stop="showEventDetails(event)"
              :title="event.title"
            >
              <div class="event-title">{{ getEventTitle(event) }}</div>
              <div v-if="getEventSubtitle(event)" class="event-subtitle">{{ getEventSubtitle(event) }}</div>
            </div>
            <div v-if="day.events.length > 2" class="more-events">
              +{{ day.events.length - 2 }} más
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de semana -->
    <div v-else class="week-view">
      <div class="week-header">
        <div v-for="day in weekDays" :key="day" class="weekday-header">
          {{ day }}
        </div>
      </div>
      <div class="week-grid">
        <div 
          v-for="day in weekDays" 
          :key="day" 
          class="week-day"
          :class="{ 'today': isToday(day) }"
        >
          <div class="week-day-number">{{ getDayNumber(day) }}</div>
          <div class="week-day-events">
            <div 
              v-for="(event, index) in getWeekDayEvents(day)" 
              :key="`week-event-${index}-${event.id || 'no-id'}`"
              class="week-event"
              :style="{ backgroundColor: getEventColor(event) }"
              @click="showEventDetails(event)"
            >
              <div class="event-title">{{ event.title }}</div>
              <div class="event-time">{{ formatTime(event.date) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del evento -->
    <b-modal 
      v-model="showEventModal" 
      :title="selectedEvent ? selectedEvent.title : 'Detalles del evento'"
      size="lg"
      hide-footer
    >
      <div v-if="selectedEvent" class="event-details">
        <div class="event-header">
          <div class="event-icon">
            <i class="ti-calendar"></i>
          </div>
          <div class="event-info">
            <h4>{{ selectedEvent.title }}</h4>
            <p class="event-date">
              <i class="ti-time"></i>
              {{ formatFullDate(selectedEvent.date) }}
            </p>
          </div>
        </div>
        
        <div class="event-fields">
          <div v-for="(value, key) in selectedEvent.data" :key="`detail-${key}`" class="event-field">
            <label class="field-label">{{ formatFieldName(key) }}:</label>
            <span class="field-value">{{ value }}</span>
          </div>
        </div>

        <div class="event-actions">
          <button class="btn-edit" @click="editEvent(selectedEvent)">
            <i class="ti-pencil"></i> Editar
          </button>
          <button class="btn-delete" @click="deleteEvent(selectedEvent)">
            <i class="ti-trash"></i> Eliminar
          </button>
        </div>
      </div>
    </b-modal>

    <!-- Modal para agregar/editar evento -->
    <b-modal 
      v-model="showEventForm" 
      :title="editingEvent ? 'Editar Evento' : 'Nuevo Evento'"
      size="lg"
      hide-footer
    >
      <div class="event-form">
        <div class="form-group">
          <label>Título del evento</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="eventForm.title"
            placeholder="Ingrese el título del evento"
          >
        </div>
        
        <div class="form-group">
          <label>Fecha</label>
          <input 
            type="date" 
            class="form-control" 
            v-model="eventForm.date"
          >
        </div>

        <div class="form-group">
          <label>Hora</label>
          <input 
            type="time" 
            class="form-control" 
            v-model="eventForm.time"
          >
        </div>

        <div class="form-group">
          <label>Color</label>
          <select class="form-control" v-model="eventForm.color">
            <option value="#007bff">Azul</option>
            <option value="#28a745">Verde</option>
            <option value="#ffc107">Amarillo</option>
            <option value="#dc3545">Rojo</option>
            <option value="#6f42c1">Púrpura</option>
            <option value="#fd7e14">Naranja</option>
          </select>
        </div>

        <div class="form-group">
          <label>Datos adicionales</label>
          <div v-for="(field, key) in availableFields" :key="`field-${key}`" class="field-input">
            <label>{{ formatFieldName(key) }}</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="eventForm.data[key]"
              :placeholder="'Ingrese ' + formatFieldName(key)"
            >
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-save" @click="saveEvent">
            <i class="ti-save"></i> {{ editingEvent ? 'Actualizar' : 'Guardar' }}
          </button>
          <button class="btn-cancel" @click="cancelEventForm">
            <i class="ti-close"></i> Cancelar
          </button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'CalendarView',
  props: {
    events: {
      type: Array,
      default: () => []
    },
    dateField: {
      type: String,
      required: true
    },
    titleField: {
      type: String,
      required: true
    },
    availableFields: {
      type: [Object, Array],
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentDate: new Date(),
      selectedView: 'month',
      showEventModal: false,
      showEventForm: false,
      selectedEvent: null,
      editingEvent: null,
      eventForm: {
        title: '',
        date: '',
        time: '',
        color: '#007bff',
        data: {}
      },
      weekDays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    }
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
      })
    },
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const days = []
      const today = new Date()
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        const dayEvents = this.getEventsForDate(date)
        
        days.push({
          date: date,
          dayNumber: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          isToday: this.isSameDate(date, today),
          events: dayEvents
        })
      }
      
      return days
    }
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
      this.$emit('month-changed', this.currentDate.getFullYear(), this.currentDate.getMonth() + 1)
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
      this.$emit('month-changed', this.currentDate.getFullYear(), this.currentDate.getMonth() + 1)
    },
    goToToday() {
      this.currentDate = new Date()
    },
    selectDay(day) {
      this.eventForm.date = this.formatDateForInput(day.date)
      this.eventForm.time = ''
      this.eventForm.title = ''
      this.eventForm.data = {}
      this.editingEvent = null
      this.showEventForm = true
    },
    getEventsForDate(date) {
      console.log('🔍 Buscando eventos para fecha:', date.toDateString())
      console.log('📅 Eventos disponibles:', this.events.length)
      
      const dayEvents = this.events.filter(event => {
        const eventDate = new Date(event.date)
        const isSame = this.isSameDate(eventDate, date)
        console.log(`Evento "${event.title}" en ${event.date} - Mismo día: ${isSame}`)
        return isSame
      })
      
      console.log(`✅ Eventos encontrados para ${date.toDateString()}:`, dayEvents.length)
      return dayEvents
    },
    isSameDate(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    },
    isToday(date) {
      const today = new Date()
      return this.isSameDate(date, today)
    },
    getEventColor(event) {
      return event.color || '#007bff'
    },
    getEventTitle(event) {
      // Extraer solo el título principal (antes del paréntesis)
      const title = event.title || ''
      const parenthesisIndex = title.indexOf(' (')
      return parenthesisIndex > 0 ? title.substring(0, parenthesisIndex) : title
    },
    getEventSubtitle(event) {
      // Extraer los campos adicionales (dentro del paréntesis)
      const title = event.title || ''
      const startIndex = title.indexOf(' (')
      const endIndex = title.lastIndexOf(')')
      if (startIndex > 0 && endIndex > startIndex) {
        return title.substring(startIndex + 2, endIndex)
      }
      return ''
    },
    showEventDetails(event) {
      this.selectedEvent = event
      this.showEventModal = true
    },
    editEvent(event) {
      this.editingEvent = event
      this.eventForm = {
        title: event.title || '',
        date: this.formatDateForInput(new Date(event.date)),
        time: this.formatTimeForInput(new Date(event.date)),
        color: event.color || '#007bff',
        data: { ...event.data }
      }
      this.showEventModal = false
      this.showEventForm = true
    },
    deleteEvent(event) {
      if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
        this.$emit('delete-event', event)
        this.showEventModal = false
      }
    },
    saveEvent() {
      if (!this.eventForm.title || !this.eventForm.date) {
        alert('Por favor completa los campos requeridos')
        return
      }

      const eventData = {
        title: this.eventForm.title,
        date: this.combineDateTime(this.eventForm.date, this.eventForm.time),
        color: this.eventForm.color,
        data: this.eventForm.data
      }

      if (this.editingEvent) {
        this.$emit('update-event', { ...this.editingEvent, ...eventData })
      } else {
        this.$emit('add-event', eventData)
      }

      this.cancelEventForm()
    },
    cancelEventForm() {
      this.showEventForm = false
      this.editingEvent = null
      this.eventForm = {
        title: '',
        date: '',
        time: '',
        color: '#007bff',
        data: {}
      }
    },
    formatDateForInput(date) {
      return date.toISOString().split('T')[0]
    },
    formatTimeForInput(date) {
      return date.toTimeString().slice(0, 5)
    },
    combineDateTime(dateStr, timeStr) {
      const date = new Date(dateStr + 'T' + (timeStr || '00:00'))
      return date.toISOString()
    },
    formatFullDate(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatTime(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatFieldName(key) {
      return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    },
    getWeekDayEvents(dayName) {
      // Implementar para vista semanal
      return []
    },
    getDayNumber(dayName) {
      // Implementar para vista semanal
      return ''
    }
  }
}
</script>

<style scoped>
.calendar-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-nav {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.current-month {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-transform: capitalize;
}

.calendar-actions {
  display: flex;
  gap: 10px;
}

.btn-today {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-today:hover {
  background: rgba(255, 255, 255, 0.3);
}

.view-selector {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.view-selector option {
  background: #2d8a7a;
  color: white;
}

.calendar-grid {
  padding: 20px;
  position: relative;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.weekday {
  background: #f8f9fa;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.calendar-day {
  background: white;
  min-height: 130px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background: #f8f9fa;
}

.calendar-day.other-month {
  background: #f8f9fa;
  color: #adb5bd;
}

.calendar-day.today {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}

.calendar-day.has-events {
  background: #fff3cd;
}

.day-number {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  overflow: hidden;
}

.event-item {
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  margin-bottom: 2px;
  max-width: 100%;
  overflow: hidden;
}

.event-title {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1px;
}

.event-subtitle {
  font-size: 0.65rem;
  font-weight: 400;
  line-height: 1.1;
  opacity: 0.9;
}

.event-item:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.more-events {
  font-size: 0.7rem;
  color: #6c757d;
  text-align: center;
  margin-top: 2px;
  font-style: italic;
  background: #f8f9fa;
  padding: 1px 4px;
  border-radius: 3px;
}

.week-view {
  padding: 20px;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.weekday-header {
  background: #f8f9fa;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #495057;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  min-height: 400px;
}

.week-day {
  background: white;
  padding: 8px;
  min-height: 100px;
}

.week-day.today {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}

.week-day-number {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.week-event {
  padding: 4px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.week-event:hover {
  opacity: 0.8;
}

.event-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.event-time {
  font-size: 0.7rem;
  opacity: 0.9;
}

/* Modal styles */
.event-details {
  padding: 20px 0;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.event-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.event-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.event-date {
  margin: 0;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 5px;
}

.event-fields {
  margin-bottom: 20px;
}

.event-field {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.field-label {
  font-weight: 600;
  color: #495057;
}

.field-value {
  color: #6c757d;
}

.event-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-edit, .btn-delete, .btn-save, .btn-cancel {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.btn-edit {
  background: #17a2b8;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-save {
  background: #28a745;
  color: white;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-edit:hover, .btn-delete:hover, .btn-save:hover, .btn-cancel:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

/* Form styles */
.event-form {
  padding: 20px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}

.field-input {
  margin-bottom: 15px;
}

.field-input label {
  font-size: 0.9rem;
  color: #6c757d;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

/* Indicador de carga */
.calendar-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1b6659;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.calendar-loading p {
  color: #6c757d;
  font-weight: 500;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .calendar-controls {
    gap: 10px;
  }
  
  .current-month {
    font-size: 1.2rem;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 4px;
  }
  
  .day-number {
    font-size: 0.9rem;
  }
  
  .event-dot {
    width: 6px;
    height: 6px;
  }
}
</style> 