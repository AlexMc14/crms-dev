<template>
  <div class="registro-usuario-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-user"></i>
          Registro de Usuario
        </h1>
        <p class="page-subtitle">Crea tu cuenta y asóciate a una plataforma</p>
      </div>
    </div>
    <div class="main-content">
      <div class="table-section" style="max-width: 400px; margin: 0 auto;">
        <form @submit.prevent="onSubmit" class="form-registro">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.nombre" type="text" class="form-control" :class="{ 'is-invalid': submitted && !form.nombre }" placeholder="Nombre" />
            <div v-if="submitted && !form.nombre" class="invalid-feedback">El nombre es obligatorio</div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" class="form-control" :class="{ 'is-invalid': submitted && !form.email }" placeholder="Email" />
            <div v-if="submitted && !form.email" class="invalid-feedback">El email es obligatorio</div>
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input v-model="form.password" type="password" class="form-control" :class="{ 'is-invalid': submitted && !form.password }" placeholder="Contraseña" />
            <div v-if="submitted && !form.password" class="invalid-feedback">La contraseña es obligatoria</div>
          </div>
          <div class="form-group">
            <label>Plataforma</label>
            <input v-model="form.plataforma" type="text" class="form-control" :class="{ 'is-invalid': submitted && !form.plataforma }" placeholder="Plataforma" />
            <div v-if="submitted && !form.plataforma" class="invalid-feedback">La plataforma es obligatoria</div>
          </div>
          <button type="submit" class="btn-add" :disabled="loading">
            <span v-if="loading">Registrando...</span>
            <span v-else>Registrarse</span>
          </button>
        </form>
        <div v-if="error" class="alert alert-danger q-mt-md">{{ error }}</div>
        <div v-if="success" class="alert alert-success q-mt-md">Usuario registrado correctamente</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { registerUser } from '../services/api/rest'

const form = ref({
  nombre: '',
  email: '',
  password: '',
  plataforma: ''
})
const loading = ref(false)
const error = ref('')
const success = ref(false)
const submitted = ref(false)

const onSubmit = async () => {
  submitted.value = true
  error.value = ''
  success.value = false
  if (!form.value.nombre || !form.value.email || !form.value.password || !form.value.plataforma) return
  loading.value = true
  try {
    // 1. Registrar usuario en Firebase Auth
    const auth = getAuth()
    await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)

    // 2. Llamar a registerUser sin la contraseña
    const { nombre, email, plataforma } = form.value
    await registerUser({ nombre, email, plataforma })

    success.value = true
    Object.assign(form.value, { nombre: '', email: '', password: '', plataforma: '' })
    submitted.value = false
  } catch (e) {
    error.value = (e.response && e.response.data && e.response.data.message) || e.message || 'Error al registrar usuario'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.registro-usuario-container {
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
.form-registro .form-group {
  margin-bottom: 18px;
}
.form-registro label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  display: block;
}
.form-control {
  padding: 10px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
}
.form-control:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}
.is-invalid {
  border-color: #e74c3c;
}
.invalid-feedback {
  color: #e74c3c;
  font-size: 0.9em;
  margin-top: 4px;
}
.alert {
  padding: 12px 20px;
  border-radius: 8px;
  margin-top: 18px;
  font-size: 1em;
  font-weight: 500;
}
.alert-danger {
  background: #fdecea;
  color: #c0392b;
  border: 1px solid #f5c6cb;
}
.alert-success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
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
  width: 100%;
  justify-content: center;
}
.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}
</style> 