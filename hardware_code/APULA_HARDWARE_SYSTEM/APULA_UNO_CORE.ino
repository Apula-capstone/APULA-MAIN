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
const int FLAME_ALPHA = A0; 
const int FLAME_BETA  = A1; 
const int FLAME_GAMMA = A2; 
const int BUZZER_PIN  = 5;
const int STATUS_LED  = 13;
const int GREEN_LED   = 8;
const int RED_LED     = 9;

// SERVO PINS
const int SCAN_SERVO_PIN  = 10;
const int PUMP_SERVO_1_PIN = 11;
const int PUMP_SERVO_2_PIN = 12;

// SIM800L PINS
const int SIM_TX = 2; 
const int SIM_RX = 3; 

// OBJECTS
SoftwareSerial sim800l(SIM_RX, SIM_TX);
Servo scanServo;
Servo pumpServo1;
Servo pumpServo2;

// SETTINGS & GLOBALS
const int FIRE_THRESHOLD = 500; 
String EMERGENCY_PHONE = "+1234567890"; 
bool smsSent = false;
bool fireActive = false;
int scanAngle = 0;
int scanStep = 1;

void setup() {
  Serial.begin(115200); 
  sim800l.begin(9600);
  
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  
  initServos();
  
  Serial.println("SYSTEM_START: INITIALIZING SIM800L...");
  delay(1000);
  
  initGSM();
  
  Serial.println("SYSTEM_READY: MONITORING SENSORS");
}

void loop() {
  handleSensors(); 
  handleServos();  
  handleSerialCommands(); 
  delay(20); 
}

void handleSerialCommands() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd.startsWith("PHONE:")) {
      EMERGENCY_PHONE = cmd.substring(6);
      Serial.print("CONFIG:PHONE_UPDATED:");
      Serial.println(EMERGENCY_PHONE);
    } else if (cmd == "TEST_PANIC") {
      Serial.println("SIM800L:TEST_TRIGGER");
      sendSMS("TEST ALERT: APULA System manual simulation triggered.");
      makeCall();
    }
  }
}
