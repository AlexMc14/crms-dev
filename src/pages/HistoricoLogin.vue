<template>
  <div>
    <h2>Lista de Usuarios</h2>
    <ul>
      <li v-for="user in users" :key="user.id" class="mt-2">
        {{ user.email }} - Última conexión: {{ user.lastLogin.split("T")[0] + ' - ' + user.lastLogin.split("T")[1].replace('Z', '') }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default {
  setup() {
    const users = ref([]);
    const db = getFirestore();

    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    onMounted(fetchUsers);

    return { users };
  }
};
</script>
