#include <Arduino.h>
#include <math.h>

// Variables to store the cyclic scan data
float x = 0;  // Initial potential
float y = 0;   // End potential
float kNoise = 15; // Amount of noise

// Structure for storing the scan parameters
struct CVWParams {
  float settlingTime;
  float startPotential;
  float endPotential;
  float step;
  float scanRate;
  float cycles;
};

// Structures for string functions and points
struct Params {
    Params* prev;
    Params* next;
    float param;
};
struct Coord {
  float x;
  float y;
};
struct Points {
  Points* prev;
  Points* next;
  Coord coord;
};
struct Function {
    Params* params;
    int qParams;
    Function* next;
};
struct Functions {
    Function* functions;
    Points* points;
};

// Global variables
CVWParams cvwParams;
bool scanBool = false;
int currentCycle = 0;
String commandReceived = "";
const int ledPin = 13; // LED Pin
float directionStep = 1;

// Prototyping of functions
float calculateCurrent(
  Functions functions_dummy, 
  float potential, 
  float directionStep, 
  float startPotential, 
  float endPotential
);
String calculateChecksum(String s);
void inputCVW(String str);
Functions functionGenerator(
  float xo, float xf
); 
void normalizeMatrix(float* mat, int N);
float* gaussElimination(float* mat, int N);
void printFunction(Functions functions);
void addFunction(
  Function** functions, 
  float solution[], 
  int order
);
float applyNoise(float number);
void freeFunctions(Functions& funcs);

// Setup
void setup() {
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  Serial.begin(9600);
  randomSeed(analogRead(0));
  Serial.println("$CONNECTED");
}

// Looping
void loop() {
  if (Serial.available()) {
    commandReceived = Serial.readStringUntil('\n');

    if(commandReceived.startsWith("$RESET")) {
      asm volatile ("  jmp 0");
    }
    else if (commandReceived.startsWith("$CVW")) {
      inputCVW(commandReceived);
      scanBool = true;
      directionStep = 1;
      x = cvwParams.startPotential;
      Functions functions_dummy = functionGenerator(
        cvwParams.startPotential, 
        cvwParams.endPotential
      ); 
      printFunction(functions_dummy);
      
      Serial.println("$START");
      currentCycle = 0;
          
      // Waiting for stabilization
      //delay(cvwParams.settlingTime);

      while (scanBool) {
        digitalWrite(ledPin, HIGH);
        y = calculateCurrent(
          functions_dummy, 
          x, 
          directionStep, 
          cvwParams.startPotential, 
          cvwParams.endPotential
        );
        
        String mensagem = "$SGL," + String(x, 6) + "," + String(y, 6);
        String checksum = calculateChecksum(mensagem);
        mensagem += "*" + checksum;
        
        Serial.println(mensagem);

        // Control time (in seconds)
        float readingPeriod = 1000 * (cvwParams.step/cvwParams.scanRate);
        delay(readingPeriod);

        x += cvwParams.step * directionStep; 

        if (x >= cvwParams.endPotential){ 
          x = cvwParams.endPotential;
          directionStep = -1;  // Reverses the direction of the scan
        }
        else if(x <= cvwParams.startPotential && directionStep==-1){
          directionStep = 1;
          currentCycle++;  // Accounts for the cycle
          // Verify that the process has been completed by cycles
          if (currentCycle >= cvwParams.cycles) {
            String mensagem = "$SGL," + String(cvwParams.startPotential, 6) + "," + String(0.000000, 6);
            String checksum = calculateChecksum(mensagem);
            mensagem += "*" + checksum;
            Serial.println(mensagem);

            freeFunctions(functions_dummy);
            Serial.println("$MEM,Memória limpa");
            Serial.println("$END,Ciclos Completos");
            currentCycle =  0;
            digitalWrite(ledPin, LOW);
            scanBool = false;
          }
          else{
            freeFunctions(functions_dummy);
            functions_dummy = functionGenerator(
              cvwParams.startPotential, 
              cvwParams.endPotential
            ); 
            Serial.println("$CYC,Nova função gerada");
            printFunction(functions_dummy);
          }
        }
        
        

        // Checks if a stop command has been received
        if (Serial.available()) {
          String comando = Serial.readStringUntil('\n');
          if (comando == "$CMD,DIE*2E") {
            freeFunctions(functions_dummy);
            Serial.println("$MEM,Memória limpa");
            Serial.println("$END,Força Bruta");
            digitalWrite(ledPin, LOW);  
            scanBool = false;  // Ends the scan
          }
        }
      }
    }
  }
}

// Function to process the $CVW command and extract the parameters
// example: $CVW,1000,-800,0,100,2,1*54
void inputCVW(String str) {

  int index = 0;
  String elementos[7];
  int startIndex = 0;
  int endIndex = str.indexOf(',');

  // Splits the string into parts using comma as a delimiter
  while (endIndex >= 0) {
    elementos[index++] = str.substring(startIndex, endIndex);
    startIndex = endIndex + 1;
    endIndex = str.indexOf(',', startIndex);
  }
  elementos[index] = str.substring(startIndex); 

  // Converts the elements to float and assigns them to the parameters
  cvwParams.settlingTime = elementos[1].toFloat();
  cvwParams.startPotential = elementos[2].toFloat();
  cvwParams.endPotential = elementos[3].toFloat();
  cvwParams.step = elementos[4].toFloat();
  cvwParams.scanRate = elementos[5].toFloat();
  
  cvwParams.cycles = elementos[6].substring(0, elementos[6].indexOf('*')).toFloat();
  Serial.print("S: ");
  Serial.println(cvwParams.settlingTime);
  Serial.print("I: ");
  Serial.println(cvwParams.startPotential);
  Serial.print("E: ");
  Serial.println(cvwParams.endPotential);
  Serial.print("SR: ");
  Serial.println(cvwParams.scanRate);
  Serial.print("S: ");
  Serial.println(cvwParams.step);
}

// Function to calculate the checksum of a string
String calculateChecksum(String s) {
  char checksum = 0;
  for (int i = 0; i < s.length(); i++) {
    if (s[i] != '$') {  
      checksum ^= s[i]; 
    }
  }

  // Converts XOR result to hexadecimal format
  char checksumHex[3];
  sprintf(checksumHex, "%02X", checksum);

  return String(checksumHex);
}

// Function to calculate current based on potential (simulation)
float calculateCurrent(
  Functions functions_dummy, 
  float potential, 
  float directionStep, 
  float startPotential, 
  float endPotential
) {
  float retorno = 0.0;

  // Points A, B, C, and D are in the first row of funcao_dummy
  Points* p = functions_dummy.points;
  // Jump auxiliary points
  for(int i=0;i<6;i++)
    p = p->next;
  float xd = p->coord.x;  
  p = p->next;
  float xc = p->coord.x;   
  p = p->next;
  float xb = p->coord.x;   
  p = p->next;
  float xa = p->coord.x;   

  Function* f = functions_dummy.functions;
  // Going
  if (directionStep == 1) {
    // First one-way function, polynomial of order 3
    if (potential > xa && potential < xc) {
      for(int i=0; i<3; i++) f = f->next;
      Params* param = f->params;
      int expoente = f->qParams - 1;
      while (param) {
          retorno += param->param * pow(potential, expoente);
          expoente--;
          param = param->next;
      }
    }
    // Second one-way function, polynomial of order 2
    else if (potential >= xc) {
      for(int i=0; i<2; i++) f = f->next;
      Params* param = f->params;
      int expoente = f->qParams - 1;
      while (param) {
          retorno += param->param * pow(potential, expoente);
          expoente--;
          param = param->next;
      }
    }
  }
  // Return
  else {
    // First back function, polynomial of order 2
    if (potential > xa && potential < xd) {
      for(int i=0; i<1; i++) f = f->next;
      Params* param = f->params;
      int expoente = f->qParams - 1;
      while (param) {
          retorno += param->param * pow(potential, expoente);
          expoente--;
          param = param->next;
      }
    }
    // Second back function, order 3 polynomial
    else if (potential >= xd) {
      Params* param = f->params;
      int expoente = f->qParams - 1;
      while (param) {
          retorno += param->param * pow(potential, expoente);
          expoente--;
          param = param->next;
      }
    }
  }

  // Noise calculation
  retorno = applyNoise(retorno);

  return retorno;

}

//
Functions functionGenerator(
  float xo, float xf
) {
  Points* points = nullptr;
  Function* functions = nullptr;
  
  float b_ab = (xf - xo);
  float h_ab = b_ab / (3.0 + 2*currentCycle); 
  float b_ac = b_ab * (2.0 / 3.0); 
  float h_ac = 2.0 * ( h_ab ); 
  float b_cb = b_ab / 3.0; 
  float h_cb = h_ab; 
  float b_ad = b_cb; 
  float h_ad = 5.0 * h_ac / ( 5.0 + currentCycle) ; 
  float b_db = b_ac; 
  float h_db = 2.0 * h_ab; 

  Coord A = { xo , 0 };
  Coord B = { xo+b_ab , (b_ab/5.0) };
  Coord C = { xo+b_ac , h_ac };
  Coord D = { xo+b_ad , -h_ad };

  Coord pointsArray[4] = {A, B, C, D};
  for (int i = 0; i < 4; i++) {
      Points* novo = new Points{nullptr, points, pointsArray[i]};
      if (points) points->prev = novo;
      points = novo;
  }

  // First Function
  Coord AB1 = { 0 , 0 };
  Coord AB2 = { 0 , 0 };
  AB1.x = A.x + b_ac / 4.0;
  AB1.y = A.y + (h_ac / (4.0 + currentCycle));
  AB2.x = A.x + 3.0 * (b_ac / 4.0);
  AB2.y = A.y + 2.0 * (h_ac / 2.0);
  
  Coord extraPoints1[2] = {AB1, AB2};
  for (int i = 0; i < 2; i++) {
      Points* novo = new Points{nullptr, points, extraPoints1[i]};
      if (points) points->prev = novo;
      points = novo;
  }

  float mat0[4][5]={
    {pow(A.x, 3), pow(A.x, 2), A.x, 1.0, A.y},
    {pow(C.x, 3), pow(C.x, 2), C.x, 1.0, C.y},
    {pow(AB1.x, 3),pow(AB1.x, 2), AB1.x, 1.0, AB1.y},
    {pow(AB2.x, 3), pow(AB2.x, 2), AB2.x, 1.0, AB2.y}
  };
  float* ptrMat0 = &mat0[0][0];
  normalizeMatrix(ptrMat0, 4);
  float* solution0 = gaussElimination(ptrMat0, 4);
  addFunction(&functions, solution0, 4);

  // Second Function
  Coord CB = { 0 , 0 };
  CB.x = C.x + b_cb / 3.0;
  CB.y = C.y - 2.0 * (h_cb / 3.0);
  
  Points* novo = new Points{nullptr, points, CB};
  if (points) points->prev = novo;
  points = novo;

  float mat1[3][4] = {
      {pow(C.x, 2), C.x, 1.0, C.y},
      {pow(B.x, 2), B.x, 1.0, B.y},
      {pow(CB.x, 2), CB.x, 1.0, CB.y}
  };
  float* ptrMat1 = &mat1[0][0];
  normalizeMatrix(ptrMat1, 3);
  float* solution1 = gaussElimination(ptrMat1, 3);
  addFunction(&functions, solution1, 3);

  // Third Function
  Coord DA = { 0 , 0 };
  DA.x = A.x + (b_ad / 3.0);
  DA.y = A.y - (h_ad / (5.0));
  
  novo = new Points{nullptr, points, DA};
  if (points) points->prev = novo;
  points = novo;

  float mat2[3][4] = {
      {pow(A.x, 2), A.x, 1.0, A.y},
      {pow(D.x, 2), D.x, 1.0, D.y},
      {pow(DA.x, 2), DA.x, 1.0, DA.y}
  };
  float* ptrMat2 = &mat2[0][0];
  normalizeMatrix(ptrMat2, 3);
  float* solution2 = gaussElimination(ptrMat2, 3);
  addFunction(&functions, solution2, 3);

  // Fourth Function
  Coord BD1 = { 0 , 0 };
  Coord BD2 = { 0 , 0 };
  BD1.x = D.x + b_db / 5.0;
  BD1.y = D.y + 4.0 * (h_db / 11.0);
  BD2.x = D.x + 2.0 * (b_db / 3.0);
  BD2.y = D.y + 8.0 * (h_db / 10.0);
  
  Coord extraPoints2[2] = {BD1, BD2};
  for (int i = 0; i < 2; i++) {
      Points* novo = new Points{nullptr, points, extraPoints2[i]};
      if (points) points->prev = novo;
      points = novo;
  }

  float mat3[4][5] = {
      {pow(D.x, 3), pow(D.x, 2), D.x, 1.0, D.y},
      {pow(B.x, 3), pow(B.x, 2), B.x, 1.0, B.y},
      {pow(BD1.x, 3),pow(BD1.x, 2), BD1.x, 1.0, BD1.y},
      {pow(BD2.x, 3), pow(BD2.x, 2), BD2.x, 1.0, BD2.y}
  };
  float* ptrMat3 = &mat3[0][0];
  normalizeMatrix(ptrMat3, 4);
  float* solution3 = gaussElimination(ptrMat3, 4);
  addFunction(&functions, solution3, 4);    
  
  return {functions, points};
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
    static float solution[10]; 

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

// for 4x4, N=4
void printFunction(Functions functions) {

  Serial.println("Estrutura gerada:");
  Points* p = functions.points;
  while (p) {
      Serial.print("(");
      Serial.print(p->coord.x,4);
      Serial.print(", ");
      Serial.print(p->coord.y,4);
      Serial.print(") ");
      Serial.println();
      p = p->next;
  }
  Serial.println();
  Function* f = functions.functions;
  while (f) {
      Params* param = f->params;
      int expoente = f->qParams - 1;
      Serial.print("Funcao: ");
      while (param) {
          Serial.print(param->param,10);
          Serial.print("x^");
          Serial.print(expoente);
          if(expoente > 0) 
            Serial.print(" + ");  
          else
            Serial.print(" ");
          expoente--;
          param = param->next;
      }
      Serial.println();
      f = f->next; 
  }
  Serial.println();
}

//
void addFunction(Function** functions, float solution[], int order) {
 
  Function* novaFuncao = new Function{nullptr, order, *functions};
  Params* paramHead = nullptr;

  for (int j = order-1; j >= 0; j--) {
    Params* novoParam = new Params{nullptr, paramHead, solution[j]};
    if (paramHead) paramHead->prev = novoParam;
    paramHead = novoParam;
  }
  novaFuncao->params = paramHead;
  *functions = novaFuncao;
}

// Function that applies noise to the number n
float applyNoise(float number) {
  // Generates a random number between -kNoise * n and +kNoise * n
  //float ruido = ((float)rand() / RAND_MAX) * (2 * kNoise * number) - (kNoise * number);
  float ruido = ((float)rand() / RAND_MAX) * 2 * kNoise - kNoise;
  // Add the noise to the number n and return the result
  return number + ruido;
}

void freeFunctions(Functions& funcs) {
    Points* currentPoint = funcs.points;
    while (currentPoint) {
        Points* temp = currentPoint;
        currentPoint = currentPoint->next;
        delete temp;
    }

    Function* currentFunction = funcs.functions;
    while (currentFunction) {
      
        Params* currentParam = currentFunction->params;
        while (currentParam) {
            Params* temp = currentParam;
            currentParam = currentParam->next;
            delete temp;
        }

        Function* temp = currentFunction;
        currentFunction = currentFunction->next;
        delete temp;
    }

    funcs.points = nullptr;
    funcs.functions = nullptr;
}