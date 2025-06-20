
import React from 'react';
import AppIcon from './AppIcon';

interface HomeScreenProps {
  onOpenApp: (appId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenApp }) => {
  const apps = [
    {
      id: 'tesla-control',
      name: '🚗 Tesla Control',
      icon: '🚗',
      gradient: 'from-red-500 to-red-700',
      category: 'tesla'
    },
    {
      id: 'tesla-status',
      name: '📊 Tesla Status',
      icon: '📊',
      gradient: 'from-blue-500 to-blue-700',
      category: 'tesla'
    },
    {
      id: 'charging-hub',
      name: '⚡ Charging Hub',
      icon: '⚡',
      gradient: 'from-yellow-500 to-orange-600',
      category: 'tesla'
    },
    {
      id: 'climate-pro',
      name: '🌡️ Climate Pro',
      icon: '🌡️',
      gradient: 'from-cyan-500 to-blue-600',
      category: 'tesla'
    },
    {
      id: 'safari',
      name: '🌐 Safari',
      icon: '🌐',
      gradient: 'from-blue-400 to-blue-600',
      category: 'productivity'
    },
    {
      id: 'calendar',
      name: '📅 Calendar',
      icon: '📅',
      gradient: 'from-red-400 to-pink-600',
      category: 'productivity'
    },
    {
      id: 'mail',
      name: '✉️ Mail',
      icon: '✉️',
      gradient: 'from-blue-500 to-indigo-600',
      category: 'productivity'
    },
    {
      id: 'notes',
      name: '📝 Notes Pro',
      icon: '📝',
      gradient: 'from-yellow-400 to-orange-500',
      category: 'productivity'
    },
    {
      id: 'weather',
      name: '🌤️ Weather Pro',
      icon: '🌤️',
      gradient: 'from-blue-400 to-cyan-500',
      category: 'productivity'
    },
    {
      id: 'maps',
      name: '🗺️ Maps Lite',
      icon: '🗺️',
      gradient: 'from-green-500 to-emerald-600',
      category: 'productivity'
    },
    {
      id: 'timer',
      name: '⏰ Timer Hub',
      icon: '⏰',
      gradient: 'from-purple-500 to-indigo-600',
      category: 'productivity'
    },
    {
      id: 'music',
      name: '🎵 Music',
      icon: '🎵',
      gradient: 'from-pink-500 to-rose-600',
      category: 'entertainment'
    }
  ];

  return (
    <div className="flex-1 p-8 pt-16 pb-32">
      {/* Tesla Apps Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">🚗</span>
          Tesla Control Center
          <span className="ml-2 text-lg">⚡</span>
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {apps.filter(app => app.category === 'tesla').map(app => (
            <AppIcon
              key={app.id}
              app={app}
              onClick={() => onOpenApp(app.id)}
            />
          ))}
        </div>
      </div>

      {/* Productivity Apps Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">💼</span>
          Productivity Suite
          <span className="ml-2 text-lg">🚀</span>
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {apps.filter(app => app.category === 'productivity').map(app => (
            <AppIcon
              key={app.id}
              app={app}
              onClick={() => onOpenApp(app.id)}
            />
          ))}
        </div>
      </div>

      {/* Entertainment Apps Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">🎵</span>
          Entertainment
          <span className="ml-2 text-lg">🎉</span>
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {apps.filter(app => app.category === 'entertainment').map(app => (
            <AppIcon
              key={app.id}
              app={app}
              onClick={() => onOpenApp(app.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
