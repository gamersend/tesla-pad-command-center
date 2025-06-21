import React, { useState } from 'react';
import { StatusBar } from '@/components/StatusBar';
import HomeScreen from '@/components/HomeScreen';
import Dock from '@/components/Dock';
import AppModal from '@/components/AppModal';
import { SwipeNavigation } from '@/components/iPadOS/SwipeNavigation';
import { ControlCenter } from '@/components/iPadOS/ControlCenter';
import { WallpaperEngine } from '@/components/iPadOS/WallpaperEngine';
import { IPadFrame } from '@/components/iPadOS/iPadFrame';
import { useWallpaper } from '@/hooks/useWallpaper';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

const Index = () => {
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const { wallpaper } = useWallpaper();
  const { currentPage, navigateToPage } = useSwipeNavigation(3);

  const handleOpenApp = (appId: string) => {
    setOpenApp(appId);
  };

  const handleCloseApp = () => {
    setOpenApp(null);
  };

  const handleStatusBarSwipe = (e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    if (startY < 50) { // Top of screen
      setShowControlCenter(true);
    }
  };

  // All available apps
  const allApps = [
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
    { id: 'lists', name: 'Lists & Reminders', icon: '✅', gradient: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)', category: 'productivity' },
    { id: 'weather', name: 'Weather', icon: '🌤️', gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', category: 'productivity' },
    { id: 'maps', name: 'Maps', icon: '🗺️', gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', category: 'productivity' },
    { id: 'timer', name: 'Timer', icon: '⏰', gradient: 'linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)', category: 'productivity' },
    { id: 'music', name: 'Music', icon: '🎵', gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)', category: 'productivity' },

    // Utility Apps
    { id: 'search', name: 'Search Hub', icon: '🔍', gradient: 'linear-gradient(135deg, #AF52DE 0%, #5856D6 100%)', category: 'utility' },
    { id: 'color-picker', name: 'Color Picker', icon: '🎨', gradient: 'linear-gradient(135deg, #FF2D92 0%, #AF52DE 100%)', category: 'utility' },
    { id: 'dice', name: 'Dice Roller', icon: '🎲', gradient: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)', category: 'utility' },
    { id: 'quotes', name: 'Quote Generator', icon: '💭', gradient: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)', category: 'utility' },
    { id: 'json-tools', name: 'JSON Tools', icon: '🔧', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'utility' },
    { id: 'stats-panel', name: 'Stats Panel', icon: '📈', gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)', category: 'utility' },
  ];

  // Split apps into pages (20 apps per page for 6x5 grid with some space)
  const appsPerPage = 20;
  const appPages = [];
  for (let i = 0; i < allApps.length; i += appsPerPage) {
    appPages.push(allApps.slice(i, i + appsPerPage));
  }

  // Create home screen pages
  const homeScreenPages = appPages.map((pageApps, index) => (
    <div key={`page-${index}`} className="ipados-home-screen">
      {pageApps.map((app) => (
        <div key={app.id} className="app-icon-container touch-feedback">
          <div 
            className="app-icon hw-accelerated"
            style={{ background: app.gradient }}
            onClick={() => handleOpenApp(app.id)}
          >
            <span className="text-xl">{app.icon}</span>
          </div>
          <span className="app-label">{app.name}</span>
        </div>
      ))}
    </div>
  ));

  // Add placeholder pages if we need them
  while (homeScreenPages.length < 3) {
    homeScreenPages.push(
      <div key={`placeholder-${homeScreenPages.length}`} className="ipados-home-screen">
        <div className="col-span-full text-center text-white flex items-center justify-center h-full">
          <div>
            <h2 className="text-title mb-4">App Library</h2>
            <p className="text-body opacity-70">Additional apps and widgets</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <IPadFrame>
      <div className="relative w-full h-full hw-accelerated touch-optimized">
        {/* Dynamic Wallpaper */}
        <WallpaperEngine type={wallpaper.type} config={wallpaper} />

        {/* Status Bar */}
        <div onTouchStart={handleStatusBarSwipe}>
          <StatusBar />
        </div>

        {/* Main Content with Swipe Navigation */}
        <div className="flex-1 relative z-10">
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
