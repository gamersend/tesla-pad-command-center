
import React, { useState } from 'react';
import { Globe, Search, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

const SafariApp: React.FC = () => {
  const [url, setUrl] = useState('https://www.tesla.com');
  const [isLoading, setIsLoading] = useState(false);

  const quickLinks = [
    { name: '🚗 Tesla', url: 'https://www.tesla.com', color: 'from-red-500 to-red-700' },
    { name: '⚡ Supercharger', url: 'https://www.tesla.com/supercharger', color: 'from-yellow-500 to-orange-600' },
    { name: '📰 Tesla News', url: 'https://www.teslarati.com', color: 'from-blue-500 to-blue-700' },
    { name: '🎵 Spotify', url: 'https://open.spotify.com', color: 'from-green-500 to-green-700' },
    { name: '🗺️ Google Maps', url: 'https://maps.google.com', color: 'from-blue-400 to-green-500' },
    { name: '📺 YouTube', url: 'https://www.youtube.com', color: 'from-red-600 to-red-800' }
  ];

  const handleUrlSubmit = (newUrl: string) => {
    setUrl(newUrl);
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      {/* Browser Header */}
      <div className="bg-black/40 border-b border-white/10 p-4">
        <div className="flex items-center space-x-4">
          {/* Navigation Buttons */}
          <div className="flex space-x-2">
            <button className="w-10 h-10 bg-gray-600/50 hover:bg-gray-600/70 rounded-xl flex items-center justify-center transition-colors">
              <ArrowLeft size={18} />
            </button>
            <button className="w-10 h-10 bg-gray-600/50 hover:bg-gray-600/70 rounded-xl flex items-center justify-center transition-colors">
              <ArrowRight size={18} />
            </button>
            <button className="w-10 h-10 bg-gray-600/50 hover:bg-gray-600/70 rounded-xl flex items-center justify-center transition-colors">
              <RotateCcw size={18} />
            </button>
          </div>

          {/* URL Bar */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-gray-800/60 rounded-xl px-4 py-3 border border-white/20">
              <Globe size={16} className="text-gray-400 mr-3" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit(url)}
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                placeholder="Enter URL or search..."
              />
              <Search size={16} className="text-gray-400 ml-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-xl">Loading...</div>
            </div>
          </div>
        ) : (
          <div>
            {/* Quick Links */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-2">🔗</span>
                Quick Access
                <span className="ml-2">⚡</span>
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleUrlSubmit(link.url)}
                    className={`p-6 bg-gradient-to-br ${link.color} rounded-2xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 transform`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {link.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tesla-Specific Features */}
            <div className="bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🚗</span>
                Tesla Browser Features
                <span className="ml-2">🌐</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-cyan-400">🎵 Media Integration</h4>
                  <p className="text-sm text-gray-300">
                    Stream music and videos directly to your Tesla's entertainment system
                  </p>
                </div>
                <div className="bg-black/30 rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-green-400">⚡ Supercharger Finder</h4>
                  <p className="text-sm text-gray-300">
                    Integrated supercharger location finder with real-time availability
                  </p>
                </div>
                <div className="bg-black/30 rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-purple-400">🗺️ Route Planning</h4>
                  <p className="text-sm text-gray-300">
                    Plan routes with charging stops automatically calculated
                  </p>
                </div>
                <div className="bg-black/30 rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-yellow-400">🎮 Entertainment</h4>
                  <p className="text-sm text-gray-300">
                    Access games and entertainment while charging or parked
                  </p>
                </div>
              </div>
            </div>

            {/* Current Page Simulation */}
            <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">🌐 Browser Content</h3>
                <div className="text-gray-300 mb-4">Currently viewing: {url}</div>
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-8 border border-blue-400/50">
                  <div className="text-6xl mb-4">🚗</div>
                  <h4 className="text-2xl font-bold mb-2">Tesla Dashboard Browser</h4>
                  <p className="text-gray-300">
                    Your web browsing experience optimized for Tesla's touchscreen interface
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafariApp;
