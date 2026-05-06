export default function SmartAutomation() {
    return (
        <section className="glass-card rounded-xl p-md border-2 border-tertiary-fixed/30">
            <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-tertiary">shield_with_heart</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Smart Automation</h2>
            </div>
            <p className="text-on-surface-variant text-body-md mb-lg">Mode proteksi aktif otomatis saat sensor mendeteksi zona rawan nyamuk.</p>
            <div className="space-y-md">
                <div className="flex justify-between items-end">
                    <div className="space-y-xs">
                        <span className="font-label-lg text-label-lg text-on-surface">Threshold Zona Rawan DBD</span>
                        <p className="text-xs text-tertiary font-bold">Aktif jika: Temp &gt; 28°C &amp; Humid &gt; 70%</p>
                    </div>
                    <div className="text-right">
                        <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full font-label-lg text-label-lg">Sangat Sensitif</span>
                    </div>
                </div>
                <input className="w-full h-3 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-tertiary" type="range" defaultValue="85" />
            </div>
        </section>
    );
}
