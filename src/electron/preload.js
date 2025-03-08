const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  requestSerialPorts: () => {
    //console.log('Requesting serial ports')
    ipcRenderer.send('request-serial-ports')
  },
  onSerialPorts: (callback) => {
    ipcRenderer.removeAllListeners('serial-ports') // Remove todos os listeners anteriores
    ipcRenderer.on('serial-ports', (event, ports) => {
      //console.log('Received serial-ports event:', ports)
      callback(ports)
    })
  }
})