const { ipcRenderer } = require('electron');

function showNotification(title, body) {
  // Envia uma mensagem IPC para solicitar a notificação
  ipcRenderer.send('show-notification', { title, body });
}

showNotification("Título da Notificação", "Corpo da notificação");
