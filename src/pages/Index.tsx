import React, { useState } from 'react';
import { StatusBar } from '@/components/StatusBar';
import Dock from '@/components/Dock';
import AppModal from '@/components/AppModal';
import { SwipeNavigation } from '@/components/iPadOS/SwipeNavigation';
import { ControlCenter } from '@/components/iPadOS/ControlCenter';
import { WallpaperEngine } from '@/components/iPadOS/WallpaperEngine';
import { IPadFrame } from '@/components/iPadOS/iPadFrame';
import { useWallpaper } from '@/hooks/useWallpaper';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useSettingsContext } from '@/contexts/SettingsContext';

const Index = () => {
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const { wallpaper } = useWallpaper();
  const { settings } = useSettingsContext();
  const { currentPage, navigateToPage } = useSwipeNavigation(3);

  const handleOpenApp = (appId: string) => {
    setOpenApp(appId);
  };

  const handleCloseApp = () => {
    setOpenApp(null);
  };

  const handleStatusBarSwipe = (e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    if (startY < 50) {
      setShowControlCenter(true);
    }
  };

  // All available apps
  const allApps = [
    // Tesla Control Center
    { id: 'tesla-control', name: 'Tesla Control', icon: '🚗', gradient: 'from-red-500 to-red-600', category: 'tesla' },
    { id: 'tesla-status', name: 'Tesla Status', icon: '📊', gradient: 'from-red-500 to-red-600', category: 'tesla' },
    { id: 'charging', name: 'Charging', icon: '⚡', gradient: 'from-green-400 to-green-600', category: 'tesla' },
    { id: 'climate', name: 'Climate', icon: '🌡️', gradient: 'from-blue-400 to-blue-600', category: 'tesla' },
    
    // Productivity Suite
    { id: 'safari', name: 'Safari', icon: '🌐', gradient: 'from-blue-500 to-blue-600', category: 'productivity' },
    { id: 'calendar', name: 'Calendar', icon: '📅', gradient: 'from-pink-400 to-pink-600', category: 'productivity' },
    { id: 'mail', name: 'Mail', icon: '✉️', gradient: 'from-blue-500 to-blue-600', category: 'productivity' },
    { id: 'notes', name: 'Notes', icon: '📝', gradient: 'from-yellow-400 to-orange-500', category: 'productivity' },
    { id: 'lists', name: 'Lists & Reminders', icon: '✅', gradient: 'from-green-400 to-green-600', category: 'productivity' },
    { id: 'weather', name: 'Weather', icon: '🌤️', gradient: 'from-blue-400 to-blue-600', category: 'productivity' },
    { id: 'maps', name: 'Maps', icon: '🗺️', gradient: 'from-green-500 to-teal-600', category: 'productivity' },
    { id: 'timer', name: 'Timer', icon: '⏰', gradient: 'from-orange-400 to-red-500', category: 'productivity' },
    { id: 'music', name: 'Music', icon: '🎵', gradient: 'from-purple-400 to-purple-600', category: 'productivity' },

    // Utility Apps
    { id: 'search', name: 'Search Hub', icon: '🔍', gradient: 'from-purple-500 to-indigo-600', category: 'utility' },
    { id: 'color-picker', name: 'Color Picker', icon: '🎨', gradient: 'from-pink-500 to-purple-600', category: 'utility' },
    { id: 'dice', name: 'Dice Roller', icon: '🎲', gradient: 'from-indigo-500 to-purple-600', category: 'utility' },
    { id: 'quotes', name: 'Quote Generator', icon: '💭', gradient: 'from-orange-400 to-yellow-500', category: 'utility' },
    { id: 'json-tools', name: 'JSON Tools', icon: '🔧', gradient: 'from-gray-500 to-gray-700', category: 'utility' },
    { id: 'stats-panel', name: 'Stats Panel', icon: '📈', gradient: 'from-purple-400 to-purple-600', category: 'utility' },
  ];

  // Split apps into pages (15 apps per page for better spacing)
  const appsPerPage = 15;
  const appPages = [];
  for (let i = 0; i < allApps.length; i += appsPerPage) {
    appPages.push(allApps.slice(i, i + appsPerPage));
  }

  // Create home screen pages
  const homeScreenPages = appPages.map((pageApps, index) => (
    <div key={`page-${index}`} className="home-screen-page">
      <div className="apps-grid">
        {pageApps.map((app) => (
          <div key={app.id} className="app-container" onClick={() => handleOpenApp(app.id)}>
            <div className={`app-icon bg-gradient-to-br ${app.gradient}`}>
              <span className="app-emoji">{app.icon}</span>
            </div>
            <span className="app-label">{app.name}</span>
          </div>
        ))}
      </div>
    </div>
  ));

  // Add placeholder pages if needed
  while (homeScreenPages.length < 3) {
    homeScreenPages.push(
      <div key={`placeholder-${homeScreenPages.length}`} className="home-screen-page">
        <div className="placeholder-content">
          <h2 className="placeholder-title">App Library</h2>
          <p className="placeholder-subtitle">Additional apps and widgets</p>
        </div>
      </div>
    );
  }

  return (
    <IPadFrame>
      <div className="ipad-interface">
        {/* Dynamic Wallpaper */}
        <WallpaperEngine type={wallpaper.type} config={wallpaper} />

        {/* Status Bar */}
        <div onTouchStart={handleStatusBarSwipe}>
          <StatusBar />
        </div>

        {/* Main Content with Swipe Navigation */}
        <div className="main-content">
          <SwipeNavigation 
            currentPage={currentPage} 
            onPageChange={navigateToPage}
          >
            {homeScreenPages}
          </SwipeNavigation>
        </div>

        {/* Dock */}
        <Dock onOpenApp={handleOpenApp} />

        {/* Control Center */}
        <ControlCenter 
          isOpen={showControlCenter} 
          onClose={() => setShowControlCenter(false)} 
        />

        {/* App Modal */}
        {openApp && (
          <AppModal appId={openApp} onClose={handleCloseApp} />
        )}
      </div>
    </IPadFrame>
  );
};

export default Index;
