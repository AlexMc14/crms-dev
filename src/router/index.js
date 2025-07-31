import Vue from "vue";
import { createRouter, createWebHistory } from 'vue-router';
import Router from "vue-router";
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Asegúrate de tener firebase/auth importado
import routes from "./routes"; // Importa tus rutas correctamente
import { db } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, getDocs, where, query } from 'firebase/firestore';
import { plataformaLookup, setTenantId } from '../services/api';

Vue.use(Router);

const router = new Router({
  // history: createWebHistory(),
  // mode: 'history', // Usa el modo 'history' para la navegación limpia
  routes, // Aquí pasamos el arreglo de rutas importado
});

// Inicializa el estado de usuario
let currentUser = null;

const auth = getAuth();

// Crea una promesa para asegurarte de que el estado del usuario esté cargado antes de que se evalúe la guardia de navegación
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Deja de escuchar cuando se obtenga el usuario
      resolve(user);
    }, reject);
  });
}

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  currentUser = await getCurrentUser();

  if (to.name === 'login') {
    next(); // Permite siempre el acceso a login
    return;
  }

  if (requiresAuth && !currentUser) {
    next({ name: 'login' });
  } else {
    next();
  }
});

// router.beforeEach(async (to, from, next) => {
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//   console.log('Aqui si llego??')
//   // Esperamos a que el estado del usuario se resuelva
//   currentUser = await getCurrentUser();

//   // Si la ruta requiere autenticación y no hay un usuario autenticado, redirigimos al login
//   if (requiresAuth && !currentUser) {
//     if (to.name !== 'login') {
//       next({ name: 'login' }); // Redirige a la página de login si no estás autenticado
//     } else {
//       // next(); // Permite el acceso a la página de login
//       console.log('Eoooo')
//     }
//   } else {
//     // Si el usuario está autenticado, revisa si tiene datos guardados en `localStorage`
//     const userData = localStorage.getItem('userInform');

//     if (!userData && currentUser) {
//       // Obtiene la información del usuario desde Firestore
//       const q = query(collection(db, 'especialistas'), where('correo', '==', currentUser.email));
//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.docs.length > 0) {
//         localStorage.setItem("userInform", JSON.stringify(querySnapshot.docs[0].data()));
//       } else {
//         console.error('No se encontró el usuario en la base de datos');
//       }
//     }

//     // Si el usuario intenta acceder al login estando ya autenticado, redirige al dashboard
//     if (!requiresAuth && currentUser && to.name === 'login') {
//       next({ name: 'dashboard' });
//     } else {
//       next(); // En caso contrario, permite el acceso a la ruta solicitada
//     }
//   }
// });



export default router;
