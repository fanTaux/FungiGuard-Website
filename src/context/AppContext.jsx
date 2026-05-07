import { createContext, useContext, useEffect, useState, useRef } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('sleepwell_token') || null);
  const [state, setState] = useState({
    system: false,
    dht: { temperature: 0, humidity: 0 },
    sensors: [],
    lampColor: 'putih',
    lampBrightness: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [espLastSeen, setEspLastSeen] = useState(0);
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
          if (msg.type === 'state') {
            setState(prev => ({ ...prev, ...msg.data }));
            setEspLastSeen(Date.now());
          } else if (msg.type === 'sensor' || msg.type === 'status') {
            setState(prev => ({ ...prev, ...msg.data }));
            setEspLastSeen(Date.now());
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
  }, [token]);

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
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider value={{ state, isConnected, espLastSeen, token, login, logout, sendCommand }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
