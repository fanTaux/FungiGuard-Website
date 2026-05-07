// =====================================================================
// CONFIGURATION FILE - CREDENTIALS
// =====================================================================
// IMPORTANT: This file contains sensitive credentials and is excluded 
// from Git via .gitignore. Copy config.example.h to config.h and fill 
// in your actual credentials.
// =====================================================================

#ifndef CONFIG_H
#define CONFIG_H

// --- WiFi Credentials ---
const char* ssid = "MyRepublic_C2222847";
const char* password = "C2222847";

// --- MQTT Broker Credentials (HiveMQ Cloud) ---
const char* mqtt_server = "4ecff5933a704e218192a9a9390c3580.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "ayamA";
const char* mqtt_password = "Al280805.";
const char* mqtt_topic = "doc/data";

#endif
