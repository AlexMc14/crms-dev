<template>
  <div class="file-upload-component">
    <!-- Estado de autenticación -->
    <div v-if="!isAuthenticated" class="auth-section">
      <div class="auth-message">
        <i class="ti-cloud"></i>
        <span>Conecta tu Google Drive para subir archivos</span>
      </div>
      <button class="btn-google-auth" @click="connectGoogleDrive">
        <i class="ti-google"></i>
        Conectar Google Drive
      </button>
      <button class="btn-google-auth-secondary" @click="useBasicMode">
        <i class="ti-upload"></i>
        Modo Básico (Sin OAuth)
      </button>
      <div class="auth-note">
        <small>
          <i class="ti-info"></i>
          Si tienes problemas con OAuth, puedes usar el modo básico temporalmente.
        </small>
      </div>
    </div>

    <!-- Upload de archivos -->
    <div v-else class="upload-section">
      <!-- Drag & Drop Zone -->
      <div 
        class="drop-zone"
        :class="{ 'dragover': isDragging, 'uploading': uploading }"
        @drop="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @click="triggerFileInput"
      >
        <div v-if="!uploading" class="drop-content">
          <i class="ti-cloud-upload"></i>
          <h4>Subir archivo a Google Drive</h4>
          <p>Arrastra archivos aquí o haz clic para seleccionar</p>
          <small>Máximo 10MB por archivo</small>
        </div>
        
        <!-- Progress bar -->
        <div v-if="uploading" class="upload-progress">
          <div class="progress-info">
            <span class="filename">{{ currentFile && currentFile.name }}</span>
            <span class="progress-text">{{ uploadProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- File input oculto -->
      <input
        ref="fileInput"
        type="file"
        multiple
        @change="handleFileSelect"
        style="display: none"
        accept="*/*"
      >

      <!-- Lista de archivos subidos -->
      <div v-if="uploadedFiles.length > 0" class="uploaded-files">
        <h5>Archivos subidos:</h5>
        <div class="file-list">
          <div 
            v-for="file in uploadedFiles" 
            :key="file.id" 
            class="file-item"
          >
            <div class="file-info">
              <i class="ti-file"></i>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <div class="file-actions">
              <button 
                class="btn-view" 
                @click="viewFile(file)"
                title="Ver en Google Drive"
              >
                <i class="ti-eye"></i>
              </button>
              <button 
                class="btn-download" 
                @click="downloadFile(file.id)"
                title="Descargar"
              >
                <i class="ti-download"></i>
              </button>
              <button 
                class="btn-delete" 
                @click="deleteFile(file.id)"
                title="Eliminar"
              >
                <i class="ti-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  initClient, 
  signIn, 
  isSignedIn, 
  uploadFile, 
  downloadFile, 
  deleteFile as deleteDriveFile,
  getCurrentUser,
  initClientAPIKeyOnly,
  signInWithRedirect
} from '@/services/googleDriveService'

export default {
  name: 'FileUpload',
  props: {
    caseId: {
      type: String,
      default: null
    },
    caseName: {
      type: String,
      default: ''
    },
    folderId: {
      type: String,
      default: null
    },
    value: {
      type: Array,
      default: () => []
    }
    },
  data() {
    return {
      isAuthenticated: false,
      uploading: false,
      uploadProgress: 0,
      currentFile: null,
      isDragging: false,
      uploadedFiles: []
    }
  },
  computed: {
    filesValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('update:value', value)
      }
    }
  },
  mounted() {
    this.initializeAuth()
  },
  methods: {
    // Inicializar autenticación
    async initializeAuth() {
      try {
        const signedIn = await isSignedIn()
        this.isAuthenticated = signedIn
        if (signedIn) {
          await this.loadUploadedFiles()
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    },

    // Conectar Google Drive
    async connectGoogleDrive() {
      try {
        await signIn()
        this.isAuthenticated = true
        await this.loadUploadedFiles()
      } catch (error) {
        console.error('Error connecting to Google Drive:', error)
        
        // Mostrar mensaje más amigable al usuario
        if (error.error === 'server_error') {
          alert('Error del servidor de Google. Intenta de nuevo en unos minutos.')
        } else if (error.error === 'popup_blocked_by_browser') {
          // Usar redirección directa como fallback
          if (confirm('El navegador bloqueó la ventana emergente. ¿Quieres usar redirección directa?')) {
            signInWithRedirect()
          }
        } else if (error.error === 'access_denied' || error.error === 'popup_closed_by_user') {
          alert('Error de acceso: La aplicación no está configurada correctamente en Google Cloud Console. Verifica que tu email esté agregado como usuario de prueba.')
        } else if (error.message && error.message.includes('403')) {
          alert('Error 403: Tu email no está autorizado. Verifica que tu email esté agregado como usuario de prueba en Google Cloud Console.')
        } else if (error.message && error.message.includes('server_error')) {
          alert('Error del servidor de Google. Intenta de nuevo en unos minutos.')
        } else {
          alert('Error al conectar con Google Drive: ' + (error.message || error.error || 'Error desconocido'))
        }
      }
    },

    // Usar modo básico sin OAuth
    async useBasicMode() {
      try {
        await initClientAPIKeyOnly()
        this.isAuthenticated = true
        alert('Modo básico activado. Algunas funciones pueden estar limitadas.')
      } catch (error) {
        console.error('Error en modo básico:', error)
        alert('Error activando modo básico: ' + error.message)
      }
    },

    // Cargar archivos ya subidos
    async loadUploadedFiles() {
      this.uploadedFiles = [...this.filesValue]
    },

    // Trigger file input
    triggerFileInput() {
      if (!this.uploading && this.$refs.fileInput) {
        this.$refs.fileInput.click()
      }
    },

    // Manejar selección de archivos
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      this.uploadFiles(files)
    },

    // Manejar drag & drop
    handleDrop(event) {
      this.isDragging = false
      const files = Array.from(event.dataTransfer.files)
      this.uploadFiles(files)
    },

    // Subir archivos
    async uploadFiles(files) {
      if (files.length === 0) return

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`)
          continue
        }

        await this.uploadSingleFile(file)
      }
    },

    // Subir un archivo individual
    async uploadSingleFile(file) {
      this.uploading = true
      this.currentFile = file
      this.uploadProgress = 0

      try {
        const metadata = {
          caseId: this.caseId,
          caseName: this.caseName,
          folderId: this.folderId
        }

        // Simular progreso
        const progressInterval = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += Math.random() * 10
          }
        }, 200)

        const result = await uploadFile(file, metadata)
        
        clearInterval(progressInterval)
        this.uploadProgress = 100

        // Agregar a la lista
        const uploadedFile = {
          id: result.id,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          webViewLink: result.webViewLink,
          uploadedAt: result.uploadedAt,
          uploadedBy: result.uploadedBy
        }

        this.uploadedFiles.push(uploadedFile)
        this.filesValue = [...this.uploadedFiles]
        
        this.$emit('files-uploaded', uploadedFile)
        this.$emit('archivos-actualizados', this.uploadedFiles)

        // Reset
        setTimeout(() => {
          this.uploading = false
          this.uploadProgress = 0
          this.currentFile = null
        }, 500)

      } catch (error) {
        console.error('Error uploading file:', error)
        this.uploading = false
        this.uploadProgress = 0
        this.currentFile = null
        alert(`Error al subir ${file.name}: ${error.message}`)
      }
    },

    // Ver archivo en Google Drive
    viewFile(file) {
      if (file.webViewLink) {
        window.open(file.webViewLink, '_blank')
      }
    },

    // Descargar archivo
    async downloadFile(fileId) {
      try {
        const blob = await downloadFile(fileId)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const file = this.uploadedFiles.find(f => f.id === fileId)
        link.download = file ? file.name : 'file'
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading file:', error)
        alert('Error al descargar el archivo')
      }
    },

    // Eliminar archivo
    async deleteFile(fileId) {
      if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return

      try {
        await deleteDriveFile(fileId)
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId)
        this.filesValue = [...this.uploadedFiles]
        this.$emit('archivos-actualizados', this.uploadedFiles)
      } catch (error) {
        console.error('Error deleting file:', error)
        alert('Error al eliminar el archivo')
      }
    },

    // Formatear tamaño de archivo
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.file-upload-component {
  width: 100%;
}

.auth-section {
  text-align: center;
  padding: 2rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.auth-message {
  margin-bottom: 1rem;
  color: #666;
}

.auth-note {
  margin-top: 1rem;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
}

.auth-note small {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
}

.auth-message i {
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 0.5rem;
  display: block;
}

.btn-google-auth {
  background: #4285f4;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-google-auth:hover {
  background: #3367d6;
}

.btn-google-auth-secondary {
  background: #34a853;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  width: 100%;
  justify-content: center;
}

.btn-google-auth-secondary:hover {
  background: #2d8a46;
  transform: translateY(-2px);
}

.upload-section {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9ff;
}

.drop-zone:hover {
  border-color: #0056b3;
  background: #f0f4ff;
}

.drop-zone.dragover {
  border-color: #28a745;
  background: #f0fff4;
  transform: scale(1.02);
}

.drop-zone.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.drop-content i {
  font-size: 3rem;
  color: #007bff;
  margin-bottom: 1rem;
}

.drop-content h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.drop-content p {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.drop-content small {
  color: #999;
}

.upload-progress {
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.filename {
  font-weight: 500;
  color: #333;
}

.progress-text {
  color: #007bff;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.uploaded-files {
  margin-top: 1.5rem;
}

.uploaded-files h5 {
  margin-bottom: 1rem;
  color: #333;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.file-info i {
  color: #007bff;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-size {
  color: #666;
  font-size: 0.875rem;
}

.file-actions {
  display: flex;
  gap: 0.25rem;
}

.file-actions button {
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-view:hover {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-download:hover {
  background: #e8f5e8;
  color: #388e3c;
}

.btn-delete:hover {
  background: #ffebee;
  color: #d32f2f;
}
</style> 