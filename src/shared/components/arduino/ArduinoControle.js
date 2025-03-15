export function listarPortas() {
  return new Promise((resolve, reject) => {
    try {
      window.electron.getAvailablePorts((ports) => {
        const filteredPorts = ports.filter((port) => {
          return (
            port.vendorId === '2341' && // Vendor ID do Arduino
            (port.productId === '0043' || port.productId === '0001') // Product IDs do Arduino
          );
        });
        console.log("Portas filtradas: ")
        console.log(filteredPorts);
        resolve(filteredPorts);
      });
    } catch (error) {
      console.error('Error listing ports:', error);
      reject(error);
    }
  });
}

export const iniciarLeitura = (type,settlingTime, startPotential,endPotential,step,scanRate,cycles) => {
  //window.electron.sendCommand('$CVW,1000,-800,0,100,2,1*54'); DEFAULT
  window.electron.sendCommand(type+','+settlingTime+','+startPotential+','+endPotential+','+step+','+scanRate+','+cycles+'*54');
};

export const finalizarLeitura = () => {
  window.electron.sendCommand('$CMD,DIE*2E');
};

export const desconectarPorta = () => {
  window.electron.disconnectPort();
};

export const atualizarHooks = (setPortas, setArduinoData, setIsConnected, setPortaSelecionada) => {
  receberPortas(setPortas);

  window.electron.onArduinoData((data) => {
    setArduinoData(data);
    console.log(data);
  });

  window.electron.onSerialPortOpened((message) => {
    console.log(message);
    setIsConnected(true);
  });

  window.electron.onSerialPortDisconnected((message) => {
    console.log(message);
    setPortaSelecionada('');
    setIsConnected(false);
  });
};

export const receberPortas = async (setPortas) => {
  try {
    const portsData = await listarPortas();
    setPortas(Array.isArray(portsData) ? portsData : []);
  } catch (erro) {
    console.log("Não foi possível receber dados: " + erro);
  }
};

export const conectarPorta = (port, setPortaSelecionada) => {
  setPortaSelecionada(port);
  window.electron.connectToPort(port);
  console.log("Requisição de conectar feita")
};