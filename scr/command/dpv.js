const dpvForm = document.getElementById("dpvForm");

    dpvForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    var setTime = document.getElementById("setTime").value
    var startP = document.getElementById("startP").value
    var endP = document.getElementById("endP").value
    var pulseP = document.getElementById("pulseP").value
    var step = document.getElementById("step").value
    var pulseW = document.getElementById("pulseW").value
    var baseW = document.getElementById("baseW").value
    var periodP = document.getElementById("periodP").value
    var periodB = document.getElementById("periodB").value


    const commandInput = "DPV," + setTime + "," + startP + "," + endP + ","+ pulseP + ","+ step + ","+ pulseW + ","+ baseW + ","+ periodP + ","+ periodB
    const checksum = await calculateChecksum(commandInput);
    const fullCommandInput = "$" + commandInput + "*" + checksum
    calculatePoints(startP, endP, step, cycle)

    sendData(fullCommandInput);
  });