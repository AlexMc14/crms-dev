<template>
  <form :class="formClass" @submit.prevent="handleSubmit('search')">
    <div class="row">
      <div
        v-for="(filter, index) in filters"
        :key="index"
        :class="fieldClass"
      >
        <label :for="filter.name">{{ filter.label }}</label>
        <!-- Caso para inputs -->
        <b-form-input
          v-if="filter.type === 'input'"
          v-model="formData[filter.name].value"
          @input="handleSubmit('text')"
          :placeholder="filter.placeholder"
          class="mb-3"
          :type="filter.typeInput ? filter.typeInput : 'text'"
          :value="filter.value"
        />
        
        <!-- Caso para selects -->
        <!-- <b-form-select
          v-else-if="filter.type === 'select'"
          v-model="formData[filter.name]"
          :options="filter.options"
          @change="handleSubmit('select')"
          class="mb-3"
        /> -->

        <!-- <select v-else-if="filter.type === 'select'" v-model="formData[filter.name]" class="custom-select" @change="handleSubmit(formData[filter.name])">
          <option v-for="(field, index) in filter.options" :key="index" :value="field.key">{{ field.label }}</option>
        </select> -->

        <!-- Puedes agregar más tipos de entradas si es necesario -->
      </div>
    </div>
    <div class="row">
      <p-button v-if="btnText" type="info" round @click.native.prevent="handleSubmit('btn')">
        {{ btnText }}
      </p-button>
    </div>
  </form>
</template>

<script>
export default {
  name: "FormComponent",
  props: {
    filters: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(filter => {
          if (filter.type === 'input') {
            return typeof filter.value === 'undefined' || typeof filter.value === 'string' || typeof filter.value === 'number';
          }
          return true;
        });
      }
    },
    initialData: {
      type: Object,
      default: () => ({}),
    },
    btnText: {
      type: String,
      required: false,
    },
    formClass: {
      type: String,
      default: "",
    },
    fieldClass: {
      type: String,
      default: "",
    },
    immediateSubmit: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      formData: this.initializeFormData(),
    };
  },
  methods: {
    initializeFormData() {
      const data = {};
      this.filters.forEach(filter => {
        if (filter.type === 'input') {
          data[filter.name] = {
            value: filter.value || ''
          };
        }
      });
      return data;
    },
    handleSubmit(type) {
      // Convertir el formato de formData
      const formattedData = {};
      Object.keys(this.formData).forEach(key => {
        formattedData[key] = this.formData[key].value;
      });

      // Si immediateSubmit es true, emitir en cada cambio de texto
      if (this.immediateSubmit && type === 'text') {
        this.$emit("submit", formattedData);
      } 
      // Si es un botón o búsqueda, siempre emitir
      else if (type === 'btn' || type === 'search') {
        this.$emit("submit", formattedData);
        if (type === 'search') {
          this.$emit("search");
        }
      }
    },
  },
  watch: {
    filters: {
      handler(newFilters) {
        newFilters.forEach(filter => {
          if (filter.type === 'input') {
            if (!this.formData[filter.name]) {
              this.$set(this.formData, filter.name, { value: filter.value || '' });
            } else {
              this.formData[filter.name].value = filter.value || '';
            }
          }
        });
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // Inicializar formData con los valores iniciales
    this.formData = this.initializeFormData();
  }
};
</script>

<style scoped>
/* Agrega estilos según lo necesites */
</style>
