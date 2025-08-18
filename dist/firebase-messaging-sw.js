// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyARY6o2T21ML33G6DC0r_VwSS6KP13lOE4",
  authDomain: "informesmedicospericiale-aefa2.firebaseapp.com",
  projectId: "informesmedicospericiale-aefa2",
  storageBucket: "informesmedicospericiale-aefa2.appspot.com",
  messagingSenderId: "478457945260",
  appId: "1:478457945260:web:a0a17c0cb730c7edeed309"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
