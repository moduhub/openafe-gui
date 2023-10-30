const cvForm = document.getElementById("cvForm");

cvForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  var setTime = document.getElementById("setTime").value;
  var startP = document.getElementById("startP").value;
  var endP = document.getElementById("endP").value;
  var step = document.getElementById("step").value;
  var scanRate = document.getElementById("scanRate").value;
  var cycle = document.getElementById("cycle").value;

  const commandInput = "CVW," + setTime + "," + startP + "," + endP + "," + scanRate + "," + step + "," + cycle;
  const checksum = await calculateChecksum(commandInput);
  const fullCommandInput = "$" + commandInput + "*" + checksum;

  calculatePoints(startP, endP, step, cycle)
  sendData(fullCommandInput);

});



