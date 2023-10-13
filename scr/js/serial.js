let port;

const portSelector = document.getElementById('portSelector')
const connectButton = document.getElementById('connectButton')
const listPortsButton = document.getElementById('listPortsButton')
const closePortButton = document.getElementById('closePortButton')

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
    
    while (portSelector.firstChild) {
      portSelector.removeChild(portSelector.firstChild);
    }
    
    if (filteredPorts.length === 0) {
      portSelector.innerHTML = '<option value="">No ports available</option>';
    } else {
      filteredPorts.forEach((port, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `Arduino: ${port.getInfo().usbVendorId} | ${port.getInfo().usbProductId}`;
        portSelector.appendChild(option);
      });
    }
    
  } catch (error) {
    console.error('Error listing ports:', error);
  }
}

listPorts();

const connectPort = async () => {
  const portSelector = document.getElementById('portSelector');
  const selectedIndex = portSelector.selectedIndex;

  if (selectedIndex != "Selecione uma porta:") {
    const selectedPort = portSelector.options[selectedIndex].text;
    console.log('Connect to port:', selectedPort);
    
    try {
      port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x2341 }] });
      await port.open({ baudRate: 9600 });
      alert('Connected device')
        disabledButton(connectButton);   
        disabledButton(listPortsButton);
        disabledButton(portSelector);
          
    } catch (error) {
      console.log(error.message);
      alert('Error connecting to device')
    }
  } else {
    alert('Selecione uma porta antes de conectar.');
  }
};


const closePort = function () {
  port.close();
  alert('Disconnect device')
  enabledButton(connectButton);   
  enabledButton(listPortsButton);
  enabledButton(portSelector);
}

const disabledButton = function (buttonDisabled) {
  buttonDisabled.setAttribute('fill', 'gray');
  buttonDisabled.style.opacity = 0.5;
  buttonDisabled.disabled = true;
}

const enabledButton = function (buttonEnabled) {
  buttonEnabled.setAttribute('fill', 'none');
  buttonEnabled.style.opacity = 1;
  buttonEnabled.disabled = false;
}

document.getElementById('listPortsButton').addEventListener('click', listPorts);
document.getElementById('connectButton').addEventListener('click', connectPort);
document.getElementById('closePortButton').addEventListener('click', closePort);

