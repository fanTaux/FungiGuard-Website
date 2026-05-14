import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

export default function DashboardMetrics() {
    const { state, espLastSeen, isConnected, token, activeDeviceId, devices, isDeviceOnline } = useAppContext();
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanDuration, setScanDuration] = useState(15);
    const [scanLocation, setScanLocation] = useState('');
    const [scanNotes, setScanNotes] = useState('');
    const [scanHistory, setScanHistory] = useState([]);
    const [selectedScan, setSelectedScan] = useState(null);
    const [scanToDelete, setScanToDelete] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [predictionSamples, setPredictionSamples] = useState([]);

    // --- REFS: selalu punya nilai terbaru, aman dibaca dari timer closure ---
    const predictionSamplesRef = useRef([]);
    const tempRef = useRef(0);
    const humRef = useRef(0);
    const scanLocationRef = useRef('');
    const scanNotesRef = useRef('');
    const activeDeviceIdRef = useRef(null);
    const devicesRef = useRef({});
    const tokenRef = useRef(null);
    const timerRef = useRef(null);


    const durations = [15, 30, 60];

    const host = window.location.hostname || 'localhost';
    const API_URL = `http://${host}:3000`;


    const [dummyTemp, setDummyTemp] = useState(27.4);
    const [dummyHum, setDummyHum] = useState(65);

    useEffect(() => {
        if (!isDeviceOnline) {
            const interval = setInterval(() => {
                setDummyTemp(prev => prev + (Math.random() * 0.4 - 0.2));
                setDummyHum(prev => Math.round(prev + (Math.random() * 2 - 1)));
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isDeviceOnline]);

    const { system, dht, ldr } = state;
    const temp = isDeviceOnline ? (dht?.temperature || 0) : dummyTemp;
    const hum = isDeviceOnline ? (dht?.humidity || 0) : dummyHum;

    // Sync semua nilai ke refs setiap render
    useEffect(() => { tempRef.current = temp; }, [temp]);
    useEffect(() => { humRef.current = hum; }, [hum]);
    useEffect(() => { scanLocationRef.current = scanLocation; }, [scanLocation]);
    useEffect(() => { scanNotesRef.current = scanNotes; }, [scanNotes]);
    useEffect(() => { activeDeviceIdRef.current = activeDeviceId; }, [activeDeviceId]);
    useEffect(() => { devicesRef.current = devices; }, [devices]);
    useEffect(() => { tokenRef.current = token; }, [token]);

    // Fetch history dari server — terima parameter langsung agar tidak bergantung pada ref timing
    const fetchHistory = async (devId, tok) => {
        let id = devId || activeDeviceIdRef.current;
        
        // Fallback: jika id kosong, coba ambil alat pertama yang tersedia
        if (!id) {
            const availableIds = Object.keys(devicesRef.current);
            if (availableIds.length > 0) {
                id = availableIds[0];
                console.log('[HISTORY] Fallback ke alat pertama:', id);
            }
        }

        const t = tok || tokenRef.current;
        if (!id || !t) { 
            console.warn('[HISTORY] Skip fetch: no deviceId or token yet'); 
            return; 
        }
        
        setHistoryLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/scans/${id}`, {
                headers: { 'Authorization': `Bearer ${t}` }
            });
            const data = await res.json();
            console.log('[HISTORY] Fetch result:', data);
            if (data.ok) setScanHistory(data.scans);
        } catch (e) { console.error('Fetch history err:', e); }
        finally { setHistoryLoading(false); }
    };

    const confirmDelete = (e, id) => {
        e.stopPropagation();
        setScanToDelete(id);
    };

    const performDelete = async () => {
        if (!scanToDelete) return;
        const id = scanToDelete;
        
        try {
            console.log('[DEBUG] Mengirim request DELETE ke:', `${API_URL}/api/scans/${id}`);
            const res = await fetch(`${API_URL}/api/scans/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${tokenRef.current}` }
            });
            const data = await res.json();
            console.log('[DEBUG] Respon hapus:', data);
            
            if (data.ok) {
                setScanHistory(prev => prev.filter(s => s.id !== id));
            } else {
                alert('Gagal menghapus: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('[DEBUG] Delete scan error:', err);
            alert('Terjadi kesalahan jaringan: ' + err.message);
        } finally {
            setScanToDelete(null);
        }
    };

    // Fetch history saat pertama mount atau activeDeviceId berubah — kirim nilai langsung
    useEffect(() => {
        if (activeDeviceId && token) fetchHistory(activeDeviceId, token);
    }, [activeDeviceId, token]);

    const startScan = () => {
        if (!scanLocation || isScanning) return;
        if (!activeDeviceId) {
            alert('⚠️ Alat belum terdeteksi/terpilih. Mohon pilih ruangan di pojok kanan atas sebelum memulai analisis.');
            return;
        }
        predictionSamplesRef.current = [];
        setPredictionSamples([]);
        setScanProgress(0);
        setScanResult(null);
        setIsScanning(true);
    };

    const cancelScan = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsScanning(false);
        setScanProgress(0);
        setPredictionSamples([]);
        predictionSamplesRef.current = [];
    };

    // NGUMPULIN DATA PREDIKSI TIAP ADA UPDATE DARI AI (Selama Scan)
    useEffect(() => {
        if (isScanning && typeof state.aiRisk !== 'undefined') {
            predictionSamplesRef.current = [...predictionSamplesRef.current, state.aiRisk];
            setPredictionSamples(predictionSamplesRef.current);
        }
    }, [state.aiRisk, isScanning]);



    // Menjalankan interval scan
    useEffect(() => {
        if (isScanning) {
            const durationMs = scanDuration * 1000;
            const interval = durationMs / 100;
            
            const timer = setInterval(() => {
                setScanProgress(prev => {
                    const next = prev + 1;
                    if (next >= 100) {
                        clearInterval(timer);
                        return 100;
                    }
                    return next;
                });
            }, interval);
            
            timerRef.current = timer;
            return () => clearInterval(timer);
        }
    }, [isScanning, scanDuration]);

    // Menangani aksi setelah scan selesai
    useEffect(() => {
        if (isScanning && scanProgress === 100) {
            setIsScanning(false);
            const insight = finalizeScanResultFromRefs();
            console.log('[SCANNER] Scan Selesai!', insight);
            
            saveScanResultFromRefs(insight).then(() => {
                setTimeout(() => fetchHistory(activeDeviceIdRef.current, tokenRef.current), 500);
            });
        }
    }, [scanProgress, isScanning]);

    // Versi dari REFS — aman dipanggil dari timer closure
    const finalizeScanResultFromRefs = () => {
        const samples = predictionSamplesRef.current;
        const currentHum = humRef.current;
        const locName = scanLocationRef.current;

        let finalRisk = 0;
        if (samples.length > 0) {
            const counts = {};
            samples.forEach(x => counts[x] = (counts[x] || 0) + 1);
            finalRisk = parseInt(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b));
        } else {
            finalRisk = currentHum > 70 ? 2 : currentHum > 50 ? 1 : 0;
        }

        const riskPercent = { 0: 15, 1: 50, 2: 90 }[finalRisk] ?? 15;
        
        const loc = locName || 'Area ini';
        const lowMsgs = [
            `Sip, ${loc} terpantau aman! Bebas dari ancaman lembap dan jamur.`,
            `Kondisi di ${loc} sangat ideal. Barang-barang Anda aman disimpan di sini.`,
            `Kabar baik! ${loc} kering dan bersih. Pertahankan sirkulasi udaranya ya.`,
            `Tidak ada indikasi bahaya di ${loc}. Suhu dan kelembapan sangat pas.`
        ];
        const medMsgs = [
            `Wah, ${loc} berisiko nih. Kelembapannya lumayan tinggi, mending kasih ventilasi ekstra.`,
            `Hati-hati, sirkulasi udara di ${loc} kurang baik dan berisiko memicu jamur.`,
            `Status Waspada! ${loc} mulai berisiko lembap. Sebaiknya hindari menyimpan barang sensitif di sini.`,
            `Area ${loc} sedikit berisiko. Rutin cek apakah ada kebocoran atau udara yang terperangkap.`
        ];
        const highMsgs = [
            `Bahaya! ${loc} sangat lembap. Tolong jangan taruh barang yang mudah berjamur di sini ya!`,
            `Risiko tinggi pada ${loc}! Segera bersihkan dengan cairan antifungal dan pasang penyerap lembap.`,
            `Area ${loc} zona merah! Kondisinya sangat mendukung jamur tumbuh subur. Pindahkan barang kulit/kain segera.`,
            `Awas! Udara di ${loc} terlalu lembap dan pengap. Sangat berisiko merusak barang-barang berharga Anda.`
        ];
        
        const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const labels = [
            { level: 'Aman', color: 'text-green-600', bg: 'bg-green-50', icon: 'check_circle', desc: getRand(lowMsgs) },
            { level: 'Berisiko', color: 'text-orange-500', bg: 'bg-orange-50', icon: 'error', desc: getRand(medMsgs) },
            { level: 'Bahaya', color: 'text-red-600', bg: 'bg-red-50', icon: 'warning', desc: getRand(highMsgs) },
        ];

        const insight = {
            riskLevel: finalRisk,
            risk: riskPercent,
            label: ['LOW', 'MEDIUM', 'HIGH'][finalRisk],
            ...labels[finalRisk],
        };

        setScanResult(insight);
        return insight;
    };

    const saveScanResultFromRefs = async (insight) => {
        let targetId = activeDeviceIdRef.current;
        if (!targetId && Object.keys(devicesRef.current).length > 0)
            targetId = Object.keys(devicesRef.current)[0];

        const finalLocation = scanLocationRef.current;

        const scanData = {
            deviceId: targetId,
            location: finalLocation || 'Unknown',
            riskLevel: insight.risk,    // sudah dalam persentase (15/50/90)
            temperature: tempRef.current,
            humidity: humRef.current,
            message: insight.desc,
            notes: scanNotesRef.current,
            duration: scanDuration
        };

        console.log('[SCANNER] Menyimpan hasil scan ke:', `${API_URL}/api/scans`);
        console.log('[SCANNER] Data:', scanData);

        try {
            const res = await fetch(`${API_URL}/api/scans`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${tokenRef.current}` 
                },
                body: JSON.stringify(scanData)
            });
            const data = await res.json();
            if (!data.ok) {
                console.error('[SCANNER] ❌ Server error:', data.error);
                alert('❌ Gagal menyimpan ke database: ' + (data.error || 'Unknown error'));
            } else {
                console.log('[SCANNER] ✅ Berhasil tersimpan di DB');
            }
        } catch (e) {
            console.error('[SCANNER] ❌ Network/Fetch error:', e);
            alert('❌ Gagal menghubungi server backend! Pastikan backend sudah jalan di port 3000.\nError: ' + e.message);
        }
    };

    const currentRiskValue = typeof state.aiRisk !== 'undefined' ? { 0: 15, 1: 50, 2: 90 }[state.aiRisk] : (hum > 70 ? 90 : hum > 50 ? 50 : 15);

    return (
        <div className="space-y-6">
            <style>
                {`
                @keyframes wave {
                    0% { transform: translateX(-50%) rotate(0deg); }
                    100% { transform: translateX(-50%) rotate(360deg); }
                }
                .liquid-wave {
                    position: absolute;
                    width: 200%;
                    height: 200%;
                    background: rgba(82, 183, 136, 0.6);
                    top: -150%;
                    left: 50%;
                    border-radius: 40%;
                    animation: wave 10s infinite linear;
                    transition: top 0.3s ease;
                }
                `}
            </style>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: CONFIGURATION */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-[#f4ebe1] rounded-2xl flex items-center justify-center text-[#735d4d] shadow-inner">
                                <span className="material-symbols-outlined text-3xl font-bold">query_stats</span>
                            </div>
                            <div>
                                <h2 className="font-black text-[#624633] text-2xl tracking-tight uppercase">Mold Smart Scanner</h2>
                                <p className="text-xs text-gray-400 font-bold tracking-widest">SETUP ANALISIS AREA</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-[#624633] text-white text-[10px] font-black flex items-center justify-center">1</span>
                                <h3 className="text-xs font-black text-[#624633] uppercase tracking-wider">Lokasi Objek</h3>
                            </div>
                            <div className="animate-fade-in">
                                <input 
                                    type="text"
                                    value={scanLocation}
                                    onChange={(e) => setScanLocation(e.target.value)}
                                    placeholder="Isi dimana? (misal: Kamar Mandi, Lemari, dll)..."
                                    className="w-full bg-[#f4ebe1] border-2 border-[#8c7462]/20 rounded-xl px-4 py-3 text-xs font-bold text-[#624633] focus:border-[#8c7462] focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* STEP 2: NOTES & DURATION */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-6 h-6 rounded-full bg-[#624633] text-white text-[10px] font-black flex items-center justify-center">2</span>
                                    <h3 className="text-xs font-black text-[#624633] uppercase tracking-wider">Catatan</h3>
                                </div>
                                <textarea 
                                    value={scanNotes}
                                    onChange={(e) => setScanNotes(e.target.value)}
                                    placeholder="Kondisi area..."
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-xs font-bold text-[#624633] focus:border-[#8c7462] focus:outline-none transition-all placeholder:text-gray-300 resize-none h-[108px]"
                                ></textarea>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-6 h-6 rounded-full bg-[#624633] text-white text-[10px] font-black flex items-center justify-center">3</span>
                                    <h3 className="text-xs font-black text-[#624633] uppercase tracking-wider">Durasi</h3>
                                </div>
                                <div className="space-y-2">
                                    {durations.map(d => (
                                        <button 
                                            key={d}
                                            onClick={() => setScanDuration(d)}
                                            className={`w-full py-3 rounded-xl text-[10px] font-black transition-all border-2 ${scanDuration === d ? 'bg-[#8c7462] text-white border-[#8c7462] shadow-md' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}
                                        >
                                            {d >= 60 ? '1 MENIT' : `${d} DETIK`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative flex flex-col items-center">
                            {/* FULL-PAGE SCANNING OVERLAY */}
                            {isScanning && (
                                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#624633]/90 backdrop-blur-sm animate-fade-in">
                                    <div className="relative flex flex-col items-center gap-8">
                                        {/* Circular Progress Ring */}
                                        <div className="relative w-52 h-52">
                                            <svg className="w-52 h-52 -rotate-90" viewBox="0 0 200 200">
                                                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12"/>
                                                <circle 
                                                    cx="100" cy="100" r="88" fill="none" 
                                                    stroke="#8c7462" strokeWidth="12"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${2 * Math.PI * 88}`}
                                                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - scanProgress / 100)}`}
                                                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-5xl font-black text-white">{scanProgress}%</span>
                                                <span className="text-[10px] font-black text-green-300 uppercase tracking-widest mt-1">Analyzing</span>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-black text-lg tracking-widest uppercase animate-pulse">Scanning In Progress</p>
                                            <p className="text-green-300/60 text-xs font-bold mt-2 uppercase tracking-widest">{scanLocation} • {scanDuration}s</p>
                                        </div>
                                        {/* Animated dots */}
                                        <div className="flex gap-2 mb-2">
                                            {[0,1,2].map(i => (
                                                <span key={i} className="w-2 h-2 rounded-full bg-green-400" style={{ animation: `pulse 1.2s ${i * 0.2}s infinite` }}></span>
                                            ))}
                                        </div>
                                        {/* Cancel Button */}
                                        <button
                                            onClick={() => { setIsScanning(false); clearInterval(timerRef.current); }}
                                            className="px-8 py-3 bg-white/10 hover:bg-red-500/40 border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-sm">cancel</span>
                                            Batalkan Scan
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={startScan}
                                disabled={!scanLocation || isScanning}
                                className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-3 ${(!scanLocation || isScanning) ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-[#624633] hover:bg-[#735d4d] text-white active:scale-95 shadow-orange-900/20'}`}
                            >
                                <span className="material-symbols-outlined">analytics</span>
                                Mulai Analisis Pintar
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: LIVE DATA & RESULTS */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                             Real-time Environment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#f4ebe1] p-5 rounded-3xl border border-orange-50 shadow-inner">
                                <span className="material-symbols-outlined text-[#735d4d] text-2xl mb-2">water_drop</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lembap</p>
                                <p className="text-2xl font-black text-[#624633]">{hum.toFixed(0)}%</p>
                            </div>
                            <div className="bg-[#fffdfb] p-5 rounded-3xl border border-orange-50 shadow-inner">
                                <span className="material-symbols-outlined text-orange-400 text-2xl mb-2">thermostat</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suhu</p>
                                <p className="text-2xl font-black text-[#624633]">{temp.toFixed(1)}°C</p>
                            </div>
                            <div className="bg-blue-50/30 p-5 rounded-3xl border border-blue-50 shadow-inner">
                                <span className="material-symbols-outlined text-blue-400 text-2xl mb-2">light_mode</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cahaya</p>
                                <p className="text-2xl font-black text-[#624633]">{state.ldr || 0}</p>
                            </div>
                        </div>
                        
                        {/* REAL-TIME PREDICTION GAUGE (SMALL) */}
                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Risk</span>
                             <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-500" 
                                        style={{ 
                                            width: `${currentRiskValue}%`,
                                            backgroundColor: currentRiskValue > 70 ? '#ff4d4d' : currentRiskValue > 40 ? '#f97316' : '#4ade80'
                                        }}
                                    ></div>
                                </div>
                                <span className={`text-[10px] font-black ${currentRiskValue > 70 ? 'text-red-500' : currentRiskValue > 40 ? 'text-orange-500' : 'text-orange-500'}`}>
                                    {state.aiLabel || 'WAITING'}
                                </span>
                             </div>
                        </div>
                    </div>

                    {/* MOLD RISK RESULT (The Voted Result) */}
                    {scanResult ? (
                        <div className="animate-bounce-in space-y-6">
                            <div className="bg-[#624633] rounded-[2rem] p-8 shadow-xl flex flex-col items-center text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                                <h3 className="text-[10px] font-black text-green-300/50 uppercase tracking-[0.2em] mb-8 w-full">Stable Scan Result (Voted)</h3>
                                
                                <div className="relative w-40 h-20 overflow-hidden mb-4">
                                    <div className="w-40 h-40 rounded-full border-[15px] border-white/10"></div>
                                    <div 
                                        className={`absolute top-0 left-0 w-40 h-40 rounded-full border-[15px] transition-all duration-1000`}
                                        style={{ 
                                            borderColor: scanResult.risk > 70 ? '#ff4d4d' : scanResult.risk > 40 ? '#f97316' : '#4ade80',
                                            clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 50%)`,
                                            transform: `rotate(${(scanResult.risk / 100) * 180 - 180}deg)`
                                        }}
                                    ></div>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-black mb-1">{scanResult.risk}%</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full inline-block ${scanResult.risk > 70 ? 'bg-red-500/20 text-red-400' : scanResult.risk > 40 ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500/20 text-green-400'}`}>
                                        {scanResult.label}
                                    </p>
                                </div>
                                <p className="text-[8px] font-bold text-green-200/50 mt-4 uppercase">Based on {predictionSamples.length} samples</p>
                            </div>

                            <div className={`${scanResult.bg} rounded-[2rem] p-8 border-4 border-white shadow-2xl`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl ${scanResult.bg} flex items-center justify-center shadow-inner border border-white`}>
                                        <span className={`material-symbols-outlined ${scanResult.color}`}>{scanResult.icon}</span>
                                    </div>
                                    <h4 className={`font-black text-[10px] uppercase tracking-[0.2em] ${scanResult.color}`}>Hasil Analisis</h4>
                                </div>
                                <p className="text-lg font-black text-[#624633] mb-1 leading-tight">{scanResult.level}!</p>
                                <p className="text-xs font-bold text-[#624633]/70 leading-relaxed">{scanResult.desc}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-[2rem] p-12 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-gray-300 shadow-sm">
                                 <span className="material-symbols-outlined text-3xl">biotech</span>
                             </div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Menunggu Pemindaian</p>
                             <p className="text-[10px] text-gray-300 mt-2">Silakan isi lokasi dan pilih durasi untuk memulai analisis.</p>
                        </div>
                    )}
                </div>

            </div>
            {/* LIVE DEVICE LOGS (FOOTER SECTION) */}
            <div className="mt-12 bg-[#624633] rounded-[2.5rem] p-8 shadow-2xl border-4 border-white overflow-hidden relative">

                
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <span className="material-symbols-outlined text-green-400">developer_board</span>
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg tracking-tight">Live Device Logs</h3>
                            <p className="text-[10px] font-bold text-green-300/50 uppercase tracking-[0.2em]">Raw MQTT Data Stream</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isDeviceOnline ? 'bg-orange-500/10 border-orange-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <span className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDeviceOnline ? 'text-green-400' : 'text-red-500'}`}>
                            {isDeviceOnline ? 'ESP32 Connected' : 'ESP32 Offline'}
                        </span>
                    </div>
                </div>

                <div className="bg-black/20 backdrop-blur-md rounded-3xl p-6 font-mono text-[11px] space-y-2 border border-white/5 relative z-10 max-h-[200px] overflow-y-auto">
                    <div className="flex gap-4 text-green-400/70 border-b border-white/5 pb-2 mb-4 font-black tracking-widest uppercase">
                        <span className="w-24">Timestamp</span>
                        <span className="w-32">Topic</span>
                        <span>Payload (JSON)</span>
                    </div>
                    
                    {/* Real-time Data Mapping */}
                    <div className="flex gap-4 text-white/90 animate-fade-in py-1 hover:bg-white/5 transition-colors rounded px-2">
                        <span className="w-24 text-white/40">{new Date().toLocaleTimeString()}</span>
                        <span className="w-32 text-blue-300 font-bold">/sensor/data</span>
                        <code className="text-green-300 break-all">
                            {`{"deviceId":"${activeDeviceId || 'mold-scanner-01'}", "temp":${temp.toFixed(1)}, "hum":${hum.toFixed(0)}, "ldr":${state.ldr || 0}, "status":"active"}`}
                        </code>
                    </div>
                    <div className="flex gap-4 text-white/40 py-1 px-2 italic">
                        <span className="w-24">--:--:--</span>
                        <span className="w-32">/system/log</span>
                        <span>Waiting for next hardware heartbeat...</span>
                    </div>
                </div>
            </div>
            {/* SCAN HISTORY SECTION */}
            <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#624633] rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">history</span>
                        </div>
                        <div>
                            <h2 className="font-black text-[#624633] text-lg tracking-tight uppercase">Riwayat Scan</h2>
                            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Hasil Analisis Tersimpan</p>
                        </div>
                    </div>
                    <button onClick={() => fetchHistory()} disabled={historyLoading}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                        <span className={`material-symbols-outlined text-gray-400 ${historyLoading ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                </div>

                {historyLoading && scanHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-300">
                        <span className="material-symbols-outlined text-4xl animate-spin block mb-2">sync</span>
                        <p className="text-xs font-bold">Memuat riwayat...</p>
                    </div>
                ) : scanHistory.length === 0 ? (
                    <div className="bg-gray-50 rounded-[2rem] py-16 text-center border border-dashed border-gray-200">
                        <span className="material-symbols-outlined text-4xl text-gray-200 block mb-3">folder_off</span>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Belum ada riwayat scan</p>
                        <p className="text-[10px] text-gray-300 mt-1 max-w-[200px] mx-auto">Mulai analisis di atas untuk menyimpan hasil scan pertama Anda ke database.</p>
                        <button onClick={() => fetchHistory()} className="mt-4 text-[9px] font-black text-[#8c7462] uppercase tracking-widest hover:underline">Cek Ulang Data</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scanHistory.map((scan) => {
                            const date = new Date(scan.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                            const riskColor = scan.riskLevel > 70 ? 'bg-red-50 text-red-600' : scan.riskLevel > 40 ? 'bg-orange-50 text-orange-600' : 'bg-orange-50 text-green-600';
                            const riskLabel = scan.riskLevel > 70 ? 'HIGH' : scan.riskLevel > 40 ? 'MEDIUM' : 'LOW';
                            return (
                                <div key={scan.id} onClick={() => setSelectedScan(scan)}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-5 hover:shadow-md hover:border-orange-100 transition-all cursor-pointer group">
                                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${riskColor}`}>
                                        <span className="text-xl font-black leading-none">{scan.riskLevel}%</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">{riskLabel}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-[#624633] text-white text-[9px] font-black rounded-lg uppercase">{scan.location || 'Area'}</span>
                                            <span className="text-[9px] text-gray-300 font-bold">{date}</span>
                                        </div>
                                        <p className="text-xs font-bold text-[#624633] truncate">{scan.message}</p>
                                        <div className="flex gap-3 mt-1 text-[10px] text-gray-400 font-bold">
                                            <span>🌡 {scan.temperature?.toFixed(1)}°C</span>
                                            <span>💧 {scan.humidity?.toFixed(0)}%</span>
                                            <span>⏱ {scan.duration}s</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 relative z-20">
                                        <button 
                                            onClick={(e) => confirmDelete(e, scan.id)}
                                            className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 flex items-center justify-center"
                                            title="Hapus Riwayat"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                        <span className="material-symbols-outlined text-gray-200 group-hover:text-[#624633] transition-colors self-center">chevron_right</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {selectedScan && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#624633]/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-bounce-in">
                        <div className="bg-[#624633] p-7 text-white relative">
                            <button onClick={() => setSelectedScan(null)}
                                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                            <span className="text-[9px] font-black text-green-300/60 uppercase tracking-widest">Detail Analisis</span>
                            <h2 className="text-2xl font-black mt-1">{selectedScan.location || 'Area'}</h2>
                            <p className="text-[10px] text-green-300/50 mt-1">
                                {new Date(selectedScan.timestamp).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                            </p>
                        </div>
                        <div className="p-7 overflow-y-auto space-y-5">
                            {/* Gauge */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-40 h-20 overflow-hidden mb-3">
                                    <div className="w-40 h-40 rounded-full border-[16px] border-gray-100"></div>
                                    <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[16px] transition-all duration-1000"
                                        style={{ borderColor: selectedScan.riskLevel > 70 ? '#dc2626' : selectedScan.riskLevel > 40 ? '#f97316' : '#8c7462',
                                            clipPath:'polygon(0 0,100% 0,100% 50%,0 50%)',
                                            transform:`rotate(${(selectedScan.riskLevel/100)*180-180}deg)` }}>
                                    </div>
                                </div>
                                <p className="text-4xl font-black text-[#624633]">{selectedScan.riskLevel}%</p>
                                <span className={`text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full mt-1 ${
                                    selectedScan.riskLevel > 70 ? 'bg-red-50 text-red-600' : selectedScan.riskLevel > 40 ? 'bg-orange-50 text-orange-600' : 'bg-orange-50 text-green-600'}`}>
                                    {selectedScan.riskLevel > 70 ? 'HIGH RISK' : selectedScan.riskLevel > 40 ? 'MEDIUM RISK' : 'LOW RISK'}
                                </span>
                            </div>
                            {/* Diagnosis */}
                            <div className="bg-[#f8fafc] p-5 rounded-2xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Diagnosis Hasil</p>
                                <p className="text-sm font-bold text-[#624633] leading-relaxed">{selectedScan.message}</p>
                                {selectedScan.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-[9px] font-black text-[#8c7462] uppercase tracking-widest mb-1">Catatan</p>
                                        <p className="text-xs text-gray-500 italic">&quot;{selectedScan.notes}&quot;</p>
                                    </div>
                                )}
                            </div>
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                {[['thermostat','Suhu',`${selectedScan.temperature?.toFixed(1)}°C`,'text-orange-400'],
                                  ['water_drop','Lembap',`${selectedScan.humidity?.toFixed(0)}%`,'text-blue-400'],
                                  ['timer','Durasi',`${selectedScan.duration}s`,'text-green-400']
                                ].map(([icon,label,val,col]) => (
                                    <div key={label} className="bg-white border border-gray-100 p-4 rounded-2xl text-center shadow-sm">
                                        <span className={`material-symbols-outlined ${col} text-xl mb-1 block`}>{icon}</span>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase">{label}</p>
                                        <p className="text-sm font-black text-[#624633]">{val}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Rekomendasi */}
                            <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                                selectedScan.riskLevel > 70 ? 'bg-red-50 text-red-700' : selectedScan.riskLevel > 40 ? 'bg-orange-50 text-orange-700' : 'bg-orange-50 text-green-700'}`}>
                                <p className="font-black uppercase tracking-widest text-[9px] mb-2">Rekomendasi</p>
                                {selectedScan.riskLevel > 70 ? (
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Gunakan dehumidifier untuk menurunkan kelembapan</li>
                                        <li>Bersihkan area dengan cairan antifungal</li>
                                        <li>Tingkatkan pencahayaan dan ventilasi</li>
                                    </ul>
                                ) : selectedScan.riskLevel > 40 ? (
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Buka ventilasi agar sirkulasi lebih baik</li>
                                        <li>Periksa jika ada kebocoran air di sekitar area</li>
                                    </ul>
                                ) : (
                                    <p>✅ Kondisi ruangan sangat baik. Pertahankan kebersihan area ini.</p>
                                )}
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 flex gap-3">
                            <button onClick={() => setSelectedScan(null)}
                                className="flex-1 py-3 bg-[#624633] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#735d4d] transition-all">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {scanToDelete && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#624633]/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden text-center animate-bounce-in p-8 border-4 border-red-50">
                        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="material-symbols-outlined text-4xl">delete_forever</span>
                        </div>
                        <h2 className="text-xl font-black text-[#624633] mb-2">Hapus Riwayat?</h2>
                        <p className="text-xs font-bold text-gray-400 mb-8">
                            Tindakan ini tidak bisa dibatalkan. Riwayat pemindaian ini akan hilang dari database.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setScanToDelete(null)}
                                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={performDelete}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
