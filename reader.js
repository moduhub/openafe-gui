
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
          //verificar melhoria para isso, codigo abaixo recebe os dados e concatena até encontrar a quebra de linha /n
          const textDecoder = new TextDecoder('utf-8');
          const data = textDecoder.decode(value);
          receivedData += data;

          if (receivedData.includes('\n')) {
              const lines = receivedData.split('\n');

              for (const line of lines) {
                  if (line.startsWith("$SGL,")){
                      const part = line.split(',');
                      const x = part[1];
                      const y = part[2];
                      console.log('SGL:'+ x);
                      console.log('y:' + y);
          }
          }
      }
      }
  } catch (error) {
      console.error('Erro na leitura:', error);
  }
}


document.getElementById('readDataButton').addEventListener('click', readData);

