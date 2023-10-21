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