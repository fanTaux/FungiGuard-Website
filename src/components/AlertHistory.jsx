export default function AlertHistory({ isDropdown = false }) {
    return (
        <section className={isDropdown ? "p-4" : "glass-card rounded-xl p-md overflow-hidden"}>
            <div className={`flex items-center justify-between ${isDropdown ? 'mb-4' : 'mb-md'}`}>
                <h2 className={isDropdown ? "font-bold text-[#624633] text-lg" : "font-headline-md text-headline-md text-on-surface"}>Alert History</h2>
                <button className="text-primary font-label-lg text-label-lg hover:underline transition-all">Lihat Semua</button>
            </div>
            <div className="divide-y divide-outline-variant">
                <div className="py-md flex flex-wrap items-center justify-between gap-md">
                    <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-tertiary">warning</span>
                        </div>
                        <div>
                            <p className="font-label-lg text-label-lg text-on-surface">Mode Proteksi Aktif</p>
                            <p className="text-body-md text-on-surface-variant">Suhu mencapai 29°C - Kipas &amp; Repellent ditingkatkan</p>
                        </div>
                    </div>
                    <p className="font-label-lg text-label-lg text-on-surface-variant">Hari ini, 22:00</p>
                </div>
                <div className="py-md flex flex-wrap items-center justify-between gap-md">
                    <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary">verified_user</span>
                        </div>
                        <div>
                            <p className="font-label-lg text-label-lg text-on-surface">Suhu Kembali Normal</p>
                            <p className="text-body-md text-on-surface-variant">Status: Aman (26°C)</p>
                        </div>
                    </div>
                    <p className="font-label-lg text-label-lg text-on-surface-variant">Hari ini, 18:30</p>
                </div>
                <div className="py-md flex flex-wrap items-center justify-between gap-md">
                    <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">bolt</span>
                        </div>
                        <div>
                            <p className="font-label-lg text-label-lg text-on-surface">Auto-ON Berhasil</p>
                            <p className="text-body-md text-on-surface-variant">Perangkat aktif sesuai jadwal</p>
                        </div>
                    </div>
                    <p className="font-label-lg text-label-lg text-on-surface-variant">Kemarin, 19:00</p>
                </div>
            </div>
        </section>
    );
}
