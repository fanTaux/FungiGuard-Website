import { useAppContext } from '../context/AppContext';

export default function DashboardMetrics() {
    const { state, espLastSeen, isConnected } = useAppContext();
    // Hitung jumlah sensor yang aktif (timeout > 15s atau jarak >= 999 = mati/error)
    const ESP_TIMEOUT = 15000;
    const now = Date.now();
    const espIsAliveState = espLastSeen > 0 && (now - espLastSeen < ESP_TIMEOUT);

    const temp = espIsAliveState ? (state.dht?.temperature || 0) : '--';
    const hum = espIsAliveState ? (state.dht?.humidity || 0) : '--';
    
    let activeSensors = 0;
    if (espIsAliveState && state.sensors) {
        state.sensors.forEach(s => {
            if (s && s.jarak < 999) activeSensors++;
        });
    }
    const displaySensors = espIsAliveState ? activeSensors : '-';

    const sysLabel = state.system ? 'ON' : 'OFF';
    const sysColor = state.system ? 'text-[#4ade80]' : 'text-on-surface-variant';
    const sysBg = state.system ? 'bg-[#4ade80]' : 'bg-surface-variant';
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {/* Suhu Kamar */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between border-l-4 border-primary">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Suhu Kamar</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{temp}°C</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-fixed/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">thermostat</span>
                </div>
            </div>

            {/* Kelembapan */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between border-l-4 border-secondary">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Kelembapan</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{hum}%</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary-fixed/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-3xl">water_drop</span>
                </div>
            </div>

            {/* Status Perangkat (ESP32 Hardware) */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between border-l-4 border-secondary-container">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Status Perangkat</p>
                    <div className="flex items-center gap-xs">
                        <span className={`w-2 h-2 rounded-full ${espIsAliveState ? 'bg-secondary' : 'bg-red-500'}`}></span>
                        <h3 className={`font-label-lg text-label-lg ${espIsAliveState ? 'text-secondary' : 'text-red-500'}`}>
                            {espIsAliveState ? 'ONLINE' : 'TERPUTUS'}
                        </h3>
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-full ${espIsAliveState ? 'bg-secondary-container/50' : 'bg-red-500/10'} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${espIsAliveState ? 'text-secondary' : 'text-red-500'} text-3xl`}>
                        {espIsAliveState ? 'check_circle' : 'cancel'}
                    </span>
                </div>
            </div>

            {/* Estimasi Biaya (Energi) */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between border-l-4 border-[#4ade80]">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Biaya Hari Ini</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="font-headline-lg text-headline-lg text-[#4ade80]">Rp 60</h3>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Estimated</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#4ade80] text-3xl">payments</span>
                </div>
            </div>

            {/* Resiko Nyamuk */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between border-l-4 border-orange-400">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Resiko Nyamuk</p>
                    <div className="flex items-center gap-2">
                        <h3 className={`font-headline-lg text-headline-lg ${temp > 28 && hum > 70 ? 'text-orange-500' : 'text-on-surface'}`}>
                            {temp > 28 && hum > 70 ? 'Tinggi' : 'Rendah'}
                        </h3>
                        <span className={`w-2 h-2 rounded-full ${temp > 28 && hum > 70 ? 'bg-orange-500 animate-pulse' : 'bg-[#4ade80]'}`}></span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className={`material-symbols-outlined ${temp > 28 && hum > 70 ? 'text-orange-500' : 'text-gray-400'} text-3xl`}>bug_report</span>
                </div>
            </div>

            {/* Waktu Aktif */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between border-l-4 border-blue-400">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Waktu Aktif</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">8.5 Jam</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-400 text-3xl">avg_time</span>
                </div>
            </div>

        {/* Kondisi Sensor */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between border-l-4 border-tertiary">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Kondisi Sensor</p>
                    <div className="flex items-center gap-xs">
                        <h3 className={`font-headline-lg text-headline-lg ${espIsAliveState && activeSensors < 6 ? 'text-red-400' : 'text-on-surface'}`}>{displaySensors}/6</h3>
                        <span className={`font-label-lg text-label-lg px-2 py-0.5 rounded-md ${!espIsAliveState || activeSensors < 6 ? 'text-red-400 bg-red-400/10' : 'text-[#4ade80] bg-[#4ade80]/10'}`}>
                            {!espIsAliveState ? 'Offline' : (activeSensors < 6 ? 'Warning' : 'Secured')}
                        </span>
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-full ${!espIsAliveState || activeSensors < 6 ? 'bg-red-400/20' : 'bg-[#4ade80]/20'} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${!espIsAliveState || activeSensors < 6 ? 'text-red-400' : 'text-[#4ade80]'} text-3xl`}>sensors</span>
                </div>
            </div>

            {/* SleepWell Status */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between border-l-4 border-primary-container">
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

            {/* Koneksi Server */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between border-l-4 border-secondary-container">
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
