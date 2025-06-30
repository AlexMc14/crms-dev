<template>
  <div class="container-fluid">
    <b-card class="mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0">{{ title }}: {{ entityName }}</h5>
        <b-button 
          v-if="showActions" 
          variant="primary" 
          @click="showCreate = true"
        >
          <i class="fas fa-plus"></i> Añadir nuevo
        </b-button>
      </div>

      <b-table
        :items="rows"
        :fields="columns"
        :busy="loading"
        striped
        bordered
        hover
        :per-page="10"
        :current-page="currentPage"
        class="mt-3"
      >
        <!-- Loader personalizado -->
        <template #table-busy>
          <div class="text-center my-4">
            <b-spinner variant="primary" label="Cargando..."></b-spinner>
          </div>
        </template>

        <!-- Celda de acciones -->
        <template #cell(actions)="data" v-if="showActions">
          <div class="btn-group">
            <b-button
              v-for="action in rowActions"
              :key="action.type"
              variant="link"
              size="sm"
              @click="handleAction(action.type, data.item)"
            >
              <i :class="'fas fa-' + action.icon"></i>
            </b-button>
          </div>
        </template>

        <!-- Celdas normales -->
        <template #cell(value)="data">
          <template v-if="isTimestamp(data.value)">
            {{ formatTimestamp(data.value) }}
          </template>
          <template v-else>
            {{ data.value }}
          </template>
        </template>

        <!-- No hay datos -->
        <template #empty>
          <div class="text-center py-4 text-muted">
            No hay datos disponibles
          </div>
        </template>
      </b-table>

      <b-pagination
        v-model="currentPage"
        :total-rows="rows.length"
        :per-page="10"
        align="center"
        class="mt-3"
      ></b-pagination>
    </b-card>

    <!-- Modal Detalle -->
    <b-modal v-model="showDetail" title="Detalles del registro" v-if="showActions">
      <div v-for="(value, key) in selectedRow" :key="key" class="mb-2">
        <strong>{{ key }}:</strong> 
        <span v-if="isTimestamp(value)">{{ formatTimestamp(value) }}</span>
        <span v-else>{{ value }}</span>
      </div>
      <template #modal-footer>
        <b-button variant="secondary" @click="showDetail = false">Cerrar</b-button>
      </template>
    </b-modal>

    <!-- Modal Editar -->
    <b-modal v-model="showEdit" title="Editar registro">
      <div v-for="field in formSchema" :key="field.field" class="mb-3">
        <b-form-input
          v-model="editRow[field.field]"
          :label="field.label"
          :type="field.type"
        ></b-form-input>
      </div>
      <template #modal-footer>
        <b-button variant="secondary" @click="showEdit = false">Cancelar</b-button>
        <b-button variant="primary" @click="updateRecord">Guardar</b-button>
      </template>
    </b-modal>

    <!-- Modal Crear nuevo -->
    <b-modal v-model="showCreate" title="Nuevo registro">
      <div v-for="field in formSchema" :key="field.field" class="mb-3">
        <b-form-input
          v-model="newRow[field.field]"
          :label="field.label"
          :type="field.type"
        ></b-form-input>
      </div>
      <template #modal-footer>
        <b-button variant="secondary" @click="showCreate = false">Cancelar</b-button>
        <b-button variant="primary" @click="createRecord">Guardar</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore'

const props = defineProps({
  entityName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Lista dinámica'
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const entityId = props.entityName.toLowerCase()
const rows = ref([])
const columns = ref([])
const rowActions = ref([
  { type: 'detail', label: 'Ver', icon: 'eye' },
  { type: 'edit', label: 'Editar', icon: 'edit' },
  { type: 'delete', label: 'Eliminar', icon: 'trash' }
])
const formSchema = ref([])
const showDetail = ref(false)
const showEdit = ref(false)
const showCreate = ref(false)
const selectedRow = ref({})
const editRow = ref({})
const newRow = ref({})
const loading = ref(true)
const currentPage = ref(1)

onMounted(async () => {
  try {
    loading.value = true
    // Obtener los datos de la colección
    const recordsSnap = await getDocs(collection(db, `workspaces/default/${entityId}`))
    
    // Mapear los documentos a filas
    rows.value = recordsSnap.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data
      }
    })

    console.log('Datos cargados:', rows.value)

    // Generar columnas dinámicamente basadas en los campos del primer documento
    if (rows.value.length > 0) {
      const firstRow = rows.value[0]
      columns.value = Object.keys(firstRow)
        .filter(key => key !== 'id') // Excluimos el id de las columnas visibles
        .map(key => ({
          name: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'), // Mejor formato para el label
          field: key,
          sortable: true,
          align: typeof firstRow[key] === 'number' ? 'right' : 'left'
        }))

      // Añadir columna de acciones si showActions es true
      if (props.showActions) {
        columns.value.push({ 
          name: 'actions', 
          label: 'Acciones', 
          field: 'actions', 
          align: 'center'
        })
      }

      console.log('Columnas configuradas:', columns.value)

      // Generar formSchema basado en las columnas
      formSchema.value = columns.value
        .filter(col => col.name !== 'actions')
        .map(col => ({
          field: col.name,
          label: col.label,
          type: typeof firstRow[col.name] === 'number' ? 'number' : 'text'
        }))
    }
  } catch (error) {
    console.error('Error al cargar los datos:', error)
  } finally {
    loading.value = false
  }
})

function handleAction(type, row) {
  selectedRow.value = row
  switch (type) {
    case 'detail':
      showDetail.value = true
      break
    case 'edit':
      editRow.value = { ...row }
      showEdit.value = true
      break
    case 'delete':
      if (confirm('¿Eliminar este registro?')) {
        deleteDoc(doc(db, `workspaces/default/${entityId}/${row.id}`))
        rows.value = rows.value.filter(r => r.id !== row.id)
      }
      break
  }
}

async function updateRecord() {
  await updateDoc(doc(db, `workspaces/default/${entityId}/${editRow.value.id}`), editRow.value)
  const index = rows.value.findIndex(r => r.id === editRow.value.id)
  if (index !== -1) rows.value[index] = { ...editRow.value }
  showEdit.value = false
}

async function createRecord() {
  const docRef = await addDoc(collection(db, `workspaces/default/${entityId}`), newRow.value)
  rows.value.push({ id: docRef.id, ...newRow.value })
  newRow.value = {}
  showCreate.value = false
}

// Función para verificar si un valor es timestamp
function isTimestamp(value) {
  return value && typeof value === 'string' && (value.includes('UTC') || !isNaN(Date.parse(value)))
}

// Función para formatear timestamps
function formatTimestamp(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return value
  }
}
</script>

<style scoped>
.btn-group .btn-link {
  padding: 0.25rem 0.5rem;
  color: #007bff;
}
.btn-group .btn-link:hover {
  color: #0056b3;
}
</style>
