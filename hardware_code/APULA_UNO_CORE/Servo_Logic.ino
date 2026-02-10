// ======================================================
// TAB: SERVO LOGIC
// ======================================================

void initServos() {
  scanServo.attach(SCAN_SERVO_PIN);
  pumpServo1.attach(PUMP_SERVO_1_PIN);
  pumpServo2.attach(PUMP_SERVO_2_PIN);

  // Initial Positions
  scanServo.write(0);
  pumpServo1.write(90); 
  pumpServo2.write(90);
}

void handleServos() {
  if (!fireActive) {
    // NORMAL SCANNING MODE
    scanServo.write(scanAngle);
    
    // Ensure pumps are OFF
    pumpServo1.write(90); 
    pumpServo2.write(90);

    // Increment scan angle
    scanAngle += scanStep;
    if (scanAngle >= 180 || scanAngle <= 0) {
      scanStep = -scanStep;
    }
  } 
  else {
    // FIRE MODE: Stop scanner and start pumps
    scanServo.write(scanAngle); // Hold current position
    
    // Activate Pumps
    pumpServo1.write(120); 
    pumpServo2.write(120);
  }
}
