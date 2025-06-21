import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Palette, 
  Layout, 
  Car, 
  Shield, 
  Bell, 
  Database, 
  Download, 
  Upload,
  Monitor,
  Moon,
  Sun,
  Zap,
  Home,
  Key,
  Wifi,
  Brain,
  DollarSign,
  Cloud,
  Smartphone,
  Volume2,
  Eye,
  Lock,
  Gauge,
  Calendar,
  MapPin,
  Music,
  Newspaper,
  Code,
  RefreshCw,
  Thermometer,
  Bitcoin,
  RotateCcw,
  Save,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  component: React.ComponentType<any>;
}

const SettingsApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState('appearance');
  const { settings, saveSettings, resetSettings, exportSettings, importSettings } = useSettingsContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settingsSections: SettingsSection[] = [
    // Appearance & Interface
    { id: 'appearance', name: 'Appearance', icon: <Palette size={20} />, category: 'Interface', component: AppearanceSettings },
    { id: 'layout', name: 'Layout', icon: <Layout size={20} />, category: 'Interface', component: LayoutSettings },
    { id: 'display', name: 'Display', icon: <Monitor size={20} />, category: 'Interface', component: DisplaySettings },
    
    // Tesla Integration
    { id: 'tesla-api', name: 'Tesla API', icon: <Car size={20} />, category: 'Tesla', component: TeslaAPISettings },
    { id: 'automation', name: 'Automation', icon: <Zap size={20} />, category: 'Tesla', component: AutomationSettings },
    { id: 'vehicle', name: 'Vehicle Settings', icon: <Key size={20} />, category: 'Tesla', component: VehicleSettings },
    
    // AI & Intelligence
    { id: 'ai-assistant', name: 'AI Assistant', icon: <Brain size={20} />, category: 'AI', component: AISettings },
    { id: 'voice', name: 'Voice & Speech', icon: <Volume2 size={20} />, category: 'AI', component: VoiceSettings },
    
    // Apps Configuration
    { id: 'crypto', name: 'Crypto Tracker', icon: <Bitcoin size={20} />, category: 'Apps', component: CryptoSettings },
    { id: 'weather', name: 'Weather', icon: <Cloud size={20} />, category: 'Apps', component: WeatherSettings },
    { id: 'calendar-settings', name: 'Calendar', icon: <Calendar size={20} />, category: 'Apps', component: CalendarSettings },
    { id: 'maps', name: 'Maps', icon: <MapPin size={20} />, category: 'Apps', component: MapsSettings },
    { id: 'music-settings', name: 'Music', icon: <Music size={20} />, category: 'Apps', component: MusicSettings },
    { id: 'news', name: 'News', icon: <Newspaper size={20} />, category: 'Apps', component: NewsSettings },
    
    // System & Privacy
    { id: 'notifications', name: 'Notifications', icon: <Bell size={20} />, category: 'System', component: NotificationSettings },
    { id: 'privacy', name: 'Privacy & Security', icon: <Shield size={20} />, category: 'System', component: PrivacySettings },
    { id: 'performance', name: 'Performance', icon: <Gauge size={20} />, category: 'System', component: PerformanceSettings },
    { id: 'data', name: 'Data Management', icon: <Database size={20} />, category: 'System', component: DataSettings },
    
    // Developer
    { id: 'developer', name: 'Developer', icon: <Code size={20} />, category: 'Developer', component: DeveloperSettings },
  ];

  const groupedSections = settingsSections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SettingsSection[]>);

  const activeComponent = settingsSections.find(s => s.id === activeSection)?.component || AppearanceSettings;
  const ActiveComponent = activeComponent;

  const handleImportSettings = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importSettings(file);
        toast({
          title: "Settings Imported",
          description: "Your settings have been successfully imported.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import settings. Please check the file format.",
          variant: "destructive",
        });
      }
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      resetSettings();
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values.",
      });
    }
  };

  return (
    <div className="h-full bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings size={24} />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Configure your Tesla Dashboard</p>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <Button onClick={exportSettings} size="sm" variant="outline">
              <Download size={16} className="mr-1" />
              Export
            </Button>
            <Button onClick={handleImportSettings} size="sm" variant="outline">
              <Upload size={16} className="mr-1" />
              Import
            </Button>
            <Button onClick={handleResetSettings} size="sm" variant="outline">
              <RotateCcw size={16} className="mr-1" />
              Reset
            </Button>
          </div>
        </div>
        
        <nav className="p-4">
          {Object.entries(groupedSections).map(([category, sections]) => (
            <div key={category} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.icon}
                    <span className="font-medium">{section.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <ActiveComponent settings={settings} saveSettings={saveSettings} />
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

// Settings Components
const AppearanceSettings: React.FC<any> = ({ settings, saveSettings }) => {
  const themes = [
    { id: 'auto', name: 'Automatic', description: 'Follows system preference', preview: 'linear-gradient(135deg, #f3f4f6, #1f2937)' },
    { id: 'light', name: 'Light Mode', description: 'Clean, bright interface', preview: 'linear-gradient(135deg, #ffffff, #f9fafb)' },
    { id: 'dark', name: 'Dark Mode', description: 'Easy on the eyes for night driving', preview: 'linear-gradient(135deg, #111827, #374151)' },
    { id: 'tesla', name: 'Tesla Theme', description: 'Official Tesla colors and styling', preview: 'linear-gradient(135deg, #000000, #e31937)' },
    { id: 'oled', name: 'OLED Black', description: 'Pure black for OLED displays', preview: 'linear-gradient(135deg, #000000, #111111)' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Theme Selection</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => saveSettings({ theme: theme.id })}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:scale-105 ${
                settings.theme === theme.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div 
                className="w-full h-20 rounded-lg mb-3"
                style={{ background: theme.preview }}
              ></div>
              <h4 className="font-semibold text-gray-900">{theme.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Typography</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Font Size</label>
              <p className="text-sm text-gray-600">Adjust text size throughout the interface</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">14px</span>
              <input
                type="range"
                min="14"
                max="20"
                value={settings.fontSize}
                onChange={(e) => saveSettings({ fontSize: parseInt(e.target.value) })}
                className="w-24"
              />
              <span className="text-sm text-gray-500">20px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LayoutSettings: React.FC<any> = ({ settings, saveSettings }) => {
  const layouts = [
    { id: 'standard', name: 'Standard Grid', description: '6x4 grid layout for most apps', iconSize: 76 },
    { id: 'compact', name: 'Compact', description: 'Smaller icons, more apps visible', iconSize: 60 },
    { id: 'large', name: 'Large Icons', description: 'Bigger icons for easy touch access', iconSize: 92 },
    { id: 'list', name: 'List View', description: 'Vertical list with app details', iconSize: 44 }
  ];

  const dockPositions = [
    { id: 'bottom', name: 'Bottom', description: 'Traditional iPad-style dock' },
    { id: 'top', name: 'Top', description: 'macOS-style top dock' },
    { id: 'left', name: 'Left Side', description: 'Vertical dock on left' },
    { id: 'right', name: 'Right Side', description: 'Vertical dock on right' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">App Layout</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              onClick={() => saveSettings({ layout: layout.id, iconSize: layout.iconSize })}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                settings.layout === layout.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h4 className="font-semibold text-gray-900">{layout.name}</h4>
              <p className="text-sm text-gray-600 mt-1 mb-3">{layout.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <span>Icon size: {layout.iconSize}px</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between py-4 border-t">
          <div>
            <label className="font-medium text-gray-900">Show App Labels</label>
            <p className="text-sm text-gray-600">Display app names below icons</p>
          </div>
          <Switch
            checked={settings.showAppLabels}
            onCheckedChange={(checked) => saveSettings({ showAppLabels: checked })}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Dock Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dockPositions.map((position) => (
            <div
              key={position.id}
              onClick={() => saveSettings({ dockPosition: position.id })}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                settings.dockPosition === position.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h4 className="font-semibold text-gray-900">{position.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{position.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TeslaAPISettings: React.FC<any> = ({ settings, saveSettings }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">API Configuration</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">API Provider</label>
              <p className="text-sm text-gray-600">Choose your Tesla API provider</p>
            </div>
            <select
              value={settings.teslaApiProvider || ''}
              onChange={(e) => saveSettings({ teslaApiProvider: e.target.value || null })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Not configured</option>
              <option value="tessie">Tessie (Recommended)</option>
              <option value="fleet">Tesla Fleet API</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">API Key</label>
            <input
              type="password"
              value={settings.teslaApiKey}
              onChange={(e) => saveSettings({ teslaApiKey: e.target.value })}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">Vehicle ID</label>
            <input
              type="text"
              value={settings.vehicleId}
              onChange={(e) => saveSettings({ vehicleId: e.target.value })}
              placeholder="Enter your vehicle ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Auto Refresh Interval</label>
              <p className="text-sm text-gray-600">How often to update vehicle data (seconds)</p>
            </div>
            <select
              value={settings.autoRefreshInterval}
              onChange={(e) => saveSettings({ autoRefreshInterval: parseInt(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={15000}>15 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Additional component stubs - keeping existing structure
const DisplaySettings: React.FC<any> = ({ settings, saveSettings }) => <div>Display Settings</div>;
const AutomationSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Automation Settings</div>;
const VehicleSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Vehicle Settings</div>;
const AISettings: React.FC<any> = ({ settings, saveSettings }) => <div>AI Settings</div>;
const VoiceSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Voice Settings</div>;
const CryptoSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Crypto Settings</div>;
const WeatherSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Weather Settings</div>;
const CalendarSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Calendar Settings</div>;
const MapsSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Maps Settings</div>;
const MusicSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Music Settings</div>;
const NewsSettings: React.FC<any> = ({ settings, saveSettings }) => <div>News Settings</div>;
const NotificationSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Notification Settings</div>;
const PrivacySettings: React.FC<any> = ({ settings, saveSettings }) => <div>Privacy Settings</div>;
const PerformanceSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Performance Settings</div>;
const DataSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Data Settings</div>;
const DeveloperSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Developer Settings</div>;

export default SettingsApp;
