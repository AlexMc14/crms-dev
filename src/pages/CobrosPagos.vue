<template>
  <div class="cobros-pagos-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-money"></i>
          Cobros / Pagos
        </h1>
        <p class="page-subtitle">Gestión de transacciones y métodos de pago</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Tabla de cobros/pagos -->
      <div class="table-section">
        <div class="table-header">
          <h2>Transacciones</h2>
          <button class="btn-add" @click="openForm()">
            <i class="ti-plus"></i> Nuevo Pago
          </button>
        </div>
        <table class="main-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Referencia</th>
              <th>Estado</th>
              <th>Facturas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in items" :key="item.id">
              <td><strong>#{{ item.id }}</strong></td>
              <td>{{ item.cliente }}</td>
              <td>{{ formatDate(item.fechaPago) }}</td>
              <td>
                <span :class="`metodo-badge metodo-${item.metodo}`">
                  {{ item.metodo }}
                </span>
              </td>
              <td><strong>{{ formatCurrency(item.monto) }}</strong></td>
              <td>{{ item.referencia }}</td>
              <td>
                <span :class="`estado-badge estado-${item.estado}`">
                  {{ item.estado }}
                </span>
              </td>
              <td>
                <div class="facturas-vinculadas">
                  <span v-for="factura in item.facturas" :key="factura" class="factura-chip">
                    {{ factura }}
                  </span>
                </div>
              </td>
              <td>
                <button class="btn-edit" @click="openForm(item)" title="Editar"><i class="ti-pencil"></i></button>
                <button class="btn-link" @click="vincularFacturas(item)" title="Vincular Facturas"><i class="ti-link"></i></button>
                <button class="btn-delete" @click="deleteItem(idx)" title="Eliminar"><i class="ti-trash"></i></button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="9" class="no-data">No hay transacciones registradas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formulario modal -->
      <div v-if="showForm" class="modal-form-overlay">
        <div class="modal-form">
          <h2>{{ form.id ? 'Editar' : 'Nuevo' }} Pago</h2>
          <form @submit.prevent="saveItem">
            <div class="form-row">
              <div class="form-group">
                <label>Cliente</label>
                <select v-model="form.cliente" required>
                  <option value="">Selecciona un cliente</option>
                  <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.nombre">
                    {{ cliente.nombre }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Fecha de Pago</label>
                <input v-model="form.fechaPago" type="date" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Método de Pago</label>
                <select v-model="form.metodo" required>
                  <option value="">Selecciona método</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div class="form-group">
                <label>Monto</label>
                <input v-model.number="form.monto" type="number" step="0.01" min="0" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Referencia</label>
                <input v-model="form.referencia" placeholder="Número de factura, comprobante, etc." />
              </div>
              <div class="form-group">
                <label>Estado</label>
                <select v-model="form.estado" required>
                  <option value="completado">Completado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="procesando">Procesando</option>
                </select>
              </div>
            </div>
            
            <!-- Sección de facturas vinculadas -->
            <div class="form-section">
              <h3>Facturas Vinculadas</h3>
              <div class="facturas-disponibles">
                <div v-for="factura in facturasDisponibles" :key="factura.id" class="factura-item">
                  <label class="factura-checkbox">
                    <input 
                      type="checkbox" 
                      :value="factura.numeroFactura"
                      v-model="form.facturas"
                    />
                    <span class="factura-info">
                      <strong>{{ factura.numeroFactura }}</strong> - 
                      {{ factura.cliente }} - 
                      {{ formatCurrency(factura.pendiente) }} pendiente
                    </span>
                  </label>
                </div>
              </div>
              
              <!-- Total pendiente de facturas seleccionadas -->
              <div class="total-pendiente" v-if="form.facturas.length > 0">
                <strong>Total pendiente seleccionado: {{ formatCurrency(totalPendienteSeleccionado) }}</strong>
                <div class="validacion-monto" :class="{ 'error': form.monto > totalPendienteSeleccionado }">
                  <small v-if="form.monto > totalPendienteSeleccionado">
                    ⚠️ El monto excede el total pendiente
                  </small>
                  <small v-else-if="form.monto > 0">
                    ✅ Monto válido
                  </small>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeForm">Cancelar</button>
              <button type="submit" class="btn-save">Guardar Pago</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para vincular facturas -->
      <div v-if="showVincularModal" class="modal-form-overlay">
        <div class="modal-form">
          <h2>Vincular Facturas</h2>
          <div class="vincular-content">
            <p><strong>Pago:</strong> #{{ selectedItem && selectedItem.id }} - {{ formatCurrency(selectedItem && selectedItem.monto) }}</p>
            <p><strong>Cliente:</strong> {{ selectedItem && selectedItem.cliente }}</p>
            
            <div class="facturas-seleccion">
              <h4>Seleccionar Facturas</h4>
              <div v-for="factura in facturasDisponibles" :key="factura.id" class="factura-seleccion-item">
                <label class="factura-checkbox">
                  <input 
                    type="checkbox" 
                    :value="factura.numeroFactura"
                    v-model="facturasSeleccionadas"
                  />
                  <span class="factura-detalle">
                    <strong>{{ factura.numeroFactura }}</strong><br>
                    <small>{{ factura.cliente }} - {{ formatCurrency(factura.pendiente) }} pendiente</small>
                  </span>
                </label>
              </div>
            </div>
            
            <div class="total-vinculacion">
              <strong>Total a aplicar: {{ formatCurrency(totalSeleccionado) }}</strong>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeVincularModal">Cancelar</button>
            <button type="button" class="btn-save" @click="confirmarVinculacion">Vincular Facturas</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const items = ref([
  {
    id: 1,
    cliente: 'Ana López',
    fechaPago: '2024-01-15',
    metodo: 'tarjeta',
    monto: 453.75,
    referencia: 'FAC-2024-001',
    estado: 'completado',
    facturas: ['FAC-2024-001']
  },
  {
    id: 2,
    cliente: 'Carlos Ruiz',
    fechaPago: '2024-01-20',
    metodo: 'transferencia',
    monto: 150.00,
    referencia: 'TRF-001',
    estado: 'completado',
    facturas: ['FAC-2024-002']
  }
]);

const clientes = ref([
  { id: 1, nombre: 'Ana López' },
  { id: 2, nombre: 'Carlos Ruiz' },
  { id: 3, nombre: 'María García' }
]);

const facturasDisponibles = ref([
  { id: 1, numeroFactura: 'FAC-2024-001', cliente: 'Ana López', pendiente: 0 },
  { id: 2, numeroFactura: 'FAC-2024-002', cliente: 'Carlos Ruiz', pendiente: 242.00 },
  { id: 3, numeroFactura: 'FAC-2024-003', cliente: 'María García', pendiente: 150.00 }
]);

const showForm = ref(false);
const showVincularModal = ref(false);
const selectedItem = ref(null);
const facturasSeleccionadas = ref([]);

const form = ref({
  id: null,
  cliente: '',
  fechaPago: '',
  metodo: '',
  monto: 0,
  referencia: '',
  estado: 'completado',
  facturas: []
});

const totalSeleccionado = computed(() => {
  return facturasDisponibles.value
    .filter(f => facturasSeleccionadas.value.includes(f.numeroFactura))
    .reduce((total, f) => total + f.pendiente, 0);
});

const totalPendienteSeleccionado = computed(() => {
  return facturasDisponibles.value
    .filter(f => form.value.facturas.includes(f.numeroFactura))
    .reduce((total, f) => total + f.pendiente, 0);
});

// Referencia a las facturas para actualizar estados
const facturasData = ref([
  {
    id: 1,
    numeroFactura: 'FAC-2024-001',
    cliente: 'Ana López',
    totalNeto: 453.75,
    cobrosVinculados: [1]
  },
  {
    id: 2,
    numeroFactura: 'FAC-2024-002',
    cliente: 'Carlos Ruiz',
    totalNeto: 242.00,
    cobrosVinculados: [2]
  }
]);

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
      facturas: [...item.facturas]
    };
  } else {
    form.value = {
      id: null,
      cliente: '',
      fechaPago: new Date().toISOString().split('T')[0],
      metodo: '',
      monto: 0,
      referencia: '',
      estado: 'completado',
      facturas: []
    };
  }
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
}

function saveItem() {
  // Validar que el monto no exceda el pendiente de las facturas
  if (form.value.facturas.length > 0) {
    const facturasPendientes = facturasDisponibles.value.filter(f => 
      form.value.facturas.includes(f.numeroFactura)
    );
    const totalPendiente = facturasPendientes.reduce((total, f) => total + f.pendiente, 0);
    
    if (form.value.monto > totalPendiente) {
      alert(`El monto (${formatCurrency(form.value.monto)}) excede el total pendiente de las facturas seleccionadas (${formatCurrency(totalPendiente)})`);
      return;
    }
  }

  if (form.value.id) {
    // Editar
    const idx = items.value.findIndex(i => i.id === form.value.id);
    if (idx !== -1) {
      items.value[idx] = { 
        ...form.value,
        facturas: [...form.value.facturas]
      };
    }
  } else {
    // Nuevo
    form.value.id = Date.now();
    items.value.push({ 
      ...form.value,
      facturas: [...form.value.facturas]
    });
  }
  
  // Actualizar estados de facturas después de guardar
  actualizarEstadosFacturas();
  showForm.value = false;
}

function deleteItem(idx) {
  if (confirm('¿Seguro que quieres eliminar esta transacción?')) {
    items.value.splice(idx, 1);
  }
}

function vincularFacturas(item) {
  selectedItem.value = item;
  facturasSeleccionadas.value = [...item.facturas];
  showVincularModal.value = true;
}

function closeVincularModal() {
  showVincularModal.value = false;
  selectedItem.value = null;
  facturasSeleccionadas.value = [];
}

function confirmarVinculacion() {
  if (selectedItem.value) {
    const idx = items.value.findIndex(i => i.id === selectedItem.value.id);
    if (idx !== -1) {
      items.value[idx].facturas = [...facturasSeleccionadas.value];
      
      // Actualizar estados de facturas después de vincular
      actualizarEstadosFacturas();
    }
  }
  closeVincularModal();
}

// Función para actualizar estados de facturas cuando se modifica un cobro
function actualizarEstadosFacturas() {
  facturasData.value.forEach(factura => {
    const cobrosAsociados = items.value.filter(cobro => 
      factura.cobrosVinculados.includes(cobro.id) && cobro.estado === 'completado'
    );
    
    const totalPagado = cobrosAsociados.reduce((total, cobro) => total + cobro.monto, 0);
    
    // Aquí se actualizaría el estado en la base de datos
    console.log(`Factura ${factura.numeroFactura}: ${totalPagado}/${factura.totalNeto}`);
  });
}

// Función para validar que el monto del cobro no exceda el pendiente de las facturas
function validarMontoCobro(monto, facturasSeleccionadas) {
  const facturasPendientes = facturasDisponibles.value.filter(f => 
    facturasSeleccionadas.includes(f.numeroFactura)
  );
  
  const totalPendiente = facturasPendientes.reduce((total, f) => total + f.pendiente, 0);
  
  return monto <= totalPendiente;
}
</script>

<style scoped>
.cobros-pagos-container {
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

.metodo-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.metodo-efectivo {
  background: #d4edda;
  color: #155724;
}

.metodo-tarjeta {
  background: #cce5ff;
  color: #004085;
}

.metodo-transferencia {
  background: #fff3cd;
  color: #856404;
}

.metodo-paypal {
  background: #f8d7da;
  color: #721c24;
}

.metodo-stripe {
  background: #e2e3e5;
  color: #383d41;
}

.metodo-cheque {
  background: #d1ecf1;
  color: #0c5460;
}

.estado-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-completado {
  background: #d4edda;
  color: #155724;
}

.estado-pendiente {
  background: #fff3cd;
  color: #856404;
}

.estado-rechazado {
  background: #f8d7da;
  color: #721c24;
}

.estado-procesando {
  background: #cce5ff;
  color: #004085;
}

.facturas-vinculadas {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.factura-chip {
  background: #e0f2f1;
  color: #1b6659;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
}

.btn-edit, .btn-link, .btn-delete {
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

.btn-link {
  color: #3498db;
}

.btn-delete {
  color: #e74c3c;
}

.btn-edit:hover {
  color: #2d8a7a;
}

.btn-link:hover {
  color: #2980b9;
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

.form-section {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #1b6659;
  font-size: 18px;
}

.facturas-disponibles {
  max-height: 200px;
  overflow-y: auto;
}

.factura-item {
  margin-bottom: 10px;
}

.factura-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.factura-checkbox:hover {
  background: rgba(27, 102, 89, 0.1);
}

.factura-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #1b6659;
}

.factura-info {
  font-size: 14px;
  color: #2c3e50;
}

.factura-detalle {
  font-size: 13px;
  color: #2c3e50;
}

.factura-detalle small {
  color: #7f8c8d;
}

.vincular-content {
  margin: 20px 0;
}

.vincular-content p {
  margin: 10px 0;
  color: #2c3e50;
}

.facturas-seleccion {
  margin: 20px 0;
}

.facturas-seleccion h4 {
  margin: 0 0 15px 0;
  color: #1b6659;
}

.factura-seleccion-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.total-vinculacion {
  margin: 20px 0;
  padding: 15px;
  background: #e8f5e8;
  border-radius: 8px;
  text-align: center;
  color: #1b6659;
  font-size: 16px;
}

.total-pendiente {
  margin: 15px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1b6659;
}

.validacion-monto {
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.validacion-monto.error {
  background: #f8d7da;
  color: #721c24;
}

.validacion-monto:not(.error) {
  background: #d4edda;
  color: #155724;
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
}
</style> 