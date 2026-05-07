import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Login() {
  const { login } = useAppContext();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(password);
    if (!success) {
      setError('Password salah atau server mati!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">lock</span>
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">SleepWell Login</h2>
        <p className="text-on-surface-variant mb-6">Masukkan password admin untuk masuk ke sistem kontrol.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password..."
              className="w-full bg-surface-variant/50 border border-outline rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
