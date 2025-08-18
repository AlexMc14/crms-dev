import { seccionesDinamicasService } from '@/services/api/queries'

export function useArchivosSeccion() {
  
  // Guardar archivos de un registro en el backend
  const guardarArchivosRegistro = async (seccionId, registroId, archivos) => {
    try {
      const response = await seccionesDinamicasService.updateRegistroArchivos(
        seccionId, 
        registroId, 
        archivos
      )
      return response
    } catch (error) {
      console.error('Error guardando archivos:', error)
      throw error
    }
  }

  // Cargar archivos de un registro desde el backend
  const cargarArchivosRegistro = async (seccionId, registroId) => {
    try {
      const response = await seccionesDinamicasService.getRegistro(seccionId, registroId)
      // Los archivos estarían en response.valores[campoArchivo]
      return response
    } catch (error) {
      console.error('Error cargando archivos:', error)
      throw error
    }
  }

  // Sincronizar archivos cuando se suben/eliminan
  const sincronizarArchivos = async (seccionId, registroId, campoArchivo, archivos) => {
    try {
      // Actualizar el registro con los nuevos archivos
      const datosActualizados = {
        valores: {
          [campoArchivo]: archivos
        }
      }
      
      await seccionesDinamicasService.updateRegistro(seccionId, registroId, datosActualizados)
      console.log('✅ Archivos sincronizados con el backend')
    } catch (error) {
      console.error('❌ Error sincronizando archivos:', error)
      throw error
    }
  }

  // Obtener información de archivos para mostrar en la tabla
  const obtenerInfoArchivos = (archivos) => {
    if (!archivos || !Array.isArray(archivos)) return []
    
    return archivos.map(archivo => ({
      id: archivo.id,
      nombre: archivo.name,
      tamaño: archivo.size,
      tipo: archivo.mimeType,
      url: archivo.webViewLink,
      subidoPor: archivo.uploadedBy,
      fechaSubida: archivo.uploadedAt
    }))
  }

  // Formatear tamaño de archivo para mostrar
  const formatearTamañoArchivo = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    guardarArchivosRegistro,
    cargarArchivosRegistro,
    sincronizarArchivos,
    obtenerInfoArchivos,
    formatearTamañoArchivo
  }
} 