const { app, BrowserWindow } = require("electron");
const path = require("path");


function createWindow() {
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
  });

  //Inciar com o dev tools aberto
  mainWindow.webContents.openDevTools()

  mainWindow.webContents.session.on(
    "select-serial-port",
    (event, portList, webContents, callback) => {
      // Add listeners to handle ports being added or removed before the callback for `select-serial-port`
      // is called.
      mainWindow.webContents.session.on("serial-port-added", (event, port) => {
        console.log("serial-port-added FIRED WITH", port);
        // Optionally update portList to add the new port
      });

      mainWindow.webContents.session.on(
        "serial-port-removed",
        (event, port) => {
          console.log("serial-port-removed FIRED WITH", port);
          // Optionally update portList to remove the port
        }
      );

      event.preventDefault();
      if (portList && portList.length > 0) {
        callback(portList[0].portId);
      } else {
        // eslint-disable-next-line n/no-callback-literal
        callback(""); // Could not find any matching devices
      }
    }
  );

  mainWindow.webContents.session.setPermissionCheckHandler(
    (webContents, permission, requestingOrigin, details) => {
      if (permission === "serial" && details.securityOrigin === "file:///") {
        return true;
      }

      return false;
    }
  );

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === "serial" && details.origin === "file://") {
      return true;
    }

    return false;
  });

  mainWindow.maximize();
  mainWindow.show();
  mainWindow.loadFile("public/index.html");

  /* mainWindow.webContents.openDevTools(); */ //devtools.open
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
