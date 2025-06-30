import restService from './rest'

// Servicios para Clientes
export const clientesService = {
  // Obtener todos los clientes
  getAll: (params = {}) => restService.get('/clientes', params),
  
  // Obtener cliente por ID
  getById: (id) => restService.get(`/clientes/${id}`),
  
  // Crear nuevo cliente
  create: (data) => restService.post('/clientes', data),
  
  // Actualizar cliente - ID en la URL
  update: (id, data) => restService.put(`/clientes/${id}`, data),
  
  // Eliminar cliente - ID en la URL
  delete: (id) => restService.delete(`/clientes/${id}`)
}

export const productosService = {
  // Obtener todos los clientes
  getAll: (params = {}) => restService.get('/productos', params),
  
  // Obtener cliente por ID
  getById: (id) => restService.get(`/productos/${id}`),
  
  // Crear nuevo cliente
  create: (data) => restService.post('/productos', data),
  
  // Actualizar cliente - ID en la URL
  update: (id, data) => restService.put(`/productos/${id}`, data),
  
  // Eliminar cliente - ID en la URL
  delete: (id) => restService.delete(`/productos/${id}`)
}

export const categoriasService = {
  // Obtener todos los clientes
  getAll: (params = {}) => restService.get('/categorias', params),
  
  // Obtener cliente por ID
  getById: (id) => restService.get(`/categorias/${id}`),
  
  // Crear nuevo cliente
  create: (data) => restService.post('/categorias', data),
  
  // Actualizar cliente - ID en la URL
  update: (id, data) => restService.put(`/categorias/${id}`, data),
  
  // Eliminar cliente - ID en la URL
  delete: (id) => restService.delete(`/categorias/${id}`)
}

export const serviciosService = {
  // Obtener todos los clientes
  getAll: (params = {}) => restService.get('/servicios', params),
  
  // Obtener cliente por ID
  getById: (id) => restService.get(`/servicios/${id}`),
  
  // Crear nuevo cliente
  create: (data) => restService.post('/servicios', data),
  
  // Actualizar cliente - ID en la URL
  update: (id, data) => restService.put(`/servicios/${id}`, data),
  
  // Eliminar cliente - ID en la URL
  delete: (id) => restService.delete(`/servicios/${id}`)
}

// Servicios para Casos
export const casosService = {
  // Obtener todos los casos
  getAll: (params = {}) => restService.get('/casos', params),
  
  // Obtener caso por ID
  getById: (id) => restService.get(`/casos/${id}`),
  
  // Crear nuevo caso
  create: (data) => restService.post('/casos', data),
  
  // Actualizar caso - ID en la URL
  update: (id, data) => restService.put(`/casos/${id}`, data),
  
  // Eliminar caso - ID en la URL
  delete: (id) => restService.delete(`/casos/${id}`),
  
  // Obtener casos por cliente
  getByCliente: (clienteId) => restService.get(`/casos/cliente/${clienteId}`)
}

// Servicios para Usuarios/Empleados
export const usuariosService = {
  // Obtener todos los usuarios
  getAll: (params = {}) => restService.get('/usuarios', params),
  
  // Obtener usuario por ID
  getById: (id) => restService.get(`/usuarios/${id}`),
  
  // Crear nuevo usuario
  create: (data) => restService.post('/usuarios', data),
  
  // Actualizar usuario - ID en la URL
  update: (id, data) => restService.put(`/usuarios/${id}`, data),
  
  // Eliminar usuario - ID en la URL
  delete: (id) => restService.delete(`/usuarios/${id}`),
  
  // Login
  login: (credentials) => restService.post('/auth/login', credentials),
  
  // Logout
  logout: () => restService.post('/auth/logout'),
  
  // Obtener perfil del usuario actual
  getProfile: () => restService.get('/auth/profile')
}

// Servicios para Citas/Agenda
export const citasService = {
  // Obtener todas las citas
  getAll: (params = {}) => restService.get('/citas', params),
  
  // Obtener cita por ID
  getById: (id) => restService.get(`/citas/${id}`),
  
  // Crear nueva cita
  create: (data) => restService.post('/citas', data),
  
  // Actualizar cita - ID en la URL
  update: (id, data) => restService.put(`/citas/${id}`, data),
  
  // Eliminar cita - ID en la URL
  delete: (id) => restService.delete(`/citas/${id}`),
  
  // Obtener citas por fecha
  getByDate: (date) => restService.get(`/citas/fecha/${date}`)
}

// Servicios para Facturación
export const facturacionService = {
  // Obtener todas las facturas
  getAll: (params = {}) => restService.get('/facturas', params),
  
  // Obtener factura por ID
  getById: (id) => restService.get(`/facturas/${id}`),
  
  // Crear nueva factura
  create: (data) => restService.post('/facturas', data),
  
  // Actualizar factura - ID en la URL
  update: (id, data) => restService.put(`/facturas/${id}`, data),
  
  // Eliminar factura - ID en la URL
  delete: (id) => restService.delete(`/facturas/${id}`),
  
  // Generar PDF de factura
  generatePDF: (id) => restService.get(`/facturas/${id}/pdf`)
}

// Servicios para Archivos/Documentos
export const archivosService = {
  // Subir archivo
  upload: (file, tipo = 'documento') => {
    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('tipo', tipo)
    return restService.upload('/archivos/upload', formData)
  },
  
  // Descargar archivo
  download: (id) => restService.get(`/archivos/${id}/download`),
  
  // Eliminar archivo - ID en la URL
  delete: (id) => restService.delete(`/archivos/${id}`)
} 