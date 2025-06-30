<template>
  <div>
    <form @submit.prevent="sendInfo">
      <div class="row">
        <!-- Campos del formulario -->
        <div class="col-md-6">
          <fg-input v-model="user.nombre" type="text" label="Nombre" placeholder="Nombre" />
        </div>
        <div class="col-md-6">
          <fg-input v-model="user.apellidos" type="text" label="Apellidos" placeholder="Apellidos" />
        </div>
        <div class="col-md-6">
          <fg-input v-model="user.correo" type="text" label="Correo" placeholder="Correo" />
        </div>
        <div v-if="!client" class="col-md-6">
          <fg-input v-model="user.tel" type="text" label="Teléfono" placeholder="Teléfono" />
        </div>
        <div class="custom-select-wrapper col-md-6">
          <label for="">Comunidad Autonoma</label>
          <select v-model="user.comunidad" class="custom-select">
            <option v-for="(com, index) in comunidades" :key="index" :value="index">{{ com }}</option>
          </select>
        </div>
        <div class="custom-select-wrapper col-md-6">
          <label for="">Provincias</label>
          <select v-model="user.provincia" class="custom-select">
            <option v-for="(pro, index) in provincias" :key="index" :value="index">{{ pro }}</option>
          </select>
        </div>
        <div class="custom-select-wrapper col-md-6 mt-2">
          <fg-input v-model="user.poblacion" type="text" label="Población" placeholder="Población" />
        </div>
        <div class="custom-select-wrapper col-md-6 mt-2">
          <label style="display:block;">Observaciones</label>
          <textarea v-model="user.observaciones" type="text" label="Observaciones" rows="3" style="width:100%; border:none; background-color: #fffcf5; padding: 7px 18px;" />
        </div>
        <div v-if="!client && !isDespacho" class="custom-select-wrapper col-md-12 mb-3">
          <b-form-checkbox id="checkbox-1" v-model="altaCaso" name="checkbox-1"> Dar de alta caso </b-form-checkbox>
          <b-form-checkbox v-if="caso.tipoCliente === '0'" id="checkbox-2" v-model="necesitaAbogado" name="checkbox-2"> Necesita abogado </b-form-checkbox>
        </div>
        
        <div v-if="altaCaso" class="col-12">
          <h3>Datos del caso </h3>
        </div>
        <div v-if="altaCaso" class="custom-select-wrapper col-md-6">
          <label for="">Tipo de contacto</label>
          <select v-model="caso.especialidad" class="custom-select">
            <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
          </select>
        </div>
        <div v-if="altaCaso && !isDespacho" class="custom-select-wrapper col-md-6">
          <label for="">Tipo de cliente</label>
          <select v-model="caso.tipoCliente" class="custom-select">
            <option value="0">Particular</option>
            <option value="1">Despacho</option>
          </select>
        </div>
        <div v-if="caso.tipoCliente === '1' && !isDespacho" class="custom-select-wrapper col-md-6">
          <label for="">Despacho</label>
          <select v-model="despacho" class="custom-select">
            <option v-for="(desp, index) in despachos" :key="index" :value="desp">{{ desp.nombre }}</option>
          </select>
        </div>
        <!-- <div v-if="caso.tipoCliente === '1'" class="custom-select-wrapper col-md-6 mt-2">
          <fg-input v-model="caso.nombreDespacho" type="text" label="Nombre del despacho" placeholder="Despacho" />
        </div> -->
        <div class="col-12 text-center mt-4 py-2">
          <p-button type="info" round @click.native.prevent="sendInfo">
            {{ client ? 'Editar cliente' : 'Dar de alta cliente' }}
          </p-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { db } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, getDocs } from 'firebase/firestore';
import { comunidades } from '../data/comunidades';
import { provincias } from '../data/provincias';

export default {
  props: {
    client: {
      type: Object,
      require: false,
    },
  },
  setup(props, { emit }) {
    const altaCaso = ref(0);
    const necesitaAbogado = ref(0);
    const despachos = ref([]);
    const despacho = ref(null);
    const user = ref({
      nombre: '',
      apellidos: '',
      correo: '',
      tel: '',
      comunidad: '',
      provincia: '',
      poblacion: '',
      
      observaciones: 'Abogados: \nPlazos: \nHistoria clínica:',
      confirmaCaso: '0',
    });
    const userConnected = ref({});
    const isDespacho = computed(() => {
      return userConnected.value.despacho;
    });
    const caso = ref({
      nombreDespacho: '',
      idDespacho: '',
      tipoCliente: '',
      especialidad: '',
      status: '0',
      confirmaCaso: '0',
      necesitaAbogado: '0',
      statusAbogado: null,
    });
    const especialidades = ref([]);
    const fetchData = async () => {
      especialidades.value = (await getDocs(collection(db, 'especialidades'))).docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      despachos.value = (await getDocs(collection(db, 'despachos'))).docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      despachos.value.sort((a, b) => {
        if (typeof a['nombre'] === 'string') {
          if (a['nombre'].toLowerCase() < b['nombre'].toLowerCase()) return -1;
          if (a['nombre'].toLowerCase() > b['nombre'].toLowerCase()) return 1;
        } else {
          if (a['nombre'] < b['nombre']) return -1;
          if (a['nombre'] > b['nombre']) return 1;
        }
        return 0;
      });

      if (userConnected.value.despacho) {
        const despachoRes = despachos.value.find(desp => desp.nombre === userConnected.value.nombre);
        console.log(despachoRes);
        console.log(userConnected.value.tipoCliente);
        altaCaso.value = true;
        despacho.value = despachoRes;
        caso.value.idDespacho = despachoRes.id;
        caso.value.nombreDespacho = despachoRes.nombre;
        caso.value.tipoCliente = '1';
      }
    };

    onMounted(() => {
      userConnected.value = JSON.parse(localStorage.getItem('userInform'));

      fetchData();
    });

    if  (props.client) {
        user.value = { ...props.client };
        user.value.comunidad = comunidades.findIndex((com) => com === user.value.comunidad)
        user.value.provincia = provincias.findIndex((pro) => pro === user.value.provincia)
    }

    const sendInfo = () => {
      if (despacho.value) {
        caso.value.idDespacho = despacho.value.id;
        caso.value.nombreDespacho = despacho.value.nombre;
      }
      caso.value.necesitaAbogado = necesitaAbogado.value ? '1' : '0';
      caso.value.statusAbogado = necesitaAbogado.value ? '0' : null;
      emit("sendForm", { ...user.value }, { ...caso.value });
      user.value = {
        nombre: '',
        apellidos: '',
        correo: '',
        tel: '',
        comunidad: '',
        provincia: '',
        poblacion: '',
        observaciones: 'Abogados: \nPlazos: \nHistoria clínica:',
        confirmaCaso: '0',
      };

      caso.value = {
        nombreDespacho: '',
        idDespacho: '',
        tipoCliente: '',
        especialidad: '',
        status: '0',
        confirmaCaso: '0',
        necesitaAbogado: '0',
        statusAbogado: null,
      };
    };

    return {
      user,
      isDespacho,
      caso,
      comunidades,
      provincias,
      altaCaso,
      especialidades,
      necesitaAbogado,
      sendInfo,
      despachos,
      despacho,
    };
  },
};
</script>

<style>
.custom-select-wrapper {
  position: relative;
  width: 300px;
}

.custom-select {
  appearance: none;
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fffcf5 !important;
  color: #66615b;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  position: relative;
}

.custom-select:focus {
  border-color: #007BFF;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.custom-select-wrapper::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 25px;
  width: 10px;
  height: 10px;
  background.color: #fffcf5;
  clip-path: polygon(100% 0%, 0 0%, 50% 100%);
  transform: translateY(-50%);
  pointer-events: none;
}
</style>
