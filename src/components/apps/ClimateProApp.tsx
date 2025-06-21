
import React, { useState, useEffect } from 'react';
import { Thermometer, Wind, Fan, Calendar, Zap, Settings } from 'lucide-react';

const ClimateProApp: React.FC = () => {
  const [climateData, setClimateData] = useState({
    isOn: true,
    driverTemp: 72,
    passengerTemp: 72,
    fanSpeed: 4,
    outsideTemp: 68,
    insideTemp: 72,
    seatHeatingDriver: 0,
    seatHeatingPassenger: 0,
    steeringWheelHeating: false,
    defrost: false,
    mode: 'auto', // auto, heat, cool, off
    energyUsage: 2.8 // kW
  });

  const [presets, setPresets] = useState([
    { name: 'Comfort', driverTemp: 72, passengerTemp: 72, fanSpeed: 3 },
    { name: 'Eco', driverTemp: 70, passengerTemp: 70, fanSpeed: 2 },
    { name: 'Max Cool', driverTemp: 65, passengerTemp: 65, fanSpeed: 7 },
    { name: 'Max Heat', driverTemp: 78, passengerTemp: 78, fanSpeed: 6 }
  ]);

  const [scheduledEvents, setScheduledEvents] = useState([
    { 
      id: 1, 
      time: '8:30 AM', 
      event: 'Morning Commute', 
      targetTemp: 72, 
      preCondition: true 
    },
    { 
      id: 2, 
      time: '5:30 PM', 
      event: 'Evening Return', 
      targetTemp: 70, 
      preCondition: true 
    }
  ]);

  const handleTempChange = (type: 'driver' | 'passenger', change: number) => {
    setClimateData(prev => ({
      ...prev,
      [type === 'driver' ? 'driverTemp' : 'passengerTemp']: Math.max(60, Math.min(85, 
        prev[type === 'driver' ? 'driverTemp' : 'passengerTemp'] + change
      ))
    }));
  };

  const handleFanSpeedChange = (change: number) => {
    setClimateData(prev => ({
      ...prev,
      fanSpeed: Math.max(0, Math.min(7, prev.fanSpeed + change))
    }));
  };

  const handleSeatHeating = (seat: 'driver' | 'passenger', level: number) => {
    setClimateData(prev => ({
      ...prev,
      [seat === 'driver' ? 'seatHeatingDriver' : 'seatHeatingPassenger']: level
    }));
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setClimateData(prev => ({
      ...prev,
      driverTemp: preset.driverTemp,
      passengerTemp: preset.passengerTemp,
      fanSpeed: preset.fanSpeed
    }));
  };

  const toggleClimate = () => {
    setClimateData(prev => ({ ...prev, isOn: !prev.isOn }));
  };

  const getRangeImpact = (energyUsage: number) => {
    const baseRange = 300; // miles
    const impactPercent = (energyUsage / 50) * 100; // Rough calculation
    return Math.min(15, Math.round(impactPercent));
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-cyan-900/20 text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Thermometer className="mr-2 text-blue-400" />
              Climate Pro
            </h1>
            <p className="text-white/70">Advanced climate control system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm opacity-80">Energy Usage</div>
              <div className="text-lg font-bold">{climateData.energyUsage}kW</div>
            </div>
            <button
              onClick={toggleClimate}
              className={`w-16 h-8 rounded-full transition-colors ${
                climateData.isOn ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                climateData.isOn ? 'translate-x-9' : 'translate-x-1'
              } mt-1`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Temperature Control */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-400/30">
          <h2 className="text-xl font-bold mb-4">Temperature Control</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Driver Side */}
            <div className="text-center">
              <div className="text-sm opacity-80 mb-2">Driver</div>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={() => handleTempChange('driver', -1)}
                  className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center text-xl font-bold hover:bg-blue-500/50 transition-colors"
                >
                  -
                </button>
                <div className="text-4xl font-bold w-20">{climateData.driverTemp}°</div>
                <button
                  onClick={() => handleTempChange('driver', 1)}
                  className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center text-xl font-bold hover:bg-red-500/50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Passenger Side */}
            <div className="text-center">
              <div className="text-sm opacity-80 mb-2">Passenger</div>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={() => handleTempChange('passenger', -1)}
                  className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center text-xl font-bold hover:bg-blue-500/50 transition-colors"
                >
                  -
                </button>
                <div className="text-4xl font-bold w-20">{climateData.passengerTemp}°</div>
                <button
                  onClick={() => handleTempChange('passenger', 1)}
                  className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center text-xl font-bold hover:bg-red-500/50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-black/20 rounded-xl p-4 mt-4">
            <div className="flex justify-between items-center text-sm">
              <span>Inside: {climateData.insideTemp}°F</span>
              <span>Outside: {climateData.outsideTemp}°F</span>
              <span>Mode: {climateData.mode.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Fan Control */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Fan className="mr-2" />
            Fan Speed
          </h3>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleFanSpeedChange(-1)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold hover:bg-white/30 transition-colors"
            >
              -
            </button>
            
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                <div
                  key={level}
                  className={`w-6 h-6 rounded-full ${
                    level <= climateData.fanSpeed ? 'bg-blue-400' : 'bg-white/20'
                  } transition-colors`}
                ></div>
              ))}
            </div>
            
            <button
              onClick={() => handleFanSpeedChange(1)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold hover:bg-white/30 transition-colors"
            >
              +
            </button>
          </div>
          
          <div className="text-center mt-2 text-sm opacity-80">
            Level {climateData.fanSpeed} of 7
          </div>
        </div>

        {/* Seat Heating */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold mb-4">Seat Heating</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-sm opacity-80 mb-3">Driver Seat</div>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleSeatHeating('driver', level)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
                      climateData.seatHeatingDriver === level
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {level === 0 ? 'OFF' : level}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm opacity-80 mb-3">Passenger Seat</div>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleSeatHeating('passenger', level)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
                      climateData.seatHeatingPassenger === level
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {level === 0 ? 'OFF' : level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold mb-4">Quick Presets</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/50 hover:from-purple-500/30 hover:to-pink-500/30 transition-colors"
              >
                <div className="font-semibold">{preset.name}</div>
                <div className="text-xs opacity-80">{preset.driverTemp}°F • Fan {preset.fanSpeed}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Impact */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/30">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Zap className="mr-2 text-yellow-400" />
            Energy Impact
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{climateData.energyUsage}kW</div>
              <div className="text-sm opacity-80">Current Usage</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{getRangeImpact(climateData.energyUsage)}%</div>
              <div className="text-sm opacity-80">Range Impact</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm opacity-80">
            💡 Tip: Reducing fan speed and using seat heating can improve efficiency
          </div>
        </div>

        {/* Scheduled Preconditioning */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Calendar className="mr-2 text-green-400" />
            Scheduled Preconditioning
          </h3>
          
          <div className="space-y-3">
            {scheduledEvents.map((event) => (
              <div key={event.id} className="flex justify-between items-center p-3 bg-green-500/20 rounded-lg border border-green-400/50">
                <div>
                  <div className="font-semibold">{event.event}</div>
                  <div className="text-sm opacity-80">{event.time} • Target: {event.targetTemp}°F</div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  event.preCondition ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {event.preCondition ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 p-3 bg-blue-500/20 border border-blue-400 rounded-xl font-semibold hover:bg-blue-500/30 transition-colors">
            Add Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClimateProApp;
