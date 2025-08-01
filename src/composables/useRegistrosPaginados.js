import { ref } from 'vue'
import { seccionesDinamicasService } from '@/services/api/queries'

// Composable para manejar la paginación
export const useRegistrosPaginados = () => {
  const registros = ref([])
  const pagination = ref({})
  const filters = ref({})
  const loading = ref(false)

  const cargarRegistros = async (seccionId, params = {}) => {
    loading.value = true
    try {
      // Construir objeto de parámetros para enviar al backend
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }

      // Agregar filtros si existen
      if (params.filters && Object.keys(params.filters).length > 0) {
        queryParams.filters = params.filters
      }

      console.log('🔍 Enviando petición con parámetros:', {
        seccionId,
        queryParams
      })
      
      // Ejemplo de la petición HTTP que se enviará:
      // GET /secciones-dinamicas/64f1a2b3c4d5e6f7g8h9i0j/registros-paginados?page=1&limit=10&sortBy=createdAt&sortOrder=desc&filters[nombre]=Alex&filters[email]=alex@

      const response = await seccionesDinamicasService.getRegistrosPaginados(seccionId, queryParams)
      
      console.log('✅ Respuesta recibida:', response)
      
      registros.value = response.data
      pagination.value = response.pagination
      filters.value = response.filters
    } catch (error) {
      console.error('❌ Error cargando registros:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    registros,
    pagination,
    filters,
    loading,
    cargarRegistros
  }
} 