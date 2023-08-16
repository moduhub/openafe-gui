const { request } = require('express')
const { SerialPort } = require('serialport')

const port = async (request, response) => {
    await SerialPort.list().then((ports, err) => {
      if(err) {
        document.getElementById('error').textContent = err.message
        return
      } else {
        document.getElementById('error').textContent = ''
      }
      console.log('ports', ports);
  
      if (ports.length === 0) {
        document.getElementById('error').textContent = 'No ports discovered'
      }
  
      tableHTML = tableify(ports)
      document.getElementById('ports').innerHTML = tableHTML
    })
  }
  
  function listPorts() {
    listSerialPorts();
    setTimeout(listPorts, 2000);
  }
  
  // Set a timeout that will check for new serialPorts every 2 seconds.
  // This timeout reschedules itself.
  setTimeout(listPorts, 2000);
  
  listSerialPorts()