// Variáveis para armazenar os dados x e y
float x = 0.0; // Inicializa com 0.0 para começar com um valor válido
float y = 0.0; // Inicializa com 0.0 para começar com um valor válido

void setup() {
  // Inicializa a comunicação serial com um baud rate de 115200
  Serial.begin(9600);
}

void loop() {
  // Verifica se há dados disponíveis na porta serial
  while (Serial.available() > 0) {
    // Lê o primeiro byte disponível
    char comando = Serial.read();
    
    // Verifica o comando recebido
    if (comando == '1') {
      // Inicia o envio de dados
      while (comando != '0') {
        // Calcula os valores de x e y com base no seno do tempo
        x = sin(millis() * 0.001); // O tempo é convertido para segundos
        y = sin(millis() * 0.001 + 1.0); // Deslocamento de fase para y
        
        // Formata os dados no formato "$SGL,x,y"
        String mensagem = "$SGL," + String(x) + "," + String(y);
        
        // Envia a mensagem pela porta serial
        Serial.println(mensagem);
        
        // Aguarde um curto período de tempo para não inundar a porta serial
        delay(100);
        
        // Verifique se há um novo comando
        if (Serial.available() > 0) {
          comando = Serial.read();
        }
      }
      // Se recebeu "0", pare o envio de dados
    }
  }
}
