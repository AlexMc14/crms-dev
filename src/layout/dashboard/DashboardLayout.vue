<template>
  <div>
    <div v-if="authState.isAuthenticated" class="wrapper">
      <side-bar style="    background: #0f2a24;">
        <!-- <div v-show="dataUser !== null" class="text-center text-black mt-2 saludo-usuario">Hola, {{ dataUser.nombre ? dataUser.nombre : dataUser.email }}</div> -->
        <!-- <div v-show="dataUser !== null" class="text-center text-black mt-2 mb-2 conexion-usuario">Tu última conexión: <br> {{ lastLogin }}</div> -->
        
        <template slot="links">
          <!-- Links normales (sin children) -->
          <sidebar-link
            v-for="(route, index) in routes"
            :key="index"
            v-if="!route.children"
            :to="route.path"
            :name="route.name"
            :icon="route.icon"
            v-bind:style="{ display: needShow(route.path) ? 'block' : 'none' }"
            :class="currentPage === index ? 'currentPage' : ''"
          />
          
          <!-- Menú desplegable para rutas con children -->
          <div 
            v-for="(route, index) in routesWithChildren" 
            :key="`dropdown-${index}`"
            class="dropdown-menu-container nav-item"
            v-bind:style="{ display: needShow(route.path) !== false ? 'block' : 'none' }"
          >
            <div 
              class="dropdown-trigger nav-link"
              @click="toggleDropdown(index)"
              :class="{ 'active': openDropdowns.includes(index) }"
            >
              <i :class="route.icon" style="margin-right:8px;"></i>
              <span style="font-weight:bold;">{{ route.name }}</span>
              <i 
                class="ti-angle-down dropdown-arrow"
                :class="{ 'rotated': openDropdowns.includes(index) }"
              ></i>
            </div>
            <div 
              class="dropdown-content nav-link"
              :class="{ 'show': openDropdowns.includes(index) }"
            >
              <sidebar-link
                v-for="(child, childIndex) in route.children"
                :key="`child-${childIndex}`"
                :to="child.path"
                :name="child.name"
                :icon="child.icon"
                style="margin-left: 20px; font-size: 0.9em;"
                :class="currentPage === getRouteIndex(child.path) ? 'currentPage' : ''"
              />
            </div>
          </div>
          
          <div @click="logout" class="mt-2" style="width: 100%;">
            <sidebar-link
              icon="ti-power-off"
              to="/"
              name="Desconectarse"
            />
          </div>
          <!-- <div style="width: 100%; text-align:center;">
              v 19.06.25
          </div> -->
        </template>
        <mobile-menu>
          <!-- <li class="nav-item">
            <a class="nav-link">
              <i class="ti-panel"></i>
              <p>Stats</p>
            </a>
          </li>
          <drop-down
            class="nav-item"
            title="5 Notifications"
            title-classes="nav-link"
            icon="ti-bell"
          >
            <a class="dropdown-item">Notification 1</a>
            <a class="dropdown-item">Notification 2</a>
            <a class="dropdown-item">Notification 3</a>
            <a class="dropdown-item">Notification 4</a>
            <a class="dropdown-item">Another notification</a>
          </drop-down>
          <li class="nav-item">
            <a class="nav-link">
              <i class="ti-settings"></i>
              <p>Settings</p>
            </a>
          </li>
          <li class="divider"></li> -->
        </mobile-menu>
      </side-bar>
      <div class="main-panel">
        <!-- <top-navbar></top-navbar> -->
        <dashboard-content @click.native="toggleSidebar"></dashboard-content>
        <content-footer></content-footer>
      </div>
    </div>
    <div v-else>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; 
// import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, collection } from "firebase/firestore";
// import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "./MobileMenu";

export default {
  components: {
    // TopNavbar,
    ContentFooter,
    DashboardContent,
    MobileMenu,
  },
  data() {
    return {
      dataUser: null,
      currentPage: 0,
      lastLogin: null,
      authState: {
        isAuthenticated: false,
        user: null
      },
      routesWatch: [],
      routes: [
        // { path: '/dashboard', name: 'Dashboard', icon: 'ti-panel' },
        // { path: '/mis-casos', name: 'Mis Casos', icon: 'ti-panel' },
        // { path: '/mis-casos-abogados', name: 'Mis Casos', icon: 'ti-panel' },
        // { path: '/seguimiento-casos', name: 'Seguimiento casos', icon: 'ti-panel' },
        { path: '/listado-clientes', name: 'Listado clientes', icon: 'ti-infinite' },
        // { path: '/listado-clientes-llamar', name: 'Clientes por llamar', icon: 'ti-headphone-alt' },
        // { path: '/listado-clientes-sin-abogado', name: 'Clientes sin abogado', icon: 'ti-headphone-alt' },
        // { path: '/casos-sin-asignar', name: 'Casos sin asignar', icon: 'ti-eye' },
        // { path: '/clientes-sin-presupuesto', name: 'Clientes sin presupuesto', icon: 'ti-write' },
        // { path: '/clientes-presupuesto-pendiente', name: 'Clientes presupuesto pte', icon: 'ti-agenda' },
        // { path: '/presupuestos-aceptados', name: 'Presupuestos Aceptados', icon: 'ti-thumb-up' },
        // { path: '/listado-especialistas', name: 'Listado especialistas', icon: 'ti-briefcase' },
        // { path: '/listado-despachos', name: 'Listado despachos', icon: 'ti-infinite' },
        // { path: '/alta-clientes', name: 'Alta clientes', icon: 'ti-user' },
        // { path: '/alta-especialista', name: 'Alta especialista', icon: 'ti-user' },
        // { path: '/alta-despacho', name: 'Alta despacho', icon: 'ti-user' },
        // { path: '/citas', name: 'Citas', icon: 'ti-calendar' },
        // { path: '/calendario', name: 'Calendario', icon: 'ti-calendar' },
        // { path: '/calendario-remesas', name: 'Calendario Remesas', icon: 'ti-money' },
        // { path: '/listado-notificaciones-chats', name: 'Listado Notificaciones', icon: 'ti-infinite' },
        // { path: '/historico-login', name: 'Historico Accesos', icon: 'ti-infinite' },
        { 
          path: '#', // Sin ruta directa, solo contenedor
          name: 'Agenda y Citas', 
          icon: 'ti-calendar',
          isDropdown: true, // Identificar que es un menú desplegable
          children: [
            { path: '/listado-citas', name: 'Listado de Citas', icon: 'ti-list' },
            { path: '/agenda', name: 'Agenda', icon: 'ti-calendar' }
          ]
        },
        { path: '/servicios-productos', name: 'Servicios/Productos', icon: 'ti-briefcase' },
        { 
          path: '#', // Sin ruta directa, solo contenedor
          name: 'Facturación y Pagos', 
          icon: 'ti-money',
          isDropdown: true, // Identificar que es un menú desplegable
          children: [
            { path: '/facturacion', name: 'Facturación', icon: 'ti-receipt' },
            { path: '/cobros-pagos', name: 'Cobros/Pagos', icon: 'ti-credit-card' }
          ]
        },
        { path: '/empleados-usuarios', name: 'Empleados/Usuarios', icon: 'ti-user' },
        { path: '/seguridad-permisos', name: 'Seguridad/Permisos', icon: 'ti-shield' },
      ],
      routesWithChildren: [],
      openDropdowns: [],
    };
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    needShow(route) {
      if (route === '#' || route === undefined) return true;
      const routeFix = route.replace('/', '');
      return this.routesWatch.some(rt => rt.path === routeFix && rt.visibility === true);
    },
    logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.authState.isAuthenticated = false; 
        this.authState.user = null; // Limpiar datos del usuario
        localStorage.removeItem("userInform"); 
        this.$router.push('/login');
      }).catch((error) => {
        console.error('Error al hacer logout:', error);
      });
    },
    async checkLogIn() {
      const auth = await getAuth();
      const db = getFirestore();
      onAuthStateChanged(auth, async (user) => {
        this.authState.isAuthenticated = !!user; 
        this.authState.user = user; // Guarda el objeto de usuario
        this.lastLogin = user.metadata.lastSignInTime;
        // console.log('Entrooo', user.email);
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          lastLogin: new Date().toISOString(),
        }, { merge: true });

        this.dataUser = JSON.parse(localStorage.getItem('userInform')) ? JSON.parse(localStorage.getItem('userInform')) : user;
        // this.dataUser.nombre = this.dataUser.email;
        setTimeout(() => {
          const userData = localStorage.getItem('userInform');
          if (userData) {
            this.routesWatch = JSON.parse(userData).routes || [];
          } else {
            this.routesWatch = [];
          }
        }, "200");
      });
    },
    separateRoutes() {
      // Solo rellenar routesWithChildren, no modificar routes
      this.routesWithChildren = this.routes.filter(route => route.children && route.children.length > 0);
    },
    getRouteIndex(path) {
      // Buscar en las rutas con children
      for (let i = 0; i < this.routesWithChildren.length; i++) {
        const route = this.routesWithChildren[i];
        if (route.children) {
          const childIndex = route.children.findIndex(child => child.path === path);
          if (childIndex !== -1) {
            return i; // Retornar el índice del padre
          }
        }
      }
      return -1;
    },
    toggleDropdown(index) {
      if (this.openDropdowns.includes(index)) {
        this.openDropdowns = this.openDropdowns.filter(i => i !== index);
      } else {
        this.openDropdowns.push(index);
      }
    },
    checkAutoOpenDropdown() {
      // Abrir automáticamente el dropdown si estás en una página hija
      const currentPath = this.$route.path;
      for (let i = 0; i < this.routesWithChildren.length; i++) {
        const route = this.routesWithChildren[i];
        if (route.children) {
          const isInChildRoute = route.children.some(child => child.path === currentPath);
          if (isInChildRoute && !this.openDropdowns.includes(i)) {
            this.openDropdowns.push(i);
          }
        }
      }
    },
  },
  async mounted() {
    // console.log(this.$route)
    // const auth = await getAuth();
    // onAuthStateChanged(auth, async (user) => {
    //   if (user) {
    //     this.lastLogin = user.metadata.lastSignInTime;
    //     // console.log("Usuario:", user.email);
    //     // console.log("Última conexión:", user.metadata.lastSignInTime);
    //   }
    // });
    this.currentPage = this.routes.findIndex(route => route.path === this.$route.path);
    this.separateRoutes();
    this.checkAutoOpenDropdown();
    this.checkLogIn()
  },
  watch: {
    '$route'(to, from) {
      console.log('Te encuentras en la URL: ', to.fullPath);
      // Aquí puedes realizar cualquier acción adicional, como actualizar el estado de la página actual.
      this.currentPage = this.routes.findIndex(route => route.path === to.path);
      this.checkAutoOpenDropdown();
    },
    'authState.isAuthenticated'(newValue) {
      if (newValue) {
        this.checkLogIn();
      }
    }
  },
};
</script>

<style lang="css">
/* Aquí puedes agregar estilos */
.wrapper .sidebar .nav p {
    margin: 0;
    line-height: 20px !important;
}

/* Menú desplegable */
.dropdown-menu-container {
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.dropdown-menu-container:hover {
  border-left-color: #1b6659;
  background: rgba(27, 102, 89, 0.05);
}

.dropdown-trigger {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-trigger.active {
  background: rgba(27, 102, 89, 0.1);
  border-left: 3px solid #1b6659;
}

.dropdown-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  color: #1b6659;
  font-size: 12px;
}

.dropdown-arrow.rotated {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(0, 0, 0, 0.1);
  margin-left: 10px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.dropdown-content.show {
  max-height: 200px; /* Ajusta según necesites */
}

.dropdown-content .sidebar-link {
  padding: 8px 15px;
  font-size: 0.85em;
  opacity: 0.9;
  transition: all 0.3s ease;
  margin-left: 10px;
}

.dropdown-content .sidebar-link:hover {
  opacity: 1;
  background: rgba(27, 102, 89, 0.2);
}

.dropdown-content .sidebar-link.currentPage {
  background: rgba(27, 102, 89, 0.3);
  border-left: 3px solid #1b6659;
}

.currentPage {
  background: rgba(27, 102, 89, 0.2) !important;
  border-left: 3px solid #1b6659 !important;
}

.wrapper .sidebar .nav i {
    font-size: 15px !important;
    float: left;
    margin-right: 5px !important;
    line-height: 20px !important;
    width: 30px;
    text-align: center;
    color: black;
}

.wrapper .sidebar .nav .nav-item .nav-link {
    margin: 0px !important;
    padding-left: 25px;
    padding-right: 25px;
    opacity: 0.7;
}

@media (max-width: 440px) {
  .wrapper .sidebar .nav p {
    font-size: 9px !important;
  }

  .conexion-usuario{
    font-size: 11px !important;
  }

  .saludo-usuario{
    font-size: 11px !important;
  }
}
</style>