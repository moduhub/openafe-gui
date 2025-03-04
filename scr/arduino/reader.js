let receivedData = '';
let reader = null;
let sglLineCount = 0; // Inicialize o contador
var numPoints = 0;
let isReading = true;

async function startReading() {
   if (!port || !port.readable) {
      console.error('Porta não está aberta ou não é legível.');
      return;
   }

   if (reader) {
      try {
         reader.releaseLock();
      } catch (error) {
         console.error('Erro ao liberar o bloqueio do leitor:', error);
      }
   }

   reader = port.readable.getReader();

   try {
      while (isReading) {
         const { value, done } = await reader.read();
         if (done) {
            break;
         }
         const textDecoder = new TextDecoder('utf-8');
         const data = textDecoder.decode(value);
         receivedData += data;

         const lines = receivedData.split('\n');

         if (lines.length > 1) {
            receivedData = lines.pop();

            console.log("Linhas recebidas: "+lines.length)
            console.log("INF. RECEBIDA: " + lines);

            for (const line of lines) {
               processLines(line);
            }
         }
      }
   } catch (error) {
      console.error('Erro na leitura:', error);
   } finally {
      if (reader) {
         try {
            reader.releaseLock();
         } catch (error) {
            console.error('Erro ao liberar o bloqueio do leitor:', error);
         }
         reader = null;
      }
   }
}

function stopReading() {
  if (reader) {
     sendData("$CMD,DIE*2E");
     getPlotterData();
     isReading = false; // Parar a leitura
     try {
        reader.releaseLock();
     } catch (error) {
        console.error('Erro ao liberar o bloqueio do leitor:', error);
     }
     reader = null;
  }
}

async function processLines(line) {

   if (line.startsWith("$ERR")) {
      switch (line){
         case ("$ERR,INV*38"):
            openNotificationNotClose("contactSupport")
            break;
         case ("$ERR,PAR*2A"):
            openNotificationNotClose("dataOutRange")
            break;
         case ("$ERR,GEN*25"):
            openNotificationNotClose("contactSupport")
            break;
         case ("$ERR,AFE*2B"):
            openNotificationNotClose("deviceMalfunction")
            break;
         case ("$ERR,WAV*29"):
            openNotificationNotClose("contactSupport")
      default:
         openNotificationNotClose("contactSupport")
         break;
         }
   }

  if (line.startsWith("$MSG,END*3A")) {
    if (reader) {
       try {
          reader.releaseLock();
       } catch (error) {
          console.error('Erro ao liberar o bloqueio do leitor:', error);
       }
       reader = null;
    }
    console.log('Parando a leitura.');
    console.log(numPoints - sglLineCount);
    numPoints == sglLineCount ? openNotificationNotClose("dataReceived") : openNotificationNotClose("dataLoss");
    sglLineCount = 0;
 }

  if (line.startsWith("$SGL,")) {
      sglLineCount++;
      updateProgressBar();
      const part = line.split(',');
      const x = parseFloat(part[1]);
      const y = parseFloat(part[2]);
      //console.log('SGL:' + x);
      //console.log('y:' + y); 

      const data = line.split("*");
      const dataChecksum = data[0].replace("$", "").trim();
      const checksum = await calculateChecksum(dataChecksum);
      const checksumData = String(data[1].split(",\r")[0]).trim();
      const z = checksumData == checksum ? 1 : 0;

      addDataToChart(x, y, z);
   } else {
      // Registro de erro
      console.log('Dados com problema: linha com formato incorreto -', line);
   }
}

async function updateProgressBar() {
    var progressBar = document.getElementById("myProgressBar");
    var width = (sglLineCount / numPoints) * 100;
    progressBar.style.width = width + "%";
} 

function calculatePoints(startP, endP, step, cycle) {
   var numPointsPerSlope = (endP - startP) / step
   var numPointsPerCycle = numPointsPerSlope * 2
   numPoints = (numPointsPerCycle * cycle) + 1
   console.log(numPoints)
}

document.getElementById('closePortCV').addEventListener('click', stopReading);
document.getElementById('closePortDPV').addEventListener('click', stopReading);