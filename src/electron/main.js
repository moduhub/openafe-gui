const { app, BrowserWindow, ipcMain } = require("electron")
const path = require('path')
const { SerialPort } = require('serialport')

function createWindow() {
  const mainWindow = new BrowserWindow({
    show: false,
    titleBarStyle: "customButtonsOnHover",
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      preload: path.join(__dirname, "./preload.js"),
    },
    icon: "modhub_azulPNG.ico",
    autoHideMenuBar: false
  })

  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools()
  mainWindow.maximize()

  // Envia as portas seriais para o React
  ipcMain.on('request-serial-ports', async (event) => {
    try {
      const ports = await SerialPort.list()
      console.log('Serial ports found:', ports)
      event.reply('serial-ports', ports)
    } catch (err) {
      console.error('Error listing serial ports', err)
    }
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on("active", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform != "darwin") app.quit()
})