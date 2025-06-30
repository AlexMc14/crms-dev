<template>
  <div>
    <b-alert v-if="showSuccess" variant="success" style="position: fixed; width: 100%; top: 0px; z-index: 9999;" show>Cliente borrado correctamente</b-alert>
    <h2>Listado clientes genérico</h2>
    <b-button @click="createModal = true">Añadir cita</b-button>
    <Listados :items="filteredClientes" :fields="fields" :current-page="currentPage" @page-changed="handlePageChange">
      <template #filters>
        <Formulario 
          :filters="filterFields" 
          :formClass="'form-filters'" 
          :fieldClass="'col-4'" 
          @submit="handleFiltersSubmit"
          @search="fetchData"
          :initialData="filters"
        />
        <b-button class="mt-2" variant="primary" @click="fetchData">Buscar</b-button>
      </template>

      <template #order>
        <div class="col-3 pl-0">
          <label for="">Ordenar por:</label>
          <select v-model="order" class="custom-select">
            <option v-for="(field, index) in orderColumnList" :key="index" :value="field.key">{{ field.label }}</option>
          </select>
        </div>
      </template>

      <template #tableActions="{ data }">
        <b-button v-if="showAsAdmin" size="sm" class="ml-3" @click="editClient(data.item)">Editar cliente</b-button>
        <b-button v-if="showAsAdmin" size="sm" class="ml-3 mt-3" @click="deleteClient(data.item)">Borrar cliente</b-button>
        <!-- <b-button v-if="showAsAdmin" size="sm" class="ml-3 mt-3" @click="newCase(data.item)">Agregar caso</b-button> -->
        <b-button class="mt-3 mx-3" size="sm" @click="$router.push(navigateToProfile(data.item))">Ver cliente</b-button>
        <!-- <b-button size="sm" class="ml-1" variant="info" @click="editClient(data.item)"><b-icon icon="pencil" variant="white"></b-icon></b-button>
        <b-button size="sm" class="ml-1" variant="info" @click="deleteClient(data.item)"><b-icon icon="trash" variant="white"></b-icon></b-button>
        <b-button class="ml-1" size="sm" variant="info" @click="$router.push({ name: 'UserProfile', params: { id: data.item.id }, query: { type: 'cliente'} })"><b-icon icon="eye" variant="white"></b-icon></b-button> -->
      </template>
    </Listados>
    <b-modal v-model="modalOpenCase" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Ver caso abierto
      </template>
      <formulario-confirma-caso @sendCheckCase="recivedCheckCase" :cases="cases" :case="caseToEdit" />
    </b-modal>
    <b-modal v-model="modalShow" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Editar cliente
      </template>
      <formulario-cliente @sendForm="recivedInfo" :client="clientToEdit" />
    </b-modal>
    <b-modal v-model="modalCase" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Agregar caso
      </template>
      <formulario-caso @sendCase="recivedCase" />
    </b-modal>
    <b-modal v-model="modalDelete" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Borrar cliente
      </template>
      <borrar-persona :client="clientToDelete" @deleteClient="deleteUser" @cancelDelete="modalDelete = false" />
    </b-modal>
    <b-modal v-model="createModal" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Añadir cliente
      </template>
      <div class="row">
        <div class="col-6">
          <label for="">Cliente</label>
          <input type="text" class="form-control" >
        </div>
        <div class="col-6">
          <label for="">Fecha</label>
          <input type="date" class="form-control" >
        </div>
        <div class="col-6">
          <label for="">Hora</label>
          <input type="hour" class="form-control" >
        </div>
        <div class="col-6">
          <label for="">Tipo de servicio</label>
          <input type="text" class="form-control" >
        </div>
        <div class="col-6">
          <label for="">Empleado asignado</label>
          <input type="number" class="form-control" >
        </div>
        <div class="col-6">
          <label for="">Estado</label>
          <input type="text" class="form-control" >
        </div>
        <div class="col-6">
          <label for="">Notas internas</label>
          <textarea type="text" class="form-control" ></textarea>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue";
import { db, messaging, getToken } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, getDocs, doc, updateDoc, addDoc, where, query, deleteDoc, orderBy, limit  } from 'firebase/firestore';
import FormularioCliente from "@/components/FormularioCliente.vue";
import FormularioCaso from "@/components/FormularioCaso.vue";
import BorrarPersona from "@/components/BorrarPersona.vue";
import FormularioConfirmaCaso from "@/components/FormularioConfirmaCaso.vue";
import Listados from "@/components/Listados.vue";
import Formulario from "@/components/Formulario.vue";
import { comunidades } from '../data/comunidades';
import { provincias } from '../data/provincias';
// import { useRouter } from 'vue-router';

export default {
  components: {
    FormularioCliente,
    FormularioCaso,
    FormularioConfirmaCaso,
    BorrarPersona,
    Listados,
    Formulario,
  },
  setup() {
    const createModal = ref(false);
    const clientes = ref([]);
    const formattedClientes = ref([]);
    const clientToEdit = ref({});
    const clientEdited = ref({});
    const modalShow = ref(false);
    const modalCase = ref(false);
    const telCase = ref(null);
    const modalOpenCase = ref(false);
    const caseToEdit = ref({});
    const modalDelete = ref(false);
    const showSuccess = ref(false);
    const clientToDelete = ref({});
    const cases = ref([]);
    const currentPage = ref(1);
    const userData = JSON.parse(localStorage.getItem('userInform'));
    const showAsAdmin = computed(() => {
      return userData.admin && userData.admin === true ? true : false;
      // return userData.routes.some((rout) => rout.visibility === false)
    })
    const filters = ref({
      searchQuery: '',
      searchQueryName: '',
      searchQuerySurname: ''
    });
    const filterFields = ref([
      {
        name: "searchQuery",
        label: "Filtrar por teléfono",
        type: "input",
        placeholder: "Buscar por teléfono",
        value: ''
      },
      {
        name: "searchQueryName", 
        label: "Filtrar por nombre",
        type: "input",
        placeholder: "Buscar por nombre",
        value: ''
      },
      {
        name: "searchQuerySurname", 
        label: "Filtrar por apellidos",
        type: "input",
        placeholder: "Buscar por apellidos",
        value: ''
      },
    ]);
    const fields = [
      { key: 'dias', label: 'Dias alta' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'apellidos', label: 'Apellidos' },
      // { key: 'provincia', label: 'Provincia' },
      { key: 'correo', label: 'Correo' },
      { key: 'tel', label: 'Teléfono' },
      { key: 'comunidad', label: 'Comunidad' },
      { key: 'poblacion', label: 'Población' },
      { key: 'actions', label: '' }
    ];
    const order = ref(fields[0].key);
    const orderColumnList = computed(() => { return fields.slice(0, -1) })
    // const router = useRouter();

    const fetchData = async () => {
      let q = collection(db, "clientes");
      let queryConstraints = [];

      if (filters.value.searchQuery) {
        queryConstraints.push(where("tel", ">=", filters.value.searchQuery));
      }

      if (filters.value.searchQueryName) {
        queryConstraints.push(where("nombre", ">=", filters.value.searchQueryName));
        queryConstraints.push(where("nombre", "<=", filters.value.searchQueryName + "\uf8ff"));
      }

      if (filters.value.searchQuerySurname) {
        queryConstraints.push(where("apellidos", ">=", filters.value.searchQuerySurname));
        queryConstraints.push(where("apellidos", "<=", filters.value.searchQuerySurname + "\uf8ff"));
      }

      if (queryConstraints.length === 0) {
        queryConstraints.push(orderBy("time", "desc"), limit(30));
      }

      const querySnapshot = await getDocs(query(q, ...queryConstraints));
      
      clientes.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      formatClientes();
    };

    const handleFiltersSubmit = (filtersData) => {
      Object.assign(filters.value, filtersData);
      filterFields.value.forEach(field => {
        field.value = filtersData[field.name] || '';
      });
      saveState();
    };

    const fetchCases = async () => {
      const q = query(
        collection(db, 'casos'),
        where('confirmaCaso', '==', '0'),
        where('telCliente', '==', telCase.value)
      );

      cases.value = (await getDocs(q)).docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      caseToEdit.value = cases.value[0] 
      modalOpenCase.value = true;
    };

    const formatClientes = () => {
      formattedClientes.value = clientes.value.map(cliente => {
        const formattedCliente = { ...cliente };
        formattedCliente.comunidad = comunidades[formattedCliente.comunidad];
        formattedCliente.provincia = provincias[formattedCliente.provincia];
        formattedCliente.id = cliente.id;

        formattedCliente.time = cliente.time ? cliente.time : 1723068000000;
        const fecha = new Date(formattedCliente.time);
        const hoy = new Date();
        const diferenciaMs = hoy - fecha;
        const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
        formattedCliente.dias = diferenciaDias
        return formattedCliente;
      });
    };

    const filteredClientes = computed(() => {
      let clientList = formattedClientes.value;

      if (filters.value.searchQuery) {
        clientList = clientList.filter(cliente =>
          cliente.tel.includes(filters.value.searchQuery)
        );
      }

      if (filters.value.searchQueryName) {
        clientList = clientList.filter(cliente =>
          cliente.nombre.toLowerCase().includes(filters.value.searchQueryName.toLowerCase())
        );
      }

      if (filters.value.searchQuerySurname) {
        clientList = clientList.filter(cliente =>
          cliente.apellidos.toLowerCase().includes(filters.value.searchQuerySurname.toLowerCase())
        );
      }

      return clientList.sort((a, b) => {
        if (typeof a[order.value] === 'string') {
          if (a[order.value].toLowerCase() < b[order.value].toLowerCase()) return -1;
          if (a[order.value].toLowerCase() > b[order.value].toLowerCase()) return 1;
        } else {
          if (a[order.value] < b[order.value]) return -1;
          if (a[order.value] > b[order.value]) return 1;
        }
        return 0;
      });
    });

    const editClient = (client) => {
      clientToEdit.value = client;
      modalShow.value = true;
    };

    const saveChanges = async () => {
      try {
        const clienteDocRef = doc(db, 'clientes', clientToEdit.value.id);
        await updateDoc(clienteDocRef, clientEdited.value);
        fetchData();
        modalShow.value = false;
      } catch (error) {
        console.error('Error al actualizar el cliente:', error);
      }
    };

    const saveClientChange = async () => {
      try {
        const clienteDocRef = doc(db, 'clientes', clientToEdit.value.id);
        await updateDoc(clienteDocRef, {
          confirmaCaso: clientEdited.value.confirmaCaso
        });
        fetchData();
        modalShow.value = false;
      } catch (error) {
        console.error('Error al actualizar el cliente:', error);
      }
    };
    const reviewClient = () => {
      if(cases.value.length === 0) {
        clientToEdit.value.confirmaCaso = '1' 
        clientEdited.value = clientToEdit.value
        saveClientChange()
        modalOpenCase.value = false;
      }
    }
    const saveConfirmCase = async (c) => {
      try {
        const clienteDocRef = doc(db, 'casos', c.id);
        await updateDoc(clienteDocRef, c);
        await fetchCases();
        reviewClient();
      } catch (error) {
        console.error('Error al actualizar el cliente:', error);
      }
    };

    const recivedInfo = (receivedUser) => {
      clientEdited.value = receivedUser;
      saveChanges();
    };

    const recivedCase = async (receivedCase) => {
      receivedCase.telCliente = telCase.value;
      receivedCase.telEspecialista = null;
      receivedCase.status = '0';
      receivedCase.time = new Date().getTime();
      if (receivedCase.confirmaCaso === '0') {
        clientToEdit.value.confirmaCaso = '0'
        clientEdited.value = clientToEdit.value
        saveClientChange();
      }
      await addDoc(collection(db, 'casos'), receivedCase);
      telCase.value = null;
      modalCase.value = false;
    };

    const deleteClientsWithCondition = async () => {
      try {
        const q = query(collection(db, 'casos'), where('telCliente', '==', clientToDelete.value.tel));
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map(docSnap =>
          deleteDoc(doc(db, 'casos', docSnap.id))
        );

        await Promise.all(deletePromises);

      } catch (error) {
        console.error('Error al eliminar clientes:', error);
      }
    };

    // Función para manejar el cambio de página
    const handlePageChange = (page) => {
      currentPage.value = parseInt(page);
      saveState();
    };

    // Función para guardar el estado actual
    const saveState = () => {
      
      const stateToSave = {
        filters: {},
        order: order.value,
        currentPage: currentPage.value
      };
      
      // Guardar los valores de filterFields
      filterFields.value.forEach(field => {
        stateToSave.filters[field.name] = field.value;
      });
      
      localStorage.setItem('listadoClientesState', JSON.stringify(stateToSave));
    };

    // Función para restaurar el estado
    const restoreState = () => {
      const savedState = localStorage.getItem('listadoClientesState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        if (state.filters) {
          // Restaurar los valores en filterFields
          filterFields.value.forEach(field => {
            field.value = state.filters[field.name] || '';
          });
          
          // Actualizar también filters para mantener la sincronización
          filters.value = {
            searchQuery: state.filters.searchQuery || '',
            searchQueryName: state.filters.searchQueryName || '',
            searchQuerySurname: state.filters.searchQuerySurname || ''
          };
          
          order.value = state.order || fields[0].key;
          // Restaurar la página actual
          if (state.currentPage) {
            currentPage.value = parseInt(state.currentPage);
          }
        }
        fetchData();
      } else {
        // Si no hay estado guardado, hacer fetch inicial
        fetchData();
      }
    };

    // Modificar el watch de order para guardar el estado
    watch(order, () => {
      saveState();
    });

    // Agregar un watch para los filtros
    watch(filters, () => {
      saveState();
    }, { deep: true });

    // Agregar un watch para currentPage
    watch(currentPage, () => {
      saveState();
    });

    // Función para navegar al perfil del cliente
    const navigateToProfile = (client) => {
      saveState();
      return {
        name: 'UserProfile',
        params: { id: client.id },
        query: { type: 'cliente' }
      };
    };

    onMounted(() => {
      restoreState();
      // Añadir listener para la tecla Enter
      window.addEventListener('keyup', handleKeyPress);
    });

    // Agregar un hook beforeUnmount para guardar el estado antes de salir
    onBeforeUnmount(() => {
      saveState();
      // Remover el listener cuando el componente se desmonte
      window.removeEventListener('keyup', handleKeyPress);
    });

    // Función para manejar la tecla Enter
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        fetchData();
      }
    };

    return {
      createModal,
      formattedClientes,
      fields,
      filteredClientes,
      editClient,
      modalShow,
      clientToEdit,
      recivedInfo,
      modalDelete,
      recivedCase,
      modalCase,
      modalOpenCase,
      caseToEdit,
      cases,
      clientToDelete,
      showSuccess,
      showAsAdmin,
      deleteClient: (client) => {
        clientToDelete.value = client;
        modalDelete.value = true;
      },
      newCase: (client) => {
        clientToEdit.value = client;
        telCase.value = client.tel;
        modalCase.value = true;
      },
      openCase: (client) => {
        clientToEdit.value = client;
        telCase.value = client.tel;
        fetchCases();
      },
      recivedCheckCase: (c) => {
        c.confirmaCaso = '1';
        saveConfirmCase(c);
      },
      deleteUser: async () => {
        deleteClientsWithCondition();
        try {
          await deleteDoc(doc(db, 'clientes', clientToDelete.value.id));
          showSuccess.value = true;
          modalDelete.value = false;
          fetchData();
          setTimeout(() => {
            showSuccess.value = false;
          }, 3000);
        } catch (error) {
          console.error("Error al eliminar el documento: ", error);
        }
      },
      filterFields,
      filters,
      handleFiltersSubmit,
      order,
      orderColumnList,
      fetchData,
      navigateToProfile,
      currentPage,
      handlePageChange
    }
  }
};
</script>
