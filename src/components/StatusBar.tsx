
import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface StatusBarProps {
  currentTime: Date;
  batteryLevel: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentTime, batteryLevel }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full h-8 bg-black/30 backdrop-blur-md flex items-center justify-between px-6 text-white text-sm font-medium relative z-50">
      {/* Left side - Date */}
      <div className="flex items-center space-x-2">
        <span className="text-cyan-300">📅</span>
        <span>{formatDate(currentTime)}</span>
      </div>

      {/* Center - Tesla Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="text-red-400">🚗</span>
          <span className="text-xs text-green-400">Connected</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">🔋</span>
          <span className="text-xs">287 mi</span>
        </div>
      </div>

      {/* Right side - Time and System Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Signal size={14} className="text-green-400" />
          <Wifi size={14} className="text-blue-400" />
          <div className="flex items-center space-x-1">
            <Battery size={14} className={batteryLevel > 20 ? "text-green-400" : "text-red-400"} />
            <span className="text-xs">{batteryLevel}%</span>
          </div>
        </div>
        <div className="text-lg font-bold text-white">
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
