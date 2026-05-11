import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Analytics() {
    const { token, activeDeviceId } = useAppContext();
    const [scanHistory, setScanHistory] = useState([]);
    const [selectedScan, setSelectedScan] = useState(null);
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
        setIsLoading(true);
        try {
            const resScans = await fetch(`${API_URL}/api/scans/${activeDeviceId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataScans = await resScans.json();
            if (dataScans.ok) setScanHistory(dataScans.scans);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteScan = async (id) => {
        if (!window.confirm('Yakin ingin menghapus riwayat ini?')) return;
        try {
            const res = await fetch(`${API_URL}/api/scans/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.ok) {
                setScanHistory(prev => prev.filter(s => s.id !== id));
                setSelectedScan(null);
            }
        } catch (e) {
            console.error('Gagal hapus:', e);
        }
    };

    const exportToCSV = () => {
        if (scanHistory.length === 0) return;
        const headers = ['ID', 'Timestamp', 'Location', 'RiskLevel', 'Temp', 'Humidity', 'Duration', 'Notes'];
        const csvRows = [
            headers.join(','),
            ...scanHistory.map(s => [
                s.id,
                new Date(s.timestamp).toLocaleString(),
                `"${s.location}"`,
                s.riskLevel,
                s.temperature,
                s.humidity,
                s.duration,
                `"${s.notes || ''}"`
            ].join(','))
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `MoldGuard_Report_${new Date().toISOString().split('T')[0]}.csv`);
        a.click();
    };

    useEffect(() => {
        fetchData();
    }, [activeDeviceId, token]);

    // Auto-refresh saat scan selesai dari DashboardMetrics
    useEffect(() => {
        const handler = () => {
            console.log('[ANALYTICS] Scan selesai terdeteksi, refresh history...');
            setTimeout(fetchData, 500); // Delay kecil agar data sudah tersimpan di DB
        };
        window.addEventListener('scan-completed', handler);
        return () => window.removeEventListener('scan-completed', handler);
    }, [activeDeviceId, token]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 relative">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#1b4332] rounded-3xl flex items-center justify-center text-white shadow-xl">
                        <span className="material-symbols-outlined text-3xl">history</span>
                    </div>
                    <div>
                        <h2 className="font-black text-[#1b4332] text-2xl tracking-tight uppercase">Scanning History</h2>
                        <p className="text-xs text-gray-400 font-bold tracking-widest flex items-center gap-2">
                             DATABASE HASIL ANALISIS AI • {currentTime}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={exportToCSV}
                        className="px-6 py-3 bg-[#f1f8f5] text-[#2d6a4f] rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#2d6a4f] hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">download</span>
                        Export CSV
                    </button>
                    <button 
                        onClick={fetchData}
                        disabled={isLoading}
                        className="px-4 py-3 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all active:scale-95"
                    >
                        <span className={`material-symbols-outlined text-lg ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                </div>
            </div>

            {/* SCAN HISTORY LIST */}
            <section className="space-y-4">
                {scanHistory.length === 0 ? (
                    <div className="bg-white rounded-[2rem] py-20 text-center border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-gray-200 text-4xl">folder_off</span>
                        </div>
                        <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Belum Ada Riwayat Pemindaian</p>
                    </div>
                ) : scanHistory.map((scan) => {
                    const date = new Date(scan.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                    return (
                        <div 
                            key={scan.id} 
                            onClick={() => setSelectedScan(scan)}
                            className="bg-white rounded-[2rem] p-6 border border-gray-100 group hover:shadow-xl hover:border-green-100 transition-all duration-300 animate-fade-in cursor-pointer"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
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
                                                {scan.duration}S
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{date}</span>
                                    </div>
                                    <h3 className="text-sm font-black text-[#1b4332] mb-1 line-clamp-1">{scan.message}</h3>
                                    <div className="flex gap-4 text-[10px] text-gray-400 font-bold italic">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">thermostat</span>{scan.temperature.toFixed(1)}°C</span>
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">water_drop</span>{scan.humidity.toFixed(0)}%</span>
                                    </div>
                                </div>
                                
                                <div className="hidden lg:block shrink-0 px-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-50 text-gray-300 group-hover:bg-[#1b4332] group-hover:text-white group-hover:border-[#1b4332] transition-all">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* DETAIL MODAL OVERLAY */}
            {selectedScan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b4332]/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative animate-bounce-in max-h-[90vh] flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="bg-[#1b4332] p-8 text-white relative">
                            <button 
                                onClick={() => setSelectedScan(null)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Detail Analisis AI</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">{selectedScan.location}</h2>
                            <p className="text-xs text-green-300/60 font-bold mt-1 tracking-widest uppercase">
                                {new Date(selectedScan.timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-8 overflow-y-auto">
                            <div className="flex flex-col items-center">
                                <div className="relative w-48 h-24 overflow-hidden mb-4">
                                    <div className="w-48 h-48 rounded-full border-[20px] border-gray-100"></div>
                                    <div 
                                        className={`absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] transition-all duration-1000`}
                                        style={{ 
                                            borderColor: selectedScan.riskLevel > 70 ? '#dc2626' : selectedScan.riskLevel > 40 ? '#f97316' : '#52b788',
                                            clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 50%)`,
                                            transform: `rotate(${(selectedScan.riskLevel / 100) * 180 - 180}deg)`
                                        }}
                                    ></div>
                                </div>
                                <div className="text-center">
                                    <p className="text-5xl font-black text-[#1b4332] mb-1">{selectedScan.riskLevel}%</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest py-1.5 px-6 rounded-full inline-block ${selectedScan.riskLevel > 70 ? 'bg-red-50 text-red-600' : selectedScan.riskLevel > 40 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                        {selectedScan.riskLevel > 70 ? 'HIGH RISK' : selectedScan.riskLevel > 40 ? 'MEDIUM RISK' : 'LOW RISK'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#f8fafc] p-6 rounded-[2rem] border border-gray-50">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">AI Diagnosis & Suggestion</h4>
                                <p className="text-sm font-black text-[#1b4332] mb-2">{selectedScan.message}</p>
                                {selectedScan.notes && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h5 className="text-[9px] font-black text-[#52b788] uppercase tracking-widest mb-2">User Notes</h5>
                                        <p className="text-xs text-gray-500 italic font-medium leading-relaxed">" {selectedScan.notes} "</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                                    <span className="material-symbols-outlined text-orange-400 text-xl mb-1">thermostat</span>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase">Suhu</p>
                                    <p className="text-sm font-black text-[#1b4332]">{selectedScan.temperature.toFixed(1)}°C</p>
                                </div>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                                    <span className="material-symbols-outlined text-blue-400 text-xl mb-1">water_drop</span>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase">Lembap</p>
                                    <p className="text-sm font-black text-[#1b4332]">{selectedScan.humidity.toFixed(0)}%</p>
                                </div>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                                    <span className="material-symbols-outlined text-green-400 text-xl mb-1">timer</span>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase">Durasi</p>
                                    <p className="text-sm font-black text-[#1b4332]">{selectedScan.duration}s</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button 
                                onClick={() => deleteScan(selectedScan.id)}
                                className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                                Hapus
                            </button>
                            <button 
                                onClick={() => setSelectedScan(null)}
                                className="flex-1 py-4 bg-[#1b4332] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#2d6a4f] transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
