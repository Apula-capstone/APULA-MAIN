#include <Servo.h> 
 
 // -------- FLAME SENSORS -------- 
 const int flame1 = 2;  // Small servo 1 sensor 
 const int flame2 = 3;  // Small servo 2 sensor 
 
 // -------- SERVOS -------- 
 const int smallServo1Pin = 9;   // Small scanning servo 1 (upside down) 
 const int smallServo2Pin = 10;  // Small scanning servo 2 (upside down) 
 const int hoseServoPin = 11;    // MG995 hose servo (normal) 
 
 // -------- RELAY & LEDs -------- 
 const int relayPin = 6;         // Water pump relay 
 const int greenLED = 7;         // No fire 
 const int redLED = 8;           // Fire detected 
 
 Servo smallServo1; 
 Servo smallServo2; 
 Servo hoseServo; 
 
 int pos = 0; 
 bool fireDetected = false; 
 bool lastFireState = false;      // To track state changes
 unsigned long fireEndTime = 0;   // Time when fire last seen 
 const unsigned long delayAfterFire = 5000; // 5 seconds delay 
 
 // -------- FLAME SENSOR LOGIC -------- 
 // Set to true if sensor outputs LOW when detecting fire 
 const bool sensorLOWDetectsFire = true; 
 
 void setup() 
 { 
   pinMode(flame1, INPUT); 
   pinMode(flame2, INPUT); 
   pinMode(relayPin, OUTPUT); 
   pinMode(greenLED, OUTPUT); 
   pinMode(redLED, OUTPUT); 
 
   digitalWrite(relayPin, LOW); 
   digitalWrite(greenLED, HIGH); // Green LED ON at start 
   digitalWrite(redLED, LOW); 
 
   smallServo1.attach(smallServo1Pin); 
   smallServo2.attach(smallServo2Pin); 
   hoseServo.attach(hoseServoPin); 
 
   hoseServo.write(90); // Center MG995 
  Serial.begin(115200); 
  
  // Initial Status
   Serial.println("SENSORS:SAFE");
 } 
 
 bool isFire(int sensorValue) { 
   // Return true if fire is detected 
   if(sensorLOWDetectsFire) return sensorValue == LOW; 
   else return sensorValue == HIGH; 
 } 
 
 void loop() 
 { 
   fireDetected = false; 
 
   int leftSensor = digitalRead(flame1); 
   int rightSensor = digitalRead(flame2); 
 
   // -------- CHECK FIRE -------- 
   if(isFire(leftSensor) || isFire(rightSensor)) { 
     fireDetected = true; 
     fireEndTime = millis() + delayAfterFire; // Reset fire timer 
   } 
 
   // -------- SEND WEB/APP NOTIFICATION --------
   if (fireDetected != lastFireState) {
     if (fireDetected) {
       Serial.println("SENSORS:FIRE_DETECTED");
     } else {
       // Only send SAFE if pump delay is also over? 
       // Actually, fireDetected is false here, but pump might still be running.
       // However, the App alarm should probably stop when fire is gone, 
       // even if pump runs for 5 more seconds.
       Serial.println("SENSORS:SAFE");
     }
     lastFireState = fireDetected;
   }
 
   // -------- SCANNING SERVOS -------- 
   if(!fireDetected) { 
     // Only scan if no fire 
     for(pos = 0; pos <= 180; pos++) { 
       smallServo1.write(180 - pos); // Upside-down 
       smallServo2.write(180 - pos); // Upside-down 
       delay(20); 
 
       leftSensor = digitalRead(flame1); 
       rightSensor = digitalRead(flame2); 
 
       if(isFire(leftSensor) || isFire(rightSensor)) { 
         fireDetected = true; 
         fireEndTime = millis() + delayAfterFire; 
         break; 
       } 
     } 
 
     for(pos = 180; pos >= 0 && !fireDetected; pos--) { 
       smallServo1.write(180 - pos); 
       smallServo2.write(180 - pos); 
       delay(20); 
 
       leftSensor = digitalRead(flame1); 
       rightSensor = digitalRead(flame2); 
 
       if(isFire(leftSensor) || isFire(rightSensor)) { 
         fireDetected = true; 
         fireEndTime = millis() + delayAfterFire; 
         break; 
       } 
     } 
   } 
 
   // -------- FIRE HANDLING -------- 
   if(fireDetected) { 
     digitalWrite(greenLED, LOW); 
 
     // MG995 moves opposite of detected fire 
     if(isFire(leftSensor)) { 
       hoseServo.write(150); // Flick opposite (right) 
       // Serial.println("Flame LEFT -> MG995 flick RIGHT"); 
     } 
     else if(isFire(rightSensor)) { 
       hoseServo.write(30);  // Flick opposite (left) 
       // Serial.println("Flame RIGHT -> MG995 flick LEFT"); 
     } 
     else { 
       hoseServo.write(90); // Center if unsure 
     } 
 
     // Pump ON while fire detected 
     digitalWrite(relayPin, HIGH); 
 
     // Red LED blinking while spraying 
     static unsigned long lastBlink = 0; 
     if(millis() - lastBlink > 500) { 
       lastBlink = millis(); 
       digitalWrite(redLED, !digitalRead(redLED)); 
     } 
   } 
   else { 
     // Fire gone, keep pump ON until 5s after last fire 
     if(millis() < fireEndTime) { 
       digitalWrite(relayPin, HIGH); 
       digitalWrite(redLED, HIGH);   // Solid red LED during delay 
       digitalWrite(greenLED, LOW); 
     } 
     else { 
       digitalWrite(relayPin, LOW); 
       digitalWrite(redLED, LOW); 
       digitalWrite(greenLED, HIGH); 
       hoseServo.write(90); // Center MG995 
     } 
   } 
 }
