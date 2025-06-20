
import React from 'react';
import { X } from 'lucide-react';
import TeslaControlApp from './apps/TeslaControlApp';
import WeatherApp from './apps/WeatherApp';
import SafariApp from './apps/SafariApp';
import CalendarApp from './apps/CalendarApp';

interface AppModalProps {
  appId: string;
  onClose: () => void;
}

const AppModal: React.FC<AppModalProps> = ({ appId, onClose }) => {
  const getAppComponent = () => {
    switch (appId) {
      case 'tesla-control':
        return <TeslaControlApp />;
      case 'weather':
        return <WeatherApp />;
      case 'safari':
        return <SafariApp />;
      case 'calendar':
        return <CalendarApp />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-2">App Coming Soon!</h2>
              <p className="text-gray-300">This app is under development</p>
            </div>
          </div>
        );
    }
  };

  const getAppTitle = () => {
    switch (appId) {
      case 'tesla-control': return '🚗 Tesla Control Hub';
      case 'weather': return '🌤️ Weather Pro';
      case 'safari': return '🌐 Safari Browser';
      case 'calendar': return '📅 Calendar';
      default: return '📱 App';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
        {/* App Header */}
        <div className="h-16 bg-black/40 border-b border-white/10 flex items-center justify-between px-6">
          <h1 className="text-white text-xl font-bold">{getAppTitle()}</h1>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-red-500/20 hover:bg-red-500/40 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
        
        {/* App Content */}
        <div className="h-[calc(100%-4rem)] overflow-auto">
          {getAppComponent()}
        </div>
      </div>
    </div>
  );
};

export default AppModal;
