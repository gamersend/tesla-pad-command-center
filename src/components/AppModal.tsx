
import React from 'react';
import { X } from 'lucide-react';
import SafariApp from './apps/SafariApp';
import CalendarApp from './apps/CalendarApp';
import MailApp from './apps/MailApp';
import NotesApp from './apps/NotesApp';
import MapsApp from './apps/MapsApp';
import TimerApp from './apps/TimerApp';
import MusicApp from './apps/MusicApp';
import SearchHubApp from './apps/SearchHubApp';
import ColorPickerApp from './apps/ColorPickerApp';
import DiceRollerApp from './apps/DiceRollerApp';
import QuoteGeneratorApp from './apps/QuoteGeneratorApp';
import TeslaControlApp from './apps/TeslaControlApp';
import TeslaStatusApp from './apps/TeslaStatusApp';
import ChargingHubApp from './apps/ChargingHubApp';
import ClimateProApp from './apps/ClimateProApp';
import NewsFeedApp from './apps/NewsFeedApp';
import SettingsApp from './apps/SettingsApp';
import CameraApp from './apps/CameraApp';
import HomeAssistantApp from './apps/HomeAssistantApp';
import CryptoTrackerApp from './apps/CryptoTrackerApp';
import AIAssistantApp from './apps/AIAssistantApp';

interface AppModalProps {
  appId: string;
  onClose: () => void;
}

export const AppModal: React.FC<AppModalProps> = ({ appId, onClose }) => {
  const renderApp = () => {
    switch (appId) {
      // Tesla Apps
      case 'tesla-control':
        return <TeslaControlApp />;
      case 'tesla-status':
        return <TeslaStatusApp />;
      case 'charging':
        return <ChargingHubApp />;
      case 'climate':
        return <ClimateProApp />;
      
      // Productivity Apps
      case 'safari':
        return <SafariApp />;
      case 'calendar':
        return <CalendarApp />;
      case 'mail':
        return <MailApp />;
      case 'notes':
        return <NotesApp />;
      case 'maps':
        return <MapsApp />;
      case 'timer':
        return <TimerApp />;
      case 'music':
        return <MusicApp />;
      
      // Utility Apps
      case 'search':
        return <SearchHubApp />;
      case 'color-picker':
        return <ColorPickerApp />;
      case 'dice':
        return <DiceRollerApp />;
      case 'quotes':
        return <QuoteGeneratorApp />;
      case 'crypto':
        return <CryptoTrackerApp />;
      
      // Advanced Feature Apps
      case 'news':
        return <NewsFeedApp />;
      case 'settings':
        return <SettingsApp />;
      case 'camera':
        return <CameraApp />;
      case 'home-assistant':
        return <HomeAssistantApp />;
      case 'ai-assistant':
        return <AIAssistantApp />;
      
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-gray-400">This app is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center transition-colors"
        >
          <X size={20} className="text-white" />
        </button>

        {/* App Content */}
        <div className="w-full h-full">
          {renderApp()}
        </div>
      </div>
    </div>
  );
};
