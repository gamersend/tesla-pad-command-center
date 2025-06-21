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
  AlertCircle,
  Image as ImageIcon
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

// Enhanced Appearance Settings with Background Options
const AppearanceSettings: React.FC<any> = ({ settings, saveSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const themes = [
    { id: 'auto', name: 'Automatic', description: 'Follows system preference', preview: 'linear-gradient(135deg, #f3f4f6, #1f2937)' },
    { id: 'light', name: 'Light Mode', description: 'Clean, bright interface', preview: 'linear-gradient(135deg, #ffffff, #f9fafb)' },
    { id: 'dark', name: 'Dark Mode', description: 'Easy on the eyes for night driving', preview: 'linear-gradient(135deg, #111827, #374151)' },
    { id: 'tesla', name: 'Tesla Theme', description: 'Official Tesla colors and styling', preview: 'linear-gradient(135deg, #000000, #e31937)' },
    { id: 'oled', name: 'OLED Black', description: 'Pure black for OLED displays', preview: 'linear-gradient(135deg, #000000, #111111)' }
  ];

  const defaultBackgrounds = [
    {
      id: 'abstract-waves',
      name: 'Abstract Waves',
      url: '/lovable-uploads/6cef881e-f3cc-4c4f-83bc-ba6968202ef2.png',
      description: 'Flowing abstract waves in blue and red'
    },
    {
      id: 'paint-splash',
      name: 'Paint Splash',
      url: '/lovable-uploads/ed4ca188-9e67-4812-b3f3-f3afa2f96da9.png',
      description: 'Dynamic paint explosion in vibrant colors'
    },
    {
      id: 'blue-rings',
      name: 'Blue Rings',
      url: '/lovable-uploads/278b6997-9d39-473d-9953-63e45bab8d96.png',
      description: 'Interlocking blue circular patterns'
    },
    {
      id: 'gradient-rings',
      name: 'Gradient Rings',
      url: '/lovable-uploads/eb3197ae-30f4-49a6-8788-de3a11e11dac.png',
      description: 'Colorful gradient rings on dark background'
    },
    {
      id: 'smooth-curves',
      name: 'Smooth Curves',
      url: '/lovable-uploads/a148493c-11f8-460c-9988-63064b8dbe3b.png',
      description: 'Smooth flowing curves in blue and orange'
    },
    {
      id: 'ocean-gradient',
      name: 'Ocean Gradient',
      url: '/lovable-uploads/663bb1f7-6b1e-4e68-8401-c06f6bb8ff2d.png',
      description: 'Ocean-inspired blue and green gradients'
    },
    {
      id: 'aurora-flow',
      name: 'Aurora Flow',
      url: '/lovable-uploads/f59314fa-336a-4a97-8ee6-12daded4372a.png',
      description: 'Aurora-like flowing patterns in multiple colors'
    }
  ];

  const handleCustomBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        saveSettings({ 
          backgroundType: 'custom',
          customBackground: result 
        });
        toast({
          title: "Background Updated",
          description: "Your custom background has been set.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Background Settings</h3>
        
        {/* Background Type Selection */}
        <div className="mb-6">
          <label className="block font-medium text-gray-900 mb-3">Background Type</label>
          <div className="flex gap-4">
            <button
              onClick={() => saveSettings({ backgroundType: 'gradient' })}
              className={`px-4 py-2 rounded-lg border ${
                settings.backgroundType === 'gradient'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Gradient
            </button>
            <button
              onClick={() => saveSettings({ backgroundType: 'image' })}
              className={`px-4 py-2 rounded-lg border ${
                settings.backgroundType === 'image'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Image
            </button>
            <button
              onClick={() => saveSettings({ backgroundType: 'custom' })}
              className={`px-4 py-2 rounded-lg border ${
                settings.backgroundType === 'custom'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Custom Upload
            </button>
          </div>
        </div>

        {/* Default Background Images */}
        {settings.backgroundType === 'image' && (
          <div>
            <label className="block font-medium text-gray-900 mb-3">Choose Background Image</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {defaultBackgrounds.map((bg) => (
                <div
                  key={bg.id}
                  onClick={() => saveSettings({ selectedBackground: bg.id })}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    settings.selectedBackground === bg.id
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <img
                    src={bg.url}
                    alt={bg.name}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                    {bg.name}
                  </div>
                  {settings.selectedBackground === bg.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle size={20} className="text-blue-500 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Upload */}
        {settings.backgroundType === 'custom' && (
          <div>
            <label className="block font-medium text-gray-900 mb-3">Upload Custom Background</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Click to upload a custom background image
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload size={16} className="mr-2" />
                Choose Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomBackgroundUpload}
                className="hidden"
              />
            </div>
            {settings.customBackground && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Current custom background:</p>
                <img
                  src={settings.customBackground}
                  alt="Custom background"
                  className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        )}
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
                value={settings.fontSize || 16}
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

// Settings Components
const LayoutSettings: React.FC<any> = ({ settings, saveSettings }) => <div>Layout Settings</div>;
const DisplaySettings: React.FC<any> = ({ settings, saveSettings }) => <div>Display Settings</div>;
const TeslaAPISettings: React.FC<any> = ({ settings, saveSettings }) => <div>Tesla API Settings</div>;
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
