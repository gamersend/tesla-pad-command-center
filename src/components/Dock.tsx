
import React from 'react';

interface DockProps {
  onOpenApp: (appId: string) => void;
}

const Dock: React.FC<DockProps> = ({ onOpenApp }) => {
  const dockApps = [
    { id: 'tesla-control', icon: '🚗', name: 'Tesla Control' },
    { id: 'safari', icon: '🌐', name: 'Safari' },
    { id: 'maps', icon: '🗺️', name: 'Maps' },
    { id: 'music', icon: '🎵', name: 'Music' },
    { id: 'search', icon: '🔍', name: 'Search' },
    { id: 'notes', icon: '📝', name: 'Notes' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black/30 backdrop-blur-xl rounded-3xl p-4 border border-white/20 shadow-2xl">
        <div className="flex items-center space-x-4">
          {dockApps.map((app) => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center justify-center text-2xl hover:scale-110 border border-white/10 hover:border-white/30"
              title={app.name}
            >
              {app.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dock;
