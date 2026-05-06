import TopNavBar from './components/TopNavBar';
import SensorErrorBanner from './components/SensorErrorBanner';
import DashboardMetrics from './components/DashboardMetrics';
import ControlPanel from './components/ControlPanel';
import SmartAutomation from './components/SmartAutomation';
import Analytics from './components/Analytics';
import AlertHistory from './components/AlertHistory';
import BottomNavBar from './components/BottomNavBar';

function App() {
  return (
    <>
      <TopNavBar />
      <main className="pt-24 px-margin max-w-7xl mx-auto space-y-lg">
        <SensorErrorBanner />
        <DashboardMetrics />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-7 space-y-lg">
            <ControlPanel />
            <SmartAutomation />
          </div>
          <div className="lg:col-span-5 space-y-lg">
            <Analytics />
          </div>
        </div>
        <AlertHistory />
      </main>
      <button className="fixed bottom-24 right-8 w-14 h-14 bg-tertiary text-on-tertiary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined">power_settings_new</span>
      </button>
      <BottomNavBar />
    </>
  );
}

export default App;
