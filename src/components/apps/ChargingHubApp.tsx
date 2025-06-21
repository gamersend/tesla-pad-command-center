
import React, { useState, useEffect } from 'react';
import { Zap, Clock, DollarSign, MapPin, Calendar, TrendingUp } from 'lucide-react';

const ChargingHubApp: React.FC = () => {
  const [chargingData, setChargingData] = useState({
    isCharging: true,
    currentCharge: 67,
    targetCharge: 80,
    chargeRate: 48, // kW
    timeRemaining: 23, // minutes
    costSoFar: 8.45,
    estimatedTotal: 10.20,
    efficiency: 4.2, // mi/kWh
    location: 'Supercharger - Downtown Mall'
  });

  const [chargingHistory, setChargingHistory] = useState([
    {
      id: 1,
      date: '2024-06-20',
      location: 'Home (Wall Connector)',
      duration: '6h 23m',
      energy: 45.2,
      cost: 6.78,
      efficiency: 4.1
    },
    {
      id: 2,
      date: '2024-06-19',
      location: 'Supercharger - Highway 101',
      duration: '28m',
      energy: 32.1,
      cost: 12.85,
      efficiency: 4.3
    },
    {
      id: 3,
      date: '2024-06-18',
      location: 'Destination Charger - Hotel',
      duration: '8h 15m',
      energy: 52.8,
      cost: 0.00,
      efficiency: 4.0
    }
  ]);

  const [nearbyChargers, setNearbyChargers] = useState([
    {
      id: 1,
      name: 'Supercharger - Shopping Center',
      distance: '2.1 mi',
      available: 6,
      total: 8,
      maxPower: '250kW',
      pricing: '$0.42/kWh'
    },
    {
      id: 2,
      name: 'Supercharger - Highway Rest Stop',
      distance: '5.8 mi',
      available: 12,
      total: 16,
      maxPower: '250kW',
      pricing: '$0.38/kWh'
    },
    {
      id: 3,
      name: 'ChargePoint - Office Complex',
      distance: '1.5 mi',
      available: 3,
      total: 4,
      maxPower: '50kW',
      pricing: '$0.25/kWh'
    }
  ]);

  useEffect(() => {
    // Simulate charging progress
    if (chargingData.isCharging) {
      const interval = setInterval(() => {
        setChargingData(prev => {
          const newCharge = Math.min(prev.targetCharge, prev.currentCharge + 0.1);
          const newTimeRemaining = Math.max(0, prev.timeRemaining - 0.1);
          const newCostSoFar = prev.costSoFar + 0.01;
          
          return {
            ...prev,
            currentCharge: newCharge,
            timeRemaining: newTimeRemaining,
            costSoFar: newCostSoFar,
            isCharging: newCharge < prev.targetCharge
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [chargingData.isCharging]);

  const handleStartCharging = () => {
    setChargingData(prev => ({ ...prev, isCharging: true }));
  };

  const handleStopCharging = () => {
    setChargingData(prev => ({ ...prev, isCharging: false }));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-green-900/20 to-blue-900/20 text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold flex items-center">
          <Zap className="mr-2 text-green-400" />
          Charging Hub Pro
        </h1>
        <p className="text-white/70">Smart charging management and optimization</p>
      </div>

      {/* Current Charging Status */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">{chargingData.isCharging ? 'Charging Active' : 'Ready to Charge'}</h2>
              <p className="text-green-300">{chargingData.location}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{chargingData.chargeRate}kW</div>
              <div className="text-sm opacity-80">Charge Rate</div>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - chargingData.currentCharge / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold">{Math.round(chargingData.currentCharge)}%</div>
                <div className="text-sm opacity-80">Target: {chargingData.targetCharge}%</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <Clock className="mr-1 text-blue-400" size={20} />
                {formatDuration(chargingData.timeRemaining)}
              </div>
              <div className="text-sm opacity-80">Time Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <DollarSign className="mr-1 text-green-400" size={20} />
                {chargingData.costSoFar.toFixed(2)}
              </div>
              <div className="text-sm opacity-80">Cost So Far</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <TrendingUp className="mr-1 text-purple-400" size={20} />
                {chargingData.efficiency}
              </div>
              <div className="text-sm opacity-80">mi/kWh</div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {chargingData.isCharging ? (
              <button
                onClick={handleStopCharging}
                className="flex-1 bg-red-500/20 border border-red-400 rounded-xl py-3 px-4 font-semibold hover:bg-red-500/30 transition-colors"
              >
                Stop Charging
              </button>
            ) : (
              <button
                onClick={handleStartCharging}
                className="flex-1 bg-green-500/20 border border-green-400 rounded-xl py-3 px-4 font-semibold hover:bg-green-500/30 transition-colors"
              >
                Start Charging
              </button>
            )}
            <button className="px-6 py-3 bg-blue-500/20 border border-blue-400 rounded-xl font-semibold hover:bg-blue-500/30 transition-colors">
              Schedule
            </button>
          </div>
        </div>

        {/* Nearby Chargers */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <MapPin className="mr-2 text-blue-400" />
            Nearby Charging Stations
          </h3>
          
          <div className="space-y-3">
            {nearbyChargers.map((charger) => (
              <div key={charger.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{charger.name}</div>
                    <div className="text-sm opacity-80">{charger.distance} • {charger.maxPower} • {charger.pricing}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${charger.available > 2 ? 'text-green-400' : charger.available > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {charger.available}/{charger.total} available
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charging History */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Calendar className="mr-2 text-purple-400" />
            Recent Charging Sessions
          </h3>
          
          <div className="space-y-3">
            {chargingHistory.map((session) => (
              <div key={session.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">{session.location}</div>
                    <div className="text-sm opacity-80">{session.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${session.cost.toFixed(2)}</div>
                    <div className="text-sm opacity-80">{session.energy.toFixed(1)} kWh</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm opacity-80">
                  <span>Duration: {session.duration}</span>
                  <span>Efficiency: {session.efficiency} mi/kWh</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargingHubApp;
