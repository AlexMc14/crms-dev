<template>
  <div>
    <Listados :current-page="currentPage" @page-changed="handlePageChange" :items="[...(casesItems || [])].sort((a, b) => {
    // Aseguramos que `fechaAlta` existe antes de convertirla
    const fechaA = a.fechaAlta ? new Date(a.fechaAlta.split('/').reverse().join('-')) : new Date(0);
    const fechaB = b.fechaAlta ? new Date(b.fechaAlta.split('/').reverse().join('-')) : new Date(0);

    return fechaB - fechaA; // Orden ascendente
  })" :fields="filteredFields" >
      <template #filters>
        <Formulario 
          :formClass="'form-filters'" 
          :fieldClass="'col-4'" 
        />
      </template>

      <template v-if="showAsAdmin" #order>
        <div class="col-3 pl-0">
          <label for="">Filtrar por:</label>
          <select v-model="filterCases" class="custom-select">
            <option key="1" value="all">Todos los casos</option>
            <option key="2" value="confirmed">Presupuesto aceptado</option>
          </select>
        </div>
      </template>

      <template #tableActions="{ data }">
        <b-button v-if="data.item.telCliente !== null && data.item.telEspecialista !== null" class="my-3 mx-3" size="sm" @click="guardaCaso(data.item)">
          Ver Detalle
        </b-button>
        <b-button v-if="showAsAdmin" class="my-3 mx-3" size="sm" @click="mueveCaso(data.item)">
          Mover estado
        </b-button>
      </template>
    </Listados>

    <!-- <b-table
      v-if="cases.length > 0"
      striped
      hover
      :items="cases"
      :fields="filteredFields"
    >
      <template #filters>
        <span>Hola</span>
      </template>
      <template #cell(actions)="data" class="text-center">
        <b-button v-if="data.item.telCliente !== null && data.item.telEspecialista !== null" class="my-3 mx-3" size="sm" @click="guardaCaso(data.item)">
          Ver Detalle
        </b-button>
        <b-button v-if="showAsAdmin" class="my-3 mx-3" size="sm" @click="mueveCaso(data.item)">
          Mover estado
        </b-button>
      </template>
    </b-table> -->
    <b-modal v-model="editEstado" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Mover estado
      </template>
      <select v-model="casoChange" class="custom-select">
        <option v-for="(estado, index) in estadosFilter" :key="index" :value="estado">{{ estado }}</option>
      </select>
      <!-- <i class="mt-3" style="white-space-collapse: preserve-breaks;">
        *Para poder ver reflejado el cambio de especialista tienes que volver al listado principal del cual viniste.
      </i> -->
      <p-button class="mt-4" type="info" round @click.native.prevent="updateCase">
        Aceptar
      </p-button>
      <!-- <formulario-especialista @sendForm="recivedInfo" :client="espeToEdit" /> -->
    </b-modal>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import { moverCasoSinAsignar, moverClientesSinPresupuesto, moverClientesPresupuestoPendiente, moverClientesPorLlamar } from '../../data/estados';
import Listados from "@/components/Listados.vue";

export default {
  components: {
    Listados,
  },
  props: {
    cases: {
      type: Array,
      required: true
    },
  },
  setup(props, { emit }) {
    const filterCases = ref('all');
    const estados = ref(['Caso sin asignar', 'Cliente sin presupuesto', 'Presupuesto pendiente', 'Presupuesto aceptado']);
    const estadosFilter = ref([]);
    const userData = JSON.parse(localStorage.getItem('userInform'));
    const currentPage = ref(1);

    const showAsAdmin = computed(() => {
      return userData.admin && userData.admin === true ? true : false;
      // return userData.routes.some((rout) => rout.visibility === false)
    })

    const showAsSuperAdmin = computed(() => {
      return userData.superAdmin && userData.superAdmin === true ? true : false;
      // return userData.routes.some((rout) => rout.visibility === false)
    })

    const casesItems = ref(props.cases);

    const fields = showAsSuperAdmin.value ? [
      { key: 'nombreCompleto', label: 'Nombre apellidos' },
      { key: 'fechaAlta', label: 'Fecha de alta caso' },
      { key: 'estadoCaso', label: 'Estado del caso' },
      { key: 'especialidadNombre', label: 'Especialidad' },
      { key: 'pago', label: 'Pagado cliente' },
      { key: 'actions', label: 'Acciones' }
    ] : [
      { key: 'nombreCompleto', label: 'Nombre apellidos' },
      { key: 'fechaAlta', label: 'Fecha de alta caso' },
      { key: 'estadoCaso', label: 'Estado del caso' },
      { key: 'especialidadNombre', label: 'Especialidad' },
      { key: 'actions', label: 'Acciones' }
    ];

    const itemMueve = ref(null);
    const editEstado = ref(false);
    const casoChange = ref(null);

    // Computed property para filtrar los campos
    const filteredFields = computed(() => {
      const user = JSON.parse(localStorage.getItem('userInform'));
      console.log(user)
      // Agrega lógica aquí si quieres condicionar la visibilidad de los campos
      const shouldShowActions = user.routes.some((rout) => rout.visibility === false)

      return shouldShowActions 
        ? fields.filter(field => field.key !== 'estadoCaso') 
        : fields; // Remueve el campo 'actions' si no se cumplen las condiciones
    });

    const guardaCaso = (item) => {
      emit('wantSeeCase', item);
    };

    watch(filterCases, (newValue) => {
     casesItems.value = props.cases.filter((item) => {
       if (newValue === 'confirmed') {
         return item.estadoCaso === 'Presupuesto aceptado';
       }
       return true;
     });
    });

    return {
      filteredFields,
      estados,
      guardaCaso,
      itemMueve,
      editEstado,
      casoChange,
      estadosFilter,
      showAsAdmin,
      filterCases,
      casesItems,
      currentPage,
      handlePageChange: (page) => {
        currentPage.value = page;
      },
      updateCase: () => {
        switch (casoChange.value) {
          case 'Caso sin asignar':
            moverCasoSinAsignar(itemMueve.value.id);
            break;
          case 'Cliente sin presupuesto':
            moverClientesSinPresupuesto(itemMueve.value.id);
            break;
          case 'Presupuesto pendiente':
            moverClientesPresupuestoPendiente(itemMueve.value.id);
            break;
          case 'Presupuesto aceptado':
            moverClientesPorLlamar(itemMueve.value.id);
            break;
          default:
            break;
        }
        editEstado.value = false;
      },
      mueveCaso: (item) => {
        itemMueve.value = item;
        editEstado.value = true;
        const index = estados.value.findIndex((estado) => estado === item.estadoCaso);
        estadosFilter.value = estados.value.slice(0, index);

      },
    };
  }
};
</script>
