export const ConnectPort = (port, setPortSelected, setIsConnected) => {

  console.log("Requisição de conectar feita")

  setPortSelected(port)
  setIsConnected(true)

  window.electron.connectToPort(port)
  
};