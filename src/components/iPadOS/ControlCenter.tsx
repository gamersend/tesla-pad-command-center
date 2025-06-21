
import React, { useState } from 'react';
import { Wifi, Bluetooth, Battery, Volume2, Brightness, AirVent } from 'lucide-react';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ isOpen, onClose }) => {
  const [brightness, setBrightness] = useState(70);
  const [volume, setVolume] = useState(60);

  const quickToggles = [
    { icon: Wifi, label: 'Wi-Fi', active: true },
    { icon: Bluetooth, label: 'Bluetooth', active: true },
    { icon: AirVent, label: 'Climate', active: false },
    { icon: Battery, label: 'Battery', active: true },
  ];

  return (
    <div className={`control-center ${isOpen ? 'open' : ''}`}>
      <div className="control-content">
        {/* Connectivity Section */}
        <div className="control-tile">
          <h3 className="text-body font-semibold text-white mb-4">Connectivity</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickToggles.map((toggle, index) => {
              const Icon = toggle.icon;
              return (
                <button
                  key={index}
                  className={`p-4 rounded-xl transition-all touch-feedback ${
                    toggle.active 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/20 text-white/70'
                  }`}
                >
                  <Icon size={24} />
                  <span className="block text-xs mt-2">{toggle.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="control-tile">
          <h3 className="text-body font-semibold text-white mb-4">Audio & Display</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Volume2 size={18} className="text-white" />
                <span className="text-sm text-white">Volume</span>
                <span className="text-sm text-white/70 ml-auto">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none slider"
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Brightness size={18} className="text-white" />
                <span className="text-sm text-white">Brightness</span>
                <span className="text-sm text-white/70 ml-auto">{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none slider"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
      >
        ×
      </button>
    </div>
  );
};
