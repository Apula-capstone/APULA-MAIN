#include <Servo.h> 
 
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
 
   Serial.begin(9600); 
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
     Serial.print("Fire detected at angle: "); 
     Serial.println(fireAngle); 
 
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
 }