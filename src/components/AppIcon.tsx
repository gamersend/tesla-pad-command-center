
import React from 'react';

interface AppIconProps {
  app: {
    id: string;
    name: string;
    icon: string;
    gradient: string;
    category: string;
  };
  onClick: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ app, onClick }) => {
  return (
    <div 
      className="relative group cursor-pointer transform transition-all duration-200 hover:scale-110 active:scale-95"
      onClick={onClick}
    >
      {/* App Icon */}
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${app.gradient} shadow-lg flex items-center justify-center text-3xl relative overflow-hidden`}>
        {/* Gloss Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl"></div>
        
        {/* Chaotic Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-2 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <span className="relative z-10 filter drop-shadow-sm">{app.icon}</span>
        
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
      
      {/* App Name */}
      <div className="mt-2 text-center">
        <span className="text-white text-sm font-medium block px-1 leading-tight">
          {app.name}
        </span>
      </div>

      {/* Active State Indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-0 group-active:opacity-100 transition-opacity duration-100"></div>
    </div>
  );
};

export default AppIcon;
