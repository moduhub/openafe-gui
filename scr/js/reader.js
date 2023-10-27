let receivedData = '';
let reader = null;
let sglLineCount = 0; // Inicialize o contador

async function startReading() {
   if (reader) {
      reader.releaseLock();
   }

   reader = port.readable.getReader();

   try {
      while (true) {
         const {value,done} = await reader.read();
         if (done) {
            break;
         }
         const textDecoder = new TextDecoder('utf-8');
         const data = textDecoder.decode(value);
         receivedData += data;

         const lines = receivedData.split('\n');

         if (lines.length > 1) {
            receivedData = lines.pop();

            for (const line of lines) {

               processLines(line)
            }

         }
      }
   } catch (error) {
      console.error('Erro na leitura:', error);
   }

}

async function processLines(line) {

   if (line.startsWith("$MSG,END*3A")) {
      reader.releaseLock();
      console.log(sglLineCount)
      reader = null;
      console.log('Parando a leitura.');
      sglLineCount = 0
   }

   if (line.startsWith("$SGL,")) {
      sglLineCount++;
      updateProgressBar();
      const part = line.split(',');
      const x = parseFloat(part[1]);
      const y = parseFloat(part[2]);
      console.log('SGL:' + x);
      console.log('y:' + y);

      const data = line.split("*");
      const dataChecksum = data[0].replace("$", "").trim();
      const checksum = await calculateChecksum(dataChecksum);
      const z = String(data[1].split(",\r")[0]).trim();
      addDataToChart(x, y);
   } else {
      // Registro de erro
      console.log('Dados com problema: linha com formato incorreto -', line);
   }
}

// Function to stop reading when necessary
function stopReading() {
   if (reader) {
      sendData("$CMD,DIE*2E")
      reader.releaseLock();
      reader = null;
   }
}

if (window.numPoints) {
   // Agora você pode acessar numPoints como uma propriedade da janela (objeto global)
   var numPoints = window.numPoints;
}
async function updateProgressBar() {
    var progressBar = document.getElementById("myProgressBar");
    var width = (sglLineCount / numPoints) * 100;
    progressBar.style.width = width + "%";
} 

document.getElementById('closePortCV').addEventListener('click', stopReading);
document.getElementById('closePortDPV').addEventListener('click', stopReading);