const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  win = new BrowserWindow({
    show: false,
    titleBarStyle: 'customButtonsOnHover'
  });

  win.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    // Add listeners to handle ports being added or removed before the callback for `select-serial-port`
    // is called.
    console.log('select-serial-port FIRED WITH', portList);
    win.webContents.session.on('serial-port-added', (event, port) => {
      console.log('serial-port-added FIRED WITH', port)
      // Optionally update portList to add the new port
    })

    win.webContents.session.on('serial-port-removed', (event, port) => {
      console.log('serial-port-removed FIRED WITH', port)
      // Optionally update portList to remove the port
    })

    event.preventDefault()
    if (portList && portList.length > 0) {
      callback(portList[0].portId)
    } else {
      // eslint-disable-next-line n/no-callback-literal
      callback('') // Could not find any matching devices
    }
  })

  win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    //if (permission === 'serial' && details.securityOrigin === 'file:///') { //this is more conservative
    if (permission === 'serial') {
      return true
    }
    return false
  })

  win.webContents.session.setDevicePermissionHandler((details) => {
    //if (details.deviceType === 'serial' && details.origin === 'file://') { //this is more conservative
    if (details.deviceType === 'serial') {
      return true
    }
    return false
  })

  win.maximize();
  win.show();
  win.loadURL('http://localhost:3000')
}

 


app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})