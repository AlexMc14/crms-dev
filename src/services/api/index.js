import axios from 'axios'

// Configuración base de axios
const api = axios.create({
  // baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000',
  baseURL: process.env.VUE_APP_API_URL || 'https://crms-back.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // DEBUG: log del tenant id
    console.log('Tenant header:', config.headers['x-tenant-id']);
    // Log para debugging
    console.log('Request:', config.method && config.method.toUpperCase(), config.url)
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log para debugging
    console.log('Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('Response error:', error.response && error.response.status, error.response && error.response.data)
    
    // Manejar errores de autenticación
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

// Permitir actualizar dinámicamente el tenant id
export function setTenantId(tenantId) {
  if (tenantId) {
    api.defaults.headers['x-tenant-id'] = tenantId;
  } else {
    delete api.defaults.headers['x-tenant-id'];
  }
}

// Exportar servicios
export { default as restService } from './rest'
export * from './queries'
export { plataformaLookup } from './queries'

export default api 