<template>
  <div class="registros-paginados-container">
    <!-- Header con título -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-database"></i>
          Registros Paginados - {{ seccionActual && seccionActual.nombre ? seccionActual.nombre : 'Sección' }}
        </h1>
        <p class="page-subtitle">Gestión avanzada de registros con filtros y paginación</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-if="cargandoSeccion" class="text-center">
      <div class="loading-spinner">
        <i class="ti-reload"></i>
        <p>Cargando sección...</p>
      </div>
    </div>
    
    <div v-else-if="seccionActual" class="main-content">
      <!-- Filtros dinámicos -->
      <FiltrosDinamicos
        :campos-disponibles="seccionActual.columnas"
        :pagination="pagination"
        :secciones="secciones"
        @filtros-cambiados="aplicarFiltros"
        @pagina-cambiada="cambiarPagina"
      />

      <!-- Tabla de registros -->
      <div class="table-section">
        <div class="table-header">
          <h2>Registros</h2>
          <div class="header-actions">
            <button class="btn-add" @click="showAddModal = true">
              <i class="ti-plus"></i> Agregar Registro
            </button>
            <button class="btn-export" @click="exportarRegistros">
              <i class="ti-download"></i> Exportar
            </button>
          </div>
        </div>

        <!-- Loading de registros -->
        <div v-if="loading" class="loading-table">
          <i class="ti-reload"></i>
          <p>Cargando registros...</p>
        </div>

        <!-- Tabla de registros -->
        <div v-else class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th v-for="columna in seccionActual.columnas" :key="columna.nombre" class="text-capitalize">
                  {{ columna.nombre.charAt(0).toUpperCase() + columna.nombre.slice(1) }}
                </th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="registro in registros" :key="registro._id">
                <td v-for="columna in seccionActual.columnas" :key="columna.nombre">
                  <template v-if="columna.tipo === 'relacional'">
                    <span class="relational-value">{{ registro.valores[columna.nombre] || '-' }}</span>
                  </template>
                  <template v-else-if="columna.tipo === 'fecha'">
                    <span class="date-value">{{ formatearFecha(registro.valores[columna.nombre]) }}</span>
                  </template>
                  <template v-else>
                    <span class="text-value">{{ registro.valores[columna.nombre] || '-' }}</span>
                  </template>
                </td>
                <td class="text-center">
                  <button class="btn-edit" @click="editarRegistro(registro)" title="Editar">
                    <i class="ti-pencil"></i>
                  </button>
                  <button class="btn-delete" @click="eliminarRegistro(registro._id)" title="Eliminar">
                    <i class="ti-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mensaje cuando no hay registros -->
          <div v-if="registros.length === 0" class="no-records">
            <i class="ti-database"></i>
            <p>No se encontraron registros</p>
            <button class="btn-add" @click="showAddModal = true">
              <i class="ti-plus"></i> Agregar primer registro
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar registro -->
    <b-modal v-model="showAddModal" :title="registroEditando ? 'Editar Registro' : 'Agregar Registro'" hide-footer>
      <div class="row">
        <div 
          v-for="columna in (seccionActual && seccionActual.columnas ? seccionActual.columnas : [])" 
          :key="columna.nombre"
          class="col-12 mb-3"
        >
          <div class="form-group">
            <label :for="`campo-${columna.nombre}`" class="form-label">
              {{ columna.nombre.charAt(0).toUpperCase() + columna.nombre.slice(1) }}
            </label>
            
            <!-- Input de texto -->
            <input
              v-if="columna.tipo === 'texto' || columna.tipo === 'email'"
              :id="`campo-${columna.nombre}`"
              type="text"
              class="form-control"
              v-model="nuevoRegistro[columna.nombre]"
              :placeholder="`Ingrese ${columna.nombre}`"
            >
            
            <!-- Select para campos relacionales -->
            <select
              v-else-if="columna.tipo === 'relacional'"
              :id="`campo-${columna.nombre}`"
              class="form-control"
              v-model="nuevoRegistro[columna.nombre]"
            >
              <option value="">Selecciona...</option>
              <option 
                v-for="opcion in getOpcionesRelacionadas(columna.seccion)" 
                :key="opcion" 
                :value="opcion"
              >
                {{ opcion }}
              </option>
            </select>
            
            <!-- Input de fecha -->
            <input
              v-else-if="columna.tipo === 'fecha'"
              :id="`campo-${columna.nombre}`"
              type="date"
              class="form-control"
              v-model="nuevoRegistro[columna.nombre]"
            >
            
            <!-- Input numérico -->
            <input
              v-else-if="columna.tipo === 'numero'"
              :id="`campo-${columna.nombre}`"
              type="number"
              class="form-control"
              v-model="nuevoRegistro[columna.nombre]"
              :placeholder="`Ingrese ${columna.nombre}`"
            >
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <b-button variant="primary" @click="guardarRegistro" class="mr-2">
          {{ registroEditando ? 'Actualizar' : 'Guardar' }}
        </b-button>
        <b-button variant="secondary" @click="cancelarEdicion">
          Cancelar
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { seccionesDinamicasService } from '@/services/api/queries'
import { useRegistrosPaginados } from '@/composables/useRegistrosPaginados'
import FiltrosDinamicos from '@/components/FiltrosDinamicos.vue'

export default {
  name: 'RegistrosPaginados',
  components: {
    FiltrosDinamicos
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // Estado de la sección
    const seccionActual = ref(null)
    const secciones = ref([])
    const cargandoSeccion = ref(true)
    
    // Estado del modal
    const showAddModal = ref(false)
    const registroEditando = ref(null)
    const nuevoRegistro = reactive({})
    
    // Composable de registros paginados
    const { registros, pagination, filters, loading, cargarRegistros } = useRegistrosPaginados()
    
    // Cargar sección actual
    const cargarSeccion = async () => {
      try {
        const seccionId = route.params.seccionId
        const seccion = await seccionesDinamicasService.getById(seccionId)
        seccionActual.value = seccion
        
        // Cargar todas las secciones para campos relacionales
        const todasSecciones = await seccionesDinamicasService.getAll()
        secciones.value = todasSecciones
        
        // Cargar registros iniciales
        await cargarRegistros(seccionId, { page: 1, limit: 10 })
      } catch (error) {
        console.error('Error cargando sección:', error)
      } finally {
        cargandoSeccion.value = false
      }
    }
    
    // Aplicar filtros
    const aplicarFiltros = async (filtrosActivos) => {
      const seccionId = route.params.seccionId
      await cargarRegistros(seccionId, { 
        page: 1, 
        limit: 10,
        filters: filtrosActivos 
      })
    }
    
    // Cambiar página
    const cambiarPagina = async (pagina) => {
      const seccionId = route.params.seccionId
      await cargarRegistros(seccionId, { 
        page: pagina, 
        limit: 10,
        filters: filters.value.applied || {}
      })
    }
    
    // Guardar registro
    const guardarRegistro = async () => {
      try {
        const seccionId = route.params.seccionId
        const datosRegistro = {}
        
        // Preparar datos según los campos de la sección
        seccionActual.value.columnas.forEach(columna => {
          datosRegistro[columna.nombre] = nuevoRegistro[columna.nombre] || ''
        })
        
        if (registroEditando.value) {
          // Actualizar registro existente
          await seccionesDinamicasService.updateRegistro(
            seccionId, 
            registroEditando.value._id, 
            datosRegistro
          )
        } else {
          // Crear nuevo registro
          await seccionesDinamicasService.createRegistro(seccionId, datosRegistro)
        }
        
        // Recargar registros
        await cargarRegistros(seccionId, { 
          page: pagination.value.currentPage || 1, 
          limit: 10,
          filters: filters.value.applied || {}
        })
        
        // Limpiar formulario
        cancelarEdicion()
      } catch (error) {
        console.error('Error guardando registro:', error)
        alert('Error al guardar el registro')
      }
    }
    
    // Editar registro
    const editarRegistro = (registro) => {
      registroEditando.value = registro
      // Copiar valores al formulario
      seccionActual.value.columnas.forEach(columna => {
        nuevoRegistro[columna.nombre] = registro.valores[columna.nombre] || ''
      })
      showAddModal.value = true
    }
    
    // Cancelar edición
    const cancelarEdicion = () => {
      registroEditando.value = null
      showAddModal.value = false
      // Limpiar formulario
      if (seccionActual.value && seccionActual.value.columnas) {
        seccionActual.value.columnas.forEach(columna => {
          nuevoRegistro[columna.nombre] = ''
        })
      }
    }
    
    // Eliminar registro
    const eliminarRegistro = async (registroId) => {
      if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return
      
      try {
        const seccionId = route.params.seccionId
        await seccionesDinamicasService.deleteRegistro(seccionId, registroId)
        
        // Recargar registros
        await cargarRegistros(seccionId, { 
          page: pagination.value.currentPage || 1, 
          limit: 10,
          filters: filters.value.applied || {}
        })
      } catch (error) {
        console.error('Error eliminando registro:', error)
        alert('Error al eliminar el registro')
      }
    }
    
    // Exportar registros
    const exportarRegistros = () => {
      const dataStr = JSON.stringify(registros.value, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${seccionActual.value && seccionActual.value.nombre ? seccionActual.value.nombre : 'registros'}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
    
    // Obtener opciones para campos relacionales
    const getOpcionesRelacionadas = (seccionRelacionada) => {
      const seccion = secciones.value.find(s => 
        (s.slug || slugify(s.nombre)) === (seccionRelacionada ? slugify(seccionRelacionada) : '')
      )
      if (!seccion || !seccion.columnas.length) return []
      
      const campoClave = seccion.columnas[0].nombre
      return [...new Set(seccion.datos.map(fila => fila[campoClave]).filter(Boolean))]
    }
    
    // Función para normalizar nombres de sección
    function slugify(text) {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD').replace(/[ \u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }
    
    // Formatear fecha
    const formatearFecha = (fecha) => {
      if (!fecha) return '-'
      return new Date(fecha).toLocaleDateString('es-ES')
    }
    
    onMounted(() => {
      cargarSeccion()
    })
    
    return {
      seccionActual,
      secciones,
      cargandoSeccion,
      registros,
      pagination,
      filters,
      loading,
      showAddModal,
      registroEditando,
      nuevoRegistro,
      aplicarFiltros,
      cambiarPagina,
      guardarRegistro,
      editarRegistro,
      cancelarEdicion,
      eliminarRegistro,
      exportarRegistros,
      getOpcionesRelacionadas,
      formatearFecha
    }
  }
}
</script>

<style scoped>
.registros-paginados-container {
  padding: 20px;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 40px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  margin-bottom: 30px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.page-title {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 36px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.page-title i {
  color: #1b6659;
  font-size: 40px;
}

.page-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 18px;
  font-weight: 500;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading-spinner {
  text-align: center;
  padding: 60px 20px;
  color: #1b6659;
}

.loading-spinner i {
  font-size: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.table-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 40px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(27, 102, 89, 0.1);
}

.table-header h2 {
  margin: 0;
  color: #1b6659;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.btn-add, .btn-export {
  background: #1b6659;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add:hover, .btn-export:hover {
  background: #2d8a7a;
  transform: translateY(-2px);
}

.loading-table {
  text-align: center;
  padding: 40px 20px;
  color: #1b6659;
}

.loading-table i {
  font-size: 32px;
  animation: spin 1s linear infinite;
}

.table {
  margin-bottom: 0;
}

.table th {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #1b6659;
  padding: 12px 8px;
}

.table td {
  padding: 8px;
  vertical-align: middle;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.relational-value {
  color: #3498db;
  font-weight: 500;
}

.date-value {
  color: #e67e22;
  font-weight: 500;
}

.text-value {
  color: #2c3e50;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 2px;
}

.btn-edit {
  color: #1b6659;
}

.btn-delete {
  color: #e74c3c;
}

.btn-edit:hover {
  color: #2d8a7a;
  background-color: rgba(27, 102, 89, 0.1);
}

.btn-delete:hover {
  color: #c0392b;
  background-color: rgba(231, 76, 60, 0.1);
}

.no-records {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.no-records i {
  font-size: 48px;
  margin-bottom: 20px;
  display: block;
}

.modal-actions {
  margin-top: 20px;
  text-align: right;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  display: block;
}

.form-control {
  padding: 10px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
}

.form-control:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }
  
  .page-title i {
    font-size: 32px;
  }
  
  .main-content {
    padding: 20px 5px;
  }
  
  .table-section {
    padding: 15px;
  }
  
  .table-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style> 