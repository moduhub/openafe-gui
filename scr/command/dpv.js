const dpvForm = document.getElementById("dpvForm");

    dpvForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    var setTime = document.getElementById("setTime");
    var startP = document.getElementById("startP");
    var endP = document.getElementById("endP")
    var pulseP = document.getElementById("pulseP")
    var step = document.getElementById("step")
    var pulseW = document.getElementById("pulseW")
    var baseW = document.getElementById("baseW")
    var periodP = document.getElementById("periodP")
    var periodB = document.getElementById("periodB")


    const commandInput = "DPV," + setTime.value + "," + startP.value + "," + endP.value + ","+ pulseP.value + ","+ step.value + ","+ pulseW.value + ","+ baseW.value + ","+ periodP.value + ","+ periodB.value
    const pointsDPV = ((endP.value - (startP.value)) * 2) + 1;
    const checksum = await calculateChecksum(commandInput);
    console.log(commandInput)
    /* const commandInput = 1 */
    const fullCommandInput = "$" + commandInput + "*" + checksum
    console.log(fullCommandInput);
    sendData(fullCommandInput);
  });