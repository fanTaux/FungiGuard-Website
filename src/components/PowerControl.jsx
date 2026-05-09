import { useAppContext } from '../context/AppContext';

export default function PowerControl() {
    const { state, sendCommand, espLastSeen } = useAppContext();
    
    const ESP_TIMEOUT = 15000;
    const now = Date.now();
    const espIsAlive = espLastSeen > 0 && (now - espLastSeen < ESP_TIMEOUT);

    const handleToggle = () => {
        if (!espIsAlive) return; // Disable if offline
        sendCommand({ system: !state.system });
    };

    return (
        <section className="glass-card rounded-xl p-md flex flex-col h-full justify-between relative overflow-hidden">
            {/* Background glowing effect */}
            {state.system && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#4ade80]/20 blur-3xl rounded-full pointer-events-none"></div>
            )}
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Master Power</h2>
                    <p className="text-[11px] text-on-surface-variant">Kendali Utama Sistem SleepWell</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold border ${state.system ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30' : 'bg-surface-variant text-on-surface-variant border-transparent'}`}>
                    {state.system ? 'SISTEM AKTIF' : 'SISTEM MATI'}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-2">
                <button 
                    onClick={handleToggle}
                    disabled={!espIsAlive}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        !espIsAlive 
                            ? 'bg-surface-variant cursor-not-allowed opacity-50' 
                            : state.system 
                                ? 'bg-gradient-to-br from-[#4ade80] to-[#22c55e] hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] hover:scale-105' 
                                : 'bg-gradient-to-br from-surface-variant to-gray-300 hover:scale-105'
                    }`}
                >
                    <span className={`material-symbols-outlined text-4xl transition-colors duration-300 ${state.system ? 'text-white' : 'text-gray-500'}`}>
                        power_settings_new
                    </span>
                    
                    {/* Ripple effect rings when active */}
                    {state.system && (
                        <>
                            <div className="absolute inset-0 rounded-full border-2 border-[#4ade80] opacity-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                            <div className="absolute inset-[-8px] rounded-full border-2 border-[#4ade80] opacity-0 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] delay-300"></div>
                        </>
                    )}
                </button>
                
                <p className="mt-5 text-xs text-center text-on-surface-variant max-w-[200px]">
                    {espIsAlive 
                        ? state.system 
                            ? "Sistem sedang berjalan dan melindungi ruangan."
                            : "Klik tombol di atas untuk menyalakan sistem."
                        : "Sistem tidak dapat dinyalakan karena perangkat terputus."
                    }
                </p>
            </div>
            
        </section>
    );
}
