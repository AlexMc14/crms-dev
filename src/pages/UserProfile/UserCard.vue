<template>
  <card class="card-user">
    <b-alert v-if="showSuccess" variant="success" style="position: fixed; width: 100%; top: 0px; z-index: 9999;" show>Observación modificada con exito</b-alert>
      <div>
        <h4 class="title">
          {{ user.apellidos ?  `${user.nombre} ${user.apellidos}` : `${user.nombre}` }}
        </h4>
      </div>
      <div v-for="(data, index) in dataUser" :key="index">
        <div v-if="data.visible" class="mt-2">
          <label v-if="data.label" for="" style="display:block;">{{ data.label }} <a v-if="data.label === 'Observaciones'" @click="editObs === true ? editObs = false : editObs = true" class="text-blue">Editar</a></label>
          <span>{{ data.span }}</span>
          <textarea v-if="data.label === 'Observaciones' && editObs === true" v-model="user.observaciones" name="" id="" cols="30" rows="10"></textarea>
          <br>
          <a v-if="data.label === 'Observaciones' && editObs === true" @click="updateObs" class="text-blue">Guardar</a>
        </div>
      </div>
      <div v-if="!isClient && showAsAdmin" class="mt-4 text-blue" style="color: rgb(0, 123, 255);" @click="$emit('permisosUsuario')">
        Gestionar permisos
      </div>
      <div v-if="showAsAdmin && typeUser !== 'despacho'" class="mt-2">
        <a :href="`https://wa.me/34${user.tel}`" target="_blank">Abrir en WhatsApp</a><br>
        <a :href="`tel:+34${user.tel}`">Llamar</a>
      </div>
      <chat v-if="user.tel && caseDetail && url.includes('cliente')" :caseDetail="caseDetail" :userCase="user" />
  </card>
</template>
<script>
import { computed, ref } from "vue";
import { comunidades } from '../../data/comunidades';
import { provincias } from '../../data/provincias';
import { db, storage } from '../../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, addDoc, getDocs, where, query, doc, updateDoc } from 'firebase/firestore';
import Chat from "./components/Chat.vue";

export default {
  props: {
    user: {
      type: Object,
    },
    isClient: {
      type: Boolean
    },
    typeUser: {
      type: String
    },
    caseDetail: {
      type: Object,
    }
  },
  components: {
    Chat,
  },
  setup(props) {
    const url = computed(() => window.location.href);
    const editObs = ref(false);
    const showSuccess = ref(false);
    const obsModify = computed(() => props.user.observaciones);
    const formatDate = (date) => {
      if (!date) return 'NA';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0'); // getMonth() es cero-indexado
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };
    const userData = JSON.parse(localStorage.getItem('userInform'));
    const showAsAdmin = computed(() => {
      return userData.admin && userData.admin === true ? true : false;
      // return userData.admin && userData.admin === true ? true : false;
    })
    const dataUser = computed(() => {
      return [
        { span: props.user.tel, visible: showAsAdmin.value },
        { span: props.user.correo, visible: showAsAdmin.value },
        { span: comunidades[props.user.comunidad] ?  comunidades[props.user.comunidad] : props.user.comunidad, visible: true },
        { span: provincias[props.user.provincia] ?  provincias[props.user.provincia] : props.user.provincia, visible: true },
        { span: props.user.poblacion, visible: true },
        { span: props.user.especialista ? props.user.especialista : '', label: 'Especialidad:', visible: props.user.especialista },
        { span: props.user.observaciones, label: 'Observaciones', visible: props.isClient && showAsAdmin.value },
        { span: formatDate(props.user.time), label: 'Fecha perfil creado:', visible: showAsAdmin.value},
      ]      
    })

    const updateObs = (async () => {
      const clienteDocRef = doc(db, 'clientes', props.user.id);
      // const espeObs = []
      // especialidades.value.forEach((item) => {
      //       if (verEspe.value.includes(item.id)) {
      //     espeObs.push((item));
      //   }
      // })
      await updateDoc(clienteDocRef, {
        // userCreated: true,
        observaciones: obsModify.value,
      });
      showSuccess.value = true;
      setTimeout(() => {
        showSuccess.value = false;
      }, 4000);
    })
    return {
      formatDate,
      comunidades,
      provincias,
      showAsAdmin,
      dataUser,
      editObs,
      obsModify,
      showSuccess,
      url,
      updateObs
    }
  }
};
</script>
<style></style>
