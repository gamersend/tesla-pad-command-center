
import React, { useState, useEffect } from 'react';
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
  Smartphone,
  Moon,
  Sun,
  Zap,
  Home,
  Users,
  Key,
  Wifi
} from 'lucide-react';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
}

const SettingsApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState('appearance');
  const [settings, setSettings] = useState({
    theme: 'auto',
    layout: 'standard',
    apiProvider: null,
    notifications: true,
    autoLock: true,
    preconditioning: false,
    chargingAutomation: true,
    fontSize: 16,
    iconSize: 76
  });

  const settingsSections: SettingsSection[] = [
    // Appearance & Interface
    { id: 'appearance', name: 'Appearance', icon: <Palette size={20} />, category: 'Interface' },
    { id: 'layout', name: 'Layout', icon: <Layout size={20} />, category: 'Interface' },
    { id: 'display', name: 'Display', icon: <Monitor size={20} />, category: 'Interface' },
    
    // Tesla Integration
    { id: 'tesla-api', name: 'Tesla API', icon: <Car size={20} />, category: 'Tesla' },
    { id: 'automation', name: 'Automation', icon: <Zap size={20} />, category: 'Tesla' },
    { id: 'vehicle', name: 'Vehicle Settings', icon: <Key size={20} />, category: 'Tesla' },
    
    // System & Privacy
    { id: 'notifications', name: 'Notifications', icon: <Bell size={20} />, category: 'System' },
    { id: 'privacy', name: 'Privacy & Security', icon: <Shield size={20} />, category: 'System' },
    { id: 'data', name: 'Data Management', icon: <Database size={20} />, category: 'System' },
    
    // Integration
    { id: 'home', name: 'Home Integration', icon: <Home size={20} />, category: 'Integration' },
    { id: 'connectivity', name: 'Connectivity', icon: <Wifi size={20} />, category: 'Integration' }
  ];

  const themes = [
    { id: 'auto', name: 'Automatic', description: 'Follows system preference', preview: 'linear-gradient(135deg, #f3f4f6, #1f2937)' },
    { id: 'light', name: 'Light Mode', description: 'Clean, bright interface', preview: 'linear-gradient(135deg, #ffffff, #f9fafb)' },
    { id: 'dark', name: 'Dark Mode', description: 'Easy on the eyes for night driving', preview: 'linear-gradient(135deg, #111827, #374151)' },
    { id: 'tesla', name: 'Tesla Theme', description: 'Official Tesla colors and styling', preview: 'linear-gradient(135deg, #000000, #e31937)' },
    { id: 'oled', name: 'OLED Black', description: 'Pure black for OLED displays', preview: 'linear-gradient(135deg, #000000, #111111)' }
  ];

  const layouts = [
    { id: 'standard', name: 'Standard Grid', description: '6x4 grid layout for most apps', iconSize: 76 },
    { id: 'compact', name: 'Compact', description: 'Smaller icons, more apps visible', iconSize: 60 },
    { id: 'large', name: 'Large Icons', description: 'Bigger icons for easy touch access', iconSize: 92 },
    { id: 'list', name: 'List View', description: 'Vertical list with app details', iconSize: 44 }
  ];

  const groupedSections = settingsSections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SettingsSection[]>);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`dashboard_${key}`, JSON.stringify(value));
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Theme Selection</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => updateSetting('theme', theme.id)}
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
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Font & Display</h3>
        
        <div className="space-y-4">
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
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-500">20px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayoutSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Layout</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              onClick={() => updateSetting('layout', layout.id)}
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
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Export & Import</h3>
        
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Download size={16} />
            Export Layout
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload size={16} />
            Import Layout
          </button>
        </div>
      </div>
    </div>
  );

  const renderTeslaAPISettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">API Provider</h3>
        
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
          settings.apiProvider ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            settings.apiProvider ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className="font-medium">
            {settings.apiProvider ? 'Connected to Tesla API' : 'Not connected to Tesla API'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Tessie</h4>
                <p className="text-sm text-gray-600 mt-1">Recommended - Most reliable Tesla API access</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Real-time data</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Commands</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Historical data</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Configure
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Tesla Fleet API</h4>
                <p className="text-sm text-gray-600 mt-1">Official Tesla API for fleet owners</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Official API</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Fleet management</span>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Vehicles</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
                🚗
              </div>
              <div>
                <div className="font-semibold text-gray-900">Model 3 Performance</div>
                <div className="text-sm text-gray-500">Pearl White Multi-Coat</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAutomationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Smart Automation</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Pre-conditioning</label>
              <p className="text-sm text-gray-600">Automatically prepare climate before departure</p>
            </div>
            <button
              onClick={() => updateSetting('preconditioning', !settings.preconditioning)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.preconditioning ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.preconditioning ? 'translate-x-7' : 'translate-x-1'
              }`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Charging Automation</label>
              <p className="text-sm text-gray-600">Optimize charging based on electricity rates</p>
            </div>
            <button
              onClick={() => updateSetting('chargingAutomation', !settings.chargingAutomation)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.chargingAutomation ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.chargingAutomation ? 'translate-x-7' : 'translate-x-1'
              }`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Auto Lock</label>
              <p className="text-sm text-gray-600">Automatically lock vehicle when walking away</p>
            </div>
            <button
              onClick={() => updateSetting('autoLock', !settings.autoLock)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoLock ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.autoLock ? 'translate-x-7' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearanceSettings();
      case 'layout':
        return renderLayoutSettings();
      case 'tesla-api':
        return renderTeslaAPISettings();
      case 'automation':
        return renderAutomationSettings();
      default:
        return (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">This settings section is under development</p>
          </div>
        );
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
          <p className="text-gray-600 mt-1">Configure your dashboard</p>
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
