// src/services/googleDriveService.js

import { gapi } from "gapi-script";

const CLIENT_ID = "1013862403625-lbl4bd0apijf0om6i2442aqkusli4pmj.apps.googleusercontent.com";
const API_KEY = "AIzaSyBbNnycTLwGFPsIf38JuYl7-x80lRFElcE";
const SCOPES = "https://www.googleapis.com/auth/drive.file"; // Permiso para leer y escribir archivos en Google Drive

// Inicializa el cliente de Google API
export const initClient = () => {
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
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          resolve(authInstance);
        })
        .catch(reject);
    });
  });
};

// Iniciar sesión
export const signIn = () => {
  return initClient().then((authInstance) => authInstance.signIn());
};

// Cerrar sesión
export const signOut = () => {
  return initClient().then((authInstance) => authInstance.signOut());
};

// Subir un archivo a Google Drive
export const uploadFile = (file) => {
  return signIn().then(() => {
    const metadata = {
      name: file.name,
      mimeType: file.type,
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    return fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: new Headers({
          Authorization: "Bearer " + gapi.auth.getToken().access_token,
        }),
        body: form,
      }
    ).then((res) => res.json());
  });
};

// Descargar un archivo desde Google Drive
export const downloadFile = (fileId) => {
  return signIn().then(() => {
    return gapi.client.drive.files
      .get({
        fileId: fileId,
        alt: "media",
      })
      .then((response) => response.body);
  });
};
