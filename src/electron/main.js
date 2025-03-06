const { app, BrowserWindow } = require("electron")
const path = require('path')

function createWindow(){

  const mainWindow = new BrowserWindow({
    show: false,
    titleBarStyle: "customButtonsOnHover",
    webPreferences: {
      // Configuração da CSP para permitir o carregamento de scripts externos
      // Certifique-se de que 'nodeIntegration' está definido como false
      contextIsolation: true, // Recomendado: habilite o isolamento de contexto
      sandbox: true, // Recomendado: habilite a área de trabalho segura
      webSecurity: true, // Recomendado: habilite (não recomendando desabilitar)
      preload: path.join(__dirname, "./preload.js"), // O caminho para seu arquivo de pré-carregamento, se você estiver usando um
    },
    icon: "modhub_azulPNG.ico",
    autoHideMenuBar: false
  })

  // Abre o React
  mainWindow.loadURL('http://localhost:3000')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  mainWindow.maximize()
}

app.whenReady().then(()=>{
  createWindow()

  app.on("active",()=>{
    if(BrowserWindow.getAllWindows().length===0) createWindow()
  })
})

app.on("window-all-closed",()=>{
  if(process.platform != "darwin") app.quit()
})