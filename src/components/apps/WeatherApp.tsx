
import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, Thermometer, Eye } from 'lucide-react';

const WeatherApp: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    visibility: 10,
    uvIndex: 6
  });

  const forecast = [
    { time: '12 PM', temp: 75, icon: '☀️', condition: 'Sunny' },
    { time: '1 PM', temp: 77, icon: '⛅', condition: 'Partly Cloudy' },
    { time: '2 PM', temp: 79, icon: '☁️', condition: 'Cloudy' },
    { time: '3 PM', temp: 76, icon: '🌦️', condition: 'Light Rain' },
    { time: '4 PM', temp: 74, icon: '⛈️', condition: 'Thunderstorm' },
    { time: '5 PM', temp: 72, icon: '🌤️', condition: 'Partly Sunny' }
  ];

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="text-yellow-400" size={48} />;
      case 'partly cloudy': return <Cloud className="text-gray-300" size={48} />;
      case 'cloudy': return <Cloud className="text-gray-400" size={48} />;
      case 'rainy': return <CloudRain className="text-blue-400" size={48} />;
      default: return <Sun className="text-yellow-400" size={48} />;
    }
  };

  return (
    <div className="p-6 text-white h-full bg-gradient-to-br from-blue-900 via-purple-900/30 to-pink-900/30">
      {/* Current Weather Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center">
                <span className="mr-2">📍</span>
                Tesla Location
              </h2>
              <div className="text-6xl font-bold text-cyan-400 mb-2">
                {currentWeather.temperature}°F
              </div>
              <div className="text-xl text-gray-300">
                {currentWeather.condition}
              </div>
            </div>
            <div className="text-right">
              {getWeatherIcon(currentWeather.condition)}
              <div className="mt-4 text-sm text-gray-400">
                Perfect for driving! 🚗✨
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/50">
          <div className="flex items-center mb-2">
            <Wind className="text-blue-400 mr-2" size={24} />
            <span className="text-sm text-gray-300">Wind Speed</span>
          </div>
          <div className="text-2xl font-bold">{currentWeather.windSpeed} mph</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/50">
          <div className="flex items-center mb-2">
            <Thermometer className="text-green-400 mr-2" size={24} />
            <span className="text-sm text-gray-300">Humidity</span>
          </div>
          <div className="text-2xl font-bold">{currentWeather.humidity}%</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/50">
          <div className="flex items-center mb-2">
            <Eye className="text-purple-400 mr-2" size={24} />
            <span className="text-sm text-gray-300">Visibility</span>
          </div>
          <div className="text-2xl font-bold">{currentWeather.visibility} mi</div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">⏰</span>
          Hourly Forecast
          <span className="ml-2">🌈</span>
        </h3>
        <div className="grid grid-cols-6 gap-3">
          {forecast.map((hour, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all hover:scale-105"
            >
              <div className="text-center">
                <div className="text-sm text-gray-300 mb-2">{hour.time}</div>
                <div className="text-3xl mb-2">{hour.icon}</div>
                <div className="text-lg font-bold text-white">{hour.temp}°</div>
                <div className="text-xs text-gray-400 mt-1">{hour.condition}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tesla Integration Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">🚗</span>
          Tesla Recommendations
          <span className="ml-2">⚡</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl p-4 border border-red-400/50">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🔥</span>
              <span className="font-semibold">Climate Suggestion</span>
            </div>
            <div className="text-sm text-gray-300">
              Pre-condition to 70°F for optimal efficiency
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-green-500/20 rounded-xl p-4 border border-yellow-400/50">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">⚡</span>
              <span className="font-semibold">Charging Tip</span>
            </div>
            <div className="text-sm text-gray-300">
              Great weather for outdoor charging!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
