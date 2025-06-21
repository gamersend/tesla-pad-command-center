
import React, { useState, useEffect } from 'react';
import { Battery, Car, Shield, Thermometer, MapPin, Clock } from 'lucide-react';

const TeslaStatusApp: React.FC = () => {
  const [vehicleData, setVehicleData] = useState({
    battery_level: 85,
    range: 287,
    inside_temp: 72,
    outside_temp: 68,
    doors_open: false,
    windows_open: false,
    trunk_open: false,
    frunk_open: false,
    locked: true,
    state: 'online',
    location: 'Home • Parked',
    lastUpdate: new Date()
  });

  const [alerts, setAlerts] = useState([
    {
      type: 'info',
      title: 'Climate Active',
      message: 'Pre-conditioning started for departure at 8:30 AM',
      action: 'View Settings'
    }
  ]);

  useEffect(() => {
    // Simulate data polling
    const pollInterval = setInterval(() => {
      setVehicleData(prev => ({
        ...prev,
        lastUpdate: new Date(),
        // Simulate slight variations
        battery_level: Math.max(10, prev.battery_level + (Math.random() - 0.5) * 0.5),
        range: Math.max(20, prev.range + (Math.random() - 0.5) * 2)
      }));
    }, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'from-green-500 to-green-600';
    if (level > 20) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/20 to-blue-500/20 p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Car className="mr-2 text-red-400" />
              Model 3 Performance
            </h1>
            <p className="text-white/70">Vehicle Status Monitor</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-semibold">{vehicleData.state}</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Battery Widget */}
        <div className={`bg-gradient-to-br ${getBatteryColor(vehicleData.battery_level)} rounded-2xl p-6 relative overflow-hidden`}>
          <Battery className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold">{Math.round(vehicleData.battery_level)}%</div>
          <div className="text-sm opacity-80 mb-2">{Math.round(vehicleData.range)} miles range</div>
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
            <div 
              className="h-full bg-white/60 transition-all duration-1000"
              style={{ width: `${vehicleData.battery_level}%` }}
            ></div>
          </div>
        </div>

        {/* Climate Widget */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-400/30">
          <Thermometer className="w-8 h-8 mb-3 text-blue-400" />
          <div className="text-4xl font-bold">{vehicleData.inside_temp}°F</div>
          <div className="text-sm opacity-80">Interior • {vehicleData.outside_temp}°F Outside</div>
          <div className="mt-2 text-xs text-blue-300">Climate: Auto</div>
        </div>

        {/* Location Widget */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
          <MapPin className="w-8 h-8 mb-3 text-purple-400" />
          <div className="text-lg font-bold">{vehicleData.location}</div>
          <div className="text-sm opacity-80">GPS Location</div>
          <div className="mt-2 text-xs text-purple-300">Last update: {formatLastUpdate(vehicleData.lastUpdate)}</div>
        </div>
      </div>

      {/* Vehicle Schematic */}
      <div className="mx-6 mb-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Shield className="mr-2 text-green-400" />
          Vehicle Security Status
        </h3>
        
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${vehicleData.locked ? 'bg-green-500/20 border-2 border-green-400' : 'bg-red-500/20 border-2 border-red-400'}`}>
                🚗
              </div>
              <div className="text-sm font-semibold">{vehicleData.locked ? 'Locked' : 'Unlocked'}</div>
              <div className="text-xs opacity-70">Doors</div>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${!vehicleData.windows_open ? 'bg-green-500/20 border-2 border-green-400' : 'bg-yellow-500/20 border-2 border-yellow-400'}`}>
                🪟
              </div>
              <div className="text-sm font-semibold">{vehicleData.windows_open ? 'Vented' : 'Closed'}</div>
              <div className="text-xs opacity-70">Windows</div>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${!vehicleData.trunk_open ? 'bg-green-500/20 border-2 border-green-400' : 'bg-red-500/20 border-2 border-red-400'}`}>
                📦
              </div>
              <div className="text-sm font-semibold">{vehicleData.trunk_open ? 'Open' : 'Closed'}</div>
              <div className="text-xs opacity-70">Trunk</div>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${!vehicleData.frunk_open ? 'bg-green-500/20 border-2 border-green-400' : 'bg-red-500/20 border-2 border-red-400'}`}>
                🎒
              </div>
              <div className="text-sm font-semibold">{vehicleData.frunk_open ? 'Open' : 'Closed'}</div>
              <div className="text-xs opacity-70">Frunk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mx-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Clock className="mr-2 text-orange-400" />
            Active Alerts
          </h3>
          
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className={`bg-gradient-to-r rounded-xl p-4 border-l-4 ${
                alert.type === 'critical' ? 'from-red-500/20 to-red-600/20 border-red-400' :
                alert.type === 'warning' ? 'from-yellow-500/20 to-orange-500/20 border-yellow-400' :
                'from-blue-500/20 to-cyan-500/20 border-blue-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{alert.title}</div>
                    <div className="text-sm opacity-80 mt-1">{alert.message}</div>
                  </div>
                  <button className="px-3 py-1 bg-white/20 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors">
                    {alert.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Refresh Info */}
      <div className="p-6 text-center text-sm opacity-60">
        <p>Data refreshes every 15 seconds • Last update: {formatLastUpdate(vehicleData.lastUpdate)}</p>
      </div>
    </div>
  );
};

export default TeslaStatusApp;
