
import React from 'react';

interface DockProps {
  onOpenApp: (appId: string) => void;
}

const Dock: React.FC<DockProps> = ({ onOpenApp }) => {
  const dockApps = [
    { id: 'tesla-control', icon: '🚗', name: 'Tesla Control', gradient: 'from-red-500 to-red-600' },
    { id: 'safari', icon: '🌐', name: 'Safari', gradient: 'from-blue-500 to-blue-600' },
    { id: 'maps', icon: '🗺️', name: 'Maps', gradient: 'from-green-500 to-teal-600' },
    { id: 'music', icon: '🎵', name: 'Music', gradient: 'from-purple-400 to-purple-600' },
    { id: 'search', icon: '🔍', name: 'Search', gradient: 'from-purple-500 to-indigo-600' },
    { id: 'notes', icon: '📝', name: 'Notes', gradient: 'from-yellow-400 to-orange-500' },
  ];

  return (
    <div className="ipados-dock">
      {dockApps.map((app, index) => (
        <button
          key={app.id}
          onClick={() => onOpenApp(app.id)}
          className={`dock-icon bg-gradient-to-br ${app.gradient} hover:scale-110 transition-transform duration-200`}
          title={app.name}
        >
          {app.icon}
        </button>
      ))}
    </div>
  );
};

export default Dock;
