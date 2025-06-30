<template>
  <div class="row">
    <h2>Crear cuenta</h2>
    <div class="col-12">
      <input v-model="mail" placeholder="correo" type="text" style="width: 250px" />
    </div>
    <div class="col-12 mt-3">
      <input v-model="password" placeholder="contraseña" type="text" style="width: 250px" />
    </div>
    
    <div class="col-12 mt-3">
      <h3>Selecciona las rutas visibles:</h3>
      <div class="row">
        <div v-for="(route, index) in routes" :key="index" class="col-4 d-flex align-items-center" style="min-height:40px;">
          <div class="form-check">
            <input type="checkbox" v-model="route.visibility" class="form-check-input" />
            <label class="form-check-label" style="margin-left: 5px">{{ route.path }}</label>
          </div>
        </div>
      </div>
    </div>

    <div class="custom-select-wrapper col-md-6">
        <div class="custom-select-wrapper col-md-12">
          <label for="">Que especialidad puede ver aparte de sus casos</label>
            <select v-model="verEspe" class="custom-select" style="min-height:100px;" multiple>
                <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
            </select>
        </div>
    </div>
    <div class="col-12 mt-3">
      <button @click="register">Registro</button>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, addDoc, getDocs, where, query, doc, updateDoc } from 'firebase/firestore';
export default {
  setup() {
    const mail = ref("");
    const password = ref("");
    const verEspe = ref([]);
    const especialidades = ref([]);
    const fetchData = async () => {
      especialidades.value = (await getDocs(collection(db, 'especialidades'))).docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    };

    onMounted(() => {
        fetchData();
    })

    // Array de rutas con su propiedad de visibilidad
    const routes = ref([
      { path: "dashboard", visibility: false },
      { path: "alta-especialidades", visibility: false },
      { path: "listado-notificaciones-chats", visibility: false },
      { path: "listado-clientes", visibility: false },
      { path: "listado-clientes-llamar", visibility: false },
      { path: "listado-clientes-sin-abogado", visibility: false },
      { path: "listado-especialistas", visibility: false },
      { path: "listado-despachos", visibility: false },
      { path: "alta-clientes", visibility: false },
      { path: "casos-sin-asignar", visibility: false },
      { path: "clientes-sin-presupuesto", visibility: false },
      { path: "clientes-presupuesto-pendiente", visibility: false },
      { path: "presupuestos-aceptados", visibility: false },
      { path: "alta-especialista", visibility: false },
      { path: "alta-despacho", visibility: false },
      { path: "mis-casos", visibility: false },
      { path: "mis-casos-abogados", visibility: false },
      { path: "seguimiento-casos", visibility: false },
      { path: "citas", visibility: false },
      { path: "calendario", visibility: false },
      { path: "calendario-remesas", visibility: false },
      { path: "historico-login", visibility: false },
    ]);

    const espeUpdate = async () => {
      const q = query(collection(db, 'especialistas'), where('correo', '==', mail.value));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length > 0) {
        
        const clienteDocRef = doc(db, 'especialistas', querySnapshot.docs[0].id);
        await updateDoc(clienteDocRef, {
            userCreated: true,
            especialidadesObs: especialidades.value,
            routes: routes.value
        });
      } else {
        const q2 = query(collection(db, 'despachos'), where('correo', '==', mail.value));
        const querySnapshot2 = await getDocs(q2);
        if (querySnapshot2.docs.length > 0) {
          
          const clienteDocRef = doc(db, 'despachos', querySnapshot2.docs[0].id);
          await updateDoc(clienteDocRef, {
              userCreated: true,
              especialidadesObs: especialidades.value,
              routes: routes.value
          });
        } else {
          console.error('No se encontroooo')
        }
      }
    };

    const register = () => {
        createUserWithEmailAndPassword(getAuth(), mail.value, password.value)
        .then((data) => {
          console.log("Registro correcto", data);
          console.log("Rutas seleccionadas:", routes.value);
          espeUpdate();
        })
        .catch((error) => {
          console.error("Registro incorrecto", error);
        });
    };

    return {
      mail,
      password,
      register,
      routes,
      verEspe,
      especialidades,
    };
  },
};
</script>

<style scoped>
.form-check {
  display: flex;
  align-items: center;
}
</style>
