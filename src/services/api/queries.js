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

export const facturasService = {
  // Obtener todos los clientes
  getAll: (params = {}) => restService.get('/facturas', params),
  
  // Obtener cliente por ID
  getById: (id) => restService.get(`/facturas/${id}`),
  
  // Crear nuevo cliente
  create: (data) => restService.post('/facturas', data),
  
  // Actualizar cliente - ID en la URL
  update: (id, data) => restService.put(`/facturas/${id}`, data),
  
  // Eliminar cliente - ID en la URL
  delete: (id) => restService.delete(`/facturas/${id}`)
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

// Servicios para Secciones Dinámicas
export const seccionesDinamicasService = {
  // Obtener todas las secciones y su estructura
  getAll: (params = {}) => restService.get('/secciones-dinamicas', params),

  // Obtener una sección por ID
  getById: (id) => restService.get(`/secciones-dinamicas/${id}`),

  // Crear nueva sección
  create: (data) => restService.post('/secciones-dinamicas', data),

  // Actualizar sección (estructura/campos)
  update: (id, data) => restService.put(`/secciones-dinamicas/${id}`, data),

  // Eliminar sección
  delete: (id) => restService.delete(`/secciones-dinamicas/${id}`),

  // Obtener registros de una sección
  getRegistros: (seccionId, params = {}) => restService.get(`/secciones-dinamicas/${seccionId}/registros`, params),

  // Obtener registros paginados de una sección
  getRegistrosPaginados: (seccionId, params = {}) => restService.get(`/secciones-dinamicas/${seccionId}/registros-paginados`, params),

  // Crear registro en una sección
  createRegistro: (seccionId, data) => restService.post(`/secciones-dinamicas/${seccionId}/registros`, data),

  // Actualizar registro
  updateRegistro: (seccionId, registroId, data) => restService.put(`/secciones-dinamicas/${seccionId}/registros/${registroId}`, data),

  // Eliminar registro
  deleteRegistro: (seccionId, registroId) => restService.delete(`/secciones-dinamicas/${seccionId}/registros/${registroId}`),

  // Guardar configuración del calendario
  saveCalendarConfig: (seccionId, calendarConfig) => restService.post(`/secciones-dinamicas/${seccionId}/calendar-config`, calendarConfig),

  // Obtener configuraciones de calendario de una sección
  getCalendarConfigs: (seccionId) => restService.get(`/secciones-dinamicas/${seccionId}/calendar-config`),

  // Actualizar configuración específica de calendario
  updateCalendarConfig: (seccionId, calendarId, calendarConfig) => restService.put(`/secciones-dinamicas/${seccionId}/calendar-config/${calendarId}`, calendarConfig),

  // Eliminar configuración de calendario
  deleteCalendarConfig: (seccionId, calendarId) => restService.delete(`/secciones-dinamicas/${seccionId}/calendar-config/${calendarId}`),

  // Obtener datos del calendario
  getCalendarData: (seccionId, params = {}) => restService.get(`/secciones-dinamicas/${seccionId}/citas`, params)
} 

// Lookup de plataforma por correo
export const plataformaLookup = (email) => restService.post('/usuarios/plataforma-lookup', { email }); 