<template>
  <div class="empleados-usuarios-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-user"></i>
          Empleados / Usuarios
        </h1>
        <p class="page-subtitle">Gestión de personal, roles y accesos al sistema</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Tabla de empleados/usuarios -->
      <div class="table-section">
        <div class="table-header">
          <h2>Listado</h2>
          <button class="btn-add" @click="openForm()">
            <i class="ti-plus"></i> Nuevo
          </button>
        </div>
        <table class="main-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>email</th>
              <th>Teléfono</th>
              <th>Servicios</th>
              <th>Horario</th>
              <th>Comisión</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in items" :key="item.id">
              <td>{{ item.nombre }}</td>
              <td>{{ item.rol }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.telefono }}</td>
              <td>{{ item.servicios.join(', ') }}</td>
              <td>{{ item.horario }}</td>
              <td>{{ item.comision ? item.comision + '%' : '-' }}</td>
              <td>{{ item.permisos.join(', ') }}</td>
              <td>
                <button class="btn-edit" @click="openForm(item)"><i class="ti-pencil"></i></button>
                <button class="btn-delete" @click="deleteItem(idx)"><i class="ti-trash"></i></button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="8" class="no-data">No hay empleados/usuarios registrados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formulario modal -->
      <div v-if="showForm" class="modal-form-overlay">
        <div class="modal-form">
          <h2>{{ form.id ? 'Editar' : 'Nuevo' }} Empleado/Usuario</h2>
          <form @submit.prevent="saveItem">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre</label>
                <input v-model="form.nombre" required />
              </div>
              <div class="form-group">
                <label>Rol</label>
                <select v-model="form.rol" required>
                  <option value="">Selecciona un rol</option>
                  <option>Administrador</option>
                  <option>Recepcionista</option>
                  <option>Técnico</option>
                  <option>Especialista</option>
                  <option>Comercial</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>email</label>
                <input v-model="form.email" type="email" required />
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input v-model="form.telefono" type="tel" required />
              </div>
              <div class="form-group">
                <label>Comisión (%)</label>
                <input v-model.number="form.comision" type="number" min="0" step="0.01" placeholder="Opcional" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Servicios que puede realizar</label>
                <input v-model="servicioInput" @keyup.enter.prevent="addServicio" placeholder="Añadir y pulsa Enter" />
                <div class="chips">
                  <span v-for="(serv, i) in form.servicios" :key="i" class="chip">
                    {{ serv }} <i class="ti-close" @click="removeServicio(i)"></i>
                  </span>
                </div>
              </div>
              <!-- <div class="form-group">
                <label>Zona horaria</label>
                <select v-model="form.zonaHoraria">
                  <option value="Europe/Madrid">España (GMT+1/+2)</option>
                  <option value="America/New_York">Nueva York (GMT-5/-4)</option>
                  <option value="America/Los_Angeles">Los Ángeles (GMT-8/-7)</option>
                  <option value="Europe/London">Londres (GMT+0/+1)</option>
                  <option value="Asia/Tokyo">Tokio (GMT+9)</option>
                </select>
              </div> -->
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Horario laboral detallado</label>
                <div class="horario-detallado">
                  <div v-for="(dia, index) in form.horarioDetallado" :key="index" class="dia-horario">
                    <div class="dia-header">
                      <label class="dia-label">
                        <input type="checkbox" v-model="dia.activo" />
                        {{ dia.nombre }}
                      </label>
                    </div>
                    <div v-if="dia.activo" class="horarios-dia">
                      <div class="horario-input">
                        <span>Inicio:</span>
                        <input type="time" v-model="dia.inicio" />
                      </div>
                      <div class="horario-input">
                        <span>Fin:</span>
                        <input type="time" v-model="dia.fin" />
                      </div>
                      <div class="horario-input">
                        <span>Descanso:</span>
                        <input type="time" v-model="dia.descansoInicio" placeholder="Inicio" />
                        <input type="time" v-model="dia.descansoFin" placeholder="Fin" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Permisos/Accesos</label>
                <input v-model="permisoInput" @keyup.enter.prevent="addPermiso" placeholder="Añadir y pulsa Enter" />
                <div class="chips">
                  <span v-for="(perm, i) in form.permisos" :key="i" class="chip">
                    {{ perm }} <i class="ti-close" @click="removePermiso(i)"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeForm">Cancelar</button>
              <button type="submit" class="btn-save">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { empleadosService } from '@/services/api/queries';

const items = ref([]);
const showForm = ref(false);
const form = ref({
  nombre: '',
  rol: '',
  email: '',
  telefono: '',
  servicios: [],
  horario: '',
  comision: null,
  permisos: [],
  zonaHoraria: 'Europe/Madrid',
  horarioDetallado: [
    { nombre: 'Lunes', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
    { nombre: 'Martes', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
    { nombre: 'Miércoles', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
    { nombre: 'Jueves', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
    { nombre: 'Viernes', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
    { nombre: 'Sábado', activo: false, inicio: '', fin: '', descansoInicio: '', descansoFin: '' },
    { nombre: 'Domingo', activo: false, inicio: '', fin: '', descansoInicio: '', descansoFin: '' }
  ]
});
const servicioInput = ref('');
const permisoInput = ref('');

async function fetchEmpleados() {
  try {
    const data = await empleadosService.getAll();
    items.value = data;
  } catch (e) {
    items.value = [];
  }
}

function openForm(item = null) {
  if (item) {
    form.value = { ...item, servicios: [...item.servicios], permisos: [...item.permisos], horarioDetallado: item.horarioDetallado ? [...item.horarioDetallado] : [
      { nombre: 'Lunes', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
      { nombre: 'Martes', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
      { nombre: 'Miércoles', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
      { nombre: 'Jueves', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
      { nombre: 'Viernes', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
      { nombre: 'Sábado', activo: false, inicio: '', fin: '', descansoInicio: '', descansoFin: '' },
      { nombre: 'Domingo', activo: false, inicio: '', fin: '', descansoInicio: '', descansoFin: '' }
    ] };
  } else {
    form.value = {
      id: null,
      nombre: '',
      rol: '',
      email: '',
      telefono: '',
      servicios: [],
      horario: '',
      comision: null,
      permisos: [],
      zonaHoraria: 'Europe/Madrid',
      horarioDetallado: [
        { nombre: 'Lunes', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
        { nombre: 'Martes', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
        { nombre: 'Miércoles', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
        { nombre: 'Jueves', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
        { nombre: 'Viernes', activo: true, inicio: '09:00', fin: '18:00', descansoInicio: '12:00', descansoFin: '13:00' },
        { nombre: 'Sábado', activo: false, inicio: '', fin: '', descansoInicio: '', descansoFin: '' },
        { nombre: 'Domingo', activo: false, inicio: '', fin: '', descansoInicio: '', descansoFin: '' }
      ]
    };
  }
  servicioInput.value = '';
  permisoInput.value = '';
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
}

async function saveItem() {
  if (form.value.id) {
    // Editar
    await empleadosService.update(form.value.id, { ...form.value });
  } else {
    // Nuevo
    await empleadosService.create({ ...form.value });
  }
  showForm.value = false;
  await fetchEmpleados();
}

async function deleteItem(idx) {
  const empleado = items.value[idx];
  if (empleado && confirm('¿Seguro que quieres eliminar este registro?')) {
    await empleadosService.delete(empleado.id);
    await fetchEmpleados();
  }
}

function addServicio() {
  if (servicioInput.value && !form.value.servicios.includes(servicioInput.value)) {
    form.value.servicios.push(servicioInput.value);
    servicioInput.value = '';
  }
}
function removeServicio(i) {
  form.value.servicios.splice(i, 1);
}
function addPermiso() {
  if (permisoInput.value && !form.value.permisos.includes(permisoInput.value)) {
    form.value.permisos.push(permisoInput.value);
    permisoInput.value = '';
  }
}
function removePermiso(i) {
  form.value.permisos.splice(i, 1);
}

onMounted(fetchEmpleados);
</script>

<style scoped>
.empleados-usuarios-container {
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
.table-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 40px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.btn-add {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.btn-add:hover {
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
.main-table tr:last-child td {
  border-bottom: none;
}
.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  margin-right: 8px;
  color: #1b6659;
  transition: color 0.2s;
}
.btn-edit:hover {
  color: #2d8a7a;
}
.btn-delete:hover {
  color: #e74c3c;
}
.no-data {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
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
  min-width: 400px;
  max-width: 650px;
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
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.form-group {
  flex: 1 1 180px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.form-group label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}
.form-group input, .form-group textarea, .form-group select {
  padding: 10px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  min-width: 0;
}
.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}
.chip {
  background: #e0f2f1;
  color: #1b6659;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  margin-bottom: 2px;
}
.chip i {
  font-size: 12px;
  margin-left: 4px;
}
.horario-detallado {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.dia-horario {
  background: #f7f7f7;
  border-radius: 10px;
  padding: 10px 12px 8px 12px;
  margin-bottom: 6px;
  min-width: 180px;
  flex: 1 1 180px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.dia-header {
  margin-bottom: 6px;
}
.dia-label {
  font-weight: 600;
  color: #1b6659;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.horarios-dia {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
.horario-input {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.horario-input input[type="time"] {
  min-width: 70px;
  width: 80px;
  padding: 4px 6px;
  font-size: 13px;
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
@media (max-width: 900px) {
  .modal-form {
    min-width: 90vw;
    max-width: 98vw;
    padding: 20px 10px;
  }
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  .horario-detallado {
    flex-direction: column;
    gap: 6px;
  }
  .dia-horario {
    min-width: 0;
    width: 100%;
  }
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
  .table-section {
    padding: 10px;
  }
  .modal-form {
    min-width: 98vw;
    max-width: 100vw;
    padding: 10px 2px;
  }
}
</style> 