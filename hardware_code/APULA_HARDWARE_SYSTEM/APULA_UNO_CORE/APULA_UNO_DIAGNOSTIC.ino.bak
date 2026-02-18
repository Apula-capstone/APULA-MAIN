/*
 * APULA_UNO_DIAGNOSTIC.ino
 * 
 * This sketch is for TESTING hardware connections only.
 * It will test each component one by one to help you verify wiring.
 * 
 * INSTRUCTIONS:
 * 1. Upload this code to your Arduino Uno.
 * 2. Open the Serial Monitor (Tools > Serial Monitor).
 * 3. Set baud rate to 9600.
 * 4. Follow the on-screen prompts.
 */

#include <Servo.h>
#include <SoftwareSerial.h>

// ================= PIN CONFIGURATION =================
const int servoPin = 9;         // Servo (Scanning)
const int hoseServoPin = 10;    // Servo (Water Hose)
const int pumpPin = A5;         // Water Pump Relay/MOSFET
const int buzzerPin = 6;        // Buzzer
const int simRX = 12;           // SIM800L TX -> Arduino 12
const int simTX = 13;           // SIM800L RX -> Arduino 13

// Flame Sensors (A0-A4)
const int flameSensors[] = {A0, A1, A2, A3, A4};
const int numSensors = 5;

Servo scanServo;
Servo hoseServo;
SoftwareSerial sim800(simRX, simTX);

void setup() {
  Serial.begin(9600);
  sim800.begin(9600);

  pinMode(pumpPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  
  scanServo.attach(servoPin);
  hoseServo.attach(hoseServoPin);
  
  // Initial State
  digitalWrite(pumpPin, LOW);
  digitalWrite(buzzerPin, LOW);
  scanServo.write(0);
  hoseServo.write(90);

  Serial.println("\n\n========================================");
  Serial.println("   APULA HARDWARE DIAGNOSTIC TOOL");
  Serial.println("========================================");
  Serial.println("Type '1' to Test FLAME SENSORS");
  Serial.println("Type '2' to Test SERVO (SCANNING)");
  Serial.println("Type '3' to Test SERVO (HOSE)");
  Serial.println("Type '4' to Test WATER PUMP");
  Serial.println("Type '5' to Test SIM800L (GSM)");
  Serial.println("Type '6' to Test BUZZER");
  Serial.println("========================================");
}

void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();
    
    switch (cmd) {
      case '1': testSensors(); break;
      case '2': testScanServo(); break;
      case '3': testHoseServo(); break;
      case '4': testPump(); break;
      case '5': testSIM800(); break;
      case '6': testBuzzer(); break;
    }
    
    // Clear buffer
    while(Serial.available()) Serial.read();
    
    Serial.println("\n----------------------------------------");
    Serial.println("Select another test (1-6):");
  }
}

void testSensors() {
  Serial.println("\n[TEST] Reading Flame Sensors (Press any key to stop)...");
  
  while (!Serial.available()) {
    Serial.print("Sensors: ");
    for (int i = 0; i < numSensors; i++) {
      int val = analogRead(flameSensors[i]);
      Serial.print("S");
      Serial.print(i+1);
      Serial.print(":");
      Serial.print(val); // < 500 usually means FIRE
      Serial.print("  ");
    }
    Serial.println();
    delay(500);
  }
}

void testScanServo() {
  Serial.println("\n[TEST] Scanning Servo (0 -> 160 -> 0)...");
  for (int pos = 0; pos <= 160; pos += 5) {
    scanServo.write(pos);
    delay(50);
  }
  delay(500);
  for (int pos = 160; pos >= 0; pos -= 5) {
    scanServo.write(pos);
    delay(50);
  }
  Serial.println("Done.");
}

void testHoseServo() {
  Serial.println("\n[TEST] Hose Servo (0 -> 90 -> 180 -> 90)...");
  hoseServo.write(0);
  delay(1000);
  hoseServo.write(90);
  delay(1000);
  hoseServo.write(180);
  delay(1000);
  hoseServo.write(90);
  Serial.println("Done.");
}

void testPump() {
  Serial.println("\n[TEST] Turning Pump ON for 3 seconds...");
  digitalWrite(pumpPin, HIGH);
  delay(3000);
  digitalWrite(pumpPin, LOW);
  Serial.println("Pump OFF.");
}

void testSIM800() {
  Serial.println("\n[TEST] Checking SIM800L Status...");
  sim800.println("AT");
  delay(1000);
  readSIMResponse();
  
  sim800.println("AT+CSQ"); // Signal Quality
  delay(1000);
  readSIMResponse();
  
  sim800.println("AT+CCID"); // SIM Card ID
  delay(1000);
  readSIMResponse();
  
  Serial.println("Done. (If you see 'OK', it is working)");
}

void readSIMResponse() {
  while (sim800.available()) {
    Serial.write(sim800.read());
  }
}

void testBuzzer() {
  Serial.println("\n[TEST] Beeping Buzzer...");
  for(int i=0; i<3; i++) {
    digitalWrite(buzzerPin, HIGH);
    delay(200);
    digitalWrite(buzzerPin, LOW);
    delay(200);
  }
  Serial.println("Done.");
}
