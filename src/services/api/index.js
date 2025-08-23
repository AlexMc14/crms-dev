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
    
    // Verificar y agregar tenant-id
    const tenantId = localStorage.getItem('tenantId')
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId
      console.log('✅ Tenant ID agregado a request:', tenantId)
    } else {
      console.warn('⚠️ No se encontró tenant-id en localStorage')
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
    console.log('✅ Tenant ID establecido globalmente:', tenantId)
  } else {
    delete api.defaults.headers['x-tenant-id'];
    console.log('❌ Tenant ID removido globalmente')
  }
}

// Función para verificar el estado del tenant-id
export function checkTenantIdStatus() {
  const tenantId = localStorage.getItem('tenantId')
  const headerTenantId = api.defaults.headers['x-tenant-id']
  
  console.log('🔍 Estado del Tenant ID:')
  console.log('  - localStorage:', tenantId)
  console.log('  - API headers:', headerTenantId)
  console.log('  - Coinciden:', tenantId === headerTenantId)
  
  return {
    localStorage: tenantId,
    apiHeaders: headerTenantId,
    match: tenantId === headerTenantId
  }
}

// Función para probar la conectividad con el backend
export async function testBackendConnection() {
  try {
    console.log('🔍 Probando conectividad con el backend...')
    console.log('  - Base URL:', api.defaults.baseURL)
    console.log('  - Timeout:', api.defaults.timeout)
    
    // Hacer una petición simple para probar la conectividad
    const response = await api.get('/health', { timeout: 5000 })
    console.log('✅ Backend responde correctamente:', response.status)
    return { success: true, status: response.status }
  } catch (error) {
    console.error('❌ Error de conectividad con el backend:', error)
    return { 
      success: false, 
      error: error.message,
      status: error.response && error.response.status,
      data: error.response && error.response.data
    }
  }
}

// Función para verificar la configuración completa
export function checkApiConfiguration() {
  console.log('🔧 Configuración de la API:')
  console.log('  - Base URL:', api.defaults.baseURL)
  console.log('  - Timeout:', api.defaults.timeout)
  console.log('  - Headers por defecto:', api.defaults.headers)
  console.log('  - NODE_ENV:', process.env.NODE_ENV)
  console.log('  - VUE_APP_API_URL:', process.env.VUE_APP_API_URL)
  
  return {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
    headers: api.defaults.headers,
    nodeEnv: process.env.NODE_ENV,
    apiUrl: process.env.VUE_APP_API_URL
  }
}

// Exportar servicios
export { default as restService } from './rest'
export * from './queries'
export { plataformaLookup } from './queries'

export default api 