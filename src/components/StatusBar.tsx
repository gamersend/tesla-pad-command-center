
import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

export const StatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Tesla battery status simulation
    const batteryTimer = setInterval(() => {
      setBatteryLevel(prev => {
        const newLevel = prev + (Math.random() - 0.5) * 2;
        return Math.max(0, Math.min(100, newLevel));
      });
    }, 30000);

    // Check if Tesla is charging
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setIsCharging(battery.charging);
        setBatteryLevel(Math.round(battery.level * 100));
      });
    }

    return () => {
      clearInterval(timer);
      clearInterval(batteryTimer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="ipados-status-bar">
      {/* Left side - Time */}
      <div className="status-left">
        <span className="status-time font-mono">
          {formatTime(time)}
        </span>
      </div>

      {/* Center - Tesla branding */}
      <div className="flex items-center">
        <span className="text-sm font-semibold text-red-500">TESLA</span>
      </div>

      {/* Right side - System indicators */}
      <div className="status-right">
        <div className="flex items-center gap-1">
          <Signal className="status-icon" />
          <span className="text-xs">5G</span>
        </div>
        
        <Wifi className="status-icon" />
        
        <div className="flex items-center gap-1">
          <Battery 
            className={`status-icon ${isCharging ? 'text-green-400' : ''}`}
            fill={batteryLevel > 20 ? 'currentColor' : 'none'}
          />
          <span className="text-xs">{batteryLevel}%</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
