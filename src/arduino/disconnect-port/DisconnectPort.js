export const DisconnectPort = (setPortSelected, setIsConnected) => {

  console.log("Requisição de desconectar feita")

  setPortSelected("");
  setIsConnected(false);

  window.electron.disconnectPort();
  
};