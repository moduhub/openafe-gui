const { app, BrowserWindow, ipcMain } = require('electron');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const path = require('path');

let mainWindow;
let port;

async function setupSerialPort(selectedPort) {
  try {
    if (port) port.close();
    port = new SerialPort({ path: selectedPort, baudRate: 9600 });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
    parser.on('data', (data) => { if (mainWindow) mainWindow.webContents.send('arduino-data', data)});
    port.on('open', () => { 
      console.log('Porta serial aberta com sucesso!');
      if (mainWindow) mainWindow.webContents.send('serial-port-opened', 'Porta serial aberta com sucesso!');
      // Envia comando de reinicialização para o Arduino
      port.write('$RESET\n', (err) => {
        if (err) console.error('Erro ao enviar comando de reinicializacao para o Arduino:', err);
        else console.log('Comando de reinicializacao enviado para o Arduino');
      });
    });
    port.on('error', (err) => { 
      if (mainWindow) mainWindow.webContents.send('serial-port-opened', 'not-connected:'+err);
      console.error('Erro na porta serial:', err)
    });
  } catch (err) {
    if (mainWindow) mainWindow.webContents.send('serial-port-opened', 'Erro ao abrir a porta serial:');
    console.error('Erro ao abrir a porta serial:', err);
  }
}

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
    autoHideMenuBar: true
  });

  mainWindow.loadURL('http://localhost:3000');
  //mainWindow.webContents.openDevTools();
  mainWindow.maximize();

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (port) 
      port.close((err) => {
        if (err)
          console.error('Erro ao fechar a porta serial:', err);
        else
          console.log('Porta serial fechada com sucesso!');
      });
  });

  // Set Content Security Policy
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';";
      document.getElementsByTagName('head')[0].appendChild(meta);
    `);
  });
}

app.whenReady().then(() => {
  app.commandLine.appendSwitch('disable-features', 'Autofill');
  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('get-available-ports', async () => {
  console.log("Portas requeridas")
  const ports = await SerialPort.list();
  return ports;
});

ipcMain.on('connect-to-port', (event, selectedPort) => {
  try{
    setupSerialPort(selectedPort)
    
  }catch(erro){
    console.log("Não foi possíve conectar: "+erro)
  }
  
});

ipcMain.on('disconnect-port', () => {
  if (port) {
    port.close((err) => {
      if (err) {
        console.error('Erro ao desconectar da porta serial:', err);
      } else {
        console.log('Desconectado da porta serial com sucesso!');
        if (mainWindow) mainWindow.webContents.send('serial-port-disconnected', 'Desconectado da porta serial com sucesso!');
      }
    });
  }
});

ipcMain.on('send-command', (event, arg) => {
  if (port) 
    port.write(arg + '\n', (err) => {
      if (err) console.error('Erro ao enviar comando para o Arduino:', err);
      else console.log('Comando enviado para o Arduino:', arg);
    });
});