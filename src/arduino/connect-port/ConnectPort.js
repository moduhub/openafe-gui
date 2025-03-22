export const ConnectPort = (port, setPortSelected) => {
  setPortSelected(port)
  window.electron.connectToPort(port)
};