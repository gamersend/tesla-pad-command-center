
import React from 'react';
import { StatusBar } from '@/components/StatusBar';
import { HomeScreen } from '@/components/HomeScreen';
import { Dock } from '@/components/Dock';

const Index = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Dynamic background with animated elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-36 h-36 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-3000"></div>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Main Content Area */}
      <div className="flex-1 relative z-10">
        <HomeScreen />
      </div>

      {/* Dock */}
      <Dock />
    </div>
  );
};

export default Index;
