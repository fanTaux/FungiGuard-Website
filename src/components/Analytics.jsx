import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Analytics() {
    const { token, activeDeviceId } = useAppContext();
    
    // DUMMY DATA INITIAL STATE
    const [scanHistory, setScanHistory] = useState([
        { id: 'd1', location: 'Lemari Pakaian', riskLevel: 85, temperature: 28.5, humidity: 78, message: 'Risiko Tinggi! Jamur berpotensi merusak pakaian kain.', notes: 'Baru saja dicuci tapi belum kering total.', timestamp: new Date(Date.now() - 3600000).toISOString(), duration: 30 },
        { id: 'd2', location: 'Tembok Pojok', riskLevel: 45, temperature: 26.2, humidity: 65, message: 'Risiko Sedang. Area cukup lembap karena kurang sirkulasi.', notes: 'Area dekat jendela kamar.', timestamp: new Date(Date.now() - 7200000).toISOString(), duration: 10 },
        { id: 'd3', location: 'Bawah Kasur', riskLevel: 12, temperature: 25.1, humidity: 52, message: 'Kondisi Aman. Area ini kering dan bersih.', notes: 'Pengecekan rutin mingguan.', timestamp: new Date(Date.now() - 86400000).toISOString(), duration: 5 },
        { id: 'd4', location: 'Elektronik', riskLevel: 30, temperature: 29.5, humidity: 48, message: 'Kondisi Aman untuk barang elektronik.', notes: 'Di dalam box penyimpanan lensa.', timestamp: new Date(Date.now() - 172800000).toISOString(), duration: 20 },
        { id: 'd5', location: 'Area Kayu', riskLevel: 68, temperature: 27.8, humidity: 72, message: 'Waspada! Risiko jamur mulai muncul di permukaan kayu.', notes: 'Meja kayu di ruang tamu.', timestamp: new Date(Date.now() - 259200000).toISOString(), duration: 30 }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    const host = window.location.hostname || 'localhost';
    const API_URL = `http://${host}:3000`;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        if (!activeDeviceId) return;
        try {
            const resScans = await fetch(`${API_URL}/api/scans/${activeDeviceId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataScans = await resScans.json();
            if (dataScans.ok && dataScans.scans.length > 0) {
                // Combine dummy and real data, or just show real data
                setScanHistory(dataScans.scans);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeDeviceId, token]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#1b4332] rounded-3xl flex items-center justify-center text-white shadow-xl">
                        <span className="material-symbols-outlined text-3xl">history</span>
                    </div>
                    <div>
                        <h2 className="font-black text-[#1b4332] text-2xl tracking-tight uppercase">Scanning History</h2>
                        <p className="text-xs text-gray-400 font-bold tracking-widest flex items-center gap-2">
                             RIWAYAT ANALISIS JAMUR • {currentTime}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={fetchData}
                    disabled={isLoading}
                    className="px-6 py-3 bg-[#f1f8f5] text-[#2d6a4f] rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#2d6a4f] hover:text-white transition-all shadow-sm active:scale-95"
                >
                    <span className={`material-symbols-outlined text-lg ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                    Refresh Data
                </button>
            </div>

            {/* SCAN HISTORY LIST */}
            <section className="space-y-4">
                {scanHistory.map((scan) => {
                    const date = new Date(scan.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                    return (
                        <div key={scan.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 group hover:shadow-xl hover:border-green-100 transition-all duration-300 animate-fade-in">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                {/* Risk Badge */}
                                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex flex-col items-center justify-center shadow-inner shrink-0 ${scan.riskLevel > 70 ? 'bg-red-50 text-red-600' : scan.riskLevel > 40 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                    <span className="text-2xl md:text-3xl font-black leading-none">{scan.riskLevel}%</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest mt-1">RISK</span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-[#1b4332] text-white text-[9px] font-black rounded-lg uppercase tracking-[0.15em] shadow-sm">{scan.location}</span>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[9px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">timer</span>
                                                {scan.duration}S DETEKSI
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{date}</span>
                                    </div>
                                    
                                    <h3 className="text-sm font-black text-[#1b4332] mb-2 leading-tight uppercase tracking-tight">{scan.message}</h3>
                                    
                                    {scan.notes && (
                                        <div className="bg-[#f8fafc] p-3 rounded-2xl border border-gray-50 mb-3 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#52b788]"></div>
                                            <p className="text-[10px] text-gray-500 italic font-bold leading-relaxed px-1">" {scan.notes} "</p>
                                        </div>
                                    )}

                                    <div className="flex gap-6 border-t border-gray-50 pt-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                                <span className="material-symbols-outlined text-sm">thermostat</span>
                                            </div>
                                            <span className="text-[11px] font-black text-[#1b4332]">{scan.temperature.toFixed(1)}°C</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                <span className="material-symbols-outlined text-sm">water_drop</span>
                                            </div>
                                            <span className="text-[11px] font-black text-[#1b4332]">{scan.humidity.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="hidden lg:block shrink-0 px-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${scan.riskLevel > 70 ? 'border-red-100 text-red-200' : scan.riskLevel > 40 ? 'border-orange-100 text-orange-200' : 'border-green-100 text-green-200'} group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined">analytics</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
