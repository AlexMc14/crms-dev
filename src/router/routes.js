import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase';

import Vue from 'vue';
import Router from 'vue-router';

import DashboardLayout from "@/layout/dashboard/DashboardLayout.vue";
// GeneralViews
import NotFound from "@/pages/NotFoundPage.vue";

// Admin pages
import Dashboard from "@/pages/Dashboard.vue";
import ListadoClientes from "@/pages/ListadoClientes.vue";
import ListadoCitas from "@/pages/ListadoCitas.vue";
import Agenda from "@/pages/Agenda.vue";
import AgendaCitas from "@/pages/AgendaCitas.vue";
import UserProfile from "@/pages/UserProfile.vue";
import Login from "@/pages/Login.vue";
import Notifications from "@/pages/Notifications.vue";
import Icons from "@/pages/Icons.vue";
import Maps from "@/pages/Maps.vue";
import Typography from "@/pages/Typography.vue";
import TableList from "@/pages/TableList.vue";
import ListadoServicios from "@/pages/ListadoServicios.vue";
import ListadoProductos from "@/pages/ListadoProductos.vue";
import ListadoCategorias from "@/pages/ListadoCategorias.vue";
import EmpleadosUsuarios from "@/pages/EmpleadosUsuarios.vue";
import Facturacion from "@/pages/Facturacion.vue";
import CobrosPagos from "@/pages/CobrosPagos.vue";
import SeguridadPermisos from "@/pages/SeguridadPermisos.vue";
import CrmDinamico from "@/pages/CrmDinamico.vue";
import RegistroUsuario from "@/pages/RegistroUsuario.vue";
import RegistroPlataforma from "@/pages/RegistroPlataforma.vue";

Vue.use(Router);

const routes = [
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/crm-dinamico",
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: Dashboard,
        meta: { requiresAuth: true },
      },
      {
        path: "login",
        name: "login",
        component: Login,
        meta: { requiresAuth: false },
      },
      {
        path: '/perfil/:id',
        name: 'UserProfile',
        component: UserProfile,
        meta: { requiresAuth: true },
      },
      {
        path:"listado-clientes",
        name: "listado-clientes",
        component: ListadoClientes,
        meta: { requiresAuth: true },
      },
      {
        path:"listado-citas",
        name: "listado-citas",
        component: ListadoCitas,
        meta: { requiresAuth: true },
      },
      {
        path:"agenda",
        name: "agenda",
        component: Agenda,
        meta: { requiresAuth: true },
      },
      {
        path:"agenda-citas",
        name: "agenda-citas",
        component: AgendaCitas,
        meta: { requiresAuth: true },
      },
      {
        path: "listado-servicios",
        name: "listado-servicios",
        component: ListadoServicios,
        meta: { requiresAuth: true },
      },
      {
        path: "listado-productos",
        name: "listado-productos",
        component: ListadoProductos,
        meta: { requiresAuth: true },
      },
      {
        path: "listado-categorias",
        name: "listado-categorias",
        component: ListadoCategorias,
        meta: { requiresAuth: true },
      },
      {
        path: "facturacion",
        name: "facturacion",
        component: Facturacion,
        meta: { requiresAuth: true },
      },
      {
        path: "cobros-pagos",
        name: "cobros-pagos",
        component: CobrosPagos,
        meta: { requiresAuth: true },
      },
      {
        path: "empleados-usuarios",
        name: "empleados-usuarios",
        component: EmpleadosUsuarios,
        meta: { requiresAuth: true },
      },
      {
        path: "seguridad-permisos",
        name: "seguridad-permisos",
        component: SeguridadPermisos,
        meta: { requiresAuth: true },
      },
      {
        path: "crm-dinamico",
        name: "crm-dinamico",
        component: CrmDinamico,
        meta: { requiresAuth: true },
      },
      {
        path: "crm-seccion/:sectionName",
        name: "crm-seccion",
        component: () => import("@/pages/CrmSeccion.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "registros-paginados/:seccionId",
        name: "registros-paginados",
        component: () => import("@/pages/RegistrosPaginados.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/registro-usuario",
    name: "registro-usuario",
    component: RegistroUsuario,
    meta: { requiresAuth: false },
  },
  {
    path: "/registro-plataforma",
    name: "registro-plataforma",
    component: RegistroPlataforma,
    meta: { requiresAuth: false },
  },
  { path: "*", component: NotFound },
  // { path: "/:catchAll(.*)", component: NotFound }, // Ruta 404
];

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes;



// const router = new Router({
//   mode: 'history', // Usa 'history' para el modo de historial en vue-router 3.x
//   routes,
// });

// // Guardia de navegación para proteger rutas
// router.beforeEach((to, from, next) => {
//   const auth = getAuth();
//   const user = auth.currentUser;
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

//   if (requiresAuth && !user) {
//     // Si la ruta requiere autenticación y el usuario no está logueado, redirige al login
//     next({ name: 'Login' });
//   } else if (!requiresAuth && user && to.name === 'Login') {
//     // Si el usuario está logueado y quiere acceder a Login, redirigimos al Dashboard
//     next({ name: 'Dashboard' });
//   } else {
//     next(); // Permite continuar con la navegación
//   }
// });

// export default router;
