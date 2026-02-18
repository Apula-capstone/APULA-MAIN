#pragma once

/*
 * Minimal camera_index.h for APULA
 * This file contains the HTML for the ESP32-CAM's own web page.
 * It includes WebSocket client logic to communicate with the Arduino Uno.
 */

const char index_html[] PROGMEM = R"rawtext(
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>APULA ESP32-CAM</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #121212; color: #e0e0e0; text-align: center; padding: 20px; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #1e1e1e; padding: 25px; border-radius: 16px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
            img { width: 100%; border-radius: 12px; margin-top: 15px; border: 2px solid #333; }
            h1 { color: #ff6b6b; margin-bottom: 5px; letter-spacing: 1px; }
            .subtitle { color: #888; font-size: 14px; margin-bottom: 20px; }
            
            /* Status Indicators */
            .status-panel { display: flex; justify-content: space-between; margin: 20px 0; gap: 10px; }
            .status-card { flex: 1; background: #2d2d2d; padding: 15px; border-radius: 10px; border: 1px solid #444; }
            .status-label { font-size: 12px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .status-value { font-size: 18px; font-weight: bold; color: #fff; }
            
            .safe { color: #4ade80; }
            .danger { color: #ef4444; animation: pulse 1s infinite; }
            .active { color: #60a5fa; }
            .inactive { color: #9ca3af; }

            /* Controls */
            .controls { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
            button {
                padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s; color: white;
            }
            button:active { transform: scale(0.98); }
            
            .btn-test { background: #ef4444; }
            .btn-test:hover { background: #dc2626; }
            
            .btn-reset { background: #10b981; }
            .btn-reset:hover { background: #059669; }
            
            .btn-pump-on { background: #3b82f6; }
            .btn-pump-on:hover { background: #2563eb; }
            
            .btn-pump-off { background: #6b7280; }
            .btn-pump-off:hover { background: #4b5563; }

            .log-container { margin-top: 20px; text-align: left; background: #000; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 12px; height: 100px; overflow-y: auto; color: #0f0; border: 1px solid #333; }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>APULA SYSTEM</h1>
            <div class="subtitle">Fire Detection & Response Interface</div>
            
            <div class="status-panel">
                <div class="status-card">
                    <div class="status-label">Fire Status</div>
                    <div class="status-value safe" id="fire-status">SAFE</div>
                </div>
                <div class="status-card">
                    <div class="status-label">Water Pump</div>
                    <div class="status-value inactive" id="pump-status">OFF</div>
                </div>
            </div>

            <img src="/stream" id="stream">
            
            <div class="controls">
                <button class="btn-test" onclick="sendCommand('TEST_FIRE')">🔥 TEST FIRE</button>
                <button class="btn-reset" onclick="sendCommand('RESET')">♻️ RESET SYSTEM</button>
                <button class="btn-pump-on" onclick="sendCommand('PUMP_ON')">💧 PUMP ON</button>
                <button class="btn-pump-off" onclick="sendCommand('PUMP_OFF')">⛔ PUMP OFF</button>
            </div>

            <div class="log-container" id="logs">
                <div>> System Ready...</div>
            </div>

            <div style="margin-top: 20px;">
                <a href="https://apula-capstone.github.io/APULA-MAIN/" target="_blank" style="color: #f97316; text-decoration: none; font-size: 14px; font-weight: bold;">← Go to Official Dashboard</a>
            </div>
        </div>

        <script>
            var gateway = `ws://${window.location.hostname}:82/`;
            var websocket;

            function initWebSocket() {
                console.log('Trying to open a WebSocket connection...');
                websocket = new WebSocket(gateway);
                websocket.onopen = onOpen;
                websocket.onclose = onClose;
                websocket.onmessage = onMessage;
            }

            function onOpen(event) {
                log('Connection opened');
            }

            function onClose(event) {
                log('Connection closed. Reconnecting...');
                setTimeout(initWebSocket, 2000);
            }

            function onMessage(event) {
                var data = event.data;
                // Expected format: STATUS|FIRE|ON  or  STATUS|SAFE|OFF
                
                if (data.startsWith("STATUS|")) {
                    var parts = data.split('|');
                    if (parts.length >= 3) {
                        updateStatus(parts[1], parts[2]);
                    }
                } else {
                    log("RX: " + data);
                }
            }

            function sendCommand(cmd) {
                log("TX: " + cmd);
                websocket.send(cmd);
            }

            function updateStatus(fireState, pumpState) {
                var fireEl = document.getElementById('fire-status');
                var pumpEl = document.getElementById('pump-status');

                if (fireState === 'FIRE') {
                    fireEl.textContent = "🔥 DANGER";
                    fireEl.className = "status-value danger";
                } else {
                    fireEl.textContent = "✅ SAFE";
                    fireEl.className = "status-value safe";
                }

                if (pumpState === 'ON') {
                    pumpEl.textContent = "RUNNING";
                    pumpEl.className = "status-value active";
                } else {
                    pumpEl.textContent = "OFF";
                    pumpEl.className = "status-value inactive";
                }
            }

            function log(msg) {
                var logDiv = document.getElementById('logs');
                var entry = document.createElement('div');
                entry.textContent = "> " + msg;
                logDiv.insertBefore(entry, logDiv.firstChild);
                if (logDiv.childNodes.length > 20) {
                    logDiv.removeChild(logDiv.lastChild);
                }
            }

            window.addEventListener('load', onLoad);
            function onLoad(event) {
                initWebSocket();
            }
        </script>
    </body>
</html>
)rawtext";
