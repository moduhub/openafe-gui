// Variáveis para armazenar os dados de potencial (x) e corrente (y)
float x = -1.0; // Inicializa com -1.0 para a varredura
float y = 0.0;  // Inicializa com 0.0

// Variáveis
String comandoRecebido = "";
float setTime = 0;
float startP = 0;
float endP = 0;
float step = 0;
float scanRate = 0;
float cycle = 0;
bool varredura = false;

String elementos[7];

float calcularCorrente(float potential);

void setup() {
  // Inicializa a comunicação serial com um baud rate de 9600
  Serial.begin(9600);
}

// Função para calcular o checksum de uma string, excluindo o caractere '$'
String calcularChecksum(String s) {
  char checksum = 0;
  for (int i = 0; i < s.length(); i++) {
    if (s[i] != '$') { // Ignora o caractere '$'
      checksum ^= s[i]; // Faz um XOR com o valor ASCII de cada caractere
    }
  } 

  // Converte o resultado para uma representação hexadecimal de dois dígitos
  char checksumHex[3];
  sprintf(checksumHex, "%02X", checksum);

  return String(checksumHex);
}

// Recebimento do comando CVW
// CVW,1000,-800,0,100,1,1*57
void inputCVW(String str) {
  int index = 0;
  int startIndex = 0;
  int endIndex = str.indexOf(',');

  while (endIndex >= 0) {
    elementos[index++] = str.substring(startIndex, endIndex);
    startIndex = endIndex + 1;
    endIndex = str.indexOf(',', startIndex);
  }
  elementos[index] = str.substring(startIndex);

  // Converte os elementos para float
  setTime = elementos[1].toFloat();
  startP = elementos[2].toFloat();
  endP = elementos[3].toFloat();
  step = elementos[4].toFloat();
  scanRate = elementos[5].toFloat();

  // Atualiza o gráfico
  x = startP;
  
  // Pega somente o primeiro termo do último elemento
  cycle = elementos[6].substring(0, elementos[6].indexOf('*')).toFloat();
}

void loop() {
  // Verifica se há dados disponíveis na porta serial
  while (Serial.available() > 0) {
    // Lê a string completa até o caractere de nova linha
    comandoRecebido = Serial.readStringUntil('\n');
    // Verifica se a string recebida começa com ":$CVW"
    if (comandoRecebido.startsWith("$CVW")) {
      // Divide a string em elementos separados por vírgula, e os salva nas devidas variáveis
      inputCVW(comandoRecebido);

      varredura = true;
      // Inicia a varredura de voltametria cíclica
      while (varredura) {
        // Calcula a corrente com base no potencial simulado
        y = calcularCorrente(x);
        
        // Formata os dados no formato "$SGL,x,y*checksum"
        String mensagem = "$SGL," + String(x, 6) + "," + String(y, 6);
        
        // Calcula o checksum da mensagem
        String checksum = calcularChecksum(mensagem);
        
        // Adiciona o checksum à mensagem
        mensagem += "*" + checksum;
        
        // Envia a mensagem pela porta serial
        Serial.println(mensagem);
        
        // Aguarde um curto período de tempo para não inundar a porta serial
        delay(100);
        
        // Avance para o próximo potencial
        x += 0.01; // Aumenta o potencial em 0.01 V
        
        // Se atingir o potencial máximo, inverta a direção da varredura
        if (x > endP || x < startP) {
          x = -x;
        }
        
        // Verifique se há um novo comando
        if (Serial.available() > 0) {
          String comando = Serial.readStringUntil('\n');
          if (comando == "$CMD,DIE*2E") {
            varredura = false;
            Serial.print("Processo encerrado");
          }
          Serial.print("Comando: ");
          Serial.println(comando);
        }
      }
    }
    Serial.print("Comando: ");
    Serial.println(comandoRecebido);
  }
}

// Função de cálculo de corrente (simulação)
float calcularCorrente(float potential) {
  // Aqui você pode ajustar a função para simular o comportamento da corrente
  // de acordo com a voltametria cíclica desejada
  // Para um exemplo simples, a corrente varia senoidalmente com o potencial
  float current = sin(potential * 3.14) * 0.1; // Ajuste os parâmetros conforme necessário
  return current;
}