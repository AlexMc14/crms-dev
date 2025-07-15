<template>
  <div class="crm-dinamico-container">
    <!-- Header con título -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-settings"></i>
          CRM con Secciones Personalizables
        </h1>
        <p class="page-subtitle">Gestión dinámica de datos organizados en secciones</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Gestión de secciones -->
      <div class="table-section">
        <div class="table-header">
          <h2>Gestión de Secciones</h2>
        </div>
        <div class="add-section-content">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="nuevaSeccion">Nombre de la nueva sección</label>
                <input
                  id="nuevaSeccion"
                  type="text"
                  class="form-control"
                  v-model="nuevaSeccion"
                  placeholder="Ej: Clientes, Productos, Ventas..."
                  @keyup.enter="crearSeccion"
                >
              </div>
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <button class="btn-add" @click="crearSeccion">
                <i class="ti-plus"></i> Crear Nueva Sección
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de secciones -->
      <div v-for="(seccion, seccionIndex) in secciones" :key="seccionIndex" class="table-section">
        <div class="section-header">
          <div class="section-title">
            <h3>
              <i class="ti-folder"></i>
              {{ seccion.nombre }}
            </h3>
            <span class="record-count">{{ seccion.datos.length }} registros</span>
          </div>
          <div class="section-actions">
            <button class="btn-view" @click="navegarASeccion(seccion.nombre)" title="Ver sección">
              <i class="ti-eye"></i>
            </button>
            <button class="btn-edit" @click="editarNombreSeccion(seccionIndex)" title="Editar nombre">
              <i class="ti-pencil"></i>
            </button>
            <button class="btn-delete" @click="eliminarSeccion(seccionIndex)" title="Eliminar sección">
              <i class="ti-trash"></i>
            </button>
          </div>
        </div>

        <!-- Gestión de campos para esta sección -->
        <div class="fields-management">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label>Nombre del campo</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="seccion.nuevoCampoNombre"
                  placeholder="Ej: nombre, email, categoría..."
                >
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label>Tipo de campo</label>
                <select class="form-control" v-model="seccion.nuevoCampoTipo">
                  <option value="texto">Texto</option>
                  <option value="relacional">Relacional</option>
                </select>
              </div>
            </div>
            <div class="col-md-3" v-if="seccion.nuevoCampoTipo === 'relacional'">
              <div class="form-group">
                <label>Sección relacionada</label>
                <select class="form-control" v-model="seccion.nuevoCampoSeccion">
                  <option v-for="sec in secciones" :key="sec.nombre" :value="sec.nombre" v-if="sec.nombre !== seccion.nombre">{{ sec.nombre }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn-secondary" @click="agregarCampo(seccionIndex)">
                <i class="ti-plus"></i> Agregar Campo
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla de la sección -->
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th v-for="columna in seccion.columnas" :key="columna.nombre" class="text-capitalize">
                  {{ columna.nombre.charAt(0).toUpperCase() + columna.nombre.slice(1) }}
                </th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, filaIndex) in seccion.datos" :key="filaIndex">
                <td v-for="col in seccion.columnas" :key="col.nombre">
                  <template v-if="col.tipo === 'relacional'">
                    <select class="form-control form-control-sm" v-model="fila[col.nombre]">
                      <option value="">Selecciona...</option>
                      <option v-for="item in getOpcionesRelacionadas(col.seccion)" :key="item" :value="item">{{ item }}</option>
                    </select>
                  </template>
                  <template v-else>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="fila[col.nombre]"
                      :placeholder="'Ingrese ' + col.nombre"
                    >
                  </template>
                </td>
                <td class="text-center">
                  <button class="btn-delete" @click="eliminarFila(seccionIndex, filaIndex)" title="Eliminar fila">
                    <i class="ti-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="new-row">
                <td v-for="col in seccion.columnas" :key="col.nombre">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    v-model="seccion.nuevaFila[col.nombre]"
                    :placeholder="'Nuevo ' + col.nombre"
                    @keyup.enter="agregarFila(seccionIndex)"
                  >
                </td>
                <td class="text-center">
                  <button class="btn-add" @click="agregarFila(seccionIndex)" title="Agregar fila">
                    <i class="ti-plus"></i>
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Acciones globales -->
      <div class="table-section">
        <div class="table-header">
          <h2>Acciones Globales</h2>
        </div>
        <div class="actions-section">
          <div class="row">
            <div class="col-md-3">
              <button class="btn-secondary" @click="exportarTodo">
                <i class="ti-download"></i> Exportar Todo
              </button>
            </div>
            <div class="col-md-3">
              <button class="btn-secondary" @click="importarTodo">
                <i class="ti-upload"></i> Importar Todo
              </button>
            </div>
            <div class="col-md-3">
              <button class="btn-secondary" @click="limpiarTodo">
                <i class="ti-trash"></i> Limpiar Todo
              </button>
            </div>
            <div class="col-md-3">
              <button class="btn-secondary" @click="guardarConfiguracion">
                <i class="ti-save"></i> Guardar Todo
              </button>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-3">
              <button class="btn-secondary" @click="forzarActualizacionMenu">
                <i class="ti-refresh"></i> Actualizar Menú
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para editar nombre de sección -->
    <b-modal v-model="showEditModal" title="Editar nombre de sección" hide-footer>
      <div class="row">
        <div class="col-12">
          <div class="form-group">
            <label>Nuevo nombre de la sección</label>
            <input
              type="text"
              class="form-control"
              v-model="seccionEditando.nuevoNombre"
              placeholder="Ingrese el nuevo nombre"
            >
          </div>
        </div>
        <div class="col-12 mt-3">
          <b-button variant="primary" @click="confirmarEditarSeccion" class="mr-2">Guardar</b-button>
          <b-button variant="secondary" @click="showEditModal = false">Cancelar</b-button>
        </div>
      </div>
    </b-modal>

    <!-- Modal de confirmación para limpiar todo -->
    <b-modal v-model="showClearModal" title="Confirmar acción" hide-footer>
      <div class="text-center">
        <p>¿Estás seguro de que quieres eliminar todas las secciones y datos?</p>
        <p class="text-danger">Esta acción no se puede deshacer.</p>
        <div class="mt-3">
          <b-button variant="danger" @click="confirmarLimpiarTodo" class="mr-2">Eliminar Todo</b-button>
          <b-button variant="secondary" @click="showClearModal = false">Cancelar</b-button>
        </div>
      </div>
    </b-modal>

    <!-- Input oculto para importar archivos -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="procesarArchivoImportado"
    >
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { seccionesDinamicasService } from '@/services/api/queries'

export default {
  name: 'CrmDinamico',
  setup() {
    const secciones = ref([])
    const nuevaSeccion = ref('')
    const showEditModal = ref(false)
    const showClearModal = ref(false)
    const fileInput = ref(null)
    const seccionEditando = reactive({
      index: -1,
      nuevoNombre: ''
    })

    // Cargar secciones desde backend
    const cargarSecciones = async () => {
      try {
        const res = await seccionesDinamicasService.getAll()
        secciones.value = Array.isArray(res) ? res : (res.data || [])
      } catch (e) {
        alert('Error al cargar secciones')
        secciones.value = []
      }
    }

    // Crear nueva sección
    const crearSeccion = async () => {
      const nombre = nuevaSeccion.value.trim()
      if (!nombre) return
      if (secciones.value.find(s => s.nombre.toLowerCase() === nombre.toLowerCase())) return
      try {
        await seccionesDinamicasService.create({ nombre, columnas: [], datos: [] })
        nuevaSeccion.value = ''
        await cargarSecciones()
      } catch (e) {
        alert('Error al crear sección')
      }
    }

    // Editar nombre de sección
    const editarNombreSeccion = (index) => {
      seccionEditando.index = index
      seccionEditando.nuevoNombre = secciones.value[index].nombre
      showEditModal.value = true
    }

    // Confirmar editar sección
    const confirmarEditarSeccion = async () => {
      const nuevoNombre = seccionEditando.nuevoNombre.trim()
      if (!nuevoNombre || seccionEditando.index < 0) return
      const seccion = secciones.value[seccionEditando.index]
      try {
        await seccionesDinamicasService.update(seccion._id || seccion.id, { ...seccion, nombre: nuevoNombre })
        showEditModal.value = false
        await cargarSecciones()
      } catch (e) {
        alert('Error al editar sección')
      }
    }

    // Navegar a sección específica
    const navegarASeccion = (nombreSeccion) => {
      const path = `/crm-seccion/${nombreSeccion.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`
      window.location.href = path
    }

    // Eliminar sección
    const eliminarSeccion = async (index) => {
      const seccion = secciones.value[index]
      if (!confirm(`¿Estás seguro de que quieres eliminar la sección "${seccion.nombre}"?`)) return
      try {
        await seccionesDinamicasService.delete(seccion._id || seccion.id)
        await cargarSecciones()
      } catch (e) {
        alert('Error al eliminar sección')
      }
    }

    // Agregar campo a una sección
    const agregarCampo = async (seccionIndex) => {
      const seccion = secciones.value[seccionIndex]
      const nombre = (seccion.nuevoCampoNombre || '').trim().toLowerCase()
      const tipo = seccion.nuevoCampoTipo || 'texto'
      const seccionRelacionada = seccion.nuevoCampoSeccion || ''
      if (!nombre || seccion.columnas.some(col => col.nombre === nombre)) return
      const nuevoCampo = { nombre, tipo }
      if (tipo === 'relacional' && seccionRelacionada) {
        nuevoCampo.seccion = seccionRelacionada
      }
      seccion.columnas.push(nuevoCampo)
      seccion.datos.forEach(fila => { fila[nombre] = '' })
      seccion.nuevaFila[nombre] = ''
      seccion.nuevoCampoNombre = ''
      seccion.nuevoCampoTipo = 'texto'
      seccion.nuevoCampoSeccion = ''
      try {
        await seccionesDinamicasService.update(seccion._id || seccion.id, seccion)
        await cargarSecciones()
      } catch (e) {
        alert('Error al agregar campo')
      }
    }

    // Agregar fila a una sección
    const agregarFila = async (seccionIndex) => {
      const seccion = secciones.value[seccionIndex]
      const filaNueva = {}
      seccion.columnas.forEach(col => {
        filaNueva[col.nombre] = seccion.nuevaFila[col.nombre] || ''
      })
      try {
        await seccionesDinamicasService.createRegistro(seccion._id || seccion.id, filaNueva)
        seccion.columnas.forEach(col => { seccion.nuevaFila[col.nombre] = '' })
        await cargarSecciones()
      } catch (e) {
        alert('Error al agregar fila')
      }
    }

    // Eliminar fila de una sección
    const eliminarFila = async (seccionIndex, filaIndex) => {
      const seccion = secciones.value[seccionIndex]
      const registro = seccion.datos[filaIndex]
      try {
        await seccionesDinamicasService.deleteRegistro(seccion._id || seccion.id, registro._id || registro.id)
        await cargarSecciones()
      } catch (e) {
        alert('Error al eliminar fila')
      }
    }

    // Exportar todo
    const exportarTodo = () => {
      const dataStr = JSON.stringify(secciones.value, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'crm-secciones.json'
      link.click()
      URL.revokeObjectURL(url)
    }

    // Importar todo
    const importarTodo = () => {
      fileInput.value.click()
    }
    const procesarArchivoImportado = async (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result)
            if (Array.isArray(data)) {
              // Borra todas las secciones actuales y sube las nuevas
              for (const seccion of secciones.value) {
                await seccionesDinamicasService.delete(seccion._id || seccion.id)
              }
              for (const seccion of data) {
                await seccionesDinamicasService.create(seccion)
              }
              await cargarSecciones()
            }
          } catch (error) {
            alert('Error al procesar el archivo')
          }
        }
        reader.readAsText(file)
      }
    }

    // Limpiar todo
    const limpiarTodo = () => {
      showClearModal.value = true
    }
    const confirmarLimpiarTodo = async () => {
      try {
        for (const seccion of secciones.value) {
          await seccionesDinamicasService.delete(seccion._id || seccion.id)
        }
        secciones.value = []
        showClearModal.value = false
        await cargarSecciones()
      } catch (e) {
        alert('Error al limpiar todo')
      }
    }

    // Guardar configuración
    const guardarConfiguracion = async () => {
      try {
        for (const seccion of secciones.value) {
          await seccionesDinamicasService.update(seccion._id || seccion.id, seccion)
        }
        alert('Configuración guardada correctamente')
      } catch (e) {
        alert('Error al guardar configuración')
      }
    }

    // Forzar actualización del menú
    const forzarActualizacionMenu = () => {
      window.dispatchEvent(new CustomEvent('crmSectionsUpdated'))
      alert('Evento de actualización enviado')
    }

    // Opciones relacionales
    const getOpcionesRelacionadas = (seccionRelacionada) => {
      const sec = secciones.value.find(s => s.nombre === seccionRelacionada)
      if (!sec) return []
      if (sec.columnas.length === 0) return []
      const campoClave = sec.columnas[0].nombre
      return [...new Set(sec.datos.map(fila => fila[campoClave]).filter(Boolean))]
    }

    onMounted(() => {
      cargarSecciones()
    })

    return {
      secciones,
      nuevaSeccion,
      showEditModal,
      showClearModal,
      fileInput,
      seccionEditando,
      crearSeccion,
      editarNombreSeccion,
      confirmarEditarSeccion,
      eliminarSeccion,
      agregarCampo,
      agregarFila,
      eliminarFila,
      exportarTodo,
      importarTodo,
      procesarArchivoImportado,
      limpiarTodo,
      confirmarLimpiarTodo,
      guardarConfiguracion,
      navegarASeccion,
      forzarActualizacionMenu,
      getOpcionesRelacionadas
    }
  }
}
</script>

<style scoped>
.crm-dinamico-container {
  padding: 20px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.page-title i {
  margin-right: 15px;
  font-size: 2.2rem;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.table-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.table-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.add-section-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.section-title h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title h3 i {
  color: #667eea;
}

.record-count {
  background: #e9ecef;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #6c757d;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.fields-management {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  display: block;
}

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 10px 15px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-control-sm {
  padding: 6px 10px;
  font-size: 0.9rem;
}

.table {
  margin-bottom: 0;
}

.table th {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  padding: 12px 8px;
}

.table td {
  padding: 8px;
  vertical-align: middle;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.new-row {
  background-color: #f8f9fa;
  border-top: 2px solid #dee2e6;
}

.new-row td {
  padding: 12px 8px;
}

.btn-add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-view {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view:hover {
  background: #138496;
  transform: scale(1.05);
}

.btn-edit {
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background: #e0a800;
  transform: scale(1.05);
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #c82333;
  transform: scale(1.05);
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.actions-section {
  padding: 20px 0;
}

.text-capitalize {
  text-transform: capitalize;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .table-header,
  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .section-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .table-responsive {
    overflow-x: auto;
  }
  
  .actions-section .row {
    gap: 15px;
  }
}
</style> 