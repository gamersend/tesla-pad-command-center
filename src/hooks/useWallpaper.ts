
import { useState, useEffect } from 'react';

export interface WallpaperConfig {
  type: 'particles' | 'gradient' | 'static';
  particleCount?: number;
  gradient?: string;
  imageUrl?: string;
}

const defaultWallpapers: WallpaperConfig[] = [
  {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)'
  },
  {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #E31937 0%, #FF6B6B 100%)'
  },
  {
    type: 'particles',
    particleCount: 20
  }
];

export const useWallpaper = () => {
  const [wallpaper, setWallpaper] = useState<WallpaperConfig>(defaultWallpapers[0]);

  useEffect(() => {
    const saved = localStorage.getItem('tesla_wallpaper');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setWallpaper(config);
      } catch (error) {
        console.error('Failed to load wallpaper config:', error);
      }
    }
  }, []);

  const updateWallpaper = (config: WallpaperConfig) => {
    setWallpaper(config);
    localStorage.setItem('tesla_wallpaper', JSON.stringify(config));
  };

  const getAvailableWallpapers = () => defaultWallpapers;

  return {
    wallpaper,
    updateWallpaper,
    getAvailableWallpapers
  };
};
