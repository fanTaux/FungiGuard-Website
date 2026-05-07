// ============================================================
//  INKUBATOR BACKEND — mqtt/client.js
//  MQTT Bridge: Subscribe data ESP32, Publish perintah ke ESP32
// ============================================================

const mqtt = require('mqtt');

// ============================================================
//  KONFIGURASI MQTT (sama persis dengan ESP32 & web lama)
// ============================================================
const MQTT_HOST     = '4ecff5933a704e218192a9a9390c3580.s1.eu.hivemq.cloud';
const MQTT_PORT     = 8883;        // TLS/SSL — server ke broker
const MQTT_USERNAME = 'ayamA';
const MQTT_PASSWORD = 'Al280805.';
const CLIENT_ID     = 'node_backend_' + Math.random().toString(16).slice(2, 8);

const BASE    = 'doc/data';
const TOPICS  = {
  SENSOR:  BASE + '/sensor',
  STATUS:  BASE + '/status',
  CONTROL: BASE + '/control',
};

// ============================================================
//  CALLBACK REGISTRY (dipanggil dari server.js)
// ============================================================
let _onSensorData = () => {};
let _onStatusData = () => {};

// ============================================================
//  KONEKSI MQTT
// ============================================================
const client = mqtt.connect(`mqtts://${MQTT_HOST}:${MQTT_PORT}`, {
  clientId:        CLIENT_ID,
  username:        MQTT_USERNAME,
  password:        MQTT_PASSWORD,
  clean:           true,
  reconnectPeriod: 5000,
  connectTimeout:  15000,
  rejectUnauthorized: false, // HiveMQ Cloud menggunakan self-signed atau Let's Encrypt
});

client.on('connect', () => {
  console.log('[MQTT] ✅ Terhubung ke HiveMQ Cloud');

  client.subscribe(TOPICS.SENSOR, { qos: 0 }, (err) => {
    if (!err) console.log('[MQTT] 📡 Subscribe:', TOPICS.SENSOR);
  });

  client.subscribe(TOPICS.STATUS, { qos: 0 }, (err) => {
    if (!err) console.log('[MQTT] 📡 Subscribe:', TOPICS.STATUS);
  });
});

client.on('message', (topic, payloadBuf) => {
  const raw = payloadBuf.toString();
  console.log(`[MQTT] ← [${topic.split('/').pop()}] ${raw.slice(0, 100)}`);

  try {
    const data = JSON.parse(raw);
    if (topic === TOPICS.SENSOR) _onSensorData(data);
    if (topic === TOPICS.STATUS) _onStatusData(data);
  } catch (e) {
    console.error('[MQTT] JSON parse error:', e.message);
  }
});

client.on('error', (err) => {
  console.error('[MQTT] ❌ Error:', err.message);
});

client.on('close', () => {
  console.warn('[MQTT] ⚠️ Koneksi terputus, mencoba ulang...');
});

client.on('reconnect', () => {
  console.log('[MQTT] 🔄 Menghubungkan ulang...');
});

// ============================================================
//  PUBLIC API (dipakai oleh server.js)
// ============================================================

// Publish perintah ke ESP32
function publishControl(payload) {
  if (!client.connected) {
    console.error('[MQTT] Tidak bisa publish: belum terhubung');
    return false;
  }
  const msg = JSON.stringify(payload);
  client.publish(TOPICS.CONTROL, msg, { qos: 0 });
  console.log(`[MQTT] → [ctrl] ${msg}`);
  return true;
}

// Daftarkan callback saat data sensor masuk
function onSensorData(cb) { _onSensorData = cb; }

// Daftarkan callback saat data status masuk
function onStatusData(cb) { _onStatusData = cb; }

// Cek status koneksi
function isConnected() { return client.connected; }

module.exports = { publishControl, onSensorData, onStatusData, isConnected };
