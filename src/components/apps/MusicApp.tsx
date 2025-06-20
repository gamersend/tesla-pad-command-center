
import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';

const MusicApp: React.FC = () => {
  const [selectedService, setSelectedService] = useState('spotify');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: 355, // in seconds
    currentTime: 143
  });

  const services = [
    { id: 'spotify', name: 'Spotify', color: 'from-green-500 to-green-600' },
    { id: 'apple', name: 'Apple Music', color: 'from-pink-500 to-red-600' },
    { id: 'youtube', name: 'YouTube Music', color: 'from-red-500 to-red-700' },
    { id: 'pandora', name: 'Pandora', color: 'from-blue-500 to-blue-600' }
  ];

  const playlists = [
    {
      id: 1,
      name: 'Road Trip Essentials',
      description: 'Perfect driving music for long Tesla journeys',
      songCount: 47,
      duration: '3h 12m',
      cover: '🚗'
    },
    {
      id: 2,
      name: 'Chill Supercharging',
      description: 'Relaxing tunes while your Tesla charges',
      songCount: 32,
      duration: '2h 15m',
      cover: '⚡'
    },
    {
      id: 3,
      name: 'City Cruising',
      description: 'Urban beats for city driving',
      songCount: 28,
      duration: '1h 45m',
      cover: '🏙️'
    },
    {
      id: 4,
      name: 'Morning Commute',
      description: 'Start your day with energy',
      songCount: 23,
      duration: '1h 30m',
      cover: '🌅'
    }
  ];

  const recentlyPlayed = [
    { title: 'Mr. Blue Sky', artist: 'Electric Light Orchestra', album: 'Out of the Blue' },
    { title: 'Take On Me', artist: 'a-ha', album: 'Hunting High and Low' },
    { title: 'Don\'t Stop Me Now', artist: 'Queen', album: 'Jazz' },
    { title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction' }
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (currentSong.currentTime / currentSong.duration) * 100;
  };

  return (
    <div className="h-full bg-gradient-to-br from-pink-900 via-purple-900/30 to-indigo-900/30 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-black/30 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold flex items-center mb-4">
            🎵 Music Player
          </h1>
          
          {/* Service Selector */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
          >
            {services.map(service => (
              <option key={service.id} value={service.id} className="bg-gray-800">
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {/* Library Navigation */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold mb-3">Your Library</h3>
          <div className="space-y-2">
            {[
              { name: 'Recently Played', count: 12 },
              { name: 'Liked Songs', count: 156 },
              { name: 'Downloaded', count: 23 },
              { name: 'Tesla Playlists', count: 8 }
            ].map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <span>{item.name}</span>
                <span className="text-xs text-gray-400">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tesla Playlists */}
        <div className="flex-1 p-4">
          <h3 className="text-lg font-semibold mb-3">Tesla Curated</h3>
          <div className="space-y-3">
            {playlists.map(playlist => (
              <div
                key={playlist.id}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 border border-purple-400/30 cursor-pointer hover:border-purple-400/50 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{playlist.cover}</span>
                  <div>
                    <h4 className="font-semibold text-white">{playlist.name}</h4>
                    <p className="text-xs text-gray-400">{playlist.songCount} songs • {playlist.duration}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-300">{playlist.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Now Playing */}
        <div className="p-8 border-b border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            {/* Album Art Placeholder */}
            <div className="w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/20">
              <div className="text-6xl">🎵</div>
            </div>

            {/* Song Info */}
            <h2 className="text-3xl font-bold mb-2">{currentSong.title}</h2>
            <p className="text-xl text-gray-300 mb-1">{currentSong.artist}</p>
            <p className="text-gray-400 mb-6">{currentSong.album}</p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(currentSong.currentTime)}</span>
                <span>{formatTime(currentSong.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Shuffle size={20} />
              </button>
              <button className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <SkipBack size={24} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all transform hover:scale-105"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>
              <button className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <SkipForward size={24} />
              </button>
              <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Repeat size={20} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-center space-x-3 max-w-xs mx-auto">
              <Volume2 size={20} />
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Recently Played */}
        <div className="flex-1 p-8">
          <h3 className="text-2xl font-bold mb-6">Recently Played</h3>
          <div className="grid grid-cols-2 gap-4">
            {recentlyPlayed.map((song, index) => (
              <div
                key={index}
                className="bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-colors border border-white/10"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-xl">🎵</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{song.title}</h4>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tesla Audio Features */}
          <div className="mt-8 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-6 border border-red-400/30">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              🚗 Tesla Audio Features
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-cyan-400 font-semibold mb-2">🔊 Premium Audio</div>
                <div className="text-sm text-gray-300">
                  Optimized for Tesla's premium sound system with custom EQ
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-green-400 font-semibold mb-2">🎧 Immersive Sound</div>
                <div className="text-sm text-gray-300">
                  Spatial audio processing for the ultimate driving experience
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicApp;
