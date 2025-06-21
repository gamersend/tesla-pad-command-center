
import { useState, useEffect, useCallback } from 'react';

interface DashboardSettings {
  // Appearance & Theme
  theme: 'auto' | 'light' | 'dark' | 'tesla' | 'oled';
  fontSize: number;
  iconSize: number;
  
  // Layout
  layout: 'standard' | 'compact' | 'large' | 'list';
  dockPosition: 'bottom' | 'top' | 'left' | 'right';
  appsPerRow: number;
  showAppLabels: boolean;
  
  // Tesla Integration
  teslaApiProvider: 'tessie' | 'fleet' | null;
  teslaApiKey: string;
  vehicleId: string;
  autoRefreshInterval: number;
  
  // AI Assistant
  aiProvider: 'ollama' | 'openai' | 'both';
  ollamaEndpoint: string;
  openaiApiKey: string;
  aiVoiceEnabled: boolean;
  aiResponseLength: 'short' | 'medium' | 'long';
  
  // Notifications
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  chargingAlerts: boolean;
  climateAlerts: boolean;
  securityAlerts: boolean;
  
  // Privacy & Security
  dataRetentionDays: number;
  encryptConversations: boolean;
  analyticsEnabled: boolean;
  locationSharing: boolean;
  
  // Performance
  lowPowerMode: boolean;
  thermalProtection: boolean;
  backgroundRefresh: boolean;
  cacheSize: number;
  
  // Automation
  preconditioning: boolean;
  chargingAutomation: boolean;
  autoLock: boolean;
  smartCharging: boolean;
  
  // Crypto Tracker
  cryptoRefreshInterval: number;
  cryptoPriceAlerts: boolean;
  portfolioSync: boolean;
  
  // Weather
  weatherProvider: 'openweather' | 'weatherapi' | 'builtin';
  temperatureUnit: 'celsius' | 'fahrenheit';
  
  // Calendar
  calendarProvider: 'google' | 'outlook' | 'apple' | 'builtin';
  defaultCalendarView: 'day' | 'week' | 'month';
  
  // Maps
  mapProvider: 'google' | 'apple' | 'tesla';
  trafficEnabled: boolean;
  superchargerLayer: boolean;
  
  // Music
  musicProvider: 'spotify' | 'apple' | 'tesla' | 'builtin';
  audioQuality: 'low' | 'medium' | 'high';
  
  // News
  newsCategories: string[];
  newsRefreshInterval: number;
  
  // Developer
  debugMode: boolean;
  consoleLogging: boolean;
  performanceMonitoring: boolean;
}

const defaultSettings: DashboardSettings = {
  // Appearance & Theme
  theme: 'auto',
  fontSize: 16,
  iconSize: 76,
  
  // Layout
  layout: 'standard',
  dockPosition: 'bottom',
  appsPerRow: 6,
  showAppLabels: true,
  
  // Tesla Integration
  teslaApiProvider: null,
  teslaApiKey: '',
  vehicleId: '',
  autoRefreshInterval: 30000,
  
  // AI Assistant
  aiProvider: 'both',
  ollamaEndpoint: 'http://localhost:11434',
  openaiApiKey: '',
  aiVoiceEnabled: true,
  aiResponseLength: 'medium',
  
  // Notifications
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  chargingAlerts: true,
  climateAlerts: true,
  securityAlerts: true,
  
  // Privacy & Security
  dataRetentionDays: 7,
  encryptConversations: true,
  analyticsEnabled: false,
  locationSharing: false,
  
  // Performance
  lowPowerMode: false,
  thermalProtection: true,
  backgroundRefresh: true,
  cacheSize: 50,
  
  // Automation
  preconditioning: false,
  chargingAutomation: true,
  autoLock: true,
  smartCharging: true,
  
  // Crypto Tracker
  cryptoRefreshInterval: 30000,
  cryptoPriceAlerts: true,
  portfolioSync: false,
  
  // Weather
  weatherProvider: 'openweather',
  temperatureUnit: 'fahrenheit',
  
  // Calendar
  calendarProvider: 'google',
  defaultCalendarView: 'week',
  
  // Maps
  mapProvider: 'google',
  trafficEnabled: true,
  superchargerLayer: true,
  
  // Music
  musicProvider: 'spotify',
  audioQuality: 'high',
  
  // News
  newsCategories: ['technology', 'automotive', 'business'],
  newsRefreshInterval: 300000,
  
  // Developer
  debugMode: false,
  consoleLogging: false,
  performanceMonitoring: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('tesla_dashboard_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<DashboardSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem('tesla_dashboard_settings', JSON.stringify(updatedSettings));
      
      // Apply theme changes immediately
      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }
      
      // Apply font size changes
      if (newSettings.fontSize) {
        document.documentElement.style.fontSize = `${newSettings.fontSize}px`;
      }
      
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('tesla_dashboard_settings');
    applyTheme(defaultSettings.theme);
  }, []);

  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tesla_dashboard_settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }, [settings]);

  const importSettings = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          saveSettings(importedSettings);
          resolve();
        } catch (error) {
          reject(new Error('Invalid settings file'));
        }
      };
      reader.readAsText(file);
    });
  }, [saveSettings]);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-tesla', 'theme-oled');
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      root.classList.add(`theme-${theme}`);
    }
  };

  // Apply theme on load
  useEffect(() => {
    if (!isLoading) {
      applyTheme(settings.theme);
      document.documentElement.style.fontSize = `${settings.fontSize}px`;
    }
  }, [settings.theme, settings.fontSize, isLoading]);

  return {
    settings,
    isLoading,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };
};
