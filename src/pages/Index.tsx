
import React, { useState, useEffect } from 'react';
import StatusBar from '../components/StatusBar';
import HomeScreen from '../components/HomeScreen';
import Dock from '../components/Dock';
import AppModal from '../components/AppModal';

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(85);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const openAppHandler = (appId: string) => {
    setOpenApp(appId);
  };

  const closeAppHandler = () => {
    setOpenApp(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Vaporwave Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-500 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-40 w-24 h-24 bg-cyan-400 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/3 w-28 h-28 bg-yellow-400 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Status Bar */}
      <StatusBar 
        currentTime={currentTime} 
        batteryLevel={batteryLevel}
      />

      {/* Home Screen */}
      <HomeScreen onOpenApp={openAppHandler} />

      {/* Dock */}
      <Dock onOpenApp={openAppHandler} />

      {/* App Modal */}
      {openApp && (
        <AppModal 
          appId={openApp} 
          onClose={closeAppHandler} 
        />
      )}
    </div>
  );
};

export default Index;
