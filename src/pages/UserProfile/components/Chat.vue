<template>
  <!-- <div>
    <h1>Chats</h1>

    <div>
      <button @click="selectChat('chat1')">Chat 1</button>
      <button @click="selectChat('chat2')">Chat 2</button>
    </div>

    <div v-if="selectedChat">
      <h2>Chat: {{ selectedChat }}</h2>

      <div class="messages">
        <div v-for="message in messages" :key="message.id">
          <strong>{{ message.sender }}:</strong>
          <p>{{ message.text }}</p>
        </div>
      </div>

      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..." />
    </div>
  </div> -->
  <div class="container mt-5">
    <div class="card shadow-sm">
      <div class="py-2 bg-primary text-white text-center font-weight-bold">Chat</div>
      <div class="card-body chat-box overflow-auto" ref="chatBox" style="    max-height: 100px;">
        <div v-for="message in messages" :key="message.id" class="mb-2">
          <div class="alert alert-primary text-secondary">
            <strong>{{ message.user }}</strong>
            <span class="small text-primary ml-1">{{ message.time }} {{ message.timestamp ? new Date(message.timestamp.seconds * 1000 + message.timestamp.nanoseconds / 1000000).toISOString().split('T')[0].split('-').reverse().join('/') : '' }}</span>
            <br>
            {{ message.text }}
          </div>
        </div>
      </div>
      <div class="card-footer d-flex">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..." />
        <!-- <input v-model="newMessage" @keyup.enter="sendMessage" type="text" class="form-control" placeholder="Escribe un mensaje..." @keyup.enter="sendMessage"> -->
        <!-- <button @click="sendMessage" class="btn btn-primary ml-2">Enviar</button> -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { db } from '@/firebase';
// import { doc, updateDoc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

export default {
  name: "ChatApp",
  props: {
    userCase: {
      type: Object,
    },
    caseDetail: {
      type: Object,
    }
  },
  setup(props) {
    const chatId = ref(props.userCase.tel); // Almacenar el chat seleccionado
    const messages = ref([]); // Almacenar los mensajes del chat seleccionado
    const newMessage = ref(""); // Almacenar el nuevo mensaje
    let unsubscribe = null; // Para cancelar la suscripción
    const userChat = ref(JSON.parse(localStorage.getItem('userInform')));
    // console.log(props.userCase.id);
    // console.log(props.userCase.nombre);
    console.log(props.caseDetail.telEspecialista);
    // console.log(props.userCase.tel);
    // console.log(userChat.value.tel);
    // Función para seleccionar un chat
    // const selectChat = (chatId) => {
    //   selectedChat.value = chatId;
    //   loadMessages(chatId); // Cargar los mensajes del chat seleccionado
    // };

    // Cargar los mensajes del chat
    const loadMessages = () => {
      // Si ya hay una suscripción activa, cancelarla
      if (unsubscribe) unsubscribe();

      // Consultar los mensajes en tiempo real
      unsubscribe = onSnapshot(
        query(collection(db, "chats", chatId.value, "messages"), orderBy("timestamp")),
        (querySnapshot) => {
          messages.value = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        }
      );
    };

    // Enviar un mensaje
    const sendMessage = async () => {
      if (newMessage.value.trim() !== "") {
        await addDoc(collection(db, "chats", chatId.value, "messages"), {
          // sender: "Usuario", // Puedes cambiar esto según el nombre del usuario
          // text: newMessage.value,
          // timestamp: new Date(),
          text: newMessage.value,
          user: userChat.value.nombre,
          userId: userChat.value.id,
          time: new Date().toLocaleTimeString(),
          timestamp: new Date()
        });
        await addDoc(collection(db, 'notificacionesChat'), {
          userWrite: userChat.value.tel,
          userTo: userChat.value.tel === props.caseDetail.telEspecialista ? '607417310' : props.caseDetail.telEspecialista,
          // userChat: chatId.value,
          userId: props.userCase.id,
          userName: props.userCase.nombre,
          userEspe: props.caseDetail.telEspecialista
        });
        // if (userChat.value.correo !== 'info@informesmedicospericiales.com') {
        //   console.log(props.userCase.id);
        //   console.log(props.userCase.nombre);
        //   console.log(props.userCase.tel);
        // }
        newMessage.value = ""; // Limpiar el campo de texto
      }
    };

    // Limpiar suscripción al destruir el componente
    onBeforeUnmount(() => {
      if (unsubscribe) unsubscribe();
    });
    onMounted(() => {
      console.log(props.userCase);
      if (props.userCase.tel) {
        // chatId.value = props.userCase.tel;
        loadMessages();
      } else {
        chatId.value = props.userCase.tel;
        loadMessages();
      }
      // if (unsubscribe) unsubscribe();
    });

    return {
      messages,
      newMessage,
      sendMessage
    };
  }
};
</script>

<style scoped>
/* Estilos para los mensajes */
.messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin-top: 1rem;
}
button {
  margin-right: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
