async function sendData() {
  const commandInput = document.getElementById('commandInput');
  const command = commandInput.value; // Obtenha o comando do campo de entrada

  if (port && port.writable) {
    writer = port.writable.getWriter();
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(command); // Recebe o comando do input
    await writer.write(data);
    writer.releaseLock();
  }
}

document.getElementById('sendDataButton').addEventListener('click', sendData);
