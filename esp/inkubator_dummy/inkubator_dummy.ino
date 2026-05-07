/*
 * ============================================================
 *  INKUBATOR AYAM - ESP32 PRO PWM VERSION (Core 3.x Ready)
 *  Features: PWM LED Control (Dimmer), Dual Core, Watchdog, WiFi Manager
 * ============================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>
#include <esp_task_wdt.h>  // Header dipertahankan, tapi tidak digunakan di task
#include <Preferences.h>
#include <DHT.h>

// ============================================================
//  MODE & PINS
// ============================================================
#define USE_DUMMY 

const int PIN_LED_HIJAU  = 25;
const int PIN_LED_BIRU   = 26;
const int PIN_LED_KUNING = 27;

// PWM Config (ESP32 Core 3.x)
const int PWM_FREQ = 5000;
const int PWM_RES  = 8; // 0-255

// Sensor Ultrasonik (1-6)
const int S1_TRIG = 13; const int S1_ECHO = 12;
const int S2_TRIG = 14; const int S2_ECHO = 32;
const int S3_TRIG = 33; const int S3_ECHO = 35; 
const int S4_TRIG = 15; const int S4_ECHO = 4;
const int S5_TRIG = 18; const int S5_ECHO = 19;
const int S6_TRIG = 5;  const int S6_ECHO = 23;

const int SENSOR_PINS[6][2] = {
  {S1_TRIG, S1_ECHO}, {S2_TRIG, S2_ECHO}, {S3_TRIG, S3_ECHO}, 
  {S4_TRIG, S4_ECHO}, {S5_TRIG, S5_ECHO}, {S6_TRIG, S6_ECHO}
};

// Sensor Suhu & Kelembapan (DHT)
const int DHT_PIN = 21;
#define DHT_TYPE DHT11 // Bisa diganti DHT22 kalau pakai tipe itu
DHT dht(DHT_PIN, DHT_TYPE);

// ============================================================
//  MQTT & GLOBALS
// ============================================================
const char* mqtt_server   = "4ecff5933a704e218192a9a9390c3580.s1.eu.hivemq.cloud";
const int   mqtt_port     = 8883;
const char* mqtt_username = "ayamA";
const char* mqtt_password = "Al280805.";
const char* mqtt_topic    = "doc/data";

String TOPIC_SENSOR, TOPIC_STATUS, TOPIC_CONTROL;
bool systemOn = true;
int brightHijau = 0, brightBiru = 0, brightKuning = 0;

WiFiClientSecure secureClient;
PubSubClient     mqttClient(secureClient);
WiFiManager      wm;
Preferences      prefs;

TaskHandle_t TaskMQTT;
TaskHandle_t TaskSensor;
SemaphoreHandle_t mqttMutex;

// ============================================================
//  HELPERS
// ============================================================
void updateLED() {
  if (!systemOn) {
    ledcWrite(PIN_LED_HIJAU, 0); ledcWrite(PIN_LED_BIRU, 0); ledcWrite(PIN_LED_KUNING, 0);
  } else {
    ledcWrite(PIN_LED_HIJAU, brightHijau);
    ledcWrite(PIN_LED_BIRU, brightBiru);
    ledcWrite(PIN_LED_KUNING, brightKuning);
  }
}

void blinkFeedback() {
  for (int i = 0; i < 3; i++) {
    ledcWrite(PIN_LED_HIJAU, 255); ledcWrite(PIN_LED_BIRU, 255); ledcWrite(PIN_LED_KUNING, 255);
    vTaskDelay(100 / portTICK_PERIOD_MS);
    ledcWrite(PIN_LED_HIJAU, 0); ledcWrite(PIN_LED_BIRU, 0); ledcWrite(PIN_LED_KUNING, 0);
    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
  updateLED();
}

float readSensor(int id) {
#ifdef USE_DUMMY
  float base[] = {45.0, 78.5, 32.0, 120.0, 55.0};
  return round((base[id] + (random(-100, 100) / 10.0)) * 10) / 10.0;
#else
  int trig = SENSOR_PINS[id][0]; int echo = SENSOR_PINS[id][1];
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long duration = pulseIn(echo, HIGH, 30000);
  float distance = duration * 0.034 / 2;
  return (distance <= 0 || distance > 400) ? 999.0 : round(distance * 10) / 10.0;
#endif
}

void publishStatus() {
  if (xSemaphoreTake(mqttMutex, (TickType_t)100) == pdTRUE) {
    StaticJsonDocument<256> doc;
    doc["system"] = systemOn;
    doc["bright_hijau"] = brightHijau;
    doc["bright_biru"] = brightBiru;
    doc["bright_kuning"] = brightKuning;
    char buf[256]; serializeJson(doc, buf);
    mqttClient.publish(TOPIC_STATUS.c_str(), buf, true);
    xSemaphoreGive(mqttMutex);
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  StaticJsonDocument<512> doc;
  if (!deserializeJson(doc, msg)) {
    if (doc.containsKey("system")) {
      systemOn = doc["system"].as<bool>();
      prefs.putBool("sys_state", systemOn);
      updateLED();
    }
    if (systemOn && doc.containsKey("command")) {
      String cmd = doc["command"].as<String>();
      if (cmd == "led_pwm") {
        String color = doc["color"].as<String>();
        int val = doc["brightness"].as<int>();
        if (color == "hijau") brightHijau = val;
        else if (color == "biru") brightBiru = val;
        else if (color == "kuning") brightKuning = val;
        updateLED();
      } else if (cmd == "sleepwell_lamp") {
        String color = doc["color"].as<String>();
        int brightness = doc["brightness"].as<int>();
        if (color == "putih") { brightHijau = brightness; brightBiru = brightness; brightKuning = brightness; }
        else if (color == "hijau") { brightHijau = brightness; brightBiru = 0; brightKuning = 0; }
        else if (color == "ungu") { brightHijau = 0; brightBiru = brightness; brightKuning = brightness; }
        else if (color == "earth_tone") { brightHijau = brightness / 2; brightBiru = 0; brightKuning = brightness; }
        updateLED();
      } else if (cmd == "reset_wifi") { wm.resetSettings(); ESP.restart(); }
      else if (cmd == "update_wifi") {
        WiFi.begin(doc["wifi_ssid"].as<const char*>(), doc["wifi_pass"].as<const char*>());
        vTaskDelay(2000 / portTICK_PERIOD_MS); ESP.restart();
      }
    }
    publishStatus();
  }
}

void TaskMQTTCode(void * pvParameters) {
  for(;;) {
    if (!mqttClient.connected()) {
      if (mqttClient.connect("esp32_inkubator", mqtt_username, mqtt_password)) {
        mqttClient.subscribe(TOPIC_CONTROL.c_str());
        publishStatus();
      } else { vTaskDelay(5000 / portTICK_PERIOD_MS); }
    }
    xSemaphoreTake(mqttMutex, portMAX_DELAY);
    mqttClient.loop();
    xSemaphoreGive(mqttMutex);
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

void TaskSensorCode(void * pvParameters) {
  for(;;) {
    if (systemOn) {
      StaticJsonDocument<768> doc;
      doc["system"] = true;
      
      // Data DHT (Suhu & Kelembapan)
      JsonObject dhtData = doc.createNestedObject("dht");
#ifdef USE_DUMMY
      dhtData["temperature"] = random(250, 300) / 10.0; // 25.0 - 30.0
      dhtData["humidity"]    = random(500, 700) / 10.0; // 50.0 - 70.0
#else
      float t = dht.readTemperature();
      float h = dht.readHumidity();
      dhtData["temperature"] = isnan(t) ? 0.0 : t;
      dhtData["humidity"]    = isnan(h) ? 0.0 : h;
#endif

      // Data 6 Sensor Jarak
      JsonArray sensors = doc.createNestedArray("sensors");
      for (int i = 0; i < 6; i++) {
        JsonObject s = sensors.createNestedObject();
        s["id"] = i + 1; s["jarak"] = readSensor(i);
      }
      
      char buf[768]; serializeJson(doc, buf);
      if (xSemaphoreTake(mqttMutex, (TickType_t)500) == pdTRUE) {
        mqttClient.publish(TOPIC_SENSOR.c_str(), buf);
        xSemaphoreGive(mqttMutex);
      }
    } else {
      // HEARTBEAT: Kasih tahu Web kalau ESP32 masih hidup meskipun sistem OFF
      static int heartbeatCounter = 0;
      if (++heartbeatCounter >= 3) { // Tiap 6 detik (3 x 2000ms)
        publishStatus();
        heartbeatCounter = 0;
      }
    }
    vTaskDelay(2000 / portTICK_PERIOD_MS);
  }
}

void setup() {
  setCpuFrequencyMhz(80); Serial.begin(115200);
  prefs.begin("inkubator", false);
  systemOn = prefs.getBool("sys_state", true);

  // --- LED SELALU DIINIT (baik dummy maupun nyata) ---
  ledcAttach(PIN_LED_HIJAU, PWM_FREQ, PWM_RES);
  ledcAttach(PIN_LED_BIRU, PWM_FREQ, PWM_RES);
  ledcAttach(PIN_LED_KUNING, PWM_FREQ, PWM_RES);
  updateLED();

#ifndef USE_DUMMY
  // Sensor hardware pins — hanya init kalau USE_DUMMY tidak aktif
  dht.begin();
  for (int i = 0; i < 6; i++) {
    pinMode(SENSOR_PINS[i][0], OUTPUT); pinMode(SENSOR_PINS[i][1], INPUT);
  }
#else
  Serial.println("[DUMMY] Mode sensor aktif: data sensor disimulasi.");
#endif

  
  TOPIC_SENSOR = String(mqtt_topic) + "/sensor";
  TOPIC_STATUS = String(mqtt_topic) + "/status";
  TOPIC_CONTROL = String(mqtt_topic) + "/control";

  mqttMutex = xSemaphoreCreateMutex();
  wm.autoConnect("Inkubator-Setup", "password123");
  secureClient.setInsecure();
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);

  xTaskCreatePinnedToCore(TaskMQTTCode, "TaskMQTT", 10000, NULL, 1, &TaskMQTT, 0);
  xTaskCreatePinnedToCore(TaskSensorCode, "TaskSensor", 10000, NULL, 1, &TaskSensor, 1);
}

void loop() { vTaskDelete(NULL); }