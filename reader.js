
let receivedData = '';

async function readData() {
    try {
        const reader = port.readable.getReader();
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                reader.releaseLock();
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

document.getElementById('readDataButton').addEventListener('click', readData);
