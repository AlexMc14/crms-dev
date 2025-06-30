<template>
  <div class="agenda-container">
    <!-- Header con navegación -->
    <div class="agenda-header">
      <div class="header-content">
        <button class="back-button" @click="$router.back()">
          <i class="ti-arrow-left"></i>
          Volver al dashboard
        </button>
        <h1 class="agenda-title">Agenda de Citas</h1>
        <div class="view-controls">
          <button 
            class="view-btn" 
            :class="{ active: currentView === 'week' }"
            @click="currentView = 'week'"
          >
            <i class="ti-calendar"></i>
            Semana
          </button>
          <button 
            class="view-btn" 
            :class="{ active: currentView === 'month' }"
            @click="currentView = 'month'"
          >
            <i class="ti-calendar"></i>
            Mes
          </button>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="agenda-content">
      <!-- Controles de navegación -->
      <div class="navigation-controls">
        <button class="nav-btn" @click="previousPeriod">
          <i class="ti-arrow-left"></i>
        </button>
        <h2 class="period-title">{{ periodTitle }}</h2>
        <button class="nav-btn" @click="nextPeriod">
          <i class="ti-arrow-right"></i>
        </button>
        <button class="today-btn" @click="goToToday">
          Hoy
        </button>
      </div>

      <!-- Vista Semanal -->
      <div v-if="currentView === 'week'" class="week-view">
        <div class="week-header">
          <div class="time-column-header"></div>
          <div 
            v-for="day in weekDays" 
            :key="day.date" 
            class="day-header"
            :class="{ today: day.isToday }"
          >
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ day.date }}</div>
          </div>
        </div>

        <div class="week-grid">
          <div class="time-slots">
            <div 
              v-for="hour in businessHours" 
              :key="hour" 
              class="time-slot"
            >
              {{ formatHour(hour) }}
            </div>
          </div>

          <div class="week-columns">
            <div 
              v-for="day in weekDays" 
              :key="day.fullDate" 
              class="day-column"
            >
              <div 
                v-for="hour in businessHours" 
                :key="hour" 
                class="time-cell"
                @click="openAppointmentModal(day.fullDate, hour)"
              >
                <div 
                  class="appointments-container"
                  :class="{ multiple: getAppointmentsForDayAndHour(day.fullDate, hour).length > 1 }"
                >
                  <div 
                    v-for="appointment in getAppointmentsForDayAndHour(day.fullDate, hour)"
                    :key="appointment.id"
                    class="appointment-card"
                    :class="appointment.status"
                    @click.stop="openAppointmentDetail(appointment)"
                  >
                    <div class="appointment-time">{{ appointment.hora }}</div>
                    <div class="appointment-client">{{ appointment.cliente }}</div>
                    <div class="appointment-service">{{ appointment.tipoServicio }}</div>
                    <div class="appointment-employee">{{ appointment.empleado }}</div>
                    <div class="appointment-status" :class="appointment.status">
                      {{ getStatusText(appointment.status) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Mensual -->
      <div v-if="currentView === 'month'" class="month-view">
        <div class="month-grid">
          <div 
            v-for="day in monthDays" 
            :key="day.date" 
            class="month-day"
            :class="{ 
              today: day.isToday, 
              otherMonth: day.otherMonth,
              hasAppointments: getAppointmentsForDay(day.fullDate).length > 0
            }"
            @click="openDayView(day.fullDate)"
          >
            <div class="day-number">{{ day.dayNumber }}</div>
            <div class="appointments-preview">
              <div 
                v-for="status in ['confirmada', 'pendiente', 'cancelada', 'completada']"
                :key="status"
                class="appointment-count"
                :class="status"
                v-if="getAppointmentsByStatus(day.fullDate, status).length > 0"
              >
                {{ getAppointmentsByStatus(day.fullDate, status).length }}
              </div>
              <div v-if="getAppointmentsForDay(day.fullDate).length === 0" class="no-appointments">
                -
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalle de cita -->
    <b-modal v-model="showAppointmentDetail" title="Detalle de Cita" size="lg" hide-footer>
      <div v-if="selectedAppointment" class="appointment-detail">
        <div class="detail-section">
          <h4><i class="ti-user"></i> Cliente</h4>
          <p>{{ selectedAppointment.cliente }}</p>
        </div>
        <div class="detail-section">
          <h4><i class="ti-calendar"></i> Fecha y Hora</h4>
          <p>{{ formatDateTime(selectedAppointment.fecha, selectedAppointment.hora) }}</p>
        </div>
        <div class="detail-section">
          <h4><i class="ti-settings"></i> Tipo de Servicio</h4>
          <p>{{ selectedAppointment.tipoServicio }}</p>
        </div>
        <div class="detail-section">
          <h4><i class="ti-user"></i> Empleado Asignado</h4>
          <p>{{ selectedAppointment.empleado }}</p>
        </div>
        <div class="detail-section">
          <h4><i class="ti-flag"></i> Estado</h4>
          <span class="status-badge" :class="selectedAppointment.status">
            {{ getStatusText(selectedAppointment.status) }}
          </span>
        </div>
        <div class="detail-section" v-if="selectedAppointment.notas">
          <h4><i class="ti-comment"></i> Notas Internas</h4>
          <p>{{ selectedAppointment.notas }}</p>
        </div>
        <div class="detail-actions">
          <button class="btn-edit" @click="editAppointment">
            <i class="ti-pencil"></i> Editar
          </button>
          <button class="btn-delete" @click="deleteAppointment">
            <i class="ti-trash"></i> Eliminar
          </button>
        </div>
      </div>
    </b-modal>

    <!-- Modal para nueva cita -->
    <b-modal v-model="showNewAppointment" title="Nueva Cita" size="lg" hide-footer>
      <div class="new-appointment-form">
        <div class="form-row">
          <div class="form-group">
            <label>Cliente</label>
            <input type="text" v-model="newAppointment.cliente" class="form-control" placeholder="Nombre del cliente">
          </div>
          <div class="form-group">
            <label>Fecha</label>
            <input type="date" v-model="newAppointment.fecha" class="form-control">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Hora</label>
            <input type="time" v-model="newAppointment.hora" class="form-control">
          </div>
          <div class="form-group">
            <label>Tipo de Servicio</label>
            <select v-model="newAppointment.tipoServicio" class="form-control">
              <option value="">Seleccionar servicio</option>
              <option value="Consulta inicial">Consulta inicial</option>
              <option value="Seguimiento">Seguimiento</option>
              <option value="Juicio">Juicio</option>
              <option value="Firma de documentos">Firma de documentos</option>
              <option value="Reunión">Reunión</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Empleado Asignado</label>
            <select v-model="newAppointment.empleado" class="form-control">
              <option value="">Seleccionar empleado</option>
              <option value="Dr. Carlos Martínez">Dr. Carlos Martínez</option>
              <option value="Dra. Ana García">Dra. Ana García</option>
              <option value="Dr. Luis Rodríguez">Dr. Luis Rodríguez</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select v-model="newAppointment.status" class="form-control">
              <option value="confirmada">Confirmada</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Notas Internas</label>
          <textarea v-model="newAppointment.notas" class="form-control" rows="3" placeholder="Notas adicionales..."></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showNewAppointment = false">Cancelar</button>
          <button class="btn-save" @click="saveAppointment">Guardar Cita</button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";

export default {
  setup() {
    const currentView = ref('week');
    const currentDate = ref(new Date());
    const showAppointmentDetail = ref(false);
    const showNewAppointment = ref(false);
    const selectedAppointment = ref(null);
    const selectedDate = ref(null);
    const selectedHour = ref(null);

    // Datos de ejemplo para las citas
    const appointments = ref([
      {
        id: 1,
        cliente: 'María González López',
        fecha: '2024-01-15',
        hora: '10:30',
        tipoServicio: 'Consulta inicial',
        empleado: 'Dr. Carlos Martínez',
        status: 'confirmada',
        notas: 'Cliente interesado en caso de despido improcedente'
      },
      {
        id: 2,
        cliente: 'Juan Pérez García',
        fecha: '2024-01-15',
        hora: '14:00',
        tipoServicio: 'Seguimiento',
        empleado: 'Dra. Ana García',
        status: 'pendiente',
        notas: 'Revisión de documentos del caso de familia'
      },
      {
        id: 3,
        cliente: 'Carmen Ruiz Martín',
        fecha: '2024-01-16',
        hora: '09:00',
        tipoServicio: 'Juicio',
        empleado: 'Dr. Luis Rodríguez',
        status: 'confirmada',
        notas: 'Audiencia judicial - Juzgado de lo Social'
      },
      {
        id: 4,
        cliente: 'Pedro Sánchez López',
        fecha: '2024-01-16',
        hora: '16:30',
        tipoServicio: 'Firma de documentos',
        empleado: 'Dr. Carlos Martínez',
        status: 'completada',
        notas: 'Firma de acuerdo de divorcio'
      },
      {
        id: 5,
        cliente: 'Isabel Moreno Jiménez',
        fecha: '2024-01-17',
        hora: '11:15',
        tipoServicio: 'Reunión',
        empleado: 'Dra. Ana García',
        status: 'cancelada',
        notas: 'Cliente canceló por motivos personales'
      }
    ]);

    // Función para generar datos de ejemplo con fechas actuales
    const generateSampleData = () => {
      const today = new Date();
      const currentWeekStart = getStartOfWeek(today);
      
      const sampleAppointments = [
        {
          id: 1,
          cliente: 'María González López',
          fecha: formatDateForAPI(currentWeekStart),
          hora: '10:30',
          tipoServicio: 'Consulta inicial',
          empleado: 'Dr. Carlos Martínez',
          status: 'confirmada',
          notas: 'Cliente interesado en caso de despido improcedente'
        },
        {
          id: 2,
          cliente: 'Juan Pérez García',
          fecha: formatDateForAPI(currentWeekStart),
          hora: '14:00',
          tipoServicio: 'Seguimiento',
          empleado: 'Dra. Ana García',
          status: 'pendiente',
          notas: 'Revisión de documentos del caso de familia'
        },
        {
          id: 3,
          cliente: 'Carmen Ruiz Martín',
          fecha: formatDateForAPI(new Date(currentWeekStart.getTime() + 24 * 60 * 60 * 1000)), // +1 día
          hora: '09:00',
          tipoServicio: 'Juicio',
          empleado: 'Dr. Luis Rodríguez',
          status: 'confirmada',
          notas: 'Audiencia judicial - Juzgado de lo Social'
        },
        {
          id: 4,
          cliente: 'Pedro Sánchez López',
          fecha: formatDateForAPI(new Date(currentWeekStart.getTime() + 24 * 60 * 60 * 1000)), // +1 día
          hora: '16:30',
          tipoServicio: 'Firma de documentos',
          empleado: 'Dr. Carlos Martínez',
          status: 'completada',
          notas: 'Firma de acuerdo de divorcio'
        },
        {
          id: 5,
          cliente: 'Isabel Moreno Jiménez',
          fecha: formatDateForAPI(new Date(currentWeekStart.getTime() + 2 * 24 * 60 * 60 * 1000)), // +2 días
          hora: '11:15',
          tipoServicio: 'Reunión',
          empleado: 'Dra. Ana García',
          status: 'cancelada',
          notas: 'Cliente canceló por motivos personales'
        },
        {
          id: 6,
          cliente: 'Roberto Fernández',
          fecha: formatDateForAPI(new Date(currentWeekStart.getTime() + 3 * 24 * 60 * 60 * 1000)), // +3 días
          hora: '08:00',
          tipoServicio: 'Consulta inicial',
          empleado: 'Dr. Carlos Martínez',
          status: 'confirmada',
          notas: 'Primera consulta sobre herencia'
        },
        {
          id: 7,
          cliente: 'Laura Martínez',
          fecha: formatDateForAPI(new Date(currentWeekStart.getTime() + 4 * 24 * 60 * 60 * 1000)), // +4 días
          hora: '15:45',
          tipoServicio: 'Seguimiento',
          empleado: 'Dra. Ana García',
          status: 'pendiente',
          notas: 'Revisión de documentos de divorcio'
        },
        // CITAS EN LA MISMA HORA - Lunes 10:30
        {
          id: 8,
          cliente: 'Ana López Silva',
          fecha: formatDateForAPI(currentWeekStart),
          hora: '10:30',
          tipoServicio: 'Consulta familiar',
          empleado: 'Dra. Ana García',
          status: 'confirmada',
          notas: 'Consulta sobre custodia de menores'
        },
        // CITAS EN LA MISMA HORA - Martes 09:00
        {
          id: 9,
          cliente: 'Miguel Torres Vega',
          fecha: formatDateForAPI(new Date(currentWeekStart.getTime() + 24 * 60 * 60 * 1000)),
          hora: '09:00',
          tipoServicio: 'Seguimiento laboral',
          empleado: 'Dr. Carlos Martínez',
          status: 'pendiente',
          notas: 'Revisión de expediente de accidente laboral'
        },
        // CITAS EN LA MISMA HORA - Miércoles 11:15
        {
          id: 10,
          cliente: 'Sofía Ramírez',
          fecha: formatDateForAPI(new Date(currentWeekStart.getTime() + 2 * 24 * 60 * 60 * 1000)),
          hora: '11:15',
          tipoServicio: 'Firma de documentos',
          empleado: 'Dr. Luis Rodríguez',
          status: 'confirmada',
          notas: 'Firma de contrato de arrendamiento'
        },
        // CITAS EN LA MISMA HORA - Jueves 08:00
        {
          id: 11,
          cliente: 'Carlos Mendoza',
          fecha: formatDateForAPI(new Date(currentWeekStart.getTime() + 3 * 24 * 60 * 60 * 1000)),
          hora: '08:00',
          tipoServicio: 'Juicio',
          empleado: 'Dra. Ana García',
          status: 'confirmada',
          notas: 'Audiencia de divorcio contencioso'
        },
        // CITAS EN LA MISMA HORA - Viernes 15:45
        {
          id: 12,
          cliente: 'Elena Castro',
          fecha: formatDateForAPI(new Date(currentWeekStart.getTime() + 4 * 24 * 60 * 60 * 1000)),
          hora: '15:45',
          tipoServicio: 'Consulta inicial',
          empleado: 'Dr. Luis Rodríguez',
          status: 'pendiente',
          notas: 'Primera consulta sobre derecho mercantil'
        }
      ];
      
      appointments.value = sampleAppointments;
    };

    const newAppointment = ref({
      cliente: '',
      fecha: '',
      hora: '',
      tipoServicio: '',
      empleado: '',
      status: 'pendiente',
      notas: ''
    });

    // Horas de trabajo - Mostrar todas las 24 horas
    const businessHours = Array.from({ length: 24 }, (_, i) => i); // 0:00 - 23:00

    // Computed properties
    const periodTitle = computed(() => {
      if (currentView.value === 'week') {
        const startOfWeek = getStartOfWeek(currentDate.value);
        const endOfWeek = getEndOfWeek(currentDate.value);
        return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
      } else {
        return formatMonth(currentDate.value);
      }
    });

    const weekDays = computed(() => {
      const startOfWeek = getStartOfWeek(currentDate.value);
      const days = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        
        days.push({
          name: formatDayName(date),
          date: formatDayDate(date),
          fullDate: formatDateForAPI(date),
          isToday: isToday(date)
        });
      }
      
      return days;
    });

    const monthDays = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startOfMonth = new Date(firstDay);
      const endOfMonth = new Date(lastDay);
      
      // Ajustar para que la semana empiece en lunes
      const startOfWeek = new Date(startOfMonth);
      const dayOfWeek = startOfMonth.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
      
      const days = [];
      const currentDay = new Date(startOfWeek);
      
      while (currentDay <= endOfMonth || currentDay.getDay() !== 1) {
        days.push({
          dayNumber: currentDay.getDate(),
          fullDate: formatDateForAPI(currentDay),
          isToday: isToday(currentDay),
          otherMonth: currentDay.getMonth() !== month
        });
        
        currentDay.setDate(currentDay.getDate() + 1);
      }
      
      return days;
    });

    // Funciones auxiliares
    const getStartOfWeek = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };

    const getEndOfWeek = (date) => {
      const start = getStartOfWeek(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return end;
    };

    const formatDate = (date) => {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    const formatMonth = (date) => {
      return date.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
      });
    };

    const formatDayName = (date) => {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    };

    const formatDayDate = (date) => {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    };

    const formatDateForAPI = (date) => {
      return date.toISOString().split('T')[0];
    };

    const formatHour = (hour) => {
      return `${hour.toString().padStart(2, '0')}:00`;
    };

    const formatDateTime = (date, time) => {
      return `${formatDate(new Date(date))} a las ${time}`;
    };

    const isToday = (date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    const getStatusText = (status) => {
      const statusMap = {
        confirmada: 'Confirmada',
        pendiente: 'Pendiente',
        cancelada: 'Cancelada',
        completada: 'Completada'
      };
      return statusMap[status] || status;
    };

    const getAppointmentsForDayAndHour = (date, hour) => {
      return appointments.value.filter(app => {
        const appHour = parseInt(app.hora.split(':')[0]);
        return app.fecha === date && appHour === hour;
      });
    };

    const getAppointmentsForDay = (date) => {
      return appointments.value.filter(app => app.fecha === date);
    };

    const getAppointmentsByStatus = (date, status) => {
      return appointments.value.filter(app => app.fecha === date && app.status === status);
    };

    // Funciones de navegación
    const previousPeriod = () => {
      console.log('Navegando a período anterior');
      if (currentView.value === 'week') {
        const newDate = new Date(currentDate.value);
        newDate.setDate(newDate.getDate() - 7);
        currentDate.value = newDate;
        console.log('Nueva fecha (semana anterior):', currentDate.value);
      } else {
        const newDate = new Date(currentDate.value);
        newDate.setMonth(newDate.getMonth() - 1);
        currentDate.value = newDate;
        console.log('Nueva fecha (mes anterior):', currentDate.value);
      }
    };

    const nextPeriod = () => {
      console.log('Navegando a período siguiente');
      if (currentView.value === 'week') {
        const newDate = new Date(currentDate.value);
        newDate.setDate(newDate.getDate() + 7);
        currentDate.value = newDate;
        console.log('Nueva fecha (semana siguiente):', currentDate.value);
      } else {
        const newDate = new Date(currentDate.value);
        newDate.setMonth(newDate.getMonth() + 1);
        currentDate.value = newDate;
        console.log('Nueva fecha (mes siguiente):', currentDate.value);
      }
    };

    const goToToday = () => {
      console.log('Navegando a hoy');
      currentDate.value = new Date();
      console.log('Nueva fecha (hoy):', currentDate.value);
    };

    // Funciones de citas
    const openAppointmentModal = (date, hour) => {
      selectedDate.value = date;
      selectedHour.value = hour;
      newAppointment.value.fecha = date;
      newAppointment.value.hora = `${hour}:00`;
      showNewAppointment.value = true;
    };

    const openAppointmentDetail = (appointment) => {
      selectedAppointment.value = appointment;
      showAppointmentDetail.value = true;
    };

    const openDayView = (date) => {
      // Cambiar a vista semanal y navegar al día específico
      currentView.value = 'week';
      const targetDate = new Date(date);
      currentDate.value = targetDate;
    };

    const editAppointment = () => {
      // Implementar edición
      console.log('Editar cita:', selectedAppointment.value);
    };

    const deleteAppointment = () => {
      if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
        const index = appointments.value.findIndex(app => app.id === selectedAppointment.value.id);
        if (index > -1) {
          appointments.value.splice(index, 1);
          showAppointmentDetail.value = false;
        }
      }
    };

    const saveAppointment = () => {
      if (newAppointment.value.cliente && newAppointment.value.fecha && newAppointment.value.hora) {
        const newApp = {
          id: Date.now(),
          ...newAppointment.value
        };
        appointments.value.push(newApp);
        
        // Reset form
        newAppointment.value = {
          cliente: '',
          fecha: '',
          hora: '',
          tipoServicio: '',
          empleado: '',
          status: 'pendiente',
          notas: ''
        };
        
        showNewAppointment.value = false;
      }
    };

    onMounted(() => {
      // Inicializar con la fecha actual
      currentDate.value = new Date();
      // Generar datos de ejemplo con fechas actuales
      generateSampleData();
    });

    return {
      currentView,
      currentDate,
      showAppointmentDetail,
      showNewAppointment,
      selectedAppointment,
      appointments,
      newAppointment,
      businessHours,
      periodTitle,
      weekDays,
      monthDays,
      previousPeriod,
      nextPeriod,
      goToToday,
      openAppointmentModal,
      openAppointmentDetail,
      openDayView,
      editAppointment,
      deleteAppointment,
      saveAppointment,
      getAppointmentsForDayAndHour,
      getAppointmentsForDay,
      getAppointmentsByStatus,
      formatHour,
      formatDateTime,
      getStatusText,
      generateSampleData
    };
  }
};
</script>

<style scoped>
/* Contenedor principal */
.agenda-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  padding: 0;
}

/* Header */
.agenda-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.back-button {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.3);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}

.agenda-title {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
}

.view-controls {
  display: flex;
  gap: 10px;
}

.view-btn {
  background: rgba(27, 102, 89, 0.1);
  color: #1b6659;
  border: 2px solid transparent;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-btn.active {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.3);
}

.view-btn:hover {
  transform: translateY(-2px);
}

/* Contenido principal */
.agenda-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Controles de navegación */
.navigation-controls {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.nav-btn {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.3);
}

.nav-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}

.period-title {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  min-width: 200px;
  text-align: center;
}

.today-btn {
  background: linear-gradient(135deg, #2d8a7a 0%, #45b7d1 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(45, 138, 122, 0.3);
}

.today-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 138, 122, 0.4);
}

/* Vista Semanal */
.week-view {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  padding: 15px 0;
}

.time-column-header {
  padding: 10px;
  text-align: center;
  font-weight: 600;
}

.day-header {
  padding: 10px;
  text-align: center;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.day-header.today {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin: 0 5px;
}

.day-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
}

.day-date {
  font-size: 12px;
  opacity: 0.9;
}

.week-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  max-height: 800px;
  overflow-y: auto;
}

.time-slots {
  background: rgba(27, 102, 89, 0.05);
  position: sticky;
  left: 0;
  z-index: 10;
}

.time-slot {
  height: 40px;
  padding: 8px;
  text-align: center;
  font-size: 11px;
  color: #7f8c8d;
  font-weight: 500;
  border-bottom: 1px solid rgba(27, 102, 89, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
}

.week-columns {
  display: contents;
}

.day-column {
  border-left: 1px solid rgba(27, 102, 89, 0.1);
}

.time-cell {
  height: 40px;
  padding: 3px;
  border-bottom: 1px solid rgba(27, 102, 89, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.time-cell:hover {
  background: rgba(27, 102, 89, 0.05);
}

/* Contenedor para múltiples citas */
.appointments-container {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
  height: 100%;
}

.appointments-container.multiple {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}

.appointment-card {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 9px;
  margin-bottom: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(27, 102, 89, 0.3);
  max-height: 35px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

/* Cuando hay múltiples citas, mostrar en 2 columnas */
.appointments-container.multiple .appointment-card {
  max-height: 18px;
  font-size: 8px;
  padding: 2px 4px;
}

.appointments-container.multiple .appointment-time {
  font-size: 7px;
}

.appointments-container.multiple .appointment-client {
  font-size: 7px;
}

.appointments-container.multiple .appointment-service {
  font-size: 6px;
}

.appointments-container.multiple .appointment-employee {
  font-size: 6px;
}

.appointments-container.multiple .appointment-status {
  font-size: 5px;
}

.appointment-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(27, 102, 89, 0.4);
  max-height: none;
  z-index: 20;
  position: relative;
}

.appointment-card.confirmada {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}

.appointment-card.pendiente {
  background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%);
}

.appointment-card.cancelada {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.appointment-card.completada {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.appointment-time {
  font-weight: 600;
  margin-bottom: 1px;
  font-size: 8px;
}

.appointment-client {
  font-weight: 500;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 8px;
}

.appointment-service {
  font-size: 7px;
  opacity: 0.9;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-employee {
  font-size: 7px;
  opacity: 0.8;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-status {
  font-size: 6px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.9;
}

/* Vista Mensual */
.month-view {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(27, 102, 89, 0.1);
}

.month-day {
  background: white;
  min-height: 120px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.month-day:hover {
  background: rgba(27, 102, 89, 0.05);
  transform: scale(1.02);
}

.month-day.today {
  background: linear-gradient(135deg, rgba(27, 102, 89, 0.1) 0%, rgba(45, 138, 122, 0.1) 100%);
  border: 2px solid #1b6659;
}

.month-day.otherMonth {
  background: rgba(189, 195, 199, 0.1);
  color: #bdc3c7;
}

.month-day.hasAppointments {
  background: rgba(27, 102, 89, 0.05);
}

.day-number {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.appointments-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
}

.appointment-count {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  margin: 1px;
  text-align: center;
  min-width: 16px;
  line-height: 1.2;
}

.appointment-count.confirmada {
  background: rgba(39, 174, 96, 0.2);
  color: #27ae60;
}

.appointment-count.pendiente {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.appointment-count.cancelada {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.appointment-count.completada {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.no-appointments {
  color: #bdc3c7;
  font-size: 12px;
  text-align: center;
  font-style: italic;
}

/* Modales */
.appointment-detail {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(27, 102, 89, 0.1);
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h4 {
  color: #1b6659;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section p {
  color: #2c3e50;
  margin: 0;
  font-size: 14px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.confirmada {
  background: rgba(39, 174, 96, 0.2);
  color: #27ae60;
}

.status-badge.pendiente {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.status-badge.cancelada {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.status-badge.completada {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.detail-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-edit, .btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
}

.btn-delete {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.btn-edit:hover, .btn-delete:hover {
  transform: translateY(-2px);
}

/* Formulario nueva cita */
.new-appointment-form {
  padding: 20px 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-control {
  padding: 12px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}

.form-control::placeholder {
  color: #bdc3c7;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-cancel, .btn-save {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: rgba(189, 195, 199, 0.2);
  color: #7f8c8d;
}

.btn-save {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.3);
}

.btn-cancel:hover, .btn-save:hover {
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .view-controls {
    width: 100%;
    justify-content: center;
  }
  
  .navigation-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .week-grid {
    grid-template-columns: 60px repeat(7, 1fr);
    font-size: 9px;
    max-height: 600px;
  }
  
  .time-slot {
    height: 30px;
    font-size: 9px;
    padding: 4px;
  }
  
  .time-cell {
    height: 30px;
    padding: 2px;
  }
  
  .appointment-card {
    font-size: 7px;
    padding: 2px 4px;
    max-height: 25px;
  }
  
  .appointment-time {
    font-size: 6px;
  }
  
  .appointment-client {
    font-size: 6px;
  }
  
  .appointment-service {
    font-size: 5px;
  }
  
  .appointment-employee {
    font-size: 5px;
  }
  
  .appointment-status {
    font-size: 4px;
  }
  
  .month-grid {
    grid-template-columns: repeat(7, 1fr);
  }
  
  .month-day {
    min-height: 60px;
    padding: 3px;
  }
  
  .day-number {
    font-size: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
