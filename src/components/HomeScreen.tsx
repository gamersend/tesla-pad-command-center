
import React from 'react';
import AppIcon from './AppIcon';

interface HomeScreenProps {
  onOpenApp: (appId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenApp }) => {
  const apps = [
    // Tesla Control Center
    { id: 'tesla-control', name: 'Tesla Control', icon: '🚗', gradient: 'linear-gradient(135deg, #E31937 0%, #FF6B6B 100%)', category: 'tesla' },
    { id: 'tesla-status', name: 'Tesla Status', icon: '📊', gradient: 'linear-gradient(135deg, #E31937 0%, #FF6B6B 100%)', category: 'tesla' },
    { id: 'charging', name: 'Charging', icon: '⚡', gradient: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)', category: 'tesla' },
    { id: 'climate', name: 'Climate', icon: '🌡️', gradient: 'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)', category: 'tesla' },
    
    // Productivity Suite
    { id: 'safari', name: 'Safari', icon: '🌐', gradient: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)', category: 'productivity' },
    { id: 'calendar', name: 'Calendar', icon: '📅', gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)', category: 'productivity' },
    { id: 'mail', name: 'Mail', icon: '✉️', gradient: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)', category: 'productivity' },
    { id: 'notes', name: 'Notes', icon: '📝', gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)', category: 'productivity' },
    { id: 'weather', name: 'Weather', icon: '🌤️', gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', category: 'productivity' },
    { id: 'maps', name: 'Maps', icon: '🗺️', gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', category: 'productivity' },
    { id: 'timer', name: 'Timer', icon: '⏰', gradient: 'linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)', category: 'productivity' },
    { id: 'music', name: 'Music', icon: '🎵', gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)', category: 'productivity' },

    // Utility Apps
    { id: 'search', name: 'Search', icon: '🔍', gradient: 'linear-gradient(135deg, #AF52DE 0%, #5856D6 100%)', category: 'utility' },
    { id: 'color-picker', name: 'Colors', icon: '🎨', gradient: 'linear-gradient(135deg, #FF2D92 0%, #AF52DE 100%)', category: 'utility' },
    { id: 'dice', name: 'Dice', icon: '🎲', gradient: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', category: 'utility' },
    { id: 'quotes', name: 'Quotes', icon: '💭', gradient: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', category: 'utility' },
  ];

  return (
    <div className="ipados-home-screen">
      {apps.slice(0, 30).map((app) => (
        <div key={app.id} className="app-icon-container touch-feedback">
          <div 
            className="app-icon hw-accelerated"
            style={{ background: app.gradient }}
            onClick={() => onOpenApp(app.id)}
          >
            <span className="text-2xl">{app.icon}</span>
          </div>
          <span className="app-label">{app.name}</span>
        </div>
      ))}
    </div>
  );
};

export default HomeScreen;
