<template>
  <div class="seguridad-permisos-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-shield"></i>
          Seguridad / Permisos
        </h1>
        <p class="page-subtitle">Control de accesos, actividad y configuración de seguridad</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Tabs de navegación -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Tab: Registro de Actividad -->
      <div v-if="activeTab === 'actividad'" class="tab-content">
        <div class="section-header">
          <h2>Registro de Actividad</h2>
          <div class="filters">
            <select v-model="filtroUsuario" class="filter-select">
              <option value="">Todos los usuarios</option>
              <option v-for="user in usuarios" :key="user.id" :value="user.nombre">
                {{ user.nombre }}
              </option>
            </select>
            <select v-model="filtroAccion" class="filter-select">
              <option value="">Todas las acciones</option>
              <option value="login">Inicio de sesión</option>
              <option value="logout">Cierre de sesión</option>
              <option value="create">Crear</option>
              <option value="update">Actualizar</option>
              <option value="delete">Eliminar</option>
            </select>
            <button @click="exportarActividad" class="btn-export">
              <i class="ti-download"></i> Exportar
            </button>
          </div>
        </div>
        
        <div class="activity-table">
          <table class="main-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Módulo</th>
                <th>Detalles</th>
                <th>IP</th>
                <th>Fecha/Hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="actividad in actividadesFiltradas" :key="actividad.id">
                <td>
                  <div class="user-info">
                    <i class="ti-user"></i>
                    {{ actividad.usuario }}
                  </div>
                </td>
                <td>
                  <span :class="`action-badge action-${actividad.accion}`">
                    {{ actividad.accion }}
                  </span>
                </td>
                <td>{{ actividad.modulo }}</td>
                <td>{{ actividad.detalles }}</td>
                <td>{{ actividad.ip }}</td>
                <td>{{ formatDateTime(actividad.fecha) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Control de Accesos -->
      <div v-if="activeTab === 'accesos'" class="tab-content">
        <div class="section-header">
          <h2>Control de Accesos por Rol</h2>
          <button @click="openRolForm()" class="btn-add">
            <i class="ti-plus"></i> Nuevo Rol
          </button>
        </div>
        
        <div class="roles-grid">
          <div v-for="rol in roles" :key="rol.id" class="rol-card">
            <div class="rol-header">
              <h3>{{ rol.nombre }}</h3>
              <div class="rol-actions">
                <button @click="openRolForm(rol)" class="btn-edit-small">
                  <i class="ti-pencil"></i>
                </button>
                <button @click="deleteRol(rol.id)" class="btn-delete-small">
                  <i class="ti-trash"></i>
                </button>
              </div>
            </div>
            <div class="rol-description">{{ rol.descripcion }}</div>
            <div class="rol-permissions">
              <h4>Permisos:</h4>
              <div class="permissions-list">
                <div v-for="permiso in rol.permisos" :key="permiso" class="permission-item">
                  <i class="ti-check"></i>
                  {{ permiso }}
                </div>
              </div>
            </div>
            <div class="rol-users">
              <small>{{ rol.usuarios }} usuarios asignados</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Copias de Seguridad -->
      <div v-if="activeTab === 'backups'" class="tab-content">
        <div class="section-header">
          <h2>Copias de Seguridad</h2>
          <button @click="crearBackupManual" class="btn-add">
            <i class="ti-download"></i> Crear Backup Manual
          </button>
        </div>
        
        <div class="backup-config">
          <div class="config-card">
            <h3>Configuración Automática</h3>
            <div class="config-item">
              <label>Frecuencia:</label>
              <select v-model="configBackup.frecuencia">
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
            <div class="config-item">
              <label>Hora:</label>
              <input v-model="configBackup.hora" type="time" />
            </div>
            <div class="config-item">
              <label>Retener backups:</label>
              <select v-model="configBackup.retener">
                <option value="7">7 días</option>
                <option value="30">30 días</option>
                <option value="90">90 días</option>
              </select>
            </div>
            <button @click="guardarConfigBackup" class="btn-save-config">
              Guardar Configuración
            </button>
          </div>
        </div>
        
        <div class="backups-list">
          <h3>Backups Disponibles</h3>
          <div class="backup-item" v-for="backup in backups" :key="backup.id">
            <div class="backup-info">
              <div class="backup-name">{{ backup.nombre }}</div>
              <div class="backup-details">
                <span>{{ backup.tamaño }}</span>
                <span>{{ formatDateTime(backup.fecha) }}</span>
              </div>
            </div>
            <div class="backup-actions">
              <button @click="descargarBackup(backup)" class="btn-download">
                <i class="ti-download"></i>
              </button>
              <button @click="restaurarBackup(backup)" class="btn-restore">
                <i class="ti-reload"></i>
              </button>
              <button @click="deleteBackup(backup.id)" class="btn-delete">
                <i class="ti-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Configuración de Sesión -->
      <div v-if="activeTab === 'sesion'" class="tab-content">
        <div class="section-header">
          <h2>Configuración de Sesión</h2>
        </div>
        
        <div class="session-config">
          <div class="config-card">
            <h3>Cierre de Sesión por Inactividad</h3>
            <div class="config-item">
              <label>Tiempo de inactividad (minutos):</label>
              <input v-model.number="configSesion.inactividad" type="number" min="5" max="480" />
            </div>
            <div class="config-item">
              <label>Mostrar advertencia antes de cerrar:</label>
              <input v-model.number="configSesion.advertencia" type="number" min="1" max="10" />
              <span class="config-help">minutos antes</span>
            </div>
            <div class="config-item">
              <label>Forzar cierre de sesión al cerrar navegador:</label>
              <input v-model="configSesion.forzarCierre" type="checkbox" />
            </div>
            <button @click="guardarConfigSesion" class="btn-save-config">
              Guardar Configuración
            </button>
          </div>
          
          <div class="config-card">
            <h3>Seguridad Adicional</h3>
            <div class="config-item">
              <label>Requerir cambio de contraseña cada:</label>
              <select v-model="configSesion.cambioPassword">
                <option value="0">Nunca</option>
                <option value="30">30 días</option>
                <option value="90">90 días</option>
                <option value="180">180 días</option>
              </select>
            </div>
            <div class="config-item">
              <label>Máximo intentos de login:</label>
              <input v-model.number="configSesion.maxIntentos" type="number" min="3" max="10" />
            </div>
            <div class="config-item">
              <label>Bloquear cuenta tras intentos fallidos:</label>
              <input v-model.number="configSesion.tiempoBloqueo" type="number" min="5" max="60" />
              <span class="config-help">minutos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para formulario de rol -->
      <div v-if="showRolForm" class="modal-form-overlay">
        <div class="modal-form">
          <h2>{{ formRol.id ? 'Editar' : 'Nuevo' }} Rol</h2>
          <form @submit.prevent="saveRol">
            <div class="form-group">
              <label>Nombre del Rol</label>
              <input v-model="formRol.nombre" required />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea v-model="formRol.descripcion" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Permisos</label>
              <div class="permissions-grid">
                <label v-for="permiso in permisosDisponibles" :key="permiso.id" class="permission-checkbox">
                  <input 
                    type="checkbox" 
                    :value="permiso.nombre"
                    v-model="formRol.permisos"
                  />
                  <span>{{ permiso.nombre }}</span>
                  <small>{{ permiso.descripcion }}</small>
                </label>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeRolForm">Cancelar</button>
              <button type="submit" class="btn-save">Guardar Rol</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const activeTab = ref('actividad');

const tabs = [
  { id: 'actividad', name: 'Registro de Actividad', icon: 'ti-list' },
  { id: 'accesos', name: 'Control de Accesos', icon: 'ti-lock' },
  { id: 'backups', name: 'Copias de Seguridad', icon: 'ti-download' },
  { id: 'sesion', name: 'Configuración de Sesión', icon: 'ti-time' }
];

// Datos de actividad
const actividades = ref([
  {
    id: 1,
    usuario: 'Ana López',
    accion: 'login',
    modulo: 'Sistema',
    detalles: 'Inicio de sesión exitoso',
    ip: '192.168.1.100',
    fecha: '2024-01-20T10:30:00'
  },
  {
    id: 2,
    usuario: 'Carlos Ruiz',
    accion: 'create',
    modulo: 'Facturación',
    detalles: 'Creó factura FAC-2024-003',
    ip: '192.168.1.101',
    fecha: '2024-01-20T09:15:00'
  },
  {
    id: 3,
    usuario: 'María García',
    accion: 'update',
    modulo: 'Clientes',
    detalles: 'Actualizó datos del cliente Juan Pérez',
    ip: '192.168.1.102',
    fecha: '2024-01-20T08:45:00'
  }
]);

const usuarios = ref([
  { id: 1, nombre: 'Ana López' },
  { id: 2, nombre: 'Carlos Ruiz' },
  { id: 3, nombre: 'María García' }
]);

const filtroUsuario = ref('');
const filtroAccion = ref('');

const actividadesFiltradas = computed(() => {
  return actividades.value.filter(actividad => {
    const matchUsuario = !filtroUsuario.value || actividad.usuario === filtroUsuario.value;
    const matchAccion = !filtroAccion.value || actividad.accion === filtroAccion.value;
    return matchUsuario && matchAccion;
  });
});

// Datos de roles
const roles = ref([
  {
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Acceso completo al sistema',
    permisos: ['Acceso total', 'Gestión usuarios', 'Configuración sistema', 'Backups'],
    usuarios: 2
  },
  {
    id: 2,
    nombre: 'Usuario',
    descripcion: 'Acceso básico a módulos principales',
    permisos: ['Ver clientes', 'Crear facturas', 'Ver reportes'],
    usuarios: 5
  },
  {
    id: 3,
    nombre: 'Técnico',
    descripcion: 'Acceso a módulos técnicos',
    permisos: ['Gestión servicios', 'Ver empleados', 'Reportes técnicos'],
    usuarios: 3
  }
]);

const permisosDisponibles = ref([
  { id: 1, nombre: 'Acceso total', descripcion: 'Control completo del sistema' },
  { id: 2, nombre: 'Gestión usuarios', descripcion: 'Crear, editar y eliminar usuarios' },
  { id: 3, nombre: 'Configuración sistema', descripcion: 'Modificar configuraciones' },
  { id: 4, nombre: 'Backups', descripcion: 'Gestionar copias de seguridad' },
  { id: 5, nombre: 'Ver clientes', descripcion: 'Acceso de lectura a clientes' },
  { id: 6, nombre: 'Crear facturas', descripcion: 'Generar nuevas facturas' },
  { id: 7, nombre: 'Ver reportes', descripcion: 'Acceso a reportes básicos' },
  { id: 8, nombre: 'Gestión servicios', descripcion: 'Administrar servicios/productos' },
  { id: 9, nombre: 'Ver empleados', descripcion: 'Acceso de lectura a empleados' },
  { id: 10, nombre: 'Reportes técnicos', descripcion: 'Acceso a reportes avanzados' }
]);

// Datos de backups
const backups = ref([
  {
    id: 1,
    nombre: 'backup_2024_01_20_10_00.sql',
    tamaño: '45.2 MB',
    fecha: '2024-01-20T10:00:00',
    tipo: 'automático'
  },
  {
    id: 2,
    nombre: 'backup_2024_01_19_10_00.sql',
    tamaño: '44.8 MB',
    fecha: '2024-01-19T10:00:00',
    tipo: 'automático'
  },
  {
    id: 3,
    nombre: 'backup_manual_2024_01_18.sql',
    tamaño: '44.5 MB',
    fecha: '2024-01-18T15:30:00',
    tipo: 'manual'
  }
]);

const configBackup = ref({
  frecuencia: 'diario',
  hora: '02:00',
  retener: '30'
});

const configSesion = ref({
  inactividad: 30,
  advertencia: 5,
  forzarCierre: true,
  cambioPassword: '90',
  maxIntentos: 5,
  tiempoBloqueo: 15
});

// Estados de formularios
const showRolForm = ref(false);
const formRol = ref({
  id: null,
  nombre: '',
  descripcion: '',
  permisos: []
});

function formatDateTime(dateTime) {
  return new Date(dateTime).toLocaleString('es-ES');
}

function exportarActividad() {
  alert('Exportando registro de actividad...');
}

function openRolForm(rol = null) {
  if (rol) {
    formRol.value = { ...rol, permisos: [...rol.permisos] };
  } else {
    formRol.value = {
      id: null,
      nombre: '',
      descripcion: '',
      permisos: []
    };
  }
  showRolForm.value = true;
}

function closeRolForm() {
  showRolForm.value = false;
}

function saveRol() {
  if (formRol.value.id) {
    const idx = roles.value.findIndex(r => r.id === formRol.value.id);
    if (idx !== -1) {
      roles.value[idx] = { ...formRol.value, permisos: [...formRol.value.permisos] };
    }
  } else {
    formRol.value.id = Date.now();
    roles.value.push({ ...formRol.value, permisos: [...formRol.value.permisos] });
  }
  showRolForm.value = false;
}

function deleteRol(rolId) {
  if (confirm('¿Seguro que quieres eliminar este rol?')) {
    roles.value = roles.value.filter(r => r.id !== rolId);
  }
}

function crearBackupManual() {
  alert('Creando backup manual...');
}

function guardarConfigBackup() {
  alert('Configuración de backup guardada');
}

function descargarBackup(backup) {
  alert(`Descargando backup: ${backup.nombre}`);
}

function restaurarBackup(backup) {
  if (confirm(`¿Seguro que quieres restaurar el backup: ${backup.nombre}?`)) {
    alert('Restaurando backup...');
  }
}

function deleteBackup(backupId) {
  if (confirm('¿Seguro que quieres eliminar este backup?')) {
    backups.value = backups.value.filter(b => b.id !== backupId);
  }
}

function guardarConfigSesion() {
  alert('Configuración de sesión guardada');
}
</script>

<style scoped>
.seguridad-permisos-container {
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

.tabs-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.tabs-header {
  display: flex;
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
}

.tab-button {
  flex: 1;
  background: none;
  border: none;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  color: #7f8c8d;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  background: rgba(27, 102, 89, 0.1);
  color: #1b6659;
}

.tab-button.active {
  background: rgba(27, 102, 89, 0.1);
  color: #1b6659;
  border-bottom-color: #1b6659;
}

.tab-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  margin: 0;
  color: #1b6659;
  font-size: 24px;
}

.filters {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.btn-export, .btn-add {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-export:hover, .btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}

.main-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.main-table th, .main-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.main-table th {
  background: #f5f5f5;
  color: #1b6659;
  font-weight: 700;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
}

.action-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.action-login {
  background: #d4edda;
  color: #155724;
}

.action-logout {
  background: #f8d7da;
  color: #721c24;
}

.action-create {
  background: #cce5ff;
  color: #004085;
}

.action-update {
  background: #fff3cd;
  color: #856404;
}

.action-delete {
  background: #f8d7da;
  color: #721c24;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.rol-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.rol-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.rol-header h3 {
  margin: 0;
  color: #1b6659;
  font-size: 18px;
}

.rol-actions {
  display: flex;
  gap: 8px;
}

.btn-edit-small, .btn-delete-small {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-edit-small {
  color: #1b6659;
}

.btn-delete-small {
  color: #e74c3c;
}

.btn-edit-small:hover {
  color: #2d8a7a;
}

.btn-delete-small:hover {
  color: #c0392b;
}

.rol-description {
  color: #7f8c8d;
  margin-bottom: 15px;
  font-size: 14px;
}

.rol-permissions h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #2c3e50;
}

.permission-item i {
  color: #27ae60;
  font-size: 12px;
}

.rol-users {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  color: #7f8c8d;
}

.backup-config, .session-config {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.config-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.config-card h3 {
  margin: 0 0 20px 0;
  color: #1b6659;
  font-size: 18px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.config-item label {
  min-width: 200px;
  font-weight: 600;
  color: #2c3e50;
}

.config-item input, .config-item select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.config-help {
  color: #7f8c8d;
  font-size: 12px;
}

.btn-save-config {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 15px;
}

.backups-list h3 {
  margin: 0 0 20px 0;
  color: #1b6659;
  font-size: 18px;
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.backup-info {
  flex: 1;
}

.backup-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.backup-details {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #7f8c8d;
}

.backup-actions {
  display: flex;
  gap: 8px;
}

.btn-download, .btn-restore, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 6px;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-download {
  color: #1b6659;
}

.btn-restore {
  color: #3498db;
}

.btn-delete {
  color: #e74c3c;
}

.btn-download:hover {
  color: #2d8a7a;
}

.btn-restore:hover {
  color: #2980b9;
}

.btn-delete:hover {
  color: #c0392b;
}

.modal-form-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-form {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  min-width: 500px;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.modal-form h2 {
  margin-top: 0;
  color: #1b6659;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}

.permissions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
}

.permission-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 13px;
}

.permission-checkbox:hover {
  background: rgba(27, 102, 89, 0.1);
}

.permission-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #1b6659;
  margin-top: 2px;
}

.permission-checkbox span {
  font-weight: 600;
  color: #2c3e50;
}

.permission-checkbox small {
  display: block;
  color: #7f8c8d;
  font-size: 11px;
  margin-top: 2px;
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

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }
  .page-title i {
    font-size: 32px;
  }
  .main-content {
    padding: 20px 5px;
  }
  .tabs-header {
    flex-direction: column;
  }
  .tab-button {
    border-bottom: none;
    border-right: 3px solid transparent;
  }
  .tab-button.active {
    border-bottom: none;
    border-right-color: #1b6659;
  }
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  .filters {
    flex-direction: column;
  }
  .backup-config, .session-config {
    grid-template-columns: 1fr;
  }
  .config-item {
    flex-direction: column;
    align-items: stretch;
  }
  .backup-item {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  .modal-form {
    min-width: 90vw;
    padding: 20px 10px;
  }
  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style> 