<template>
  <div :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications>
    <router-view></router-view>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { db } from './firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default {
  setup() {
    const casosSinAsignar = ref(0);
    const casosSinPresupuesto = ref(0);
    const clientesLlamar = ref(0);
    const isAuthenticated = ref(false);
    const userData =  ref(JSON.parse(localStorage.getItem('userInform')));

    // Referencias a los desuscriptores para poder desuscribirse cuando sea necesario
    let unsuscribeCasosSinAsignar = null;
    let unsuscribeCasosSinPresupuesto = null;
    let unsuscribeClientesLlamar = null;

    const auth = getAuth();

    const checkLogIn = () => {
      onAuthStateChanged(auth, (user) => {
        isAuthenticated.value = !!user;
      });
    };

    const suscribirseEscuchadores = () => {
      console.log("Suscribiendo a los escuchadores...");

      const qCasosSinAsignar = query(collection(db, 'casos'), where('telEspecialista', '==', null), where('status', '==', '0'), where('confirmaCaso', '==', '1'));
      unsuscribeCasosSinAsignar = onSnapshot(qCasosSinAsignar, (querySnapshot) => {
        if (querySnapshot.docs.length > casosSinAsignar.value) {
          mostrarNotificacion('Caso sin asignar', 'Debes asignar un especialista');
        }
        casosSinAsignar.value = querySnapshot.docs.length;
      });

      const qCasosSinPresupuesto = query(collection(db, 'casos'), where('status', '==', '1'));
      unsuscribeCasosSinPresupuesto = onSnapshot(qCasosSinPresupuesto, (querySnapshot) => {
        if (querySnapshot.docs.length > casosSinPresupuesto.value) {
          mostrarNotificacion('Cliente sin presupuesto', 'Se debe enviar un presupuesto al cliente');
        }
        casosSinPresupuesto.value = querySnapshot.docs.length;
      });

      const qClientesLlamar = query(collection(db, 'clientes'), where('confirmaCaso', '==', '0'));
      unsuscribeClientesLlamar = onSnapshot(qClientesLlamar, (querySnapshot) => {
        if (querySnapshot.docs.length > clientesLlamar.value) {
          mostrarNotificacion('Llamar a cliente', 'Se necesita confirmar la especialidad para el cliente');
        }
        clientesLlamar.value = querySnapshot.docs.length;
      });
    };

    const desuscribirseEscuchadores = () => {
      console.log("Desuscribiendo de los escuchadores...");
      if (unsuscribeCasosSinAsignar) unsuscribeCasosSinAsignar();
      if (unsuscribeCasosSinPresupuesto) unsuscribeCasosSinPresupuesto();
      if (unsuscribeClientesLlamar) unsuscribeClientesLlamar();
    };

    watch(isAuthenticated, (newValue) => {
      if (newValue && userData.value.admin && userData.value.admin === true) {
        suscribirseEscuchadores(); // Suscribirse a los escuchadores
      } else {
        desuscribirseEscuchadores(); // Desuscribirse de los escuchadores
      }
    });

    // onMounted(() => {
    //   checkLogIn();
    //   if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker.ready.then((registration) => {
    //       // Escucha los cambios en el service worker
    //       registration.addEventListener('updatefound', () => {
    //         const newWorker = registration.installing;

    //         newWorker.addEventListener('statechange', () => {
    //           if (newWorker.state === 'installed') {
    //             if (navigator.serviceWorker.controller) {
    //               // Si hay un SW activo, significa que hay una nueva versión
    //               console.log('Nueva versión disponible. Limpiando caché y recargando.');
                  
    //               // Borrar caché y recargar la página para aplicar la nueva versión
    //               caches.keys().then((cacheNames) => {
    //                 cacheNames.forEach((cacheName) => {
    //                   caches.delete(cacheName);
    //                 });
    //               }).then(() => {
    //                 window.location.reload();
    //               });
    //             }
    //           }
    //         });
    //       });
    //     });
    //     }
    // });

    onUnmounted(() => {
      // Asegúrate de desuscribirte cuando el componente se desmonte
      desuscribirseEscuchadores();
    });

    function mostrarNotificacion(titulo, desc) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(titulo, {
          body: desc,
          appName: 'Crms',
          icon: './src/img/vue-logo.png' // Ruta al ícono opcional
        });

        notification.onclick = function(tp) {
          console.log('Notificación clicada', tp);
        };
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            mostrarNotificacion(titulo, desc);
          }
        });
      }
    }

    return {
      casosSinAsignar,
      casosSinPresupuesto,
      clientesLlamar,
      isAuthenticated
    };
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
