export async function listPorts() {
  try {
    // Remove o listener anterior, se existir
    window.electron.onSerialPorts((ports) => {
      // Filtra as portas para manter apenas as do Arduino
      const filteredPorts = ports.filter((port) => {
        return (
          port.vendorId === '2341' && // Vendor ID do Arduino
          (port.productId === '0043' || port.productId === '0001') // Product IDs do Arduino
        );
      });

      console.log("Portas Arduino:")
      console.log(filteredPorts)
      return filteredPorts;
    })

    // Solicita as portas seriais
    window.electron.requestSerialPorts()
  } catch (error) {
    console.error('Error listing ports:', error);
    return [];
  }
}

export async function connectPort(selectedPort) {
  try {
    const success = await window.electron.connectPort(selectedPort);
    console.log('Conexão com a porta:', success ? 'sucesso' : 'falha');
    return success;
  } catch (error) {
    console.error('Error connecting to port:', error);
    return false;
  }
}

export function closePort() {
  try {
    window.electron.closePort();
    console.log('Porta fechada');
  } catch (error) {
    console.error('Error closing port:', error);
  }
}