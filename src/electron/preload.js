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
 * - `setAutoConnect(enabled)`: Enables or disables the auto-connect feature
 * - `onAutoConnectEvent(callback)`: Registers a listener for auto-connect events (when Arduino is auto-detected)
 * - `onAutoConnectStatus(callback)`: Registers a listener for auto-connect status changes
 * - `onPortConnected(callback)`: Registers a listener for when a port is successfully connected
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
  onArduinoData: (callback) => {
    if (typeof callback !== 'function') return () => {}
    const listener = (event, data) => callback(data)
    ipcRenderer.on('arduino-data', listener)
    return () => ipcRenderer.removeListener('arduino-data', listener)
  },
  onSerialPortOpened: (callback) => {
    if (typeof callback !== 'function') return () => {}
    const listener = (event, message) => callback(message)
    ipcRenderer.on('serial-port-opened', listener)
    return () => ipcRenderer.removeListener('serial-port-opened', listener)
  },
  onSerialPortDisconnected: (callback) => {
    if (typeof callback !== 'function') return () => {}
    const listener = (event, message) => callback(message)
    ipcRenderer.on('serial-port-disconnected', listener)
    return () => ipcRenderer.removeListener('serial-port-disconnected', listener)
  },
  setAutoConnect: (enabled) =>
    ipcRenderer.send('set-auto-connect', enabled),
  onAutoConnectEvent: (callback) => {
    if (typeof callback !== 'function') return () => {}
    const listener = (event, data) => callback(data)
    ipcRenderer.on('auto-connect-event', listener)
    return () => ipcRenderer.removeListener('auto-connect-event', listener)
  },
  onAutoConnectStatus: (callback) => {
    if (typeof callback !== 'function') return () => {}
    const listener = (event, enabled) => callback(enabled)
    ipcRenderer.on('auto-connect-status', listener)
    return () => ipcRenderer.removeListener('auto-connect-status', listener)
  },
  onPortConnected: (callback) => {
    if (typeof callback !== 'function') return () => {}
    const listener = (event, port) => callback(port)
    ipcRenderer.on('port-connected', listener)
    return () => ipcRenderer.removeListener('port-connected', listener)
  },
})