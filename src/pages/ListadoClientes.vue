<template>
  <div class="listado-clientes-container">
    <b-alert v-if="showSuccess" variant="success" style="position: fixed; width: 100%; top: 0px; z-index: 9999;" show>Cliente borrado correctamente</b-alert>
    
    <!-- Header con título y botón de añadir -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-user"></i>
          Listado de Clientes
        </h1>
        <p class="page-subtitle">Gestión y administración de clientes</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Filtros rediseñados -->
      <div class="table-section">
        <div class="table-header">
          <h2>Filtros de Búsqueda</h2>
          <button class="btn-add" @click="createModal = true">
            <i class="ti-plus"></i> Añadir Cliente
          </button>
        </div>
        
        <div class="filters-content">
          <div class="row">
            <!-- Filtro por nombre -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="nombreInput">Nombre</label>
                <input
                  id="nombreInput"
                  type="text"
                  class="form-control"
                  v-model="filters.nombre"
                  placeholder="Buscar por nombre"
                  @keyup.enter="fetchData"
                >
              </div>
            </div>

            <!-- Filtro por correo -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="emailInput">Correo</label>
                <input
                  id="emailInput"
                  type="email"
                  class="form-control"
                  v-model="filters.email"
                  placeholder="Buscar por correo"
                  @keyup.enter="fetchData"
                >
              </div>
            </div>

            <!-- Filtro por teléfono -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="telefonoInput">Teléfono</label>
                <input
                  id="telefonoInput"
                  type="text"
                  class="form-control"
                  v-model="filters.telefono"
                  placeholder="Buscar por teléfono"
                  @keyup.enter="fetchData"
                >
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Ordenamiento -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="orderSelect">Ordenar por</label>
                <select id="orderSelect" v-model="order" class="form-control" @change="handleOrderChange">
                  <option value="fechaCreacion">Fecha de creación</option>
                  <option value="nombre">Nombre</option>
                </select>
              </div>
            </div>

            <!-- Dirección del ordenamiento -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="orderDirection">Dirección</label>
                <select id="orderDirection" v-model="orderDirection" class="form-control" @change="handleOrderChange">
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </select>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="col-md-4 mb-3 d-flex align-items-end">
              <div class="w-100">
                <button class="btn-search" @click="fetchData">
                  <i class="ti-search"></i> Buscar
                </button>
                <button class="btn-clear" @click="clearFilters">
                  <i class="ti-eraser"></i> Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de clientes -->
      <div class="table-section">
        <div class="table-header">
          <h2>Listado de Clientes</h2>
        </div>
        <Listados :items="filteredClientes" :fields="fields" :current-page="currentPage" @page-changed="handlePageChange">
          <template #tableActions="{ data }">
            <button v-if="showAsAdmin" class="btn-edit" @click="editClient(data.item)" title="Editar">
              <i class="ti-pencil"></i>
            </button>
            <button v-if="showAsAdmin" class="btn-delete" @click="deleteClient(data.item)" title="Borrar">
              <i class="ti-trash"></i>
            </button>
            <button class="btn-view" @click="$router.push(navigateToProfile(data.item))" title="Ver">
              <i class="ti-eye"></i>
            </button>
          </template>
        </Listados>
      </div>

      <!-- Modales existentes... -->
      <b-modal v-model="modalShow" id="bv-modal-example" hide-footer>
        <template #modal-title>
          Editar cliente
        </template>
        <div class="row">
          <div class="col-6">
            <label for="">Nombre</label>
            <input type="text" class="form-control" v-model="clientToEdit.nombre">
          </div>
          <div class="col-6">
            <label for="">Apellidos</label>
            <input type="text" class="form-control" v-model="clientToEdit.apellidos">
          </div>
          <div class="col-6">
            <label for="">Fecha de nacimiento</label>
            <input type="date" class="form-control" v-model="clientToEdit.fechaNacimiento">
          </div>
          <div class="col-6">
            <label for="">Teléfono(s)</label>
            <input type="number" class="form-control" v-model="clientToEdit.telefono">
          </div>
          <div class="col-6">
            <label for="">Email</label>
            <input type="text" class="form-control" v-model="clientToEdit.email">
          </div>
          <div class="col-6">
            <label for="">Código postal</label>
            <input type="number" class="form-control" v-model="clientToEdit.codigoPostal">
          </div>
          <div class="col-6">
            <label for="">Dirección</label>
            <input type="text" class="form-control" v-model="clientToEdit.direccion">
          </div>
          <div class="col-6">
            <label for="">Notas adicionales</label>
            <textarea type="text" class="form-control" v-model="clientToEdit.notas"></textarea>
          </div>
          <b-button @click="saveChanges" class="btn-search mx-5 mt-4">Guardar cambios</b-button>
        </div>
      </b-modal>
      <b-modal v-model="modalDelete" id="bv-modal-example" hide-footer>
        <template #modal-title>
          Borrar cliente
        </template>
        <div class="text-center">
          <p>¿Estás seguro de que quieres eliminar al cliente <strong>{{ clientToDelete.nombre }} {{ clientToDelete.apellidos }}</strong>?</p>
          <p class="text-danger">Esta acción no se puede deshacer.</p>
          <div class="mt-3">
            <b-button variant="danger" @click="deleteUser" class="mr-2">Eliminar</b-button>
            <b-button variant="secondary" @click="modalDelete = false">Cancelar</b-button>
          </div>
        </div>
      </b-modal>
      <b-modal v-model="createModal" id="bv-modal-example" hide-footer>
        <template #modal-title>
          Añadir cliente
        </template>
        <div class="row">
          <div class="col-6">
            <label for="">Nombre</label>
            <input type="text" class="form-control" v-model="createUser.nombre">
          </div>
          <div class="col-6">
            <label for="">Apellidos</label>
            <input type="text" class="form-control" v-model="createUser.apellidos">
          </div>
          <div class="col-6">
            <label for="">Fecha de nacimiento (si aplica)</label>
            <input type="date" class="form-control" v-model="createUser.fechaNacimiento">
          </div>
          <div class="col-6">
            <label for="">Teléfono(s)</label>
            <input type="number" class="form-control" v-model="createUser.telefono">
          </div>
          <div class="col-6">
            <label for="">Email</label>
            <input type="text" class="form-control" v-model="createUser.email">
          </div>
          <div class="col-6">
            <label for="">Código postal</label>
            <input type="number" class="form-control" v-model="createUser.codigoPostal">
          </div>
          <div class="col-6">
            <label for="">Dirección</label>
            <input type="text" class="form-control" v-model="createUser.direccion">
          </div>
          <div class="col-6">
            <label for="">Notas adicionales</label>
            <textarea type="text" class="form-control" v-model="createUser.notas"></textarea>
          </div>
        </div>
        <b-button class="btn-search mt-4" @click="addClient">Añadir cliente</b-button>
      </b-modal>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue";
import Listados from "@/components/Listados.vue";
import Formulario from "@/components/Formulario.vue";
import { comunidades } from '../data/comunidades';
import { provincias } from '../data/provincias';
import { clientesService } from '@/services/api';
// import { useRouter } from 'vue-router';

export default {
  components: {
    Listados,
    Formulario,
  },
  setup() {
    const createUser = ref({
      nombre: '',
      apellidos: '',
      telefono: '',
      email: '',
      direccion: '',
      notas: '',
      codigoPostal: '',
      fechaNacimiento: '',
      fechaCreacion: new Date().getTime(),
    });
    const createModal = ref(false);
    const clients = ref([]);
  
    const formattedClientes = ref([]);
    const clientToEdit = ref({});
    const clientEdited = ref({});
    const modalShow = ref(false);
    const modalDelete = ref(false);
    const showSuccess = ref(false);
    const clientToDelete = ref({});
    const currentPage = ref(1);
    const userData = JSON.parse(localStorage.getItem('userInform'));
    const showAsAdmin = computed(() => {
      return userData.admin && userData.admin === true ? true : false;
    })
    
    // Nuevos filtros simplificados
    const filters = ref({
      nombre: '',
      email: '',
      telefono: '',
    });
    
    // Ordenamiento
    const order = ref('fechaCreacion');
    const orderDirection = ref('desc');
    
    const fields = [
      { key: 'dias', label: 'Días alta' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'apellidos', label: 'Apellidos' },
      { key: 'email', label: 'Correo' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'actions', label: '' }
    ];

    const fetchData = async () => {
      try {
        // Construir parámetros para la API (sin ordenamiento)
        const params = {
          // limit: 30,
          // offset: (currentPage.value - 1) * 30
        };
        
        // Agregar filtros individuales si existen
        if (filters.value.nombre.trim()) {
          params.nombre = filters.value.nombre.trim();
        }
        if (filters.value.email.trim()) {
          params.email = filters.value.email.trim();
        }
        if (filters.value.telefono.trim()) {
          params.telefono = filters.value.telefono.trim();
        }
        
        console.log('Parámetros enviados a la API:', params);
        console.log(params);
        const response = await clientesService.getAll(params);
        console.log('Respuesta de la API:', response);
        clients.value = response;
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };

    const clearFilters = () => {
      filters.value.nombre = '';
      filters.value.email = '';
      filters.value.telefono = '';
      order.value = 'fechaCreacion';
      orderDirection.value = 'desc';
      fetchData();
    };

    const handleOrderChange = () => {
      console.log('Cambio de ordenamiento:', { order: order.value, direction: orderDirection.value });
      // No necesitamos llamar a fetchData porque el ordenamiento es reactivo
      // El computed filteredClientes se actualizará automáticamente
    };

    const filteredClientes = computed(() => {
      let clientList = clients.value;
      
      // Calcular días desde la creación
      clientList.forEach(cliente => {
        if (cliente.fechaCreacion) {
          const fecha = new Date(cliente.fechaCreacion);
          const hoy = new Date();
          const diferenciaMs = hoy - fecha;
          const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
          cliente.dias = diferenciaDias;
        } else {
          cliente.dias = 0;
        }
        
        // Formatear fecha de creación para mostrar
        if (cliente.fechaCreacion) {
          cliente.fechaCreacionFormatted = new Date(cliente.fechaCreacion).toLocaleDateString('es-ES');
        }
      });
      
      // Ordenamiento en el frontend
      clientList.sort((a, b) => {
        let aValue = a[order.value];
        let bValue = b[order.value];
        
        // Manejar casos especiales
        if (order.value === 'fechaCreacion') {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        // Aplicar dirección del ordenamiento
        if (orderDirection.value === 'asc') {
          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
        } else {
          if (aValue > bValue) return -1;
          if (aValue < bValue) return 1;
        }
        
        return 0;
      });
      
      return clientList;
    });

    const editClient = (client) => {
      console.log(client);
      clientToEdit.value = client;
      modalShow.value = true;
    };

    // Función para manejar el cambio de página
    const handlePageChange = (page) => {
      currentPage.value = parseInt(page);
      fetchData();
    };

    const addClient = async () => {
      const response = await clientesService.create(createUser.value);
      createUser.value = {
        nombre: '',
        apellidos: '',
        telefono: '',
        email: '',
        direccion: '',
        notas: '',
        codigoPostal: '',
        fechaNacimiento: '',
        fechaCreacion: new Date().getTime(),
      }
      createModal.value = false;
      fetchData();
    }

    onMounted(() => {
      fetchData();
    })

    const saveChanges = async () => {
      const response = await clientesService.update(clientToEdit.value._id, clientToEdit.value);
      console.log(response);
      modalShow.value = false;
      fetchData();
      console.log(clientToEdit.value._id);
    }

    const deleteUser = async () => {
      try {
        await clientesService.delete(clientToDelete.value._id);
        showSuccess.value = true;
        modalDelete.value = false;
        fetchData();
        setTimeout(() => {
          showSuccess.value = false;
        }, 3000);
      } catch (error) {
        console.error("Error al eliminar el cliente:", error);
      }
    }

    const navigateToProfile = (client) => {
      return {
        name: 'UserProfile',
        params: { id: client._id }
      };
    };

    return {
      navigateToProfile,
      createUser,
      saveChanges,
      createModal,
      fields,
      filteredClientes,
      editClient,
      modalShow,
      clientToEdit,
      modalDelete,
      clientToDelete,
      showSuccess,
      showAsAdmin,
      addClient,
      deleteUser,
      deleteClient: (client) => {
        clientToDelete.value = client;
        modalDelete.value = true;
      },
      filters,
      order,
      orderDirection,
      clearFilters,
      handleOrderChange,
      fetchData,
      currentPage,
      handlePageChange
    }
  }
};
</script>

<style scoped>
.listado-clientes-container {
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

.table-header h2 {
  margin: 0;
  color: #1b6659;
  font-size: 24px;
  font-weight: 700;
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

.filters-content {
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-control {
  padding: 10px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}

.btn-search, .btn-clear {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  width: 100%;
  margin-bottom: 10px;
}

.btn-search {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.3);
}

.btn-clear {
  background: rgba(189, 195, 199, 0.2);
  color: #7f8c8d;
}

.btn-search:hover, .btn-clear:hover {
  transform: translateY(-2px);
}

.btn-search:hover {
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}

/* Botones de acción en la tabla */
.btn-edit, .btn-delete, .btn-view {
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

.btn-delete {
  color: #e74c3c;
}

.btn-view {
  color: #e67e22;
}

.btn-edit:hover {
  color: #2d8a7a;
}

.btn-delete:hover {
  color: #c0392b;
}

.btn-view:hover {
  color: #d35400;
}

/* Responsive adjustments */
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
  .table-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  .btn-add {
    align-self: center;
  }
}
</style>
