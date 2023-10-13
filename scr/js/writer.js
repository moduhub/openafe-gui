
  const cvForm = document.getElementById("cvForm");

  cvForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    var setTime = document.getElementById("setTime");
    var startP = document.getElementById("startP");
    var endP = document.getElementById("endP");
    var step = document.getElementById("step");
    var scanRate = document.getElementById("scanRate");
    var cycle = document.getElementById("cycle");

    /* const commandInput = "CV," + setTime.value + "," + startP.value + "," + endP.value + "," + step.value + "," + scanRate.value + "," + cycle.value; */
    const commandInput = 1
    console.log(commandInput);
    sendData(commandInput);
  });

  async function sendData(commandInput) {
    const command = commandInput;
    console.log(command);
    console.log(port)
    console.log(port.writable);
    if (port && port.writable) {
      writer = port.writable.getWriter();
      const textEncoder = new TextEncoder();
      const data = textEncoder.encode(command); // Recebe o comando do input
      await writer.write(data);
      writer.releaseLock();

      await startReading()
    }
  }
