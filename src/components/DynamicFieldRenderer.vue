<template>
  <div class="dynamic-field-renderer">
    <!-- Campo de texto -->
    <input
      v-if="field.tipo === 'texto'"
      type="text"
      class="form-control"
      :value="value"
      @input="$emit('input', $event.target.value)"
      :placeholder="field.placeholder || `Ingresa ${field.nombre}`"
    >

    <!-- Campo numérico -->
    <input
      v-else-if="field.tipo === 'numero'"
      type="number"
      class="form-control"
      :value="value"
      @input="$emit('input', $event.target.value)"
      :placeholder="field.placeholder || `Ingresa ${field.nombre}`"
    >

    <!-- Campo de fecha -->
    <input
      v-else-if="field.tipo === 'fecha'"
      type="date"
      class="form-control"
      :value="value"
      @input="$emit('input', $event.target.value)"
    >

    <!-- Campo select -->
    <select
      v-else-if="field.tipo === 'select'"
      class="form-control"
      :value="value"
      @change="$emit('input', $event.target.value)"
    >
      <option value="">Selecciona una opción</option>
      <option 
        v-for="opcion in field.opciones" 
        :key="opcion" 
        :value="opcion"
      >
        {{ opcion }}
      </option>
    </select>

    <!-- Campo relacional -->
    <div v-else-if="field.tipo === 'relacional'" class="relational-field">
      <input
        type="text"
        class="form-control"
        :value="value"
        @input="handleRelationalInput"
        :placeholder="`Buscar en ${field.seccionRelacionada || 'sección relacionada'}`"
        @focus="showRelationalOptions = true"
        @blur="handleRelationalBlur"
      >
      
      <!-- Opciones relacionales -->
      <div v-if="showRelationalOptions && filteredOptions.length > 0" class="relational-options">
        <div 
          v-for="option in filteredOptions" 
          :key="option.id || option._id"
          class="option-item"
          @mousedown="selectRelationalOption(option)"
        >
          {{ getRelationalDisplayValue(option) }}
        </div>
      </div>
    </div>

    <!-- Campo de archivo -->
    <div v-else-if="field.tipo === 'archivo'" class="file-field">
      <FileUpload
        :value="value || []"
        @input="$emit('input', $event)"
        :case-id="caseId"
        :case-name="caseName"
        :folder-id="folderId"
        @files-uploaded="handleFileUploaded"
      />
    </div>

    <!-- Campo por defecto (texto) -->
    <input
      v-else
      type="text"
      class="form-control"
      :value="value"
      @input="$emit('input', $event.target.value)"
      :placeholder="field.placeholder || `Ingresa ${field.nombre}`"
    >
  </div>
</template>

<script>
import FileUpload from './FileUpload.vue'

export default {
  name: 'DynamicFieldRenderer',
  components: {
    FileUpload
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    value: {
      type: [String, Number, Array],
      default: ''
    },
    caseId: {
      type: String,
      default: null
    },
    caseName: {
      type: String,
      default: ''
    },
    folderId: {
      type: String,
      default: null
    },
    relatedData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showRelationalOptions: false,
      searchTerm: ''
    }
  },
  computed: {
    filteredOptions() {
      if (!this.relatedData || !this.searchTerm) {
        return this.relatedData.slice(0, 10) // Mostrar solo los primeros 10
      }
      
      return this.relatedData.filter(item => {
        const displayValue = this.getRelationalDisplayValue(item).toLowerCase()
        return displayValue.includes(this.searchTerm.toLowerCase())
      }).slice(0, 10)
    }
    },
  watch: {
    value: {
      handler(newValue) {
        if (this.field.tipo === 'relacional' && newValue) {
          this.searchTerm = newValue
        }
      },
      immediate: true
    }
  },
  methods: {
    // Obtener valor de visualización para campos relacionales
    getRelationalDisplayValue(item) {
      if (!item || !this.field.campoMostrar) return 'Sin nombre'
      
      // Si el item tiene valores anidados (como en tu estructura)
      if (item.valores && item.valores[this.field.campoMostrar]) {
        return item.valores[this.field.campoMostrar]
      }
      
      // Si es directo
      return item[this.field.campoMostrar] || item.nombre || 'Sin nombre'
    },

    // Manejar input en campos relacionales
    handleRelationalInput(event) {
      this.searchTerm = event.target.value
      this.$emit('input', event.target.value)
    },

    // Manejar blur en campos relacionales
    handleRelationalBlur() {
      setTimeout(() => {
        this.showRelationalOptions = false
      }, 200)
    },

    // Seleccionar opción relacional
    selectRelationalOption(option) {
      const displayValue = this.getRelationalDisplayValue(option)
      this.$emit('input', displayValue)
      this.searchTerm = displayValue
      this.showRelationalOptions = false
    },

    // Manejar archivo subido
    handleFileUploaded(file) {
      this.$emit('file-uploaded', file)
    }
  }
}
</script>

<style scoped>
.dynamic-field-renderer {
  position: relative;
  width: 100%;
}

.relational-field {
  position: relative;
}

.relational-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.option-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.option-item:hover {
  background: #f8f9fa;
}

.option-item:last-child {
  border-bottom: none;
}

.file-field {
  width: 100%;
}
</style> 