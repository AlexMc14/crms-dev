<template>
  <div>
    <!--Stats cards-->
    <div class="row">
      <div
      @click="$router.push({ path: 'listado-clientes-llamar', query: { llamada: '1' }})"
        class="col-md-6 col-xl-3"
      >
        <stats-card>
          <div
            class="icon-big text-center"
            slot="header"
          >
            <i class="ti-pulse"></i>
          </div>
          <div class="numbers" slot="content">
            <p>Clientes para llamar</p>
            {{ clientesLlamar }}
          </div>
        </stats-card>
      </div>
      <div
      @click="$router.push({ name: 'casos-sin-asignar'})"
        class="col-md-6 col-xl-3"
      >
        <stats-card>
          <div
            class="icon-big text-center"
            slot="header"
          >
            <i class="ti-pulse"></i>
          </div>
          <div class="numbers" slot="content">
            <p>Casos sin asignar</p>
            {{ casosSinAsignar }}
          </div>
        </stats-card>
      </div>
      <div
        class="col-md-6 col-xl-3"
        @click="$router.push({ name: 'clientes-sin-presupuesto'})"
      >
        <stats-card @click="$router.push({ name: 'ClientesSinPresupuesto'})">
          <div
            class="icon-big text-center"
            slot="header"
          >
            <i class="ti-pulse"></i>
          </div>
          <div class="numbers" slot="content">
            <p>Clientes sin presupuesto</p>
            {{ clientesSinPresupuesto }}
          </div>
        </stats-card>
      </div>
    </div>
    <div class="q-mt-xl">
      <div class="row items-center q-mb-md" style="align-items: center;">
        <button @click="cambiarMes(-1)" class="btn btn-light" style="font-size: 1.5em;">&#8592;</button>
        <span class="text-h6 q-mx-md" style="margin: 0 16px;">
          {{ ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][mesActual] }} {{ anioActual }}
        </span>
        <button @click="cambiarMes(1)" class="btn btn-light" style="font-size: 1.5em;">&#8594;</button>
      </div>
      <div class="text-h5 text-center">Casos cerrados {{ ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][mesActual] }} {{ anioActual }}: <b>{{ casosMes }}</b></div>
      <div class="q-mt-lg distribucion-row">
        <div class="distribucion-col">
          <h6 class="text-center">Distribución por comunidad {{ ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][mesActual] }} {{ anioActual }}</h6>
          <div class="barh-chart">
            <div v-for="(item, idx) in comunidadesOrdenadas" :key="'barh-' + idx" class="barh-item">
              <span class="barh-label">{{ item.nombre }}</span>
              <div class="barh-bar-wrap">
                <div class="barh-bar" :style="{ width: (item.valor * 18) + 'px' }"></div>
                <span class="barh-value">{{ item.valor }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="distribucion-col">
          <h6 class="text-center">Distribución por perito {{ ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][mesActual] }} {{ anioActual }}</h6>
          <div class="barh-chart">
            <div v-for="(item, idx) in distribucionPeritos" :key="'barh-perito-' + idx" class="barh-item">
              <span class="barh-label">{{ item.nombre }} {{ item.apellidos }}</span>
              <div class="barh-bar-wrap">
                <div class="barh-bar" :style="{ width: (item.valor * 18) + 'px', background: '#43a047' }"></div>
                <span class="barh-value">{{ item.valor }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="distribucion-row">
        <div class="distribucion-col q-mt-lg" style="max-width: 400px; margin: 60px auto 0;">
          <h6 class="text-center">Distribución por tipo de cliente ({{ ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][mesActual] }} {{ anioActual }})</h6>
          <div class="pie-chart-wrap">
            <div class="pie-chart" :style="pieChartStyle"></div>
            <div class="pie-legend">
              <div><span class="pie-dot pie-particular"></span> Particular: {{ pieData.particular }}</div>
              <div><span class="pie-dot pie-despacho"></span> Despacho: {{ pieData.despacho }}</div>
            </div>
          </div>
        </div>
        <div class="distribucion-col q-mt-lg" style="max-width: 400px; margin: 60px auto 0;">
          <h6 class="text-center">Distribución por especialidad ({{ ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][mesActual] }} {{ anioActual }})</h6>
          <div class="pie-chart-wrap">
            <div class="pie-chart" :style="pieEspecialidadesStyle"></div>
            <div class="pie-legend">
              <div v-for="(item, idx) in pieEspecialidades" :key="'esp-' + idx">
                <span class="pie-dot" :style="{ background: pieColors[idx % pieColors.length] }"></span>
                {{ item.nombre }}: {{ item.valor }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="q-mt-lg" style="max-width: 600px; margin: 60px auto 0;">
        <h6 class="text-center">Top Despachos ({{ ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][mesActual] }} {{ anioActual }})</h6>
        <div class="barh-chart">
          <div v-for="(item, idx) in topDespachos" :key="'desp-' + idx" class="barh-item">
            <span class="barh-label">{{ item.nombre }}</span>
            <div class="barh-bar-wrap">
              <div class="barh-bar" :style="{ width: (item.valor * 18) + 'px', background: '#9c27b0' }"></div>
              <span class="barh-value">{{ item.valor }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="text-h5 mt-5">Graficos de casos cerrados últimos 6 meses</div>
      <div class="q-mt-md" style="max-width: 700px; margin: 40px auto 0;">
        <div class="bar-chart">
          <div
            v-for="(valor, idx) in casosUltimos6Meses.datasets[0].data"
            :key="idx"
            class="bar-item"
          >
            <div class="bar-value" style="margin-bottom: 4px;">{{ valor }}</div>
            <div
              class="bar"
              :style="{ height: (valor * 6 + 10) + 'px' }"
              :title="valor"
            ></div>
            <div class="bar-label">{{ casosUltimos6Meses.labels[idx] }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- <test-chart :chartData="usersPerDay" :options="chartOptions" /> -->
    <!-- <grafico-lineal v-if="endData" :chartData="usersPerDay" :options="chartOptions" />
    <grafico-barras /> -->
  </div>
</template>
<script>
import { ref, onMounted, computed } from "vue";
import { StatsCard, ChartCard } from "@/components/index";
// import TestChart from "@/pages/TestChart";
// import GraficoLineal from "@/components/Grafico/GraficoLineal";
// import GraficoBarras from "@/components/Grafico/GraficoBarras.vue";
import { db } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, query, where, onSnapshot, getDocs  } from 'firebase/firestore';
import { comunidades } from '@/data/comunidades';
import { provincias } from '@/data/provincias';

export default {
  components: {
    StatsCard,
    ChartCard,
    // TestChart,
    // GraficoLineal,
    // GraficoBarras
  },
  setup() {
    const casosSinAsignar = ref(0)
    const clientesSinPresupuesto = ref(0)
    const clientesLlamar = ref(0)
    const days = ref([]);
    const daysMilisec = ref([]);
    const endData = ref(false)
    const endDataComunity = ref(false);
    const usersPerDay = ref({
        labels: [],
        datasets: [
          {
            label: "Usuarios por día",
            backgroundColor: ["#f87979", "#a9d0f5", "#f8e71c", "#50e3c2"],
            data: [],
          },
        ],
      });
    const usersPerComunity = ref({
        labels: [],
        datasets: [
          {
            label: "Usuarios por día",
            backgroundColor: ["#f87979"],
            data: [],
          },
        ],
      });
    const q = query(collection(db, 'casos'), where('telEspecialista', '==', null), where('status', '==', '0'), where('confirmaCaso', '==', '1'));
        
    onSnapshot(q, (querySnapshot) => {
      casosSinAsignar.value = querySnapshot.docs.length;
    });

    const w = query(collection(db, 'casos'), where('status', '==', '1'));
    onSnapshot(w, (querySnapshot) => {
      clientesSinPresupuesto.value = querySnapshot.docs.length;
    });

    const z = query(collection(db, 'clientes'), where('confirmaCaso', '==', '0'));
    onSnapshot(z, (querySnapshot) => {
      clientesLlamar.value = querySnapshot.docs.length;
    });

    const clientsPerDay = (async () => {
      const clientesRef = collection(db, 'clientes');
      const q = query(clientesRef, where("time", ">=", daysMilisec.value[6]));

      // Obtener los documentos que cumplen con la condición
      const clientesSnapshot = await getDocs(q);

      // Crear un objeto para contar los clientes por día
      const clientesPorDia = {};
      // Iterar sobre los documentos obtenidos
      clientesSnapshot.docs.forEach(doc => {
        const cliente = doc.data();
        const clienteTime = cliente.time; // El campo 'time' de cuando el cliente se dio de alta
        
        // Verificar si la fecha de alta (clienteTime) está dentro de las últimas 24 horas
        if (clienteTime >= daysMilisec.value[6] && clienteTime < Date.now()) {
          const fecha = new Date(clienteTime);
          const fechaFormateada = fecha.toLocaleDateString(); // Para obtener solo la fecha (sin hora)

          // Contar los clientes por fecha
          if (!clientesPorDia[fechaFormateada]) {
            clientesPorDia[fechaFormateada] = 0;
          }
          clientesPorDia[fechaFormateada]++;
        }
      });
      usersPerDay.value.labels = Object.keys(clientesPorDia);
      usersPerDay.value.datasets[0].data = Object.values(clientesPorDia);
      endData.value = true;
    })

    const clientsPerComunity = (async () => {
      // const clientesRef = collection(db, 'clientes');
      // const q = query(clientesRef, where("time", ">=", daysMilisec.value[6]));

      console.log(comunidades);
      comunidades.forEach(async( it, idx) => {
        const clientesRef = collection(db, 'clientes');
        const q = query(clientesRef, where("comunidad", "==", idx));
        const clientesSnapshot = await getDocs(q);
        // console.log('Clientes en esta comunidad', clientesSnapshot.docs.length)
        const number = clientesSnapshot.docs.length
        usersPerComunity.value.labels.push(it);
        usersPerComunity.value.datasets[0].data.push(number);
      })
      endDataComunity.value = true;
      console.log(usersPerComunity.value)
      console.log(usersPerDay.value)
    })

    const setDays = (() => {
      // const days = [];
      for (let i = 0; i <= 6; i++) {
        let now = new Date();  // Fecha actual
        now.setDate(now.getDate() - i);  // Restar i días a la fecha actual
        now.setHours(23);   // Establecer la hora a las 23
        now.setMinutes(59); // Establecer los minutos a 59
        now.setSeconds(0);  // Establecer los segundos a 0
        now.setMilliseconds(0); // Establecer los milisegundos a 0
        daysMilisec.value.push(now.getTime())
        days.value.push(now)
      }
      clientsPerDay();
    })

    const mesActual = ref(new Date().getMonth());
    const anioActual = ref(new Date().getFullYear());
    const casosMes = ref(0);

    // NUEVO: Estado centralizado para los casos del mes
    const casosMesDocs = ref([]);

    // NUEVO: Función centralizada para obtener todos los casos cerrados del mes y calcular métricas
    const fetchCasosMesData = async () => {
      const primerDia = new Date(anioActual.value, mesActual.value, 1).getTime();
      const ultimoDia = new Date(anioActual.value, mesActual.value + 1, 1).getTime();
      const q = query(
        collection(db, "casos"),
        where("status", "in", ["3", "4"]),
        where("presupuestoAceptado", ">=", primerDia),
        where("presupuestoAceptado", "<", ultimoDia)
      );
      const snapshot = await getDocs(q);
      const casos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      casosMesDocs.value = casos;
      casosMes.value = casos.length;

      // --- Comunidades ---
      const countsComunidades = Array(comunidades.length).fill(0);
      // --- Peritos ---
      const peritosMap = {};
      // --- Tipo cliente ---
      let particular = 0;
      let despacho = 0;
      // --- Especialidades ---
      const especialidadMap = {};
      // --- Despachos ---
      const despachosMap = {};
      // --- IDs para batch ---
      const telClientes = new Set();
      const telPeritos = new Set();
      const idEspecialidades = new Set();
      const idDespachos = new Set();

      for (const caso of casos) {
        // Comunidades y despachos necesitan cliente
        if (caso.telCliente) telClientes.add(caso.telCliente);
        // Peritos
        if (caso.telEspecialista) telPeritos.add(caso.telEspecialista);
        // Especialidades
        if (caso.especialidad) idEspecialidades.add(caso.especialidad);
        // Despachos
        if ((caso.tipoCliente === '1' || caso.tipoCliente === 1) && caso.idDespacho) idDespachos.add(caso.idDespacho);
        // Tipo cliente
        if (caso.tipoCliente === '1' || caso.tipoCliente === 1) despacho++;
        else particular++;
      }

      // --- Batch clientes ---
      let clientesArr = [];
      if (telClientes.size > 0) {
        clientesArr = await batchGetDocsByIn(collection(db, 'clientes'), 'tel', Array.from(telClientes));
      }
      // Mapa tel -> cliente
      const clientesByTel = {};
      for (const c of clientesArr) clientesByTel[c.tel] = c;

      // --- Comunidades ---
      for (const caso of casos) {
        if (!caso.telCliente) continue;
        const cliente = clientesByTel[caso.telCliente];
        if (!cliente) continue;
        const idx = typeof cliente.comunidad === 'number' ? cliente.comunidad : parseInt(cliente.comunidad);
        if (!isNaN(idx) && idx >= 0 && idx < comunidades.length) {
          countsComunidades[idx]++;
        }
      }
      distribucionComunidades.value.data = countsComunidades;
      // --- Peritos ---
      let especialistasArr = [];
      if (telPeritos.size > 0) {
        especialistasArr = await batchGetDocsByIn(collection(db, 'especialistas'), 'tel', Array.from(telPeritos));
      }
      const peritosByTel = {};
      for (const e of especialistasArr) peritosByTel[e.tel] = e;
      for (const caso of casos) {
        if (!caso.telEspecialista) continue;
        if (!peritosMap[caso.telEspecialista]) peritosMap[caso.telEspecialista] = { count: 0, nombre: '', apellidos: '' };
        peritosMap[caso.telEspecialista].count++;
      }
      const peritosArr = [];
      for (const tel in peritosMap) {
        const esp = peritosByTel[tel];
        peritosArr.push({
          nombre: esp && esp.nombre ? esp.nombre : tel,
          apellidos: esp && esp.apellidos ? esp.apellidos : '',
          valor: peritosMap[tel].count
        });
      }
      peritosArr.sort((a, b) => b.valor - a.valor);
      distribucionPeritos.value = peritosArr;
      // --- Especialidades ---
      let especialidadesArr = [];
      if (idEspecialidades.size > 0) {
        especialidadesArr = await batchGetDocsByIn(collection(db, 'especialidades'), '__name__', Array.from(idEspecialidades));
      }
      const especialidadesById = {};
      for (const e of especialidadesArr) especialidadesById[e.id] = e;
      for (const caso of casos) {
        if (!caso.especialidad) continue;
        if (!especialidadMap[caso.especialidad]) especialidadMap[caso.especialidad] = 0;
        especialidadMap[caso.especialidad]++;
      }
      const especialidadesFinalArr = [];
      for (const id in especialidadMap) {
        const esp = especialidadesById[id];
        especialidadesFinalArr.push({
          nombre: esp && esp.nombre ? esp.nombre : id,
          valor: especialidadMap[id]
        });
      }
      especialidadesFinalArr.sort((a, b) => b.valor - a.valor);
      pieEspecialidades.value = especialidadesFinalArr;
      // --- Despachos ---
      let despachosArr = [];
      if (idDespachos.size > 0) {
        despachosArr = await batchGetDocsByIn(collection(db, 'despachos'), '__name__', Array.from(idDespachos));
      }
      const despachosById = {};
      for (const d of despachosArr) despachosById[d.id] = d;
      for (const caso of casos) {
        if (!(caso.tipoCliente === '1' || caso.tipoCliente === 1)) continue;
        if (!caso.idDespacho) continue;
        if (!despachosMap[caso.idDespacho]) despachosMap[caso.idDespacho] = 0;
        despachosMap[caso.idDespacho]++;
      }
      const topDespachosArr = [];
      for (const id in despachosMap) {
        const despacho = despachosById[id];
        topDespachosArr.push({
          nombre: despacho && despacho.nombre ? despacho.nombre : id,
          valor: despachosMap[id]
        });
      }
      topDespachosArr.sort((a, b) => b.valor - a.valor);
      topDespachos.value = topDespachosArr;
      // --- Pie chart tipo cliente ---
      pieData.value = { particular, despacho };
    };

    const pieEspecialidadesStyle = computed(() => {
      const total = pieEspecialidades.value.reduce((acc, it) => acc + it.valor, 0);
      if (total === 0) return { background: '#eee' };
      let current = 0;
      let stops = pieEspecialidades.value.map((it, idx) => {
        const start = Math.round((current / total) * 100);
        current += it.valor;
        const end = Math.round((current / total) * 100);
        const color = pieColors[idx % pieColors.length];
        return `${color} ${start}% ${end}%`;
      });
      return {
        background: `conic-gradient(${stops.join(', ')})`,
      };
    });
    const pieColors = [
      '#f87979', '#50e3c2', '#1976d2', '#f8e71c', '#a9d0f5', '#43a047', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#8bc34a', '#ffc107', '#795548', '#607d8b'
    ];

    const topDespachos = ref([]);

    const fetchTopDespachos = async () => {
      const primerDia = new Date(anioActual.value, mesActual.value, 1).getTime();
      const ultimoDia = new Date(anioActual.value, mesActual.value + 1, 1).getTime();
      const q = query(
        collection(db, "casos"),
        where("status", "in", ["3", "4"]),
        where("presupuestoAceptado", ">=", primerDia),
        where("presupuestoAceptado", "<", ultimoDia),
        where("tipoCliente", "in", ["1", 1])
      );
      const snapshot = await getDocs(q);
      const despachosMap = {};
      for (const doc of snapshot.docs) {
        const caso = doc.data();
        if (!caso.idDespacho) continue;
        if (!despachosMap[caso.idDespacho]) {
          despachosMap[caso.idDespacho] = 0;
        }
        despachosMap[caso.idDespacho]++;
      }
      // Obtener nombres de despachos
      const despachosArr = [];
      for (const id in despachosMap) {
        const despachosQ = query(collection(db, 'despachos'), where('__name__', '==', id));
        const despachosSnap = await getDocs(despachosQ);
        let nombre = id;
        if (!despachosSnap.empty) {
          const despacho = despachosSnap.docs[0].data();
          nombre = despacho.nombre || id;
        }
        despachosArr.push({ nombre, valor: despachosMap[id] });
      }
      despachosArr.sort((a, b) => b.valor - a.valor);
      topDespachos.value = despachosArr;
    };

    const casosUltimos6Meses = ref({
      labels: [],
      datasets: [
        {
          label: "Casos cerrados últimos 6 meses",
          backgroundColor: ["#50e3c2"],
          data: [],
        },
      ],
    });
    const endData6Meses = ref(false);

    const fetchCasosUltimos6Meses = async () => {
      const now = new Date();
      const meses = [];
      const labels = [];
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const anio = fecha.getFullYear();
        const mes = fecha.getMonth();
        meses.push({ anio, mes });
        labels.push(["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][mes] + ' ' + anio);
      }
      const data = [];
      for (const { anio, mes } of meses) {
        const primerDia = new Date(anio, mes, 1).getTime();
        const ultimoDia = new Date(anio, mes + 1, 1).getTime();
        const q = query(
          collection(db, "casos"),
          where("status", "in", ["3", "4"]),
          where("presupuestoAceptado", ">=", primerDia),
          where("presupuestoAceptado", "<", ultimoDia)
        );
        const snapshot = await getDocs(q);
        data.push(snapshot.docs.length);
      }
      casosUltimos6Meses.value.labels = labels;
      casosUltimos6Meses.value.datasets[0].data = data;
      endData6Meses.value = true;
    };

    const comunidadesOrdenadas = computed(() => {
      return comunidades
        .map((nombre, idx) => ({ nombre, valor: distribucionComunidades.value.data[idx] }))
        .filter(item => item.valor > 0)
        .sort((a, b) => b.valor - a.valor);
    });

    const pieChartStyle = computed(() => {
      const total = pieData.value.particular + pieData.value.despacho;
      if (total === 0) {
        return {
          background: '#eee',
        };
      }
      const percent = Math.round((pieData.value.particular / total) * 100);
      return {
        background: `conic-gradient(#1de9b6 0% ${percent}%, #1976d2 ${percent}% 100%)`,
      };
    });

    const cambiarMes = (delta) => {
      let nuevoMes = mesActual.value + delta;
      let nuevoAnio = anioActual.value;
      if (nuevoMes < 0) {
        nuevoMes = 11;
        nuevoAnio--;
      } else if (nuevoMes > 11) {
        nuevoMes = 0;
        nuevoAnio++;
      }
      mesActual.value = nuevoMes;
      anioActual.value = nuevoAnio;
      fetchCasosMesData();
      fetchCasosUltimos6Meses();
    };

    // Declaraciones de refs y computeds necesarias para el template
    const distribucionComunidades = ref({
      labels: comunidades,
      data: Array(comunidades.length).fill(0),
    });
    const distribucionPeritos = ref([]);
    const pieData = ref({ particular: 0, despacho: 0 });
    const pieEspecialidades = ref([]);

    // Utilidad para consultas batch de hasta 30 elementos
    async function batchGetDocsByIn(collectionRef, field, values) {
      const batchSize = 30;
      const results = [];
      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        const q = query(collectionRef, where(field, 'in', batch));
        const snap = await getDocs(q);
        results.push(...snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }
      return results;
    }

    onMounted(() => {
      fetchCasosMesData();
      fetchCasosUltimos6Meses();
    })
  return {
    casosSinAsignar,
    clientesSinPresupuesto,
    usersPerDay,
    usersPerComunity,
    endData,
    endDataComunity,
    clientesLlamar,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    mesActual,
    anioActual,
    casosMes,
    cambiarMes,
    casosUltimos6Meses,
    endData6Meses,
    distribucionComunidades,
    comunidades,
    comunidadesOrdenadas,
    distribucionPeritos,
    pieData,
    pieChartStyle,
    pieEspecialidades,
    pieEspecialidadesStyle,
    pieColors,
    topDespachos,
  }
  }
};
</script>
<style>
.bar-chart {
  display: flex;
  align-items: flex-end;
  /* height: 180px; */
  gap: 28px;
  justify-content: center;
  margin-top: 32px;
}
.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}
.bar {
  width: 36px;
  background: #1de9b6;
  border-radius: 6px 6px 0 0;
  transition: height 0.3s;
  margin-bottom: 0;
  box-shadow: 0 2px 8px #0001;
}
.bar-label {
  font-size: 1em;
  margin-top: 8px;
  text-align: center;
  min-width: 60px;
  color: #444;
}
.bar-value {
  font-size: 1.1em;
  font-weight: bold;
  color: #222;
}
.comunidad-chart .bar {
  background: #1976d2;
}
.com-lista {
  margin-top: 24px;
  font-size: 1.1em;
  padding-left: 24px;
}
.com-lista li {
  margin-bottom: 8px;
}
.barh-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 24px;
}
.barh-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.barh-label {
  min-width: 140px;
  text-align: right;
  font-size: 11px;
  color: #1976d2;
  font-weight: 500;
}
.barh-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.barh-bar {
  height: 22px;
  background: #1976d2;
  border-radius: 0 12px 12px 0;
  transition: width 0.3s;
  min-width: 10px;
  box-shadow: 0 2px 8px #0001;
}
.barh-value {
  font-size: 1em;
  color: #222;
  font-weight: bold;
  margin-left: 6px;
}
.barh-item .barh-bar {
  background: #1976d2;
}
.barh-item .barh-bar[style*='#43a047'] {
  background: #43a047 !important;
}
.distribucion-row {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: center;
  align-items: flex-start;
  margin-top: 40px;
}
.distribucion-col {
  flex: 1 1 350px;
  /* min-width: 320px; */
  /* max-width: 500px; */
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #0001;
  padding: 24px 16px 32px 16px;
  margin-bottom: 24px;
}
@media (max-width: 1100px) {
  .distribucion-row {
    flex-direction: column;
    gap: 24px;
  }
  .distribucion-col {
    max-width: 100%;
  }
}
.pie-chart-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-top: 24px;
}
.pie-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #eee;
  box-shadow: 0 2px 8px #0001;
}
.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 1.1em;
}
.pie-dot {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.pie-particular {
  background: #1de9b6;
}
.pie-despacho {
  background: #1976d2;
}
</style>
