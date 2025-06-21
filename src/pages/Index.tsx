
import React, { useState } from 'react';
import { StatusBar } from '@/components/StatusBar';
import HomeScreen from '@/components/HomeScreen';
import Dock from '@/components/Dock';
import AppModal from '@/components/AppModal';
import { SwipeNavigation } from '@/components/iPadOS/SwipeNavigation';
import { ControlCenter } from '@/components/iPadOS/ControlCenter';
import { WallpaperEngine } from '@/components/iPadOS/WallpaperEngine';
import { iPadFrame } from '@/components/iPadOS/iPadFrame';
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

  // Create multiple home screen pages with different app layouts
  const homeScreenPages = [
    <HomeScreen key="page1" onOpenApp={handleOpenApp} />,
    <div key="page2" className="ipados-home-screen">
      <div className="col-span-full text-center text-white">
        <h2 className="text-title mb-4">Widgets & Shortcuts</h2>
        <p className="text-body opacity-70">Additional home screen content</p>
      </div>
    </div>,
    <div key="page3" className="ipados-home-screen">
      <div className="col-span-full text-center text-white">
        <h2 className="text-title mb-4">App Library</h2>
        <p className="text-body opacity-70">Organized app categories</p>
      </div>
    </div>
  ];

  return (
    <iPadFrame>
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
    </iPadFrame>
  );
};

export default Index;
