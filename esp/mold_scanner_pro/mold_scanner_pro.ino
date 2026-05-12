/*
 * ============================================================
 *  FUNGIGUARD AI - ESP32 PRO (FULL FEATURED)
 *  LED: SOLID=OK, BLINK=1 Sensor Error, OFF=All Error
 *  MQTT: Kirim sensor + wifi_ssid + rssi + wifi_list
 *  Control: Terima perintah scan_wifi & change_wifi
 * ============================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>
#include <Preferences.h>
#include <DHT.h>

// --- SENSOR & PIN ---
#define DHTPIN 26
#define DHTTYPE DHT11
#define LDRPIN 34
#define LED_PIN 25

// --- IDENTITAS ALAT ---
const String myDeviceID = "mold-scanner-01";

// --- MQTT HIVEMQ CLOUD ---
const char* mqtt_server = "4ecff5933a704e218192a9a9390c3580.s1.eu.hivemq.cloud";
const int   mqtt_port   = 8883;
const char* mqtt_username = "ayamA";
const char* mqtt_password = "Al280805.";

const String TOPIC_SENSOR  = "doc/data/" + myDeviceID + "/sensor";
const String TOPIC_STATUS  = "doc/data/" + myDeviceID + "/status";
const String TOPIC_CONTROL = "doc/data/" + myDeviceID + "/control";

WiFiClientSecure espClient;
PubSubClient     mqttClient(espClient);
DHT              dht(DHTPIN, DHTTYPE);
SemaphoreHandle_t mqttMutex;
Preferences prefs;

// Flag perintah dari web
volatile bool shouldScanWifi    = false;
volatile bool shouldChangeWifi  = false;
String        pendingSSID       = "";
String        pendingPass       = "";

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(9600);
  Serial.println("\n\n========================================");
  Serial.println("      FUNGIGUARD AI BOOTING...");
  Serial.println("========================================");

  pinMode(LED_PIN, OUTPUT);
  dht.begin();

  mqttMutex = xSemaphoreCreateMutex();
  espClient.setInsecure();

  // Test LED startup
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);

  WiFiManager wm;
  wm.setConnectTimeout(60);
  wm.setConfigPortalTimeout(180);

  if (!wm.autoConnect("MoldScanner-01")) {
    Serial.println("[WIFI] Gagal konek, restart...");
    delay(3000);
    ESP.restart();
  }

  Serial.print("[WIFI] Terhubung ke: ");
  Serial.println(WiFi.SSID());
  Serial.print("[WIFI] RSSI: ");
  Serial.println(WiFi.RSSI());

  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(onMqttMessage);

  xTaskCreatePinnedToCore(TaskMQTTCode,   "TaskMQTT",   8192, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(TaskSensorCode, "TaskSensor", 4096, NULL, 1, NULL, 1);
}

void loop() { delay(100); }

// ============================================================
//  MQTT CALLBACK (Terima perintah dari Web)
// ============================================================
void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.println("[CONTROL] Perintah diterima: " + msg);

  JsonDocument doc;
  if (deserializeJson(doc, msg) != DeserializationError::Ok) return;

  const char* cmd = doc["command"];
  if (!cmd) return;

  if (strcmp(cmd, "scan_wifi") == 0) {
    shouldScanWifi = true;
    Serial.println("[CONTROL] Scan WiFi diminta...");
  }
  else if (strcmp(cmd, "change_wifi") == 0) {
    pendingSSID  = doc["ssid"].as<String>();
    pendingPass  = doc["password"].as<String>();
    shouldChangeWifi = true;
    Serial.println("[CONTROL] Ganti WiFi ke: " + pendingSSID);
  }
}

// ============================================================
//  TASK 1: MQTT
// ============================================================
void TaskMQTTCode(void* pvParameters) {
  for (;;) {
    if (!mqttClient.connected()) {
      Serial.println("[MQTT] Mencoba koneksi...");
      String clientId = "ESP32-Mold-" + myDeviceID;
      if (mqttClient.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
        Serial.println("[MQTT] CONNECTED!");
        mqttClient.subscribe(TOPIC_CONTROL.c_str());
      } else {
        Serial.print("[MQTT] FAILED rc=");
        Serial.println(mqttClient.state());
        vTaskDelay(5000 / portTICK_PERIOD_MS);
      }
    }
    xSemaphoreTake(mqttMutex, portMAX_DELAY);
    mqttClient.loop();
    xSemaphoreGive(mqttMutex);
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

// ============================================================
//  TASK 2: SENSOR + WIFI + CONTROL
// ============================================================
void TaskSensorCode(void* pvParameters) {
  static bool ledState = false;
  for (;;) {
    // --- HANDLE SCAN WIFI ---
    if (shouldScanWifi) {
      shouldScanWifi = false;
      Serial.println("[WIFI] Scanning jaringan...");
      int n = WiFi.scanNetworks();
      if (n > 0) {
        JsonDocument doc;
        doc["type"] = "wifi_list";
        JsonArray arr = doc["networks"].to<JsonArray>();
        for (int i = 0; i < n && i < 10; i++) {
          JsonObject net = arr.add<JsonObject>();
          net["ssid"] = WiFi.SSID(i);
          net["rssi"] = WiFi.RSSI(i);
        }
        String out;
        serializeJson(doc, out);
        xSemaphoreTake(mqttMutex, portMAX_DELAY);
        mqttClient.publish(TOPIC_STATUS.c_str(), out.c_str());
        xSemaphoreGive(mqttMutex);
        Serial.println("[WIFI] Scan selesai, " + String(n) + " jaringan ditemukan");
      }
      WiFi.scanDelete();
    }

    // --- HANDLE CHANGE WIFI ---
    if (shouldChangeWifi) {
      shouldChangeWifi = false;
      Serial.println("[WIFI] Menghubungkan ke: " + pendingSSID);
      WiFi.begin(pendingSSID.c_str(), pendingPass.c_str());
      int timeout = 0;
      while (WiFi.status() != WL_CONNECTED && timeout < 20) {
        vTaskDelay(500 / portTICK_PERIOD_MS);
        timeout++;
      }
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("[WIFI] Berhasil terhubung ke: " + pendingSSID);
      } else {
        Serial.println("[WIFI] Gagal, kembali ke jaringan sebelumnya");
      }
    }

    // --- BACA SENSOR ---
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int   ldrValue = analogRead(LDRPIN);

    bool dhtOk = !isnan(h) && !isnan(t);
    bool ldrOk = (ldrValue > 5 && ldrValue < 4090);

    // --- SMART LED ---
    if (dhtOk && ldrOk) {
      digitalWrite(LED_PIN, HIGH);
    } else if (dhtOk || ldrOk) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState);
    } else {
      digitalWrite(LED_PIN, LOW);
    }

    // --- KIRIM DATA SENSOR + WIFI INFO ---
    if (dhtOk || ldrOk) {
      JsonDocument doc;
      doc["deviceId"] = myDeviceID;

      JsonObject dhtObj = doc["dht"].to<JsonObject>();
      dhtObj["temperature"] = dhtOk ? t : 0;
      dhtObj["humidity"]    = dhtOk ? h : 0;

      doc["ldr"]       = ldrOk ? ldrValue : 0;
      doc["timestamp"] = millis();

      // Tambahkan info WiFi langsung di payload sensor
      doc["wifi_ssid"] = WiFi.SSID();
      doc["rssi"]      = WiFi.RSSI();

      String output;
      serializeJson(doc, output);

      Serial.println("[DATA] " + output);

      if (mqttClient.connected()) {
        xSemaphoreTake(mqttMutex, portMAX_DELAY);
        mqttClient.publish(TOPIC_SENSOR.c_str(), output.c_str());
        xSemaphoreGive(mqttMutex);
      }
    } else {
      Serial.println("[SENSOR] Critical Error: Semua sensor mati!");
    }

    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}
