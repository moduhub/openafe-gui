// Variáveis para armazenar os dados da varredura cíclica
float x = 0;  // Potencial inicial
float y = 0;   // Corrente inicial

// Estrutura para armazenar os parâmetros da varredura
struct CVWParams {
  float settlingTime;
  float startPotential;
  float endPotential;
  float step;
  float scanRate;
  float cycles;
};

// Variáveis globais
CVWParams cvwParams;
bool varredura = false;
int currentCycle = 0;
String comandoRecebido = "";
const int ledPin = 13; // Pino do LED
float directionStep = 1;

// Prototipação das funções
float calcularCorrente(float potential);
String calcularChecksum(String s);
void inputCVW(String str);

// Setup
void setup() {
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);  // Inicializa o LED apagado
  Serial.begin(9600);
}

// Looping
void loop() {
  if (Serial.available()) {
    comandoRecebido = Serial.readStringUntil('\n');

    if (comandoRecebido.startsWith("$CVW")) {
      // Leitura do GUI
      inputCVW(comandoRecebido);
      varredura = true;
      directionStep = 1;
      x = cvwParams.startPotential;

      // Espera para estabilização
      //delay(cvwParams.settlingTime);

      while (varredura) {
        digitalWrite(ledPin, HIGH);  // Acende o LED durante a varredura
        y = calcularCorrente(x, directionStep, cvwParams.startPotential, cvwParams.endPotential);
        
        // Formata a mensagem e calcula o checksum
        String mensagem = "$SGL," + String(x, 6) + "," + String(y, 6);
        String checksum = calcularChecksum(mensagem);
        mensagem += "*" + checksum;
        
        Serial.println(mensagem);
        delay(100);  // Atraso para não sobrecarregar a porta serial

        x += cvwParams.step * directionStep;  // Avança para o próximo valor de potencial
        if (x >= cvwParams.endPotential) {
          directionStep = -1;  // Inverte a direção da varredura
        }
        else if(x < cvwParams.startPotential){
          directionStep = 1;
          currentCycle++;  // Contabiliza o ciclo
        }
        
        if (currentCycle >= cvwParams.cycles) {
          varredura = false;  // Finaliza a varredura após os ciclos definidos
          Serial.println("Processo encerrado por ciclos");
          digitalWrite(ledPin, LOW);  // Desliga o LED ao fim da varredura
        }

        // Verifica se um comando de parada foi recebido
        if (Serial.available()) {
          String comando = Serial.readStringUntil('\n');
          if (comando == "$CMD,DIE*2E") {
            varredura = false;  // Finaliza a varredura
            Serial.println("Processo encerrado por força bruta");
            digitalWrite(ledPin, LOW);  // Desliga o LED
          }
        }
      }
    }
  }
}

// Função para processar o comando $CVW e extrair os parâmetros
// exemplo: $CVW,1000,-800,0,100,2,1*54
void inputCVW(String str) {

  int index = 0;
  String elementos[7];
  int startIndex = 0;
  int endIndex = str.indexOf(',');

  // Divide a string em partes usando vírgula como delimitador
  while (endIndex >= 0) {
    elementos[index++] = str.substring(startIndex, endIndex);
    startIndex = endIndex + 1;
    endIndex = str.indexOf(',', startIndex);
  }
  elementos[index] = str.substring(startIndex);  // Último valor após a última vírgula

  // Converte os elementos para float e atribui aos parâmetros
  cvwParams.settlingTime = elementos[1].toFloat();
  cvwParams.startPotential = elementos[2].toFloat();
  cvwParams.endPotential = elementos[3].toFloat();
  cvwParams.scanRate = elementos[4].toFloat();
  cvwParams.step = elementos[5].toFloat();
  cvwParams.cycles = elementos[6].substring(0, elementos[6].indexOf('*')).toFloat();
}

// Função para calcular o checksum de uma string
String calcularChecksum(String s) {
  char checksum = 0;
  for (int i = 0; i < s.length(); i++) {
    if (s[i] != '$') {  // Ignora o caractere '$'
      checksum ^= s[i];  // Faz um XOR com o valor ASCII de cada caractere
    }
  }

  // Converte o resultado do XOR em formato hexadecimal
  char checksumHex[3];
  sprintf(checksumHex, "%02X", checksum);

  return String(checksumHex);  // Retorna o checksum como string
}

// Função para calcular a corrente com base no potencial (simulação)
float calcularCorrente(float potencial, float directionStep, float startPotential, float endPotential) {
  // A corrente varia senoidalmente com o potencial
  float deltaPotencial = (endPotential - startPotential);
  float periodo = (deltaPotencial>0) ? deltaPotencial : -deltaPotencial;
  float omega = 2 * PI / periodo;
  float corrente = sin(omega * potencial); 
  return (directionStep == 1) ? corrente : 0;
}