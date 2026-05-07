# 🌙 SleepWell Ultimate: IoT Smart Nightlight
> ⚠️ **CATATAN**: Website ini adalah versi uji coba (Coba-Coba) untuk keperluan pengembangan dan lomba.

SleepWell adalah sistem lampu tidur pintar berbasis IoT yang dirancang untuk membantu pencegahan nyamuk menggunakan frekuensi ultrasonik dan spektrum cahaya khusus, sekaligus memonitor kondisi ruangan secara real-time.

## 🚀 Cara Menjalankan Sistem (Localhost)

Sistem ini sekarang terintegrasi dalam satu repository. Ikuti langkah berikut:

### 1. Backend (Node.js)
*   Buka terminal di folder `backend`.
*   Jalankan perintah:
    ```bash
    npm install
    npm start
    ```
*   Server berjalan di `http://localhost:3000`.

### 2. Frontend (React + Vite)
*   Buka terminal di folder root (`SleepWell-Website`).
*   Jalankan perintah:
    ```bash
    npm install
    npm run dev
    ```
*   Buka dashboard di: `http://localhost:5173`.
*   **Login Password**: `admin`

### 3. Firmware (ESP32)
*   File kodingan ada di folder `esp/inkubator_dummy/`.
*   Buka menggunakan Arduino IDE, install library `PubSubClient`, `ArduinoJson`, `WiFiManager`, dan `DHT sensor library`.
*   Upload ke board ESP32 kamu.

---

## 🛠️ Fitur "Gacor" SleepWell
*   **Real-time Sensor Hub**: Monitoring 6x Ultrasonik + 1x DHT Suhu secara bersamaan.
*   **Smart Automation**: Lampu dengan preset warna anti-nyamuk.
*   **Security Login**: Dashboard aman dengan proteksi password.
*   **Remote Settings**: Fitur ganti WiFi ESP32 langsung dari halaman dashboard.
*   **Hardware Heartbeat**: Indikator status koneksi fisik alat (Online/Offline).

---
*Dibuat oleh Tim SleepWell (fanTaux & alvinrw).*
