
  const cvForm = document.getElementById("cvForm");

  cvForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    var setTime = document.getElementById("setTime");
    var startP = document.getElementById("startP");
    var endP = document.getElementById("endP");
    var step = document.getElementById("step");
    var scanRate = document.getElementById("scanRate");
    var cycle = document.getElementById("cycle");

    const commandInput = "CVW," + setTime.value + "," + startP.value + "," + endP.value + "," + step.value + "," + scanRate.value + "," + cycle.value
    const checksum = await calculateChecksum(commandInput);
    console.log(commandInput)
    /* const commandInput = 1 */
    const fullCommandInput = "$" + commandInput + "*" + checksum
    console.log(fullCommandInput);
    sendData(fullCommandInput);
  });

  async function sendData(commandInput) {
    const command = commandInput;
    console.log(command);
    if (port && port.writable) {
      writer = port.writable.getWriter();
      const textEncoder = new TextEncoder();
      const data = textEncoder.encode(command); // Recebe o comando do input
      await writer.write(data);
      writer.releaseLock();

      await startReading()
    }
  }
