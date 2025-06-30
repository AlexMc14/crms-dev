<template>
  <div>
    <form @submit.prevent="sendInfo">
      <div class="row">
        <!-- Campos del formulario -->
        <div class="col-md-6">
          <fg-input v-model="user.nombre" type="text" label="Nombre" placeholder="Nombre" />
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
        <div class="col-12 text-center mt-4">
          <p-button type="info" round @click.native.prevent="sendInfo">
            Editar despacho
          </p-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
// import { db } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
// import { collection, getDocs } from 'firebase/firestore';
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
    const despachos = ref([]);
    const despacho = ref(null);
    const user = ref({
        nombre: '',
        correo: '',
        tel: '',
        comunidad: '',
        provincia: '',
        poblacion: '',
        time: new Date().getTime(),
    })
    const especialidades = ref([]);

    onMounted(() => {
    });

    if  (props.client) {
        user.value = { ...props.client };
        // user.value.comunidad = comunidades.findIndex((com) => com === user.value.comunidad)
        // user.value.provincia = provincias.findIndex((pro) => pro === user.value.provincia)
    }

    const sendInfo = () => {
      emit("sendForm", { ...user.value });
      user.value = {
        nombre: '',
        correo: '',
        tel: '',
        comunidad: '',
        provincia: '',
        poblacion: '',
      };
    };

    return {
      user,
      comunidades,
      provincias,
      altaCaso,
      especialidades,
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
