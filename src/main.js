/*!

 =========================================================
 * Vue Paper Dashboard - v1.0.1
 =========================================================

 * Product Page: http://www.creative-tim.com/product/paper-dashboard
 * Copyright 2023 Creative Tim (http://www.creative-tim.com)
 * Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard/blob/master/LICENSE.md)

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */
import Vue from "vue";
import App from "./App";
import router from "./router/index";
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import PaperDashboard from "./plugins/paperDashboard";
import "vue-notifyjs/themes/default.css";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './registerServiceWorker'
import GlobalComponents from './plugins/globalComponents';
import { setTenantId } from './services/api';

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(PaperDashboard);
Vue.use(GlobalComponents);

// Inicializar tenantId desde localStorage
const tenantId = localStorage.getItem('tenantId');
if (tenantId) {
  setTenantId(tenantId);
}

// Monta la app SIEMPRE, sin lógica condicional
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
