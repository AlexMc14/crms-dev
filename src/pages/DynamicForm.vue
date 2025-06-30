<template>
  <div>
    <div v-for="(field, index) in schema" :key="index" class="mb-3">
      <component
        :is="getComponent(field.type)"
        :value="model[field.field]"
        @input="value => updateField(field.field, value)"
        v-bind="getProps(field)"
      >
        <template v-if="field.type === 'select'" #first>
          <option disabled value="">Seleccione una opción</option>
        </template>
      </component>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: { type: Object, default: () => ({}) },
    schema: { type: Array, required: true }
  },
  computed: {
    model() {
      return this.modelValue
    }
  },
  methods: {
    updateField(fieldName, value) {
      const updated = { ...this.modelValue }
      updated[fieldName] = value
      this.$emit('update:modelValue', updated)
    },
    getComponent(type) {
      switch (type) {
        case 'text':
        case 'email':
        case 'number':
        case 'date':
          return 'b-form-input'
        case 'textarea':
          return 'b-form-textarea'
        case 'select':
          return 'b-form-select'
        case 'checkbox':
          return 'b-form-checkbox'
        default:
          return 'b-form-input'
      }
    },
    getProps(field) {
      const props = {
        placeholder: field.label || '',
        class: 'w-100'
      }

      if (field.type === 'select') props.options = field.options || []
      if (field.type === 'textarea') props.rows = 3
      if (['email', 'number', 'date'].includes(field.type)) props.type = field.type

      return props
    }
  }
}
</script>
