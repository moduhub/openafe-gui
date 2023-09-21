let receivedData = '';
let reader = null; // Variável para armazenar o leitor

// Função para iniciar a leitura
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

// Adicione um evento de clique ao botão "closePort" para chamar a função stopReading
document.getElementById('closePort').addEventListener('click', stopReading);

// Adicione um evento de clique a um botão (por exemplo, "startPort") para iniciar a leitura
document.getElementById('startPort').addEventListener('click', startReading);
