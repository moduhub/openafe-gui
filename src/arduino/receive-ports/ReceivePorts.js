export const ReceivePorts = async (setPorts) => {
  try {
    const portsData = await new Promise((resolve, reject) => {
      try {
        window.electron.getAvailablePorts((ports) => {
          const filteredPorts = ports.filter((port) => {
            return (
              port.vendorId === '2341' && 
              (port.productId === '0043' || port.productId === '0001') 
            );
          });
          resolve(filteredPorts);
        });
      } catch (error) {
        console.error("Erro ao listar portas:", error);
        reject(error);
      }
    });

    setPorts(Array.isArray(portsData) ? portsData : []);
  } catch (error) {
    console.log("Não foi possível receber as portas:", error);
  }
  
};
