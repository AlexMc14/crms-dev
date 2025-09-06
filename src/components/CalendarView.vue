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
      title="Detalles del Registro"
      size="lg"
      hide-footer
    >
      <div v-if="selectedEvent" class="event-details">
        <div class="event-fields">
          <!-- <div v-for="(value, key) in getRegistroData(selectedEvent)" :key="`registro-${key}`" class="event-field">
            <label class="field-label">{{ formatFieldName(key) }}:</label>
            <span class="field-value">{{ formatFieldValue(value, key) }}</span>
          </div> -->
          
          <!-- Mostrar valores desglosados -->
          <div v-if="getRegistroValues(selectedEvent)" class="field-section">
            <!-- <h6 class="section-title">Valores del Registro</h6> -->
            <div v-for="(value, key) in getRegistroValues(selectedEvent)" :key="`valor-${key}`" class="event-field">
              <label class="field-label">{{ formatFieldName(key) }}:</label>
              <span class="field-value">{{ value }}</span>
            </div>
          </div>
        </div>

        <div class="event-actions">
          <!-- <button class="btn-edit" @click="editEvent(selectedEvent)">
            <i class="ti-pencil"></i> Editar
          </button> -->
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
        <div class="form-group" v-for="columna in getAvailableColumns()" :key="columna.nombre">
          <label :for="`modal-${columna.nombre}`" class="form-label">
            {{ formatFieldName(columna.nombre) }}
          </label>
          
          <!-- Input de texto -->
          <input
            v-if="columna.tipo === 'texto' || columna.tipo === 'email'"
            :id="`modal-${columna.nombre}`"
            type="text"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
            :placeholder="'Ingrese ' + formatFieldName(columna.nombre)"
          >
          
          <!-- Input de fecha -->
          <input
            v-else-if="columna.tipo === 'fecha'"
            :id="`modal-${columna.nombre}`"
            type="date"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
          >
          
          <!-- Input de teléfono -->
          <input
            v-else-if="columna.tipo === 'telefono'"
            :id="`modal-${columna.nombre}`"
            type="tel"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
            :placeholder="'Ingrese ' + formatFieldName(columna.nombre)"
          >
          
          <!-- Input de correo -->
          <input
            v-else-if="columna.tipo === 'correo'"
            :id="`modal-${columna.nombre}`"
            type="email"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
            :placeholder="'Ingrese ' + formatFieldName(columna.nombre)"
          >
          
          <!-- Input de enlace -->
          <input
            v-else-if="columna.tipo === 'enlace'"
            :id="`modal-${columna.nombre}`"
            type="url"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
            :placeholder="'Ingrese ' + formatFieldName(columna.nombre)"
          >
          
          <!-- Textarea -->
          <textarea
            v-else-if="columna.tipo === 'textarea'"
            :id="`modal-${columna.nombre}`"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
            :placeholder="'Ingrese ' + formatFieldName(columna.nombre)"
            rows="3"
            style="resize: vertical; min-height: 60px;"
          ></textarea>
          
          <!-- Select -->
          <select
            v-else-if="columna.tipo === 'select'"
            :id="`modal-${columna.nombre}`"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
          >
            <option value="">Selecciona una opción</option>
            <option 
              v-for="opcion in columna.opciones" 
              :key="opcion" 
              :value="opcion"
            >
              {{ opcion }}
            </option>
          </select>
          
          <!-- Input numérico -->
          <input
            v-else-if="columna.tipo === 'numero'"
            :id="`modal-${columna.nombre}`"
            type="number"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
            :placeholder="'Ingrese ' + formatFieldName(columna.nombre)"
          >
          
          <!-- Campo de archivo -->
          <div v-else-if="columna.tipo === 'archivo'" class="file-upload-container">
            <input
              type="file"
              class="form-control"
              multiple
              @change="handleFileUpload($event, columna.nombre)"
            >
            <small class="text-muted">Selecciona archivos para subir</small>
          </div>
          
          <!-- Campo relacional -->
          <input
            v-else-if="columna.tipo === 'relacional'"
            :id="`modal-${columna.nombre}`"
            type="text"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
            :placeholder="'Buscar en ' + columna.seccionRelacionada"
          >
          
          <!-- Campo por defecto (texto) -->
          <input
            v-else
            :id="`modal-${columna.nombre}`"
            type="text"
            class="form-control"
            v-model="eventForm.data[columna.nombre]"
            :placeholder="'Ingrese ' + formatFieldName(columna.nombre)"
          >
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
    columns: {
      type: Array,
      default: () => []
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
      console.log('🔍 selectDay - Day:', day.date)
      
      // Inicializar todos los campos disponibles con valores vacíos
      this.eventForm.data = {}
      this.getAvailableColumns().forEach(columna => {
        const nombreCampo = typeof columna === 'string' ? columna : columna.nombre
        const tipoCampo = typeof columna === 'string' ? 'texto' : columna.tipo
        
        // Si es el campo de fecha, usar la fecha seleccionada
        if (nombreCampo === this.dateField) {
          this.eventForm.data[nombreCampo] = this.formatDateForInput(day.date)
        } else {
          // Inicializar según el tipo de campo
          if (tipoCampo === 'archivo') {
            this.eventForm.data[nombreCampo] = []
          } else if (tipoCampo === 'numero') {
            this.eventForm.data[nombreCampo] = null
          } else {
            this.eventForm.data[nombreCampo] = ''
          }
        }
      })
      
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
      console.log('🎯 showEventDetails - Event:', event)
      this.selectedEvent = event
      this.showEventModal = true
    },
    editEvent(event) {
      this.editingEvent = event
      
      // Inicializar todos los campos disponibles
      const data = {}
      this.getAvailableColumns().forEach(columna => {
        const nombreCampo = typeof columna === 'string' ? columna : columna.nombre
        const tipoCampo = typeof columna === 'string' ? 'texto' : columna.tipo
        
        // Inicializar según el tipo de campo
        if (tipoCampo === 'archivo') {
          data[nombreCampo] = event.data && event.data[nombreCampo] ? event.data[nombreCampo] : []
        } else if (tipoCampo === 'numero') {
          data[nombreCampo] = event.data && event.data[nombreCampo] ? event.data[nombreCampo] : null
        } else {
          data[nombreCampo] = event.data && event.data[nombreCampo] ? event.data[nombreCampo] : ''
        }
      })
      
      this.eventForm = {
        data
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
      // Validar que al menos haya algún campo con valor
      const hasValues = Object.values(this.eventForm.data).some(value => 
        value !== '' && value !== null && value !== undefined && 
        (Array.isArray(value) ? value.length > 0 : true)
      )
      
      if (!hasValues) {
        alert('Por favor completa al menos un campo')
        return
      }

      // Construir el objeto de datos con todos los campos
      const eventData = {
        data: { ...this.eventForm.data }
      }

      console.log('💾 Guardando evento:', eventData)

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
      
      // Inicializar todos los campos disponibles con valores vacíos
      const data = {}
      this.getAvailableColumns().forEach(columna => {
        const nombreCampo = typeof columna === 'string' ? columna : columna.nombre
        const tipoCampo = typeof columna === 'string' ? 'texto' : columna.tipo
        
        // Inicializar según el tipo de campo
        if (tipoCampo === 'archivo') {
          data[nombreCampo] = []
        } else if (tipoCampo === 'numero') {
          data[nombreCampo] = null
        } else {
          data[nombreCampo] = ''
        }
      })
      
      this.eventForm = {
        data
      }
    },
    formatDateForInput(date) {
      console.log(date)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}`
      console.log(formattedDate)
      return formattedDate
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
    getAvailableFieldNames() {
      if (!this.availableFields) return []
      
      if (Array.isArray(this.availableFields)) {
        return this.availableFields
      } else if (typeof this.availableFields === 'object') {
        return Object.keys(this.availableFields)
      }
      
      return []
    },
    getAvailableColumns() {
      if (!this.columns || !Array.isArray(this.columns)) return []
      
      // Mostrar TODAS las columnas, igual que en la tabla
      return this.columns
    },
    handleFileUpload(event, fieldName) {
      const files = Array.from(event.target.files)
      if (files.length > 0) {
        // Por ahora, solo guardamos los nombres de los archivos
        // En una implementación completa, aquí se subirían los archivos
        this.eventForm.data[fieldName] = files.map(file => file.name)
      }
    },
    formatFieldName(key) {
      if (typeof key !== 'string') {
        console.warn('formatFieldName recibió un valor que no es string:', key)
        return String(key)
      }
      return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    },
    formatFieldValue(value, key) {
      if (value === null || value === undefined) return '-'
      
      // Formatear fechas
      if (key === 'createdAt' || key === 'updatedAt') {
        return new Date(value).toLocaleString('es-ES')
      }
      
      // Formatear objetos (excepto valores que son objetos simples)
      if (typeof value === 'object' && value !== null) {
        // Si es el objeto valores, mostrar cada campo por separado
        if (key === 'valores') {
          return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')
        }
        // Para otros objetos, mostrar como JSON formateado
        return JSON.stringify(value, null, 2)
      }
      
      // Formatear valores booleanos
      if (typeof value === 'boolean') {
        return value ? 'Sí' : 'No'
      }
      
      // Formatear números
      if (typeof value === 'number') {
        return value.toLocaleString('es-ES')
      }
      
      // Para strings, devolver tal como están
      return String(value)
    },
    getRegistroValues(event) {
      console.log('🔍 getRegistroValues - Event:', event)
      
      // Buscar el registro en diferentes ubicaciones posibles
      let registro = null
      if (event && event.registro) {
        registro = event.registro
      } else if (event && event.data && event.data.registro) {
        registro = event.data.registro
      }
      
      if (!registro) {
        console.log('❌ No hay registro:', { event, registro })
        return {}
      }
      
      console.log('📊 Registro encontrado:', registro)
      
      // Buscar el registro anidado
      let registroAnidado = null
      if (registro.registro) {
        registroAnidado = registro.registro
        console.log('✅ Encontrado registro anidado')
      }
      
      if (!registroAnidado || !registroAnidado.valores) {
        console.log('❌ No hay registro anidado o valores:', { registro, registroAnidado })
        return {}
      }
      
      const valores = registroAnidado.valores
      console.log('📊 Valores del registro anidado:', valores)
      
      // Devolver directamente los valores
      return valores
    },
    
    getRegistroData(event) {
      console.log('🔍 getRegistroData - Event:', event)
      
      // Buscar el registro en diferentes ubicaciones posibles
      let registro = null
      if (event && event.registro) {
        registro = event.registro
      } else if (event && event.data && event.data.registro) {
        registro = event.data.registro
      }
      
      if (!registro) {
        console.log('❌ No hay registro:', { event, registro })
        return {}
      }
      
      console.log('📊 Registro encontrado:', registro)
      
      // Buscar el registro anidado
      let registroAnidado = null
      if (registro.registro) {
        registroAnidado = registro.registro
        console.log('✅ Encontrado registro anidado para metadata')
      }
      
      if (!registroAnidado) {
        console.log('❌ No hay registro anidado')
        return {}
      }
      
      // Solo devolver los campos del registro anidado (excluyendo valores)
      const registroData = {}
      
      // Agregar campos del registro anidado (excluyendo valores que se muestran por separado)
      Object.entries(registroAnidado).forEach(([key, value]) => {
        if (key !== 'valores' && value !== null && value !== undefined) {
          registroData[key] = value
        }
      })
      
      console.log('✅ Datos del registro:', registroData)
      return registroData
    },
    
    getRelevantEventFields(event) {
      if (!event || !event.registro) return {}
      
      // Mostrar solo el contenido del atributo 'registro'
      const registro = event.registro
      const relevantFields = {}
      
      // Agregar campos del registro
      if (registro._id) relevantFields['ID'] = registro._id
      if (registro.seccionId) relevantFields['ID Sección'] = registro.seccionId
      if (registro.__v !== undefined) relevantFields['Versión'] = registro.__v
      if (registro.createdAt) relevantFields['Fecha Creación'] = registro.createdAt
      if (registro.updatedAt) relevantFields['Fecha Actualización'] = registro.updatedAt
      
      // Agregar valores del registro
      if (registro.valores && typeof registro.valores === 'object') {
        Object.entries(registro.valores).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            relevantFields[key] = value
          }
        })
      }
      
      return relevantFields
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

.event-fields {
  margin-bottom: 20px;
}

.field-section {
  margin-bottom: 25px;
}

.field-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
  font-size: 1rem;
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