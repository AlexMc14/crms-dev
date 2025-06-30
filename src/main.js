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
import { messaging, getToken, onMessage } from './firebase';

Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    console.log('Notification permission granted.');
    getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY' })  // Asegúrate de reemplazar 'YOUR_PUBLIC_VAPID_KEY' con tu clave VAPID pública.
      .then((currentToken) => {
        if (currentToken) {
          console.log('FCM Token:', currentToken);
          // Aquí puedes enviar el token a tu servidor o almacenarlo para su uso futuro
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
      });
  } else {
    console.log('Unable to get permission to notify.');
  }
});

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Mostrar notificación en la aplicación
});

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(PaperDashboard);

/* eslint-disable no-new */
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
