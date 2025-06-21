
import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, ExternalLink, Bookmark, Share2, TrendingUp } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  author: string;
  source: string;
  category: string;
  priority: string;
  readingTime: number;
  relevanceScore?: number;
  hnScore?: number;
  hnComments?: number;
  cached: number;
}

const NewsFeedApp: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'tesla', name: 'Tesla' },
    { id: 'ev_news', name: 'EV News' },
    { id: 'tech', name: 'Tech' },
    { id: 'community', name: 'Community' }
  ];

  const newsSources = {
    tesla_official: {
      name: 'Tesla Official',
      category: 'tesla',
      priority: 'high'
    },
    electrek: {
      name: 'Electrek',
      category: 'ev_news',
      priority: 'high'
    },
    hacker_news: {
      name: 'Hacker News',
      category: 'tech',
      priority: 'medium'
    },
    tesla_reddit: {
      name: 'Tesla Reddit',
      category: 'community',
      priority: 'low'
    }
  };

  useEffect(() => {
    loadMockArticles();
    const interval = setInterval(loadMockArticles, 15 * 60 * 1000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, []);

  const loadMockArticles = () => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockArticles: Article[] = [
        {
          id: 'tesla_1',
          title: 'Tesla Announces New Supercharger V4 with 350kW Charging Speed',
          description: 'Tesla unveils the next generation of Supercharger technology with faster charging speeds and improved efficiency for all Tesla models.',
          link: 'https://tesla.com/blog/supercharger-v4',
          pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          author: 'Tesla Team',
          source: 'tesla_official',
          category: 'tesla',
          priority: 'high',
          readingTime: 4,
          relevanceScore: 1.5,
          cached: Date.now()
        },
        {
          id: 'electrek_1',
          title: 'Model Y Refresh Spotted Testing with New Interior Design',
          description: 'Spy photos reveal Tesla Model Y refresh testing with updated dashboard, new steering wheel design, and improved materials.',
          link: 'https://electrek.co/model-y-refresh',
          pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          author: 'Fred Lambert',
          source: 'electrek',
          category: 'ev_news',
          priority: 'high',
          readingTime: 3,
          relevanceScore: 1.3,
          cached: Date.now()
        },
        {
          id: 'hn_1',
          title: 'Tesla\'s Neural Network Architecture for Full Self-Driving',
          description: 'Deep dive into Tesla\'s AI approach for autonomous driving using neural networks and real-world data collection.',
          link: 'https://news.ycombinator.com/item?id=12345',
          pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          author: 'ai_researcher',
          source: 'hacker_news',
          category: 'tech',
          priority: 'medium',
          readingTime: 8,
          hnScore: 245,
          hnComments: 67,
          cached: Date.now()
        },
        {
          id: 'reddit_1',
          title: 'FSD Beta 12.3 Performance Review After 1000 Miles',
          description: 'Community member shares detailed analysis of FSD Beta 12.3 performance across various driving scenarios and conditions.',
          link: 'https://reddit.com/r/teslamotors/fsd-review',
          pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          author: 'tesla_owner_2021',
          source: 'tesla_reddit',
          category: 'community',
          priority: 'low',
          readingTime: 6,
          relevanceScore: 1.1,
          cached: Date.now()
        },
        {
          id: 'electrek_2',
          title: 'Tesla Energy Storage Deployments Hit Record High in Q1',
          description: 'Tesla reports significant growth in energy storage deployments with Megapack installations accelerating globally.',
          link: 'https://electrek.co/tesla-energy-q1',
          pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          author: 'Michelle Lewis',
          source: 'electrek',
          category: 'ev_news',
          priority: 'high',
          readingTime: 5,
          relevanceScore: 1.2,
          cached: Date.now()
        }
      ];

      setArticles(mockArticles);
      setLastRefresh(new Date());
      setLoading(false);
    }, 1000);
  };

  const filteredArticles = articles.filter(article => 
    selectedCategory === 'all' || article.category === selectedCategory
  );

  const toggleBookmark = (articleId: string) => {
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
    } else {
      newBookmarks.add(articleId);
    }
    setBookmarkedArticles(newBookmarks);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      tesla: 'border-red-400',
      ev_news: 'border-green-400',
      tech: 'border-blue-400',
      community: 'border-purple-400'
    };
    return colors[category as keyof typeof colors] || 'border-gray-400';
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      tesla_official: '🚗',
      electrek: '⚡',
      hacker_news: '💻',
      tesla_reddit: '👥'
    };
    return icons[source as keyof typeof icons] || '📰';
  };

  return (
    <div className="h-full bg-gradient-to-br from-pink-500 via-purple-500 to-purple-600 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/20 to-purple-500/20 p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">News Feed</h1>
            <p className="text-white/70">Tesla & Technology News</p>
          </div>
          <button
            onClick={loadMockArticles}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-white/40 text-white'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Refresh Indicator */}
        <div className="flex items-center justify-center p-4 bg-green-500/20 rounded-xl mb-6 border border-green-400/30">
          <Clock size={16} className="mr-2 text-green-400" />
          <span className="text-green-400 font-semibold">
            Last updated: {formatTimeAgo(lastRefresh)}
          </span>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-white/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-l-4 ${getCategoryColor(article.category)} hover:bg-white/15 transition-colors cursor-pointer`}
              >
                {/* Article Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-lg">{getSourceIcon(article.source)}</span>
                    <span className="font-semibold">
                      {newsSources[article.source as keyof typeof newsSources]?.name || article.source}
                    </span>
                    <span>•</span>
                    <span>{formatTimeAgo(article.pubDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {article.hnScore && (
                      <div className="flex items-center gap-1 text-orange-400 text-sm">
                        <TrendingUp size={14} />
                        <span>{article.hnScore}</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(article.id);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        bookmarkedArticles.has(article.id)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/20 text-white/70 hover:bg-white/30'
                      }`}
                    >
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>

                {/* Article Content */}
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-white/80 text-sm line-clamp-3 mb-4">{article.description}</p>

                {/* Article Meta */}
                <div className="flex items-center justify-between text-xs text-white/60">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{article.readingTime} min read</span>
                    </div>
                    {article.hnComments && (
                      <span>{article.hnComments} comments</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(article.link, '_blank');
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <ExternalLink size={12} />
                      Read
                    </button>
                    <button className="p-1 rounded-full hover:bg-white/20 transition-colors">
                      <Share2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredArticles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-white/70">Try selecting a different category or refresh the feed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeedApp;
