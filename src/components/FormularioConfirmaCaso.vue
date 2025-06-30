<template>
  <div>
    <form v-if="cases.length > 0" @submit.prevent="sendInfo">
      <div class="row">
        <div class="col-12">
          <h3>Datos del caso </h3>
        </div>
         <div class="col-md-12">Cliente: {{ cliente.nombre + ' ' + cliente.apellidos }}</div>
      <div class="col-md-12 mt-2">
        Telefono cliente: {{ cliente.tel }}
        <a class="mr-3" :href="`https://wa.me/34${cliente.tel}`" target="_blank">Abrir en WhatsApp</a>
        <a :href="`tel:+34${cliente.tel}`">Llamar</a>
      </div>
      <div class="col-md-12 mt-2">Correo: {{ cliente.correo }}</div>
      <div class="col-md-12 mt-2">Residencia cliente: {{ cliente.comunidad + ' (' + cliente.provincia + ')' }}</div>
      <!-- <div class="col-md-12 mt-2">Observaciones: {{ cliente.observaciones }}</div> -->
       <div class="custom-select-wrapper col-md-12 mt-1">
          <label style="display:block;">Observaciones</label>
          <textarea v-model="cliente.observaciones" type="text" label="Observaciones" style="width:100%; border:none; background-color: #fffcf5; padding: 7px 18px;" />
        </div>
        <div class="custom-select-wrapper col-md-6 mt-3">
          <label for="">Tipo de contacto</label>
          <select v-model="caso.especialidad" class="custom-select">
            <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
          </select>
        </div>
        <div class="custom-select-wrapper col-md-6 mt-3">
          <label for="">Tipo de cliente</label>
          <select v-model="caso.tipoCliente" class="custom-select">
            <option value="0">Particular</option>
            <option value="1">Despacho</option>
          </select>
        </div>
        <div v-if="caso.tipoCliente === '1'" class="custom-select-wrapper col-md-6">
          <fg-input v-model="caso.nombreDespacho" type="text" label="Nombre del despacho" placeholder="Despacho" />
        </div>
        <div class="col-12 text-center mt-4">
          <p-button type="info" round @click.native.prevent="sendInfo">
            Confirmar caso
          </p-button>
        </div>
      </div>
    </form>
    <div v-else>
        No hay casos asignados debes agregarle un caso
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { db } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, getDocs } from 'firebase/firestore';

export default {
  props: {
    case: {
      type: Object,
      require: false,
    },
    cases: {
      type: Array,
      require: false,
    },
    user: {
      type: Object,
      require: false,
    }
  },
  setup(props, { emit }) {
    const caso = ref(props.case);
    const cliente = ref(props.user);

    const especialidades = ref([]);
    const fetchData = async () => {
      especialidades.value = (await getDocs(collection(db, 'especialidades'))).docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    };

    const sendInfo = () => {
      emit("sendCheckCase", { ...caso.value }, { ...cliente.value });
    };

    onMounted(() => {
      fetchData();
    });

    return {
      caso,
      cliente,
      sendInfo,
      especialidades,
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
