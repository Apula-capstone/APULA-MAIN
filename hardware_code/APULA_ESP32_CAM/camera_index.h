
#pragma once

/*
 * Minimal camera_index.h for APULA
 * This file contains the HTML for the ESP32-CAM's own web page.
 */

const char index_html[] PROGMEM = R"rawtext(
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>APULA ESP32-CAM</title>
        <style>
            body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; text-align: center; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #262626; padding: 20px; border-radius: 15px; border: 1px solid #444; }
            img { width: 100%; border-radius: 10px; margin-top: 15px; }
            h1 { color: #f97316; }
            .status { font-size: 12px; color: #888; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>APULA SYSTEM</h1>
            <p>Live Camera Stream</p>
                    <img src="/stream" id="stream">
                    <div class="status">APULA Hardware Sync V2.7.0</div>
                    <div style="margin-top: 20px;">
                        <a href="https://apula-capstone.github.io/APULA-MAIN/" style="color: #f97316; text-decoration: none; font-size: 14px; font-weight: bold;">← Go to Official Dashboard</a>
                    </div>
                </div>
    </body>
</html>
)rawtext";
