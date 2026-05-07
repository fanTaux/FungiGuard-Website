// =====================================================================
// CONFIGURATION FILE TEMPLATE - EXAMPLE
// =====================================================================
// INSTRUCTIONS:
// 1. Copy this file and rename it to: config.h
// 2. Fill in your actual credentials below
// 3. Upload to your ESP32
// =====================================================================

#ifndef CONFIG_H
#define CONFIG_H

// --- WiFi Credentials ---
const char* ssid = "YOUR_WIFI_SSID";           // Replace with your WiFi network name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password

// --- MQTT Broker Credentials (HiveMQ Cloud) ---
const char* mqtt_server = "YOUR_HIVEMQ_HOST.s1.eu.hivemq.cloud";  // Your HiveMQ cluster URL
const int mqtt_port = 8883;                                        // TLS port (don't change)
const char* mqtt_username = "YOUR_MQTT_USERNAME";                  // Your HiveMQ username
const char* mqtt_password = "YOUR_MQTT_PASSWORD";                  // Your HiveMQ password
const char* mqtt_topic = "doc/data";                               // MQTT topic (must match Flutter app)

#endif
