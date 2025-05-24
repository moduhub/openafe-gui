const { contextBridge, ipcRenderer } = require('electron')

/**
 * Exposes a secure API to the renderer process via `window.electron` using Electron's contextBridge
 * 
 * Provides the following functions:
 * 
 * - `sendCommand(command)`: Sends a command string to the Arduino
 * - `connectToPort(port)`: Requests to connect to a specified serial port
 * - `disconnectPort()`: Requests to disconnect the currently connected serial port
 * - `getAvailablePorts(callback)`: Invokes a call to get the list of available serial ports and passes the result to the provided callback
 * - `onArduinoData(callback)`: Registers a listener to receive incoming data from the Arduino
 * - `onSerialPortOpened(callback)`: Registers a listener for serial port connection status messages
 * - `onSerialPortDisconnected(callback)`: Registers a listener for serial port disconnection messages
 * - `openSettingsWindow(datasets)`: Sends a request to open the settings window with the provided datasets
 * - `onSettingsData(callback)`: Registers a listener to receive settings data from the main process
 * 
 * This layer ensures the renderer process has controlled, secure access to privileged operations
 */
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
})