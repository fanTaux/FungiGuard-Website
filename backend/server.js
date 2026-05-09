// ============================================================
//  INKUBATOR BACKEND — server.js
//  Stack: Express (HTTP) + ws (WebSocket) + mqtt (MQTT Bridge)
//  Role: Jembatan antara ESP32 (MQTT) dan Frontend (React/Web)
// ============================================================

const express    = require('express');
const http       = require('http');
const { WebSocketServer } = require('ws');
const cors       = require('cors');
const mqttBridge = require('./mqtt/client');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3000;

// ============================================================
//  MIDDLEWARE
// ============================================================
app.use(cors()); // Izinkan request dari frontend di port berbeda
app.use(express.json());

// ============================================================
//  STATE SISTEM (Memory)
// ============================================================
let SERVER_PASSWORD = "admin"; // Default password

const devices = {}; // Kamar penyimpanan kolektif untuk semua ESP32

// Helper buat dapetin atau inisialisasi state per alat
function getDeviceState(id) {
  if (!devices[id]) {
    devices[id] = {
      id: id,
      system: false,
      bright_hijau: 0,
      bright_biru: 0,
      bright_kuning: 0,
      sensors: [],
      dht: { temperature: 0, humidity: 0 },
      lastUpdate: null
    };
  }
  return devices[id];
}

// ============================================================
//  WEBSOCKET SERVER (untuk kirim data real-time ke Frontend)
// ============================================================
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WS] Client terhubung');

  // Kirim daftar semua alat saat client baru connect
  Object.keys(devices).forEach(id => {
    ws.send(JSON.stringify({ type: 'device_update', deviceId: id, data: devices[id] }));
  });

  ws.on('close', () => console.log('[WS] Client terputus'));
  ws.on('error', (err) => console.error('[WS] Error:', err.message));
});

// Broadcast ke SEMUA client WebSocket yang terhubung
function broadcast(type, deviceId, data) {
  const msg = JSON.stringify({ type, deviceId, data });
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg);
  });
}

// ============================================================
//  MQTT BRIDGE — Terima data dari ESP32, teruskan ke Web
// ============================================================
// Callback dari MQTT: Sensor
mqttBridge.onSensorData((deviceId, data) => {
  const dState = getDeviceState(deviceId);
  
  if (data.sensors) dState.sensors = data.sensors;
  if (data.dht) dState.dht = data.dht;
  if (typeof data.system !== 'undefined') dState.system = data.system;
  
  // Ambil juga data lampu jika disertakan di paket sensor
  if (typeof data.bright_hijau !== 'undefined')  dState.bright_hijau  = data.bright_hijau;
  if (typeof data.bright_biru !== 'undefined')   dState.bright_biru   = data.bright_biru;
  if (typeof data.bright_kuning !== 'undefined') dState.bright_kuning = data.bright_kuning;

  dState.lastUpdate = new Date().toISOString();

  broadcast('device_update', deviceId, dState); 
});

// Callback dari MQTT: Status (Heartbeat/Feedback)
mqttBridge.onStatusData((deviceId, data) => {
  const dState = getDeviceState(deviceId);

  if (typeof data.system       !== 'undefined') dState.system        = data.system;
  if (typeof data.bright_hijau !== 'undefined') dState.bright_hijau  = data.bright_hijau;
  if (typeof data.bright_biru  !== 'undefined') dState.bright_biru   = data.bright_biru;
  if (typeof data.bright_kuning!== 'undefined') dState.bright_kuning = data.bright_kuning;
  
  // Fitur SleepWell
  if (data.lampColor) dState.lampColor = data.lampColor;
  if (typeof data.lampBrightness !== 'undefined') dState.lampBrightness = data.lampBrightness;
  
  broadcast('device_status', deviceId, dState);
});

// ============================================================
//  REST API ENDPOINTS (untuk React frontend nantinya)
// ============================================================

// GET /api/status — Ambil daftar semua alat
app.get('/api/status', (req, res) => {
  res.json({ ok: true, devices });
});

// GET /api/status/:id — Ambil data per alat
app.get('/api/status/:id', (req, res) => {
  const dev = devices[req.params.id];
  if (dev) res.json({ ok: true, data: dev });
  else res.status(404).json({ ok: false, error: 'Device tidak ditemukan' });
});

// POST /api/control — Kirim perintah ke ESP32 via MQTT
// Body: { system: true/false } atau { command: "led_pwm", color: "hijau", brightness: 128 }
app.post('/api/control', (req, res) => {
  const { deviceId, ...payload } = req.body;
  if (!deviceId) return res.status(400).json({ ok: false, error: 'deviceId wajib diisi' });
  
  mqttBridge.publishControl(payload, deviceId);
  res.json({ ok: true, message: `Perintah terkirim ke ${deviceId}`, payload });
});

// GET /api/sensors/:id — Data sensor terbaru per alat
app.get('/api/sensors/:id', (req, res) => {
  const dev = devices[req.params.id];
  if (dev) res.json({ ok: true, data: dev.sensors, lastUpdate: dev.lastUpdate });
  else res.status(404).json({ ok: false, error: 'Device tidak ditemukan' });
});

// POST /api/system — Nyalain/matiin sistem
app.post('/api/system', (req, res) => {
  const { on } = req.body;
  if (typeof on !== 'boolean') return res.status(400).json({ ok: false, error: 'Field "on" harus boolean' });
  mqttBridge.publishControl({ system: on });
  res.json({ ok: true, message: `System ${on ? 'ON' : 'OFF'} dikirim ke ESP32` });
});

// POST /api/led — Atur kecerahan LED
// Body: { color: "hijau"|"biru"|"kuning", brightness: 0-255 }
app.post('/api/led', (req, res) => {
  const { color, brightness } = req.body;
  const validColors = ['hijau', 'biru', 'kuning'];
  if (!validColors.includes(color)) return res.status(400).json({ ok: false, error: 'Color tidak valid' });
  if (brightness < 0 || brightness > 255) return res.status(400).json({ ok: false, error: 'Brightness harus 0-255' });
  mqttBridge.publishControl({ command: 'led_pwm', color, brightness: parseInt(brightness) });
  res.json({ ok: true, message: `LED ${color} → ${brightness}` });
});

// POST /api/wifi — Ganti WiFi ESP32
app.post('/api/wifi', (req, res) => {
  const { ssid, password } = req.body;
  if (!ssid) return res.status(400).json({ ok: false, error: 'SSID wajib diisi' });
  mqttBridge.publishControl({ command: 'update_wifi', wifi_ssid: ssid, wifi_pass: password || '' });
  res.json({ ok: true, message: 'Perintah ganti WiFi terkirim' });
});

// POST /api/wifi/reset — Reset WiFi ESP32
app.post('/api/wifi/reset', (req, res) => {
  mqttBridge.publishControl({ command: 'reset_wifi' });
  res.json({ ok: true, message: 'Perintah reset WiFi terkirim' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// POST /api/login — Autentikasi
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === SERVER_PASSWORD) {
    res.json({ ok: true, token: "sleepwell-auth-token-123" });
  } else {
    res.status(401).json({ ok: false, error: 'Password salah!' });
  }
});

// POST /api/password — Ganti Password
app.post('/api/password', (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (oldPassword === SERVER_PASSWORD) {
    SERVER_PASSWORD = newPassword;
    res.json({ ok: true, message: 'Password berhasil diubah!' });
  } else {
    res.status(401).json({ ok: false, error: 'Password lama salah!' });
  }
});

// ============================================================
//  START SERVER
// ============================================================
server.listen(PORT, () => {
  console.log(`\n🚀 Inkubator Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready at ws://localhost:${PORT}`);
  console.log(`🌐 Web dashboard: http://localhost:${PORT}`);
  console.log(`📋 API docs: http://localhost:${PORT}/api/status\n`);
});
