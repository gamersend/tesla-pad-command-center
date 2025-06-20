# ✨ Advanced Feature Apps (6 Apps)

## 21. News Feed Aggregator

### Purpose & Overview

Curated news aggregation system with Tesla and technology focus, RSS feed management, and intelligent content filtering optimized for automotive reading.

### Core Features

#### Multi-Source News Aggregation

```javascript
class NewsAggregator {
  constructor() {
    this.sources = this.initializeNewsSources();
    this.rssFeeds = new Map();
    this.articles = new Map();
    this.preferences = this.loadUserPreferences();
    this.readingHistory = new Map();
    this.contentFilter = new ContentFilter();
  }
  
  initializeNewsSources() {
    return {
      tesla_official: {
        name: 'Tesla Official',
        rss: 'https://www.tesla.com/blog/rss',
        category: 'tesla',
        priority: 'high',
        enabled: true
      },
      electrek: {
        name: 'Electrek',
        rss: 'https://electrek.co/feed/',
        category: 'ev_news',
        priority: 'high',
        enabled: true
      },
      insideevs: {
        name: 'InsideEVs',
        rss: 'https://insideevs.com/feed/',
        category: 'ev_news',
        priority: 'medium',
        enabled: true
      },
      hacker_news: {
        name: 'Hacker News',
        api: 'https://hacker-news.firebaseio.com/v0',
        category: 'tech',
        priority: 'medium',
        enabled: true
      },
      tech_crunch: {
        name: 'TechCrunch',
        rss: 'https://techcrunch.com/feed/',
        category: 'tech',
        priority: 'medium',
        enabled: false // User preference
      },
      ars_technica: {
        name: 'Ars Technica',
        rss: 'https://feeds.arstechnica.com/arstechnica/index',
        category: 'tech',
        priority: 'medium',
        enabled: true
      },
      tesla_reddit: {
        name: 'Tesla Reddit',
        rss: 'https://www.reddit.com/r/teslamotors/.rss',
        category: 'community',
        priority: 'low',
        enabled: true
      }
    };
  }
  
  async fetchAllFeeds() {
    const promises = [];
    
    Object.entries(this.sources).forEach(([sourceId, source]) => {
      if (source.enabled) {
        if (source.rss) {
          promises.push(this.fetchRSSFeed(sourceId, source));
        } else if (source.api) {
          promises.push(this.fetchAPIFeed(sourceId, source));
        }
      }
    });
    
    const results = await Promise.allSettled(promises);
    return this.processResults(results);
  }
  
  async fetchRSSFeed(sourceId, source) {
    try {
      // Use RSS2JSON for CORS-friendly RSS parsing
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rss)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.status === 'ok') {
        const articles = data.items.map(item => ({
          id: this.generateArticleId(item.link),
          title: item.title,
          description: item.description,
          link: item.link,
          pubDate: new Date(item.pubDate),
          author: item.author || source.name,
          source: sourceId,
          category: source.category,
          priority: source.priority,
          readingTime: this.estimateReadingTime(item.description),
          cached: Date.now()
        }));
        
        this.cacheArticles(sourceId, articles);
        return { sourceId, articles, success: true };
      } else {
        throw new Error(`RSS fetch failed: ${data.message}`);
      }
    } catch (error) {
      console.error(`Failed to fetch RSS for ${sourceId}:`, error);
      return { sourceId, articles: [], success: false, error: error.message };
    }
  }
  
  async fetchHackerNews() {
    try {
      // Fetch top stories
      const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const topStoryIds = await topStoriesResponse.json();
      
      // Fetch first 30 stories details
      const storyPromises = topStoryIds.slice(0, 30).map(async (id) => {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return response.json();
      });
      
      const stories = await Promise.all(storyPromises);
      
      const articles = stories
        .filter(story => story && story.url) // Only stories with URLs
        .map(story => ({
          id: `hn_${story.id}`,
          title: story.title,
          description: `${story.score} points • ${story.descendants || 0} comments`,
          link: story.url,
          pubDate: new Date(story.time * 1000),
          author: story.by,
          source: 'hacker_news',
          category: 'tech',
          priority: 'medium',
          readingTime: 3, // Estimated
          hnScore: story.score,
          hnComments: story.descendants || 0,
          cached: Date.now()
        }));
      
      return { sourceId: 'hacker_news', articles, success: true };
    } catch (error) {
      console.error('Failed to fetch Hacker News:', error);
      return { sourceId: 'hacker_news', articles: [], success: false, error: error.message };
    }
  }
  
  filterAndRankArticles(articles) {
    let filtered = articles;
    
    // Apply content filters
    filtered = filtered.filter(article => {
      return this.contentFilter.isRelevant(article, this.preferences.interests);
    });
    
    // Apply Tesla-specific boosting
    filtered = filtered.map(article => {
      let relevanceScore = this.calculateRelevanceScore(article);
      
      // Boost Tesla-related content
      if (article.category === 'tesla' || this.containsTeslaKeywords(article)) {
        relevanceScore *= 1.5;
      }
      
      // Boost recent articles
      const hoursOld = (Date.now() - article.pubDate.getTime()) / (1000 * 60 * 60);
      if (hoursOld < 24) {
        relevanceScore *= 1.2;
      }
      
      return { ...article, relevanceScore };
    });
    
    // Sort by relevance and recency
    return filtered.sort((a, b) => {
      return (b.relevanceScore * this.getRecencyMultiplier(b)) - 
             (a.relevanceScore * this.getRecencyMultiplier(a));
    });
  }
  
  calculateRelevanceScore(article) {
    let score = 1.0;
    
    // Priority boost
    const priorityMultipliers = { high: 1.3, medium: 1.0, low: 0.8 };
    score *= priorityMultipliers[article.priority] || 1.0;
    
    // Hacker News score boost
    if (article.hnScore) {
      score += Math.log(article.hnScore) * 0.1;
    }
    
    // Reading time preference (prefer 2-10 minute reads)
    if (article.readingTime >= 2 && article.readingTime <= 10) {
      score *= 1.2;
    }
    
    return score;
  }
  
  containsTeslaKeywords(article) {
    const teslaKeywords = [
      'tesla', 'elon musk', 'electric vehicle', 'ev', 'supercharger',
      'model 3', 'model y', 'model s', 'model x', 'cybertruck',
      'autopilot', 'fsd', 'full self driving', 'battery', 'charging'
    ];
    
    const text = `${article.title} ${article.description}`.toLowerCase();
    return teslaKeywords.some(keyword => text.includes(keyword));
  }
}
```

### User Interface Design

#### News Feed Interface

```css
.news-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-system-background);
}

.news-header {
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  color: white;
  padding: 24px 20px;
  border-radius: 0 0 24px 24px;
}

.news-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.news-filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-pill {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease;
}

.filter-pill.active {
  background: rgba(255, 255, 255, 0.4);
}

.news-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(52, 199, 89, 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
  color: var(--color-green);
  font-weight: 600;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--category-color, var(--color-blue));
}

.article-card.tesla::before {
  background: var(--color-tesla-red);
}

.article-card.tech::before {
  background: var(--color-blue);
}

.article-card.ev_news::before {
  background: var(--color-green);
}

.article-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.article-source {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-secondary-label);
  font-weight: 600;
}

.source-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.article-time {
  font-size: 12px;
  color: var(--color-tertiary-label);
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 8px;
  color: var(--color-label);
}

.article-description {
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-secondary-label);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-tertiary-label);
}

.reading-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 16px;
  background: var(--color-quaternary-label);
  color: var(--color-secondary-label);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--color-blue);
  color: white;
}

.action-btn.bookmarked {
  background: var(--color-orange);
  color: white;
}

.hacker-news-score {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-orange);
  font-weight: 600;
}

.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-title {
  height: 20px;
  margin-bottom: 8px;
}

.skeleton-description {
  height: 14px;
  margin-bottom: 4px;
}

.skeleton-description:last-child {
  width: 70%;
}
```

#### Reading Mode & Article Viewer

```javascript
class ArticleReader {
  constructor() {
    this.readingMode = false;
    this.fontSize = parseInt(localStorage.getItem('article_font_size')) || 16;
    this.readingHistory = new Map();
    this.bookmarks = new Set(JSON.parse(localStorage.getItem('bookmarked_articles') || '[]'));
  }
  
  openArticle(article) {
    // Track reading
    this.trackReading(article);
    
    // Create reading interface
    const readerModal = this.createReaderModal(article);
    document.body.appendChild(readerModal);
    
    // Load article content
    this.loadArticleContent(article, readerModal);
    
    // Setup reading controls
    this.setupReadingControls(readerModal);
  }
  
  createReaderModal(article) {
    const modal = document.createElement('div');
    modal.className = 'article-reader-modal';
    modal.innerHTML = `
      <div class="reader-overlay" onclick="this.parentElement.remove()"></div>
      <div class="reader-content">
        <div class="reader-header">
          <div class="reader-info">
            <h1 class="reader-title">${article.title}</h1>
            <div class="reader-meta">
              <span class="reader-source">${article.source}</span>
              <span class="reader-time">${this.formatTime(article.pubDate)}</span>
              <span class="reader-reading-time">${article.readingTime} min read</span>
            </div>
          </div>
          <div class="reader-controls">
            <button class="reader-btn" onclick="this.toggleBookmark('${article.id}')">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>
              </svg>
            </button>
            <button class="reader-btn" onclick="this.shareArticle('${article.id}')">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.6 20.92,19A2.84,2.84 0 0,0 18,16.08Z"/>
              </svg>
            </button>
            <button class="reader-btn font-size-btn" onclick="this.adjustFontSize(1)">A+</button>
            <button class="reader-btn font-size-btn" onclick="this.adjustFontSize(-1)">A-</button>
            <button class="reader-btn close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
          </div>
        </div>
        <div class="reader-body" style="font-size: ${this.fontSize}px;">
          <div class="loading-content">Loading article...</div>
        </div>
      </div>
    `;
    
    return modal;
  }
  
  async loadArticleContent(article, modal) {
    const readerBody = modal.querySelector('.reader-body');
    
    try {
      // For Tesla-optimized reading, we'll use the article description
      // and provide a link to the full article
      const content = `
        <div class="article-summary">
          <p>${article.description}</p>
        </div>
        <div class="full-article-link">
          <a href="${article.link}" target="_blank" class="read-full-btn">
            Read Full Article on ${this.getSourceName(article.source)}
          </a>
        </div>
      `;
      
      readerBody.innerHTML = content;
      
    } catch (error) {
      readerBody.innerHTML = `
        <div class="error-message">
          <p>Unable to load article content.</p>
          <a href="${article.link}" target="_blank" class="read-full-btn">
            Read Original Article
          </a>
        </div>
      `;
    }
  }
  
  trackReading(article) {
    const reading = {
      articleId: article.id,
      title: article.title,
      source: article.source,
      readAt: Date.now(),
      completed: false
    };
    
    this.readingHistory.set(article.id, reading);
    this.saveReadingHistory();
  }
  
  getReadingRecommendations() {
    const recentlyRead = Array.from(this.readingHistory.values())
      .filter(reading => Date.now() - reading.readAt < 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .map(reading => reading.source);
    
    const sourceFrequency = recentlyRead.reduce((acc, source) => {
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    
    const preferredSources = Object.entries(sourceFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([source]) => source);
    
    return {
      preferredSources,
      recommendedCategories: this.getPreferredCategories(preferredSources),
      readingTime: this.getAverageReadingTime()
    };
  }
}
```

## 22. Settings & Configuration

### Purpose & Overview

Comprehensive system configuration hub for dashboard customization, user preferences, data management, and Tesla integration settings.

### Core Features

#### Appearance & Theme Settings

```javascript
class AppearanceSettings {
  constructor() {
    this.themes = this.initializeThemes();
    this.currentTheme = localStorage.getItem('dashboard_theme') || 'auto';
    this.customColors = new Map();
    this.wallpaperSettings = new Map();
    this.iconSettings = this.loadIconSettings();
  }
  
  initializeThemes() {
    return {
      auto: {
        name: 'Automatic',
        description: 'Follows system preference',
        colors: 'system',
        wallpaper: 'default'
      },
      light: {
        name: 'Light Mode',
        description: 'Clean, bright interface',
        colors: {
          background: '#FFFFFF',
          secondaryBackground: '#F2F2F7',
          label: '#000000',
          secondaryLabel: 'rgba(60, 60, 67, 0.6)',
          accent: '#007AFF'
        }
      },
      dark: {
        name: 'Dark Mode',
        description: 'Easy on the eyes for night driving',
        colors: {
          background: '#000000',
          secondaryBackground: '#1C1C1E',
          label: '#FFFFFF',
          secondaryLabel: 'rgba(235, 235, 245, 0.6)',
          accent: '#0A84FF'
        }
      },
      tesla: {
        name: 'Tesla Theme',
        description: 'Official Tesla colors and styling',
        colors: {
          background: '#000000',
          secondaryBackground: '#1B365E',
          label: '#FFFFFF',
          secondaryLabel: 'rgba(255, 255, 255, 0.6)',
          accent: '#E31937'
        }
      },
      oled: {
        name: 'OLED Black',
        description: 'Pure black for OLED displays',
        colors: {
          background: '#000000',
          secondaryBackground: '#111111',
          label: '#FFFFFF',
          secondaryLabel: 'rgba(255, 255, 255, 0.6)',
          accent: '#0A84FF'
        }
      }
    };
  }
  
  applyTheme(themeId) {
    const theme = this.themes[themeId];
    if (!theme) return;
    
    this.currentTheme = themeId;
    localStorage.setItem('dashboard_theme', themeId);
    
    if (themeId === 'auto') {
      this.applySystemTheme();
    } else {
      this.applStaticTheme(theme);
    }
    
    // Notify all components of theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: themeId, colors: theme.colors } 
    }));
  }
  
  applyStaticTheme(theme) {
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(`--color-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
    
    document.body.className = `theme-${this.currentTheme}`;
  }
  
  createCustomTheme(name, baseTheme, customizations) {
    const base = this.themes[baseTheme];
    const customTheme = {
      name,
      description: 'Custom theme',
      colors: { ...base.colors, ...customizations },
      custom: true,
      created: Date.now()
    };
    
    const customId = `custom_${Date.now()}`;
    this.themes[customId] = customTheme;
    this.saveCustomThemes();
    
    return customId;
  }
}
```

#### Dashboard Layout Configuration

```javascript
class LayoutSettings {
  constructor() {
    this.layouts = this.initializeLayouts();
    this.currentLayout = localStorage.getItem('dashboard_layout') || 'standard';
    this.iconArrangement = JSON.parse(localStorage.getItem('icon_arrangement') || '[]');
    this.folders = new Map();
    this.dockApps = JSON.parse(localStorage.getItem('dock_apps') || '[]');
  }
  
  initializeLayouts() {
    return {
      standard: {
        name: 'Standard Grid',
        description: '6x4 grid layout for most apps',
        grid: { columns: 6, rows: 4 },
        iconSize: 76,
        spacing: 24
      },
      compact: {
        name: 'Compact',
        description: 'Smaller icons, more apps visible',
        grid: { columns: 8, rows: 6 },
        iconSize: 60,
        spacing: 16
      },
      large: {
        name: 'Large Icons',
        description: 'Bigger icons for easy touch access',
        grid: { columns: 5, rows: 3 },
        iconSize: 92,
        spacing: 32
      },
      list: {
        name: 'List View',
        description: 'Vertical list with app details',
        grid: { columns: 1, rows: 10 },
        iconSize: 44,
        spacing: 8,
        showLabels: true,
        showDescriptions: true
      }
    };
  }
  
  applyLayout(layoutId) {
    const layout = this.layouts[layoutId];
    if (!layout) return;
    
    this.currentLayout = layoutId;
    localStorage.setItem('dashboard_layout', layoutId);
    
    // Update CSS variables
    const root = document.documentElement;
    root.style.setProperty('--grid-columns', layout.grid.columns);
    root.style.setProperty('--grid-rows', layout.grid.rows);
    root.style.setProperty('--icon-size', `${layout.iconSize}px`);
    root.style.setProperty('--icon-spacing', `${layout.spacing}px`);
    
    // Apply layout-specific styling
    document.body.className = `layout-${layoutId}`;
    
    // Trigger layout recalculation
    window.dispatchEvent(new CustomEvent('layoutChanged', { 
      detail: { layout: layoutId, settings: layout } 
    }));
  }
  
  exportLayoutConfig() {
    return {
      version: '1.0.0',
      exported: Date.now(),
      layout: this.currentLayout,
      iconArrangement: this.iconArrangement,
      folders: Object.fromEntries(this.folders),
      dockApps: this.dockApps,
      customizations: this.getCustomizations()
    };
  }
  
  importLayoutConfig(configData) {
    try {
      const config = typeof configData === 'string' ? JSON.parse(configData) : configData;
      
      if (config.layout && this.layouts[config.layout]) {
        this.applyLayout(config.layout);
      }
      
      if (config.iconArrangement) {
        this.iconArrangement = config.iconArrangement;
        localStorage.setItem('icon_arrangement', JSON.stringify(this.iconArrangement));
      }
      
      if (config.folders) {
        this.folders = new Map(Object.entries(config.folders));
        this.saveFolders();
      }
      
      if (config.dockApps) {
        this.dockApps = config.dockApps;
        localStorage.setItem('dock_apps', JSON.stringify(this.dockApps));
      }
      
      // Apply all changes
      this.refreshDashboard();
      
      return { success: true, message: 'Layout imported successfully' };
    } catch (error) {
      return { success: false, message: `Import failed: ${error.message}` };
    }
  }
}
```

### Tesla Integration Settings

#### API Configuration & Management

```javascript
class TeslaIntegrationSettings {
  constructor() {
    this.apiProviders = {
      tessie: {
        name: 'Tessie',
        description: 'Recommended - Most reliable Tesla API access',
        website: 'https://tessie.com',
        features: ['Real-time data', 'Commands', 'Historical data', 'Multiple vehicles'],
        rateLimit: { calls: 200, window: 900 }, // 200 calls per 15 minutes
        cost: 'Paid service'
      },
      tesla_fleet: {
        name: 'Tesla Fleet API',
        description: 'Official Tesla API for fleet owners',
        website: 'https://developer.tesla.com',
        features: ['Official API', 'Fleet management', 'Commands'],
        rateLimit: { calls: 1000, window: 86400 }, // 1000 calls per day
        cost: 'Free for personal use'
      }
    };
    
    this.currentProvider = localStorage.getItem('tesla_api_provider') || null;
    this.vehicles = new Map();
    this.automationSettings = this.loadAutomationSettings();
  }
  
  async configureAPIProvider(provider, credentials) {
    try {
      const providerConfig = this.apiProviders[provider];
      if (!providerConfig) {
        throw new Error('Unknown API provider');
      }
      
      // Validate credentials
      const validation = await this.validateCredentials(provider, credentials);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Store encrypted credentials
      await this.storeCredentials(provider, credentials);
      
      // Update current provider
      this.currentProvider = provider;
      localStorage.setItem('tesla_api_provider', provider);
      
      // Fetch vehicle list
      await this.refreshVehicleList();
      
      return { success: true, message: 'API provider configured successfully' };
      
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  async validateCredentials(provider, credentials) {
    switch (provider) {
      case 'tessie':
        return await this.validateTessieCredentials(credentials.apiKey);
      case 'tesla_fleet':
        return await this.validateFleetCredentials(credentials.accessToken);
      default:
        return { valid: false, error: 'Unknown provider' };
    }
  }
  
  async validateTessieCredentials(apiKey) {
    try {
      const response = await fetch('https://api.tessie.com/vehicles', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const vehicles = await response.json();
        return { 
          valid: true, 
          vehicleCount: vehicles.length,
          vehicles: vehicles.map(v => ({ id: v.id, name: v.display_name }))
        };
      } else {
        return { valid: false, error: 'Invalid API key or network error' };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  async refreshVehicleList() {
    if (!this.currentProvider) return;
    
    try {
      const vehicles = await this.fetchVehicles();
      this.vehicles.clear();
      
      vehicles.forEach(vehicle => {
        this.vehicles.set(vehicle.id, {
          id: vehicle.id,
          name: vehicle.display_name || `Tesla ${vehicle.id}`,
          model: vehicle.vehicle_config?.car_type || 'Unknown',
          color: vehicle.vehicle_config?.exterior_color || 'Unknown',
          added: Date.now(),
          enabled: true
        });
      });
      
      this.saveVehicleList();
      return Array.from(this.vehicles.values());
      
    } catch (error) {
      console.error('Failed to refresh vehicle list:', error);
      return [];
    }
  }
  
  configureAutomation(settings) {
    this.automationSettings = {
      ...this.automationSettings,
      ...settings
    };
    
    this.saveAutomationSettings();
    
    // Apply automation rules
    this.applyAutomationRules();
  }
  
  getAutomationRules() {
    return {
      preconditioning: {
        enabled: this.automationSettings.preconditioning_enabled || false,
        leadTime: this.automationSettings.preconditioning_lead_time || 15,
        calendarIntegration: this.automationSettings.calendar_integration || false,
        weatherBased: this.automationSettings.weather_based_preconditioning || true
      },
      charging: {
        enabled: this.automationSettings.charging_automation || false,
        offPeakOnly: this.automationSettings.off_peak_charging || true,
        targetCharge: this.automationSettings.target_charge_level || 80,
        departureTimeOptimization: this.automationSettings.departure_optimization || true
      },
      security: {
        autoLock: this.automationSettings.auto_lock || true,
        locationBasedLocking: this.automationSettings.location_based_locking || false,
        sentryMode: this.automationSettings.auto_sentry_mode || false
      },
      homeIntegration: {
        enabled: this.automationSettings.home_integration || false,
        garageControl: this.automationSettings.garage_control || false,
        homeClimateSync: this.automationSettings.home_climate_sync || false
      }
    };
  }
}
```

### User Interface Design

#### Settings Dashboard

```css
.settings-app {
  display: flex;
  height: 100vh;
  background: var(--color-system-background);
}

.settings-sidebar {
  width: 280px;
  background: var(--color-secondary-system-background);
  border-right: 1px solid var(--color-quaternary-label);
  overflow-y: auto;
}

.settings-nav {
  padding: 20px 0;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-secondary-label);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 20px;
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--color-label);
  text-decoration: none;
  font-size: 15px;
  transition: background 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: var(--color-tertiary-system-background);
}

.nav-item.active {
  background: var(--color-blue);
  color: white;
}

.nav-icon {
  width: 20px;
  height: 20px;
  opacity: 0.8;
}

.settings-main {
  flex: 1;
  overflow-y: auto;
}

.settings-header {
  background: white;
  border-bottom: 1px solid var(--color-quaternary-label);
  padding: 24px 32px;
}

.settings-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-label);
  margin-bottom: 8px;
}

.settings-description {
  font-size: 16px;
  color: var(--color-secondary-label);
}

.settings-content {
  padding: 32px;
}

.settings-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-label);
}

.section-action {
  padding: 8px 16px;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-quaternary-label);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-label);
  margin-bottom: 4px;
}

.setting-description {
  font-size: 14px;
  color: var(--color-secondary-label);
  line-height: 1.4;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 50px;
  height: 28px;
  background: var(--color-quaternary-label);
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-switch.enabled {
  background: var(--color-green);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.enabled .toggle-slider {
  transform: translateX(22px);
}

/* Select Dropdown */
.settings-select {
  padding: 8px 12px;
  border: 1px solid var(--color-quaternary-label);
  border-radius: 8px;
  background: white;
  font-size: 14px;
  min-width: 120px;
  cursor: pointer;
}

/* Color Picker */
.color-picker-button {
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-quaternary-label);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.color-preview {
  width: 100%;
  height: 100%;
  border: none;
  cursor: pointer;
}

/* Range Slider */
.settings-range {
  width: 120px;
  height: 4px;
  background: var(--color-quaternary-label);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.settings-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--color-blue);
  border-radius: 50%;
  cursor: pointer;
}

/* Theme Preview */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.theme-card {
  border: 2px solid var(--color-quaternary-label);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.theme-card:hover {
  border-color: var(--color-blue);
  transform: translateY(-2px);
}

.theme-card.selected {
  border-color: var(--color-blue);
  background: rgba(0, 122, 255, 0.1);
}

.theme-preview {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}

.theme-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.theme-description {
  font-size: 12px;
  color: var(--color-secondary-label);
}

/* API Configuration */
.api-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.api-status.connected {
  background: rgba(52, 199, 89, 0.1);
  color: var(--color-green);
}

.api-status.disconnected {
  background: rgba(255, 59, 48, 0.1);
  color: var(--color-red);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.vehicle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-secondary-system-background);
  border-radius: 12px;
}

.vehicle-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vehicle-icon {
  width: 40px;
  height: 40px;
  background: var(--color-blue);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.vehicle-details {
  display: flex;
  flex-direction: column;
}

.vehicle-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.vehicle-model {
  font-size: 12px;
  color: var(--color-secondary-label);
}
```

## 23. Gallery & Media

### Purpose & Overview

Comprehensive media management system with cloud synchronization, Tesla integration for vehicle documentation, and advanced organization features.

### Core Features

#### Media Management System

```javascript
class MediaManager {
  constructor() {
    this.storage = new SupabaseStorage();
    this.albums = new Map();
    this.mediaItems = new Map();
    this.uploadQueue = [];
    this.syncStatus = 'idle';
    this.teslaIntegration = new TeslaMediaIntegration();
    
    this.supportedFormats = {
      images: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
      videos: ['mp4', 'mov', 'avi', 'webm'],
      documents: ['pdf', 'txt', 'md']
    };
    
    this.initializeAlbums();
  }
  
  initializeAlbums() {
    const defaultAlbums = [
      {
        id: 'tesla_photos',
        name: 'Tesla Photos',
        description: 'Vehicle photos and documentation',
        type: 'tesla',
        icon: '🚗',
        autoManaged: true
      },
      {
        id: 'trip_memories',
        name: 'Trip Memories',
        description: 'Photos from road trips and adventures',
        type: 'travel',
        icon: '🗺️',
        autoManaged: true
      },
      {
        id: 'service_records',
        name: 'Service Records',
        description: 'Service documentation and receipts',
        type: 'documents',
        icon: '🔧',
        autoManaged: true
      },
      {
        id: 'screenshots',
        name: 'Screenshots',
        description: 'Dashboard and app screenshots',
        type: 'screenshots',
        icon: '📱',
        autoManaged: true
      }
    ];
    
    defaultAlbums.forEach(album => {
      this.albums.set(album.id, {
        ...album,
        created: Date.now(),
        modified: Date.now(),
        itemCount: 0,
        coverImage: null
      });
    });
  }
  
  async uploadMedia(files, albumId = null, metadata = {}) {
    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Generate metadata
      const mediaMetadata = await this.generateMetadata(file, metadata);
      
      // Create media item
      const mediaItem = {
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: this.getMediaType(file),
        size: file.size,
        mimeType: file.type,
        metadata: mediaMetadata,
        albumId: albumId || this.determineAutoAlbum(file, mediaMetadata),
        uploaded: Date.now(),
        synced: false,
        cloudUrl: null,
        localUrl: URL.createObjectURL(file),
        tags: metadata.tags || [],
        description: metadata.description || ''
      };
      
      // Add to queue
      this.uploadQueue.push({ file, mediaItem });
      this.mediaItems.set(mediaItem.id, mediaItem);
      
      return mediaItem;
    });
    
    const mediaItems = await Promise.all(uploadPromises);
    
    // Start upload process
    this.processUploadQueue();
    
    return mediaItems;
  }
  
  async generateMetadata(file, userMetadata = {}) {
    const metadata = {
      ...userMetadata,
      originalName: file.name,
      uploadedAt: Date.now()
    };
    
    // Extract EXIF data for images
    if (file.type.startsWith('image/')) {
      try {
        const exifData = await this.extractExifData(file);
        metadata.exif = exifData;
        
        if (exifData.GPS) {
          metadata.location = {
            latitude: exifData.GPS.latitude,
            longitude: exifData.GPS.longitude,
            address: await this.reverseGeocode(exifData.GPS.latitude, exifData.GPS.longitude)
          };
        }
        
        if (exifData.DateTime) {
          metadata.capturedAt = new Date(exifData.DateTime).getTime();
        }
      } catch (error) {
        console.warn('Failed to extract EXIF data:', error);
      }
    }
    
    // Tesla-specific metadata
    if (this.teslaIntegration.isAvailable()) {
      try {
        const vehicleData = await this.teslaIntegration.getCurrentVehicleData();
        metadata.tesla = {
          vehicleId: vehicleData.id,
          location: vehicleData.drive_state?.latitude && vehicleData.drive_state?.longitude ? {
            latitude: vehicleData.drive_state.latitude,
            longitude: vehicleData.drive_state.longitude
          } : null,
          odometer: vehicleData.vehicle_state?.odometer,
          batteryLevel: vehicleData.charge_state?.battery_level,
          timestamp: Date.now()
        };
      } catch (error) {
        console.warn('Failed to get Tesla metadata:', error);
      }
    }
    
    return metadata;
  }
  
  determineAutoAlbum(file, metadata) {
    // Tesla-related detection
    if (metadata.tesla) {
      return 'tesla_photos';
    }
    
    // Location-based detection
    if (metadata.location) {
      // Check if location is far from home (trip photos)
      const homeLocation = this.getUserHomeLocation();
      if (homeLocation) {
        const distance = this.calculateDistance(metadata.location, homeLocation);
        if (distance > 50) { // 50+ miles from home
          return 'trip_memories';
        }
      }
    }
    
    // File name detection
    const fileName = file.name.toLowerCase();
    if (fileName.includes('service') || fileName.includes('receipt') || fileName.includes('invoice')) {
      return 'service_records';
    }
    
    if (fileName.includes('screenshot') || fileName.includes('screen')) {
      return 'screenshots';
    }
    
    // Default to Tesla photos for most images
    return file.type.startsWith('image/') ? 'tesla_photos' : null;
  }
  
  async processUploadQueue() {
    if (this.syncStatus === 'uploading' || this.uploadQueue.length === 0) {
      return;
    }
    
    this.syncStatus = 'uploading';
    
    while (this.uploadQueue.length > 0) {
      const batch = this.uploadQueue.splice(0, 3); // Process 3 at a time
      
      const batchPromises = batch.map(async ({ file, mediaItem }) => {
        try {
          // Upload to Supabase Storage
          const cloudUrl = await this.storage.uploadFile(file, {
            folder: `media/${mediaItem.albumId}`,
            filename: `${mediaItem.id}_${file.name}`
          });
          
          // Update media item
          mediaItem.cloudUrl = cloudUrl;
          mediaItem.synced = true;
          mediaItem.syncedAt = Date.now();
          
          this.mediaItems.set(mediaItem.id, mediaItem);
          
          // Update album
          if (mediaItem.albumId) {
            this.updateAlbumStats(mediaItem.albumId);
          }
          
          return { success: true, mediaItem };
          
        } catch (error) {
          console.error('Upload failed:', error);
          mediaItem.syncError = error.message;
          this.mediaItems.set(mediaItem.id, mediaItem);
          
          return { success: false, error: error.message, mediaItem };
        }
      });
      
      await Promise.all(batchPromises);
      
      // Brief pause between batches to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.syncStatus = 'idle';
  }
  
  createAlbum(name, options = {}) {
    const album = {
      id: `album_${Date.now()}`,
      name,
      description: options.description || '',
      type: options.type || 'custom',
      icon: options.icon || '📁',
      created: Date.now(),
      modified: Date.now(),
      itemCount: 0,
      coverImage: null,
      autoManaged: false,
      settings: {
        sortBy: options.sortBy || 'date_desc',
        viewMode: options.viewMode || 'grid',
        allowUpload: options.allowUpload !== false
      }
    };
    
    this.albums.set(album.id, album);
    this.saveAlbums();
    
    return album;
  }
  
  organizeByLocation() {
    const locationGroups = new Map();
    
    this.mediaItems.forEach(item => {
      if (item.metadata?.location) {
        const location = item.metadata.location;
        const key = `${Math.round(location.latitude * 100) / 100},${Math.round(location.longitude * 100) / 100}`;
        
        if (!locationGroups.has(key)) {
          locationGroups.set(key, {
            location,
            items: [],
            address: location.address
          });
        }
        
        locationGroups.get(key).items.push(item);
      }
    });
    
    // Create albums for significant location groups (5+ photos)
    locationGroups.forEach((group, key) => {
      if (group.items.length >= 5) {
        const albumName = group.address || `Location ${key}`;
        const album = this.createAlbum(albumName, {
          type: 'location',
          icon: '📍',
          description: `Photos taken at ${group.address || 'this location'}`
        });
        
        // Move items to new album
        group.items.forEach(item => {
          item.albumId = album.id;
          this.mediaItems.set(item.id, item);
        });
        
        this.updateAlbumStats(album.id);
      }
    });
  }
}
```

### Tesla Integration Features

#### Vehicle Documentation System

```javascript
class TeslaMediaIntegration {
  constructor() {
    this.documentationTypes = {
      exterior: {
        name: 'Exterior Photos',
        angles: ['front', 'rear', 'left_side', 'right_side', 'front_left', 'front_right', 'rear_left', 'rear_right'],
        description: 'Complete exterior documentation'
      },
      interior: {
        name: 'Interior Photos',
        areas: ['dashboard', 'seats', 'center_console', 'rear_seats', 'cargo', 'door_panels'],
        description: 'Interior condition documentation'
      },
      damage: {
        name: 'Damage Documentation',
        severity: ['minor', 'moderate', 'major'],
        description: 'Document any vehicle damage'
      },
      modifications: {
        name: 'Modifications',
        types: ['accessories', 'wraps', 'wheels', 'interior', 'performance'],
        description: 'Aftermarket modifications and accessories'
      },
      service: {
        name: 'Service Documentation',
        types: ['receipt', 'work_order', 'before', 'after', 'parts'],
        description: 'Service and maintenance records'
      }
    };
  }
  
  startDocumentationWizard(type) {
    const wizard = {
      type,
      config: this.documentationTypes[type],
      currentStep: 0,
      capturedImages: [],
      metadata: {
        vehicleData: null,
        location: null,
        timestamp: Date.now()
      }
    };
    
    return this.createWizardInterface(wizard);
  }
  
  createWizardInterface(wizard) {
    const modal = document.createElement('div');
    modal.className = 'documentation-wizard-modal';
    modal.innerHTML = `
      <div class="wizard-overlay"></div>
      <div class="wizard-content">
        <div class="wizard-header">
          <h2>${wizard.config.name}</h2>
          <p>${wizard.config.description}</p>
          <div class="wizard-progress">
            <div class="progress-bar" style="width: 0%"></div>
            <span class="progress-text">Step 1 of ${this.getWizardSteps(wizard).length}</span>
          </div>
        </div>
        
        <div class="wizard-body">
          <div class="current-step">
            ${this.renderWizardStep(wizard)}
          </div>
        </div>
        
        <div class="wizard-footer">
          <button class="wizard-btn secondary" onclick="this.previousStep()">Previous</button>
          <button class="wizard-btn primary" onclick="this.nextStep()">Next</button>
          <button class="wizard-btn secondary" onclick="this.closeWizard()">Cancel</button>
        </div>
      </div>
    `;
    
    this.setupWizardHandlers(modal, wizard);
    document.body.appendChild(modal);
    
    return wizard;
  }
  
  getWizardSteps(wizard) {
    const baseSteps = ['intro', 'vehicle_info'];
    
    switch (wizard.type) {
      case 'exterior':
        return [...baseSteps, ...wizard.config.angles, 'review'];
      case 'interior':
        return [...baseSteps, ...wizard.config.areas, 'review'];
      case 'damage':
        return [...baseSteps, 'damage_location', 'damage_photos', 'damage_details', 'review'];
      case 'service':
        return [...baseSteps, 'service_type', 'documents', 'photos', 'review'];
      default:
        return [...baseSteps, 'photos', 'review'];
    }
  }
  
  async captureVehicleSnapshot() {
    try {
      const vehicleData = await teslaAPI.getVehicleData();
      const location = await this.getCurrentLocation();
      
      return {
        vehicle: {
          id: vehicleData.id,
          vin: vehicleData.vin,
          displayName: vehicleData.display_name,
          model: vehicleData.vehicle_config?.car_type,
          color: vehicleData.vehicle_config?.exterior_color,
          odometer: vehicleData.vehicle_state?.odometer,
          softwareVersion: vehicleData.vehicle_state?.car_version
        },
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: await this.reverseGeocode(location.latitude, location.longitude)
        },
        timestamp: Date.now(),
        batteryLevel: vehicleData.charge_state?.battery_level,
        isCharging: vehicleData.charge_state?.charging_state === 'Charging'
      };
    } catch (error) {
      console.error('Failed to capture vehicle snapshot:', error);
      return null;
    }
  }
  
  generateServiceReport(serviceImages, serviceData) {
    const report = {
      id: `service_report_${Date.now()}`,
      vehicleId: serviceData.vehicleId,
      serviceDate: serviceData.serviceDate,
      serviceCenter: serviceData.serviceCenter,
      workPerformed: serviceData.workPerformed,
      partsReplaced: serviceData.partsReplaced,
      cost: serviceData.cost,
      images: serviceImages.map(img => ({
        id: img.id,
        type: img.metadata.serviceType,
        description: img.description,
        url: img.cloudUrl
      })),
      generated: Date.now()
    };
    
    return this.exportReportAsPDF(report);
  }
  
  async exportReportAsPDF(report) {
    // Create HTML template for PDF generation
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tesla Service Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { border-bottom: 2px solid #E31937; padding-bottom: 20px; margin-bottom: 30px; }
          .tesla-logo { color: #E31937; font-size: 24px; font-weight: bold; }
          .report-title { font-size: 20px; margin-top: 10px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; }
          .detail-row { display: flex; margin-bottom: 8px; }
          .detail-label { font-weight: bold; min-width: 150px; }
          .image-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 15px; }
          .image-item { text-align: center; }
          .image-item img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; }
          .image-caption { font-size: 12px; color: #666; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="tesla-logo">TESLA</div>
          <div class="report-title">Service Documentation Report</div>
        </div>
        
        <div class="section">
          <div class="section-title">Vehicle Information</div>
          <div class="detail-row">
            <span class="detail-label">Vehicle ID:</span>
            <span>${report.vehicleId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Service Date:</span>
            <span>${new Date(report.serviceDate).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Service Center:</span>
            <span>${report.serviceCenter}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Work Performed</div>
          <p>${report.workPerformed}</p>
        </div>
        
        ${report.partsReplaced ? `
        <div class="section">
          <div class="section-title">Parts Replaced</div>
          <p>${report.partsReplaced}</p>
        </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">Documentation Photos</div>
          <div class="image-grid">
            ${report.images.map(img => `
              <div class="image-item">
                <img src="${img.url}" alt="${img.description}">
                <div class="image-caption">${img.description}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Report Generated</div>
          <p>${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    // For Tesla browser compatibility, we'll create a downloadable HTML file
    // In a full implementation, this would use a PDF generation library
    const blob = new Blob([htmlTemplate], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tesla_service_report_${report.id}.html`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    return report;
  }
}
```

### User Interface Design

#### Gallery Interface

```css
.gallery-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-system-background);
}

.gallery-header {
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
  color: white;
  padding: 24px 20px;
  border-radius: 0 0 24px 24px;
}

.gallery-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.gallery-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.action-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.gallery-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.albums-sidebar {
  width: 280px;
  background: var(--color-secondary-system-background);
  border-right: 1px solid var(--color-quaternary-label);
  overflow-y: auto;
}

.albums-list {
  padding: 20px;
}

.album-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: 8px;
}

.album-item:hover {
  background: var(--color-tertiary-system-background);
}

.album-item.active {
  background: var(--color-blue);
  color: white;
}

.album-cover {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--color-quaternary-label);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background-size: cover;
  background-position: center;
}

.album-info {
  flex: 1;
}

.album-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.album-count {
  font-size: 12px;
  opacity: 0.7;
}

.media-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.view-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.view-toggle {
  display: flex;
  background: var(--color-secondary-system-background);
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-secondary-label);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: white;
  color: var(--color-label);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid var(--color-quaternary-label);
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.media-grid {
  display: grid;
  gap: 16px;
}

.media-grid.grid-view {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.media-grid.list-view {
  grid-template-columns: 1fr;
}

.media-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.media-preview {
  position: relative;
  overflow: hidden;
}

.media-grid.grid-view .media-preview {
  aspect-ratio: 1;
}

.media-grid.list-view .media-preview {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.media-info {
  padding: 12px;
}

.media-grid.list-view .media-info {
  flex: 1;
}

.media-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-meta {
  font-size: 12px;
  color: var(--color-secondary-label);
  display: flex;
  align-items: center;
  gap: 8px;
}

.media-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.media-size {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sync-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sync-indicator.synced {
  background: var(--color-green);
}

.sync-indicator.pending {
  background: var(--color-orange);
}

.sync-indicator.error {
  background: var(--color-red);
}

/* Tesla Documentation Wizard */
.documentation-wizard-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wizard-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.wizard-content {
  position: relative;
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wizard-header {
  padding: 24px;
  border-bottom: 1px solid var(--color-quaternary-label);
}

.wizard-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.wizard-progress {
  margin-top: 16px;
  position: relative;
  height: 4px;
  background: var(--color-quaternary-label);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-blue);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 10px;
  right: 0;
  font-size: 12px;
  color: var(--color-secondary-label);
}

.wizard-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.wizard-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--color-quaternary-label);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.wizard-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wizard-btn.primary {
  background: var(--color-blue);
  color: white;
}

.wizard-btn.secondary {
  background: var(--color-secondary-system-background);
  color: var(--color-label);
}
```

## 24. Home Assistant Integration

### Purpose & Overview

Comprehensive smart home integration allowing Tesla dashboard to control and monitor Home Assistant devices, with intelligent automation between vehicle and home systems.

### Core Features

#### Home Assistant Connection Manager

```javascript
class HomeAssistantIntegration {
  constructor() {
    this.connection = null;
    this.connectionState = 'disconnected';
    this.entities = new Map();
    this.automations = new Map();
    this.config = this.loadConfig();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.setupEventHandlers();
  }
  
  loadConfig() {
    return {
      url: localStorage.getItem('ha_url') || '',
      token: localStorage.getItem('ha_token') || '',
      ssl: localStorage.getItem('ha_ssl') === 'true',
      autoConnect: localStorage.getItem('ha_auto_connect') === 'true',
      entities: JSON.parse(localStorage.getItem('ha_entities') || '[]'),
      automations: JSON.parse(localStorage.getItem('ha_automations') || '[]')
    };
  }
  
  async connect(url, token, options = {}) {
    try {
      // Validate URL format
      const homeAssistantUrl = this.validateAndFormatUrl(url);
      
      // Test connection
      const testResponse = await fetch(`${homeAssistantUrl}/api/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!testResponse.ok) {
        throw new Error(`Connection failed: ${testResponse.status} ${testResponse.statusText}`);
      }
      
      const apiInfo = await testResponse.json();
      console.log('Connected to Home Assistant:', apiInfo.version);
      
      // Store configuration
      this.config = {
        url: homeAssistantUrl,
        token: token,
        ssl: homeAssistantUrl.startsWith('https'),
        autoConnect: options.autoConnect || false
      };
      
      this.saveConfig();
      
      // Initialize connection
      await this.initializeConnection();
      
      return { success: true, version: apiInfo.version };
      
    } catch (error) {
      console.error('Home Assistant connection failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  async initializeConnection() {
    // Fetch all entities
    await this.fetchEntities();
    
    // Setup real-time updates (if WebSocket is available)
    this.setupRealtimeUpdates();
    
    // Initialize Tesla integration automations
    await this.initializeTeslaAutomations();
    
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;
    
    this.dispatchEvent('connected', { config: this.config });
  }
  
  async fetchEntities() {
    try {
      const response = await this.makeAPICall('/api/states');
      const entities = await response.json();
      
      this.entities.clear();
      entities.forEach(entity => {
        this.entities.set(entity.entity_id, {
          ...entity,
          last_updated: new Date(entity.last_updated),
          cached_at: Date.now()
        });
      });
      
      this.organizeEntitiesByDomain();
      
    } catch (error) {
      console.error('Failed to fetch entities:', error);
      throw error;
    }
  }
  
  organizeEntitiesByDomain() {
    const domains = {
      lights: [],
      switches: [],
      covers: [], // Garage doors, blinds, etc.
      climate: [],
      locks: [],
      sensors: [],
      cameras: [],
      media_players: [],
      vacuum: [],
      alarm_control_panels: []
    };
    
    this.entities.forEach(entity => {
      const domain = entity.entity_id.split('.')[0];
      if (domains[domain]) {
        domains[domain].push(entity);
      }
    });
    
    this.entitiesByDomain = domains;
    return domains;
  }
  
  async callService(domain, service, entityId, serviceData = {}) {
    try {
      const response = await this.makeAPICall(`/api/services/${domain}/${service}`, {
        method: 'POST',
        body: JSON.stringify({
          entity_id: entityId,
          ...serviceData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Service call failed: ${response.status}`);
      }
      
      // Update local entity state optimistically
      this.updateEntityState(entityId, serviceData);
      
      return { success: true };
      
    } catch (error) {
      console.error('Service call failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  async makeAPICall(endpoint, options = {}) {
    const url = `${this.config.url}${endpoint}`;
    const requestOptions = {
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    return fetch(url, requestOptions);
  }
}
```

#### Tesla-Home Automation System

```javascript
class TeslaHomeAutomation {
  constructor(homeAssistant) {
    this.ha = homeAssistant;
    this.teslaAPI = window.teslaAPI;
    this.automationRules = new Map();
    this.locationService = new LocationService();
    this.initializeDefaultAutomations();
  }
  
  initializeDefaultAutomations() {
    const defaultRules = [
      {
        id: 'arrive_home',
        name: 'Arrive Home',
        description: 'Actions when Tesla arrives home',
        trigger: {
          type: 'location',
          location: 'home',
          event: 'arrive',
          radius: 100 // meters
        },
        conditions: [
          { entity: 'sun.sun', state: 'below_horizon' } // Only at night
        ],
        actions: [
          { service: 'cover.open_cover', entity: 'cover.garage_door' },
          { service: 'light.turn_on', entity: 'light.driveway', brightness: 255 },
          { service: 'light.turn_on', entity: 'light.entrance', brightness: 200 },
          { service: 'climate.set_temperature', entity: 'climate.house', temperature: 72 }
        ],
        enabled: false
      },
      
      {
        id: 'leave_home',
        name: 'Leave Home',
        description: 'Actions when Tesla leaves home',
        trigger: {
          type: 'location',
          location: 'home',
          event: 'leave',
          radius: 200 // meters
        },
        conditions: [
          { entity: 'alarm_control_panel.house', state: 'disarmed' }
        ],
        actions: [
          { service: 'cover.close_cover', entity: 'cover.garage_door' },
          { service: 'light.turn_off', entity: 'group.all_lights' },
          { service: 'climate.set_temperature', entity: 'climate.house', temperature: 68 },
          { service: 'alarm_control_panel.alarm_arm_away', entity: 'alarm_control_panel.house' }
        ],
        enabled: false
      },
      
      {
        id: 'charging_complete',
        name: 'Charging Complete',
        description: 'Actions when Tesla charging completes',
        trigger: {
          type: 'tesla_event',
          event: 'charging_complete'
        },
        conditions: [
          { time: { after: '06:00', before: '22:00' } } // Only during reasonable hours
        ],
        actions: [
          { service: 'notify.mobile_app', message: 'Tesla charging complete' },
          { service: 'light.turn_on', entity: 'light.garage', color: 'green', brightness: 100 }
        ],
        enabled: false
      },
      
      {
        id: 'low_battery_alert',
        name: 'Low Battery Alert',
        description: 'Alert when Tesla battery is low',
        trigger: {
          type: 'tesla_state',
          entity: 'battery_level',
          below: 20
        },
        actions: [
          { service: 'notify.mobile_app', message: 'Tesla battery low - find charging soon' },
          { service: 'light.turn_on', entity: 'light.status_indicator', color: 'red' }
        ],
        enabled: false
      },
      
      {
        id: 'pre_heat_departure',
        name: 'Pre-heat Before Departure',
        description: 'Pre-condition Tesla before scheduled departure',
        trigger: {
          type: 'calendar',
          calendar: 'calendar.personal',
          time_before: 15 // minutes
        },
        conditions: [
          { weather: { condition: 'below', temperature: 40 } } // Only when cold
        ],
        actions: [
          { service: 'tesla.climate_on', entity: 'climate.tesla' },
          { service: 'notify.mobile_app', message: 'Pre-conditioning Tesla for departure' }
        ],
        enabled: false
      }
    ];
    
    defaultRules.forEach(rule => {
      this.automationRules.set(rule.id, rule);
    });
  }
  
  async setupLocationWatcher() {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => this.handleLocationUpdate(position),
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    }
  }
  
  async handleLocationUpdate(position) {
    const currentLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    // Check all location-based automations
    for (const [id, rule] of this.automationRules) {
      if (rule.enabled && rule.trigger.type === 'location') {
        await this.evaluateLocationRule(rule, currentLocation);
      }
    }
  }
  
  async evaluateLocationRule(rule, currentLocation) {
    const homeLocation = this.getHomeLocation();
    if (!homeLocation) return;
    
    const distance = this.calculateDistance(currentLocation, homeLocation);
    const isWithinRadius = distance <= rule.trigger.radius;
    
    const ruleState = this.getRuleState(rule.id);
    
    if (rule.trigger.event === 'arrive' && isWithinRadius && !ruleState.lastTriggered_arrive) {
      await this.executeAutomationActions(rule);
      this.setRuleState(rule.id, { lastTriggered_arrive: Date.now() });
    } else if (rule.trigger.event === 'leave' && !isWithinRadius && ruleState.lastTriggered_arrive) {
      await this.executeAutomationActions(rule);
      this.setRuleState(rule.id, { lastTriggered_arrive: null, lastTriggered_leave: Date.now() });
    }
  }
  
  async executeAutomationActions(rule) {
    console.log(`Executing automation: ${rule.name}`);
    
    // Check conditions first
    if (rule.conditions) {
      const conditionsMet = await this.evaluateConditions(rule.conditions);
      if (!conditionsMet) {
        console.log(`Conditions not met for ${rule.name}`);
        return;
      }
    }
    
    // Execute actions
    for (const action of rule.actions) {
      try {
        await this.executeAction(action);
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay between actions
      } catch (error) {
        console.error(`Failed to execute action:`, error);
      }
    }
  }
  
  async executeAction(action) {
    if (action.service.startsWith('tesla.')) {
      // Tesla-specific action
      await this.executeTeslaAction(action);
    } else {
      // Home Assistant action
      const [domain, service] = action.service.split('.');
      await this.ha.callService(domain, service, action.entity, action);
    }
  }
  
  async executeTeslaAction(action) {
    const service = action.service.replace('tesla.', '');
    
    switch (service) {
      case 'climate_on':
        await this.teslaAPI.executeCommand('start_climate');
        break;
      case 'climate_off':
        await this.teslaAPI.executeCommand('stop_climate');
        break;
      case 'charge_start':
        await this.teslaAPI.executeCommand('start_charging');
        break;
      case 'charge_stop':
        await this.teslaAPI.executeCommand('stop_charging');
        break;
      case 'horn_honk':
        await this.teslaAPI.executeCommand('honk_horn');
        break;
      case 'flash_lights':
        await this.teslaAPI.executeCommand('flash_lights');
        break;
      default:
        console.warn(`Unknown Tesla service: ${service}`);
    }
  }
  
  createCustomAutomation(config) {
    const automation = {
      id: `custom_${Date.now()}`,
      name: config.name,
      description: config.description || '',
      trigger: config.trigger,
      conditions: config.conditions || [],
      actions: config.actions,
      enabled: config.enabled !== false,
      created: Date.now(),
      custom: true
    };
    
    this.automationRules.set(automation.id, automation);
    this.saveAutomations();
    
    return automation;
  }
}
```

### User Interface Design

#### Home Assistant Dashboard

```css
.home-assistant-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-system-background);
}

.ha-header {
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
  color: white;
  padding: 24px 20px;
  border-radius: 0 0 24px 24px;
}

.ha-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.connected {
  background: #27ae60;
}

.status-indicator.disconnected {
  background: #e74c3c;
}

.status-indicator.connecting {
  background: #f39c12;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.ha-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.ha-sidebar {
  width: 280px;
  background: var(--color-secondary-system-background);
  border-right: 1px solid var(--color-quaternary-label);
  overflow-y: auto;
}

.domain-sections {
  padding: 20px;
}

.domain-section {
  margin-bottom: 24px;
}

.domain-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-label);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.domain-icon {
  width: 20px;
  height: 20px;
  opacity: 0.8;
}

.entity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.entity-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.entity-info {
  flex: 1;
}

.entity-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
  color: var(--color-label);
}

.entity-state {
  font-size: 12px;
  color: var(--color-secondary-label);
}

.entity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Toggle Switch for Lights/Switches */
.entity-toggle {
  position: relative;
  width: 40px;
  height: 22px;
  background: var(--color-quaternary-label);
  border-radius: 11px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.entity-toggle.on {
  background: var(--color-green);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.entity-toggle.on .toggle-slider {
  transform: translateX(18px);
}

/* Brightness/Temperature Sliders */
.entity-slider {
  width: 80px;
  height: 4px;
  background: var(--color-quaternary-label);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.entity-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-blue);
  border-radius: 50%;
  cursor: pointer;
}

/* Cover Controls */
.cover-controls {
  display: flex;
  gap: 4px;
}

.cover-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: var(--color-secondary-system-background);
  color: var(--color-secondary-label);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cover-btn:hover {
  background: var(--color-blue);
  color: white;
}

.ha-main-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.quick-action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.action-icon.lights {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.action-icon.security {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.action-icon.climate {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.action-icon.garage {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.action-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.action-description {
  font-size: 12px;
  color: var(--color-secondary-label);
}

.automation-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-label);
}

.add-automation-btn {
  padding: 8px 16px;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.automation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.automation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-secondary-system-background);
  border-radius: 12px;
  transition: background 0.2s ease;
}

.automation-item:hover {
  background: var(--color-tertiary-system-background);
}

.automation-info {
  flex: 1;
}

.automation-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.automation-description {
  font-size: 14px;
  color: var(--color-secondary-label);
}

.automation-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.automation-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.automation-status.enabled {
  background: rgba(52, 199, 89, 0.1);
  color: var(--color-green);
}

.automation-status.disabled {
  background: rgba(142, 142, 147, 0.1);
  color: var(--color-secondary-label);
}

/* Connection Setup Modal */
.ha-connection-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.connection-form {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
}

.form-description {
  text-align: center;
  color: var(--color-secondary-label);
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-label);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-quaternary-label);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-blue);
}

.form-help {
  font-size: 12px;
  color: var(--color-secondary-label);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.form-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-btn.primary {
  background: var(--color-blue);
  color: white;
}

.form-btn.secondary {
  background: var(--color-secondary-system-background);
  color: var(--color-label);
}
```

#### Automation Builder Interface

```javascript
class AutomationBuilder {
  constructor(homeAssistant) {
    this.ha = homeAssistant;
    this.currentAutomation = null;
    this.availableEntities = [];
    this.availableServices = [];
  }
  
  openBuilder(automationId = null) {
    if (automationId) {
      this.currentAutomation = this.ha.getAutomation(automationId);
    } else {
      this.currentAutomation = this.createEmptyAutomation();
    }
    
    const modal = this.createBuilderModal();
    document.body.appendChild(modal);
  }
  
  createBuilderModal() {
    const modal = document.createElement('div');
    modal.className = 'automation-builder-modal';
    modal.innerHTML = `
      <div class="builder-overlay"></div>
      <div class="builder-content">
        <div class="builder-header">
          <h2>${this.currentAutomation.id ? 'Edit' : 'Create'} Automation</h2>
          <button class="close-btn" onclick="this.remove()">×</button>
        </div>
        
        <div class="builder-body">
          <div class="builder-section">
            <h3>Basic Information</h3>
            <div class="form-group">
              <label>Name</label>
              <input type="text" class="automation-name" value="${this.currentAutomation.name}" placeholder="Automation name">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="automation-description" placeholder="What does this automation do?">${this.currentAutomation.description || ''}</textarea>
            </div>
          </div>
          
          <div class="builder-section">
            <h3>Trigger</h3>
            <div class="trigger-builder">
              ${this.renderTriggerBuilder()}
            </div>
          </div>
          
          <div class="builder-section">
            <h3>Conditions (Optional)</h3>
            <div class="conditions-builder">
              ${this.renderConditionsBuilder()}
            </div>
          </div>
          
          <div class="builder-section">
            <h3>Actions</h3>
            <div class="actions-builder">
              ${this.renderActionsBuilder()}
            </div>
          </div>
        </div>
        
        <div class="builder-footer">
          <button class="test-automation-btn">Test Automation</button>
          <button class="save-automation-btn">Save Automation</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;
    
    this.setupBuilderHandlers(modal);
    return modal;
  }
  
  renderTriggerBuilder() {
    const triggerTypes = [
      { value: 'tesla_event', label: 'Tesla Event', description: 'When something happens with your Tesla' },
      { value: 'location', label: 'Location', description: 'When Tesla enters/leaves a location' },
      { value: 'time', label: 'Time', description: 'At a specific time or interval' },
      { value: 'entity_state', label: 'Entity State', description: 'When a Home Assistant entity changes' },
      { value: 'calendar', label: 'Calendar', description: 'Based on calendar events' }
    ];
    
    return `
      <div class="trigger-type-selector">
        <select class="trigger-type">
          <option value="">Select trigger type...</option>
          ${triggerTypes.map(type => `
            <option value="${type.value}" ${this.currentAutomation.trigger?.type === type.value ? 'selected' : ''}>
              ${type.label}
            </option>
          `).join('')}
        </select>
      </div>
      
      <div class="trigger-config">
        ${this.renderTriggerConfig()}
      </div>
    `;
  }
  
  renderTriggerConfig() {
    if (!this.currentAutomation.trigger?.type) {
      return '<p class="config-placeholder">Select a trigger type to configure</p>';
    }
    
    switch (this.currentAutomation.trigger.type) {
      case 'tesla_event':
        return this.renderTeslaEventConfig();
      case 'location':
        return this.renderLocationConfig();
      case 'time':
        return this.renderTimeConfig();
      case 'entity_state':
        return this.renderEntityStateConfig();
      default:
        return '<p class="config-placeholder">Configuration for this trigger type coming soon</p>';
    }
  }
  
  renderTeslaEventConfig() {
    const teslaEvents = [
      { value: 'charging_started', label: 'Charging Started' },
      { value: 'charging_complete', label: 'Charging Complete' },
      { value: 'low_battery', label: 'Low Battery (< 20%)' },
      { value: 'climate_started', label: 'Climate Pre-conditioning Started' },
      { value: 'doors_locked', label: 'Doors Locked' },
      { value: 'doors_unlocked', label: 'Doors Unlocked' }
    ];
    
    return `
      <div class="config-group">
        <label>Tesla Event</label>
        <select class="tesla-event">
          ${teslaEvents.map(event => `
            <option value="${event.value}" ${this.currentAutomation.trigger?.event === event.value ? 'selected' : ''}>
              ${event.label}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }
  
  renderLocationConfig() {
    return `
      <div class="config-group">
        <label>Location Event</label>
        <select class="location-event">
          <option value="arrive" ${this.currentAutomation.trigger?.event === 'arrive' ? 'selected' : ''}>Arrive</option>
          <option value="leave" ${this.currentAutomation.trigger?.event === 'leave' ? 'selected' : ''}>Leave</option>
        </select>
      </div>
      
      <div class="config-group">
        <label>Location</label>
        <select class="location-preset">
          <option value="home" ${this.currentAutomation.trigger?.location === 'home' ? 'selected' : ''}>Home</option>
          <option value="work" ${this.currentAutomation.trigger?.location === 'work' ? 'selected' : ''}>Work</option>
          <option value="custom">Custom Location...</option>
        </select>
      </div>
      
      <div class="config-group">
        <label>Radius (meters)</label>
        <input type="number" class="location-radius" value="${this.currentAutomation.trigger?.radius || 100}" min="10" max="1000">
      </div>
    `;
  }
}
```

## 25. Crypto Tracker Pro

### Purpose & Overview

Advanced cryptocurrency portfolio tracking with real-time prices, portfolio management, Tesla payment integration, and market analysis features.

### Core Features

#### Cryptocurrency Data Engine

```javascript
class CryptoDataEngine {
  constructor() {
    this.apiEndpoint = 'https://api.coingecko.com/api/v3';
    this.supportedCoins = new Map();
    this.portfolio = new Map();
    this.priceAlerts = new Map();
    this.marketData = new Map();
    this.updateInterval = 30000; // 30 seconds
    this.rateLimiter = new RateLimiter(100, 60000); // 100 calls per minute
    
    this.initializeSupportedCoins();
    this.loadPortfolio();
    this.startPriceUpdates();
  }
  
  initializeSupportedCoins() {
    const featuredCoins = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', featured: true },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', featured: true },
      { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', featured: true, tesla: true }, // Tesla accepts DOGE
      { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', featured: true },
      { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash', featured: true },
      { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', featured: true },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', featured: true },
      { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', featured: true },
      { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', featured: true },
      { id: 'solana', symbol: 'SOL', name: 'Solana', featured: true }
    ];
    
    featuredCoins.forEach(coin => {
      this.supportedCoins.set(coin.id, {
        ...coin,
        currentPrice: null,
        priceChange24h: null,
        marketCap: null,
        volume24h: null,
        lastUpdated: null
      });
    });
  }
  
  async fetchCoinPrices(coinIds = null) {
    try {
      if (!this.rateLimiter.canMakeRequest()) {
        console.warn('Rate limit exceeded, using cached data');
        return false;
      }
      
      const ids = coinIds || Array.from(this.supportedCoins.keys()).join(',');
      const url = `${this.apiEndpoint}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      this.updatePriceData(data);
      
      return true;
    } catch (error) {
      console.error('Failed to fetch coin prices:', error);
      return false;
    }
  }
  
  updatePriceData(apiData) {
    Object.entries(apiData).forEach(([coinId, priceData]) => {
      if (this.supportedCoins.has(coinId)) {
        const coin = this.supportedCoins.get(coinId);
        
        const oldPrice = coin.currentPrice;
        coin.currentPrice = priceData.usd;
        coin.priceChange24h = priceData.usd_24h_change;
        coin.marketCap = priceData.usd_market_cap;
        coin.volume24h = priceData.usd_24h_vol;
        coin.lastUpdated = Date.now();
        
        // Check price alerts
        if (oldPrice && oldPrice !== coin.currentPrice) {
          this.checkPriceAlerts(coinId, oldPrice, coin.currentPrice);
        }
        
        this.supportedCoins.set(coinId, coin);
      }
    });
    
    this.updatePortfolioValues();
    this.dispatchPriceUpdate();
  }
  
  addToPortfolio(coinId, amount, averagePrice, notes = '') {
    const coin = this.supportedCoins.get(coinId);
    if (!coin) {
      throw new Error('Unsupported cryptocurrency');
    }
    
    const holding = {
      id: `holding_${Date.now()}`,
      coinId,
      amount: parseFloat(amount),
      averagePrice: parseFloat(averagePrice),
      totalInvested: parseFloat(amount) * parseFloat(averagePrice),
      notes,
      dateAdded: Date.now(),
      transactions: [{
        type: 'buy',
        amount: parseFloat(amount),
        price: parseFloat(averagePrice),
        date: Date.now(),
        notes
      }]
    };
    
    this.portfolio.set(holding.id, holding);
    this.savePortfolio();
    this.updatePortfolioValues();
    
    return holding;
  }
  
  updatePortfolioValues() {
    let totalValue = 0;
    let totalInvested = 0;
    
    this.portfolio.forEach(holding => {
      const coin = this.supportedCoins.get(holding.coinId);
      if (coin && coin.currentPrice) {
        holding.currentValue = holding.amount * coin.currentPrice;
        holding.profitLoss = holding.currentValue - holding.totalInvested;
        holding.profitLossPercent = (holding.profitLoss / holding.totalInvested) * 100;
        
        totalValue += holding.currentValue;
        totalInvested += holding.totalInvested;
      }
    });
    
    this.portfolioSummary = {
      totalValue,
      totalInvested,
      totalProfitLoss: totalValue - totalInvested,
      totalProfitLossPercent: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0,
      lastUpdated: Date.now()
    };
  }
  
  createPriceAlert(coinId, targetPrice, direction, enabled = true) {
    const alert = {
      id: `alert_${Date.now()}`,
      coinId,
      targetPrice: parseFloat(targetPrice),
      direction, // 'above' or 'below'
      enabled,
      created: Date.now(),
      triggered: false
    };
    
    this.priceAlerts.set(alert.id, alert);
    this.savePriceAlerts();
    
    return alert;
  }
  
  checkPriceAlerts(coinId, oldPrice, newPrice) {
    this.priceAlerts.forEach(alert => {
      if (alert.coinId === coinId && alert.enabled && !alert.triggered) {
        const shouldTrigger = 
          (alert.direction === 'above' && oldPrice <= alert.targetPrice && newPrice > alert.targetPrice) ||
          (alert.direction === 'below' && oldPrice >= alert.targetPrice && newPrice < alert.targetPrice);
        
        if (shouldTrigger) {
          this.triggerPriceAlert(alert, newPrice);
        }
      }
    });
  }
  
  triggerPriceAlert(alert, currentPrice) {
    alert.triggered = true;
    alert.triggeredAt = Date.now();
    alert.triggeredPrice = currentPrice;
    
    const coin = this.supportedCoins.get(alert.coinId);
    const message = `${coin.symbol} has ${alert.direction === 'above' ? 'risen above' : 'fallen below'} ${alert.targetPrice.toFixed(2)}. Current price: ${currentPrice.toFixed(2)}`;
    
    this.showPriceAlertNotification(coin.name, message);
    this.priceAlerts.set(alert.id, alert);
    this.savePriceAlerts();
  }
  
  async fetchMarketTrends() {
    try {
      const url = `${this.apiEndpoint}/global`;
      const response = await fetch(url);
      const data = await response.json();
      
      this.marketData.set('global', {
        totalMarketCap: data.data.total_market_cap.usd,
        totalVolume: data.data.total_volume.usd,
        btcDominance: data.data.market_cap_percentage.bitcoin,
        ethDominance: data.data.market_cap_percentage.ethereum,
        lastUpdated: Date.now()
      });
      
      return this.marketData.get('global');
    } catch (error) {
      console.error('Failed to fetch market trends:', error);
      return null;
    }
  }
}
```

### Tesla Integration Features

#### Tesla Payment Integration

```javascript
class TeslaCryptoIntegration {
  constructor() {
    this.teslaAcceptedCoins = ['dogecoin']; // Tesla currently accepts DOGE
    this.paymentProcessor = new CryptoPaymentProcessor();
    this.dashboardSubscriptions = new Map();
  }
  
  async processTeslaPayment(planType, cryptoCurrency) {
    if (!this.teslaAcceptedCoins.includes(cryptoCurrency)) {
      throw new Error(`Tesla does not currently accept ${cryptoCurrency}. Supported: ${this.teslaAcceptedCoins.join(', ')}`);
    }
    
    const planPrices = {
      'starter': 9.99,
      'pro': 24.99,
      'fleet': 99.99
    };
    
    const usdAmount = planPrices[planType];
    if (!usdAmount) {
      throw new Error('Invalid plan type');
    }
    
    try {
      // Get current crypto price
      const cryptoPrice = await this.getCryptoPriceUSD(cryptoCurrency);
      const cryptoAmount = usdAmount / cryptoPrice;
      
      // Create payment request
      const paymentRequest = {
        id: `tesla_payment_${Date.now()}`,
        planType,
        cryptoCurrency,
        usdAmount,
        cryptoAmount,
        cryptoPrice,
        expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
        status: 'pending'
      };
      
      // Generate payment address (in real implementation, this would use a proper crypto payment processor)
      paymentRequest.paymentAddress = this.generatePaymentAddress(cryptoCurrency);
      paymentRequest.qrCode = await this.generateQRCode(paymentRequest);
      
      this.dashboardSubscriptions.set(paymentRequest.id, paymentRequest);
      
      return paymentRequest;
      
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }
  
  async getCryptoPriceUSD(cryptoCurrency) {
    const coinMap = {
      'dogecoin': 'dogecoin',
      'bitcoin': 'bitcoin',
      'ethereum': 'ethereum'
    };
    
    const coinId = coinMap[cryptoCurrency];
    if (!coinId) {
      throw new Error('Unsupported cryptocurrency');
    }
    
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
      const data = await response.json();
      return data[coinId].usd;
    } catch (error) {
      throw new Error('Failed to fetch crypto price');
    }
  }
  
  generatePaymentAddress(cryptoCurrency) {
    // In a real implementation, this would generate a unique address for each payment
    const sampleAddresses = {
      'dogecoin': 'DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L',
      'bitcoin': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      'ethereum': '0x742d35Cc6634C0532925a3b8D4ab62b7e9BceF85'
    };
    
    return sampleAddresses[cryptoCurrency] || 'ADDRESS_GENERATION_ERROR';
  }
  
  async generateQRCode(paymentRequest) {
    const qrData = `${paymentRequest.cryptoCurrency}:${paymentRequest.paymentAddress}?amount=${paymentRequest.cryptoAmount}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  }
  
  trackEnergyConsumption() {
    // Compare Bitcoin mining energy consumption vs Tesla efficiency
    const bitcoinEnergyPerTransaction = 741; // kWh (approximate)
    const teslaEfficency = 0.25; // kWh per mile (Model 3)
    const milesPerBitcoinTransaction = bitcoinEnergyPerTransaction / teslaEfficency;
    
    return {
      bitcoinTransactionEnergy: bitcoinEnergyPerTransaction,
      teslaEquivalentMiles: milesPerBitcoinTransaction,
      comparison: `One Bitcoin transaction uses enough energy to drive a Tesla ${Math.round(milesPerBitcoinTransaction)} miles`,
      source: 'Digiconomist Bitcoin Energy Consumption Index'
    };
  }
}
```

### User Interface Design

#### Crypto Tracker Interface

```css
.crypto-tracker-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-system-background);
}

.crypto-header {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  padding: 24px 20px;
  border-radius: 0 0 24px 24px;
}

.crypto-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.market-summary {
  display: flex;
  gap: 24px;
  font-size: 14px;
  opacity: 0.9;
}

.market-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-weight: 600;
}

.crypto-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.crypto-sidebar {
  width: 280px;
  background: var(--color-secondary-system-background);
  border-right: 1px solid var(--color-quaternary-label);
  overflow-y: auto;
}

.sidebar-section {
  padding: 20px;
  border-bottom: 1px solid var(--color-quaternary-label);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-label);
}

.portfolio-summary {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.portfolio-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.portfolio-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.portfolio-change.positive {
  color: var(--color-green);
}

.portfolio-change.negative {
  color: var(--color-red);
}

.change-arrow {
  font-size: 12px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 10px 16px;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: var(--color-blue-dark);
}

.action-btn.secondary {
  background: var(--color-secondary-system-background);
  color: var(--color-label);
}

.crypto-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.main-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-quaternary-label);
  padding-bottom: 16px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: transparent;
  color: var(--color-secondary-label);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--color-blue);
  color: white;
}

.prices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.coin-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.coin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.coin-card.tesla-coin::before {
  content: '⚡';
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 16px;
}

.coin-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.coin-icon {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
}

.coin-info {
  flex: 1;
}

.coin-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.coin-symbol {
  font-size: 12px;
  color: var(--color-secondary-label);
  text-transform: uppercase;
}

.coin-price {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.coin-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.coin-change.positive {
  color: var(--color-green);
}

.coin-change.negative {
  color: var(--color-red);
}

.coin-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-quaternary-label);
}

.coin-stat {
  text-align: center;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: var(--color-secondary-label);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.portfolio-holdings {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.holdings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.holdings-table {
  width: 100%;
  border-collapse: collapse;
}

.holdings-table th {
  text-align: left;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-quaternary-label);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-secondary-label);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.holdings-table td {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-quaternary-label);
}

.holding-coin {
  display: flex;
  align-items: center;
  gap: 12px;
}

.holding-icon {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: var(--color-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.holding-info {
  display: flex;
  flex-direction: column;
}

.holding-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.holding-amount {
  font-size: 12px;
  color: var(--color-secondary-label);
}

.holding-value {
  font-weight: 600;
}

.holding-change {
  font-weight: 600;
  text-align: right;
}

.holding-change.positive {
  color: var(--color-green);
}

.holding-change.negative {
  color: var(--color-red);
}

/* Tesla Payment Modal */
.tesla-payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.payment-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  text-align: center;
}

.payment-header {
  margin-bottom: 24px;
}

.tesla-logo {
  font-size: 24px;
  font-weight: 700;
  color: #E31937;
  margin-bottom: 8px;
}

.payment-details {
  background: var(--color-secondary-system-background);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.payment-amount {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.payment-conversion {
  font-size: 14px;
  color: var(--color-secondary-label);
}

.payment-address {
  background: white;
  border: 1px solid var(--color-quaternary-label);
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}

.qr-code {
  margin: 20px 0;
}

.qr-code img {
  border-radius: 8px;
}

.payment-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--color-orange);
  font-weight: 600;
}

.payment-status {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
}

.payment-status.pending {
  background: rgba(255, 149, 0, 0.1);
  color: var(--color-orange);
}

.payment-status.confirmed {
  background: rgba(52, 199, 89, 0.1);
  color: var(--color-green);
}

.energy-comparison {
  background: var(--color-secondary-system-background);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  text-align: left;
}

.comparison-title {
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comparison-text {
  font-size: 14px;
  color: var(--color-secondary-label);
  line-height: 1.4;
}
```

## 26. Camera & Mirror

### Purpose & Overview

Front-facing camera access for mirror functionality, documentation purposes, and basic video communication when vehicle is parked.

### Core Features

#### Camera Access Manager

```javascript
class CameraManager {
  constructor() {
    this.stream = null;
    this.isActive = false;
    this.mirrorMode = true;
    this.captureHistory = [];
    this.videoElement = null;
    this.canvasElement = null;
    this.constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user' // Front-facing camera
      },
      audio: false // No audio for privacy
    };
    
    this.setupSafetyChecks();
  }
  
  setupSafetyChecks() {
    // Tesla safety: Only allow camera when parked
    this.vehicleStateWatcher = setInterval(async () => {
      if (this.isActive) {
        try {
          const vehicleState = await teslaAPI.getVehicleState();
          if (vehicleState.shift_state !== 'P') {
            console.log('Vehicle not in park - disabling camera for safety');
            await this.stopCamera();
            this.showSafetyMessage('Camera disabled - vehicle must be in park');
          }
        } catch (error) {
          console.warn('Could not verify vehicle state:', error);
        }
      }
    }, 5000); // Check every 5 seconds
  }
  
  async requestCameraAccess() {
    try {
      // Check if vehicle is parked first
      const vehicleState = await teslaAPI.getVehicleState();
      if (vehicleState.shift_state !== 'P') {
        throw new Error('Camera only available when vehicle is parked');
      }
      
      // Request camera permission
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      
      // Setup video element
      this.setupVideoElement();
      
      this.isActive = true;
      this.trackCameraUsage('camera_started');
      
      return { success: true, stream: this.stream };
      
    } catch (error) {
      console.error('Camera access failed:', error);
      
      let userMessage = 'Camera access failed';
      if (error.name === 'NotAllowedError') {
        userMessage = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (error.name === 'NotFoundError') {
        userMessage = 'No camera found on this device.';
      } else if (error.message.includes('parked')) {
        userMessage = error.message;
      }
      
      return { success: false, error: userMessage };
    }
  }
  
  setupVideoElement() {
    if (!this.videoElement) {
      this.videoElement = document.createElement('video');
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
    }
    
    this.videoElement.srcObject = this.stream;
    
    // Mirror effect for front-facing camera
    if (this.mirrorMode) {
      this.videoElement.style.transform = 'scaleX(-1)';
    }
  }
  
  async capturePhoto(options = {}) {
    if (!this.isActive || !this.stream) {
      throw new Error('Camera not active');
    }
    
    try {
      // Create canvas for capture
      if (!this.canvasElement) {
        this.canvasElement = document.createElement('canvas');
      }
      
      const video = this.videoElement;
      const canvas = this.canvasElement;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Apply mirror effect if enabled
      if (this.mirrorMode) {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // Add timestamp overlay if requested
      if (options.includeTimestamp) {
        this.addTimestampOverlay(ctx, canvas);
      }
      
      // Add Tesla metadata overlay if requested
      if (options.includeTeslaData) {
        await this.addTeslaMetadataOverlay(ctx, canvas);
      }
      
      // Convert to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });
      
      // Create capture record
      const capture = {
        id: `capture_${Date.now()}`,
        blob,
        dataUrl: canvas.toDataURL('image/jpeg', 0.9),
        timestamp: Date.now(),
        metadata: await this.generateCaptureMetadata(),
        options
      };
      
      this.captureHistory.push(capture);
      this.trackCameraUsage('photo_captured');
      
      return capture;
      
    } catch (error) {
      console.error('Photo capture failed:', error);
      throw new Error('Failed to capture photo');
    }
  }
  
  addTimestampOverlay(ctx, canvas) {
    const timestamp = new Date().toLocaleString();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 200, canvas.height - 40, 190, 30);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(timestamp, canvas.width - 10, canvas.height - 20);
  }
  
  async addTeslaMetadataOverlay(ctx, canvas) {
    try {
      const vehicleData = await teslaAPI.getVehicleData();
      const metadata = [
        `${vehicleData.display_name}`,
        `${vehicleData.vehicle_state.odometer.toFixed(0)} miles`,
        `${vehicleData.charge_state.battery_level}% charge`
      ];
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 180, 80);
      
      // Tesla logo
      ctx.fillStyle = '#E31937';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('TESLA', 20, 30);
      
      // Metadata
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      metadata.forEach((text, index) => {
        ctx.fillText(text, 20, 50 + (index * 15));
      });
    } catch (error) {
      console.warn('Failed to add Tesla metadata overlay:', error);
    }
  }
  
  async generateCaptureMetadata() {
    const metadata = {
      resolution: {
        width: this.canvasElement?.width || 0,
        height: this.canvasElement?.height || 0
      },
      timestamp: Date.now(),
      mirrorMode: this.mirrorMode
    };
    
    // Add Tesla data if available
    try {
      const vehicleData = await teslaAPI.getVehicleData();
      metadata.tesla = {
        vehicleId: vehicleData.id,
        displayName: vehicleData.display_name,
        odometer: vehicleData.vehicle_state?.odometer,
        batteryLevel: vehicleData.charge_state?.battery_level,
        location: vehicleData.drive_state?.latitude ? {
          latitude: vehicleData.drive_state.latitude,
          longitude: vehicleData.drive_state.longitude
        } : null
      };
    } catch (error) {
      console.warn('Could not add Tesla metadata:', error);
    }
    
    // Add location if available
    try {
      const position = await this.getCurrentLocation();
      metadata.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (error) {
      console.warn('Could not add location metadata:', error);
    }
    
    return metadata;
  }
  
  async stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    
    this.isActive = false;
    this.trackCameraUsage('camera_stopped');
  }
  
  toggleMirrorMode() {
    this.mirrorMode = !this.mirrorMode;
    
    if (this.videoElement) {
      this.videoElement.style.transform = this.mirrorMode ? 'scaleX(-1)' : 'none';
    }
    
    this.trackCameraUsage('mirror_toggled', { mirrorMode: this.mirrorMode });
  }
  
  adjustCameraSettings(settings) {
    if (!this.stream) return;
    
    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) return;
    
    const capabilities = videoTrack.getCapabilities();
    const constraints = {};
    
    // Apply brightness if supported
    if (settings.brightness && capabilities.brightness) {
      constraints.brightness = Math.max(
        capabilities.brightness.min,
        Math.min(capabilities.brightness.max, settings.brightness)
      );
    }
    
    // Apply contrast if supported
    if (settings.contrast && capabilities.contrast) {
      constraints.contrast = Math.max(
        capabilities.contrast.min,
        Math.min(capabilities.contrast.max, settings.contrast)
      );
    }
    
    if (Object.keys(constraints).length > 0) {
      videoTrack.applyConstraints({ advanced: [constraints] })
        .catch(error => console.warn('Failed to apply camera constraints:', error));
    }
  }
  
  exportCaptures() {
    const exportData = {
      version: '1.0.0',
      exported: Date.now(),
      captures: this.captureHistory.map(capture => ({
        id: capture.id,
        timestamp: capture.timestamp,
        metadata: capture.metadata,
        options: capture.options,
        // Note: blob data would need special handling for export
        hasImage: !!capture.blob
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tesla_camera_export_${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }
  
  trackCameraUsage(action, metadata = {}) {
    if (window.analytics) {
      window.analytics.trackEvent('camera', action, null, null, {
        ...metadata,
        timestamp: Date.now(),
        vehicleParked: true // Only available when parked
      });
    }
  }
}
```

### User Interface Design

#### Camera Interface

```css
.camera-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000000;
  color: white;
  position: relative;
}

.camera-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  padding: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.camera-title {
  font-size: 20px;
  font-weight: 600;
}

.camera-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e74c3c;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.camera-viewport {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}

.camera-video.mirror {
  transform: scaleX(-1);
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.placeholder-text {
  font-size: 18px;
  font-weight: 500;
}

.placeholder-subtext {
  font-size: 14px;
  opacity: 0.8;
  max-width: 300px;
  line-height: 1.4;
}

.camera-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 50;
}

.overlay-info {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 12px;
  text-align: center;
  min-width: 120px;
}

.overlay-time {
  font-weight: 600;
  margin-bottom: 4px;
}

.overlay-details {
  opacity: 0.8;
  line-height: 1.3;
}

.camera-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  padding: 40px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.camera-btn {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.camera-btn:active {
  transform: scale(0.95);
}

.camera-btn.primary {
  background: white;
  color: #000000;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
}

.camera-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.camera-btn:hover {
  transform: scale(1.05);
}

.camera-btn.capture {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: #e74c3c;
  color: white;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.camera-btn.capture:hover {
  background: #c0392b;
  border-color: rgba(255, 255, 255, 0.5);
}

.settings-panel {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.settings-panel.visible {
  opacity: 1;
  visibility: visible;
}

.settings-group {
  margin-bottom: 20px;
}

.settings-group:last-child {
  margin-bottom: 0;
}

.settings-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
}

.settings-slider {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.settings-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.settings-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  transition: background 0.2s ease;
}

.toggle-switch.enabled {
  background: #27ae60;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-switch.enabled .toggle-slider {
  transform: translateX(20px);
}

.capture-preview {
  position: absolute;
  bottom: 100px;
  left: 20px;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  transform: scale(0.8);
}

.capture-preview.visible {
  opacity: 1;
  transform: scale(1);
}

.capture-preview:hover {
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.capture-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  color: white;
  border-radius: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

/* Safety Warning */
.safety-warning {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #e74c3c;
  color: white;
  padding: 24px 32px;
  border-radius: 16px;
  text-align: center;
  max-width: 400px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.warning-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.warning-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.warning-message {
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.9;
}

/* Gallery Modal */
.camera-gallery-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  z-index: 2000;
}

.gallery-header {
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.gallery-title {
  font-size: 20px;
  font-weight: 600;
}

.gallery-actions {
  display: flex;
  gap: 12px;
}

.gallery-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.gallery-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.gallery-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.gallery-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  padding: 12px 8px 8px;
  color: white;
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.gallery-item:hover .gallery-item-overlay {
  opacity: 1;
}
```

#### Tesla Documentation Integration

```javascript
class TeslaCameraDocumentation {
  constructor(cameraManager) {
    this.camera = cameraManager;
    this.documentationTypes = {
      service_visit: {
        name: 'Service Visit Documentation',
        photos: ['before_service', 'issue_detail', 'after_service'],
        metadata: ['service_center', 'work_order', 'technician']
      },
      accident_report: {
        name: 'Accident Documentation',
        photos: ['overview', 'damage_detail', 'other_vehicles', 'scene'],
        metadata: ['location', 'time', 'other_parties', 'police_report']
      },
      delivery_inspection: {
        name: 'Delivery Inspection',
        photos: ['exterior_front', 'exterior_rear', 'exterior_sides', 'interior', 'trunk', 'frunk'],
        metadata: ['delivery_date', 'delivery_specialist', 'vin_verification']
      },
      modification_install: {
        name: 'Modification Installation',
        photos: ['before_install', 'during_install', 'after_install'],
        metadata: ['modification_type', 'installer', 'warranty_info']
      }
    };
  }
  
  async startDocumentation(type) {
    const docType = this.documentationTypes[type];
    if (!docType) {
      throw new Error('Unknown documentation type');
    }
    
    const session = {
      id: `doc_${Date.now()}`,
      type,
      name: docType.name,
      started: Date.now(),
      photos: [],
      metadata: {},
      completed: false
    };
    
    // Start camera if not already active
    if (!this.camera.isActive) {
      const result = await this.camera.requestCameraAccess();
      if (!result.success) {
        throw new Error(result.error);
      }
    }
    
    // Show documentation UI
    this.showDocumentationInterface(session);
    
    return session;
  }
  
  async captureDocumentationPhoto(session, photoType, description = '') {
    try {
      const capture = await this.camera.capturePhoto({
        includeTimestamp: true,
        includeTeslaData: true
      });
      
      const docPhoto = {
        ...capture,
        photoType,
        description,
        sessionId: session.id,
        sequenceNumber: session.photos.length + 1
      };
      
      session.photos.push(docPhoto);
      
      // Auto-save session
      this.saveDocumentationSession(session);
      
      return docPhoto;
    } catch (error) {
      throw new Error(`Failed to capture documentation photo: ${error.message}`);
    }
  }
  
  async generateDocumentationReport(session) {
    const report = {
      id: `report_${session.id}`,
      type: session.type,
      name: session.name,
      created: Date.now(),
      session: session,
      vehicleInfo: await this.getVehicleInfo(),
      summary: this.generatePhotoSummary(session.photos),
      exportUrl: null
    };
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    
    // Create downloadable file
    const blob = new Blob([htmlReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    report.exportUrl = url;
    
    return report;
  }
  
  generateHTMLReport(report) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tesla ${report.name} - ${new Date(report.created).toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { border-bottom: 3px solid #E31937; padding-bottom: 20px; margin-bottom: 30px; }
          .tesla-logo { color: #E31937; font-size: 28px; font-weight: bold; letter-spacing: 2px; }
          .report-title { font-size: 24px; margin: 10px 0; color: #333; }
          .meta-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .meta-row { display: flex; margin-bottom: 8px; }
          .meta-label { font-weight: bold; min-width: 150px; color: #666; }
          .photos-section { margin-top: 30px; }
          .photos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
          .photo-item { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; }
          .photo-image { width: 100%; height: 200px; object-fit: cover; }
          .photo-info { padding: 15px; }
          .photo-title { font-weight: bold; margin-bottom: 5px; }
          .photo-description { color: #666; font-size: 14px; line-height: 1.4; }
          .photo-meta { font-size: 12px; color: #999; margin-top: 10px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="tesla-logo">TESLA</div>
            <div class="report-title">${report.name}</div>
            <div style="color: #666;">Documentation Report</div>
          </div>
          
          <div class="meta-info">
            <div class="meta-row">
              <span class="meta-label">Date:</span>
              <span>${new Date(report.created).toLocaleString()}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Vehicle:</span>
              <span>${report.vehicleInfo.displayName} (${report.vehicleInfo.vin})</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Odometer:</span>
              <span>${report.vehicleInfo.odometer} miles</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Photos:</span>
              <span>${report.session.photos.length} images captured</span>
            </div>
          </div>
          
          <div class="photos-section">
            <h3>Documentation Photos</h3>
            <div class="photos-grid">
              ${report.session.photos.map(photo => `
                <div class="photo-item">
                  <img src="${photo.dataUrl}" alt="${photo.description}" class="photo-image">
                  <div class="photo-info">
                    <div class="photo-title">${photo.photoType.replace('_', ' ').toUpperCase()}</div>
                    <div class="photo-description">${photo.description || 'No description provided'}</div>
                    <div class="photo-meta">
                      Captured: ${new Date(photo.timestamp).toLocaleString()}<br>
                      Sequence: ${photo.sequenceNumber} of ${report.session.photos.length}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="footer">
            Generated by Tesla Dashboard Pro Camera System<br>
            Report ID: ${report.id}
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
```

This completes the Advanced Feature Apps section with all 6 sophisticated applications that provide comprehensive functionality for Tesla owners. Each app is designed with Tesla's unique environment in mind, offering both practical utility and enhanced user experience within the dashboard ecosystem.