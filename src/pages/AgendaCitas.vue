<template>
  <div class="agenda-citas-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-calendar"></i>
          Agenda y Citas
        </h1>
        <p class="page-subtitle">Gestiona tus citas y agenda de manera eficiente</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <div class="options-grid">
        <!-- Opción: Listado de Citas -->
        <div class="option-card" @click="goToListadoCitas">
          <div class="card-icon">
            <i class="ti-list"></i>
          </div>
          <div class="card-content">
            <h3>Listado de Citas</h3>
            <p>Visualiza y gestiona todas las citas programadas en formato de lista</p>
            <div class="card-stats">
              <span class="stat-item">
                <i class="ti-calendar"></i>
                {{ totalCitas }} citas totales
              </span>
              <span class="stat-item">
                <i class="ti-clock"></i>
                {{ citasHoy }} citas hoy
              </span>
            </div>
          </div>
          <div class="card-arrow">
            <i class="ti-arrow-right"></i>
          </div>
        </div>

        <!-- Opción: Agenda -->
        <div class="option-card" @click="goToAgenda">
          <div class="card-icon">
            <i class="ti-calendar"></i>
          </div>
          <div class="card-content">
            <h3>Agenda</h3>
            <p>Visualiza las citas en formato de calendario semanal y mensual</p>
            <div class="card-stats">
              <span class="stat-item">
                <i class="ti-calendar"></i>
                Vista semanal y mensual
              </span>
              <span class="stat-item">
                <i class="ti-time"></i>
                Gestión por horas
              </span>
            </div>
          </div>
          <div class="card-arrow">
            <i class="ti-arrow-right"></i>
          </div>
        </div>
      </div>

      <!-- Resumen rápido -->
      <div class="quick-summary">
        <h3>Resumen Rápido</h3>
        <div class="summary-grid">
          <div class="summary-card confirmadas">
            <div class="summary-icon">
              <i class="ti-check"></i>
            </div>
            <div class="summary-content">
              <div class="summary-number">{{ citasConfirmadas }}</div>
              <div class="summary-label">Confirmadas</div>
            </div>
          </div>
          <div class="summary-card pendientes">
            <div class="summary-icon">
              <i class="ti-time"></i>
            </div>
            <div class="summary-content">
              <div class="summary-number">{{ citasPendientes }}</div>
              <div class="summary-label">Pendientes</div>
            </div>
          </div>
          <div class="summary-card canceladas">
            <div class="summary-icon">
              <i class="ti-close"></i>
            </div>
            <div class="summary-content">
              <div class="summary-number">{{ citasCanceladas }}</div>
              <div class="summary-label">Canceladas</div>
            </div>
          </div>
          <div class="summary-card completadas">
            <div class="summary-icon">
              <i class="ti-check-box"></i>
            </div>
            <div class="summary-content">
              <div class="summary-number">{{ citasCompletadas }}</div>
              <div class="summary-label">Completadas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    
    // Datos de ejemplo para las estadísticas
    const appointments = ref([
      {
        id: 1,
        cliente: 'María González López',
        fecha: '2024-01-15',
        hora: '10:30',
        status: 'confirmada'
      },
      {
        id: 2,
        cliente: 'Juan Pérez García',
        fecha: '2024-01-15',
        hora: '14:00',
        status: 'pendiente'
      },
      {
        id: 3,
        cliente: 'Carmen Ruiz Martín',
        fecha: '2024-01-16',
        hora: '09:00',
        status: 'confirmada'
      },
      {
        id: 4,
        cliente: 'Pedro Sánchez López',
        fecha: '2024-01-16',
        hora: '16:30',
        status: 'completada'
      },
      {
        id: 5,
        cliente: 'Isabel Moreno Jiménez',
        fecha: '2024-01-17',
        hora: '11:15',
        status: 'cancelada'
      }
    ]);

    // Computed properties para estadísticas
    const totalCitas = computed(() => appointments.value.length);
    
    const citasHoy = computed(() => {
      const today = new Date().toISOString().split('T')[0];
      return appointments.value.filter(app => app.fecha === today).length;
    });

    const citasConfirmadas = computed(() => {
      return appointments.value.filter(app => app.status === 'confirmada').length;
    });

    const citasPendientes = computed(() => {
      return appointments.value.filter(app => app.status === 'pendiente').length;
    });

    const citasCanceladas = computed(() => {
      return appointments.value.filter(app => app.status === 'cancelada').length;
    });

    const citasCompletadas = computed(() => {
      return appointments.value.filter(app => app.status === 'completada').length;
    });

    // Funciones de navegación
    const goToListadoCitas = () => {
      router.push('/listado-citas');
    };

    const goToAgenda = () => {
      router.push('/agenda');
    };

    onMounted(() => {
      // Aquí podrías cargar datos reales desde tu API
      console.log('Agenda y Citas - Página cargada');
    });

    return {
      totalCitas,
      citasHoy,
      citasConfirmadas,
      citasPendientes,
      citasCanceladas,
      citasCompletadas,
      goToListadoCitas,
      goToAgenda
    };
  }
};
</script>

<style scoped>
.agenda-citas-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  padding: 0;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 40px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.page-title {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 36px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.page-title i {
  color: #1b6659;
  font-size: 40px;
}

.page-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 18px;
  font-weight: 500;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.option-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 25px;
  position: relative;
  overflow: hidden;
}

.option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1b6659, #2d8a7a, #45b7d1, #96ceb4);
  background-size: 200% 100%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.option-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
}

.card-content p {
  margin: 0 0 15px 0;
  color: #7f8c8d;
  font-size: 16px;
  line-height: 1.5;
}

.card-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #34495e;
  font-size: 14px;
  font-weight: 500;
}

.stat-item i {
  color: #1b6659;
  font-size: 16px;
}

.card-arrow {
  color: #1b6659;
  font-size: 24px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.option-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(5px);
}

.quick-summary {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.quick-summary h3 {
  margin: 0 0 25px 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: scale(1.05);
}

.summary-card.confirmadas {
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%);
  border: 2px solid rgba(39, 174, 96, 0.2);
}

.summary-card.pendientes {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(241, 196, 15, 0.1) 100%);
  border: 2px solid rgba(243, 156, 18, 0.2);
}

.summary-card.canceladas {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
  border: 2px solid rgba(231, 76, 60, 0.2);
}

.summary-card.completadas {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.1) 100%);
  border: 2px solid rgba(52, 152, 219, 0.2);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.summary-card.confirmadas .summary-icon {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}

.summary-card.pendientes .summary-icon {
  background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%);
}

.summary-card.canceladas .summary-icon {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.summary-card.completadas .summary-icon {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.summary-content {
  flex: 1;
}

.summary-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 5px;
}

.summary-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 600;
  text-transform: uppercase;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }
  
  .page-title i {
    font-size: 32px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .option-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .summary-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style> 