#ifndef ESP32
// ======================================================
// APULA FIRE PREVENTION - ARDUINO UNO CORE (MAIN)
// ======================================================
// !!! IMPORTANT UPLOAD NOTE !!!
// Since the ESP32 is connected to Pins 0 (RX) and 1 (TX):
// 1. UNPLUG the RX and TX wires from the Arduino before clicking Upload.
// 2. PLUG THEM BACK IN after the IDE says "Done Uploading".
// ======================================================

#include <Servo.h>
#include <SoftwareSerial.h>

// ================= SIM800L =================
// ================= SIM800L =================
// Using Pins 12 (RX) and 13 (TX) as per your hardware connection
SoftwareSerial sim800(12, 13); 

// Replace with your phone numbers
String phoneNumber1 = "+639619113527";
String phoneNumber2 = "+639511135809";
String phoneNumber3 = "+639691640225";

// ================= FLAME SENSORS =================
const int flame1 = 2; 
const int flame2 = 3;
const int flame3 = 4;

// ================= LED & BUZZER =================
const int redLED = 7;
const int greenLED = 6; // Moved to Pin 6 to avoid conflict with Pin 12
const int buzzer = 8;

// ================= SERVOS =================
Servo servo1, servo2, servo3;
const int servoPin1 = 9;
const int servoPin2 = 10; // Moved back to digital pins
const int servoPin3 = 11; // Moved back to digital pins

// ================= WATER PUMP =================
const int pumpPin = 5; 

int angle1 = 0, angle2 = 0, angle3 = 0;
int dir1 = 1, dir2 = 1, dir3 = 1;

bool fireDetected = false;
bool callMade = false;

unsigned long previousServoMillis = 0;
const long servoInterval = 7;

// For Serial communication with Web/App
unsigned long lastBroadcast = 0;

void setup() {
  Serial.begin(115200); 
  sim800.begin(9600); // Most SIM800L default to 9600 or autobaud

  pinMode(flame1, INPUT);
  pinMode(flame2, INPUT);
  pinMode(flame3, INPUT);

  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(buzzer, OUTPUT);
  pinMode(pumpPin, OUTPUT);

  servo1.attach(servoPin1);
  servo2.attach(servoPin2);
  servo3.attach(servoPin3);

  Serial.println("SYSTEM_START: INITIALIZING...");
  
  // Sync SIM800L Baud Rate (Send AT several times)
  for(int i=0; i<10; i++) {
    sim800.print("AT\r");
    delay(200);
  }
  
  sim800.print("ATE0\r"); 
  delay(200);
  sim800.print("AT+IPR=9600\r"); // Force 9600 baud rate
  delay(200);
  sim800.print("AT+CPIN?\r"); 
  delay(200);
  debugSIM800();
  
  delay(1500); 
  Serial.println("SYSTEM_READY: MONITORING SENSORS");
}

void loop() {
  checkFire();
  updateServos();
  updateAlarm();
  handleSerialCommands(); // Maintain web connectivity
  broadcastStatus();      // Maintain web connectivity
}

// ================= CHECK FIRE =================
void checkFire() {
  // Provided logic (Active LOW)
  bool detected = (digitalRead(flame1) == LOW) || 
                  (digitalRead(flame2) == LOW) || 
                  (digitalRead(flame3) == LOW);
                  
  if (detected && !fireDetected) {
    // Just detected
    Serial.println("SENSORS:FIRE_DETECTED");
  } else if (!detected && fireDetected) {
    // Just cleared
    Serial.println("SENSORS:SAFE");
  }
  
  fireDetected = detected;
}

// ================= SERVO SCANNING =================
void updateServos() {
  if (!fireDetected) {
    unsigned long currentMillis = millis();
    if (currentMillis - previousServoMillis >= servoInterval) {
      previousServoMillis = currentMillis;

      angle1 += dir1;
      if (angle1 >= 180) dir1 = -1;
      if (angle1 <= 0) dir1 = 1;
      servo1.write(angle1);

      angle2 += dir2;
      if (angle2 >= 180) dir2 = -1;
      if (angle2 <= 0) dir2 = 1;
      servo2.write(angle2);

      angle3 += dir3;
      if (angle3 >= 180) dir3 = -1;
      if (angle3 <= 0) dir3 = 1;
      servo3.write(angle3);
    }
  }
}

// ================= ALARM SYSTEM =================
void updateAlarm() {
  if (!fireDetected) {
    // Normal state: Green LED ON, Red OFF (Based on logic in provided code, though labeled Red/Green pins might vary)
    digitalWrite(redLED, HIGH); 
    digitalWrite(greenLED, LOW); 
    digitalWrite(buzzer, LOW); 
    digitalWrite(pumpPin, LOW); // Ensure pump is OFF
    callMade = false; // reset call when fire is gone
  }
  else {
    // Fire state
    digitalWrite(redLED, LOW);
    digitalWrite(greenLED, HIGH);

    // LOUD continuous buzzer and Pump ON
    digitalWrite(buzzer, HIGH);
    digitalWrite(pumpPin, HIGH); // Activate pump system

    // Send Alerts only once
    if (!callMade) {
      sendSMS(phoneNumber1, "FIRE DETECTED! APULA system has activated the water pump.");
      sendSMS(phoneNumber2, "FIRE DETECTED! APULA system has activated the water pump.");
      sendSMS(phoneNumber3, "FIRE DETECTED! APULA system has activated the water pump.");
      makeCall();
      callMade = true;
    }
  }
}

// ================= SIM800 SMS FUNCTION =================
void sendSMS(String number, String text) {
  Serial.print("GSM:SENDING_SMS_TO:");
  Serial.println(number);

  sim800.print("AT+CMGF=1\r"); // Set to text mode
  delay(500);
  sim800.print("AT+CMGS=\"");
  sim800.print(number);
  sim800.print("\"\r");
  delay(500);
  sim800.print(text);
  delay(100);
  sim800.write(26); // ASCII code for CTRL+Z to send
  delay(1000); // Lessened from 3000
  debugSIM800();
  Serial.println("GSM:STATUS:SMS_SENT");
}

// ================= SIM800 CALL FUNCTION =================
void makeCall() {
  Serial.println("GSM:STATUS:STARTING_DIAL_SEQUENCE");
  
  // Clean any garbage in the buffer
  while(sim800.available()) sim800.read();

  // 1. Force Wake Up & Sync
  for(int i=0; i<2; i++) { // Lessened from 3
    sim800.print("AT\r");
    delay(200); // Lessened from 500
    debugSIM800();
  }

  // 2. Check Network Registration (Critical)
  sim800.print("AT+CREG?\r");
  delay(500); // Lessened from 1000
  debugSIM800();

  // 3. Set to Full Functionality
  sim800.print("AT+CFUN=1\r");
  delay(500); // Lessened from 1000
  debugSIM800();

  // --- CALL FIRST NUMBER ---
  Serial.print("GSM:DIALING_1:");
  Serial.println(phoneNumber1);
  
  sim800.print("ATD");
  sim800.print(phoneNumber1);
  sim800.print(";\r");
  
  delay(10000); // Lessened from 15000
  
  sim800.print("ATH\r"); // Hang up
  delay(1000); // Lessened from 2000
  debugSIM800();

  // --- CALL SECOND NUMBER ---
  Serial.print("GSM:DIALING_2:");
  Serial.println(phoneNumber2);
  sim800.print("ATD");
  sim800.print(phoneNumber2);
  sim800.print(";\r");
  
  delay(10000); // Lessened from 15000
  sim800.print("ATH\r"); // Hang up
  delay(500); // Lessened from 1000
  debugSIM800();

  // --- CALL THIRD NUMBER ---
  Serial.print("GSM:DIALING_3:");
  Serial.println(phoneNumber3);
  sim800.print("ATD");
  sim800.print(phoneNumber3);
  sim800.print(";\r");
  
  delay(10000); 
  sim800.print("ATH\r"); // Hang up
  delay(500);
  debugSIM800();
  
  Serial.println("GSM:STATUS:SEQUENCE_FINISHED");
}

void debugSIM800() {
  while (sim800.available()) {
    String line = sim800.readStringUntil('\n');
    line.trim();
    if (line.length() > 0) {
      Serial.print("SIM800_REPLY: ");
      Serial.println(line);
    }
  }
}

// ================= WEB COMMUNICATION =================
void broadcastStatus() {
  if (millis() - lastBroadcast > 500) {
    lastBroadcast = millis();
    
    // Read raw values for graph
    int v1 = digitalRead(flame1) == LOW ? 100 : 0;
    int v2 = digitalRead(flame2) == LOW ? 100 : 0;
    
    Serial.print("SENSORS:");
    Serial.print(v1);
    Serial.print(",");
    Serial.print(v2);
    Serial.print(",");
    Serial.println(fireDetected ? "1" : "0");
  }
}

void handleSerialCommands() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    
    if (cmd.startsWith("PHONE:")) {
      phoneNumber1 = cmd.substring(6);
      Serial.print("CONFIG:PHONE_UPDATED:");
      Serial.println(phoneNumber1);
    } else if (cmd == "TEST_PANIC") {
      fireDetected = true;
      makeCall();
    } else if (cmd == "RESET") {
      fireDetected = false;
      callMade = false;
      Serial.println("SENSORS:SAFE");
    }
  }
}
#endif
