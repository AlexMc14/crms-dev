<template>
  <div class="facturacion-container">
    <b-alert v-if="showSuccess" variant="success" style="position: fixed; width: 100%; top: 0px; z-index: 9999;" show>Factura guardada correctamente</b-alert>
    
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-receipt"></i>
          Facturación
        </h1>
        <p class="page-subtitle">Gestión de facturas, estados y documentos</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Tabla de facturas -->
      <div class="table-section">
        <div class="table-header">
          <h2>Listado de Facturas</h2>
          <button class="btn-add" @click="openForm()">
            <i class="ti-plus"></i> Nueva Factura
          </button>
        </div>
        <table class="main-table">
          <thead>
            <tr>
              <th>Nº Factura</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Servicios</th>
              <th>Total Neto</th>
              <th>Estado</th>
              <th>Vencimiento</th>
              <th>Pagos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in items" :key="item.id">
              <td><strong>{{ item.numeroFactura }}</strong></td>
              <td>{{ formatDate(item.fechaEmision) }}</td>
              <td>{{ item.cliente }}</td>
              <td>
                <div class="servicios-resumen">
                  <span v-for="serv in item.servicios.slice(0, 2)" :key="serv.id" class="servicio-chip">
                    {{ serv.nombre }}
                  </span>
                  <span v-if="item.servicios.length > 2" class="servicio-more">
                    +{{ item.servicios.length - 2 }} más
                  </span>
                </div>
              </td>
              <td>
                <div class="totales">
                  <div class="total-bruto">{{ formatCurrency(item.totalBruto) }}</div>
                  <div class="impuestos">+{{ formatCurrency(item.impuestos) }}</div>
                  <div class="total-neto"><strong>{{ formatCurrency(item.totalNeto) }}</strong></div>
                </div>
              </td>
              <td>
                <span :class="`estado-badge estado-${item.estado}`">
                  {{ item.estado }}
                </span>
              </td>
              <td>{{ formatDate(item.vencimiento) }}</td>
              <td>
                <div class="pagos-info">
                  <div class="pagado">{{ formatCurrency(item.pagado) }}</div>
                  <div class="pendiente">{{ formatCurrency(item.pendiente) }}</div>
                  <div class="cobros-count" v-if="item.cobrosVinculados.length > 0">
                    <small>{{ item.cobrosVinculados.length }} cobro(s)</small>
                  </div>
                </div>
              </td>
              <td>
                <button class="btn-edit" @click="openForm(item)" title="Editar"><i class="ti-pencil"></i></button>
                <button class="btn-cobros" @click="verCobros(item)" title="Ver Cobros"><i class="ti-money"></i></button>
                <button class="btn-pdf" @click="generarPDF(item)" title="Generar PDF"><i class="ti-file"></i></button>
                <button class="btn-delete" @click="deleteItem(idx)" title="Eliminar"><i class="ti-trash"></i></button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="9" class="no-data">No hay facturas registradas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formulario modal -->
      <div v-if="showForm" class="modal-form-overlay">
        <div class="modal-form">
          <h2>{{ form._id ? 'Editar' : 'Nueva' }} Factura</h2>
          <form @submit.prevent="saveItem">
            <div class="form-row">
              <div class="form-group">
                <label>Número de Factura</label>
                <input v-model="form.numeroFactura" required />
              </div>
              <div class="form-group">
                <label>Fecha de Emisión</label>
                <input v-model="form.fechaEmision" type="date" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Cliente</label>
                <select v-model="form.cliente" required>
                  <option value="">Selecciona un cliente</option>
                  <option v-for="cliente in clientes" :key="cliente._id" :value="`${cliente.nombre} ${cliente.apellidos}`">
                    {{ cliente.nombre }} {{ cliente.apellidos }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Estado</label>
                <select v-model="form.estado" required>
                  <option value="borrador">Borrador</option>
                  <option value="emitida">Emitida</option>
                  <option value="anulada">Anulada</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Fecha de Vencimiento</label>
                <input v-model="form.vencimiento" type="date" required />
              </div>
              <div class="form-group">
                <label>Servicios/Productos</label>
                <button type="button" class="btn-add-service" @click="addServicio">
                  <i class="ti-plus"></i> Agregar Servicio
                </button>
              </div>
            </div>
            
            <!-- Lista de servicios -->
            <div class="servicios-list" v-if="form.servicios.length > 0">
              <h4>Servicios Incluidos</h4>
              <div v-for="(servicio, index) in form.servicios" :key="index" class="servicio-item">
                <div class="servicio-header">
                  <span class="servicio-nombre">{{ servicio.nombre }}</span>
                  <button type="button" class="btn-remove" @click="removeServicio(index)">
                    <i class="ti-close"></i>
                  </button>
                </div>
                <div class="servicio-details">
                  <div class="servicio-cantidad">
                    <label>Cantidad:</label>
                    <input v-model.number="servicio.cantidad" type="number" min="1" />
                  </div>
                  <div class="servicio-precio">
                    <label>Precio Unitario:</label>
                    <input v-model.number="servicio.precioUnitario" type="number" step="0.01" min="0" />
                  </div>
                  <div class="servicio-total">
                    <label>Total:</label>
                    <span>{{ formatCurrency(servicio.cantidad * servicio.precioUnitario) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totales -->
            <div class="totales-section">
              <div class="total-item">
                <span>Total Bruto:</span>
                <span>{{ formatCurrency(totalBruto) }}</span>
              </div>
              <div class="total-item">
                <span>Impuestos (21%):</span>
                <span>{{ formatCurrency(impuestos) }}</span>
              </div>
              <div class="total-item total-neto">
                <span>Total Neto:</span>
                <span>{{ formatCurrency(totalNeto) }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeForm">Cancelar</button>
              <button type="submit" class="btn-save">Guardar Factura</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para agregar servicio -->
      <div v-if="showServicioModal" class="modal-form-overlay">
        <div class="modal-form servicio-modal">
          <h3>Agregar Servicio/Producto</h3>
          <form @submit.prevent="confirmAddServicio">
            <div class="form-group">
              <label>Servicio/Producto</label>
              <select v-model="nuevoServicio.nombre" required>
                <option value="">Selecciona un servicio</option>
                <option v-for="servicio in serviciosDisponibles" :key="servicio._id" :value="servicio.nombre">
                  {{ servicio.nombre }} - {{ formatCurrency(servicio.precio) }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Cantidad</label>
                <input v-model.number="nuevoServicio.cantidad" type="number" min="1" value="1" required />
              </div>
              <div class="form-group">
                <label>Precio Unitario</label>
                <input v-model.number="nuevoServicio.precioUnitario" type="number" step="0.01" min="0" required />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeServicioModal">Cancelar</button>
              <button type="submit" class="btn-save">Agregar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para ver cobros de una factura -->
      <div v-if="showCobrosModal" class="modal-form-overlay">
        <div class="modal-form">
          <h2>Cobros de Factura {{ selectedFactura && selectedFactura.numeroFactura }}</h2>
          <div class="cobros-content">
            <div class="factura-info">
              <p><strong>Cliente:</strong> {{ selectedFactura && selectedFactura.cliente }}</p>
              <p><strong>Total Factura:</strong> {{ selectedFactura && formatCurrency(selectedFactura.totalNeto) }}</p>
              <p><strong>Estado:</strong> 
                <span :class="`estado-badge estado-${selectedFactura && selectedFactura.estado}`">
                  {{ selectedFactura && selectedFactura.estado }}
                </span>
              </p>
            </div>
            
            <div class="cobros-list" v-if="cobrosFactura.length > 0">
              <h3>Cobros Realizados</h3>
              <div v-for="cobro in cobrosFactura" :key="cobro.id" class="cobro-item">
                <div class="cobro-header">
                  <span class="cobro-id">#{{ cobro.id }}</span>
                  <span :class="`estado-badge estado-${cobro.estado}`">
                    {{ cobro.estado }}
                  </span>
                </div>
                <div class="cobro-details">
                  <div class="cobro-info">
                    <span><strong>Fecha:</strong> {{ formatDate(cobro.fechaPago) }}</span>
                    <span><strong>Método:</strong> {{ cobro.metodo }}</span>
                    <span><strong>Monto:</strong> {{ formatCurrency(cobro.monto) }}</span>
                  </div>
                  <div class="cobro-referencia" v-if="cobro.referencia">
                    <strong>Referencia:</strong> {{ cobro.referencia }}
                  </div>
                </div>
              </div>
              
              <div class="cobros-resumen">
                <div class="resumen-item">
                  <span>Total Cobrado:</span>
                  <span class="total-cobrado">{{ formatCurrency(totalCobrado) }}</span>
                </div>
                <div class="resumen-item">
                  <span>Pendiente:</span>
                  <span class="pendiente">{{ formatCurrency(selectedFactura && (selectedFactura.totalNeto - totalCobrado)) }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="no-cobros">
              <i class="ti-money" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
              <p>No hay cobros registrados para esta factura</p>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeCobrosModal">Cerrar</button>
            <button type="button" class="btn-add-cobro" @click="irACobros">
              <i class="ti-plus"></i> Nuevo Cobro
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { facturasService, clientesService, serviciosService } from '@/services/api';

// Datos reactivos
const items = ref([]);
const clientes = ref([]);
const serviciosDisponibles = ref([]);
const showForm = ref(false);
const showServicioModal = ref(false);
const showCobrosModal = ref(false);
const selectedFactura = ref(null);
const cobrosFactura = ref([]);
const showSuccess = ref(false);

// Formulario
const form = ref({
  numeroFactura: '',
  fechaEmision: '',
  cliente: '',
  servicios: [],
  estado: 'borrador',
  vencimiento: ''
});

const nuevoServicio = ref({
  nombre: '',
  cantidad: 1,
  precioUnitario: 0
});

// Computed properties para totales
const totalBruto = computed(() => {
  return form.value.servicios.reduce((total, servicio) => {
    return total + (servicio.cantidad * servicio.precioUnitario);
  }, 0);
});

const impuestos = computed(() => {
  return totalBruto.value * 0.21;
});

const totalNeto = computed(() => {
  return totalBruto.value + impuestos.value;
});

// Computed property para calcular el total cobrado
const totalCobrado = computed(() => {
  return cobrosFactura.value.reduce((total, cobro) => total + cobro.monto, 0);
});

// Función para cargar datos desde la API
const fetchData = async () => {
  try {
    console.log('Cargando facturas desde la API...');
    const response = await facturasService.getAll();
    console.log('Respuesta de la API:', response);
    items.value = response;
  } catch (error) {
    console.error('Error al obtener facturas:', error);
  }
};

// Función para cargar clientes
const fetchClientes = async () => {
  try {
    console.log('Cargando clientes desde la API...');
    const response = await clientesService.getAll();
    console.log('Clientes cargados:', response);
    clientes.value = response;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
  }
};

// Función para cargar servicios disponibles
const fetchServicios = async () => {
  try {
    console.log('Cargando servicios desde la API...');
    const response = await serviciosService.getAll();
    console.log('Servicios cargados:', response);
    serviciosDisponibles.value = response;
  } catch (error) {
    console.error('Error al obtener servicios:', error);
  }
};

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-ES');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function openForm(item = null) {
  if (item) {
    form.value = { 
      ...item, 
      servicios: [...item.servicios]
    };
  } else {
    form.value = {
      numeroFactura: `FAC-${new Date().getFullYear()}-${String(items.value.length + 1).padStart(3, '0')}`,
      fechaEmision: new Date().toISOString().split('T')[0],
      cliente: '',
      servicios: [],
      estado: 'borrador',
      vencimiento: ''
    };
  }
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
}

async function saveItem() {
  try {
    const facturaData = {
      ...form.value,
      totalBruto: totalBruto.value,
      impuestos: impuestos.value,
      totalNeto: totalNeto.value,
      fechaCreacion: new Date().getTime()
    };

    if (form.value._id) {
      // Editar
      console.log('Actualizando factura:', facturaData);
      await facturasService.update(form.value._id, facturaData);
      showSuccess.value = true;
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
    } else {
      // Nuevo
      console.log('Creando nueva factura:', facturaData);
      await facturasService.create(facturaData);
      showSuccess.value = true;
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
    }
    
    showForm.value = false;
    await fetchData(); // Recargar datos
  } catch (error) {
    console.error('Error al guardar factura:', error);
  }
}

async function deleteItem(idx) {
  if (confirm('¿Seguro que quieres eliminar esta factura?')) {
    try {
      const factura = items.value[idx];
      await facturasService.delete(factura._id);
      showSuccess.value = true;
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
      await fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al eliminar factura:', error);
    }
  }
}

function addServicio() {
  nuevoServicio.value = {
    nombre: '',
    cantidad: 1,
    precioUnitario: 0
  };
  showServicioModal.value = true;
}

function closeServicioModal() {
  showServicioModal.value = false;
}

function confirmAddServicio() {
  const servicioSeleccionado = serviciosDisponibles.value.find(s => s.nombre === nuevoServicio.value.nombre);
  if (servicioSeleccionado) {
    form.value.servicios.push({
      id: servicioSeleccionado._id,
      nombre: nuevoServicio.value.nombre,
      cantidad: nuevoServicio.value.cantidad,
      precioUnitario: nuevoServicio.value.precioUnitario || servicioSeleccionado.precio
    });
  }
  closeServicioModal();
}

function removeServicio(index) {
  form.value.servicios.splice(index, 1);
}

function generarPDF(item) {
  alert(`Generando PDF para factura ${item.numeroFactura}`);
  // Aquí iría la lógica para generar el PDF
}

// Función para obtener los cobros de una factura específica
function obtenerCobrosFactura(factura) {
  // Simular datos de cobros (en un caso real vendrían de la base de datos)
  const cobrosData = [
    {
      id: 1,
      fechaPago: '2024-01-15',
      metodo: 'tarjeta',
      monto: 453.75,
      referencia: 'FAC-2024-001',
      estado: 'completado',
      facturas: ['FAC-2024-001']
    },
    {
      id: 2,
      fechaPago: '2024-01-20',
      metodo: 'transferencia',
      monto: 150.00,
      referencia: 'TRF-001',
      estado: 'completado',
      facturas: ['FAC-2024-002']
    }
  ];
  
  return cobrosData.filter(cobro => 
    cobro.facturas.includes(factura.numeroFactura)
  );
}

function verCobros(factura) {
  selectedFactura.value = factura;
  cobrosFactura.value = obtenerCobrosFactura(factura);
  showCobrosModal.value = true;
}

function closeCobrosModal() {
  showCobrosModal.value = false;
  selectedFactura.value = null;
  cobrosFactura.value = [];
}

function irACobros() {
  closeCobrosModal();
  // Navegar a la página de cobros/pagos
  window.location.hash = '#/cobros-pagos';
}

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchData();
  await fetchClientes();
  await fetchServicios();
});
</script>

<style scoped>
.facturacion-container {
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

.servicios-resumen {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.servicio-chip {
  background: #e0f2f1;
  color: #1b6659;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
}

.servicio-more {
  color: #7f8c8d;
  font-size: 11px;
  font-style: italic;
}

.totales {
  font-size: 12px;
}

.total-bruto {
  color: #7f8c8d;
}

.impuestos {
  color: #e67e22;
}

.total-neto {
  color: #1b6659;
  font-weight: 600;
}

.estado-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-borrador {
  background: #fff3cd;
  color: #856404;
}

.estado-emitida {
  background: #d4edda;
  color: #155724;
}

.estado-anulada {
  background: #f8d7da;
  color: #721c24;
}

.pagos-info {
  font-size: 12px;
}

.pagado {
  color: #27ae60;
  font-weight: 600;
}

.pendiente {
  color: #e74c3c;
  font-weight: 600;
}

.btn-edit, .btn-cobros, .btn-pdf, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-right: 8px;
  transition: color 0.2s;
}

.btn-edit {
  color: #1b6659;
}

.btn-cobros {
  color: #e67e22;
}

.btn-pdf {
  color: #e67e22;
}

.btn-delete {
  color: #e74c3c;
}

.btn-edit:hover {
  color: #2d8a7a;
}

.btn-cobros:hover {
  color: #d35400;
}

.btn-pdf:hover {
  color: #d35400;
}

.btn-delete:hover {
  color: #c0392b;
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
  min-width: 500px;
  max-width: 700px;
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
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input, .form-group select {
  padding: 10px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}

.btn-add-service {
  background: #e0f2f1;
  color: #1b6659;
  border: 2px dashed #1b6659;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
}

.btn-add-service:hover {
  background: #1b6659;
  color: white;
}

.servicios-list {
  margin: 20px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
}

.servicios-list h4 {
  margin: 0 0 15px 0;
  color: #1b6659;
}

.servicio-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
}

.servicio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.servicio-nombre {
  font-weight: 600;
  color: #2c3e50;
}

.btn-remove {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 16px;
}

.servicio-details {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
}

.servicio-details input {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
}

.servicio-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.servicio-total span {
  font-weight: 600;
  color: #1b6659;
}

.totales-section {
  margin: 20px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
}

.total-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.total-item.total-neto {
  font-weight: 700;
  font-size: 16px;
  color: #1b6659;
  border-top: 1px solid #ddd;
  padding-top: 8px;
  margin-top: 8px;
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

.servicio-modal {
  min-width: 400px;
}

/* Estilos para modal de cobros */
.cobros-content {
  margin: 20px 0;
}

.factura-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.factura-info p {
  margin: 8px 0;
  color: #2c3e50;
}

.cobros-list h3 {
  color: #1b6659;
  margin: 0 0 15px 0;
  font-size: 18px;
}

.cobro-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.cobro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.cobro-id {
  font-weight: 600;
  color: #1b6659;
  font-size: 14px;
}

.cobro-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cobro-info {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
  font-size: 13px;
}

.cobro-info span {
  color: #2c3e50;
}

.cobro-referencia {
  font-size: 12px;
  color: #7f8c8d;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.cobros-resumen {
  background: #e8f5e8;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

.resumen-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.resumen-item:last-child {
  margin-bottom: 0;
  border-top: 1px solid #d4edda;
  padding-top: 8px;
  font-weight: 600;
}

.total-cobrado {
  color: #27ae60;
  font-weight: 600;
}

.pendiente {
  color: #e74c3c;
  font-weight: 600;
}

.no-cobros {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.no-cobros p {
  margin: 0;
  font-size: 16px;
}

.btn-add-cobro {
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
}

.btn-add-cobro:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
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
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  .modal-form {
    min-width: 90vw;
    padding: 20px 10px;
  }
  .servicio-details {
    grid-template-columns: 1fr;
  }
}
</style> 