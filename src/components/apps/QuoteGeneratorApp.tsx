
import React, { useState, useEffect } from 'react';
import { RefreshCw, Heart, Share2, Copy, Star, Calendar } from 'lucide-react';

interface Quote {
  text: string;
  author: string;
  tags: string[];
  category?: string;
}

const QuoteGeneratorApp: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoriteQuotes, setFavoriteQuotes] = useState<Quote[]>([]);
  const [isDailyQuote, setIsDailyQuote] = useState(false);

  const quoteCategories = {
    motivation: {
      name: 'Motivation',
      icon: '🚀',
      quotes: [
        {
          text: "The future depends on what you do today.",
          author: "Mahatma Gandhi",
          tags: ['future', 'action', 'today']
        },
        {
          text: "Innovation distinguishes between a leader and a follower.",
          author: "Steve Jobs",
          tags: ['innovation', 'leadership']
        },
        {
          text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
          author: "Winston Churchill",
          tags: ['success', 'failure', 'courage']
        }
      ]
    },
    tesla: {
      name: 'Tesla & Innovation',
      icon: '⚡',
      quotes: [
        {
          text: "The present is theirs; the future, for which I really worked, is mine.",
          author: "Nikola Tesla",
          tags: ['future', 'vision', 'tesla']
        },
        {
          text: "When something is important enough, you do it even if the odds are not in your favor.",
          author: "Elon Musk",
          tags: ['perseverance', 'importance', 'musk']
        },
        {
          text: "I think it's very important to have a feedback loop, where you're constantly thinking about what you've done and how you could be doing it better.",
          author: "Elon Musk",
          tags: ['feedback', 'improvement', 'musk']
        }
      ]
    },
    travel: {
      name: 'Travel & Adventure',
      icon: '🗺️',
      quotes: [
        {
          text: "Not all those who wander are lost.",
          author: "J.R.R. Tolkien",
          tags: ['wandering', 'journey', 'exploration']
        },
        {
          text: "Life is either a daring adventure or nothing at all.",
          author: "Helen Keller",
          tags: ['adventure', 'life', 'courage']
        },
        {
          text: "The journey not the arrival matters.",
          author: "T.S. Eliot",
          tags: ['journey', 'process', 'experience']
        }
      ]
    },
    technology: {
      name: 'Technology',
      icon: '💻',
      quotes: [
        {
          text: "Technology is best when it brings people together.",
          author: "Matt Mullenweg",
          tags: ['technology', 'connection', 'people']
        },
        {
          text: "The advance of technology is based on making it fit in so that you don't really even notice it.",
          author: "Bill Gates",
          tags: ['technology', 'integration', 'progress']
        },
        {
          text: "Any sufficiently advanced technology is indistinguishable from magic.",
          author: "Arthur C. Clarke",
          tags: ['technology', 'magic', 'advancement']
        }
      ]
    },
    sustainability: {
      name: 'Sustainability',
      icon: '🌱',
      quotes: [
        {
          text: "The greatest threat to our planet is the belief that someone else will save it.",
          author: "Robert Swan",
          tags: ['environment', 'responsibility', 'action']
        },
        {
          text: "We do not inherit the earth from our ancestors; we borrow it from our children.",
          author: "Native American Proverb",
          tags: ['environment', 'future', 'responsibility']
        },
        {
          text: "The Earth does not belong to us; we belong to the Earth.",
          author: "Chief Seattle",
          tags: ['earth', 'connection', 'respect']
        }
      ]
    }
  };

  const getAllQuotes = (): Quote[] => {
    const allQuotes: Quote[] = [];
    Object.entries(quoteCategories).forEach(([category, data]) => {
      data.quotes.forEach(quote => {
        allQuotes.push({ ...quote, category });
      });
    });
    return allQuotes;
  };

  const getDailyQuote = (): Quote => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const allQuotes = getAllQuotes();
    return allQuotes[dayOfYear % allQuotes.length];
  };

  const getRandomQuote = (category: string = 'all'): Quote => {
    let quotes: Quote[] = [];
    
    if (category === 'all') {
      quotes = getAllQuotes();
    } else if (quoteCategories[category]) {
      quotes = quoteCategories[category].quotes.map(q => ({ ...q, category }));
    }
    
    if (quotes.length === 0) return getDailyQuote();
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const generateNewQuote = () => {
    const newQuote = getRandomQuote(selectedCategory);
    setCurrentQuote(newQuote);
    setIsDailyQuote(false);
  };

  const showDailyQuote = () => {
    const dailyQuote = getDailyQuote();
    setCurrentQuote(dailyQuote);
    setIsDailyQuote(true);
  };

  const toggleFavorite = () => {
    if (!currentQuote) return;
    
    const isAlreadyFavorite = favoriteQuotes.some(
      fav => fav.text === currentQuote.text && fav.author === currentQuote.author
    );
    
    if (isAlreadyFavorite) {
      setFavoriteQuotes(prev => 
        prev.filter(fav => !(fav.text === currentQuote.text && fav.author === currentQuote.author))
      );
    } else {
      setFavoriteQuotes(prev => [...prev, currentQuote]);
    }
  };

  const copyQuote = () => {
    if (!currentQuote) return;
    const quoteText = `"${currentQuote.text}" - ${currentQuote.author}`;
    navigator.clipboard.writeText(quoteText);
  };

  const shareQuote = () => {
    if (!currentQuote) return;
    const quoteText = `"${currentQuote.text}" - ${currentQuote.author}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Inspirational Quote',
        text: quoteText,
      });
    } else {
      copyQuote();
    }
  };

  useEffect(() => {
    // Load daily quote on app start
    showDailyQuote();
  }, []);

  const isFavorite = currentQuote && favoriteQuotes.some(
    fav => fav.text === currentQuote.text && fav.author === currentQuote.author
  );

  return (
    <div className="h-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20"></div>
        <div className="absolute top-32 right-20 w-24 h-24 rounded-full bg-white/10"></div>
        <div className="absolute bottom-20 left-32 w-40 h-40 rounded-full bg-white/15"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">💭 Quote Generator</h1>
        <p className="text-white/80">Daily inspiration for your Tesla journey</p>
        
        {isDailyQuote && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
            <Calendar size={16} />
            Daily Quote
          </div>
        )}
      </div>

      {/* Quote Display */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8 py-6">
        {currentQuote && (
          <div className="max-w-4xl text-center">
            <div className="relative">
              <div className="text-6xl font-serif absolute -top-8 -left-8 text-white/30">"</div>
              <div className="text-6xl font-serif absolute -bottom-8 -right-8 text-white/30">"</div>
              
              <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-8 px-12">
                {currentQuote.text}
              </blockquote>
            </div>
            
            <div className="text-xl font-medium mb-4">
              — {currentQuote.author}
            </div>
            
            {currentQuote.tags && (
              <div className="flex justify-center gap-2 flex-wrap mb-8">
                {currentQuote.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 p-6">
        {/* Category Selector */}
        <div className="flex justify-center mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white backdrop-blur-sm"
          >
            <option value="all" className="bg-gray-800">All Categories</option>
            {Object.entries(quoteCategories).map(([key, category]) => (
              <option key={key} value={key} className="bg-gray-800">
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={showDailyQuote}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <Calendar size={20} />
            Daily Quote
          </button>
          
          <button
            onClick={generateNewQuote}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <RefreshCw size={20} />
            New Quote
          </button>
          
          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-2 px-6 py-3 backdrop-blur-sm rounded-full transition-colors ${
              isFavorite ? 'bg-red-500/40 hover:bg-red-500/50' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? 'Favorited' : 'Favorite'}
          </button>
          
          <button
            onClick={copyQuote}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <Copy size={20} />
            Copy
          </button>
          
          <button
            onClick={shareQuote}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <Share2 size={20} />
            Share
          </button>
        </div>
      </div>

      {/* Favorites Count */}
      {favoriteQuotes.length > 0 && (
        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
          <Star size={16} className="inline mr-1" />
          {favoriteQuotes.length} favorites
        </div>
      )}
    </div>
  );
};

export default QuoteGeneratorApp;
