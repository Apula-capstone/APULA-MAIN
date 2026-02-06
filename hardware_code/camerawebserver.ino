
#include "esp_camera.h"
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <DNSServer.h>
#include "board_config.h"
#include "esp_wifi.h"

// Forward declaration of server function in app_httpd.cpp
void startApulaServer();

// WiFi credentials
const char *ssid = "PROJECT APULA"; 
const char *password = "#group10"; 

// AP Mode Config (Fallback)
const char *ap_ssid = "APULA_CAM";
const char *ap_pass = "FireSafe2026";
const byte DNS_PORT = 53;
DNSServer dnsServer;

WebSocketsServer webSocket = WebSocketsServer(82);

void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    String message = String((char*)payload);
    if (message == "TEST_PANIC") {
      // Forward TEST_PANIC command to Arduino
      Serial.println("TEST_PANIC");
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // Camera Configuration
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_QVGA; 
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_LATEST; 
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 20;
  config.fb_count = 3;

  // Camera Init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  sensor_t * s = esp_camera_sensor_get();
  if (s->id.PID == OV2640_PID) {
    s->set_vflip(s, 1);
    s->set_hmirror(s, 1);
    s->set_brightness(s, 1);
    s->set_contrast(s, 1);
    s->set_aec2(s, 1);
    s->set_gain_ctrl(s, 1);      
    s->set_agc_gain(s, 0);       
    s->set_gainceiling(s, (gainceiling_t)0); 
    s->set_bpc(s, 0);            
    s->set_wpc(s, 1);            
    s->set_raw_gma(s, 1);        
    s->set_lenc(s, 1);           
    s->set_ae_level(s, -2);
    s->set_dcw(s, 1);
  }

  // WiFi Connection
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  esp_wifi_set_ps(WIFI_PS_NONE);
  
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Failed. Starting AP Mode...");
    WiFi.softAP(ap_ssid, ap_pass);
    dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
    Serial.print("AP IP Address: ");
    Serial.println(WiFi.softAPIP());
  }

  // Start Servers
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);
  startApulaServer();
  
  Serial.println("APULA Unified Firmware Ready!");
}

void loop() {
  dnsServer.processNextRequest();
  webSocket.loop();

  // Forward Arduino Serial data to WebSocket
  if (Serial.available()) {
    String data = Serial.readStringUntil('\n');
    data.trim();
    if (data.length() > 0) {
      if (data.startsWith("SENSORS:")) {
        webSocket.broadcastTXT(data);
      }
      // Log other messages for debugging
      Serial.print("FORWARD:");
      Serial.println(data);
    }
  }
}
