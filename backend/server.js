// ============================================================
//  INKUBATOR BACKEND — server.js (SQLite Version)
// ============================================================

require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { WebSocketServer } = require('ws');
const cors       = require('cors');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
const mqttBridge = require('./mqtt/client');
const { User, Device, SensorLog, Scan, Alert } = require('./db');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3000;

// ============================================================
//  DATABASE SEEDING
// ============================================================
async function seedAdmin() {
  const adminExists = User.findOne({ username: 'admin' });
  if (!adminExists) {
    await User.create({
      name: 'Admin SleepWell',
      username: 'admin',
      password: 'admin',
      role: 'ADMIN',
      initials: 'AD'
    });
    console.log('👤 Admin default siap: username: admin / password: admin (SQLite)');
  }
}

seedAdmin();

// ============================================================
//  MIDDLEWARE
// ============================================================
app.use(cors()); 
app.use(express.json());

// ============================================================
//  AUTH MIDDLEWARE
// ============================================================
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, error: 'Akses ditolak' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ ok: false, error: 'Token tidak valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ ok: false, error: 'Hanya Admin yang diizinkan' });
  }
  next();
};

const devices = {}; // Real-time state

function getDeviceState(id) {
  if (!devices[id]) {
    devices[id] = {
      id: id,
      system: false,
      sensors: [],
      dht: { temperature: 0, humidity: 0 },
      lastUpdate: null
    };
  }
  return devices[id];
}

// ============================================================
//  WEBSOCKET SERVER
// ============================================================
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WS] Client terhubung');
  Object.keys(devices).forEach(id => {
    ws.send(JSON.stringify({ type: 'device_update', deviceId: id, data: devices[id] }));
  });
  ws.on('close', () => console.log('[WS] Client terputus'));
});

function broadcast(type, deviceId, data) {
  const msg = JSON.stringify({ type, deviceId, data });
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg);
  });
}

// ============================================================
//  MQTT BRIDGE
// ============================================================
mqttBridge.onSensorData((deviceId, data) => {
  const dState = getDeviceState(deviceId);
  if (data.sensors) {
      dState.sensors = data.sensors;
      // Deteksi Sensor Mati (Misal kalau ada yang 0)
      const deadSensors = data.sensors.filter(s => s === 0).length;
      if (deadSensors > 0) {
          Alert.create({ deviceId, type: 'danger', message: `Bahaya: ${deadSensors} sensor tidak merespon / mati!` });
      }
  }
  if (data.dht) {
      dState.dht = data.dht;
      // SIMPAN KE LOG DATABASE
      try {
          SensorLog.create({
              deviceId,
              temperature: data.dht.temperature,
              humidity: data.dht.humidity,
              timestamp: new Date().toISOString()
          });
      } catch (e) {
          console.error('[DB] Gagal simpan log:', e.message);
      }
  }
  if (typeof data.system !== 'undefined') dState.system = data.system;
  
  // Deteksi WiFi Putus
  if (data.wifi_ssid === 'Disconnected' || data.rssi === 0) {
      Alert.create({ deviceId, type: 'danger', message: 'Koneksi WiFi Perangkat Terputus!' });
  }
  
  if (data.wifi_ssid) dState.wifi_ssid = data.wifi_ssid;
  if (typeof data.rssi !== 'undefined') dState.rssi = data.rssi;
  
  dState.lastUpdate = new Date().toISOString();
  broadcast('device_update', deviceId, dState); 
});

mqttBridge.onStatusData((deviceId, data) => {
  const dState = getDeviceState(deviceId);
  if (typeof data.system       !== 'undefined') dState.system        = data.system;
  if (data.lampColor) dState.lampColor = data.lampColor;
  if (typeof data.lampBrightness !== 'undefined') dState.lampBrightness = data.lampBrightness;
  
  // Tambahkan dukungan WiFi info dan List WiFi
  if (data.wifi_ssid) dState.wifi_ssid = data.wifi_ssid;
  if (typeof data.rssi !== 'undefined') dState.rssi = data.rssi;
  if (data.type === 'wifi_list') dState.wifi_list = data.networks;

  broadcast('device_status', deviceId, dState);
});

// ============================================================
//  REST API ENDPOINTS
// ============================================================

app.get('/api/status', (req, res) => {
  res.json({ ok: true, devices });
});

app.post('/api/control', (req, res) => {
  const { deviceId, ...payload } = req.body;
  if (!deviceId) return res.status(400).json({ ok: false, error: 'deviceId wajib diisi' });
  mqttBridge.publishControl(payload, deviceId);
  res.json({ ok: true, message: `Perintah terkirim ke ${deviceId}`, payload });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/history/:deviceId', authenticate, async (req, res) => {
  try {
    const history = SensorLog.getHistory(req.params.deviceId, 24);
    res.json({ ok: true, history });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Gagal mengambil riwayat' });
  }
});

app.get('/api/alerts/:deviceId', authenticate, (req, res) => {
    try {
        const alerts = Alert.getRecent(req.params.deviceId, 10);
        res.json({ ok: true, alerts });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Gagal mengambil riwayat peringatan' });
    }
});

app.post('/api/scans', authenticate, (req, res) => {
    try {
        Scan.create(req.body);
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ ok: false, error: 'Gagal menyimpan hasil pemindaian' });
    }
});

app.get('/api/scans/:deviceId', authenticate, (req, res) => {
    try {
        const scans = Scan.getHistory(req.params.deviceId, 20);
        res.json({ ok: true, scans });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Gagal mengambil riwayat pemindaian' });
    }
});

app.get('/api/alerts/:deviceId', authenticate, (req, res) => {
    try {
        const alerts = Alert.getRecent(req.params.deviceId, 10);
        res.json({ ok: true, alerts });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Gagal mengambil riwayat peringatan' });
    }
});

// USER & DEVICE MANAGEMENT (SQLite)

app.get('/api/users', authenticate, isAdmin, async (req, res) => {
  const users = User.findAll();
  res.json({ ok: true, users });
});

app.post('/api/users', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    User.create({ name, username, password, role, initials });
    res.json({ ok: true, message: 'User berhasil ditambah' });
  } catch (err) {
    res.status(400).json({ ok: false, error: 'Gagal menambah user' });
  }
});

app.delete('/api/users/:id', authenticate, isAdmin, async (req, res) => {
  User.delete(req.params.id);
  res.json({ ok: true, message: 'User berhasil dihapus' });
});

app.get('/api/devices', authenticate, async (req, res) => {
  const dbDevices = Device.findAll();
  res.json({ ok: true, devices: dbDevices });
});

app.post('/api/devices', authenticate, isAdmin, async (req, res) => {
  try {
    const { deviceId, name } = req.body;
    Device.create({ deviceId, name });
    res.json({ ok: true, message: 'Perangkat berhasil terdaftar' });
  } catch (err) {
    res.status(400).json({ ok: false, error: 'Gagal mendaftar perangkat' });
  }
});

app.delete('/api/devices/:id', authenticate, isAdmin, async (req, res) => {
  Device.delete(req.params.id);
  res.json({ ok: true, message: 'Perangkat berhasil dihapus' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = User.findOne({ username });
  
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    res.json({ ok: true, token, user: { name: user.name, role: user.role, username: user.username } });
  } else {
    res.status(401).json({ ok: false, error: 'Username atau Password salah!' });
  }
});

// ============================================================
//  START SERVER
// ============================================================
server.listen(PORT, () => {
  console.log(`\n🚀 SleepWell Backend (SQLite) running on http://localhost:${PORT}`);
  console.log(`🌐 API ready, Database local: sleepwell.db\n`);
});
