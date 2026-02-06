// ======================================================
// APULA FIRE PREVENTION - ARDUINO UNO + SIM800L MODULE
// ======================================================
// Features: 
// 1. Real-time Analog Sensor Reading (A0, A1, A2)
// 2. Automated SMS Alerts via SIM800L
// 3. Automated Voice Call via SIM800L
// 4. Serial Telemetry for Dashboard Graphing
// 5. Local Buzzer Alarm

#include <SoftwareSerial.h>

// PIN CONFIGURATION
const int FLAME_ALPHA = A0; 
const int FLAME_BETA  = A1; 
const int FLAME_GAMMA = A2; 
const int BUZZER_PIN  = 5;
const int STATUS_LED  = 13;

// SIM800L PINS
const int SIM_TX = 2; // Connect to SIM800L RX
const int SIM_RX = 3; // Connect to SIM800L TX

SoftwareSerial sim800l(SIM_RX, SIM_TX);

// SETTINGS
const int FIRE_THRESHOLD = 500; // Analog value below this triggers alarm
String EMERGENCY_PHONE = "+1234567890"; // Change via Serial or hardcode
bool smsSent = false;

void setup() {
  Serial.begin(115200); // Higher baud for dashboard sync
  sim800l.begin(9600);
  
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  
  Serial.println("SYSTEM_START: INITIALIZING SIM800L...");
  delay(1000);
  
  // Initialize SIM800L
  sim800l.println("AT");
  delay(500);
  sim800l.println("AT+CMGF=1"); // Set SMS to Text Mode
  delay(500);
  
  Serial.println("SYSTEM_READY: MONITORING SENSORS");
}

void loop() {
  int s1 = analogRead(FLAME_ALPHA);
  int s2 = analogRead(FLAME_BETA);
  int s3 = analogRead(FLAME_GAMMA);

  // Check for Fire Condition
  bool fireDetected = (s1 < FIRE_THRESHOLD || s2 < FIRE_THRESHOLD || s3 < FIRE_THRESHOLD);

  if (fireDetected) {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(STATUS_LED, HIGH);
    
    // Send SMS and Call if not already sent for this incident
    if (!smsSent) {
      Serial.println("SIM800L:TRIGGER_ALARM");
      sendSMS("ALERT: FIRE DETECTED! APULA System has triggered an emergency alarm.");
      makeCall(); // Call the emergency number
      smsSent = true;
    }
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(STATUS_LED, LOW);
    smsSent = false; // Reset SMS flag when safe
  }

  // Send to Serial for Dashboard Real-time Graphing
  // Format: SENSORS:s1,s2,s3
  Serial.print("SENSORS:");
  Serial.print(s1);
  Serial.print(",");
  Serial.print(s2);
  Serial.print(",");
  Serial.println(s3);

  // Handle Serial Commands (e.g., update phone number or manual trigger)
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd.startsWith("PHONE:")) {
      EMERGENCY_PHONE = cmd.substring(6);
      Serial.print("CONFIG:PHONE_UPDATED:");
      Serial.println(EMERGENCY_PHONE);
    } else if (cmd == "TEST_PANIC") {
      // Manual trigger from Dashboard Simulation button
      Serial.println("SIM800L:TEST_TRIGGER");
      sendSMS("TEST ALERT: APULA System manual simulation triggered.");
      makeCall();
    }
  }

  delay(100); 
}

void sendSMS(String message) {
  Serial.print("SIM800L:SENDING_SMS_TO:");
  Serial.println(EMERGENCY_PHONE);
  
  sim800l.println("AT+CMGF=1"); // SMS text mode
  delay(200);
  sim800l.print("AT+CMGS=\"");
  sim800l.print(EMERGENCY_PHONE);
  sim800l.println("\"");
  delay(200);
  sim800l.print(message);
  delay(200);
  sim800l.write(26); // CTRL+Z
  delay(1000);
  Serial.println("SIM800L:SMS_DISPATCHED");
}

void makeCall() {
  Serial.print("SIM800L:CALLING:");
  Serial.println(EMERGENCY_PHONE);
  
  sim800l.println("ATD" + EMERGENCY_PHONE + ";"); // Dial number
  // The call will continue in the background
}
