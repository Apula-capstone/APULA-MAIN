#if defined(ARDUINO_AVR_UNO) || defined(__AVR_ATmega328P__)

// ======================================================
// CONFIGURATION FOR ARDUINO UNO (SENSORS)
// ======================================================
// This code is for the Main Sensor Arduino ONLY.
// It detects fire, controls servos, and activates the pump/alarm.
// ======================================================

#include <Servo.h> 
#include <SoftwareSerial.h>

// -------- ESP32-CAM COMMUNICATION --------
// We use SoftwareSerial to talk to the ESP32-CAM
// Arduino Pin 4 (RX) -> ESP32 Pin U0T (TX)
// Arduino Pin 5 (TX) -> ESP32 Pin U0R (RX)
// GND -> GND
SoftwareSerial espSerial(4, 5); // RX, TX

// -------- FLAME SENSORS -------- 
const int flame1 = 2; 
const int flame2 = 3; 

// -------- SERVOS -------- 
const int servo1Pin = 9; 
const int servo2Pin = 10; 
const int hoseServoPin = 11; 

// -------- RELAY & LEDs -------- 
const int relayPin = 6; 
const int greenLED = 7; 
const int redLED = 8; 

// -------- BUZZER -------- 
const int buzzerPin = 12; 

Servo servo1; 
Servo servo2; 
Servo hoseServo; 

int pos = 0; 
int fireAngle = 90; 
bool fireDetected = false; 

void setup() 
{ 
  pinMode(flame1, INPUT); 
  pinMode(flame2, INPUT); 
  pinMode(relayPin, OUTPUT); 
  pinMode(greenLED, OUTPUT); 
  pinMode(redLED, OUTPUT); 
  pinMode(buzzerPin, OUTPUT); 

  digitalWrite(relayPin, LOW); 
  digitalWrite(greenLED, HIGH); 
  digitalWrite(redLED, LOW); 
  digitalWrite(buzzerPin, LOW); 

  servo1.attach(servo1Pin); 
  servo2.attach(servo2Pin); 
  hoseServo.attach(hoseServoPin); 

  // Debugging Serial (USB to PC)
  Serial.begin(9600); 
  
  // ESP32 Communication Serial
  espSerial.begin(9600);
  
  Serial.println("ARDUINO 1 (SENSORS) READY");
} 

void loop() 
{ 
  fireDetected = false; 

  // -------- SCAN LEFT TO RIGHT -------- 
  for(pos = 0; pos <= 180; pos++) 
  { 
    servo1.write(pos); 
    servo2.write(pos); 
    delay(20); 

    if(digitalRead(flame1) == LOW || digitalRead(flame2) == LOW) 
    { 
      fireDetected = true; 
      fireAngle = pos; 
      break; 
    } 
  } 

  // -------- SCAN RIGHT TO LEFT -------- 
  for(pos = 180; pos >= 0 && fireDetected == false; pos--) 
  { 
    servo1.write(pos); 
    servo2.write(pos); 
    delay(20); 

    if(digitalRead(flame1) == LOW || digitalRead(flame2) == LOW) 
    { 
      fireDetected = true; 
      fireAngle = pos; 
      break; 
    } 
  } 

  // -------- FIRE DETECTED -------- 
  if(fireDetected) 
  { 
    // Send to BOTH Serial (USB) and SoftwareSerial (ESP32)
    Serial.println("SENSORS:FIRE_DETECTED"); 
    espSerial.println("SENSORS:FIRE_DETECTED");
    
    digitalWrite(greenLED, LOW); 
    digitalWrite(relayPin, HIGH); 

    int invertedAngle = 180 - fireAngle; 
    int currentHose = hoseServo.read(); 
    int step = (invertedAngle > currentHose) ? 1 : -1; 

    while(currentHose != invertedAngle) 
    { 
      currentHose += step; 
      hoseServo.write(currentHose); 
      delay(10); 
    } 

    unsigned long startTime = millis(); 

    // -------- SPRAYING + LOUD ALARM -------- 
    while(millis() - startTime < 5000) 
    { 
      digitalWrite(redLED, HIGH); 
      tone(buzzerPin, 3000);   // 🔊 Louder-perceived alarm 
      delay(250); 

      digitalWrite(redLED, LOW); 
      noTone(buzzerPin); 
      delay(250); 
    } 

    digitalWrite(relayPin, LOW); 
    digitalWrite(greenLED, HIGH); 
    noTone(buzzerPin); 
  } 
  else
  {
    // NO FIRE DETECTED
    Serial.println("SENSORS:SAFE");
    espSerial.println("SENSORS:SAFE");
  }
} 
#endif
