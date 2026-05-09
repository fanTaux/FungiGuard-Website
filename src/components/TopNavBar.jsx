import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import AlertHistory from './AlertHistory';

export default function TopNavBar({ onProfileClick }) {
    const { devices, activeDeviceId, setActiveDeviceId } = useAppContext();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);
    const deviceIds = Object.keys(devices);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin h-16 bg-surface/60 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-base">
                <img alt="SleepWell Logo" className="w-8 h-8 rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMYApDFVlMRwv3F3n7MmAFlP_gd56lIXq8jfmg9NS4_pKqdHDhYsBotrtbPWn___IRW9Y6h8G2jNuUbCtU6cmpDHirh7C_TZp1lFirbKOaEQRxBEA3shWW9cFWasnbX7HogHZlt7J0DEUA_0S_N7cRn20wyS8wRRhv6eRnLS3MvEyRNu11kjUa-YtZyxlmlaPgz4qItEJ-Fq5A0WqoPohmckinYF17lmxJo-rXvyRnltVVkJI-RGb3V_ks4EdraGmExrV9YitQ2g" />
                <span className="font-headline-lg text-headline-lg font-bold text-primary">SleepWell</span>
            </div>
            <div className="flex items-center gap-md">
                <div className="hidden md:flex items-center gap-gutter">
                    <span className="text-primary font-bold border-b-2 border-primary font-label-lg text-label-lg py-1">Room Selector</span>
                </div>
                
                <div className="relative">
                    <select 
                        value={activeDeviceId || ''}
                        onChange={(e) => setActiveDeviceId(e.target.value)}
                        className="appearance-none bg-surface-container-low pl-4 pr-10 py-1.5 rounded-full cursor-pointer hover:bg-surface-container-high transition-colors font-label-lg text-label-lg text-[#624633] font-bold focus:outline-none focus:ring-2 focus:ring-[#d8a878]"
                    >
                        {deviceIds.length === 0 && <option value="">Tidak ada alat</option>}
                        {deviceIds.map(id => (
                            <option key={id} value={id}>
                                {id.includes('inkubator') ? `Inkubator (${id.slice(-4)})` : id}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="material-symbols-outlined text-outline text-sm">expand_more</span>
                    </div>
                </div>

                <div className="flex items-center gap-sm">
                    <div className="relative" ref={notifRef}>
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-surface-container-high' : 'hover:bg-surface-container-low'}`}
                        >
                            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full"></span>
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-[400px] max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-fade-in origin-top-right">
                                <div className="p-1">
                                    <AlertHistory isDropdown={true} />
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={onProfileClick}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <img alt="User Profile Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu1VX7-YQC8e-JmHClPrC0FHyGKrm1Iz3fuyyaXcSWp5x-pPsrTrauHZodbb5B-0fH2v5HSBWjvDnq4oo46I9Wg7NRqX7BQzHq9jw1Ee8sb8zNAkhteFoP6sfYnX9KGpRZdF7VHtWttpcFlX8gW4Zxn5pEPpIhC0Pxnhp35teXMpW7LybzJJQxv9WceWVtpizTHgy7FUOs5YTY6EolIxyiLwMulhzJz_HUr7-qxKElOI0uhlhe069kwNHOc9OYN6Z9pi5An4I1jQ" />
                    </button>
                </div>
            </div>
        </header>
    );
}
