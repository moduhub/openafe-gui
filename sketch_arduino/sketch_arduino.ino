// Variáveis para armazenar os dados de potencial (x) e corrente (y)
float x = -1.0; // Inicializa com -1.0 para a varredura
float y = 0.0;  // Inicializa com 0.0

void setup() {
  // Inicializa a comunicação serial com um baud rate de 115200
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

void loop() {
  // Verifica se há dados disponíveis na porta serial
  while (Serial.available() > 0) {
    // Lê o primeiro byte disponível
    char comando = Serial.read();
    
    // Verifica o comando recebido
    if (comando == '1') {
      // Inicia a varredura de voltametria cíclica
      while (comando != '0') {
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
        if (x > 1.0 || x < -1.0) {
          x = -x;
        }
        
        // Verifique se há um novo comando
        if (Serial.available() > 0) {
          comando = Serial.read();
        }
      }
      // Se recebeu "0", pare a varredura
    }
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
