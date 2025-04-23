const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  sendCommand: (command) => 
    ipcRenderer.send('send-command', command),
  connectToPort: (port) => 
    ipcRenderer.send('connect-to-port', port),
  disconnectPort: () => 
    ipcRenderer.send('disconnect-port'),
  getAvailablePorts: (callback) => 
    ipcRenderer.invoke('get-available-ports').then(callback),
  onArduinoData: (callback) => 
    ipcRenderer.on('arduino-data', (event, data) => callback(data)),
  onSerialPortOpened: (callback) => 
    ipcRenderer.on('serial-port-opened', (event, message) => callback(message)),
  onSerialPortDisconnected: (callback) => 
    ipcRenderer.on('serial-port-disconnected', (event, message) => callback(message)),
  openSettingsWindow: (datasets) => 
    ipcRenderer.send('open-settings-window', datasets),
  onSettingsData: (callback) =>
    ipcRenderer.on('settings-data', (event, data) => callback(data)),
})