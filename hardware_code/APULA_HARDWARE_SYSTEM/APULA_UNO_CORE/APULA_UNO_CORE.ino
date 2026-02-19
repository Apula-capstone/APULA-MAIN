#if defined(ARDUINO_AVR_UNO) || defined(__AVR_ATmega328P__)

#include <Servo.h> 
 
 // -------- FLAME SENSORS -------- 
 const int flame1 = 2; 
 const int flame2 = 3; 
 
 // -------- SERVOS -------- 
 const int servo1Pin = 9;       // Scanning Servo 1 
 const int servo2Pin = 10;      // Scanning Servo 2 
 const int hoseServoPin = 11;   // MG995 hose servo 
 
 // -------- RELAY & LEDs -------- 
 const int relayPin = 6;        // Water pump relay 
 const int greenLED = 7;        // No fire 
 const int redLED = 8;          // Fire indicator 
 const int buzzerPin = 5;       // Loud Panic Alarm
 
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
   digitalWrite(greenLED, HIGH); // Green LED ON at start 
   digitalWrite(redLED, LOW); 
   digitalWrite(buzzerPin, LOW); 
 
   servo1.attach(servo1Pin); 
   servo2.attach(servo2Pin); 
   hoseServo.attach(hoseServoPin); 
 
   Serial.begin(115200); // MODIFIED: 115200 for ESP32 compatibility
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
     // ADDED: Signal for Website Alarm
     Serial.println("SENSORS:FIRE_DETECTED"); 
     
     // IMMEDIATE LOUD ALARM (Panic Mode)
     digitalWrite(buzzerPin, HIGH);
     
     Serial.print("Fire detected at angle: "); 
     Serial.println(fireAngle); 

     // Turn off green LED 
     digitalWrite(greenLED, LOW); 

     // Start blinking red LED while spraying water 
     unsigned long startTime = millis(); 
     digitalWrite(relayPin, HIGH);   // Turn ON pump 

     // Smoothly move MG995 to INVERTED fire angle 
     int invertedAngle = 180 - fireAngle; // Invert direction 

     int currentHose = hoseServo.read(); 
     int step = (invertedAngle > currentHose) ? 1 : -1; 

     while(currentHose != invertedAngle) 
     { 
       currentHose += step; 
       hoseServo.write(currentHose); 
       delay(10); // Adjust speed here 
     } 

     // Keep spraying for 5 seconds while blinking red LED and pulsing Alarm
     // 5 seconds of aggressive alarm (100ms ON/OFF)
     while(millis() - startTime < 5000) 
     { 
       digitalWrite(redLED, HIGH); 
       digitalWrite(buzzerPin, HIGH); // Alarm ON
       delay(100); 
       digitalWrite(redLED, LOW); 
       digitalWrite(buzzerPin, LOW);  // Alarm OFF
       delay(100); 
     } 

     digitalWrite(relayPin, LOW);    // Turn OFF pump 
     digitalWrite(greenLED, HIGH);   // Green LED back ON 
     digitalWrite(buzzerPin, LOW);   // Ensure alarm is OFF
     
     // ADDED: Reset Signal for Website
     Serial.println("SENSORS:SAFE"); 
   } 
 }

#endif
