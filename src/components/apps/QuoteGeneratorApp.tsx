
import React, { useState, useEffect } from 'react';
import { Quote, Shuffle, Heart, Share, Copy, Calendar, Tag } from 'lucide-react';

const QuoteGeneratorApp: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoriteQuotes, setFavoriteQuotes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const quoteDatabase = {
    motivation: {
      name: 'Motivation',
      icon: '🚀',
      quotes: [
        {
          id: 1,
          text: "The future depends on what you do today.",
          author: "Mahatma Gandhi",
          tags: ['future', 'action', 'today']
        },
        {
          id: 2,
          text: "Innovation distinguishes between a leader and a follower.",
          author: "Steve Jobs",
          tags: ['innovation', 'leadership']
        },
        {
          id: 3,
          text: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
          tags: ['passion', 'work', 'excellence']
        }
      ]
    },
    tesla: {
      name: 'Tesla & Innovation',
      icon: '⚡',
      quotes: [
        {
          id: 4,
          text: "The present is theirs; the future, for which I really worked, is mine.",
          author: "Nikola Tesla",
          tags: ['future', 'vision', 'tesla']
        },
        {
          id: 5,
          text: "When something is important enough, you do it even if the odds are not in your favor.",
          author: "Elon Musk",
          tags: ['perseverance', 'importance', 'musk']
        },
        {
          id: 6,
          text: "I think it's very important to have a feedback loop, where you're constantly thinking about what you've done and how you could be doing it better.",
          author: "Elon Musk",
          tags: ['improvement', 'feedback', 'growth']
        }
      ]
    },
    travel: {
      name: 'Travel & Adventure',
      icon: '🗺️',
      quotes: [
        {
          id: 7,
          text: "Not all those who wander are lost.",
          author: "J.R.R. Tolkien",
          tags: ['wandering', 'journey', 'exploration']
        },
        {
          id: 8,
          text: "Life is either a daring adventure or nothing at all.",
          author: "Helen Keller",
          tags: ['adventure', 'life', 'courage']
        },
        {
          id: 9,
          text: "The world is a book and those who do not travel read only one page.",
          author: "Saint Augustine",
          tags: ['travel', 'learning', 'world']
        }
      ]
    },
    technology: {
      name: 'Technology',
      icon: '💻',
      quotes: [
        {
          id: 10,
          text: "Technology is best when it brings people together.",
          author: "Matt Mullenweg",
          tags: ['technology', 'connection', 'people']
        },
        {
          id: 11,
          text: "The advance of technology is based on making it fit in so that you don't really even notice it.",
          author: "Bill Gates",
          tags: ['technology', 'integration', 'progress']
        }
      ]
    },
    sustainability: {
      name: 'Sustainability',
      icon: '🌱',
      quotes: [
        {
          id: 12,
          text: "The greatest threat to our planet is the belief that someone else will save it.",
          author: "Robert Swan",
          tags: ['environment', 'responsibility', 'action']
        },
        {
          id: 13,
          text: "We do not inherit the earth from our ancestors; we borrow it from our children.",
          author: "Native American Proverb",
          tags: ['environment', 'future', 'responsibility']
        }
      ]
    }
  };

  const getAllQuotes = () => {
    return Object.values(quoteDatabase).flatMap(category => category.quotes);
  };

  const getFilteredQuotes = () => {
    let quotes = selectedCategory === 'all' ? getAllQuotes() : quoteDatabase[selectedCategory as keyof typeof quoteDatabase]?.quotes || [];
    
    if (searchQuery) {
      quotes = quotes.filter(quote => 
        quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return quotes;
  };

  const getDailyQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const allQuotes = getAllQuotes();
    return allQuotes[dayOfYear % allQuotes.length];
  };

  const getRandomQuote = () => {
    const filteredQuotes = getFilteredQuotes();
    if (filteredQuotes.length === 0) return null;
    return filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  };

  const toggleFavorite = (quoteId: number) => {
    setFavoriteQuotes(prev => {
      const quoteIdStr = quoteId.toString();
      return prev.includes(quoteIdStr)
        ? prev.filter(id => id !== quoteIdStr)
        : [...prev, quoteIdStr];
    });
  };

  const copyQuote = () => {
    if (currentQuote) {
      const text = `"${currentQuote.text}" - ${currentQuote.author}`;
      navigator.clipboard.writeText(text);
    }
  };

  const shareQuote = () => {
    if (currentQuote && navigator.share) {
      navigator.share({
        title: 'Inspirational Quote',
        text: `"${currentQuote.text}" - ${currentQuote.author}`,
      });
    }
  };

  useEffect(() => {
    // Set daily quote on app load
    setCurrentQuote(getDailyQuote());
  }, []);

  const backgroundGradients = [
    'from-blue-600 to-purple-700',
    'from-purple-600 to-pink-700',
    'from-green-600 to-teal-700',
    'from-orange-600 to-red-700',
    'from-indigo-600 to-blue-700'
  ];

  const [currentGradient, setCurrentGradient] = useState(0);

  const nextQuote = () => {
    const quote = getRandomQuote();
    if (quote) {
      setCurrentQuote(quote);
      setCurrentGradient((prev) => (prev + 1) % backgroundGradients.length);
    }
  };

  if (!currentQuote) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Quote size={64} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold">Loading quotes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-gradient-to-br ${backgroundGradients[currentGradient]} text-white relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full mix-blend-overlay animate-pulse delay-1000"></div>
      </div>

      {/* Header Controls */}
      <div className="relative z-10 p-6 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Quote size={32} />
          <div>
            <h1 className="text-2xl font-bold">Quote Generator</h1>
            <p className="text-white/70">Daily inspiration & wisdom</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            🔍
          </button>
          <button
            onClick={() => setCurrentQuote(getDailyQuote())}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            title="Daily Quote"
          >
            <Calendar size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="relative z-10 px-6 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotes, authors, or tags..."
            className="w-full px-4 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      )}

      {/* Main Quote Display */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8 text-center">
        <div className="max-w-4xl">
          <div className="relative mb-8">
            <div className="text-6xl opacity-20 absolute -top-4 -left-4">"</div>
            <div className="text-6xl opacity-20 absolute -bottom-8 -right-4">"</div>
            <p className="text-3xl md:text-4xl font-light leading-relaxed mb-8 relative z-10">
              {currentQuote.text}
            </p>
          </div>

          <div className="text-xl md:text-2xl font-medium opacity-90 mb-6">
            — {currentQuote.author}
          </div>

          {/* Tags */}
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {currentQuote.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => toggleFavorite(currentQuote.id)}
              className={`w-14 h-14 rounded-full transition-all flex items-center justify-center ${
                favoriteQuotes.includes(currentQuote.id.toString())
                  ? 'bg-red-500/40 text-red-200'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Heart size={24} fill={favoriteQuotes.includes(currentQuote.id.toString()) ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={copyQuote}
              className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <Copy size={24} />
            </button>

            <button
              onClick={shareQuote}
              className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <Share size={24} />
            </button>

            <button
              onClick={nextQuote}
              className="w-14 h-14 rounded-full bg-white/30 hover:bg-white/40 transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
            >
              <Shuffle size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Category Selector */}
      <div className="relative z-10 p-6 bg-black/20 backdrop-blur-sm">
        <div className="flex justify-center gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-white/40 shadow-lg'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            🌟 All Categories
          </button>
          {Object.entries(quoteDatabase).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === key
                  ? 'bg-white/40 shadow-lg'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteGeneratorApp;
