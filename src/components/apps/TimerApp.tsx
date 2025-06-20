
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Clock } from 'lucide-react';

interface Timer {
  id: string;
  type: 'charging' | 'parking' | 'productivity' | 'preconditioning';
  title: string;
  duration: number; // in seconds
  remaining: number;
  isRunning: boolean;
  color: string;
  icon: string;
}

const TimerApp: React.FC = () => {
  const [timers, setTimers] = useState<Timer[]>([
    {
      id: '1',
      type: 'charging',
      title: 'Supercharger Session',
      duration: 1800, // 30 minutes
      remaining: 1245,
      isRunning: true,
      color: 'from-green-500 to-emerald-600',
      icon: '⚡'
    },
    {
      id: '2',
      type: 'parking',
      title: 'Downtown Parking',
      duration: 7200, // 2 hours
      remaining: 3600,
      isRunning: true,
      color: 'from-red-500 to-red-600',
      icon: '🅿️'
    },
    {
      id: '3',
      type: 'productivity',
      title: 'Focus Session',
      duration: 1500, // 25 minutes (Pomodoro)
      remaining: 1500,
      isRunning: false,
      color: 'from-blue-500 to-blue-600',
      icon: '⏱️'
    }
  ]);

  const [newTimerDuration, setNewTimerDuration] = useState(25);
  const [newTimerType, setNewTimerType] = useState<Timer['type']>('productivity');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map(timer => {
          if (timer.isRunning && timer.remaining > 0) {
            return { ...timer, remaining: timer.remaining - 1 };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTimer = (id: string) => {
    setTimers(timers.map(timer =>
      timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
    ));
  };

  const stopTimer = (id: string) => {
    setTimers(timers.map(timer =>
      timer.id === id ? { ...timer, isRunning: false, remaining: timer.duration } : timer
    ));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (timer: Timer) => {
    return ((timer.duration - timer.remaining) / timer.duration) * 100;
  };

  const addNewTimer = () => {
    const timerTypes = {
      charging: { icon: '⚡', color: 'from-green-500 to-emerald-600' },
      parking: { icon: '🅿️', color: 'from-red-500 to-red-600' },
      productivity: { icon: '⏱️', color: 'from-blue-500 to-blue-600' },
      preconditioning: { icon: '🌡️', color: 'from-orange-500 to-orange-600' }
    };

    const newTimer: Timer = {
      id: Date.now().toString(),
      type: newTimerType,
      title: `${newTimerType.charAt(0).toUpperCase() + newTimerType.slice(1)} Timer`,
      duration: newTimerDuration * 60,
      remaining: newTimerDuration * 60,
      isRunning: false,
      color: timerTypes[newTimerType].color,
      icon: timerTypes[newTimerType].icon
    };

    setTimers([...timers, newTimer]);
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-900 via-indigo-900/30 to-blue-900/30 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <Clock className="mr-3" size={32} />
          Timer Hub
        </h1>
        <p className="text-gray-400">Tesla-optimized timing for charging, parking, and productivity</p>
      </div>

      {/* Active Timers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {timers.map(timer => (
          <div
            key={timer.id}
            className={`bg-gradient-to-br ${timer.color} rounded-2xl p-6 border border-white/20 relative overflow-hidden`}
          >
            {/* Timer Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-3xl mr-3">{timer.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{timer.title}</h3>
                  <span className="text-sm opacity-75 capitalize">{timer.type}</span>
                </div>
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className="text-4xl font-mono font-bold mb-2">
                {formatTime(timer.remaining)}
              </div>
              <div className="text-sm opacity-75">
                {timer.remaining === 0 ? 'Complete!' : 
                 timer.isRunning ? 'Running' : 'Paused'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/20 rounded-full h-2 mb-4">
              <div
                className="bg-white/80 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage(timer)}%` }}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => toggleTimer(timer.id)}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                {timer.isRunning ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={() => stopTimer(timer.id)}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <Square size={20} />
              </button>
            </div>

            {/* Timer Type Indicator */}
            <div className="absolute top-4 right-4">
              <div className={`w-3 h-3 rounded-full ${
                timer.type === 'charging' ? 'bg-green-400' :
                timer.type === 'parking' ? 'bg-red-400' :
                timer.type === 'productivity' ? 'bg-blue-400' :
                'bg-orange-400'
              } ${timer.isRunning ? 'animate-pulse' : ''}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Add New Timer */}
      <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Add New Timer
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Timer Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Timer Type</label>
            <select
              value={newTimerType}
              onChange={(e) => setNewTimerType(e.target.value as Timer['type'])}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2"
            >
              <option value="charging">⚡ Charging</option>
              <option value="parking">🅿️ Parking</option>
              <option value="productivity">⏱️ Productivity</option>
              <option value="preconditioning">🌡️ Pre-conditioning</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={newTimerDuration}
              onChange={(e) => setNewTimerDuration(parseInt(e.target.value) || 1)}
              min="1"
              max="480"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2"
            />
          </div>

          {/* Add Button */}
          <div className="flex items-end">
            <button
              onClick={addNewTimer}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2 px-4 rounded-xl font-semibold transition-all"
            >
              Create Timer
            </button>
          </div>
        </div>
      </div>

      {/* Tesla Integration Info */}
      <div className="mt-8 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-6 border border-red-400/30">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          🚗 Tesla Smart Timers
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-xl p-4">
            <div className="text-cyan-400 font-semibold mb-2">⚡ Auto Charging Timers</div>
            <div className="text-sm text-gray-300">
              Automatically created when you start charging sessions
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-4">
            <div className="text-green-400 font-semibold mb-2">🌡️ Climate Pre-conditioning</div>
            <div className="text-sm text-gray-300">
              Schedule cabin heating/cooling before departure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerApp;
