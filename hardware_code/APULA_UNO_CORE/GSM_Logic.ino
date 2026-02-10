// ======================================================
// TAB: GSM LOGIC
// ======================================================

void initGSM() {
  sim800l.println("AT");
  delay(500);
  sim800l.println("AT+CMGF=1"); 
  delay(500);
}

void sendSMS(String message) {
  Serial.print("SIM800L:SENDING_SMS_TO:");
  Serial.println(EMERGENCY_PHONE);
  
  sim800l.println("AT+CMGF=1"); 
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
  sim800l.println("ATD" + EMERGENCY_PHONE + ";"); 
}
