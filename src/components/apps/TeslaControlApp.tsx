
import React, { useState } from 'react';
import { Lock, Unlock, Zap, Wind, Car, Thermometer } from 'lucide-react';

const TeslaControlApp: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [isCharging, setIsCharging] = useState(false);
  const [climateOn, setClimateOn] = useState(false);
  const [temperature, setTemperature] = useState(72);

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
    // Here you would integrate with Tesla API
    console.log(`Vehicle ${isLocked ? 'unlocked' : 'locked'}`);
  };

  const handleChargingToggle = () => {
    setIsCharging(!isCharging);
    console.log(`Charging ${isCharging ? 'stopped' : 'started'}`);
  };

  const handleClimateToggle = () => {
    setClimateOn(!climateOn);
    console.log(`Climate ${climateOn ? 'turned off' : 'turned on'}`);
  };

  return (
    <div className="p-6 text-white h-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* Vehicle Status Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Car className="mr-2 text-red-400" />
              Model 3 Performance
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">Connected</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">287</div>
              <div className="text-sm text-gray-300">Miles Range</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">85%</div>
              <div className="text-sm text-gray-300">Battery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">72°F</div>
              <div className="text-sm text-gray-300">Interior</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-6">
        {/* Lock/Unlock */}
        <button
          onClick={handleLockToggle}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
            isLocked 
              ? 'bg-red-500/20 border-red-400 hover:bg-red-500/30' 
              : 'bg-green-500/20 border-green-400 hover:bg-green-500/30'
          }`}
        >
          <div className="flex flex-col items-center">
            {isLocked ? <Lock size={32} /> : <Unlock size={32} />}
            <span className="mt-2 text-lg font-semibold">
              {isLocked ? '🔒 Locked' : '🔓 Unlocked'}
            </span>
          </div>
        </button>

        {/* Charging */}
        <button
          onClick={handleChargingToggle}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
            isCharging 
              ? 'bg-yellow-500/20 border-yellow-400 hover:bg-yellow-500/30' 
              : 'bg-gray-500/20 border-gray-400 hover:bg-gray-500/30'
          }`}
        >
          <div className="flex flex-col items-center">
            <Zap size={32} />
            <span className="mt-2 text-lg font-semibold">
              {isCharging ? '⚡ Charging' : '🔌 Start Charge'}
            </span>
          </div>
        </button>

        {/* Climate Control */}
        <button
          onClick={handleClimateToggle}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
            climateOn 
              ? 'bg-blue-500/20 border-blue-400 hover:bg-blue-500/30' 
              : 'bg-gray-500/20 border-gray-400 hover:bg-gray-500/30'
          }`}
        >
          <div className="flex flex-col items-center">
            <Wind size={32} />
            <span className="mt-2 text-lg font-semibold">
              {climateOn ? '❄️ Climate On' : '🌡️ Start Climate'}
            </span>
          </div>
        </button>

        {/* Temperature Control */}
        <div className="p-6 rounded-2xl border-2 border-purple-400 bg-purple-500/20">
          <div className="flex flex-col items-center">
            <Thermometer size={32} />
            <span className="mt-2 text-lg font-semibold mb-4">🌡️ Temperature</span>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setTemperature(Math.max(60, temperature - 1))}
                className="w-8 h-8 bg-blue-500 rounded-full text-white font-bold hover:bg-blue-600"
              >
                -
              </button>
              <span className="text-2xl font-bold w-12 text-center">{temperature}°</span>
              <button 
                onClick={() => setTemperature(Math.min(85, temperature + 1))}
                className="w-8 h-8 bg-red-500 rounded-full text-white font-bold hover:bg-red-600"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <button className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-400/50 hover:scale-105 transition-transform">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-sm">Preheat</div>
          </button>
          <button className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/50 hover:scale-105 transition-transform">
            <div className="text-2xl mb-1">🎵</div>
            <div className="text-sm">Music</div>
          </button>
          <button className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/50 hover:scale-105 transition-transform">
            <div className="text-2xl mb-1">💨</div>
            <div className="text-sm">Vent</div>
          </button>
          <button className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/50 hover:scale-105 transition-transform">
            <div className="text-2xl mb-1">🚨</div>
            <div className="text-sm">Horn</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeslaControlApp;
