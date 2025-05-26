const { app, BrowserWindow, ipcMain } = require('electron')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const path = require('path')

let mainWindow
//let settingsWindow
let port

let isDev = false

/**
 * Initializes and configures the serial port communication with the Arduino
 * 
 * @param {String} selectedPort - The path of the serial port selected by the user (e.g., 'COM3')
 */
async function setupSerialPort(selectedPort) {
  try {
    if (port) port.close()
    port = new SerialPort({ path: selectedPort, baudRate: 9600 })
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))
    parser.on('data', (data) => { if (mainWindow) mainWindow.webContents.send('arduino-data', data)})
    port.on('open', () => { 
      console.log('Porta serial aberta com sucesso!')
      if (mainWindow) mainWindow.webContents.send('serial-port-opened', 'Porta serial aberta com sucesso!')
      port.write('$RESET\n', (err) => {
        if (err) console.error('Erro ao enviar comando de reinicializacao para o Arduino:', err)
        else console.log('Comando de reinicializacao enviado para o Arduino')
      })
    })
    port.on('error', (err) => { 
      if (mainWindow) mainWindow.webContents.send('serial-port-opened', 'not-connected:'+err)
      console.error('Erro na porta serial:', err)
    })
  } catch (err) {
    if (mainWindow) mainWindow.webContents.send('serial-port-opened', 'Erro ao abrir a porta serial:')
    console.error('Erro ao abrir a porta serial:', err)
  }
}

/**
 * Creates and configures the main application window
 * 
 * - Loads the frontend application (usually a local development server or production build)
 * - Ensures the serial port is closed when the window is closed
 * - Injects a Content Security Policy (CSP) meta tag after the page has finished loading
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
      preload: path.join(__dirname, "./preload.js"),
    },
    icon: "modhub_azulPNG.ico",
    autoHideMenuBar: !isDev
  })

  mainWindow.loadURL('http://localhost:3000/')
  isDev ? mainWindow.webContents.openDevTools() : null
  mainWindow.maximize()

  mainWindow.on('closed', () => {
    mainWindow = null
    if (port) 
      port.close((err) => {
        if (err)
          console.error('Erro ao fechar a porta serial:', err)
        else
          console.log('Porta serial fechada com sucesso!')
      })
  })

  // Set Content Security Policy
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const meta = document.createElement('meta')
      meta.httpEquiv = 'Content-Security-Policy'
      meta.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self';"
      document.getElementsByTagName('head')[0].appendChild(meta)
    `)
  })
}

/**
 * Executes initialization logic once the Electron app is ready.
 *  
 */
app.whenReady().then(() => {
  app.commandLine.appendSwitch('disable-features', 'Autofill')
  createWindow()
})

/**
 * Quits the application when all windows are closed
 * 
 * - On platforms other than macOS (Darwin), the app quits entirely
 * - On macOS, the app remains active until the user quits explicitly (standard macOS behavior)
 */
app.on('window-all-closed', () => { 
  if (process.platform !== 'darwin') app.quit() 
})

/**
 * Handles request from renderer to retrieve a list of available serial ports
 */
ipcMain.handle('get-available-ports', async () => {
  console.log("Portas requeridas")
  const ports = await SerialPort.list()
  return ports
})

/**
 * Handles request to connect to a selected serial port
 * 
 * @param {String} selectedPort - The path of the serial port to connect to
 */
ipcMain.on('connect-to-port', (event, selectedPort) => {
  try{
    setupSerialPort(selectedPort)
    
  }catch(erro){
    console.log("Não foi possíve conectar: "+erro)
  }
  
})

/**
 * Handles request to disconnect the currently open serial port
 */
ipcMain.on('disconnect-port', () => {
  if (port) {
    port.close((err) => {
      if (err) {
        console.error('Erro ao desconectar da porta serial:', err)
      } else {
        console.log('Desconectado da porta serial com sucesso!')
        if (mainWindow) mainWindow.webContents.send('serial-port-disconnected', 'Desconectado da porta serial com sucesso!')
      }
    })
  }
})

/**
 * Handles request to send a command string to the Arduino via the serial port
 * 
 * @param {String} arg - The command string to send to the Arduino
 */
ipcMain.on('send-command', (event, arg) => {
  if (port) 
    port.write(arg + '\n', (err) => {
      if (err) console.error('Erro ao enviar comando para o Arduino:', err)
      else console.log('Comando enviado para o Arduino:', arg)
    })
})