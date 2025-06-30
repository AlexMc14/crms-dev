<template>
<card class="card-user">
    <div>
        <span style="color:#007bff; cursor:pointer;" @click="$emit('back')">Volver</span>
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
        <div class="custom-select-wrapper col-md-6 mt-5">
            <div class="custom-select-wrapper col-md-12">
            <label for="">Que especialidad puede ver aparte de sus casos</label>
                <select v-model="verEspe" class="custom-select" style="min-height:100px;" multiple>
                    <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
                </select>
            </div>
        </div>
    </div>
    <div class="col-12 mt-3">
        <p-button type="info" round @click.native.prevent="saveInfo">
            Guardar
          </p-button>
    </div>
</card>
</template>
<script>
import { onMounted, ref } from "vue";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from '../../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, addDoc, getDocs, where, query, doc, updateDoc } from 'firebase/firestore';
export default {
props: {
    user: {
      type: Object,
    },
  },
  setup(props) {
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
    const q = query(collection(db, 'especialistas'), where('correo', '==', props.user.correo));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length > 0) {
        
        const clienteDocRef = doc(db, 'especialistas', querySnapshot.docs[0].id);
        const espeObs = []
        especialidades.value.forEach((item) => {
          if (verEspe.value.includes(item.id)) {
            espeObs.push((item));
          }
        })
        await updateDoc(clienteDocRef, {
            // userCreated: true,
            especialidadesObs: espeObs,
            routes: routes.value
        });
      } else {
        console.error('No se encontroooo')
      }
    };

    const getEspecialista = (() => {
        // verEspe.value = props.user.especialidadesObs;
        // console.log(props.user.especialidadesObs)
        props.user.especialidadesObs.forEach((it) => { verEspe.value.push(it.id) })
        // console.log(props.user.routes)
        routes.value.forEach(route => {
          // console.log('Routeeee--->', route);
            // Verificamos si la ruta actual está en `rutasDelObjetoA`
            const pathEncontrado = props.user.routes.find(ruta => {
                // Aseguramos que estamos comparando solo el `path`
                return typeof ruta === 'object' && ruta.path === route.path && ruta.visibility === true;
            });

            // Si encontramos la ruta, actualizamos la visibilidad a true
            if (pathEncontrado) {
                route.visibility = true;
            }
        });
        // objetoA.numeros.filter(numero => objetoB.numeros.includes(numero));
        // routes.value.forEach((it) => {
        //     console.log('itemm', it.path)
        //     if (props.user.routes.includes(it.path)) {
        //         console.log('Llegooo')
        //         it.visibility = true
        //     }
        //     // return it
        //     // props.user.routes.includes(it.path)
        // })
    })

    onMounted(() => {
        fetchData();
        getEspecialista();
    })

    return {
      mail,
      password,
      routes,
      verEspe,
      especialidades,
      saveInfo: (() => {
        espeUpdate()
      }),
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
