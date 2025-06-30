<template>
  <div>
    <form @submit.prevent="sendInfo">
      <div class="row">
        <div class="col-12">
          <h3>Datos del caso </h3>
        </div>
        <div class="custom-select-wrapper col-md-6">
          <label for="">Tipo de contacto</label>
          <select v-model="caso.especialidad" class="custom-select">
            <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
          </select>
        </div>
        <div class="custom-select-wrapper col-md-6">
          <label for="">Tipo de cliente</label>
          <select v-model="caso.tipoCliente" class="custom-select">
            <option value="0">Particular</option>
            <option value="1">Despacho</option>
          </select>
        </div>
        <div v-if="caso.tipoCliente === '1'" class="custom-select-wrapper col-md-6">
          <fg-input type="text" label="Nombre del despacho" placeholder="Despacho" />
        </div>
         <div class="custom-select-wrapper col-md-12 mt-4">
          <label for="">Necesita llamada de confirmacion</label>
          <select v-model="caso.confirmaCaso" class="custom-select">
            <option value="0">SI Necesita segunda llamada</option>
            <option value="1">NO Necesita segunda llamada</option>
          </select>
        </div>
        <div class="col-12 text-center mt-4">
          <p-button type="info" round @click.native.prevent="sendInfo">
            Dar de alta caso
          </p-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { db } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, getDocs } from 'firebase/firestore';

export default {
  props: {
    client: {
      type: Object,
      require: false,
    },
  },
  setup(props, { emit }) {
    const caso = ref({
      nombreDespacho: '',
      tipoCliente: '',
      especialidad: '',
      status: '0',
      confirmaCaso: '1',
    });

    const especialidades = ref([]);
    const fetchData = async () => {
      especialidades.value = (await getDocs(collection(db, 'especialidades'))).docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    };

    const sendInfo = () => {
      emit("sendCase", { ...caso.value });
    };

    onMounted(() => {
      fetchData();
    });

    return {
      caso,
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
