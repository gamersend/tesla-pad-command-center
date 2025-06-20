
import React from 'react';
import { AppIcon } from './AppIcon';

interface HomeScreenProps {
  onOpenApp: (appId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenApp }) => {
  const apps = [
    // Tesla Control Center
    { id: 'tesla-control', name: 'Tesla Control', icon: '🚗', category: 'tesla' },
    { id: 'tesla-status', name: 'Tesla Status', icon: '📊', category: 'tesla' },
    { id: 'charging', name: 'Charging Hub', icon: '⚡', category: 'tesla' },
    { id: 'climate', name: 'Climate Pro', icon: '🌡️', category: 'tesla' },
    
    // Productivity Suite
    { id: 'safari', name: 'Safari', icon: '🌐', category: 'productivity' },
    { id: 'calendar', name: 'Calendar', icon: '📅', category: 'productivity' },
    { id: 'mail', name: 'Mail', icon: '✉️', category: 'productivity' },
    { id: 'notes', name: 'Notes', icon: '📝', category: 'productivity' },
    { id: 'weather', name: 'Weather', icon: '🌤️', category: 'productivity' },
    { id: 'maps', name: 'Maps', icon: '🗺️', category: 'productivity' },
    { id: 'timer', name: 'Timer', icon: '⏰', category: 'productivity' },
    { id: 'music', name: 'Music', icon: '🎵', category: 'productivity' },

    // Utility Apps
    { id: 'search', name: 'Search Hub', icon: '🔍', category: 'utility' },
    { id: 'color-picker', name: 'Color Picker', icon: '🎨', category: 'utility' },
    { id: 'dice', name: 'Dice Roller', icon: '🎲', category: 'utility' },
    { id: 'quotes', name: 'Quote Generator', icon: '💭', category: 'utility' },
  ];

  const groupedApps = apps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, typeof apps>);

  const categoryTitles = {
    tesla: 'Tesla Control Center',
    productivity: 'Productivity Suite',
    utility: 'Utility Apps'
  };

  const categoryColors = {
    tesla: 'from-red-500/20 to-red-700/20 border-red-500/30',
    productivity: 'from-blue-500/20 to-blue-700/20 border-blue-500/30',
    utility: 'from-purple-500/20 to-purple-700/20 border-purple-500/30'
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      {/* Welcome Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to Tesla OS
        </h1>
        <p className="text-white/70 text-lg">
          Your intelligent dashboard companion
        </p>
      </div>

      {/* App Categories */}
      <div className="space-y-8">
        {Object.entries(groupedApps).map(([category, categoryApps]) => (
          <div key={category} className={`bg-gradient-to-br ${categoryColors[category as keyof typeof categoryColors]} backdrop-blur-sm rounded-3xl p-6 border`}>
            <h2 className="text-2xl font-bold text-white mb-6">
              {categoryTitles[category as keyof typeof categoryTitles]}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categoryApps.map((app) => (
                <AppIcon
                  key={app.id}
                  name={app.name}
                  icon={app.icon}
                  onClick={() => onOpenApp(app.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-white font-semibold">Battery</div>
          <div className="text-white/70">85% • 267 mi</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="text-3xl mb-2">🌡️</div>
          <div className="text-white font-semibold">Climate</div>
          <div className="text-white/70">72°F • Auto</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="text-3xl mb-2">📍</div>
          <div className="text-white font-semibold">Location</div>
          <div className="text-white/70">Home • Parked</div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
