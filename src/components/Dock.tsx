
import React from 'react';

interface DockProps {
  onOpenApp: (appId: string) => void;
}

const Dock: React.FC<DockProps> = ({ onOpenApp }) => {
  const dockApps = [
    { id: 'tesla-control', icon: '🚗', name: 'Tesla' },
    { id: 'safari', icon: '🌐', name: 'Safari' },
    { id: 'calendar', icon: '📅', name: 'Calendar' },
    { id: 'weather', icon: '🌤️', name: 'Weather' },
    { id: 'music', icon: '🎵', name: 'Music' }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl px-4 py-3 border border-white/10">
        <div className="flex items-center space-x-4">
          {dockApps.map((app, index) => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20 hover:border-white/40"
            >
              <span className="filter drop-shadow-sm">{app.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dock;
