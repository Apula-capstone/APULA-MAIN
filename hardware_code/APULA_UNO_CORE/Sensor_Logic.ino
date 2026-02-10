// ======================================================
// TAB: SENSOR LOGIC
// ======================================================

void handleSensors() {
  int s1 = analogRead(FLAME_ALPHA);
  int s2 = analogRead(FLAME_BETA);
  int s3 = analogRead(FLAME_GAMMA);

  // Check for Fire Condition
  fireActive = (s1 < FIRE_THRESHOLD || s2 < FIRE_THRESHOLD || s3 < FIRE_THRESHOLD);

  if (fireActive) {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(STATUS_LED, HIGH);
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    
    if (!smsSent) {
      Serial.println("SIM800L:TRIGGER_ALARM");
      sendSMS("ALERT: FIRE DETECTED! APULA System has triggered an emergency alarm.");
      makeCall(); 
      smsSent = true;
    }
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(STATUS_LED, LOW);
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
    smsSent = false; 
  }

  // Telemetry for Dashboard
  Serial.print("SENSORS:");
  Serial.print(s1);
  Serial.print(",");
  Serial.print(s2);
  Serial.print(",");
  Serial.println(s3);
}
