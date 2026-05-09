import { useState } from 'react';

export default function SmartAutomation() {
    const [timerHours, setTimerHours] = useState(8);
    const [timerMinutes, setTimerMinutes] = useState(0);
    const [startTime, setStartTime] = useState('19:00');
    const [endTime, setEndTime] = useState('06:00');
    const [isScheduleActive, setIsScheduleActive] = useState(true);

    return (
        <div className="space-y-6 pb-8">
            
            {/* 1. PROTEKSI OTOMATIS */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#f8f5f1] flex items-center justify-center text-[#8c7462]">
                            <span className="material-symbols-outlined">shield_with_heart</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-[#624633] text-xl">Proteksi Otomatis</h2>
                            <p className="text-xs text-gray-500">Aktifkan sistem saat mendeteksi zona rawan</p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="font-semibold text-sm text-gray-700">Sensitivitas Suhu & Kelembapan</span>
                            <p className="text-[11px] text-[#8c7462] font-medium bg-[#f4ebe1] px-2 py-0.5 rounded-full inline-block">Aktif jika: Temp &gt; 28°C &amp; Humid &gt; 70%</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-[#eef3ea] text-[#667b68] px-3 py-1 rounded-full text-xs font-bold border border-[#dce6d3]">Tinggi</span>
                        </div>
                    </div>
                    <input className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8c7462]" type="range" defaultValue="85" />
                </div>
            </section>

            {/* 2. PENJADWALAN WAKTU */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#eef3ea] flex items-center justify-center text-[#667b68]">
                            <span className="material-symbols-outlined">event_note</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-[#624633] text-xl">Penjadwalan Rutin</h2>
                            <p className="text-xs text-gray-500">Atur jam nyala dan mati secara otomatis setiap hari</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isScheduleActive} 
                            onChange={(e) => setIsScheduleActive(e.target.checked)} 
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5c6b54]"></div>
                    </label>
                </div>

                <div className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${isScheduleActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="bg-[#fdfbf7] border border-gray-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[#8c7462] text-sm">wb_twilight</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jam Nyala</span>
                        </div>
                        <input 
                            type="time" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-lg font-bold text-[#624633] focus:outline-none focus:border-[#8c7462] focus:ring-1 focus:ring-[#8c7462]"
                        />
                    </div>
                    
                    <div className="bg-[#fdfbf7] border border-gray-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[#8c7462] text-sm">wb_sunny</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jam Mati</span>
                        </div>
                        <input 
                            type="time" 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-lg font-bold text-[#624633] focus:outline-none focus:border-[#8c7462] focus:ring-1 focus:ring-[#8c7462]"
                        />
                    </div>
                </div>
            </section>

            {/* 3. TIMER OPERASIONAL */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#f4f5f0] flex items-center justify-center text-[#8c7462]">
                        <span className="material-symbols-outlined">hourglass_top</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-[#624633] text-xl">Timer Sekali Pakai</h2>
                        <p className="text-xs text-gray-500">Nyalakan sistem untuk durasi tertentu mulai dari sekarang</p>
                    </div>
                </div>

                <div className="bg-[#fdfbf7] border border-[#e6ceb3]/50 rounded-2xl p-6 relative z-10">
                    <div className="text-center mb-6 flex justify-center items-end gap-2">
                        <div>
                            <span className="text-5xl font-black text-[#624633]">{timerHours}</span>
                            <span className="text-sm font-bold text-gray-400 ml-1">Jam</span>
                        </div>
                        <span className="text-3xl font-bold text-gray-300 pb-1">:</span>
                        <div>
                            <span className="text-5xl font-black text-[#624633]">{timerMinutes.toString().padStart(2, '0')}</span>
                            <span className="text-sm font-bold text-gray-400 ml-1">Mnt</span>
                        </div>
                    </div>
                    
                    <div className="space-y-5 mb-8">
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 px-1">
                                <span>0 Jam</span>
                                <span>Jam</span>
                                <span>12 Jam</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="12" 
                                value={timerHours}
                                onChange={(e) => setTimerHours(e.target.value)}
                                className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#8c7462]" 
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 px-1">
                                <span>0 Mnt</span>
                                <span>Menit</span>
                                <span>59 Mnt</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="59" 
                                value={timerMinutes}
                                onChange={(e) => setTimerMinutes(e.target.value)}
                                className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#5c6b54]" 
                            />
                        </div>
                    </div>

                    <button 
                        className={`w-full py-3.5 rounded-xl font-bold shadow-md transition-colors flex items-center justify-center gap-2 ${timerHours == 0 && timerMinutes == 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#5c6b54] text-white hover:bg-[#4a5743]'}`}
                        disabled={timerHours == 0 && timerMinutes == 0}
                    >
                        <span className="material-symbols-outlined text-lg">play_circle</span>
                        Mulai Timer
                    </button>
                </div>
            </section>
        </div>
    );
}
