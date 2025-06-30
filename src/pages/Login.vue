<template>
  <div>
    <b-alert v-if="errorMessage !== ''" variant="danger" style="position: fixed; width: 100%; top: 0px; z-index: 9999;" show>{{ errorMessage }}</b-alert>
    <Formulario 
      :filters="filterFields" 
      :formClass="'form-filters mx-5 my-5 py-5'" 
      :fieldClass="'col-12'"
      :btnText="'Login'"
      :immediateSubmit="false"
      @submit="handleFiltersSubmit"
    />
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, getDocs, where, query } from 'firebase/firestore';
import Formulario from "@/components/Formulario.vue";

export default {
  components: {
    Formulario,
  },
  data() {
    return {
      mail: '',
      password: '',
      errorMessage: '',
      libraryErrors: ['Email inválido', 'Contraseña incorrecta'],
      dataForm: {
        mail: '',
        password: '',
      },
      filterFields: [{
        name: "mail",
        label: "Usuario",
        type: "input",
        typeInput: 'text',
        placeholder: "Usuario",
      },
      {
        name: "password", 
        label: "Contraseña",
        type: "input",
        typeInput: 'password',
        placeholder: "Contraseña",
      },
    ]
    }
  },
  methods: {
    login() {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, this.dataForm.mail, this.dataForm.password)
        .then(async (userCredential) => {
          // Si el login es exitoso, redirige al usuario
          this.$router.push('/'); // Redirigir a la página home
          const q = query(collection(db, 'especialistas'), where('correo', '==',this.dataForm.mail));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.docs.length > 0) {
            localStorage.setItem("userInform", JSON.stringify(querySnapshot.docs[0].data()));
          } else {
            console.error('No se encontroooo')
          }
          console.log('Login exitoso:', userCredential.user);
        })
        .catch((error) => {
          // Manejo de errores
          console.error('Error en el login:', error.message);
          if (error.message.includes('invalid-email')) {
            this.errorMessage = this.libraryErrors[0];
          } else {
            this.errorMessage = this.libraryErrors[1];
          }
        });
    },
    handleFiltersSubmit (data) {
      Object.assign(this.dataForm, data);
      this.login();
    },
  }
};
</script>

<style scoped>
.W100 {
  width: 100%;
}
</style>
