# APULA Wireless Integration Guide

This guide explains how to connect the **Arduino Uno** (Sensors & Actuators) to the **ESP32-CAM** (Web Interface & Camera) to create a fully wireless fire alarm system.

## 1. System Overview

- **Arduino Uno**: Handles all hardware logic (Flame Sensors, Servos, Water Pump, SIM800L). It runs `APULA_UNO_CORE.ino`.
- **ESP32-CAM**: Handles the WiFi connection, Camera Stream, and Web Interface. It runs `APULA_ESP32_CAM.ino`.
- **Communication**: The two boards communicate via **Serial (UART)**. The Uno sends status updates (`STATUS|FIRE|ON`) to the ESP32, and the ESP32 sends web commands (`TEST_FIRE`, `RESET`, `PUMP_ON`) to the Uno.

## 2. Wiring Connection

**WARNING**: The Arduino Uno operates at **5V**, while the ESP32-CAM operates at **3.3V**. Connecting the Uno's TX (5V) directly to the ESP32's RX (3.3V) can damage the ESP32. Use a voltage divider or logic level converter.

### Connection Table

| Arduino Uno Pin | ESP32-CAM Pin | Description |
| :--- | :--- | :--- |
| **Pin 1 (TX)** | **U0R (GPIO 3)** | Sends status from Uno to ESP32 (Requires Voltage Divider!) |
| **Pin 0 (RX)** | **U0T (GPIO 1)** | Sends commands from ESP32 to Uno |
| **GND** | **GND** | Common Ground (Essential!) |
| **5V** | **5V** | Power for ESP32-CAM (from Uno 5V or external 5V) |

### Voltage Divider (Recommended for Uno TX -> ESP32 RX)

1. Connect **Uno TX (Pin 1)** to a **1kΩ** resistor.
2. Connect the other end of the 1kΩ resistor to **ESP32 U0R**.
3. Connect a **2kΩ** resistor from **ESP32 U0R** to **GND**.

*(If you don't have resistors, you can try direct connection for short testing, but it is risky for the ESP32).*

## 3. Uploading Code

### Step 1: Upload to Arduino Uno
1. Open `APULA_UNO_CORE.ino` in Arduino IDE.
2. Select Board: **Arduino Uno**.
3. **IMPORTANT**: Disconnect the TX/RX wires from pins 0 and 1 while uploading! (USB uses these pins).
4. Upload the code.
5. Reconnect the TX/RX wires.

### Step 2: Upload to ESP32-CAM
1. Open `APULA_ESP32_CAM.ino` in Arduino IDE.
2. Select Board: **AI Thinker ESP32-CAM**.
3. Ensure `board_config.h`, `camera_index.h`, and `camera_pins.h` are in the same folder.
4. Use an FTDI programmer (USB-to-TTL) to upload code to the ESP32-CAM (since it doesn't have a USB port).
   - FTDI TX -> ESP32 U0R
   - FTDI RX -> ESP32 U0T
   - FTDI GND -> ESP32 GND
   - FTDI 5V -> ESP32 5V
   - **GPIO 0 -> GND** (Put in Boot Mode for uploading)
5. Upload the code.
6. Remove the GPIO 0 -> GND jumper and press the Reset button on the ESP32.

## 4. How to Use

1. **Power Up**: Power both the Arduino Uno and ESP32-CAM.
2. **Connect to WiFi**: 
   - Connect your computer/phone to the WiFi network: `PROJECT APULA` (Password: `#group10`).
   - Or, if you configured it to connect to your home router, find its IP address in the Serial Monitor.
3. **Open Web Interface**:
   - Open a browser and go to `http://<ESP32-IP-ADDRESS>` (e.g., `http://192.168.4.1` if using AP mode).
   - You should see the **APULA SYSTEM** dashboard.

### Web Interface Controls
- **Fire Status**: Shows "SAFE" or "DANGER" based on the Uno's sensors.
- **Water Pump**: Shows "OFF" or "RUNNING".
- **TEST FIRE**: Simulates a fire event (Uno will activate pump and servo).
- **RESET SYSTEM**: Resets the alarm and turns off the pump.
- **PUMP ON/OFF**: Manually controls the water pump.

## 5. Troubleshooting

- **No Status on Web**: Check the TX/RX wiring. Swap TX and RX if unsure (TX must go to RX).
- **Camera Lag**: The ESP32-CAM might be overheating or have weak power. Ensure a stable 5V power supply (at least 2A).
- **Pump Not Working**: Check the relay/MOSFET wiring on Pin A5 of the Uno.
- **Servo Jitter**: Ensure the servos have their own external power supply (do not power them directly from the Uno's 5V pin if possible).
