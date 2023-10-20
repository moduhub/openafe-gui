let receivedData = '';
let reader = null; // Variável para armazenar o leitor

async function startReading() {
    if (reader) {
        // Se já houver um leitor, libere-o para interromper a leitura anterior
        reader.releaseLock();
    }
    
    // Crie um novo leitor
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

            if (receivedData.includes('\n')) {
                const lines = receivedData.split('\n');
                
                for (const line of lines) {
                    
                    if (line.startsWith("$SGL,")) {

                        const data = line.split("*")
                        const dataChecksum = data[0].replace("$", "").trim();
                        const checksum = await calculateChecksum(dataChecksum);
                        const z = String(data[1].split(",\r")[0]).trim();
                        console.log("Checksum:" + checksum + "'")
                        console.log("Ultimo:" + z + "'")
                        console.log("Checksum:" + (checksum === z))
                        
                        
                        const part = line.split(',');
                        const x = parseFloat(part[1]);
                        const y = parseFloat(part[2]);
                        
                        console.log('SGL:' + x);
                        console.log('y:' + y);                       
                        
                        addDataToChart(x, y);
                    }
                }

                receivedData = '';
            }
        }
    } catch (error) {
        console.error('Erro na leitura:', error);
    }
}

// Função para parar a leitura quando necessário
function stopReading() {
    if (reader) {
        reader.releaseLock();
        reader = null;
        sendData("0")
    }
}

document.getElementById('closePort').addEventListener('click', stopReading);
