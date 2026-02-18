#include <Servo.h>
#include <SoftwareSerial.h>
#include <avr/pgmspace.h>

// ======================================================
// APULA UNO + SIM800L + 3x Flame Sensor + 3x Servo + Pump
// ======================================================
// Hardware mapping aligned to APULA wiring:
//   - SIM800L: D12 (UNO RX <- SIM800 TX), D13 (UNO TX -> SIM800 RX via level shift)
//   - Pump relay: D5
//   - Flame sensors: D2, D3, D4 (active LOW)
//   - Servos: D9, D10, D11

SoftwareSerial sim800(12, 13);
Servo servo1;
Servo servo2;
Servo servo3;

// Phone numbers in flash (PROGMEM) to save SRAM on UNO
const char PHONE_1[] PROGMEM = "+639619113527";
const char PHONE_2[] PROGMEM = "+639511135809";
const char PHONE_3[] PROGMEM = "+639691640225";
const char* const PHONE_BOOK[] PROGMEM = {PHONE_1, PHONE_2, PHONE_3};

const char ALERT_TEXT[] PROGMEM = "FIRE DETECTED! APULA pump activated.";

// Pins
const uint8_t FLAME1_PIN = 2;
const uint8_t FLAME2_PIN = 3;
const uint8_t FLAME3_PIN = 4;
const uint8_t PUMP_PIN = 5;

const uint8_t SERVO1_PIN = 9;
const uint8_t SERVO2_PIN = 10;
const uint8_t SERVO3_PIN = 11;

// Sweep config: 0-160 degrees loop
const int SWEEP_MIN = 0;
const int SWEEP_MAX = 160;
const int SWEEP_STEP = 1;
const unsigned long SWEEP_INTERVAL_MS = 10;

// Alert config
const unsigned long CALL_DURATION_MS = 10000;
const unsigned long BROADCAST_INTERVAL_MS = 300;

int angle1 = SWEEP_MIN;
int angle2 = SWEEP_MAX;
int angle3 = SWEEP_MIN;
int dir1 = 1;
int dir2 = -1;
int dir3 = 1;

bool fireDetected = false;
bool alertsSentThisFire = false;

unsigned long lastSweepMs = 0;
unsigned long lastBroadcastMs = 0;

bool readFlame(uint8_t pin) {
  return digitalRead(pin) == LOW; // APULA flame modules are active LOW
}

void readProgmemString(const char* srcProgmem, char* dest, size_t destSize) {
  if (destSize == 0) {
    return;
  }

  strncpy_P(dest, srcProgmem, destSize - 1);
  dest[destSize - 1] = '\0';
}

void flushSIMInput() {
  while (sim800.available()) {
    sim800.read();
  }
}

bool waitForSIMResponse(const char* expected, unsigned long timeoutMs) {
  size_t matched = 0;
  size_t expectedLen = strlen(expected);
  unsigned long start = millis();

  while (millis() - start < timeoutMs) {
    if (!sim800.available()) {
      continue;
    }

    char c = sim800.read();

    if (c == expected[matched]) {
      matched++;
      if (matched == expectedLen) {
        return true;
      }
    } else {
      matched = (c == expected[0]) ? 1 : 0;
    }
  }

  return false;
}

bool sendATExpectOK(const char* cmd, unsigned long timeoutMs) {
  flushSIMInput();
  sim800.print(cmd);
  sim800.print("\r");
  return waitForSIMResponse("OK", timeoutMs);
}

bool initSIM800() {
  // SIM800L can take several seconds after power-up.
  for (uint8_t attempt = 0; attempt < 12; attempt++) {
    if (sendATExpectOK("AT", 800)) {
      break;
    }
    delay(400);
    if (attempt == 11) {
      Serial.println(F("SIM800_INIT:AT_FAILED"));
      return false;
    }
  }

  bool echoOk = sendATExpectOK("ATE0", 1000);
  bool textModeOk = sendATExpectOK("AT+CMGF=1", 1000);

  if (!echoOk || !textModeOk) {
    Serial.println(F("SIM800_INIT:BASIC_CONFIG_FAILED"));
    return false;
  }

  Serial.println(F("SIM800_INIT:READY"));
  return true;
}

void broadcastSensors(bool f1, bool f2, bool f3) {
  if (millis() - lastBroadcastMs < BROADCAST_INTERVAL_MS) {
    return;
  }
  lastBroadcastMs = millis();

  // Format required by APULA dashboard bridge
  // Example: SENSORS:1,0,1
  Serial.print(F("SENSORS:"));
  Serial.print(f1 ? 1 : 0);
  Serial.print(',');
  Serial.print(f2 ? 1 : 0);
  Serial.print(',');
  Serial.println(f3 ? 1 : 0);
}

void serviceCriticalOutputs() {
  bool f1 = readFlame(FLAME1_PIN);
  bool f2 = readFlame(FLAME2_PIN);
  bool f3 = readFlame(FLAME3_PIN);

  fireDetected = f1 || f2 || f3;
  digitalWrite(PUMP_PIN, fireDetected ? HIGH : LOW);
  broadcastSensors(f1, f2, f3);
}

void waitWithService(unsigned long waitMs) {
  unsigned long start = millis();
  while (millis() - start < waitMs) {
    serviceCriticalOutputs();
    delay(10);
  }
}

bool sendSMS(const char* phone, const char* message) {
  flushSIMInput();
  sim800.print(F("AT+CMGS=\""));
  sim800.print(phone);
  sim800.print(F("\"\r"));

  waitWithService(500);
  sim800.print(message);
  sim800.write(26); // Ctrl+Z

  // Wait until modem confirms submission.
  bool ok = waitForSIMResponse("OK", 8000);
  if (!ok) {
    Serial.print(F("GSM_SMS_FAIL:"));
    Serial.println(phone);
  }
  return ok;
}

bool callNumber(const char* phone) {
  flushSIMInput();
  sim800.print(F("ATD"));
  sim800.print(phone);
  sim800.print(F(";\r"));

  waitWithService(CALL_DURATION_MS);
  bool hangupOk = sendATExpectOK("ATH", 1500);

  if (!hangupOk) {
    Serial.print(F("GSM_CALL_HANGUP_FAIL:"));
    Serial.println(phone);
  }

  return hangupOk;
}

void sendAlertsOncePerFireEvent() {
  if (alertsSentThisFire) {
    return;
  }

  char phoneBuf[20];
  char msgBuf[64];
  readProgmemString(ALERT_TEXT, msgBuf, sizeof(msgBuf));

  for (uint8_t i = 0; i < 3; i++) {
    const char* p = (const char*)pgm_read_word(&(PHONE_BOOK[i]));
    readProgmemString(p, phoneBuf, sizeof(phoneBuf));

    // Re-check modem basic readiness before each sequence.
    if (!sendATExpectOK("AT", 1000)) {
      initSIM800();
    }

    sendSMS(phoneBuf, msgBuf);
    callNumber(phoneBuf);
  }

  alertsSentThisFire = true;
}

void updateServoSweep() {
  unsigned long now = millis();
  if (now - lastSweepMs < SWEEP_INTERVAL_MS) {
    return;
  }
  lastSweepMs = now;

  angle1 += dir1 * SWEEP_STEP;
  if (angle1 >= SWEEP_MAX) {
    angle1 = SWEEP_MAX;
    dir1 = -1;
  } else if (angle1 <= SWEEP_MIN) {
    angle1 = SWEEP_MIN;
    dir1 = 1;
  }

  angle2 += dir2 * SWEEP_STEP;
  if (angle2 >= SWEEP_MAX) {
    angle2 = SWEEP_MAX;
    dir2 = -1;
  } else if (angle2 <= SWEEP_MIN) {
    angle2 = SWEEP_MIN;
    dir2 = 1;
  }

  angle3 += dir3 * SWEEP_STEP;
  if (angle3 >= SWEEP_MAX) {
    angle3 = SWEEP_MAX;
    dir3 = -1;
  } else if (angle3 <= SWEEP_MIN) {
    angle3 = SWEEP_MIN;
    dir3 = 1;
  }

  servo1.write(angle1);
  servo2.write(angle2);
  servo3.write(angle3);
}

void setup() {
  Serial.begin(115200);
  sim800.begin(9600);

  pinMode(FLAME1_PIN, INPUT);
  pinMode(FLAME2_PIN, INPUT);
  pinMode(FLAME3_PIN, INPUT);
  pinMode(PUMP_PIN, OUTPUT);

  servo1.attach(SERVO1_PIN);
  servo2.attach(SERVO2_PIN);
  servo3.attach(SERVO3_PIN);
  servo1.write(angle1);
  servo2.write(angle2);
  servo3.write(angle3);

  digitalWrite(PUMP_PIN, LOW);

  delay(1000);
  initSIM800();
  Serial.println(F("SYSTEM_READY"));
}

void loop() {
  bool f1 = readFlame(FLAME1_PIN);
  bool f2 = readFlame(FLAME2_PIN);
  bool f3 = readFlame(FLAME3_PIN);

  fireDetected = f1 || f2 || f3;

  if (fireDetected) {
    // Stop sweep by not calling updateServoSweep()
    digitalWrite(PUMP_PIN, HIGH);
    sendAlertsOncePerFireEvent();
  } else {
    digitalWrite(PUMP_PIN, LOW);
    alertsSentThisFire = false;
    updateServoSweep();
  }

  broadcastSensors(f1, f2, f3);
}
