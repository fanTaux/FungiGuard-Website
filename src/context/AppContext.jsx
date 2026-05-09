import { createContext, useContext, useEffect, useState, useRef } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('sleepwell_token') || null);
  
  // New Multi-Device State
  const [devices, setDevices] = useState({});
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  const host = window.location.hostname || 'localhost';
  const WS_URL = `ws://${host}:3000`;
  const API_URL = `http://${host}:3000`;

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
              
              // Jika belum ada device aktif, set device pertama yang masuk sebagai aktif
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
  }, [token, activeDeviceId]);

  const login = async (password) => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.ok) {
        setToken(data.token);
        localStorage.setItem('sleepwell_token', data.token);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('sleepwell_token');
    if (ws.current) ws.current.close();
  };

  const sendCommand = async (payload) => {
    if (!token || !activeDeviceId) return;
    try {
      await fetch(`${API_URL}/api/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: activeDeviceId, ...payload })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Derive state for the currently active device
  const activeDevice = devices[activeDeviceId] || {};
  const state = {
    system: activeDevice.system || false,
    dht: activeDevice.dht || { temperature: 0, humidity: 0 },
    sensors: activeDevice.sensors || [],
    lampColor: activeDevice.lampColor || 'putih',
    lampBrightness: activeDevice.lampBrightness || 0
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
        login, 
        logout, 
        sendCommand 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
