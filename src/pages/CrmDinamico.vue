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
            <span class="record-count">{{ seccion.datos ? seccion.datos.length : 0 }} registros</span>
          </div>
          <div class="section-actions">
            <button class="btn-view" @click="navegarASeccion(seccion.slug || slugify(seccion.nombre))" title="Ver sección">
              <i class="ti-eye"></i>
            </button>
            <button class="btn-advanced" @click="navegarARegistrosPaginados(seccion._id || seccion.id)" title="Registros avanzados">
              <i class="ti-database"></i>
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
                  <option v-for="sec in secciones" :key="sec.slug || slugify(sec.nombre)" :value="sec.slug || slugify(sec.nombre)" v-if="(sec.slug || slugify(sec.nombre)) !== (seccion.slug || slugify(seccion.nombre))">{{ sec.nombre }}</option>
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
                    <select class="form-control form-control-sm" v-model="fila[col.nombre]" @change="fila._editando = true">
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
                      @input="fila._editando = true"
                    >
                  </template>
                </td>
                <td class="text-center">
                  <button class="btn-delete" @click="eliminarFila(seccionIndex, filaIndex)" title="Eliminar fila">
                    <i class="ti-trash"></i>
                  </button>
                  <button v-if="fila._editando" class="btn-add" @click="guardarFilaEditada(seccionIndex, filaIndex)" title="Guardar cambios">
                    <i class="ti-save"></i>
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
      <!-- <div class="table-section">
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
      </div> -->
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
        secciones.value = (Array.isArray(res) ? res : (res.data || [])).map(s => ({
          ...s,
          slug: s.slug || slugify(s.nombre)
        }))
        console.log('SECCIONES:', JSON.stringify(secciones.value, null, 2))
      } catch (e) {
        alert('Error al cargar secciones')
        secciones.value = []
      }
    }

    // Función para normalizar nombres de sección
    function slugify(text) {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD').replace(/[ \u0300-\u036f]/g, '') // quita tildes
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    // Crear nueva sección
    const crearSeccion = async () => {
      const nombre = nuevaSeccion.value.trim()
      const slug = slugify(nombre)
      if (!nombre) return
      if (secciones.value.find(s => (s.slug || slugify(s.nombre)) === slug)) return
      try {
        await seccionesDinamicasService.create({ nombre, slug, columnas: [], datos: [] })
        nuevaSeccion.value = ''
        await cargarSecciones()
        // Disparar evento para actualizar el menú en tiempo real
        window.dispatchEvent(new CustomEvent('crmSectionsUpdated'))
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
        // Disparar evento para actualizar el menú en tiempo real
        window.dispatchEvent(new CustomEvent('crmSectionsUpdated'))
      } catch (e) {
        alert('Error al editar sección')
      }
    }

    // Navegar a sección específica
    const navegarASeccion = (slugSeccion) => {
      const path = `/crm-seccion/${slugSeccion}`
      console.log('NAVEGAR: slug', slugSeccion, 'URL', path)
      window.location.href = path
    }

    // Navegar a registros paginados
    const navegarARegistrosPaginados = (seccionId) => {
      const path = `/registros-paginados/${seccionId}`
      console.log('NAVEGAR A REGISTROS PAGINADOS: seccionId', seccionId, 'URL', path)
      window.location.href = path
    }

    // Eliminar sección
    const eliminarSeccion = async (index) => {
      const seccion = secciones.value[index]
      if (!confirm(`¿Estás seguro de que quieres eliminar la sección "${seccion.nombre}"?`)) return
      try {
        await seccionesDinamicasService.delete(seccion._id || seccion.id)
        await cargarSecciones()
        // Disparar evento para actualizar el menú en tiempo real
        window.dispatchEvent(new CustomEvent('crmSectionsUpdated'))
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
      console.log('AGREGAR CAMPO: slug relacionado:', seccionRelacionada, 'nombre:', nombre)
      if (!nombre || seccion.columnas.some(col => col.nombre === nombre)) return
      
      const nuevoCampo = { nombre, tipo }
      
      if (tipo === 'relacional' && seccionRelacionada) {
        nuevoCampo.seccion = seccionRelacionada
      }
      
      // Si es archivo, agregar configuración específica
      if (tipo === 'archivo') {
        nuevoCampo.configuracion = {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['*/*'], // Todos los tipos
          multiple: true, // Permitir múltiples archivos
          autoOrganize: true // Organizar automáticamente en Google Drive
        }
      }
      
      seccion.columnas.push(nuevoCampo)
      
      // Inicializar la nueva propiedad en todas las filas existentes
      seccion.datos.forEach(fila => {
        if (!(nombre in fila)) {
          // Para campos de archivo, inicializar como array vacío
          fila[nombre] = tipo === 'archivo' ? [] : ''
        }
      })
      
      // Inicializar la nueva propiedad en nuevaFila
      if (!(nombre in seccion.nuevaFila)) {
        seccion.nuevaFila[nombre] = tipo === 'archivo' ? [] : ''
      }
      
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
        const tipoCampo = col.tipo || 'texto'
        // Para campos de archivo, usar array vacío si no hay valor
        filaNueva[col.nombre] = tipoCampo === 'archivo' 
          ? (seccion.nuevaFila[col.nombre] || [])
          : (seccion.nuevaFila[col.nombre] || '')
      })
      try {
        await seccionesDinamicasService.createRegistro(seccion._id || seccion.id, filaNueva)
        seccion.columnas.forEach(col => { 
          const tipoCampo = col.tipo || 'texto'
          seccion.nuevaFila[col.nombre] = tipoCampo === 'archivo' ? [] : ''
        })
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
      const sec = secciones.value.find(s => (s.slug || slugify(s.nombre)) === (seccionRelacionada ? slugify(seccionRelacionada) : ''))
      if (!sec) return []
      if (sec.columnas.length === 0) return []
      const campoClave = sec.columnas[0].nombre
      return [...new Set(sec.datos.map(fila => fila[campoClave]).filter(Boolean))]
    }

    // Guardar fila editada
    const guardarFilaEditada = async (seccionIndex, filaIndex) => {
      const seccion = secciones.value[seccionIndex]
      const fila = seccion.datos[filaIndex]
      try {
        await seccionesDinamicasService.updateRegistro(seccion._id || seccion.id, fila._id || fila.id, fila)
        fila._editando = false
        await cargarSecciones()
      } catch (e) {
        alert('Error al guardar los cambios de la fila')
      }
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
      navegarARegistrosPaginados,
      forzarActualizacionMenu,
      getOpcionesRelacionadas,
      slugify,
      guardarFilaEditada
    }
  }
}
</script>

<style scoped>
.listado-clientes-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  padding: 0;
}

.crm-dinamico-container {
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
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.table-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1b6659;
  margin: 0;
}

.record-count {
  background: #e9ecef;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #6c757d;
}

.btn-add {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  width: 100%;
  justify-content: center;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-delete, .btn-edit, .btn-view {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-right: 8px;
  transition: color 0.2s;
}

.btn-edit {
  color: #1b6659;
}

.btn-delete {
  color: #e74c3c;
}

.btn-view {
  color: #e67e22;
}

.btn-edit:hover {
  color: #2d8a7a;
}

.btn-delete:hover {
  color: #c0392b;
}

.btn-view:hover {
  color: #d35400;
}

.btn-advanced {
  color: #9b59b6;
}

.btn-advanced:hover {
  color: #8e44ad;
}

.text-capitalize {
  text-transform: capitalize;
}

/* Inputs y tablas */
.form-control, .form-control-sm {
  padding: 10px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus, .form-control-sm:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
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

.new-row {
  background-color: #f8f9fa;
  border-top: 2px solid #dee2e6;
}

.new-row td {
  padding: 12px 8px;
}

/* Responsive */
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
    padding: 10px;
  }
  .table-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  .btn-add {
    align-self: center;
  }
}
</style> 