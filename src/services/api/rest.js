import api from './index'

class RestService {
  /**
   * GET request
   * @param {string} url - Endpoint URL
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async get(url, params = {}) {
    try {
      const response = await api.get(url, { params })
      return response.data
    } catch (error) {
      console.error('GET Request Error:', error)
      throw error
    }
  }

  /**
   * POST request
   * @param {string} url - Endpoint URL
   * @param {Object} data - Request body
   * @returns {Promise}
   */
  async post(url, data = {}) {
    try {
      const response = await api.post(url, data)
      return response.data
    } catch (error) {
      console.error('POST Request Error:', error)
      throw error
    }
  }

  /**
   * PUT request
   * @param {string} url - Endpoint URL
   * @param {Object} data - Request body
   * @returns {Promise}
   */
  async put(url, data = {}) {
    try {
      const response = await api.put(url, data)
      return response.data
    } catch (error) {
      console.error('PUT Request Error:', error)
      throw error
    }
  }

  /**
   * PATCH request
   * @param {string} url - Endpoint URL
   * @param {Object} data - Request body
   * @returns {Promise}
   */
  async patch(url, data = {}) {
    try {
      const response = await api.patch(url, data)
      return response.data
    } catch (error) {
      console.error('PATCH Request Error:', error)
      throw error
    }
  }

  /**
   * DELETE request
   * @param {string} url - Endpoint URL
   * @returns {Promise}
   */
  async delete(url) {
    try {
      const response = await api.delete(url)
      return response.data
    } catch (error) {
      console.error('DELETE Request Error:', error)
      throw error
    }
  }

  /**
   * Upload file
   * @param {string} url - Endpoint URL
   * @param {FormData} formData - FormData con el archivo
   * @returns {Promise}
   */
  async upload(url, formData) {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Upload Error:', error)
      throw error
    }
  }
}

export default new RestService() 