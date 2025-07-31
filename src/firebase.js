import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// const firebaseConfig = {
//      apiKey: "AIzaSyDo1A7Z0amaZypA2szW_cXPA4LTxpPy9Fo",
//      authDomain: "alex-dev-4d19d.firebaseapp.com",
//      projectId: "alex-dev-4d19d",
//      storageBucket: "alex-dev-4d19d.appspot.com",
//      messagingSenderId: "660001871846",
//      appId: "1:660001871846:web:cea40dfd92302c3d6aa827"
// };

// const firebaseConfig = {
//  apiKey: "AIzaSyARY6o2T21ML33G6DC0r_VwSS6KP13lOE4",
//  authDomain: "informesmedicospericiale-aefa2.firebaseapp.com",
//  projectId: "informesmedicospericiale-aefa2",
//  storageBucket: "informesmedicospericiale-aefa2.appspot.com",
//  messagingSenderId: "478457945260",
//  appId: "1:478457945260:web:a0a17c0cb730c7edeed309"
// };

const firebaseConfig = {
    apiKey: "AIzaSyBH82lLEp3xdP_HUHLQCaxhuXxmsPBiC3Y",
    authDomain: "crms-77a2a.firebaseapp.com",
    projectId: "crms-77a2a",
    storageBucket: "crms-77a2a.firebasestorage.app",
    messagingSenderId: "271168750908",
    appId: "1:271168750908:web:8451900eb335f742204a39"
  };
  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);
const storage = getStorage(app);

export { db, messaging, getToken, onMessage, storage };
