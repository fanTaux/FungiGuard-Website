import { useState } from 'react';
import TopNavBar from './components/TopNavBar';
import SensorErrorBanner from './components/SensorErrorBanner';
import DashboardMetrics from './components/DashboardMetrics';
import ControlPanel from './components/ControlPanel';
import PowerControl from './components/PowerControl';
import SmartAutomation from './components/SmartAutomation';
import Analytics from './components/Analytics';
import AlertHistory from './components/AlertHistory';
import BottomNavBar from './components/BottomNavBar';
import Login from './components/Login';
import SettingsPage from './components/SettingsPage';
import { AppProvider, useAppContext } from './context/AppContext';

function MainApp() {
  const { token, logout, activeDeviceId, isConnected } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!token) {
    return <Login />;
  }

  const formatDeviceName = (id) => {
    if (!id) return 'Tidak ada alat terhubung';
    return id.includes('inkubator') ? `Kamar Bayi (${id.slice(-4)})` : `Ruang: ${id}`;
  };

  return (
    <>
      <TopNavBar onLogout={logout} />
      
      {/* Top Navigation Tabs */}
      <div className="pt-20 px-margin max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-[#f8f5f1] p-1.5 rounded-full border border-gray-200/60 shadow-sm max-w-2xl mx-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'dashboard' ? 'bg-white text-[#624633] shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('automation')}
            className={`flex-1 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'automation' ? 'bg-white text-[#624633] shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            Automation
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'analytics' ? 'bg-white text-[#624633] shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">insights</span>
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-[#d8a878] text-white shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </button>
        </div>
      </div>

      <main className="px-margin max-w-7xl mx-auto space-y-lg pb-12">
        <SensorErrorBanner />
        
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            {/* BIG DEVICE INDICATOR */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-[#f8f5f1] to-transparent p-6 rounded-3xl border border-[#e6ceb3]/30">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#8c7462]">home_iot_device</span>
                    <span className="text-xs font-bold text-[#8c7462] tracking-wider uppercase">Status Ruangan Aktif</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#624633] tracking-tight">
                     {formatDeviceName(activeDeviceId)}
                  </h1>
               </div>
               <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="relative flex items-center justify-center w-3 h-3">
                    {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full w-2.5 h-2.5 ${isConnected ? 'bg-[#4ade80]' : 'bg-red-500'}`}></span>
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    Server Induk: {isConnected ? <span className="text-[#4ade80]">Online</span> : <span className="text-red-500">Offline</span>}
                  </span>
               </div>
            </div>
            
            <DashboardMetrics />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg mt-6 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex-1">
                  <ControlPanel />
                </div>
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <div className="flex-1">
                  <PowerControl />
                </div>
              </div>
            </div>
            <div className="mt-8">
              <AlertHistory />
            </div>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
             <SmartAutomation />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
             <Analytics />
             <div className="mt-8"><AlertHistory /></div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsPage />
        )}

      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
