<template>
  <div class="login-container">
    <b-alert v-if="errorMessage !== ''" variant="danger" style="position: fixed; left: 0px; width: 100%; top: 0px; z-index: 9999;" show>{{ errorMessage }}</b-alert>
    <form @submit.prevent="login" class="form-filters mx-5 my-5 py-5">
      <div class="form-group">
        <label for="mail">Usuario</label>
        <input v-model="mail" id="mail" type="text" class="form-control" placeholder="Usuario" autocomplete="username" />
      </div>
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input v-model="password" id="password" type="password" class="form-control" placeholder="Contraseña" autocomplete="current-password" />
      </div>
      <button type="submit" class="btn btn-primary btn-block">Login</button>
    </form>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { setTenantId, plataformaLookup } from '../services/api';
import { seccionesDinamicasService } from '../services/api/queries';
import { db } from '../firebase';
import { collection, getDocs, where, query } from 'firebase/firestore';

export default {
  data() {
    return {
      mail: '',
      password: '',
      errorMessage: '',
      libraryErrors: ['Email inválido', 'Contraseña incorrecta'],
    }
  },
  methods: {
    async login() {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.mail, this.password);
        console.log(userCredential);
        // Lookup de plataforma para obtener tenantId
        const lookupResp = await plataformaLookup(this.mail);
        if (lookupResp && lookupResp.plataformaId) {
          localStorage.setItem('tenantId', lookupResp.plataformaId);
          setTenantId(lookupResp.plataformaId);
          // Obtener secciones del CRM y redirigir a la primera disponible
          try {
            const secciones = await seccionesDinamicasService.getAll();
            const seccionesArray = Array.isArray(secciones) ? secciones : (secciones.data || []);
            
            if (seccionesArray.length > 0) {
              // Redirigir a la primera sección disponible
              const primeraSeccion = seccionesArray[0];
              const seccionPath = `/crm-seccion/${this.sanitizePath(primeraSeccion.nombre)}`;
              this.$router.push(seccionPath);
            } else {
              // Si no hay secciones, ir al CRM dinámico
              this.$router.push('/crm-dinamico');
            }
          } catch (error) {
            console.error('Error al cargar secciones:', error);
            // Fallback al CRM dinámico
            this.$router.push('/crm-dinamico');
          }
        } else {
          this.errorMessage = 'No se pudo obtener la plataforma asociada a este usuario.';
          setTimeout(() => { this.errorMessage = ''; }, 3000);
        }
      } catch (error) {
        console.error('Error en el login:', error.code, error.message);
        if (error.code === 'auth/user-not-found') {
          this.errorMessage = 'El usuario no existe';
        } else if (error.code === 'auth/wrong-password') {
          this.errorMessage = 'Contraseña incorrecta';
        } else if (error.code === 'auth/invalid-email') {
          this.errorMessage = 'Email inválido';
        } else {
          this.errorMessage = 'Error al iniciar sesión';
        }
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    },
    sanitizePath(name) {
      // Convertir nombre a path válido (mismo método que en DashboardLayout)
      return name.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    },
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 60px auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 2rem 2.5rem;
}
.btn-block {
  width: 100%;
}
</style>
