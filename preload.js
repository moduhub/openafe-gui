const { contextBridge } = require("electron");

// Exemplo de CSP personalizada para permitir scripts externos
const csp = `
  default-src 'self' https://cdnjs.cloudflare.com;
  script-src 'self' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
`;

// Define a CSP personalizada para a janela atual
contextBridge.exposeInMainWorld("setCSP", (webContentsId) => {
  const webContents = require("electron").webContents.fromId(webContentsId);
  webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["Content-Security-Policy"] = csp;
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
});
