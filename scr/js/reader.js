let receivedData = '';
let reader = null;
let sglLineCount = 0; // Inicialize o contador

async function startReading() {
    if (reader) {
        // If there is already a reader, release it to stop the previous reading
        reader.releaseLock();
    }
    
    // Create a new reader
    reader = port.readable.getReader();

    try {
        while (true) {
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
    
                for (const line of lines) {
                    
                    if (line.startsWith("$MSG,END*3A")) {
                        reader.releaseLock();
                        reader = null;
                        console.log('Parando a leitura.');
                        console.log(globalPoint.pointsCV)
                        console.log(sglLineCount)
                        sglLineCount = 0
                    }
    
                    if (line.startsWith("$SGL,")) {
                        sglLineCount++;
                        updateProgressBar();
                        const part = line.split(',');
                        if (part.length >= 3) {
                            const x = parseFloat(part[1]);
                            const y = parseFloat(part[2]);
                            console.log('SGL:' + x);
                            console.log('y:' + y);
    
                            const data = line.split("*");
                            if (data.length === 2) {
                                const dataChecksum = data[0].replace("$", "").trim();
                                const checksum = await calculateChecksum(dataChecksum);
                                const z = String(data[1].split(",\r")[0]).trim(); 
                                console.log("Checksum:" + checksum + "'");
                                console.log("Ultimo:" + z + "'");
                                console.log("Checksum:" + (checksum === z))
    
                                addDataToChart(x, y);
                            } else {
                                // Registro de erro
                                console.log('Dados com problema: linha com formato incorreto -', line);
                            }
                        } else {
                            // Registro de erro
                            console.log('Dados com problema: linha com número insuficiente de partes -', line);
                        }
                    } else {
                        // Registro de erro
                        console.log('Dados com problema: linha não começa com "$SGL," -', line);
                    }
                }

            }
        }
    } catch (error) {
        console.error('Erro na leitura:', error);
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

function updateProgressBar() {
    var progressBar = document.getElementById("myProgressBar");
    var width = (sglLineCount / globalPoint.pointsCV) * 100;
    progressBar.style.width = width + "%";
  }  

document.getElementById('closePortCV').addEventListener('click', stopReading);
document.getElementById('closePortDPV').addEventListener('click', stopReading);
