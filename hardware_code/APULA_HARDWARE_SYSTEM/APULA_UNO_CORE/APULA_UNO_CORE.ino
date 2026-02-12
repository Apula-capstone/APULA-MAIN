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
SoftwareSerial sim800(12, 13); // RX, TX (using pins from provided code)

// Replace with your phone number
String phoneNumber = "+639619113527";

// ================= FLAME SENSORS =================
// Using pins from provided code
const int flame1 = 2; 
const int flame2 = 3;
const int flame3 = 4;

// ================= LED & BUZZER =================
const int redLED = 7;
const int greenLED = 6;
const int buzzer = 8;

// ================= SERVOS =================
Servo servo1, servo2, servo3;
const int servoPin1 = 9;
const int servoPin2 = 10;
const int servoPin3 = 11;

int angle1 = 0, angle2 = 0, angle3 = 0;
int dir1 = 1, dir2 = 1, dir3 = 1;

bool fireDetected = false;
bool callMade = false;

unsigned long previousServoMillis = 0;
const long servoInterval = 7;

// For Serial communication with Web/App
unsigned long lastBroadcast = 0;

void setup() {
  Serial.begin(115200); // Higher baud for ESP32/Web sync
  sim800.begin(9600);

  pinMode(flame1, INPUT);
  pinMode(flame2, INPUT);
  pinMode(flame3, INPUT);

  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(buzzer, OUTPUT);

  servo1.attach(servoPin1);
  servo2.attach(servoPin2);
  servo3.attach(servoPin3);

  Serial.println("SYSTEM_START: INITIALIZING...");
  delay(3000); // Wait for SIM800L network
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
    callMade = false; // reset call when fire is gone
  }
  else {
    // Fire state
    digitalWrite(redLED, LOW);
    digitalWrite(greenLED, HIGH);

    // LOUD continuous buzzer
    digitalWrite(buzzer, HIGH);

    // Make call only once
    if (!callMade) {
      makeCall();
      callMade = true;
    }
  }
}

// ================= SIM800 CALL FUNCTION =================
void makeCall() {
  Serial.print("GSM:CALLING:");
  Serial.println(phoneNumber);
  
  sim800.println("AT");
  delay(1000);

  sim800.print("ATD");
  sim800.print(phoneNumber);
  sim800.println(";");
  
  // Note: delay(20000) blocks the system. 
  // Keeping it as requested, but system won't scan/detect until done.
  delay(20000); 

  sim800.println("ATH"); // Hang up
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
      phoneNumber = cmd.substring(6);
      Serial.print("CONFIG:PHONE_UPDATED:");
      Serial.println(phoneNumber);
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
