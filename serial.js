let port;
let writer;

async function listPorts() {
  try {
    const ports = await navigator.serial.getPorts();

    // Portas compatíveis com o Arduino
    const filteredPorts = ports.filter((port) => {
      return (
        port.getInfo().usbVendorId === 0x2341 &&
        (port.getInfo().usbProductId === 0x0043 || port.getInfo().usbProductId === 0x0001)
      );
    });

    const portSelector = document.getElementById('portSelector');

    if (filteredPorts.length === 0) {
      portSelector.innerHTML = '<option value="">Nenhuma porta disponível.</option>';
    } else {
      portSelector.innerHTML = '<option value="">Selecione uma porta:</option>';
      filteredPorts.forEach((port, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `Arduino: ${port.getInfo().usbVendorId} | ${port.getInfo().usbProductId}`;
        portSelector.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Erro ao listar as portas:', error);
  }
}

const connectPort = async () => {
  const portSelector = document.getElementById('portSelector');
  const selectedIndex = portSelector.selectedIndex;

  if (selectedIndex != "Selecione uma porta:") {
    const selectedPort = portSelector.options[selectedIndex].text;
    console.log('Conectar à porta:', selectedPort);

    try {
      port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x2341 }] });
      await port.open({ baudRate: 9600 });

      
    } catch (error) {
      console.log(error.message);
    }
  } else {
    alert('Selecione uma porta antes de conectar.');
  }
};

document.getElementById('listPortsButton').addEventListener('click', listPorts);
document.getElementById('connectButton').addEventListener('click', connectPort);
