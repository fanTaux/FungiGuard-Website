import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function ControlPanel() {
    const { state, sendCommand } = useAppContext();
    const [localBrightness, setLocalBrightness] = useState(0);

    // Sync local brightness with server when it updates externally
    useEffect(() => {
        if (state.lampBrightness !== undefined) {
            setLocalBrightness(state.lampBrightness);
        }
    }, [state.lampBrightness]);

    const handleSystemToggle = (e) => {
        sendCommand({ system: e.target.checked });
    };

    const handleColorChange = (color) => {
        sendCommand({ command: 'sleepwell_lamp', color: color, brightness: localBrightness });
    };

    const handleBrightnessEnd = (e) => {
        const val = parseInt(e.target.value);
        sendCommand({ command: 'sleepwell_lamp', color: state.lampColor || 'putih', brightness: val });
    };
    return (
        <section className="glass-card rounded-xl p-md">
            <div className="flex items-center justify-between mb-lg">
                <h2 className="font-headline-md text-headline-md text-on-surface">Control Panel</h2>
            </div>
            <div className="space-y-xl">
                {/* Lighting Slider */}
                <div className="space-y-sm">
                    <div className="flex justify-between items-center">
                        <span className="font-label-lg text-label-lg text-on-surface-variant flex items-center gap-xs">
                            <span className="material-symbols-outlined text-sm">light_mode</span>
                            Lamp Brightness
                        </span>
                        <span className="font-label-lg text-label-lg text-on-surface">{Math.round((localBrightness/255)*100)}%</span>
                    </div>
                    <input 
                        className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary-container" 
                        type="range" 
                        min="0" max="255"
                        value={localBrightness}
                        onChange={(e) => setLocalBrightness(e.target.value)}
                        onMouseUp={handleBrightnessEnd}
                        onTouchEnd={handleBrightnessEnd}
                    />
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
                        <button onClick={() => handleColorChange('putih')} className={`h-10 rounded-lg bg-white border-2 shadow-sm transition-all ${state.lampColor === 'putih' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`} title="Putih"></button>
                        <button onClick={() => handleColorChange('hijau')} className={`h-10 rounded-lg bg-[#4ade80] border-2 shadow-sm transition-all ${state.lampColor === 'hijau' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`} title="Hijau"></button>
                        <button onClick={() => handleColorChange('biru')} className={`h-10 rounded-lg bg-[#60a5fa] border-2 shadow-sm transition-all ${state.lampColor === 'biru' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`} title="Biru"></button>
                        <button onClick={() => handleColorChange('kuning')} className={`h-10 rounded-lg bg-[#facc15] border-2 shadow-sm transition-all ${state.lampColor === 'kuning' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`} title="Kuning"></button>
                        <button className="h-10 rounded-lg bg-gradient-to-r from-white via-[#4ade80] to-[#60a5fa] border-2 border-transparent hover:border-primary/50 transition-all flex items-center justify-center group" title="Shuffle">
                            <span className="material-symbols-outlined text-white text-sm group-hover:rotate-180 transition-transform duration-300" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>shuffle</span>
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}
