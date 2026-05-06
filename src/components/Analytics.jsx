export default function Analytics() {
    return (
        <section className="glass-card rounded-xl p-md h-full flex flex-col">
            <div className="flex items-center justify-between mb-lg">
                <h2 className="font-headline-md text-headline-md text-on-surface">Analytics</h2>
                <span className="font-label-lg text-label-lg text-on-surface-variant">24h Trends</span>
            </div>
            <div className="flex-grow flex items-end gap-2 h-48 mb-md px-2">
                {/* Simulated Chart */}
                <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[60%] relative group">
                    <div className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-lg h-[40%]"></div>
                </div>
                <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[75%] relative group">
                    <div className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-lg h-[55%]"></div>
                </div>
                <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[90%] relative group">
                    <div className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-lg h-[70%]"></div>
                </div>
                <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[50%] relative group">
                    <div className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-lg h-[30%]"></div>
                </div>
                <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[40%] relative group">
                    <div className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-lg h-[20%]"></div>
                </div>
                <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[65%] relative group">
                    <div className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-lg h-[45%]"></div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-sm">
                <div className="flex items-center gap-xs">
                    <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                    <span className="text-xs text-on-surface-variant">Temperature</span>
                </div>
                <div className="flex items-center gap-xs">
                    <span className="w-3 h-3 rounded-full bg-primary/40"></span>
                    <span className="text-xs text-on-surface-variant">Humidity</span>
                </div>
            </div>
            <div className="mt-lg p-md bg-tertiary-fixed/20 rounded-xl border border-tertiary-fixed">
                <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-tertiary text-3xl">insights</span>
                    <div>
                        <p className="font-label-lg text-label-lg text-on-tertiary-container mb-1">Weekly Insight Card</p>
                        <p className="text-body-md text-on-tertiary-fixed-variant">Minggu ini, kamar berada di <span className="font-bold">Zona Rawan Nyamuk</span> selama <span className="font-bold">14 Jam</span>.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
