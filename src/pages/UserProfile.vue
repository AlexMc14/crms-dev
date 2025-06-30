<template>
  <div class="profile-container">
    <!-- Header con navegación -->
    <div class="profile-header">
      <div class="header-content">
        <button class="back-button" @click="$router.back()">
          <i class="ti-arrow-left"></i>
          Volver al listado
        </button>
        <h1 class="profile-title">{{ `Perfil de ${typeUser}` }}</h1>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="profile-content">
      <!-- Tarjeta de información principal -->
      <div class="main-info-card">
        <div class="user-avatar">
          <div class="avatar-circle">
            <span class="avatar-text">{{ user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U' }}</span>
          </div>
          <div class="user-status" :class="getStatusClass()">
            <span class="status-dot"></span>
            {{ getStatusText() }}
          </div>
        </div>
        
        <div class="user-info">
          <h2 class="user-name">{{ user.nombre }} {{ user.apellidos }}</h2>
          <p class="user-role">{{ getRoleText() }}</p>
          
          <div class="contact-info">
            <div class="contact-item">
              <i class="ti-mobile"></i>
              <span>{{ user.tel || 'No disponible' }}</span>
            </div>
            <div class="contact-item" v-if="user.email">
              <i class="ti-email"></i>
              <span>{{ user.email }}</span>
            </div>
          </div>
        </div>

        <!-- <div class="action-buttons">
          <button class="btn-primary" @click="wantAddBook()" v-if="cases.length > 0 && showCases">
            <i class="ti-calendar"></i>
            Añadir cita/juicio
          </button>
          <button class="btn-secondary" @click="showRemesa = true" v-if="cases.length > 0 && showCases && showAsSuperAdmin && isClient">
            <i class="ti-money"></i>
            Añadir remesa
          </button>
        </div> -->
      </div>

      <!-- Grid de información detallada -->
      <div class="info-grid">
        <!-- Información personal -->
        <div class="info-card personal-info">
          <div class="card-header">
            <i class="ti-user"></i>
            <h3>Información Personal</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Nombre completo:</span>
              <span class="value">{{ user.nombre }} {{ user.apellidos }}</span>
            </div>
            <div class="info-row" v-if="user.fechaNacimiento">
              <span class="label">Fecha de nacimiento:</span>
              <span class="value">{{ formatDate(user.fechaNacimiento) }}</span>
            </div>
            <div class="info-row" v-if="user.direccion">
              <span class="label">Dirección:</span>
              <span class="value">{{ user.direccion }}</span>
            </div>
            <div class="info-row" v-if="user.codigoPostal">
              <span class="label">Código postal:</span>
              <span class="value">{{ user.codigoPostal }}</span>
            </div>
            <div class="info-row" v-if="user.notas">
              <span class="label">Notas:</span>
              <span class="value">{{ user.notas }}</span>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="info-card stats-card">
          <div class="card-header">
            <i class="ti-stats-up"></i>
            <h3>Estadísticas</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">5</div>
              <div class="stat-label">Número total de visitas</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ totalRevenue }}€</div>
              <div class="stat-label">Coste del cliente</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ totalRevenue / visitHistory.length }}€</div>
              <div class="stat-label">Coste por visita</div>
            </div>
            <!-- <div class="stat-item">
              <div class="stat-number"></div>
              <div class="stat-label">Casos activos</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ completedCases }}</div>
              <div class="stat-label">Casos completados</div>
            </div> -->

          </div>
        </div>

        <!-- Histórico de visitas -->
        <div class="info-card visits-card">
          <div class="card-header">
            <i class="ti-calendar"></i>
            <h3>Histórico de Visitas</h3>
          </div>
          <div class="visits-list">
            <div v-for="(visit, index) in visitHistory" :key="index" class="visit-item">
              <div class="visit-date">
                <div class="date-day">{{ formatVisitDate(visit.fecha).day }}</div>
                <div class="date-month">{{ formatVisitDate(visit.fecha).month }}</div>
              </div>
              <div class="visit-details">
                <h4>{{ visit.tipo }}</h4>
                <p>{{ visit.descripcion }}</p>
                <span class="visit-status" :class="visit.status">{{ visit.status }}</span>
              </div>
              <div class="visit-time">{{ visit.hora }}</div>
            </div>
            <div v-if="visitHistory.length === 0" class="no-data">
              <i class="ti-calendar"></i>
              <p>No hay visitas registradas</p>
            </div>
          </div>
        </div>

        <!-- Histórico de compras -->
        <div class="info-card purchases-card">
          <div class="card-header">
            <i class="ti-shopping-cart"></i>
            <h3>Histórico de Compras</h3>
          </div>
          <div class="purchases-list">
            <div v-for="(purchase, index) in purchaseHistory" :key="index" class="purchase-item">
              <div class="purchase-icon">
                <i :class="getPurchaseIcon(purchase.tipo)"></i>
              </div>
              <div class="purchase-details">
                <h4>{{ purchase.producto }}</h4>
                <p>{{ purchase.descripcion }}</p>
                <div class="purchase-meta">
                  <span class="purchase-date">{{ formatDate(purchase.fecha) }}</span>
                  <span class="purchase-status" :class="purchase.status">{{ purchase.status }}</span>
                </div>
              </div>
              <div class="purchase-amount">
                <span class="amount">{{ purchase.precio }}€</span>
              </div>
            </div>
            <div v-if="purchaseHistory.length === 0" class="no-data">
              <i class="ti-shopping-cart"></i>
              <p>No hay compras registradas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Casos del usuario -->
      <!-- <div v-if="caseDetail === null && !gestionPermiso" class="cases-section">
        <div class="section-header">
          <h3>Casos Asignados</h3>
          <span class="case-count">{{ cases.length }} casos</span>
        </div>
        <casos-usuario v-if="cases.length > 0 && showCases" :cases="cases" @wantSeeCase="setCase" />
        <div v-else class="no-cases">
          <i class="ti-folder"></i>
          <p>No tiene casos asignados</p>
        </div>
      </div> -->

      <!-- Detalle del caso -->
      <div v-if="caseDetail !== null && !gestionPermiso" class="case-detail-section">
        <user-case :caseDetail="caseDetail" @back="caseDetail = null" :isClient="isClient" :userCase="userCase" :user="user" />
      </div>

      <!-- Gestión de permisos -->
      <div v-if="gestionPermiso" class="permissions-section">
        <gestion-permisos @back="gestionPermiso = false" :user="user" />
      </div>
    </div>

    <!-- Modales -->
    <b-modal v-model="showModalCita" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Añadir cita o juicio
      </template>
    </b-modal>

    <b-modal v-model="showRemesa" title="Nueva Remesa" hide-footer>
      <div class="mb-3">
        <label class="form-label">Remesas para: {{ user.nombre + user.apellidos }}</label>
      </div>
      <div class="mb-3">
        <label class="form-label">Fecha de Remesa</label>
        <input type="date" v-model="newRemesa.fecha" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Cantidad</label>
        <input type="number" v-model="newRemesa.cantidad" class="form-control" required>
      </div>
      <div class="row">
        <div class="col-12">Remesas creadas: </div>
        <div v-for="(remesa, index) in remesas" :key="index" class="col-12 mt-2">
          <b>{{ remesa.fecha }} - {{ remesa.cantidad }}€</b> 
          <i class="ti-trash" @click="remesas.splice(index, 1)"></i>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-12">
          <button @click="addRemesa()" class="btn btn-success">Añadir nueva fecha de remesa</button>
        </div>
        <div class="col-12 mt-5">
          <button @click="addAllRemesas()" class="btn btn-success">Guardar remesas</button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import UserCard from "./UserProfile/UserCard.vue";
import CasosUsuario from "./UserProfile/CasosUsuario.vue";
import UserCase from "./UserProfile/UserCase.vue";
import GestionPermisos from "./UserProfile/GestionPermisos.vue";
import { clientesService } from '@/services/api';

export default {
  components: {
    UserCard,
    CasosUsuario,
    UserCase,
    GestionPermisos,
  },
  data() {
    return {
      isClient: true,
      typeUser: 'cliente',
      user: {
        id: 'CLI001',
        nombre: 'María',
        apellidos: 'González López',
        tel: '+34 612 345 678',
        email: 'maria.gonzalez@email.com',
        fechaNacimiento: '1985-03-15',
        direccion: 'Calle Mayor 123, 2º A',
        codigoPostal: '28001',
        notas: 'Cliente preferente. Interesada en servicios de derecho laboral y familia.'
      },
      cases: [
        {
          id: '1',
          nombreCompleto: 'María González López',
          fechaAlta: '15/01/2024',
          estadoCaso: 'Presupuesto aceptado',
          especialidadNombre: 'Derecho Laboral',
          pago: 'Si Si Si'
        },
        {
          id: '2',
          nombreCompleto: 'María González López',
          fechaAlta: '20/02/2024',
          estadoCaso: 'Caso finalizado',
          especialidadNombre: 'Derecho de Familia',
          pago: 'Si Si Si'
        },
        {
          id: '3',
          nombreCompleto: 'María González López',
          fechaAlta: '10/03/2024',
          estadoCaso: 'Presupuesto pendiente',
          especialidadNombre: 'Derecho Civil',
          pago: 'No No No'
        }
      ],
      idUser: null,
      especialidades: [],
      caseDetail: null,
      userCase: null,
      showCases: true,
      gestionPermiso: false,
      showModalCita: false,
      userData: JSON.parse(localStorage.getItem('userInform')),
      newRemesa: {
        fecha: '',
        cantidad: '',
        idCliente: '',
        nombreCliente: ''
      },
      remesas: [],
      showRemesa: false,
      visitHistory: [
        {
          fecha: '2024-01-15',
          hora: '10:30',
          tipo: 'Consulta inicial',
          descripcion: 'Primera consulta para evaluación del caso de despido improcedente',
          status: 'completada'
        },
        {
          fecha: '2024-02-20',
          hora: '16:00',
          tipo: 'Seguimiento',
          descripcion: 'Revisión de documentos y avances en el proceso judicial',
          status: 'completada'
        },
        {
          fecha: '2024-03-10',
          hora: '11:15',
          tipo: 'Juicio',
          descripcion: 'Audiencia judicial para el caso de derecho laboral',
          status: 'pendiente'
        },
        {
          fecha: '2024-03-25',
          hora: '09:45',
          tipo: 'Consulta familiar',
          descripcion: 'Asesoramiento sobre proceso de divorcio',
          status: 'programada'
        },
        {
          fecha: '2024-04-05',
          hora: '14:30',
          tipo: 'Firma de documentos',
          descripcion: 'Firma de acuerdo de divorcio y documentos finales',
          status: 'programada'
        }
      ],
      purchaseHistory: [
        {
          fecha: '2024-01-15',
          producto: 'Consulta legal laboral',
          descripcion: 'Evaluación inicial del caso de despido improcedente',
          precio: 150,
          tipo: 'servicio',
          status: 'pagado'
        },
        {
          fecha: '2024-02-20',
          producto: 'Documentación judicial',
          descripcion: 'Preparación de demanda y documentos oficiales',
          precio: 300,
          tipo: 'documento',
          status: 'pagado'
        },
        {
          fecha: '2024-03-05',
          producto: 'Representación judicial',
          descripcion: 'Servicios de abogado en juicio laboral',
          precio: 800,
          tipo: 'servicio',
          status: 'pagado'
        },
        {
          fecha: '2024-03-15',
          producto: 'Consulta familiar',
          descripcion: 'Asesoramiento inicial sobre proceso de divorcio',
          precio: 120,
          tipo: 'consulta',
          status: 'pagado'
        },
        {
          fecha: '2024-03-20',
          producto: 'Acuerdo de divorcio',
          descripcion: 'Elaboración y negociación del acuerdo de divorcio',
          precio: 450,
          tipo: 'documento',
          status: 'pendiente'
        },
        {
          fecha: '2024-04-01',
          producto: 'Servicios notariales',
          descripcion: 'Gestión de documentos notariales para el divorcio',
          precio: 200,
          tipo: 'servicio',
          status: 'pendiente'
        }
      ]
    };
  },
  computed: {
    showAsSuperAdmin() {
      return this.userData && this.userData.superAdmin === true;
    },
    activeCases() {
      return this.cases.filter(c => c.estadoCaso.includes('pendiente') || c.estadoCaso.includes('aceptado')).length;
    },
    completedCases() {
      return this.cases.filter(c => c.estadoCaso.includes('finalizado')).length;
    },
    totalRevenue() {
      return this.purchaseHistory
        .filter(p => p.status === 'pagado')
        .reduce((total, p) => total + p.precio, 0);
    }
  },
  mounted() {
    this.idUser = this.$route.params.id;
    console.log('ID del usuario obtenido de la URL:', this.idUser);
    this.fetchUserData();
    this.fetchEspecialidades();
  },
  methods: {
    getStatusClass() {
      return 'status-client';
    },
    getStatusText() {
      return 'Cliente Activo';
    },
    getRoleText() {
      return 'Cliente del sistema';
    },
    formatVisitDate(dateString) {
      const date = new Date(dateString);
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      return {
        day: date.getDate(),
        month: months[date.getMonth()]
      };
    },
    getPurchaseIcon(tipo) {
      const icons = {
        servicio: 'ti-settings',
        documento: 'ti-file',
        producto: 'ti-package',
        consulta: 'ti-comments'
      };
      return icons[tipo] || 'ti-shopping-cart';
    },
    formatDate(date) {
      if (!date) return 'NA';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },
    async fetchEspecialidades() {
      // Datos inventados para especialidades
      this.especialidades = [
        { id: '1', nombre: 'Derecho Laboral' },
        { id: '2', nombre: 'Derecho de Familia' },
        { id: '3', nombre: 'Derecho Civil' },
        { id: '4', nombre: 'Derecho Mercantil' }
      ];
    },
    async fetchCases() {
      // Los casos ya están definidos arriba
      this.showCases = true;
    },
    async fetchUserData() {
      try {
        console.log('ID del usuario obtenido de la URL:', this.idUser);
        
        if (this.idUser) {
          // Obtener datos del usuario desde la API
          const response = await clientesService.getById(this.idUser);
          console.log('Datos del usuario obtenidos:', response);
          
          if (response) {
            this.user = {
              id: response._id || response.id,
              nombre: response.nombre || '',
              apellidos: response.apellidos || '',
              tel: response.telefono || response.tel || '',
              email: response.email || '',
              fechaNacimiento: response.fechaNacimiento || '',
              direccion: response.direccion || '',
              codigoPostal: response.codigoPostal || '',
              notas: response.notas || ''
            };
          }
        }
        
        this.fetchCases();
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        // En caso de error, mantener los datos de ejemplo
      }
    },
    async fetchEspe() {
      // Datos inventados para el especialista
      this.userCase = {
        nombre: 'Dr. Carlos',
        apellidos: 'Martínez Ruiz',
        tel: '+34 678 901 234',
        email: 'carlos.martinez@despacho.com',
        especialidad: 'Derecho Laboral'
      };
    },
    wantAddBook() {
      this.showModalCita = true;
    },
    setCase(item) {
      this.caseDetail = item;
      this.fetchEspe();
    },
    addRemesa() {
      this.newRemesa.idCliente = this.user.id;
      this.newRemesa.nombreCliente = this.user.nombre + this.user.apellidos;
      this.newRemesa.pagado = false;
      this.remesas.push({...this.newRemesa});
      this.newRemesa = {
        fecha: '',
        cantidad: '',
        idCliente: this.user.id,
        nombreCliente: this.user.nombre + this.user.apellidos
      };
    },
    async addAllRemesas() {
      if (this.remesas.length === 0) return;
      // Simular guardado exitoso
      console.log('Remesas guardadas:', this.remesas);
      this.showRemesa = false;
      this.newRemesa = {
        fecha: '',
        cantidad: '',
        idCliente: this.user.id,
        nombreCliente: this.user.nombre + ' '+ this.user.apellidos
      };
      this.remesas = [];
    }
  }
};
</script>

<style scoped>
/* Contenedor principal */
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  padding: 0;
}

/* Header */
.profile-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
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

.profile-title {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
}

/* Contenido principal */
.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Tarjeta de información principal */
.main-info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 30px;
  position: relative;
  overflow: hidden;
}

.main-info-card::before {
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

.user-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(27, 102, 89, 0.3);
  position: relative;
}

.avatar-text {
  color: white;
  font-size: 36px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.user-status {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-client .status-dot { background: #1b6659; }
.status-specialist .status-dot { background: #2d8a7a; }
.status-admin .status-dot { background: #ff6b6b; }

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 5px 0;
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
}

.user-role {
  margin: 0 0 20px 0;
  color: #7f8c8d;
  font-size: 16px;
  font-weight: 500;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #34495e;
  font-weight: 500;
}

.contact-item i {
  color: #1b6659;
  font-size: 18px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-shrink: 0;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #2d8a7a 0%, #45b7d1 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(45, 138, 122, 0.3);
}

.btn-primary:hover, .btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}

/* Grid de información */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(27, 102, 89, 0.1);
}

.card-header i {
  font-size: 24px;
  color: #1b6659;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

/* Información personal */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(27, 102, 89, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #7f8c8d;
  font-size: 14px;
}

.value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(27, 102, 89, 0.05) 0%, rgba(45, 138, 122, 0.05) 100%);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, rgba(27, 102, 89, 0.1) 0%, rgba(45, 138, 122, 0.1) 100%);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1b6659;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

/* Histórico de visitas */
.visits-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.visit-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(27, 102, 89, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.visit-item:hover {
  background: rgba(27, 102, 89, 0.08);
  transform: translateX(5px);
}

.visit-date {
  text-align: center;
  min-width: 60px;
}

.date-day {
  font-size: 24px;
  font-weight: 700;
  color: #1b6659;
  line-height: 1;
}

.date-month {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 500;
}

.visit-details {
  flex: 1;
}

.visit-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.visit-details p {
  margin: 0 0 8px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.visit-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.visit-status.completada {
  background: rgba(27, 102, 89, 0.2);
  color: #1b6659;
}

.visit-status.pendiente {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.visit-status.programada {
  background: rgba(45, 138, 122, 0.2);
  color: #2d8a7a;
}

.visit-time {
  color: #7f8c8d;
  font-weight: 500;
  font-size: 14px;
}

/* Histórico de compras */
.purchases-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.purchase-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(27, 102, 89, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.purchase-item:hover {
  background: rgba(27, 102, 89, 0.08);
  transform: translateX(5px);
}

.purchase-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.purchase-details {
  flex: 1;
}

.purchase-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.purchase-details p {
  margin: 0 0 8px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.purchase-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

.purchase-date {
  color: #7f8c8d;
  font-size: 12px;
  font-weight: 500;
}

.purchase-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.purchase-status.pagado {
  background: rgba(27, 102, 89, 0.2);
  color: #1b6659;
}

.purchase-status.pendiente {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.purchase-amount {
  text-align: right;
}

.amount {
  font-size: 18px;
  font-weight: 700;
  color: #1b6659;
}

/* Sección de casos */
.cases-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(27, 102, 89, 0.1);
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.case-count {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

/* Estados vacíos */
.no-data, .no-cases {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.no-data i, .no-cases i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
  color: #bdc3c7;
}

.no-data p, .no-cases p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .main-info-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .visit-item, .purchase-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .profile-title {
    font-size: 24px;
  }
}
</style>
