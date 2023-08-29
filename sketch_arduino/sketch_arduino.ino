const int ledPin = 13; // O LED embutido no Arduino (pino 13)
char command; // Variável para armazenar o comando recebido

void setup() {
  Serial.begin(9600); // Inicialize a comunicação serial com uma taxa de 9600 bps
  pinMode(ledPin, OUTPUT); // Configure o pino do LED como saída
}

void loop() {
  if (Serial.available() > 0) { // Verifique se há dados disponíveis na porta serial
    command = Serial.read(); // Leia o comando recebido

    // Realize ações com base no comando recebido
    switch (command) {
      case 'H': // Ligar o LED (comando 'H')
        digitalWrite(ledPin, HIGH);
        Serial.println("LED Ligado");
        break;
      case 'L': // Desligar o LED (comando 'L')
        digitalWrite(ledPin, LOW);
        Serial.println("LED Desligado");
        break;
      case 'B': // Inverter o estado do LED (comando 'B')
        digitalWrite(ledPin, !digitalRead(ledPin));
        if (digitalRead(ledPin) == HIGH) {
          Serial.println("LED Ligado");
        } else {
          Serial.println("LED Desligado");
        }
        break;
      default:
        // Comando desconhecido
        Serial.println("Comando Inválido");
    }
  }

  // Loop de envio de dados
  int x = random(0, 1000); // Gera um número aleatório entre 0 e 999 para x
  int y = random(0, 1000); // Gera um número aleatório entre 0 e 999 para y

  // Formata os valores de x e y em uma string "$SGL,x,y"
  String data = "$SGL," + String(x) + "," + String(y);

  // Envia a string pela porta serial
  Serial.println(data);

  delay(1000); // Aguarda 1 segundo antes de enviar a próxima leitura
}
