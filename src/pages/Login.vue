<template>
  <div class="login-container">
    <b-alert v-if="errorMessage !== ''" variant="danger" style="position: fixed; left: 0px; width: 100%; top: 0px; z-index: 9999;" show>{{ errorMessage }}</b-alert>
    <div class="logo-container">
      <img :src="logoUrl" alt="Logo" class="login-logo" />
    </div>
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
import { setTenantId, plataformaLookup, checkTenantIdStatus } from '../services/api';
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
      logoUrl: require('@/assets/img/crms.svg')
    }
  },
  methods: {
    async login() {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.mail, this.password);
        console.log('🔥 Login exitoso:', userCredential);
        
        // Lookup de plataforma para obtener tenantId
        console.log('🔍 Buscando plataforma para:', this.mail);
        try {
          const lookupResp = await plataformaLookup(this.mail);
          console.log('📋 Respuesta de plataforma lookup:', lookupResp);
          
          if (lookupResp && lookupResp.plataformaId) {
            console.log('✅ Plataforma encontrada, estableciendo tenant-id:', lookupResp.plataformaId);
            localStorage.setItem('tenantId', lookupResp.plataformaId);
            setTenantId(lookupResp.plataformaId);
            
            // Verificar que se estableció correctamente
            setTimeout(() => {
              checkTenantIdStatus();
            }, 500);
            
            // Obtener secciones del CRM y redirigir a la primera disponible
            try {
              const secciones = await seccionesDinamicasService.getAll();
              const seccionesArray = Array.isArray(secciones) ? secciones : (secciones.data || []);
              
              if (seccionesArray.length > 0) {
                // Redirigir a la primera sección disponible
                const primeraSeccion = seccionesArray[0];
                const seccionPath = `/crm-seccion/${this.sanitizePath(primeraSeccion.nombre)}`;
                console.log('🔄 Redirigiendo a:', seccionPath);
                this.$router.push(seccionPath);
              } else {
                // Si no hay secciones, ir al CRM dinámico
                console.log('🔄 Redirigiendo a CRM dinámico (sin secciones)');
                this.$router.push('/crm-dinamico');
              }
            } catch (error) {
              console.error('❌ Error al cargar secciones:', error);
              // Fallback al CRM dinámico
              this.$router.push('/crm-dinamico');
            }
          } else {
            console.error('❌ Respuesta de plataforma lookup inválida:', lookupResp);
            this.errorMessage = 'No se pudo obtener la plataforma asociada a este usuario. Respuesta inválida del servidor.';
            setTimeout(() => { this.errorMessage = ''; }, 5000);
          }
        } catch (lookupError) {
          console.error('❌ Error en plataformaLookup:', lookupError);
          console.error('❌ Detalles del error:', {
            message: lookupError.message,
            response: lookupError.response,
            status: lookupError.response && lookupError.response.status,
            data: lookupError.response && lookupError.response.data
          });
          
          // Mostrar error específico según el tipo de error
          if (lookupError.response && lookupError.response.status === 404) {
            this.errorMessage = 'Usuario no encontrado en ninguna plataforma.';
          } else if (lookupError.response && lookupError.response.status === 500) {
            this.errorMessage = 'Error del servidor al buscar la plataforma.';
          } else if (lookupError.code === 'NETWORK_ERROR' || lookupError.message.includes('Network Error')) {
            this.errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
          } else {
            this.errorMessage = `Error al buscar plataforma: ${lookupError.message}`;
          }
          setTimeout(() => { this.errorMessage = ''; }, 5000);
        }
      } catch (error) {
        console.error('❌ Error en el login:', error.code, error.message);
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
.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}
.login-logo {
  max-width: 200px;
  height: auto;
}
.btn-block {
  width: 100%;
}
</style>
