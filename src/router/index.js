import Vue from "vue";
import { createRouter, createWebHistory } from 'vue-router';
import Router from "vue-router";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import routes from "./routes";
import { db } from '../firebase';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { plataformaLookup, setTenantId } from '../services/api';

Vue.use(Router);

const router = new Router({
  routes,
});

// Inicializa el estado de usuario
let currentUser = null;

const auth = getAuth();

// Función para obtener el usuario actual de forma asíncrona
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

// Guard de navegación mejorado
router.beforeEach(async (to, from, next) => {
  try {
    // Obtener el usuario actual
    currentUser = await getCurrentUser();
    
    // Verificar si la ruta requiere autenticación
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    // Si es la página de login
    if (to.name === 'login') {
      // Si el usuario ya está autenticado, redirigir al dashboard
      if (currentUser) {
        next({ name: 'crm-dinamico' });
        return;
      }
      // Si no está autenticado, permitir acceso al login
      next();
      return;
    }
    
    // Si la ruta requiere autenticación y no hay usuario
    if (requiresAuth && !currentUser) {
      next({ name: 'login' });
      return;
    }
    
    // Si el usuario está autenticado y la ruta requiere auth, verificar datos del usuario
    // if (requiresAuth && currentUser) {
    //   const userData = localStorage.getItem('userInform');
      
    //   // Si no hay datos del usuario en localStorage, obtenerlos de Firestore
    //   if (!userData) {
    //     try {
    //       const q = query(collection(db, 'especialistas'), where('correo', '==', currentUser.email));
    //       const querySnapshot = await getDocs(q);
          
    //       if (querySnapshot.docs.length > 0) {
    //         localStorage.setItem("userInform", JSON.stringify(querySnapshot.docs[0].data()));
    //       } else {
    //         console.error('No se encontró el usuario en la base de datos');
    //       }
    //     } catch (error) {
    //       console.error('Error obteniendo datos del usuario:', error);
    //     }
    //   }
      
    //   // Verificar tenantId
    //   const tenantId = localStorage.getItem('tenantId');
    //   if (!tenantId) {
    //     try {
    //       const lookupResp = await plataformaLookup(currentUser.email);
    //       if (lookupResp && lookupResp.plataformaId) {
    //         localStorage.setItem('tenantId', lookupResp.plataformaId);
    //         setTenantId(lookupResp.plataformaId);
    //       }
    //     } catch (error) {
    //       console.error('Error obteniendo tenantId:', error);
    //     }
    //   }
    // }
    
    // Permitir navegación
    next();
    
  } catch (error) {
    console.error('Error en el guard de navegación:', error);
    // En caso de error, redirigir al login
    next({ name: 'login' });
  }
});

export default router;
