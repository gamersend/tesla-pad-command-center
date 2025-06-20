
import React, { useState } from 'react';
import { Navigation, Search, MapPin, Zap, Car, Route } from 'lucide-react';

const MapsApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const superchargers = [
    {
      id: 1,
      name: 'Downtown Supercharger',
      address: '123 Main St, Downtown',
      stalls: 12,
      available: 8,
      maxPower: '250kW',
      distance: '0.3 miles',
      amenities: ['Coffee', 'Restaurant', 'Wi-Fi']
    },
    {
      id: 2,
      name: 'Mall Plaza Supercharger',
      address: '456 Shopping Blvd',
      stalls: 8,
      available: 3,
      maxPower: '150kW',
      distance: '1.2 miles',
      amenities: ['Shopping', 'Food Court']
    },
    {
      id: 3,
      name: 'Highway Rest Stop',
      address: 'Interstate 101, Mile 45',
      stalls: 16,
      available: 12,
      maxPower: '250kW',
      distance: '5.8 miles',
      amenities: ['Restrooms', 'Convenience Store']
    }
  ];

  const quickDestinations = [
    { name: 'Home', address: '789 Residential St', icon: '🏠' },
    { name: 'Work', address: '321 Business Ave', icon: '💼' },
    { name: 'Tesla Service Center', address: '555 Service Rd', icon: '🔧' },
    { name: 'Airport', address: 'Terminal 1, Gate A', icon: '✈️' },
    { name: 'Shopping Center', address: '999 Retail Plaza', icon: '🛍️' },
    { name: 'Gym', address: '777 Fitness Blvd', icon: '💪' }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-green-900 via-emerald-900/30 to-teal-900/30 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-black/30 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold flex items-center mb-4">
            <Navigation className="mr-2" size={24} />
            Maps Lite
          </h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations..."
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Quick Destinations */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickDestinations.map((dest, index) => (
              <button
                key={index}
                onClick={() => setSelectedLocation(dest.name)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left"
              >
                <div className="text-2xl mb-1">{dest.icon}</div>
                <div className="text-sm font-medium">{dest.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Supercharger Locations */}
        <div className="flex-1 p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Zap className="mr-2" size={18} />
            Nearby Superchargers
          </h3>
          <div className="space-y-3">
            {superchargers.map(charger => (
              <div
                key={charger.id}
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{charger.name}</h4>
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    {charger.available}/{charger.stalls}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{charger.address}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-yellow-400">{charger.maxPower}</span>
                  <span className="text-blue-400">{charger.distance}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {charger.amenities.map(amenity => (
                    <span key={amenity} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Planning */}
        <div className="p-4 border-t border-white/10">
          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center">
            <Route size={18} className="mr-2" />
            Plan Route
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative">
        {/* Map Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="relative w-full h-full bg-gradient-to-br from-green-500/10 to-blue-500/10">
            {/* Mock Map Interface */}
            <div className="absolute inset-0 p-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">🗺️ Tesla Maps Integration</h2>
                <p className="text-gray-400">Range-aware navigation with Supercharger planning</p>
              </div>

              {/* Map Features Grid */}
              <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-400/30">
                  <div className="text-4xl mb-4">🚗</div>
                  <h3 className="text-xl font-bold mb-2">Range-Aware Routing</h3>
                  <p className="text-gray-300 text-sm">
                    Intelligent route planning that considers your current battery level and finds optimal charging stops.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/30">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold mb-2">Live Supercharger Data</h3>
                  <p className="text-gray-300 text-sm">
                    Real-time availability, charging speeds, and amenities at all Supercharger locations.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30">
                  <div className="text-4xl mb-4">🌡️</div>
                  <h3 className="text-xl font-bold mb-2">Weather Integration</h3>
                  <p className="text-gray-300 text-sm">
                    Route planning considers weather conditions and their impact on vehicle efficiency.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold mb-2">Smart Destinations</h3>
                  <p className="text-gray-300 text-sm">
                    Quick access to frequently visited locations with automatic trip optimization.
                  </p>
                </div>
              </div>

              {/* Current Trip Info */}
              {selectedLocation && (
                <div className="mt-8 bg-black/40 rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold mb-4">Route to {selectedLocation}</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">24 min</div>
                      <div className="text-sm text-gray-400">Estimated Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">18.5 mi</div>
                      <div className="text-sm text-gray-400">Distance</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">-12%</div>
                      <div className="text-sm text-gray-400">Battery Usage</div>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors">
                    Start Navigation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <button className="w-12 h-12 bg-black/40 hover:bg-black/60 rounded-xl flex items-center justify-center transition-colors">
            <MapPin size={20} />
          </button>
          <button className="w-12 h-12 bg-black/40 hover:bg-black/60 rounded-xl flex items-center justify-center transition-colors">
            <Car size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapsApp;
