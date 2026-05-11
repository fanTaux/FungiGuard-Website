import { createContext, useContext, useEffect, useState, useRef } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('sleepwell_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('sleepwell_user')) || null);
  
  // New Multi-Device State
  const [devices, setDevices] = useState({});
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  const host = window.location.hostname || 'localhost';
  const WS_URL = `ws://${host}:3000`;
  const API_URL = `http://${host}:3000`;

  const fetchDevices = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/devices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setDevices(prev => {
          const newDevices = { ...prev };
          data.devices.forEach(d => {
            if (!newDevices[d.deviceId]) {
              newDevices[d.deviceId] = {
                id: d.deviceId,
                name: d.name,
                system: false,
                sensors: [],
                dht: { temperature: 0, humidity: 0 },
                lastSeen: 0,
                isRegistered: true
              };
            } else {
              newDevices[d.deviceId].name = d.name;
              newDevices[d.deviceId].isRegistered = true;
            }
          });
          
          if (!activeDeviceId && data.devices.length > 0) {
            setActiveDeviceId(data.devices[0].deviceId);
          }
          
          return newDevices;
        });
      }
    } catch (e) {
      console.error("Gagal fetch devices", e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDevices();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    function connect() {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'device_update' || msg.type === 'device_status') {
            const devId = msg.deviceId;
            setDevices(prev => {
              const updated = {
                ...prev,
                [devId]: {
                  ...(prev[devId] || {}),
                  ...msg.data,
                  lastSeen: Date.now()
                }
              };
              
              // Jika ada data wifi_list, simpan ke field khusus
              if (msg.data && msg.data.wifi_list) {
                  updated[devId].wifi_list = msg.data.wifi_list;
              }

              // AUTO-SELECT: Jika belum ada alat aktif, set alat yang baru lapor ini jadi aktif
              if (!activeDeviceId) {
                  setActiveDeviceId(devId);
              }
              
              return updated;
            });
          }
        } catch (e) {
          console.error("WS Parse error", e);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000);
      };
    }
    
    connect();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [token]); // removed activeDeviceId dependency to avoid re-connecting on active change
  
  useEffect(() => {
    let lastAlertTime = localStorage.getItem('last_alert_time') || new Date().toISOString();
    
    const checkAlerts = async () => {
      if (!token || !activeDeviceId) return;
      try {
        const res = await fetch(`${API_URL}/api/alerts/${activeDeviceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.ok && data.alerts.length > 0) {
          const newest = data.alerts[0].timestamp;
          if (newest > lastAlertTime) {
            setHasNewAlert(true);
          }
        }
      } catch (e) {
        console.error('Check alerts error:', e);
      }
    };

    const alertTimer = setInterval(checkAlerts, 10000); // Cek tiap 10 detik
    checkAlerts(); // Cek langsung saat mount/active change
    
    return () => clearInterval(alertTimer);
  }, [token, activeDeviceId]);

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('sleepwell_token', data.token);
        localStorage.setItem('sleepwell_user', JSON.stringify(data.user));
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Terjadi kesalahan' };
    } catch (e) {
      return { ok: false, error: 'Gagal menghubungi server. Pastikan backend sudah jalan!' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setDevices({});
    setActiveDeviceId(null);
    localStorage.removeItem('sleepwell_token');
    localStorage.removeItem('sleepwell_user');
    if (ws.current) ws.current.close();
  };

  const sendCommand = async (payload) => {
    if (!token || !activeDeviceId) return;
    try {
      await fetch(`${API_URL}/api/control`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deviceId: activeDeviceId, ...payload })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const activeDevice = devices[activeDeviceId] || {};
  const state = {
    system: activeDevice.system || false,
    dht: activeDevice.dht || { temperature: 0, humidity: 0 },
    sensors: activeDevice.sensors || [],
    lampColor: activeDevice.lampColor || 'putih',
    lampBrightness: activeDevice.lampBrightness || 0,
    wifi_ssid: activeDevice.wifi_ssid || 'Disconnected',
    rssi: activeDevice.rssi || 0,
    wifi_list: activeDevice.wifi_list || []
  };
  const espLastSeen = activeDevice.lastSeen || 0;

  return (
    <AppContext.Provider value={{ 
        devices, 
        activeDeviceId, 
        setActiveDeviceId, 
        state, 
        isConnected, 
        espLastSeen, 
        token, 
        user,
        login, 
        logout, 
        sendCommand,
        fetchDevices,
        hasNewAlert,
        setHasNewAlert
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
