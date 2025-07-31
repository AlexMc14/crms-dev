<template>
  <div :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications>
    <router-view></router-view>
  </div>
</template>

<script>
import { db } from './firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default {
  data() {
    return {
      casosSinAsignar: 0,
      casosSinPresupuesto: 0,
      clientesLlamar: 0,
      isAuthenticated: false,
      userData: JSON.parse(localStorage.getItem('userInform')),
      // Referencias a los desuscriptores para poder desuscribirse cuando sea necesario
      unsuscribeCasosSinAsignar: null,
      unsuscribeCasosSinPresupuesto: null,
      unsuscribeClientesLlamar: null
    };
  },
  watch: {
    isAuthenticated(newValue) {
      if (newValue && this.userData && this.userData.admin && this.userData.admin === true) {
        this.suscribirseEscuchadores();
      } else {
        this.desuscribirseEscuchadores();
      }
    }
  },
  mounted() {
    this.checkLogIn();
  },
  beforeDestroy() {
    // Asegúrate de desuscribirte cuando el componente se desmonte
    this.desuscribirseEscuchadores();
  },
  methods: {
    checkLogIn() {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        this.isAuthenticated = !!user;
      });
    },
    suscribirseEscuchadores() {
      console.log("Suscribiendo a los escuchadores...");

      const qCasosSinAsignar = query(collection(db, 'casos'), where('telEspecialista', '==', null), where('status', '==', '0'), where('confirmaCaso', '==', '1'));
      this.unsuscribeCasosSinAsignar = onSnapshot(qCasosSinAsignar, (querySnapshot) => {
        if (querySnapshot.docs.length > this.casosSinAsignar) {
          this.mostrarNotificacion('Caso sin asignar', 'Debes asignar un especialista');
        }
        this.casosSinAsignar = querySnapshot.docs.length;
      });

      const qCasosSinPresupuesto = query(collection(db, 'casos'), where('status', '==', '1'));
      this.unsuscribeCasosSinPresupuesto = onSnapshot(qCasosSinPresupuesto, (querySnapshot) => {
        if (querySnapshot.docs.length > this.casosSinPresupuesto) {
          this.mostrarNotificacion('Cliente sin presupuesto', 'Se debe enviar un presupuesto al cliente');
        }
        this.casosSinPresupuesto = querySnapshot.docs.length;
      });

      const qClientesLlamar = query(collection(db, 'clientes'), where('confirmaCaso', '==', '0'));
      this.unsuscribeClientesLlamar = onSnapshot(qClientesLlamar, (querySnapshot) => {
        if (querySnapshot.docs.length > this.clientesLlamar) {
          this.mostrarNotificacion('Llamar a cliente', 'Se necesita confirmar la especialidad para el cliente');
        }
        this.clientesLlamar = querySnapshot.docs.length;
      });
    },
    desuscribirseEscuchadores() {
      console.log("Desuscribiendo de los escuchadores...");
      if (this.unsuscribeCasosSinAsignar) this.unsuscribeCasosSinAsignar();
      if (this.unsuscribeCasosSinPresupuesto) this.unsuscribeCasosSinPresupuesto();
      if (this.unsuscribeClientesLlamar) this.unsuscribeClientesLlamar();
    },
    mostrarNotificacion(titulo, desc) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(titulo, {
          body: desc,
          appName: 'Crms',
          icon: './src/img/vue-logo.png'
        });

        notification.onclick = function(tp) {
          console.log('Notificación clicada', tp);
        };
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.mostrarNotificacion(titulo, desc);
          }
        });
      }
    }
  }
};
</script>

<style lang="scss">
.vue-notifyjs.notifications {
  .alert {
    z-index: 10000;
  }
  .list-move {
    transition: transform 0.3s, opacity 0.4s;
  }
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active {
    transition: transform 0.2s ease-in, opacity 0.4s ease-in;
  }
  .list-leave-active {
    transition: transform 1s ease-out, opacity 0.4s ease-out;
  }

  .list-enter {
    opacity: 0;
    transform: scale(1.1);
  }
  .list-leave-to {
    opacity: 0;
    transform: scale(1.2, 0.7);
  }
}

select {
  height: 50px !important;
}

input {
  height: 50px !important;
}
</style>
