import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function DashboardMetrics() {
    const { state, espLastSeen, isConnected, token, activeDeviceId } = useAppContext();
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanDuration, setScanDuration] = useState(5); // dalam detik
    const [scanLocation, setScanLocation] = useState('');
    const [scanNotes, setScanNotes] = useState('');
    const [scanResult, setScanResult] = useState(null);

    const locations = ['Tembok', 'Lemari', 'Bawah Kasur', 'Elektronik', 'Gudang', 'Area Kayu'];
    const durations = [5, 10, 20, 30];

    const host = window.location.hostname || 'localhost';
    const API_URL = `http://${host}:3000`;

    const ESP_TIMEOUT = 15000;
    const now = Date.now();
    const espIsAlive = espLastSeen > 0 && (now - espLastSeen < ESP_TIMEOUT);

    const [dummyTemp, setDummyTemp] = useState(27.4);
    const [dummyHum, setDummyHum] = useState(65);

    useEffect(() => {
        if (!espIsAlive) {
            const interval = setInterval(() => {
                setDummyTemp(prev => prev + (Math.random() * 0.4 - 0.2));
                setDummyHum(prev => Math.round(prev + (Math.random() * 2 - 1)));
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [espIsAlive]);

    const temp = espIsAlive ? (state.dht?.temperature || 0) : dummyTemp;
    const hum = espIsAlive ? (state.dht?.humidity || 0) : dummyHum;

    // Logika Hitung Risiko Jamur (Mold Risk)
    const calculateRisk = () => {
        let risk = 0;
        if (hum > 60) risk += (hum - 60) * 2;
        if (temp >= 20 && temp <= 30) risk += 20;
        return Math.min(Math.round(risk), 100);
    };

    const moldRisk = espIsAlive ? calculateRisk() : 0;
    const minDistance = espIsAlive && state.sensors ? Math.min(...state.sensors.map(s => s.jarak || 999)) : 999;
    const isDistanceValid = minDistance >= 25 && minDistance <= 35;

    const startScan = () => {
        if (!espIsAlive || !isDistanceValid || !scanLocation) return;
        setIsScanning(true);
        setScanProgress(0);
        setScanResult(null);
    };

    const saveScanResult = async (insight) => {
        try {
            await fetch(`${API_URL}/api/scans`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    deviceId: activeDeviceId,
                    location: scanLocation,
                    riskLevel: moldRisk,
                    temperature: temp,
                    humidity: hum,
                    message: insight.desc,
                    notes: scanNotes,
                    duration: scanDuration
                })
            });
        } catch (e) {
            console.error('Gagal simpan scan:', e);
        }
    };

    useEffect(() => {
        if (isScanning) {
            const durationMs = scanDuration * 1000;
            const interval = durationMs / 100;
            const timer = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        setIsScanning(false);
                        const insight = generateAIInsight();
                        saveScanResult(insight);
                        return 100;
                    }
                    return prev + 1;
                });
            }, interval);
            return () => clearInterval(timer);
        }
    }, [isScanning, scanDuration]);

    const generateAIInsight = () => {
        let insight = {
            level: 'Rendah',
            color: 'text-green-500',
            bg: 'bg-green-50',
            icon: 'check_circle',
            desc: `Area ${scanLocation} relatif aman dari jamur.`
        };

        if (moldRisk > 70) {
            insight = {
                level: 'Bahaya',
                color: 'text-red-600',
                bg: 'bg-red-50',
                icon: 'warning',
                desc: `Risiko jamur sangat tinggi pada ${scanLocation}!`
            };
        } else if (moldRisk > 40) {
            insight = {
                level: 'Waspada',
                color: 'text-orange-500',
                bg: 'bg-orange-50',
                icon: 'error',
                desc: `Area ${scanLocation} berisiko jamur tingkat sedang.`
            };
        }
        setScanResult(insight);
        return insight;
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: CONFIGURATION & CALIBRATION */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-[#f1f8f5] rounded-2xl flex items-center justify-center text-[#2d6a4f] shadow-inner">
                                <span className="material-symbols-outlined text-3xl font-bold">query_stats</span>
                            </div>
                            <div>
                                <h2 className="font-black text-[#1b4332] text-2xl tracking-tight uppercase">Mold Scanner Setup</h2>
                                <p className="text-xs text-gray-400 font-bold tracking-widest">KONFIGURASI PEMINDAIAN AREA</p>
                            </div>
                        </div>

                        {/* STEP 1: LOCATION */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white text-[10px] font-black flex items-center justify-center">1</span>
                                <h3 className="text-xs font-black text-[#1b4332] uppercase tracking-wider">Pilih Lokasi Objek</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {locations.map(loc => (
                                    <button 
                                        key={loc}
                                        onClick={() => setScanLocation(loc)}
                                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border-2 ${scanLocation === loc ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* STEP 1.5: NOTES */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white text-[10px] font-black flex items-center justify-center">1+</span>
                                <h3 className="text-xs font-black text-[#1b4332] uppercase tracking-wider">Catatan Tambahan (Opsional)</h3>
                            </div>
                            <textarea 
                                value={scanNotes}
                                onChange={(e) => setScanNotes(e.target.value)}
                                placeholder="Misal: Area dekat jendela, baru dicuci, dll..."
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-xs font-bold text-[#1b4332] focus:border-[#52b788] focus:outline-none transition-all placeholder:text-gray-300 resize-none"
                                rows="2"
                            ></textarea>
                        </div>

                        {/* STEP 2: DURATION */}
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white text-[10px] font-black flex items-center justify-center">2</span>
                                <h3 className="text-xs font-black text-[#1b4332] uppercase tracking-wider">Durasi Deteksi</h3>
                            </div>
                            <div className="flex gap-3">
                                {durations.map(d => (
                                    <button 
                                        key={d}
                                        onClick={() => setScanDuration(d)}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all border-2 ${scanDuration === d ? 'bg-[#52b788] text-white border-[#52b788] shadow-md' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}
                                    >
                                        {d} DETIK
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* STEP 3: CALIBRATION & EXECUTION */}
                        <div className="bg-[#f8fafc] rounded-[1.5rem] p-8 border border-gray-100 flex flex-col items-center relative">
                            <div className="absolute top-4 left-6 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white text-[10px] font-black flex items-center justify-center">3</span>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kalibrasi & Scan</h3>
                            </div>

                            <div className="relative w-40 h-40 mt-6 mb-8 flex items-center justify-center">
                                {/* Pulse Effect when valid or scanning */}
                                {(isDistanceValid || isScanning) && (
                                    <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></div>
                                )}
                                <div className={`absolute inset-0 rounded-full border-4 border-dashed transition-all duration-700 ${isDistanceValid ? 'border-green-400 scale-110' : 'border-gray-200 scale-100'} animate-[spin_20s_linear_infinite]`}></div>
                                <div className={`w-32 h-32 rounded-full z-10 flex flex-col items-center justify-center transition-all duration-500 shadow-xl ${isDistanceValid || isScanning ? 'bg-green-500 text-white' : 'bg-white text-gray-300'}`}>
                                    <span className="text-3xl font-black">{minDistance === 999 ? '30' : Math.round(minDistance)}</span>
                                    <span className="text-[10px] font-black tracking-widest uppercase">CM</span>
                                </div>
                                {isScanning && (
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 z-20">
                                        <circle cx="80" cy="80" r="76" fill="transparent" stroke="white" strokeWidth="8" strokeDasharray="477.5" strokeDashoffset={477.5 - (477.5 * scanProgress) / 100} strokeLinecap="round" className="transition-all duration-200" />
                                    </svg>
                                )}
                            </div>

                            {!scanLocation && (
                                <p className="text-[#1b4332] text-[10px] font-black uppercase mb-4 opacity-50 italic">Pilih lokasi terlebih dahulu</p>
                            )}
                            
                            {!isDistanceValid && espIsAlive && scanLocation && !isScanning && (
                                <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-6 animate-pulse">Dekatkan Alat ke Objek (30cm)</p>
                            )}

                            {!espIsAlive && scanLocation && (
                                <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-1 opacity-70">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Demo Mode: Device is Offline
                                </p>
                            )}

                            <button 
                                onClick={startScan}
                                disabled={!scanLocation || isScanning}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-3 ${!scanLocation || isScanning ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-white active:scale-95 shadow-green-900/20'}`}
                            >
                                <span className="material-symbols-outlined">{isScanning ? 'sync' : 'center_focus_strong'}</span>
                                {isScanning ? `Pemindaian ${scanProgress}%` : 'Mulai Scan Sekarang'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: LIVE DATA & RESULTS */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                             Real-time Environment
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#f1f8f5] p-5 rounded-3xl border border-green-50 shadow-inner">
                                <span className="material-symbols-outlined text-[#2d6a4f] text-2xl mb-2">water_drop</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lembap</p>
                                <p className="text-2xl font-black text-[#1b4332]">{hum}%</p>
                            </div>
                            <div className="bg-[#fffdfb] p-5 rounded-3xl border border-orange-50 shadow-inner">
                                <span className="material-symbols-outlined text-orange-400 text-2xl mb-2">thermostat</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suhu</p>
                                <p className="text-2xl font-black text-[#1b4332]">{temp}°C</p>
                            </div>
                        </div>
                    </div>

                    {/* Mold Risk Gauge */}
                    <div className="bg-[#1b4332] rounded-[2rem] p-8 shadow-xl flex flex-col items-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                        <h3 className="text-[10px] font-black text-green-300/50 uppercase tracking-[0.2em] mb-8 w-full">Current Risk Status</h3>
                        
                        <div className="relative w-40 h-20 overflow-hidden mb-4">
                            <div className="w-40 h-40 rounded-full border-[15px] border-white/10"></div>
                            <div 
                                className={`absolute top-0 left-0 w-40 h-40 rounded-full border-[15px] transition-all duration-1000`}
                                style={{ 
                                    borderColor: moldRisk > 70 ? '#ff4d4d' : moldRisk > 40 ? '#f97316' : '#4ade80',
                                    clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 50%)`,
                                    transform: `rotate(${(moldRisk / 100) * 180 - 180}deg)`
                                }}
                            ></div>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-black mb-1">{moldRisk}%</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full inline-block ${moldRisk > 70 ? 'bg-red-500/20 text-red-400' : moldRisk > 40 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                {moldRisk > 70 ? 'Extreme' : moldRisk > 40 ? 'Warning' : 'Safe'}
                            </p>
                        </div>
                    </div>

                    {/* AI Result Card */}
                    {scanResult && (
                        <div className={`${scanResult.bg} rounded-[2rem] p-8 border-4 border-white shadow-2xl animate-bounce-in`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl ${scanResult.bg} flex items-center justify-center shadow-inner border border-white`}>
                                    <span className={`material-symbols-outlined ${scanResult.color}`}>{scanResult.icon}</span>
                                </div>
                                <h4 className={`font-black text-[10px] uppercase tracking-[0.2em] ${scanResult.color}`}>AI Diagnosis Result</h4>
                            </div>
                            <p className="text-lg font-black text-[#1b4332] mb-1 leading-tight">{scanResult.level}!</p>
                            <p className="text-xs font-bold text-[#1b4332]/70 leading-relaxed">{scanResult.desc}</p>
                            <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#2d6a4f] uppercase tracking-widest bg-white/40 py-2 px-4 rounded-xl w-fit">
                                <span className="material-symbols-outlined text-sm">history</span>
                                Tersimpan di History
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
