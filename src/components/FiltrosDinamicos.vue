<template>
  <div class="filtros-dinamicos">
    <div class="filtros-header">
      <h4>
        <i class="ti-filter"></i>
        Filtros ({{ camposDisponibles.length }} campos)
      </h4>
      <button 
        class="btn-clear-filters" 
        @click="limpiarFiltros"
        v-if="hasActiveFilters"
      >
        <i class="ti-close"></i> Limpiar
      </button>
    </div>

    <div class="filtros-content">
      <div v-if="camposDisponibles.length === 0" class="text-center text-muted">
        <p>No hay campos disponibles para filtrar</p>
      </div>
      <div v-else class="row">
        <div 
          v-for="campo in camposDisponibles" 
          :key="campo.nombre || campo"
          class="col-md-6 col-lg-4 mb-3"
        >
          <div class="form-group">
            <label :for="`filtro-${campo.nombre || campo}`" class="form-label">
              {{ (campo.nombre || campo).charAt(0).toUpperCase() + (campo.nombre || campo).slice(1) }}
            </label>
            
            <!-- Input de texto -->
            <input
              v-if="campo.tipo === 'texto' || campo.tipo === 'correo' || campo.tipo === 'telefono'"
              :id="`filtro-${campo.nombre || campo}`"
              type="text"
              class="form-control"
              v-model="filtros[campo.nombre || campo]"
              :placeholder="`Filtrar por ${campo.nombre || campo}`"
              @input="aplicarFiltros"
            >
            
            <!-- Textarea -->
            <textarea
              v-else-if="campo.tipo === 'textarea'"
              :id="`filtro-${campo.nombre || campo}`"
              class="form-control"
              v-model="filtros[campo.nombre || campo]"
              :placeholder="`Filtrar por ${campo.nombre || campo}`"
              rows="3"
              @input="aplicarFiltros"
            ></textarea>
            
            <!-- Select para campos relacionales -->
            <select
              v-else-if="campo.tipo === 'relacional'"
              :id="`filtro-${campo.nombre || campo}`"
              class="form-control"
              v-model="filtros[campo.nombre || campo]"
              @change="aplicarFiltros"
            >
              <option value="">Todos</option>
              <option 
                v-for="opcion in getOpcionesRelacionadas(campo.seccion)" 
                :key="opcion" 
                :value="opcion"
              >
                {{ opcion }}
              </option>
            </select>
            <small v-if="campo.tipo === 'relacional'" class="text-muted">
              Opciones: {{ getOpcionesRelacionadas(campo.seccion).length }}
            </small>
            
            <!-- Input de fecha -->
            <input
              v-else-if="campo.tipo === 'fecha'"
              :id="`filtro-${campo.nombre || campo}`"
              type="date"
              class="form-control"
              v-model="filtros[campo.nombre || campo]"
              @change="aplicarFiltros"
            >
            
            <!-- Input numérico -->
            <input
              v-else-if="campo.tipo === 'numero'"
              :id="`filtro-${campo.nombre || campo}`"
              type="number"
              class="form-control"
              v-model="filtros[campo.nombre || campo]"
              :placeholder="`Filtrar por ${campo.nombre || campo}`"
              @input="aplicarFiltros"
            >
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'FiltrosDinamicos',
  props: {
    camposDisponibles: {
      type: Array,
      default: () => []
    },
    secciones: {
      type: Array,
      default: () => []
    }
  },
  emits: ['filtros-cambiados'],
  setup(props, { emit }) {
    console.log('🎯 FiltrosDinamicos - Secciones recibidas:', props.secciones)
    console.log('🎯 FiltrosDinamicos - Campos disponibles:', props.camposDisponibles)
    
    const filtros = ref({})

    // Computed para verificar si hay filtros activos
    const hasActiveFilters = computed(() => {
      return Object.values(filtros.value).some(valor => valor && valor.toString().trim() !== '')
    })

    // Aplicar filtros con debounce
    let timeoutId = null
    const aplicarFiltros = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const filtrosActivos = {}
        Object.entries(filtros.value).forEach(([key, value]) => {
          if (value && value.toString().trim() !== '') {
            filtrosActivos[key] = value
          }
        })
        emit('filtros-cambiados', filtrosActivos)
      }, 300)
    }

    // Limpiar todos los filtros
    const limpiarFiltros = () => {
      filtros.value = {}
      emit('filtros-cambiados', {})
    }



    // Obtener opciones para campos relacionales
    const getOpcionesRelacionadas = (seccionRelacionada) => {
      console.log('🔍 Buscando opciones para sección:', seccionRelacionada)
      console.log('📋 Secciones disponibles:', props.secciones.map(s => s.nombre))
      
      const seccion = props.secciones.find(s => 
        (s.slug || slugify(s.nombre)) === (seccionRelacionada ? slugify(seccionRelacionada) : '')
      )
      
      if (!seccion) {
        console.log('❌ No se encontró la sección:', seccionRelacionada)
        return []
      }
      
      if (!seccion.columnas || seccion.columnas.length === 0) {
        console.log('❌ La sección no tiene columnas:', seccion.nombre)
        return []
      }
      
      const campoClave = seccion.columnas[0].nombre
      console.log('🔑 Campo clave:', campoClave)
      
      // Intentar obtener datos de diferentes fuentes
      let datos = []
      
      // Primero intentar con seccion.datos (vista simple)
      if (seccion.datos && Array.isArray(seccion.datos)) {
        datos = seccion.datos
        console.log('✅ Datos encontrados en seccion.datos:', datos.length)
      }
      // Si no hay datos, intentar cargar desde el backend
      else {
        console.log('⚠️ No hay datos disponibles para la sección:', seccion.nombre)
        return []
      }
      
      // Extraer valores únicos del campo clave
      const valores = datos.map(fila => {
        // Intentar diferentes estructuras de datos
        if (fila.valores && fila.valores[campoClave] !== undefined) {
          return fila.valores[campoClave]
        } else if (fila[campoClave] !== undefined) {
          return fila[campoClave]
        }
        return null
      }).filter(Boolean)
      
      const valoresUnicos = [...new Set(valores)]
      console.log('📊 Valores únicos encontrados:', valoresUnicos)
      
      return valoresUnicos
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

    return {
      filtros,
      hasActiveFilters,
      aplicarFiltros,
      limpiarFiltros,
      getOpcionesRelacionadas
    }
  }
}
</script>

<style scoped>
.filtros-dinamicos {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(27, 102, 89, 0.1);
}

.filtros-header h4 {
  margin: 0;
  color: #1b6659;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-clear-filters {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-clear-filters:hover {
  background: #c0392b;
  transform: translateY(-1px);
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


</style> 