import { useAppContext } from '../context/AppContext';

export default function DashboardMetrics() {
    const { state, espLastSeen, isConnected } = useAppContext();
    const temp = state.dht?.temperature || 0;
    const hum = state.dht?.humidity || 0;
    
    // Hitung jumlah sensor yang aktif (timeout > 15s atau jarak >= 999 = mati/error)
    const ESP_TIMEOUT = 15000;
    const now = Date.now();
    const espIsAlive = espLastSeen > 0 && (now - espLastSeen < ESP_TIMEOUT);
    
    let activeSensors = 0;
    if (espIsAlive && state.sensors) {
        state.sensors.forEach(s => {
            if (s && s.jarak < 999) activeSensors++;
        });
    }

    const sysLabel = state.system ? 'ON' : 'OFF';
    const sysColor = state.system ? 'text-[#4ade80]' : 'text-on-surface-variant';
    const sysBg = state.system ? 'bg-[#4ade80]' : 'bg-surface-variant';
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Suhu Kamar */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Suhu Kamar</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{temp}°C</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-fixed/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">thermostat</span>
                </div>
            </div>
            {/* Kelembapan */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Kelembapan</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{hum}%</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary-fixed/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-3xl">water_drop</span>
                </div>
            </div>
            {/* Status Perangkat (ESP32 Hardware) */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Koneksi ESP32</p>
                    <div className="flex items-center gap-xs">
                        <span className={`w-2 h-2 rounded-full ${espIsAlive ? 'bg-secondary' : 'bg-red-500'}`}></span>
                        <h3 className={`font-label-lg text-label-lg ${espIsAlive ? 'text-secondary' : 'text-red-500'}`}>
                            {espIsAlive ? 'ONLINE' : 'TERPUTUS'}
                        </h3>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-3xl">check_circle</span>
                </div>
            </div>
            {/* Kondisi Sensor */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Kondisi Sensor</p>
                    <div className="flex items-center gap-xs">
                        <h3 className={`font-headline-lg text-headline-lg ${activeSensors < 6 ? 'text-red-400' : 'text-on-surface'}`}>{activeSensors}/6</h3>
                        <span className={`font-label-lg text-label-lg px-2 py-0.5 rounded-md ${activeSensors < 6 ? 'text-red-400 bg-red-400/10' : 'text-[#4ade80] bg-[#4ade80]/10'}`}>
                            {activeSensors < 6 ? 'Warning' : 'Secured'}
                        </span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#4ade80] text-3xl">sensors</span>
                </div>
            </div>
            {/* SleepWell Status */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">SleepWell Power</p>
                    <div className="flex items-center gap-xs mt-1">
                        <span className={`w-3 h-3 rounded-full ${sysBg} ${state.system ? 'shadow-[0_0_8px_#4ade80]' : ''}`}></span>
                        <h3 className={`font-headline-lg text-headline-lg ${sysColor} leading-none`}>{sysLabel}</h3>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-container/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">power_settings_new</span>
                </div>
            </div>
            {/* Koneksi WiFi */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Koneksi Server</p>
                    <div className="flex items-center gap-xs mt-1">
                        <span className={`material-symbols-outlined text-xl ${isConnected ? 'text-secondary' : 'text-red-500'}`}>{isConnected ? 'wifi' : 'wifi_off'}</span>
                        <h3 className={`font-label-lg text-label-lg ${isConnected ? 'text-secondary' : 'text-red-500'}`}>{isConnected ? 'Terhubung' : 'Terputus'}</h3>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-3xl">router</span>
                </div>
            </div>
        </div>
    );
}
