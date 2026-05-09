import { useAppContext } from '../context/AppContext';

export default function Analytics() {
    const { state } = useAppContext();
    const temp = state.dht?.temperature || 0;
    
    // Hitung dummy score (contoh: 24-26 derajat itu ideal = 95 score)
    let sleepScore = 85;
    if (temp >= 24 && temp <= 26) sleepScore = 96;
    else if (temp > 28) sleepScore = 65;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* BAGIAN GRAFIK (KIRI, LEBIH LEBAR) */}
                <section className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="font-bold text-[#624633] text-xl">Tren Iklim Ruangan</h2>
                            <p className="text-xs text-gray-500">Histori suhu dan kelembapan 24 jam terakhir</p>
                        </div>
                        <span className="bg-[#f8f5f1] text-[#8c7462] px-3 py-1 rounded-full text-xs font-bold border border-[#e6ceb3]/50">Hari Ini</span>
                    </div>
                    
                    {/* Simulated Chart Container with Axes */}
                    <div className="flex-grow flex mt-4 h-56 mb-2">
                        {/* Y-Axis Labels */}
                        <div className="flex flex-col justify-between text-[10px] font-bold text-gray-400 pr-3 pb-6">
                            <span>30°C</span>
                            <span>25°C</span>
                            <span>20°C</span>
                        </div>

                        {/* Chart Area */}
                        <div className="flex-1 flex flex-col relative border-b border-l border-gray-100">
                            {/* Background Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                <div className="border-t border-gray-50 w-full h-0"></div>
                                <div className="border-t border-gray-50 w-full h-0"></div>
                                <div className="border-t border-gray-50 w-full h-0"></div>
                            </div>

                            <div className="flex-1 flex items-end gap-3 px-2 z-10 pb-[1px]">
                                {/* Bar 1 */}
                                <div className="flex-1 bg-[#f4ebe1] rounded-t-xl h-[60%] relative group transition-all hover:bg-[#e6ceb3]">
                                    <div className="absolute inset-x-0 bottom-0 bg-[#cbb39e] rounded-t-xl h-[40%] transition-all group-hover:bg-[#a68a73]"></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#624633] text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">24°C / 60%</div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">00:00</span>
                                </div>
                                {/* Bar 2 */}
                                <div className="flex-1 bg-[#f4ebe1] rounded-t-xl h-[75%] relative group transition-all hover:bg-[#e6ceb3]">
                                    <div className="absolute inset-x-0 bottom-0 bg-[#cbb39e] rounded-t-xl h-[55%] transition-all group-hover:bg-[#a68a73]"></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#624633] text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">26°C / 65%</div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">04:00</span>
                                </div>
                                {/* Bar 3 */}
                                <div className="flex-1 bg-[#f4ebe1] rounded-t-xl h-[90%] relative group transition-all hover:bg-[#e6ceb3]">
                                    <div className="absolute inset-x-0 bottom-0 bg-[#cbb39e] rounded-t-xl h-[70%] transition-all group-hover:bg-[#a68a73]"></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#624633] text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">28°C / 75%</div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">08:00</span>
                                </div>
                                {/* Bar 4 */}
                                <div className="flex-1 bg-[#f4ebe1] rounded-t-xl h-[50%] relative group transition-all hover:bg-[#e6ceb3]">
                                    <div className="absolute inset-x-0 bottom-0 bg-[#cbb39e] rounded-t-xl h-[30%] transition-all group-hover:bg-[#a68a73]"></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#624633] text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">22°C / 55%</div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">12:00</span>
                                </div>
                                {/* Bar 5 */}
                                <div className="flex-1 bg-[#f4ebe1] rounded-t-xl h-[40%] relative group transition-all hover:bg-[#e6ceb3]">
                                    <div className="absolute inset-x-0 bottom-0 bg-[#cbb39e] rounded-t-xl h-[20%] transition-all group-hover:bg-[#a68a73]"></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#624633] text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">21°C / 50%</div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">16:00</span>
                                </div>
                                {/* Bar 6 */}
                                <div className="flex-1 bg-[#f4ebe1] rounded-t-xl h-[65%] relative group transition-all hover:bg-[#e6ceb3]">
                                    <div className="absolute inset-x-0 bottom-0 bg-[#cbb39e] rounded-t-xl h-[45%] transition-all group-hover:bg-[#a68a73]"></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#624633] text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">25°C / 62%</div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">20:00</span>
                                </div>
                                {/* Bar 7 */}
                                <div className="flex-1 bg-[#f4ebe1] rounded-t-xl h-[80%] relative group transition-all hover:bg-[#e6ceb3]">
                                    <div className="absolute inset-x-0 bottom-0 bg-[#cbb39e] rounded-t-xl h-[60%] transition-all group-hover:bg-[#a68a73]"></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#624633] text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">27°C / 70%</div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">24:00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 pt-8 border-t border-gray-100 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#f4ebe1] border border-[#cbb39e]"></span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suhu (°C)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#cbb39e]"></span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kelembapan (%)</span>
                        </div>
                    </div>
                </section>

                {/* BAGIAN INFO (KANAN) */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Skor Kualitas Tidur */}
                    <section className="bg-gradient-to-br from-[#5c6b54] to-[#4a5743] rounded-3xl p-6 border border-[#4a5743] shadow-md text-white relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 text-white/10">
                            <span className="material-symbols-outlined text-9xl">bedtime</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-[#eef3ea]">monitoring</span>
                                <h3 className="font-bold text-[#eef3ea] text-sm tracking-wider uppercase">Skor Tidur Ruangan</h3>
                            </div>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-6xl font-black text-white">{sleepScore}</span>
                                <span className="text-xl text-white/70">/100</span>
                            </div>
                            <p className="text-sm text-[#dce6d3] mb-3">Kondisi ruangan saat ini {sleepScore > 90 ? 'sangat ideal' : 'cukup baik'} untuk mendapatkan tidur nyenyak.</p>
                            <div className="bg-black/20 p-2.5 rounded-lg border border-white/10 flex gap-2 items-start">
                                <span className="material-symbols-outlined text-[14px] text-white/70 mt-0.5">info</span>
                                <p className="text-[10px] text-white/80 leading-tight">
                                    Dihitung otomatis dari deviasi suhu (ideal 24-26°C) dan kelembapan (ideal 50-60%).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Estimasi Konsumsi Energi */}
                    <section className="flex-1 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[220px]">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-[#d4a373] text-lg">bolt</span>
                                <h3 className="font-bold text-[#624633] text-sm uppercase tracking-wider">Konsumsi Daya</h3>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Estimasi Hari Ini (Sistem ESP32 & LED)</p>
                        </div>
                        
                        <div>
                            <div className="flex items-end justify-between mb-2">
                                <div>
                                    <span className="text-3xl font-black text-[#624633]">0.04</span>
                                    <span className="text-sm font-bold text-gray-400 ml-1">kWh</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Estimasi Biaya</span>
                                    <p className="text-xl font-black text-[#4ade80]">Rp 60</p>
                                </div>
                            </div>
                            
                            {/* Perbandingan Harian */}
                            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-2 mb-3 border border-gray-100">
                                <span className="text-[10px] text-gray-500 font-semibold">Pemakaian Kemarin:</span>
                                <div className="text-right flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-700">0.06 kWh</span>
                                    <span className="text-[9px] text-gray-400">(Rp 86)</span>
                                    <span className="material-symbols-outlined text-[12px] text-[#4ade80]">arrow_downward</span>
                                </div>
                            </div>

                            <div className="bg-[#fcfaf8] p-2.5 rounded-lg border border-[#e6ceb3]/30 flex gap-2 items-start mt-auto">
                                <span className="material-symbols-outlined text-[14px] text-[#d4a373] mt-0.5">functions</span>
                                <p className="text-[9px] text-gray-500 leading-tight">
                                    <strong>Rumus:</strong> (Total Jam Alat Aktif x Daya Alat 5W) ÷ 1000 x TDL Rp 1.444/kWh. <br/>
                                    <em>*Kalkulasi jam aktif disinkronkan dengan durasi Threshold Automasi.</em>
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Weekly Insight */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-[#fdfbf7] p-6 rounded-3xl border border-[#e6ceb3]/50 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-[#d4a373]">
                        <span className="material-symbols-outlined text-2xl">tips_and_updates</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#624633] text-lg mb-1">Insight Mingguan</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Berdasarkan data minggu ini, kamar sering berada di <span className="font-bold text-[#8c7462]">Zona Rawan Nyamuk</span> pada jam <span className="font-bold text-[#8c7462]">18:00 - 20:00</span>. Kami menyarankan untuk mengatur <strong>Timer Auto-ON</strong> pada jam tersebut untuk pencegahan maksimal.
                        </p>
                    </div>
                </section>

                {/* Riwayat Harian Table */}
                <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[#624633] text-sm uppercase tracking-wider">Riwayat Konsumsi 7 Hari Terakhir</h3>
                        <span className="text-[10px] font-bold text-[#8c7462] bg-[#f8f5f1] px-2 py-1 rounded-full border border-[#e6ceb3]/30">Auto-Logged</span>
                    </div>
                    <div className="space-y-2">
                        {[
                            { date: '08 Mei 2026', kwh: '0.06', cost: '86' },
                            { date: '07 Mei 2026', kwh: '0.04', cost: '57' },
                            { date: '06 Mei 2026', kwh: '0.09', cost: '130' },
                            { date: '05 Mei 2026', kwh: '0.05', cost: '72' },
                            { date: '04 Mei 2026', kwh: '0.04', cost: '57' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-[#faf9f8] rounded-2xl border border-gray-50 hover:border-[#e6ceb3]/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8c7462] shadow-sm">
                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    </div>
                                    <span className="text-xs font-bold text-[#624633]">{log.date}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-[#624633]">{log.kwh} <span className="text-[10px] text-gray-400 font-bold">kWh</span></p>
                                    <p className="text-[10px] font-bold text-[#4ade80]">Rp {log.cost}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
