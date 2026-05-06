export default function ControlPanel() {
    return (
        <section className="glass-card rounded-xl p-md">
            <div className="flex items-center justify-between mb-lg">
                <h2 className="font-headline-md text-headline-md text-on-surface">Control Panel</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-14 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary">
                    </div>
                </label>
            </div>
            <div className="space-y-xl">
                {/* Lighting Slider */}
                <div className="space-y-sm">
                    <div className="flex justify-between items-center">
                        <span className="font-label-lg text-label-lg text-on-surface-variant flex items-center gap-xs">
                            <span className="material-symbols-outlined text-sm">light_mode</span>
                            Lamp Brightness
                        </span>
                        <span className="font-label-lg text-label-lg text-on-surface">70%</span>
                    </div>
                    <input className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary-container" type="range" defaultValue="70" />
                </div>
                {/* Lamp Color (PWM) */}
                <div className="space-y-sm">
                    <div className="flex justify-between items-center">
                        <span className="font-label-lg text-label-lg text-on-surface-variant flex items-center gap-xs">
                            <span className="material-symbols-outlined text-sm">palette</span>
                            Lamp Color (PWM)
                        </span>
                    </div>
                    <p className="text-xs text-on-surface-variant bg-surface-container-low p-2 rounded-lg italic">
                        <span className="material-symbols-outlined text-[14px] inline-block align-middle mr-1 text-primary">info</span>
                        Colors are specifically calibrated to emit wavelengths that mosquitoes naturally avoid, keeping your room aesthetic and bite-free.
                    </p>
                    <div className="grid grid-cols-5 gap-base pt-1">
                        <button className="h-10 rounded-lg bg-white border-2 border-primary ring-2 ring-primary/20 shadow-sm transition-all" title="Putih"></button>
                        <button className="h-10 rounded-lg bg-[#4ade80] border-2 border-transparent hover:border-primary/50 transition-all" title="Hijau"></button>
                        <button className="h-10 rounded-lg bg-[#c084fc] border-2 border-transparent hover:border-primary/50 transition-all" title="Ungu"></button>
                        <button className="h-10 rounded-lg bg-[#d4a373] border-2 border-transparent hover:border-primary/50 transition-all" title="Earth Tone"></button>
                        <button className="h-10 rounded-lg bg-gradient-to-r from-white via-[#4ade80] to-[#c084fc] border-2 border-transparent hover:border-primary/50 transition-all flex items-center justify-center group" title="Shuffle">
                            <span className="material-symbols-outlined text-white text-sm group-hover:rotate-180 transition-transform duration-300" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>shuffle</span>
                        </button>
                    </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-2 gap-gutter pt-base">
                    <div className="bg-surface-container-low rounded-xl p-sm flex items-center gap-md">
                        <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Auto-ON</p>
                            <p className="font-headline-md text-on-surface">19:00</p>
                        </div>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-sm flex items-center gap-md">
                        <div className="bg-tertiary-container/20 p-2 rounded-lg text-tertiary">
                            <span className="material-symbols-outlined">shutter_speed</span>
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Auto-OFF</p>
                            <p className="font-headline-md text-on-surface">06:00</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
