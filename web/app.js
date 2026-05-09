/* ============================================================
   INKUBATOR AYAM — app.js
   Mode: bisa pakai Backend Node.js (WebSocket) atau langsung MQTT
============================================================ */

// ============================================================
//  MODE KONEKSI
//  true  = pakai Node.js backend (ws://localhost:3000)
//  false = langsung ke MQTT HiveMQ (mode lama, tanpa backend)
// ============================================================
const USE_BACKEND = true;
const host        = window.location.hostname || 'localhost';
const BACKEND_WS  = `ws://${host}:3000`;     // Otomatis pakai IP server
const BACKEND_URL = `http://${host}:3000`;   // Otomatis pakai IP server

// ============================================================
//  KONFIGURASI MQTT (hanya dipakai kalau USE_BACKEND = false)
// ============================================================
const MQTT_CONFIG = {
  host:     '4ecff5933a704e218192a9a9390c3580.s1.eu.hivemq.cloud',
  port:     8884,
  protocol: 'wss',
  username: 'ayamA',
  password: 'Al280805.',
  clientId: 'web_inkubator_' + Math.random().toString(16).slice(2, 8),
};


const BASE  = 'doc/data';
const TOPIC = {
  SENSOR:  BASE + '/sensor',
  CONTROL: BASE + '/control',
  STATUS:  BASE + '/status',
};

// ============================================================
//  STATE
// ============================================================
let mqttClient = null;
let systemOn   = false;
let ledBright  = { hijau: 0, biru: 0, kuning: 0 };
let logLines   = 0;
const MAX_LOG  = 60;

// Multi-Device State
let currentDeviceId = ""; 
let knownDevices    = new Set(); 
const devicesState  = {}; // Nyimpen state per ID alat biar gak ilang pas pindah tab

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initSensorCards();
  startClock();

  if (USE_BACKEND) {
    connectBackend(); // Pakai Node.js backend
  } else {
    connectMQTT();   // Langsung ke MQTT HiveMQ
  }

  // Device Selector Event
  document.getElementById('deviceSelect').addEventListener('change', (e) => {
    currentDeviceId = e.target.value;
    if (currentDeviceId && devicesState[currentDeviceId]) {
      const s = devicesState[currentDeviceId];
      
      // 1. Sinkronkan Master System Toggle
      systemOn = s.system || false;
      
      // 2. Sinkronkan Slider & Visual LED
      ledBright.hijau  = s.bright_hijau || 0;
      ledBright.biru   = s.bright_biru  || 0;
      ledBright.kuning = s.bright_kuning || 0;
      
      // Update element input slider secara fisik
      const sliderH = document.getElementById('bright_hijau');
      const sliderB = document.getElementById('bright_biru');
      const sliderK = document.getElementById('bright_kuning');
      
      if (sliderH) sliderH.value = ledBright.hijau;
      if (sliderB) sliderB.value = ledBright.biru;
      if (sliderK) sliderK.value = ledBright.kuning;
      
      // Update label % dan visual lampu
      ['hijau', 'biru', 'kuning'].forEach(c => {
        updateBrightLabel(c, ledBright[c]);
        updateLedVisual(c, ledBright[c]);
      });

      syncSystemUI();
      addLog('info', 'UI', `Berpindah ke alat: ${currentDeviceId}`);
    } else {
      // Jika pilih kosong, reset UI ke nol
      resetUIToDefault();
    }
  });

  // System Toggle
  document.getElementById('systemToggle').addEventListener('change', (e) => {
    if (!currentDeviceId) { alert("Pilih alat dulu!"); e.target.checked = !e.target.checked; return; }
    systemOn = e.target.checked;
    publishControl({ system: systemOn });
    syncSystemUI();
    addLog('pub', 'PUB', `[${currentDeviceId}] System: ${systemOn ? 'ON' : 'OFF'}`);
  });
});

function addDeviceToList(id) {
  if (knownDevices.has(id)) return;
  knownDevices.add(id);
  const select = document.getElementById('deviceSelect');
  const opt = document.createElement('option');
  opt.id = "opt-" + id;
  opt.value = id;
  opt.textContent = "DEVICE: " + id + " (OFFLINE)";
  select.appendChild(opt);
  
  // Kalau baru ada 1 alat, otomatis pilih
  if (knownDevices.size === 1) {
    select.value = id;
    currentDeviceId = id;
    addLog('info', 'UI', `Auto-select alat pertama: ${id}`);
  }
}

function resetUIToDefault() {
  systemOn = false;
  ledBright = { hijau: 0, biru: 0, kuning: 0 };
  ['hijau', 'biru', 'kuning'].forEach(c => {
    const s = document.getElementById('bright_' + c);
    if (s) s.value = 0;
    updateBrightLabel(c, 0);
    updateLedVisual(c, 0);
  });
  syncSystemUI();
}

function manualAddDevice() {
  const id = prompt("Masukkan ID Alat baru (misal: kamar-1):");
  if (id && id.trim()) {
    const cleanId = id.trim();
    if (knownDevices.has(cleanId)) {
      alert("Alat ini sudah ada di daftar!");
    } else {
      addDeviceToList(cleanId);
      // Inisialisasi state kosong biar gak error pas dipindah
      devicesState[cleanId] = {
        system: false,
        bright_hijau: 0,
        bright_biru: 0,
        bright_kuning: 0,
        sensors: [],
        dht: { temperature: 0, humidity: 0 }
      };
      document.getElementById('deviceSelect').value = cleanId;
      currentDeviceId = cleanId;
      syncSystemUI();
      addLog('info', 'UI', `Menambahkan alat manual: ${cleanId}`);
    }
  }
}

// ============================================================
//  CONNECT KE NODE.JS BACKEND (WebSocket)
// ============================================================
let backendWs = null;

function connectBackend() {
  addLog('info', 'WS', `Menghubungkan ke backend: ${BACKEND_WS}...`);
  updateMqttStatus('connecting');

  backendWs = new WebSocket(BACKEND_WS);

  backendWs.onopen = () => {
    updateMqttStatus('connected');
    addLog('info', 'WS', 'Terhubung ke backend Node.js! ✅');
  };

  backendWs.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const deviceId = msg.deviceId;
      if (!deviceId) return;

      addDeviceToList(deviceId);
      devicesState[deviceId] = msg.data; // Simpan state terbaru dari ID ini

      // LOG DETAIL UNTUK DEBUGGING (BARU)
      const typeLabel = msg.type === 'device_update' ? 'SENSOR' : 'STATUS';
      const detail = `[${deviceId}] ${typeLabel}: Sys=${msg.data.system ? 'ON':'OFF'}, H:${msg.data.bright_hijau}, B:${msg.data.bright_biru}, K:${msg.data.bright_kuning}`;
      addLog('sub', 'MSG', detail);

      // Cuma update UI kalau ID-nya pas dengan yang dipilih di dropdown
      if (deviceId === currentDeviceId) {
        if (msg.type === 'device_update' || msg.type === 'sensor') handleSensorData(msg.data);
        if (msg.type === 'device_status' || msg.type === 'status') handleStatusData(msg.data);
      }
    } catch (e) {
      addLog('err', 'ERR', 'Parse error: ' + e.message);
    }
  };

  backendWs.onerror = (err) => {
    addLog('err', 'WS', 'Koneksi backend gagal! Pastikan backend jalan (npm start)');
    updateMqttStatus('disconnected');
  };

  backendWs.onclose = () => {
    updateMqttStatus('disconnected');
    addLog('err', 'WS', 'Backend terputus, coba ulang dalam 4 detik...');
    setTimeout(connectBackend, 4000);
  };
}


// ============================================================
//  CLOCK
// ============================================================
function startClock() {
  const el = document.getElementById('timeBadge');
  const update = () => { el.textContent = new Date().toLocaleTimeString('id-ID'); };
  update();
  setInterval(update, 1000);
}

// Track kapan terakhir data masuk
const sensorLastSeen = {};
let espLastSeen = 0; // Kapan ESP32 terakhir ngasih kabar apapun
const ESP_TIMEOUT_MS = 15000; // 15 detik = dianggap mati

function initSensorCards() {
  const grid = document.getElementById('sensorGrid');
  grid.innerHTML = '';
  for (let i = 1; i <= 6; i++) {
    grid.insertAdjacentHTML('beforeend', `
      <div class="sensor-card" id="sensorCard${i}">
        <div class="sensor-card-top">
          <span class="sensor-id">SENSOR ${i}</span>
          <span class="sensor-status-badge" id="sBadge${i}">MENUNGGU</span>
        </div>
        <div class="sensor-value" id="sVal${i}">--<span> cm</span></div>
        <div class="sensor-bar-wrap">
          <div class="sensor-bar" id="sBar${i}" style="width:0%"></div>
        </div>
        <span class="sensor-label" id="sLabel${i}">Menunggu data...</span>
      </div>
    `);
  }

  // Cek timeout sensor & ESP32 secara keseluruhan setiap 3 detik
  setInterval(() => {
    const now = Date.now();
    
    // 1. Cek Status Online/Offline tiap alat di list
    knownDevices.forEach(id => {
      const state = devicesState[id];
      const opt = document.getElementById("opt-" + id);
      if (!opt) return;

      const lastSeen = (state && state.lastUpdate) ? new Date(state.lastUpdate).getTime() : 0;
      const isOnline = (now - lastSeen < ESP_TIMEOUT_MS);
      
      opt.textContent = `DEVICE: ${id} ${isOnline ? '(ONLINE)' : '(OFFLINE)'}`;
      opt.style.color = isOnline ? '#2dd4bf' : '#f87171';

      // Jika alat yang dipilih saat ini mati, kasih indikator di badge sistem
      if (id === currentDeviceId) {
        const badge     = document.getElementById('sysBadge');
        const badgeText = document.getElementById('sysBadgeText');
        if (isOnline) {
          badge.className = 'system-badge on-state';
          badgeText.textContent = 'ESP32 ONLINE';
        } else {
          badge.className = 'system-badge';
          badgeText.textContent = 'ESP32 OFFLINE';
        }
      }
    });

    // 2. Cek Sensor Individu (Hanya untuk alat yang sedang aktif dilihat)
    if (currentDeviceId && devicesState[currentDeviceId]) {
      const state = devicesState[currentDeviceId];
      for (let i = 1; i <= 6; i++) {
        // Logika sensor existing...
      }
    }
  }, 3000);
}

// ============================================================
//  SET STATUS BADGE SENSOR
// ============================================================
function setSensorStatus(i, status) {
  const card  = document.getElementById(`sensorCard${i}`);
  const badge = document.getElementById(`sBadge${i}`);
  const bar   = document.getElementById(`sBar${i}`);
  if (!badge) return;

  card.classList.remove('sensor-on', 'sensor-off', 'sensor-error');
  badge.classList.remove('badge-on', 'badge-off', 'badge-error', 'badge-wait');

  if (status === 'on') {
    card.classList.add('sensor-on');
    badge.classList.add('badge-on');
    badge.textContent = '● AKTIF';
  } else if (status === 'error') {
    card.classList.add('sensor-error');
    badge.classList.add('badge-error');
    badge.textContent = '✕ ERROR';
  } else if (status === 'timeout') {
    card.classList.add('sensor-off');
    badge.classList.add('badge-off');
    badge.textContent = '○ MATI';
  } else {
    badge.classList.add('badge-wait');
    badge.textContent = 'MENUNGGU';
  }
}

// ============================================================
//  UPDATE UI SENSOR
// ============================================================
function updateSensorUI(sensors) {
  sensors.forEach(s => {
    const i     = s.id;
    const jarak = parseFloat(s.jarak);

    const valEl   = document.getElementById(`sVal${i}`);
    const barEl   = document.getElementById(`sBar${i}`);
    const labelEl = document.getElementById(`sLabel${i}`);
    if (!valEl) return;

    sensorLastSeen[i] = Date.now(); // Catat waktu terakhir data masuk

    if (jarak >= 999) {
      // Sensor error: kabel putus / timeout hardware
      setSensorStatus(i, 'error');
      valEl.innerHTML     = `ERR<span> !</span>`;
      labelEl.textContent = 'Sensor rusak / cek kabel!';
      if (barEl) barEl.style.width = '0%';
    } else {
      // Sensor normal dan aktif
      const pct = Math.min(100, (jarak / 400) * 100).toFixed(1);
      setSensorStatus(i, 'on');
      valEl.innerHTML     = `${jarak.toFixed(1)}<span> cm</span>`;
      labelEl.textContent = `${pct}% dari 400 cm`;
      if (barEl) barEl.style.width = `${pct}%`;
    }
  });

  const badge = document.getElementById('sensorUpdateBadge');
  if (badge) badge.textContent = 'Update: ' + new Date().toLocaleTimeString('id-ID');
}

// ============================================================
//  MQTT CONNECT
// ============================================================
function connectMQTT() {
  addLog('info', 'MQTT', `Menghubungkan ke ${MQTT_CONFIG.host}:${MQTT_CONFIG.port}...`);
  updateMqttStatus('connecting');

  const url = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}/mqtt`;

  mqttClient = mqtt.connect(url, {
    clientId:        MQTT_CONFIG.clientId,
    username:        MQTT_CONFIG.username,
    password:        MQTT_CONFIG.password,
    clean:           true,
    reconnectPeriod: 4000,
    connectTimeout:  10000,
  });

  mqttClient.on('connect', () => {
    updateMqttStatus('connected');
    addLog('info', 'MQTT', 'Terhubung! Subscribe ke topic...');
    mqttClient.subscribe(TOPIC.STATUS, { qos: 0 });
    mqttClient.subscribe(TOPIC.SENSOR, { qos: 0 });
    addLog('sub', 'SUB', TOPIC.STATUS);
    addLog('sub', 'SUB', TOPIC.SENSOR);
  });

  mqttClient.on('message', (topic, payloadBuf) => {
    const raw = payloadBuf.toString();
    addLog('sub', 'MSG', `[${topic.split('/').pop()}] ${raw.slice(0, 100)}${raw.length > 100 ? '...' : ''}`);

    try {
      const data = JSON.parse(raw);
      if (topic === TOPIC.SENSOR) handleSensorData(data);
      if (topic === TOPIC.STATUS) handleStatusData(data);
    } catch (e) {
      addLog('err', 'ERR', 'JSON parse gagal: ' + e.message);
    }
  });

  mqttClient.on('error', (err) => {
    addLog('err', 'ERR', err.message);
    updateMqttStatus('disconnected');
  });

  mqttClient.on('close', () => {
    updateMqttStatus('disconnected');
    addLog('err', 'MQTT', 'Koneksi terputus, mencoba ulang...');
  });

  mqttClient.on('reconnect', () => {
    updateMqttStatus('connecting');
    addLog('info', 'MQTT', 'Menghubungkan ulang...');
  });
}

// ============================================================
//  HANDLER SENSOR DATA
// ============================================================
function handleSensorData(data) {
  espLastSeen = Date.now(); // ESP32 is alive!
  
  if (data.dht) {
    addLog('info', 'DHT', `Suhu: ${data.dht.temperature}°C, Lembap: ${data.dht.humidity}%`);
  }

  // SINKRONISASI STATUS LAMPU & SISTEM (BARU)
  if (typeof data.system !== 'undefined') {
    systemOn = data.system;
    syncSystemUI();
  }

  // Sinkronkan slider jika ada data kecerahan di dalam paket sensor
  ['hijau', 'biru', 'kuning'].forEach(c => {
    const val = data[`bright_${c}`];
    if (typeof val !== 'undefined') {
      ledBright[c] = val;
      const slider = document.getElementById(`bright_${c}`);
      if (slider) slider.value = val;
      updateBrightLabel(c, val);
      updateLedVisual(c, val);
    }
  });

  if (!data.sensors || !Array.isArray(data.sensors)) return;
  updateSensorUI(data.sensors);
}

// ============================================================
//  HANDLER STATUS DATA
// ============================================================
function handleStatusData(data) {
  espLastSeen = Date.now(); // ESP32 is alive!
  if (typeof data.system !== 'undefined') systemOn = data.system;

  // Sinkronkan brightness slider jika ada dari ESP
  ['hijau', 'biru', 'kuning'].forEach(c => {
    const key = `bright_${c}`;
    if (typeof data[key] !== 'undefined') {
      ledBright[c] = data[key];
      const slider = document.getElementById(key);
      if (slider) slider.value = ledBright[c];
      updateBrightLabel(c, ledBright[c]);
      updateLedVisual(c, ledBright[c]);
    }
  });

  syncSystemUI();
}

// ============================================================
//  KONTROL KECERAHAN LED (0–255) — DENGAN THROTTLING
// ============================================================
let brightnessTimers = {};

function changeBrightness(color, value) {
  const val = parseInt(value);
  ledBright[color] = val;
  
  // 1. Update UI secara Instan (biar kelihatan responsif)
  updateBrightLabel(color, val);
  updateLedVisual(color, val);

  // 2. Throttling: Jangan kirim ke backend tiap milidetik (mencegah delay/lag parah di ESP)
  if (brightnessTimers[color]) {
    clearTimeout(brightnessTimers[color]);
  }
  
  brightnessTimers[color] = setTimeout(() => {
    const payload = { command: 'led_pwm', color, brightness: val };
    publishControl(payload);
  }, 100); // Tunggu 100ms setelah user berhenti geser atau geser pelan
}

function updateBrightLabel(color, val) {
  const pct = Math.round((val / 255) * 100);
  const el  = document.getElementById(`val_${color}`);
  if (el) el.textContent = `${pct}%`;
}

function updateLedVisual(color, val) {
  const cap  = color.charAt(0).toUpperCase() + color.slice(1);
  const card = document.getElementById(`ledCard${cap}`);
  const bulb = document.getElementById(`ledBulb${cap}`);
  const glow = document.getElementById(`ledGlow${cap}`);
  if (!card) return;

  const isOn = val > 0;
  card.classList.toggle('led-on', isOn);
  if (bulb) bulb.classList.toggle('active', isOn);
  if (glow) glow.classList.toggle('active', isOn);
}

// ============================================================
//  SYNC SYSTEM UI
// ============================================================
function syncSystemUI() {
  const toggle    = document.getElementById('systemToggle');
  const label     = document.getElementById('sysLabel');
  const badge     = document.getElementById('sysBadge');
  const badgeText = document.getElementById('sysBadgeText');
  const ledGrid   = document.querySelector('.led-grid');

  toggle.checked      = systemOn;
  label.textContent   = systemOn ? 'SISTEM ON'  : 'SISTEM OFF';
  label.className     = 'toggle-label' + (systemOn ? ' on' : '');

  if (ledGrid) ledGrid.classList.toggle('disabled-overlay', !systemOn);
}

// ============================================================
//  PUBLISH KE MQTT (via Backend WS atau langsung MQTT)
// ============================================================
function publishControl(payload) {
  // Tambahkan deviceId ke payload kontrol
  payload.deviceId = currentDeviceId;

  if (USE_BACKEND) {
    // Kirim ke Node.js backend via HTTP API
    fetch(`${BACKEND_URL}/api/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(r => r.json())
    .then(res => { if (res.ok) addLog('pub', 'PUB', `[backend] ${JSON.stringify(payload)}`); })
    .catch(err => addLog('err', 'ERR', 'Fetch gagal: ' + err.message));
  } else {
    // Direct MQTT
    if (!mqttClient || !mqttClient.connected) {
      addLog('err', 'ERR', 'MQTT tidak terhubung!');
      return;
    }
    const msg = JSON.stringify(payload);
    mqttClient.publish(TOPIC.CONTROL, msg, { qos: 0 });
    addLog('pub', 'PUB', `[mqtt] ${msg}`);
  }
}


// ============================================================
//  PENGATURAN WIFI
// ============================================================
function updateWifi() {
  const ssid = document.getElementById('wifiSsid').value.trim();
  const pass = document.getElementById('wifiPass').value;

  if (!ssid) { alert('SSID WiFi tidak boleh kosong!'); return; }
  if (confirm(`Ganti WiFi ke: "${ssid}"?\nAlat akan restart.`)) {
    publishControl({ command: 'update_wifi', wifi_ssid: ssid, wifi_pass: pass });
    addLog('pub', 'PUB', `Ganti WiFi ke ${ssid}...`);
    alert('Data terkirim! Tunggu alat restart dan konek ke WiFi baru.');
  }
}

function resetWifiDevice() {
  if (confirm('Reset pengaturan WiFi?\nAlat akan menghapus memori WiFi dan masuk mode Setup (Hotspot).')) {
    publishControl({ command: 'reset_wifi' });
    addLog('pub', 'PUB', 'Kirim perintah RESET WiFi...');
    alert('Perintah Reset terkirim! Tunggu alat restart ke mode Hotspot.');
  }
}

// ============================================================
//  UPDATE STATUS MQTT
// ============================================================
function updateMqttStatus(state) {
  const dot  = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (!dot || !text) return;
  dot.className = 'status-dot';

  if (state === 'connected') {
    dot.classList.add('connected');
    text.textContent = 'Terhubung';
  } else if (state === 'disconnected') {
    dot.classList.add('disconnected');
    text.textContent = 'Terputus';
  } else {
    text.textContent = 'Menghubungkan...';
  }
}

// ============================================================
//  LOG BOX
// ============================================================
function addLog(type, tag, msg) {
  const box = document.getElementById('logBox');
  const ph  = box.querySelector('.log-placeholder');
  if (ph) ph.remove();

  const ts   = new Date().toLocaleTimeString('id-ID');
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `
    <span class="log-ts">[${ts}]</span>
    <span class="log-tag ${type}">${tag}</span>
    <span class="log-msg">${escapeHtml(msg)}</span>
  `;
  box.appendChild(line);
  logLines++;

  while (logLines > MAX_LOG) {
    const first = box.querySelector('.log-line');
    if (first) { first.remove(); logLines--; } else break;
  }
  box.scrollTop = box.scrollHeight;
}

function clearLog() {
  const box = document.getElementById('logBox');
  box.innerHTML = '<p class="log-placeholder">Log dibersihkan...</p>';
  logLines = 0;
}

// ============================================================
//  UTILS
// ============================================================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
