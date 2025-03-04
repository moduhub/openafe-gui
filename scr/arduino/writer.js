  /**
   * The function `sendData` sends a command to a writable port and starts reading the response.
   * @param commandInput - The `commandInput` parameter is the input command that you want to send. It
   * is a string that represents the command you want to send to the port.
   */
  async function sendData(commandInput) {
    const command = commandInput;

    // Comando enviado para o arduino
    console.log("Comando enviado final:"+command);

    if (port && port.writable) {
      writer = port.writable.getWriter();
      const textEncoder = new TextEncoder();
      const data = textEncoder.encode(command); // Recebe o comando do input
      await writer.write(data);
      writer.releaseLock();

      await startReading()
    }
  }
