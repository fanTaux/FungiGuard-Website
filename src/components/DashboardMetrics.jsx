export default function DashboardMetrics() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Suhu Kamar */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Suhu Kamar</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">26°C</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-fixed/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">thermostat</span>
                </div>
            </div>
            {/* Kelembapan */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Kelembapan</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">65%</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary-fixed/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-3xl">water_drop</span>
                </div>
            </div>
            {/* Status Perangkat */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Status Perangkat</p>
                    <div className="flex items-center gap-xs">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <h3 className="font-label-lg text-label-lg text-secondary">Standby Mode</h3>
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
                        <h3 className="font-headline-lg text-headline-lg text-on-surface">5/5</h3>
                        <span className="font-label-lg text-label-lg text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded-md">Secured</span>
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
                        <span className="w-3 h-3 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]"></span>
                        <h3 className="font-headline-lg text-headline-lg text-on-surface leading-none">ON</h3>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-container/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">power_settings_new</span>
                </div>
            </div>
            {/* Koneksi WiFi */}
            <div className="glass-card rounded-xl p-md flex items-center justify-between">
                <div>
                    <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Koneksi WiFi</p>
                    <div className="flex items-center gap-xs mt-1">
                        <span className="material-symbols-outlined text-secondary text-xl">wifi</span>
                        <h3 className="font-label-lg text-label-lg text-secondary">Connected</h3>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-3xl">router</span>
                </div>
            </div>
        </div>
    );
}
