#include <Arduino.h>
#include <math.h>

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
float calcularCorrente(float* funcao_dummy, float potencial, float directionStep, float startPotential, float endPotential);
String calcularChecksum(String s);
void inputCVW(String str);
float* functionGenerator(float xo, float xf);
void normalizeMatrix(float* mat, int N);
float* gaussElimination(float* mat, int N);

// Setup
void setup() {
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  Serial.begin(9600);
  Serial.println("$CONNECTED");
}

// Looping
void loop() {
  if (Serial.available()) {
    comandoRecebido = Serial.readStringUntil('\n');

    if(comandoRecebido.startsWith("$RESET")) {
      asm volatile ("  jmp 0");
    }
    else if (comandoRecebido.startsWith("$CVW")) {
      // Leitura do GUI
      inputCVW(comandoRecebido);
      varredura = true;
      directionStep = 1;
      x = cvwParams.startPotential;
      float* funcao_dummy = functionGenerator(cvwParams.startPotential, cvwParams.endPotential);
      Serial.println("$START");
    
      // Espera para estabilização
      //delay(cvwParams.settlingTime);

      while (varredura) {
        digitalWrite(ledPin, HIGH);  // Acende o LED durante a varredura
        y = calcularCorrente(funcao_dummy, x, directionStep, cvwParams.startPotential, cvwParams.endPotential);
        
        // Formata a mensagem e calcula o checksum
        String mensagem = "$SGL," + String(x, 6) + "," + String(y, 6);
        String checksum = calcularChecksum(mensagem);
        mensagem += "*" + checksum;
        
        Serial.println(mensagem);

        // Controle tempo ( em segundos )
        float periodoLeitura = 1000 * (cvwParams.step/cvwParams.scanRate);
        delay(periodoLeitura);  // Controle do tempo

        x += cvwParams.step * directionStep;  // Avança para o próximo valor de potencial
        if (x >= cvwParams.endPotential) {
          directionStep = -1;  // Inverte a direção da varredura
        }
        else if(x < cvwParams.startPotential){
          directionStep = 1;
          currentCycle++;  // Contabiliza o ciclo
        }
        
        // Verifica se o processo foi finalizado por ciclos
        if (currentCycle >= cvwParams.cycles) {
          varredura = false;  // Finaliza a varredura após os ciclos definidos
          Serial.println("$END,Ciclos Completos");
          digitalWrite(ledPin, LOW);  // Desliga o LED ao fim da varredura
        }

        // Verifica se um comando de parada foi recebido
        if (Serial.available()) {
          String comando = Serial.readStringUntil('\n');
          if (comando == "$CMD,DIE*2E") {
            varredura = false;  // Finaliza a varredura
            Serial.println("$END,Força Bruta");
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
float calcularCorrente(float* funcao_dummy, float potencial, float directionStep, float startPotential, float endPotential) {
  float retorno = 0.0;

  // Os pontos A, B, C e D estão na primeira linha de funcao_dummy
  float xa = funcao_dummy[0];    // Ponto A
  float xb = funcao_dummy[1];    // Ponto B
  float xc = funcao_dummy[2];    // Ponto C
  float xd = funcao_dummy[3];    // Ponto D

  // Ida
  if (directionStep == 1) {
    // Primeira função da ida, polinômio de ordem 3
    if (potencial >= xa && potencial < xc) {
      float a = funcao_dummy[5];  // Coeficiente a (linha 1, coluna 0)
      float b = funcao_dummy[6];  // Coeficiente b (linha 1, coluna 1)
      float c = funcao_dummy[7];  // Coeficiente c (linha 1, coluna 2)
      float d = funcao_dummy[8];  // Coeficiente d (linha 1, coluna 3)
      retorno = a * pow(potencial, 3) + b * pow(potencial, 2) + c * potencial + d;
    }
    // Segunda função da ida, polinômio de ordem 2
    else if (potencial >= xc && potencial < xb) {
      float a = funcao_dummy[10]; // Coeficiente a (linha 2, coluna 0)
      float b = funcao_dummy[11]; // Coeficiente b (linha 2, coluna 1)
      float c = funcao_dummy[12]; // Coeficiente c (linha 2, coluna 2)
      retorno = a * pow(potencial, 2) + b * potencial + c;
    }
  }
  // Volta
  else {
    // Primeira função de volta, polinômio de ordem 2
    if (potencial >= xa && potencial < xd) {
      float a = funcao_dummy[15]; // Coeficiente a (linha 3, coluna 0)
      float b = funcao_dummy[16]; // Coeficiente b (linha 3, coluna 1)
      float c = funcao_dummy[17]; // Coeficiente c (linha 3, coluna 2)
      retorno = a * pow(potencial, 2) + b * potencial + c;
    }
    // Segunda função de volta, polinômio de ordem 3
    else if (potencial >= xd && potencial < xb) {
      float a = funcao_dummy[20]; // Coeficiente a (linha 4, coluna 0)
      float b = funcao_dummy[21]; // Coeficiente b (linha 4, coluna 1)
      float c = funcao_dummy[22]; // Coeficiente c (linha 4, coluna 2)
      float d = funcao_dummy[23]; // Coeficiente d (linha 4, coluna 3)
      retorno = a * pow(potencial, 3) + b * pow(potencial, 2) + c * potencial + d;
    }
  }

  return retorno;
}



//
float* functionGenerator(float xo, float xf) {
    float A[2] = {0.0, 0.0};
    float B[2] = {0.0, 0.0};
    float C[2] = {0.0, 0.0};
    float D[2] = {0.0, 0.0};
    float P1[2] = {0.0, 0.0};
    float P2[2] = {0.0, 0.0};

    float b_ab = xf - xo;
    float h_ab = b_ab / 5.0; 
    float b_ac = b_ab * (2.0 / 3.0); 
    float h_ac = 2.0 * h_ab; 
    float b_cb = b_ab / 3.0; 
    float h_cb = h_ab; 
    float b_ad = b_cb; 
    float h_ad = h_ab; 
    float b_db = b_ac; 
    float h_db = 2.0 * h_ab; 

    A[0] = xo; 
    A[1] = 0.0;
    B[0] = A[0] + b_ab;
    B[1] = A[1] + h_ab;
    C[0] = A[0] + b_ac;
    C[1] = A[1] + h_ac;
    D[0] = A[0] + b_ad;
    D[1] = A[1] - h_ad;

    P1[0] = A[0] + b_ac / 4.0;
    P1[1] = A[1] + (h_ac / 2.0);
    P2[0] = A[0] + 3.0 * (b_ac / 4.0);
    P2[1] = A[1] + h_ac / 3.0;

    float mat0[4][5] = {
        {pow(A[0], 3), pow(A[0], 2), A[0], 1.0, A[1]},
        {pow(C[0], 3), pow(C[0], 2), C[0], 1.0, C[1]},
        {pow(P1[0], 3),pow(P1[0], 2), P1[0], 1.0, P1[1]},
        {pow(P2[0], 3), pow(P2[0], 2), P2[0], 1.0, P2[1]}
    };
    float* ptrMat0 = &mat0[0][0];
    normalizeMatrix(ptrMat0, 4);
    float* solution0 = gaussElimination(ptrMat0, 4);

    P1[0] = C[0] + b_cb / 3.0;
    P1[1] = C[1] - 2.0 * (h_cb / 3.0);
    float mat1[3][4] = {
        {pow(C[0], 2), C[0], 1.0, C[1]},
        {pow(B[0], 2), B[0], 1.0, B[1]},
        {pow(P1[0], 2), P1[0], 1.0, P1[1]}
    };
    float* ptrMat1 = &mat1[0][0];
    normalizeMatrix(ptrMat1, 3);
    float* solution1 = gaussElimination(ptrMat1, 3);

    P1[0] = A[0] + 2.0 * (b_ad / 3.0);
    P1[1] = A[1] - (h_ad / 3.0);
    float mat2[3][4] = {
        {pow(A[0], 2), A[0], 1.0, A[1]},
        {pow(D[0], 2), D[0], 1.0, D[1]},
        {pow(P1[0], 2), P1[0], 1.0, P1[1]}
    };
    float* ptrMat2 = &mat2[0][0];
    normalizeMatrix(ptrMat2, 3);
    float* solution2 = gaussElimination(ptrMat2, 3);

    P1[0] = D[0] + b_db / 5.0;
    P1[1] = D[1] + 3.0 * (h_db / 10.0);
    P2[0] = D[0] + (b_db / 2.0);
    P2[1] = D[1] + 3.0 * (h_db / 10.0);
    float mat3[4][5] = {
        {pow(D[0], 3), pow(D[0], 2), D[0], 1.0, D[1]},
        {pow(B[0], 3), pow(B[0], 2), B[0], 1.0, B[1]},
        {pow(P1[0], 3),pow(P1[0], 2), P1[0], 1.0, P1[1]},
        {pow(P2[0], 3), pow(P2[0], 2), P2[0], 1.0, P2[1]}
    };
    float* ptrMat3 = &mat3[0][0];
    normalizeMatrix(ptrMat3, 4);
    float* solution3 = gaussElimination(ptrMat3, 4);

     static float functionReturn[5][5];  // Static to persist across function calls

    functionReturn[0][0] = A[0];
    functionReturn[0][1] = B[0];
    functionReturn[0][2] = C[0];
    functionReturn[0][3] = D[0];

    // Armazenando as soluções nas próximas linhas
    for (int i = 0; i < 5; i++) {
        functionReturn[1][i] = solution0[i];
        functionReturn[2][i] = solution1[i];
        functionReturn[3][i] = solution2[i];
        functionReturn[4][i] = solution3[i];
    }

    return &functionReturn[0][0];

    return &functionReturn[0][0];  // Retorna o ponteiro para a primeira linha da matriz
}

//
void normalizeMatrix(float* mat, int N) {
    for (int i = 0; i < N; i++) {
        float maxVal = fabs(mat[i * (N + 1)]);
        for (int j = 1; j < N; j++) {
            maxVal = fmax(maxVal, fabs(mat[i * (N + 1) + j]));
        }

        for (int j = 0; j <= N; j++) {
            mat[i * (N + 1) + j] /= maxVal;
        }
    }
}

//
float* gaussElimination(float* mat, int N) {
    static float solution[10]; // Usar um array estático para garantir que a memória seja preservada

    for (int i = 0; i < N; i++) {
        int maxRow = i;
        for (int k = i + 1; k < N; k++) {
            if (fabs(mat[k * (N + 1) + i]) > fabs(mat[maxRow * (N + 1) + i])) {
                maxRow = k;
            }
        }

        if (maxRow != i) {
            for (int j = 0; j <= N; j++) {
                float temp = mat[i * (N + 1) + j];
                mat[i * (N + 1) + j] = mat[maxRow * (N + 1) + j];
                mat[maxRow * (N + 1) + j] = temp;
            }
        }

        for (int k = i + 1; k < N; k++) {
            float factor = mat[k * (N + 1) + i] / mat[i * (N + 1) + i];
            for (int j = i; j <= N; j++) {
                mat[k * (N + 1) + j] -= factor * mat[i * (N + 1) + j];
            }
        }
    }

    for (int i = N - 1; i >= 0; i--) {
        solution[i] = mat[i * (N + 1) + N];
        for (int j = i + 1; j < N; j++) {
            solution[i] -= mat[i * (N + 1) + j] * solution[j];
        }
        solution[i] /= mat[i * (N + 1) + i];
    }

    return solution;
}