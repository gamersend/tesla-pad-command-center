
import React, { useEffect } from 'react';
import { Wifi, Bluetooth, Sun, Volume2, AirplayIcon, Settings } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ isOpen, onClose }) => {
  const { settings, updateSetting } = useSettings();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={handleBackdropClick}
        >
          <div className={`control-center ${isOpen ? 'open' : ''}`}>
            <div className="control-content">
              {/* Connectivity Section */}
              <div className="control-tile">
                <h3 className="text-white font-semibold mb-3">Connectivity</h3>
                <div className="flex gap-3">
                  <button className="flex-1 p-3 bg-blue-600 rounded-lg flex flex-col items-center">
                    <Wifi className="w-6 h-6 text-white mb-1" />
                    <span className="text-xs text-white">WiFi</span>
                  </button>
                  <button className="flex-1 p-3 bg-blue-600 rounded-lg flex flex-col items-center">
                    <Bluetooth className="w-6 h-6 text-white mb-1" />
                    <span className="text-xs text-white">Bluetooth</span>
                  </button>
                  <button className="flex-1 p-3 bg-gray-600 rounded-lg flex flex-col items-center">
                    <AirplayIcon className="w-6 h-6 text-white mb-1" />
                    <span className="text-xs text-white">AirPlay</span>
                  </button>
                </div>
              </div>

              {/* Brightness & Volume */}
              <div className="control-tile">
                <h3 className="text-white font-semibold mb-3">Display & Sound</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-white" />
                    <div className="flex-1 h-2 bg-gray-600 rounded-full">
                      <div className="h-full w-3/4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-white" />
                    <div className="flex-1 h-2 bg-gray-600 rounded-full">
                      <div className="h-full w-1/2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tesla Controls */}
              <div className="control-tile">
                <h3 className="text-white font-semibold mb-3">Tesla</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-red-600 rounded-lg text-white text-sm">
                    Climate
                  </button>
                  <button className="p-3 bg-green-600 rounded-lg text-white text-sm">
                    Charging
                  </button>
                  <button className="p-3 bg-blue-600 rounded-lg text-white text-sm">
                    Controls
                  </button>
                  <button className="p-3 bg-gray-600 rounded-lg text-white text-sm">
                    Sentry
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div className="control-tile">
                <h3 className="text-white font-semibold mb-3">Quick Settings</h3>
                <button 
                  className="w-full p-3 bg-gray-600 rounded-lg flex items-center justify-center gap-2"
                  onClick={() => {
                    onClose();
                    // You could navigate to settings here
                  }}
                >
                  <Settings className="w-5 h-5 text-white" />
                  <span className="text-white">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
