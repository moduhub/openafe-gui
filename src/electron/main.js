const { app, BrowserWindow, ipcMain } = require('electron')
const { SerialPort } = require('serialport')
const path = require('path')

let mainWindow
let port

let isDev = false

let buffer = Buffer.alloc(0)

// Auto-connect configuration
let autoConnectEnabled = false
let portMonitorInterval = null
let lastKnownPorts = new Set()
const PORT_MONITOR_INTERVAL_MS = 1000 // Check ports every 1 second

// Arduino data queue
let arduinoQueue = []
let queueTimer = null
const SEND_INTERVAL_MS = 500
function enqueueArduinoData(msg){
  arduinoQueue.push(msg)
  if (!queueTimer) {
    queueTimer = setInterval(() => {
      if (!arduinoQueue.length) {
        clearInterval(queueTimer)
        queueTimer = null
        return
      }
      const item = arduinoQueue.shift()
      if (mainWindow) mainWindow.webContents.send('arduino-data', item)
    }, SEND_INTERVAL_MS)
  }
}


/**
 * Monitors available ports and automatically connects to Arduino when one appears
 * Only connects if autoConnectEnabled is true and no port is currently connected
 */
async function monitorArduinoPorts() {
  try {
    const ports = await SerialPort.list()
    const currentPorts = new Set()

    // Filter for Arduino ports (vendorId '2341')
    const arduinoPorts = ports.filter((port) => 
      port.vendorId === '2341' && 
      (port.productId === '0043' || port.productId === '0001')
    )

    for (const port of arduinoPorts) {
      currentPorts.add(port.path)
    }

    // Detect new ports
    const newPorts = Array.from(currentPorts).filter(p => !lastKnownPorts.has(p))

    if (newPorts.length > 0 && autoConnectEnabled && !port) {
      // Auto-connect to the first newly detected Arduino port
      const portToConnect = newPorts[0]
      console.log(`Auto-connecting to Arduino at ${portToConnect}`)
      setupSerialPort(portToConnect)
      if (mainWindow) {
        mainWindow.webContents.send('auto-connect-event', { 
          status: 'connecting', 
          port: portToConnect 
        })
      }
    }

    // Update the set of known ports
    lastKnownPorts = currentPorts
  } catch (error) {
    console.error('Error monitoring Arduino ports:', error)
  }
}

/**
 * Starts the port monitoring interval for auto-connect
 */
function startPortMonitoring() {
  if (!portMonitorInterval) {
    console.log('Starting Arduino port monitoring')
    monitorArduinoPorts() // Initial check
    portMonitorInterval = setInterval(monitorArduinoPorts, PORT_MONITOR_INTERVAL_MS)
  }
}

/**
 * Stops the port monitoring interval
 */
function stopPortMonitoring() {
  if (portMonitorInterval) {
    console.log('Stopping Arduino port monitoring')
    clearInterval(portMonitorInterval)
    portMonitorInterval = null
  }
}

/**
 * Initializes and configures the serial port communication with the Arduino
 * 
 * @param {String} selectedPort - The path of the serial port selected by the user (e.g., 'COM3')
 */
function setupSerialPort(selectedPort) {
  if (port) port.close()
  
  port = new SerialPort({ path: selectedPort, baudRate: 115200 })

  port.on('open', () => {
    if (mainWindow) {
      mainWindow.webContents.send('serial-port-opened', 'Serial port opened successfully!')
      mainWindow.webContents.send('port-connected', selectedPort)
    }
  })

  port.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk])

    let start, end
    while ((start = buffer.indexOf(0x24)) !== -1) { // '$' == 0x24
      end = buffer.indexOf(0x2A, start) // '*' == 0x2A
      if (end === -1) break 

      if (buffer.length < end + 3) {// includes '*XX'
        break
      }
      const possible = buffer.slice(start, end + 3)
      if (possible.length < 5) {
        buffer = buffer.slice(end + 1)
        continue
      }
      const payload = possible.toString('utf8')
      const data = payload.slice(1, -3) // remove '$' e '*XX'
      const checksumStr = payload.slice(-2) // XX
      const expected = parseInt(checksumStr, 16)

      // Calculate CRC
      let calc = 0
      for (let i = 1; i < payload.length - 3; i++) 
        calc ^= payload.charCodeAt(i)
      
      if (calc === expected) {
        enqueueArduinoData(data)
        console.log(data)
      }
      else console.warn('Invalid checksum:', payload, 'calc=', calc.toString(16))

      buffer = buffer.slice(end + 3)
    }
  })

  port.on('error', (err) => {
    if (mainWindow) mainWindow.webContents.send('serial-port-opened', 'not-connected:'+err)
    console.error('Serial error:', err)
  })
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
    if (queueTimer) {
      clearInterval(queueTimer)
      queueTimer = null
    }
    stopPortMonitoring()
    if (port) 
      port.close((err) => {
        if (err)
          console.error('Error closing the serial port:', err)
        else
          console.log('Serial port closed successfully!')
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
    console.error("Could not connect: "+erro)
  }
  
})

/**
 * Handles request to disconnect the currently open serial port
 */
ipcMain.on('disconnect-port', () => {
  if (port) {
    port.close((err) => {
      if (err) 
        console.error('Error disconnecting from the serial port:', err)
      else 
        if (mainWindow) mainWindow.webContents.send('serial-port-disconnected', 'Successfully disconnected from the serial port!')
    })
  }
})

/**
 * Handles request to enable/disable auto-connect feature
 * 
 * @param {Boolean} enabled - Whether to enable or disable auto-connect
 */
ipcMain.on('set-auto-connect', (event, enabled) => {
  autoConnectEnabled = enabled
  console.log(`Auto-connect ${enabled ? 'enabled' : 'disabled'}`)
  
  if (enabled) {
    startPortMonitoring()
  } else {
    stopPortMonitoring()
  }
  
  if (mainWindow) {
    mainWindow.webContents.send('auto-connect-status', enabled)
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
      if (err) console.error('Error sending command to the Arduino:', err)
      else console.log('Command sent to the Arduino:', arg)
    })
})