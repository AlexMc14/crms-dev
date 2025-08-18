// src/services/googleDriveService.js

import { gapi } from "gapi-script";

// CLIENT_ID actualizado después de configurar OAuth correctamente
const CLIENT_ID = "478457945260-8bdlt0vbb8ugvhkj8go05e59cu7evnqj.apps.googleusercontent.com";
const API_KEY = "AIzaSyBbNnycTLwGFPsIf38JuYl7-x80lRFElcE";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

let isInitialized = false;

// Inicializa el cliente de Google API
export const initClient = () => {
  if (isInitialized) {
    return Promise.resolve(gapi.auth2.getAuthInstance());
  }

  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
          scope: SCOPES,
          ux_mode: 'redirect',
          redirect_uri: window.location.origin
        })
        .then(() => {
          isInitialized = true;
          const authInstance = gapi.auth2.getAuthInstance();
          resolve(authInstance);
        })
        .catch((error) => {
          console.error('Error inicializando Google API:', error);
          reject(error);
        });
    });
  });
};

// Inicializar solo con API Key (sin OAuth)
export const initClientAPIKeyOnly = () => {
  if (isInitialized) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      gapi.load("client", () => {
        gapi.client
          .init({
            apiKey: API_KEY,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
            ],
          })
          .then(() => {
            isInitialized = true;
            resolve();
          })
          .catch(reject);
      });
    } catch (error) {
      reject(new Error('No se pudo inicializar Google API: ' + error.message));
    }
  });
};

// Verificar si el usuario está autenticado
export const isSignedIn = async () => {
  try {
    const authInstance = await initClient();
    return authInstance.isSignedIn.get();
  } catch (error) {
    console.warn('OAuth no disponible, usando API Key solo:', error);
    return false;
  }
};

// Iniciar sesión
export const signIn = async () => {
  try {
    const authInstance = await initClient();
    if (!authInstance.isSignedIn.get()) {
      const result = await authInstance.signIn({
        prompt: 'select_account',
        ux_mode: 'redirect'
      });
      return result;
    }
    return authInstance.currentUser.get();
  } catch (error) {
    console.error('Error en OAuth:', error);
    
    // Manejar errores específicos
    if (error.error === 'server_error') {
      throw new Error('Error del servidor de Google. Intenta de nuevo en unos minutos.');
    } else if (error.error === 'access_denied') {
      throw new Error('Acceso denegado. Verifica que tu email esté autorizado.');
    } else if (error.error === 'popup_closed_by_user') {
      throw new Error('Ventana de autenticación cerrada.');
    } else if (error.error === 'popup_blocked_by_browser') {
      throw new Error('El navegador bloqueó la ventana emergente. Permite popups para este sitio.');
    }
    
    throw error;
  }
};

// Función alternativa que usa redirección directa
export const signInWithRedirect = () => {
  const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `response_type=token&` +
    `prompt=select_account`;
  
  window.location.href = authUrl;
};

// Cerrar sesión
export const signOut = async () => {
  try {
    const authInstance = await initClient();
    return authInstance.signOut();
  } catch (error) {
    console.warn('Error cerrando sesión:', error);
  }
};

// Crear carpeta para un caso
export const createCaseFolder = async (caseId, caseName) => {
  await signIn();
  
  const folderMetadata = {
    name: `Caso-${caseId}-${caseName}`,
    mimeType: 'application/vnd.google-apps.folder',
    parents: ['root'] // Puedes cambiar esto para organizar en subcarpetas
  };

  try {
    const response = await gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id,name,webViewLink'
    });
    
    return response.result;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Subir un archivo a Google Drive
export const uploadFile = async (file, metadata = {}) => {
  await signIn();
  
  const fileMetadata = {
    name: file.name,
    mimeType: file.type,
    ...metadata
  };

  // Si se especifica una carpeta, agregarla como parent
  if (metadata.folderId) {
    fileMetadata.parents = [metadata.folderId];
  }

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
  );
  form.append("file", file);

  try {
    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: new Headers({
          Authorization: "Bearer " + gapi.auth.getToken().access_token,
        }),
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Agregar metadata adicional al resultado
    return {
      ...result,
      uploadedBy: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail(),
      uploadedAt: new Date().toISOString(),
      caseId: metadata.caseId
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Obtener archivos de una carpeta específica
export const getFolderFiles = async (folderId) => {
  await signIn();
  
  try {
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,size,createdTime,modifiedTime,webViewLink,mimeType)',
      orderBy: 'createdTime desc'
    });
    
    return response.result.files;
  } catch (error) {
    console.error('Error getting folder files:', error);
    throw error;
  }
};

// Buscar archivos por nombre de caso
export const searchCaseFiles = async (caseId) => {
  await signIn();
  
  try {
    const response = await gapi.client.drive.files.list({
      q: `name contains 'Caso-${caseId}' and trashed=false`,
      fields: 'files(id,name,size,createdTime,modifiedTime,webViewLink,mimeType)',
      orderBy: 'createdTime desc'
    });
    
    return response.result.files;
  } catch (error) {
    console.error('Error searching case files:', error);
    throw error;
  }
};

// Descargar un archivo desde Google Drive
export const downloadFile = async (fileId) => {
  await signIn();
  
  try {
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: "media",
    });
    
    return response.body;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Eliminar un archivo
export const deleteFile = async (fileId) => {
  await signIn();
  
  try {
    await gapi.client.drive.files.delete({
      fileId: fileId
    });
    
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Obtener información del usuario actual
export const getCurrentUser = async () => {
  const authInstance = await initClient();
  if (authInstance.isSignedIn.get()) {
    const profile = authInstance.currentUser.get().getBasicProfile();
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl()
    };
  }
  return null;
};
