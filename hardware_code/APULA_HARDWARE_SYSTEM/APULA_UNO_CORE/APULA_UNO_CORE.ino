// ======================================================
// APULA FIRE PREVENTION - ARDUINO UNO CORE (MAIN)
// ======================================================
// !!! IMPORTANT UPLOAD NOTE !!!
// Since the ESP32 is connected to Pins 0 (RX) and 1 (TX):
// 1. UNPLUG the RX and TX wires from the Arduino before clicking Upload.
// 2. PLUG THEM BACK IN after the IDE says "Done Uploading".
// ======================================================

#include <SoftwareSerial.h>
#include <Servo.h>

// PIN CONFIGURATION
const int FLAME_APOLAKI = A0; 
const int FLAME_KANLAON = A1; 
const int BUZZER_PIN  = 5;
const int PUMP_PIN    = 6; // Water Pump Relay/Transistor
const int STATUS_LED  = 13;
const int GREEN_LED   = 8;
const int RED_LED     = 9;

// SERVO PINS
const int HORIZONTAL_SERVO_PIN = 10;
const int VERTICAL_SERVO_PIN   = 11;
const int HOSE_SERVO_PIN       = 12;

// SIM800L PINS
const int SIM_TX = 2; 
const int SIM_RX = 3; 

// OBJECTS
SoftwareSerial sim800l(SIM_RX, SIM_TX);
Servo horizontalServo;
Servo verticalServo;
Servo hoseServo;

// SETTINGS & GLOBALS
const int FIRE_THRESHOLD = 500; 
String EMERGENCY_PHONE = "+1234567890"; 
bool smsSent = false;
bool fireActive = false;
bool pumpActive = false;

// Scan logic
int scanAngle = 0;
int scanStep = 2;
unsigned long lastScanUpdate = 0;
const int SCAN_INTERVAL = 30; // ms

void setup() {
  Serial.begin(115200); 
  sim800l.begin(9600);
  
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  
  digitalWrite(PUMP_PIN, LOW); // Ensure pump is OFF
  
  initServos();
  
  Serial.println("SYSTEM_START: INITIALIZING SIM800L...");
  delay(1000);
  
  initGSM();
  
  Serial.println("SYSTEM_READY: MONITORING SENSORS");
}

void loop() {
  handleSensors(); 
  handleScanning();  
  handleFirefighting();
  handleSerialCommands(); 
  delay(10); 
}

void initServos() {
  horizontalServo.attach(HORIZONTAL_SERVO_PIN);
  verticalServo.attach(VERTICAL_SERVO_PIN);
  hoseServo.attach(HOSE_SERVO_PIN);
  
  horizontalServo.write(90);
  verticalServo.write(90);
  hoseServo.write(90);
  delay(500);
}

void handleScanning() {
  if (fireActive) return; // Stop scanning when fire detected

  if (millis() - lastScanUpdate > SCAN_INTERVAL) {
    lastScanUpdate = millis();
    
    scanAngle += scanStep;
    if (scanAngle >= 160 || scanAngle <= 20) {
      scanStep = -scanStep;
    }
    
    horizontalServo.write(scanAngle);
    verticalServo.write(90);
    hoseServo.write(scanAngle); // Synchronize hose with scan for readiness
  }
}

void handleFirefighting() {
  if (fireActive) {
    // Fire detected logic
    digitalWrite(PUMP_PIN, HIGH);
    pumpActive = true;
    
    // Position hose servo to detected area (approximate based on scanAngle)
    hoseServo.write(scanAngle);
  } else {
    digitalWrite(PUMP_PIN, LOW);
    pumpActive = false;
  }
}

void handleSensors() {
  int valA = analogRead(FLAME_APOLAKI);
  int valB = analogRead(FLAME_KANLAON);
  
  // Fire detected if any sensor goes below threshold (Active LOW)
  bool detected = (valA < FIRE_THRESHOLD || valB < FIRE_THRESHOLD);
  
  if (detected) {
    if (!fireActive) {
      fireActive = true;
      digitalWrite(RED_LED, HIGH);
      digitalWrite(GREEN_LED, LOW);
      digitalWrite(BUZZER_PIN, HIGH);
      
      // Notify ESP32 -> Web/App
      Serial.println("SENSORS:FIRE_DETECTED"); 
      Serial.println("PUMP:ACTIVE");
      
      if (!smsSent) {
        sendSMS("🔥 EMERGENCY: Fire detected! Water Pump Activated. Location: MAIN_UNIT");
        makeCall();
        smsSent = true;
      }
    }
  } else {
    if (fireActive) {
      fireActive = false;
      smsSent = false;
      digitalWrite(RED_LED, LOW);
      digitalWrite(GREEN_LED, HIGH);
      digitalWrite(BUZZER_PIN, LOW);
      Serial.println("SENSORS:SAFE");
      Serial.println("PUMP:OFF");
    }
  }

  // Periodic sensor data broadcast for dashboard graph
  static unsigned long lastBroadcast = 0;
  if (millis() - lastBroadcast > 500) {
    lastBroadcast = millis();
    Serial.print("SENSORS:");
    Serial.print(valA);
    Serial.print(",");
    Serial.print(valB);
    Serial.print(",");
    Serial.println(pumpActive ? "1" : "0"); // Send pump status
  }
}

void handleSerialCommands() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    
    if (cmd.startsWith("PHONE:")) {
      EMERGENCY_PHONE = cmd.substring(6);
      Serial.print("CONFIG:PHONE_UPDATED:");
      Serial.println(EMERGENCY_PHONE);
    } else if (cmd.startsWith("SERVO:")) {
      // Format: SERVO:H:90, SERVO:V:90, or SERVO:X:90 (Hose)
      int firstColon = cmd.indexOf(':');
      int secondColon = cmd.indexOf(':', firstColon + 1);
      if (secondColon != -1) {
        char axis = cmd.charAt(firstColon + 1);
        int pos = cmd.substring(secondColon + 1).toInt();
        pos = constrain(pos, 20, 160);
        
        if (axis == 'H') {
          horizontalServo.write(pos);
          scanAngle = pos; 
        } else if (axis == 'V') {
          verticalServo.write(pos);
        } else if (axis == 'X') {
          hoseServo.write(pos);
        }
      }
    } else if (cmd == "PUMP_ON") {
      digitalWrite(PUMP_PIN, HIGH);
      pumpActive = true;
      Serial.println("PUMP:MANUAL_ON");
    } else if (cmd == "PUMP_OFF") {
      digitalWrite(PUMP_PIN, LOW);
      pumpActive = false;
      Serial.println("PUMP:MANUAL_OFF");
    } else if (cmd == "TEST_PANIC") {
      fireActive = true; // Force fire state for simulation
      Serial.println("SENSORS:FIRE_DETECTED");
      sendSMS("TEST ALERT: APULA System manual simulation triggered.");
      makeCall();
    } else if (cmd == "RESET") {
      fireActive = false;
      smsSent = false;
      Serial.println("SENSORS:SAFE");
    }
  }
}

void initGSM() {
  sim800l.println("AT");
  delay(500);
  sim800l.println("AT+CMGF=1"); // SMS Text Mode
  delay(500);
}

void sendSMS(String msg) {
  Serial.print("GSM:SENDING_SMS:");
  Serial.println(EMERGENCY_PHONE);
  
  sim800l.print("AT+CMGS=\"");
  sim800l.print(EMERGENCY_PHONE);
  sim800l.println("\"");
  delay(500);
  sim800l.print(msg);
  delay(500);
  sim800l.write(26); // CTRL+Z
  delay(1000);
}

void makeCall() {
  Serial.print("GSM:CALLING:");
  Serial.println(EMERGENCY_PHONE);
  
  sim800l.print("ATD");
  sim800l.print(EMERGENCY_PHONE);
  sim800l.println(";");
}
