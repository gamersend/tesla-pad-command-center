
import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Zap, Clock, Star, ExternalLink } from 'lucide-react';

const SearchHubApp: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('google');
  const [searchHistory, setSearchHistory] = useState<Array<{query: string, engine: string, timestamp: number}>>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const searchEngines = {
    google: {
      name: 'Google',
      url: 'https://www.google.com/search',
      color: 'from-blue-500 to-blue-700',
      icon: '🔍'
    },
    duckduckgo: {
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/',
      color: 'from-orange-500 to-red-600',
      icon: '🦆'
    },
    brave: {
      name: 'Brave Search',
      url: 'https://search.brave.com/search',
      color: 'from-orange-600 to-yellow-600',
      icon: '🦁'
    },
    bing: {
      name: 'Bing',
      url: 'https://www.bing.com/search',
      color: 'from-blue-600 to-indigo-700',
      icon: '🔎'
    }
  };

  const teslaCategories = {
    tesla: {
      name: 'Tesla Specific',
      icon: '⚡',
      suggestions: [
        'Tesla service centers near me',
        'Supercharger locations',
        'Tesla software updates',
        'Tesla parts and accessories',
        'Tesla forums and community'
      ]
    },
    travel: {
      name: 'Travel & Navigation',
      icon: '🗺️',
      suggestions: [
        'EV charging stations',
        'Hotels with EV charging',
        'Weather along route',
        'Traffic conditions',
        'Road conditions and closures'
      ]
    },
    local: {
      name: 'Local Services',
      icon: '📍',
      suggestions: [
        'Restaurants with charging stations',
        'Shopping centers near me',
        'Car washes',
        'Parking lots and garages',
        'Emergency services'
      ]
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const engine = searchEngines[selectedEngine];
    const searchUrl = `${engine.url}?q=${encodeURIComponent(searchQuery)}`;
    
    // Add to history
    const newHistoryItem = {
      query: searchQuery,
      engine: selectedEngine,
      timestamp: Date.now()
    };
    setSearchHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);

    // Open in new window/tab
    window.open(searchUrl, '_blank');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const getPopularSearches = () => {
    const queryCount = new Map();
    searchHistory.forEach(item => {
      const count = queryCount.get(item.query) || 0;
      queryCount.set(item.query, count + 1);
    });
    
    return Array.from(queryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query]) => query);
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-b-3xl">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Globe className="mr-3" size={32} />
          Search Engine Hub
        </h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search the web..."
            className="w-full px-6 py-4 pr-16 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 text-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            onClick={() => handleSearch()}
            className="absolute right-2 top-2 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Engine Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Object.entries(searchEngines).map(([key, engine]) => (
            <button
              key={key}
              onClick={() => setSelectedEngine(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedEngine === key
                  ? 'bg-white/40 shadow-lg'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <span className="text-lg">{engine.icon}</span>
              <span className="font-medium">{engine.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Tesla Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="mr-2" size={20} />
            Tesla-Optimized Categories
          </h2>
          <div className="grid gap-4">
            {Object.entries(teslaCategories).map(([key, category]) => (
              <div key={key} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                <button
                  onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-semibold text-lg">{category.name}</span>
                  </div>
                  <div className={`transform transition-transform ${activeCategory === key ? 'rotate-180' : ''}`}>
                    ↓
                  </div>
                </button>
                
                {activeCategory === key && (
                  <div className="mt-4 grid gap-2">
                    {category.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-left p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-between group"
                      >
                        <span>{suggestion}</span>
                        <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Clock className="mr-2" size={18} />
              Recent Searches
            </h3>
            <div className="space-y-2">
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item.query)}
                  className="w-full text-left p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{searchEngines[item.engine].icon}</span>
                    <span>{item.query}</span>
                  </div>
                  <span className="text-sm text-white/60">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches */}
        {getPopularSearches().length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Star className="mr-2" size={18} />
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {getPopularSearches().map((popularQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(popularQuery)}
                  className="px-4 py-2 bg-blue-500/30 rounded-full hover:bg-blue-500/50 transition-colors"
                >
                  {popularQuery}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHubApp;
