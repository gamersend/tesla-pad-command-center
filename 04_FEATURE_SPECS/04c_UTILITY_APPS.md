# 🔧 Utility Apps (8 Apps)

## 13. Search Engine Hub

### Purpose & Overview

Multi-engine search interface optimized for Tesla's touchscreen with intelligent result filtering and Tesla-specific search categories.

### Core Features

#### Multi-Engine Support

```javascript
class SearchEngineManager {
  constructor() {
    this.engines = {
      google: {
        name: 'Google',
        url: 'https://www.google.com/search',
        params: { q: '{query}', safe: 'strict' },
        features: ['web', 'images', 'maps', 'shopping']
      },
      duckduckgo: {
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/',
        params: { q: '{query}', kp: '1' }, // Strict safe search
        features: ['web', 'images', 'privacy']
      },
      brave: {
        name: 'Brave Search',
        url: 'https://search.brave.com/search',
        params: { q: '{query}', safesearch: 'strict' },
        features: ['web', 'ad_free']
      },
      bing: {
        name: 'Bing',
        url: 'https://www.bing.com/search',
        params: { q: '{query}', SafeSearch: 'Strict' },
        features: ['web', 'images', 'local']
      }
    };
    
    this.defaultEngine = 'google';
    this.teslaCategories = this.setupTeslaSearchCategories();
  }
  
  setupTeslaSearchCategories() {
    return {
      tesla: {
        name: 'Tesla Specific',
        searches: [
          'Tesla service centers near me',
          'Supercharger locations',
          'Tesla software updates',
          'Tesla parts and accessories',
          'Tesla forums and community'
        ]
      },
      travel: {
        name: 'Travel & Navigation',
        searches: [
          'EV charging stations',
          'Hotels with EV charging',
          'Weather along route',
          'Traffic conditions',
          'Road conditions and closures'
        ]
      },
      local: {
        name: 'Local Services',
        searches: [
          'Restaurants with charging stations',
          'Shopping centers near me',
          'Gas stations (for emergencies)',
          'Car washes',
          'Parking lots and garages'
        ]
      }
    };
  }
  
  async performSearch(query, engine = this.defaultEngine, category = null) {
    const searchEngine = this.engines[engine];
    if (!searchEngine) throw new Error('Unknown search engine');
    
    // Apply Tesla-specific filtering
    const enhancedQuery = this.enhanceQueryForTesla(query, category);
    const searchUrl = this.buildSearchUrl(searchEngine, enhancedQuery);
    
    return {
      url: searchUrl,
      engine: engine,
      query: enhancedQuery,
      timestamp: Date.now()
    };
  }
  
  enhanceQueryForTesla(query, category) {
    if (category === 'tesla') {
      return `${query} Tesla Model Y Model 3 Model S Model X`;
    } else if (category === 'travel') {
      return `${query} EV electric vehicle charging`;
    } else if (category === 'local') {
      // Add current location context
      const location = this.getCurrentLocation();
      return `${query} near ${location}`;
    }
    
    return query;
  }
}
```

### User Interface Design

#### Search Interface

```css
.search-hub {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-system-background);
}

.search-header {
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
  color: white;
  padding: 24px 20px;
  border-radius: 0 0 24px 24px;
}

.search-bar-container {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 16px 50px 16px 20px;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-button {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.engine-selector {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.engine-tab {
  padding: 8px 16px;
  border: none;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease;
}

.engine-tab.active {
  background: rgba(255, 255, 255, 0.4);
}

.search-categories {
  padding: 20px;
}

.category-section {
  margin-bottom: 24px;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-label);
}

.category-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-pill {
  padding: 8px 16px;
  background: var(--color-secondary-system-background);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: var(--color-label);
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-pill:hover {
  background: var(--color-blue);
  color: white;
  transform: translateY(-1px);
}
```

#### Search History & Saved Searches

```javascript
class SearchHistoryManager {
  constructor() {
    this.maxHistoryItems = 50;
    this.history = this.loadSearchHistory();
    this.savedSearches = this.loadSavedSearches();
  }
  
  addToHistory(searchData) {
    // Remove duplicate if exists
    this.history = this.history.filter(item => 
      item.query !== searchData.query || item.engine !== searchData.engine
    );
    
    // Add to beginning
    this.history.unshift({
      ...searchData,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.history.length > this.maxHistoryItems) {
      this.history = this.history.slice(0, this.maxHistoryItems);
    }
    
    this.saveSearchHistory();
  }
  
  saveSearch(query, name) {
    const savedSearch = {
      id: `saved_${Date.now()}`,
      name: name || query,
      query,
      created: Date.now(),
      useCount: 0
    };
    
    this.savedSearches.push(savedSearch);
    this.saveSavedSearches();
    
    return savedSearch;
  }
  
  getPopularSearches(limit = 10) {
    // Get most frequent searches from history
    const queryFrequency = new Map();
    
    this.history.forEach(item => {
      const count = queryFrequency.get(item.query) || 0;
      queryFrequency.set(item.query, count + 1);
    });
    
    return Array.from(queryFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }
}
```

## 14. Color Picker Pro

### Purpose & Overview

Professional color selection tool with multiple color formats, Tesla customization features, and design utilities.

### Core Features

#### Color Format Support

```javascript
class ColorPickerEngine {
  constructor() {
    this.colorFormats = ['hex', 'rgb', 'hsl', 'cmyk', 'lab'];
    this.currentColor = { r: 255, g: 255, b: 255 };
    this.colorHistory = [];
    this.teslaColorPalettes = this.initializeTeslaColors();
  }
  
  initializeTeslaColors() {
    return {
      tesla_official: {
        name: 'Tesla Official Colors',
        colors: [
          { name: 'Tesla Red', hex: '#E31937', description: 'Official Tesla brand color' },
          { name: 'Tesla Blue', hex: '#1B365E', description: 'Tesla website accent' },
          { name: 'Pearl White', hex: '#F7F7F7', description: 'Multi-Coat White' },
          { name: 'Solid Black', hex: '#000000', description: 'Tesla Black' },
          { name: 'Midnight Silver', hex: '#5C5E62', description: 'Metallic Silver' },
          { name: 'Deep Blue', hex: '#1E3A5F', description: 'Deep Blue Metallic' },
          { name: 'Red Multi-Coat', hex: '#CC0000', description: 'Red Multi-Coat' }
        ]
      },
      dashboard_themes: {
        name: 'Dashboard Themes',
        colors: [
          { name: 'Night Mode', hex: '#000000', description: 'Pure black for OLED' },
          { name: 'Dark Gray', hex: '#1C1C1E', description: 'iOS dark mode' },
          { name: 'Tesla Interior', hex: '#2C2C2E', description: 'Tesla cabin color' },
          { name: 'Accent Blue', hex: '#007AFF', description: 'iOS system blue' },
          { name: 'Success Green', hex: '#34C759', description: 'Charging complete' },
          { name: 'Warning Orange', hex: '#FF9500', description: 'Attention needed' },
          { name: 'Error Red', hex: '#FF3B30', description: 'Critical alerts' }
        ]
      },
      seasonal: {
        name: 'Seasonal Palettes',
        colors: [
          { name: 'Winter Blue', hex: '#4A90E2', description: 'Cold weather theme' },
          { name: 'Spring Green', hex: '#7ED321', description: 'Fresh growth' },
          { name: 'Summer Orange', hex: '#F5A623', description: 'Warm sunshine' },
          { name: 'Autumn Red', hex: '#D0021B', description: 'Fall foliage' }
        ]
      }
    };
  }
  
  convertColor(color, fromFormat, toFormat) {
    const rgb = this.toRGB(color, fromFormat);
    return this.fromRGB(rgb, toFormat);
  }
  
  toRGB(color, format) {
    switch (format) {
      case 'hex':
        return this.hexToRGB(color);
      case 'hsl':
        return this.hslToRGB(color);
      case 'cmyk':
        return this.cmykToRGB(color);
      default:
        return color;
    }
  }
  
  generateHarmony(baseColor, harmonyType) {
    const hsl = this.rgbToHSL(baseColor);
    const harmonies = {
      complementary: [hsl, { ...hsl, h: (hsl.h + 180) % 360 }],
      triadic: [
        hsl,
        { ...hsl, h: (hsl.h + 120) % 360 },
        { ...hsl, h: (hsl.h + 240) % 360 }
      ],
      analogous: [
        { ...hsl, h: (hsl.h - 30 + 360) % 360 },
        hsl,
        { ...hsl, h: (hsl.h + 30) % 360 }
      ],
      monochromatic: [
        { ...hsl, l: Math.max(0, hsl.l - 20) },
        hsl,
        { ...hsl, l: Math.min(100, hsl.l + 20) }
      ]
    };
    
    return harmonies[harmonyType].map(color => this.hslToRGB(color));
  }
}
```

### User Interface Design

#### Color Picker Interface

```css
.color-picker-app {
  display: flex;
  height: 100vh;
  background: var(--color-system-background);
}

.color-picker-main {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-wheel-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.color-wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  cursor: crosshair;
  position: relative;
  background: conic-gradient(
    red, yellow, lime, cyan, blue, magenta, red
  );
}

.color-selector {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.brightness-slider {
  width: 100%;
  height: 30px;
  border-radius: 15px;
  background: linear-gradient(to right, black, white);
  position: relative;
  margin: 20px 0;
  cursor: pointer;
}

.slider-thumb {
  position: absolute;
  width: 26px;
  height: 26px;
  background: white;
  border: 2px solid #ccc;
  border-radius: 50%;
  top: 2px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.color-display {
  display: flex;
  gap: 16px;
  align-items: center;
}

.current-color {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  border: 2px solid var(--color-quaternary-label);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.color-values {
  flex: 1;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.color-label {
  width: 40px;
  font-weight: 600;
  font-size: 14px;
}

.color-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-quaternary-label);
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
}

.copy-button {
  padding: 6px 12px;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
```

#### Tesla Customization Features

```javascript
class TeslaColorCustomizer {
  constructor() {
    this.customizationAreas = {
      dashboard: {
        name: 'Dashboard Theme',
        elements: ['background', 'accent', 'text', 'icons'],
        preview: true
      },
      vehicle_match: {
        name: 'Vehicle Color Match',
        elements: ['exterior', 'interior', 'wheels'],
        teslaAPI: true
      },
      wallpaper: {
        name: 'Wallpaper Colors',
        elements: ['primary', 'secondary', 'gradient'],
        realtime: true
      }
    };
  }
  
  async matchVehicleColors() {
    try {
      const vehicleData = await teslaAPI.getVehicleData();
      const vehicleConfig = vehicleData.vehicle_config;
      
      const colorMapping = {
        'PBSB': '#000000', // Solid Black
        'PPSW': '#F7F7F7', // Pearl White
        'PMNG': '#5C5E62', // Midnight Silver
        'PPMR': '#CC0000', // Red Multi-Coat
        'PPSB': '#1E3A5F', // Deep Blue Metallic
      };
      
      const exteriorColor = colorMapping[vehicleConfig.exterior_color] || '#000000';
      const interiorColor = vehicleConfig.interior_color === 'Black' ? '#000000' : '#FFFFFF';
      
      return {
        exterior: this.hexToRGB(exteriorColor),
        interior: this.hexToRGB(interiorColor),
        suggestions: this.generateMatchingSuggestions(exteriorColor, interiorColor)
      };
      
    } catch (error) {
      console.error('Failed to fetch vehicle colors:', error);
      return this.getDefaultColorScheme();
    }
  }
  
  generateMatchingSuggestions(exteriorColor, interiorColor) {
    const extRGB = this.hexToRGB(exteriorColor);
    const intRGB = this.hexToRGB(interiorColor);
    
    return {
      dashboard: {
        primary: exteriorColor,
        secondary: this.lighten(exteriorColor, 0.2),
        accent: this.getComplementaryColor(exteriorColor),
        background: interiorColor === '#000000' ? '#1C1C1E' : '#F2F2F7'
      },
      wallpaper: this.generateWallpaperGradient(extRGB),
      ui_elements: this.generateUIColorScheme(extRGB, intRGB)
    };
  }
}
```

## 15. Dice Roller & Random

### Purpose & Overview

Digital dice and random number generation system for games, decision making, and entertainment during charging sessions.

### Core Features

#### Dice System

```javascript
class DiceRollerEngine {
  constructor() {
    this.diceTypes = {
      d4: { sides: 4, shape: 'tetrahedron' },
      d6: { sides: 6, shape: 'cube' },
      d8: { sides: 8, shape: 'octahedron' },
      d10: { sides: 10, shape: 'pentagonal_trapezohedron' },
      d12: { sides: 12, shape: 'dodecahedron' },
      d20: { sides: 20, shape: 'icosahedron' },
      d100: { sides: 100, shape: 'zocchihedron' }
    };
    
    this.rollHistory = [];
    this.customDice = new Map();
    this.gamePresets = this.initializeGamePresets();
  }
  
  initializeGamePresets() {
    return {
      yahtzee: {
        name: 'Yahtzee',
        dice: [{ type: 'd6', count: 5 }],
        description: 'Roll 5 six-sided dice'
      },
      dnd_stats: {
        name: 'D&D Ability Scores',
        dice: [{ type: 'd6', count: 4, dropLowest: true }],
        repeat: 6,
        description: 'Roll 4d6, drop lowest, repeat 6 times'
      },
      coin_flip: {
        name: 'Coin Flip',
        dice: [{ type: 'd2', count: 1 }],
        description: 'Heads or Tails'
      },
      decision_maker: {
        name: 'Decision Maker',
        options: ['Yes', 'No', 'Maybe', 'Ask Again Later'],
        description: 'Magic 8-ball style decisions'
      }
    };
  }
  
  rollDice(diceConfig) {
    const results = [];
    
    for (const config of diceConfig) {
      const diceType = this.diceTypes[config.type];
      if (!diceType) continue;
      
      const rolls = [];
      for (let i = 0; i < config.count; i++) {
        const roll = Math.floor(Math.random() * diceType.sides) + 1;
        rolls.push(roll);
      }
      
      // Apply modifiers
      let finalRolls = rolls;
      if (config.dropLowest) {
        finalRolls = rolls.sort((a, b) => b - a).slice(0, -1);
      }
      if (config.dropHighest) {
        finalRolls = rolls.sort((a, b) => a - b).slice(0, -1);
      }
      
      const sum = finalRolls.reduce((total, roll) => total + roll, 0);
      const modifier = config.modifier || 0;
      
      results.push({
        type: config.type,
        rolls: rolls,
        finalRolls: finalRolls,
        sum: sum + modifier,
        modifier: modifier,
        timestamp: Date.now()
      });
    }
    
    this.addToHistory(results);
    return results;
  }
  
  rollWithAnimation(diceConfig) {
    return new Promise((resolve) => {
      const duration = 2000; // 2 second animation
      const fps = 30;
      const frames = duration / (1000 / fps);
      
      let frame = 0;
      const animationResults = [];
      
      const animate = () => {
        // Generate random intermediate results
        const tempResults = this.rollDice(diceConfig);
        animationResults.push(tempResults);
        
        // Update display with current frame
        this.updateDiceDisplay(tempResults);
        
        frame++;
        if (frame < frames) {
          setTimeout(animate, 1000 / fps);
        } else {
          // Final roll
          const finalResults = this.rollDice(diceConfig);
          this.updateDiceDisplay(finalResults);
          resolve(finalResults);
        }
      };
      
      animate();
    });
  }
}
```

### User Interface Design

#### Dice Rolling Interface

```css
.dice-roller-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
}

.dice-header {
  text-align: center;
  margin-bottom: 30px;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.app-subtitle {
  font-size: 16px;
  opacity: 0.8;
}

.dice-display {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin: 40px 0;
  min-height: 200px;
}

.dice-cube {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dice-cube.rolling {
  animation: diceRoll 0.1s infinite;
}

@keyframes diceRoll {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
}

.dice-cube::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  pointer-events: none;
}

.dice-result-summary {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
}

.total-result {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
}

.result-breakdown {
  font-size: 14px;
  opacity: 0.8;
}

.dice-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dice-type-selector {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
}

.dice-type-button {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dice-type-button.active {
  background: rgba(255, 255, 255, 0.4);
}

.roll-button {
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 25px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: center;
}

.roll-button:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}
```

#### Game Presets & Quick Actions

```javascript
class GamePresetsManager {
  constructor() {
    this.travelGames = {
      twenty_questions: {
        name: '20 Questions',
        description: 'Think of something, others guess with yes/no questions',
        dice: null,
        randomizer: 'category',
        categories: ['Animal', 'Person', 'Place', 'Thing', 'Food', 'Movie']
      },
      
      story_builder: {
        name: 'Story Builder',
        description: 'Roll dice to determine story elements',
        dice: [
          { type: 'd6', label: 'Character' },
          { type: 'd6', label: 'Setting' },
          { type: 'd6', label: 'Problem' },
          { type: 'd6', label: 'Solution' }
        ],
        tables: {
          character: ['Brave Knight', 'Clever Detective', 'Friendly Robot', 'Magic Cat', 'Space Explorer', 'Time Traveler'],
          setting: ['Haunted Castle', 'Space Station', 'Underwater City', 'Flying Car', 'Magic Forest', 'Desert Island'],
          problem: ['Missing Treasure', 'Broken Machine', 'Lost Friend', 'Evil Villain', 'Natural Disaster', 'Time Paradox'],
          solution: ['Teamwork', 'Magic Spell', 'Clever Trick', 'New Invention', 'Hidden Clue', 'Unexpected Help']
        }
      },
      
      decision_wheel: {
        name: 'Decision Wheel',
        description: 'Let chance decide your next action',
        decisions: [
          'Where to eat lunch',
          'Which route to take',
          'What music to play',
          'When to take a break',
          'Which game to play next',
          'Who goes first'
        ]
      }
    };
  }
  
  playTravelGame(gameId) {
    const game = this.travelGames[gameId];
    if (!game) return null;
    
    if (game.dice) {
      return this.rollStoryDice(game);
    } else if (game.randomizer === 'category') {
      return this.selectRandomCategory(game);
    } else if (game.decisions) {
      return this.makeRandomDecision(game);
    }
  }
  
  rollStoryDice(game) {
    const results = {};
    
    game.dice.forEach(dice => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const table = game.tables[dice.label.toLowerCase()];
      results[dice.label] = {
        roll: roll,
        result: table[roll - 1]
      };
    });
    
    return {
      type: 'story',
      results: results,
      prompt: this.generateStoryPrompt(results)
    };
  }
  
  generateStoryPrompt(results) {
    return `Your story features a ${results.Character.result} in a ${results.Setting.result}. 
            They face the challenge of ${results.Problem.result} and solve it through ${results.Solution.result}.
            Now tell the story!`;
  }
}
```

## 16. Quote Generator

### Purpose & Overview

Daily inspiration and motivational quotes with Tesla themes, customizable display options, and sharing capabilities.

### Core Features

#### Quote Database Management

```javascript
class QuoteDatabase {
  constructor() {
    this.categories = {
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
            text: "I don't think it's a good idea to plan to sell a company.",
            author: "Elon Musk",
            tags: ['business', 'commitment', 'musk']
          },
          {
            text: "When something is important enough, you do it even if the odds are not in your favor.",
            author: "Elon Musk",
            tags: ['perseverance', 'importance', 'musk']
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
          }
        ]
      }
    };
    
    this.dailyQuotes = new Map();
    this.favoriteQuotes = this.loadFavorites();
    this.customQuotes = this.loadCustomQuotes();
  }
  
  getDailyQuote(date = new Date()) {
    const dateKey = date.toDateString();
    
    if (this.dailyQuotes.has(dateKey)) {
      return this.dailyQuotes.get(dateKey);
    }
    
    // Generate deterministic "random" quote for the day
    const dayOfYear = this.getDayOfYear(date);
    const allQuotes = this.getAllQuotes();
    const quoteIndex = dayOfYear % allQuotes.length;
    const dailyQuote = allQuotes[quoteIndex];
    
    this.dailyQuotes.set(dateKey, dailyQuote);
    return dailyQuote;
  }
  
  getRandomQuote(category = null, tags = []) {
    let quotes = this.getAllQuotes();
    
    if (category) {
      quotes = this.categories[category]?.quotes || [];
    }
    
    if (tags.length > 0) {
      quotes = quotes.filter(quote => 
        tags.some(tag => quote.tags.includes(tag))
      );
    }
    
    if (quotes.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }
  
  searchQuotes(query) {
    const searchTerm = query.toLowerCase();
    const allQuotes = this.getAllQuotes();
    
    return allQuotes.filter(quote => 
      quote.text.toLowerCase().includes(searchTerm) ||
      quote.author.toLowerCase().includes(searchTerm) ||
      quote.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  addCustomQuote(text, author, tags = []) {
    const customQuote = {
      id: `custom_${Date.now()}`,
      text,
      author,
      tags: [...tags, 'custom'],
      created: Date.now()
    };
    
    this.customQuotes.push(customQuote);
    this.saveCustomQuotes();
    
    return customQuote;
  }
}
```

### User Interface Design

#### Quote Display Interface

```css
.quote-generator-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.quote-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/images/tesla-landscape.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.2;
  z-index: 0;
}

.quote-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
}

.quote-text {
  font-size: 28px;
  font-weight: 300;
  line-height: 1.4;
  margin-bottom: 24px;
  max-width: 800px;
  position: relative;
}

.quote-text::before {
  content: '"';
  font-size: 72px;
  position: absolute;
  top: -20px;
  left: -40px;
  opacity: 0.3;
  font-family: Georgia, serif;
}

.quote-text::after {
  content: '"';
  font-size: 72px;
  position: absolute;
  bottom: -40px;
  right: -40px;
  opacity: 0.3;
  font-family: Georgia, serif;
}

.quote-author {
  font-size: 18px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 16px;
}

.quote-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.quote-tag {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.quote-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-group {
  display: flex;
  gap: 12px;
}

.control-button {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.category-selector {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  color: white;
  font-size: 14px;
  min-width: 120px;
}

.daily-quote-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}
```

#### Quote Customization & Settings

```javascript
class QuoteCustomizer {
  constructor() {
    this.displaySettings = {
      fontSize: 28,
      fontFamily: 'Inter',
      backgroundColor: 'gradient',
      textColor: '#FFFFFF',
      backgroundImage: null,
      showAuthor: true,
      showTags: true,
      animationType: 'fade',
      displayDuration: 30000 // 30 seconds
    };
    
    this.backgroundOptions = {
      gradients: [
        { name: 'Sunset', css: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
        { name: 'Ocean', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: 'Forest', css: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)' },
        { name: 'Tesla', css: 'linear-gradient(135deg, #E31937 0%, #1B365E 100%)' }
      ],
      images: [
        { name: 'Tesla Landscape', url: '/images/tesla-landscape.jpg' },
        { name: 'Mountain Road', url: '/images/mountain-road.jpg' },
        { name: 'City Skyline', url: '/images/city-skyline.jpg' }
      ],
      solid: [
        { name: 'Tesla Red', color: '#E31937' },
        { name: 'Tesla Blue', color: '#1B365E' },
        { name: 'Black', color: '#000000' },
        { name: 'Dark Gray', color: '#1C1C1E' }
      ]
    };
  }
  
  applyCustomization(settings) {
    const quoteElement = document.querySelector('.quote-generator-app');
    
    // Apply background
    if (settings.backgroundColor === 'gradient') {
      const gradient = this.backgroundOptions.gradients.find(g => g.name === settings.gradientName);
      if (gradient) {
        quoteElement.style.background = gradient.css;
      }
    } else if (settings.backgroundColor === 'image') {
      const image = this.backgroundOptions.images.find(i => i.name === settings.imageName);
      if (image) {
        quoteElement.style.background = `url(${image.url})`;
        quoteElement.style.backgroundSize = 'cover';
        quoteElement.style.backgroundPosition = 'center';
      }
    } else if (settings.backgroundColor === 'solid') {
      quoteElement.style.background = settings.solidColor;
    }
    
    // Apply text styling
    const quoteText = document.querySelector('.quote-text');
    quoteText.style.fontSize = `${settings.fontSize}px`;
    quoteText.style.fontFamily = settings.fontFamily;
    quoteText.style.color = settings.textColor;
    
    // Toggle elements
    document.querySelector('.quote-author').style.display = settings.showAuthor ? 'block' : 'none';
    document.querySelector('.quote-tags').style.display = settings.showTags ? 'flex' : 'none';
  }
  
  exportQuoteAsImage(quote) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 1200;
    canvas.height = 800;
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ff7e5f');
    gradient.addColorStop(1, '#feb47b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw quote text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = this.wrapText(ctx, quote.text, canvas.width - 100, 48);
    const lineHeight = 60;
    const startY = canvas.height / 2 - (lines.length * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });
    
    // Draw author
    ctx.font = '32px Inter, sans-serif';
    ctx.fillText(`— ${quote.author}`, canvas.width / 2, startY + lines.length * lineHeight + 60);
    
    return canvas.toDataURL('image/png');
  }
}
```

## 17. JSON Tools

### Purpose & Overview

Developer utilities for JSON manipulation, data export/import, and dashboard configuration management.

### Core Features

#### JSON Processing Engine

```javascript
class JSONToolsEngine {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB limit for Tesla performance
    this.validationRules = this.initializeValidationRules();
    this.transformations = this.initializeTransformations();
  }
  
  initializeValidationRules() {
    return {
      teslaConfig: {
        required: ['version', 'user_id', 'dashboard_config'],
        properties: {
          version: { type: 'string', pattern: /^\d+\.\d+\.\d+$/ },
          user_id: { type: 'string', minLength: 1 },
          dashboard_config: { type: 'object' }
        }
      },
      appSettings: {
        required: ['app_id', 'settings'],
        properties: {
          app_id: { type: 'string', minLength: 1 },
          settings: { type: 'object' }
        }
      }
    };
  }
  
  validateJSON(jsonString, schema = null) {
    try {
      const parsed = JSON.parse(jsonString);
      
      if (schema && this.validationRules[schema]) {
        return this.validateAgainstSchema(parsed, this.validationRules[schema]);
      }
      
      return { 
        valid: true, 
        data: parsed, 
        errors: [] 
      };
    } catch (error) {
      return { 
        valid: false, 
        data: null, 
        errors: [{ 
          message: error.message, 
          line: this.getErrorLine(jsonString, error),
          column: this.getErrorColumn(jsonString, error)
        }] 
      };
    }
  }
  
  formatJSON(jsonString, options = {}) {
    const {
      indent = 2,
      sortKeys = false,
      removeComments = false
    } = options;
    
    try {
      let processed = jsonString;
      
      if (removeComments) {
        processed = this.removeJSONComments(processed);
      }
      
      let parsed = JSON.parse(processed);
      
      if (sortKeys) {
        parsed = this.sortObjectKeys(parsed);
      }
      
      return JSON.stringify(parsed, null, indent);
    } catch (error) {
      throw new Error(`Format failed: ${error.message}`);
    }
  }
  
  minifyJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed);
    } catch (error) {
      throw new Error(`Minify failed: ${error.message}`);
    }
  }
  
  convertToCSV(jsonData) {
    if (!Array.isArray(jsonData)) {
      throw new Error('CSV conversion requires an array of objects');
    }
    
    if (jsonData.length === 0) {
      return '';
    }
    
    // Get all unique keys
    const keys = [...new Set(jsonData.flatMap(obj => Object.keys(obj)))];
    
    // Create CSV header
    const csvLines = [keys.join(',')];
    
    // Add data rows
    jsonData.forEach(obj => {
      const row = keys.map(key => {
        const value = obj[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
  }
  
  compareJSON(json1, json2) {
    const obj1 = typeof json1 === 'string' ? JSON.parse(json1) : json1;
    const obj2 = typeof json2 === 'string' ? JSON.parse(json2) : json2;
    
    const differences = [];
    this.findDifferences(obj1, obj2, '', differences);
    
    return {
      identical: differences.length === 0,
      differences: differences
    };
  }
  
  findDifferences(obj1, obj2, path, differences) {
    const keys1 = Object.keys(obj1 || {});
    const keys2 = Object.keys(obj2 || {});
    const allKeys = [...new Set([...keys1, ...keys2])];
    
    allKeys.forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];
      
      if (!(key in (obj1 || {}))) {
        differences.push({
          type: 'added',
          path: currentPath,
          value: val2
        });
      } else if (!(key in (obj2 || {}))) {
        differences.push({
          type: 'removed',
          path: currentPath,
          value: val1
        });
      } else if (typeof val1 !== typeof val2) {
        differences.push({
          type: 'type_changed',
          path: currentPath,
          oldValue: val1,
          newValue: val2
        });
      } else if (typeof val1 === 'object' && val1 !== null && val2 !== null) {
        this.findDifferences(val1, val2, currentPath, differences);
      } else if (val1 !== val2) {
        differences.push({
          type: 'modified',
          path: currentPath,
          oldValue: val1,
          newValue: val2
        });
      }
    });
  }
}
```

### Tesla Dashboard Integration

#### Configuration Export/Import

```javascript
class TeslaDashboardJSONManager {
  constructor() {
    this.configVersion = '1.0.0';
    this.exportableData = [
      'user_preferences',
      'app_settings',
      'layout_configuration',
      'automation_rules',
      'custom_wallpapers',
      'tesla_api_settings'
    ];
  }
  
  async exportDashboardConfig(includePersonalData = false) {
    const config = {
      version: this.configVersion,
      export_date: new Date().toISOString(),
      export_type: includePersonalData ? 'full' : 'settings_only',
      dashboard_config: {}
    };
    
    for (const dataType of this.exportableData) {
      try {
        const data = await this.getConfigData(dataType, includePersonalData);
        if (data) {
          config.dashboard_config[dataType] = data;
        }
      } catch (error) {
        console.warn(`Failed to export ${dataType}:`, error);
      }
    }
    
    return config;
  }
  
  async getConfigData(dataType, includePersonalData) {
    switch (dataType) {
      case 'user_preferences':
        return {
          theme: localStorage.getItem('dashboard_theme'),
          language: localStorage.getItem('language') || 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: JSON.parse(localStorage.getItem('notification_settings') || '{}')
        };
        
      case 'app_settings':
        const appSettings = {};
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('app_settings_')) {
            const appId = key.replace('app_settings_', '');
            appSettings[appId] = JSON.parse(localStorage.getItem(key));
          }
        });
        return appSettings;
        
      case 'layout_configuration':
        return {
          icon_arrangement: JSON.parse(localStorage.getItem('icon_arrangement') || '[]'),
          folders: JSON.parse(localStorage.getItem('folders') || '{}'),
          dock_apps: JSON.parse(localStorage.getItem('dock_apps') || '[]'),
          wallpaper: localStorage.getItem('current_wallpaper')
        };
        
      case 'automation_rules':
        if (!includePersonalData) return null;
        return JSON.parse(localStorage.getItem('automation_rules') || '[]');
        
      case 'tesla_api_settings':
        if (!includePersonalData) return null;
        return {
          api_provider: localStorage.getItem('tesla_api_provider'),
          rate_limiting: JSON.parse(localStorage.getItem('api_rate_limits') || '{}'),
          // Don't export actual tokens for security
          has_token: !!localStorage.getItem('tesla_api_token')
        };
        
      default:
        return null;
    }
  }
  
  async importDashboardConfig(configJSON) {
    const validation = this.validateDashboardConfig(configJSON);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
    
    const config = typeof configJSON === 'string' ? JSON.parse(configJSON) : configJSON;
    const results = {
      imported: [],
      skipped: [],
      errors: []
    };
    
    for (const [dataType, data] of Object.entries(config.dashboard_config)) {
      try {
        await this.importConfigData(dataType, data);
        results.imported.push(dataType);
      } catch (error) {
        results.errors.push({ dataType, error: error.message });
      }
    }
    
    // Trigger dashboard refresh
    if (results.imported.length > 0) {
      window.dispatchEvent(new CustomEvent('dashboardConfigImported', { 
        detail: results 
      }));
    }
    
    return results;
  }
  
  validateDashboardConfig(configJSON) {
    try {
      const config = typeof configJSON === 'string' ? JSON.parse(configJSON) : configJSON;
      const errors = [];
      
      if (!config.version) {
        errors.push('Missing version field');
      }
      
      if (!config.dashboard_config || typeof config.dashboard_config !== 'object') {
        errors.push('Missing or invalid dashboard_config');
      }
      
      // Validate version compatibility
      if (config.version && !this.isVersionCompatible(config.version)) {
        errors.push(`Incompatible version: ${config.version}`);
      }
      
      return {
        valid: errors.length === 0,
        errors: errors
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`JSON parse error: ${error.message}`]
      };
    }
  }
}
```

### User Interface Design

#### JSON Tools Interface

```css
.json-tools-app {
  display: flex;
  height: 100vh;
  background: var(--color-system-background);
}

.json-tools-sidebar {
  width: 250px;
  background: var(--color-secondary-system-background);
  border-right: 1px solid var(--color-quaternary-label);
  display: flex;
  flex-direction: column;
}

.tool-selector {
  padding: 20px;
}

.tool-button {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: transparent;
  border: 1px solid var(--color-quaternary-label);
  border-radius: 8px;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-button.active {
  background: var(--color-blue);
  color: white;
  border-color: var(--color-blue);
}

.json-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.json-toolbar {
  background: var(--color-secondary-system-background);
  border-bottom: 1px solid var(--color-quaternary-label);
  padding: 12px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-button {
  padding: 8px 16px;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toolbar-button:hover {
  background: var(--color-blue-dark);
}

.json-workspace {
  flex: 1;
  display: flex;
}

.json-input-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.json-editor {
  flex: 1;
  border: none;
  padding: 20px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.4;
  background: var(--color-system-background);
  color: var(--color-label);
  resize: none;
  outline: none;
}

.json-output-area {
  flex: 1;
  border-left: 1px solid var(--color-quaternary-label);
  display: flex;
  flex-direction: column;
}

.output-header {
  background: var(--color-secondary-system-background);
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-quaternary-label);
  font-weight: 600;
  font-size: 14px;
}

.json-output {
  flex: 1;
  padding: 20px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.4;
  background: var(--color-tertiary-system-background);
  overflow: auto;
  white-space: pre-wrap;
}

.validation-status {
  padding: 12px 20px;
  border-top: 1px solid var(--color-quaternary-label);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-valid {
  background: var(--color-green);
}

.status-invalid {
  background: var(--color-red);
}

.error-list {
  max-height: 150px;
  overflow-y: auto;
  background: rgba(255, 59, 48, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.error-item {
  font-size: 12px;
  color: var(--color-red);
  margin-bottom: 4px;
}
```

## 18. Stats Panel

### Purpose & Overview

Comprehensive usage analytics and performance monitoring dashboard providing insights into Tesla dashboard usage patterns and system performance.

### Core Features

#### Analytics Collection System

```javascript
class TeslaDashboardAnalytics {
  constructor() {
    this.analyticsEnabled = this.getAnalyticsConsent();
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.eventQueue = [];
    this.performanceMetrics = new Map();
    this.userBehaviorPatterns = new Map();
    
    if (this.analyticsEnabled) {
      this.initializeAnalytics();
    }
  }
  
  initializeAnalytics() {
    this.trackPageLoad();
    this.setupEventListeners();
    this.startPerformanceMonitoring();
    this.startBehaviorTracking();
    
    // Flush events periodically
    setInterval(() => this.flushEvents(), 30000); // Every 30 seconds
  }
  
  trackEvent(category, action, label = null, value = null, customData = {}) {
    if (!this.analyticsEnabled) return;
    
    const event = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      category,
      action,
      label,
      value,
      customData: {
        ...customData,
        url: window.location.href,
        userAgent: navigator.userAgent.includes('Tesla') ? 'Tesla Browser' : 'Other',
        screenResolution: `${screen.width}x${screen.height}`,
        sessionDuration: Date.now() - this.sessionStart
      }
    };
    
    this.eventQueue.push(event);
    
    // Immediate flush for critical events
    if (category === 'error' || category === 'performance_critical') {
      this.flushEvents();
    }
  }
  
  trackAppUsage(appId, action, duration = null) {
    this.trackEvent('app_usage', action, appId, duration, {
      appCategory: this.getAppCategory(appId),
      teslaConnected: window.teslaAPI?.isConnected() || false
    });
    
    // Update usage patterns
    this.updateUsagePattern(appId, action, duration);
  }
  
  trackTeslaAPIUsage(endpoint, responseTime, success) {
    this.trackEvent('tesla_api', 'call', endpoint, responseTime, {
      success,
      apiProvider: window.teslaAPI?.provider || 'unknown'
    });
  }
  
  trackPerformanceMetric(metric, value, context = {}) {
    const timestamp = Date.now();
    
    if (!this.performanceMetrics.has(metric)) {
      this.performanceMetrics.set(metric, []);
    }
    
    this.performanceMetrics.get(metric).push({
      timestamp,
      value,
      context
    });
    
    // Keep only last 100 measurements per metric
    const measurements = this.performanceMetrics.get(metric);
    if (measurements.length > 100) {
      this.performanceMetrics.set(metric, measurements.slice(-100));
    }
    
    this.trackEvent('performance', metric, null, value, context);
  }
}
```

#### Usage Pattern Analysis

```javascript
class UsagePatternAnalyzer {
  constructor() {
    this.patterns = {
      daily: new Map(),
      weekly: new Map(),
      monthly: new Map(),
      appSequences: new Map(),
      sessionTypes: new Map()
    };
    
    this.loadHistoricalData();
  }
  
  analyzeUsagePatterns() {
    const analysis = {
      mostUsedApps: this.getMostUsedApps(),
      peakUsageTimes: this.getPeakUsageTimes(),
      averageSessionLength: this.getAverageSessionLength(),
      appTransitions: this.getCommonAppTransitions(),
      teslaIntegrationUsage: this.getTeslaIntegrationUsage(),
      userJourney: this.analyzeUserJourney()
    };
    
    return analysis;
  }
  
  getMostUsedApps(limit = 10) {
    const appUsage = new Map();
    
    // Aggregate usage data
    this.patterns.daily.forEach(dayData => {
      dayData.apps.forEach((usage, appId) => {
        const current = appUsage.get(appId) || { sessions: 0, totalTime: 0 };
        appUsage.set(appId, {
          sessions: current.sessions + usage.sessions,
          totalTime: current.totalTime + usage.totalTime
        });
      });
    });
    
    // Sort by total time and return top apps
    return Array.from(appUsage.entries())
      .sort((a, b) => b[1].totalTime - a[1].totalTime)
      .slice(0, limit)
      .map(([appId, data]) => ({
        appId,
        appName: this.getAppName(appId),
        sessions: data.sessions,
        totalTime: data.totalTime,
        averageSessionTime: data.totalTime / data.sessions,
        category: this.getAppCategory(appId)
      }));
  }
  
  getPeakUsageTimes() {
    const hourlyUsage = new Array(24).fill(0);
    const daylyUsage = new Array(7).fill(0);
    
    this.patterns.daily.forEach(dayData => {
      const date = new Date(dayData.date);
      const dayOfWeek = date.getDay();
      
      dayData.hourlyBreakdown.forEach((usage, hour) => {
        hourlyUsage[hour] += usage;
      });
      
      daylyUsage[dayOfWeek] += dayData.totalTime;
    });
    
    const peakHour = hourlyUsage.indexOf(Math.max(...hourlyUsage));
    const peakDay = daylyUsage.indexOf(Math.max(...daylyUsage));
    
    return {
      peakHour: {
        hour: peakHour,
        timeRange: `${peakHour}:00 - ${peakHour + 1}:00`,
        usage: hourlyUsage[peakHour]
      },
      peakDay: {
        day: peakDay,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][peakDay],
        usage: daylyUsage[peakDay]
      },
      hourlyDistribution: hourlyUsage,
      dailyDistribution: daylyUsage
    };
  }
  
  analyzeUserJourney() {
    const journeyPatterns = new Map();
    const sessions = this.getRecentSessions(30); // Last 30 days
    
    sessions.forEach(session => {
      const journey = session.appSequence.map(app => app.appId).join(' → ');
      const count = journeyPatterns.get(journey) || 0;
      journeyPatterns.set(journey, count + 1);
    });
    
    const commonJourneys = Array.from(journeyPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([journey, count]) => ({
        journey,
        count,
        percentage: (count / sessions.length) * 100
      }));
    
    return {
      commonJourneys,
      averageAppsPerSession: this.calculateAverageAppsPerSession(sessions),
      sessionStartPatterns: this.analyzeSessionStartPatterns(sessions),
      sessionEndPatterns: this.analyzeSessionEndPatterns(sessions)
    };
  }
  
  generateRecommendations() {
    const patterns = this.analyzeUsagePatterns();
    const recommendations = [];
    
    // App organization recommendations
    const underusedApps = patterns.mostUsedApps.filter(app => app.sessions < 5);
    if (underusedApps.length > 3) {
      recommendations.push({
        type: 'organization',
        title: 'Optimize App Layout',
        description: `${underusedApps.length} apps are rarely used. Consider moving them to folders or removing from main screen.`,
        actionable: true,
        apps: underusedApps.map(app => app.appId)
      });
    }
    
    // Usage efficiency recommendations
    const shortSessions = this.getAverageSessionLength();
    if (shortSessions < 60000) { // Less than 1 minute average
      recommendations.push({
        type: 'efficiency',
        title: 'Quick Access Optimization',
        description: 'Your sessions are very short. Consider adding frequently used functions to the dock.',
        actionable: true,
        suggestedDockApps: patterns.mostUsedApps.slice(0, 4).map(app => app.appId)
      });
    }
    
    // Tesla integration recommendations
    const teslaUsage = patterns.teslaIntegrationUsage;
    if (teslaUsage.frequency < 0.3) { // Less than 30% of sessions use Tesla features
      recommendations.push({
        type: 'tesla_integration',
        title: 'Explore Tesla Features',
        description: 'You might benefit from using more Tesla-specific features like automation and pre-conditioning.',
        actionable: false
      });
    }
    
    return recommendations;
  }
}
```

### User Interface Design

#### Stats Dashboard Interface

```css
.stats-panel-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-system-background);
  overflow-y: auto;
}

.stats-header {
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
  color: white;
  padding: 24px 20px;
  border-radius: 0 0 24px 24px;
}

.stats-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stats-subtitle {
  font-size: 16px;
  opacity: 0.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-label);
}

.stat-card-icon {
  width: 24px;
  height: 24px;
  opacity: 0.6;
}

.stat-metric {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-blue);
  line-height: 1;
}

.metric-unit {
  font-size: 14px;
  color: var(--color-secondary-label);
  font-weight: 500;
}

.metric-change {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.metric-change.positive {
  background: rgba(52, 199, 89, 0.1);
  color: var(--color-green);
}

.metric-change.negative {
  background: rgba(255, 59, 48, 0.1);
  color: var(--color-red);
}

.usage-chart {
  height: 200px;
  margin: 16px 0;
  position: relative;
}

.chart-bar {
  position: absolute;
  bottom: 0;
  background: var(--color-blue);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.app-usage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-usage-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-secondary-system-background);
  border-radius: 8px;
}

.app-icon-small {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.app-usage-info {
  flex: 1;
}

.app-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.app-usage-stats {
  font-size: 12px;
  color: var(--color-secondary-label);
}

.usage-bar {
  width: 60px;
  height: 4px;
  background: var(--color-quaternary-label);
  border-radius: 2px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background: var(--color-blue);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.recommendations-section {
  grid-column: 1 / -1;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-quaternary-label);
}

.recommendation-item:last-child {
  border-bottom: none;
}

.recommendation-icon {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.recommendation-icon.organization {
  background: rgba(255, 149, 0, 0.1);
  color: var(--color-orange);
}

.recommendation-icon.efficiency {
  background: rgba(52, 199, 89, 0.1);
  color: var(--color-green);
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.recommendation-description {
  font-size: 14px;
  color: var(--color-secondary-label);
  line-height: 1.4;
}
```

## 19. URL Shortener

### Purpose & Overview

Link shortening service with analytics, QR code generation, and Tesla-specific use cases for sharing locations, routes, and configurations.

### Core Features

#### URL Shortening Engine

```javascript
class URLShortenerService {
  constructor() {
    this.services = {
      tinyurl: {
        name: 'TinyURL',
        endpoint: 'https://tinyurl.com/api-create.php',
        method: 'GET',
        params: { url: '{url}' },
        anonymous: true
      },
      bitly: {
        name: 'Bitly',
        endpoint: 'https://api-ssl.bitly.com/v4/shorten',
        method: 'POST',
        headers: { 'Authorization': 'Bearer {token}' },
        anonymous: false,
        features: ['analytics', 'custom_domain', 'custom_alias']
      },
      isgd: {
        name: 'is.gd',
        endpoint: 'https://is.gd/create.php',
        method: 'GET',
        params: { format: 'simple', url: '{url}' },
        anonymous: true
      }
    };
    
    this.customDomain = 'tesla.dash'; // Hypothetical custom domain
    this.shortenedUrls = new Map();
    this.analytics = new Map();
    this.teslaUseCases = this.initializeTeslaUseCases();
  }
  
  initializeTeslaUseCases() {
    return {
      supercharger_location: {
        name: 'Supercharger Location',
        template: 'https://supercharge.info/marker/{id}',
        description: 'Share Supercharger location with friends'
      },
      trip_route: {
        name: 'Trip Route',
        template: 'https://maps.google.com/dir/{origin}/{destination}',
        description: 'Share your planned route'
      },
      tesla_config: {
        name: 'Tesla Configuration',
        template: 'https://www.tesla.com/model3/design#{config}',
        description: 'Share your Tesla configuration'
      },
      charging_session: {
        name: 'Charging Session',
        template: 'https://dashboard.tesla.local/charging/{session_id}',
        description: 'Share charging session details'
      },
      service_appointment: {
        name: 'Service Appointment',
        template: 'https://service.tesla.com/appointment/{id}',
        description: 'Share service appointment confirmation'
      }
    };
  }
  
  async shortenUrl(originalUrl, options = {}) {
    const {
      service = 'tinyurl',
      customAlias = null,
      expirationDate = null,
      title = null
    } = options;
    
    // Validate URL
    if (!this.isValidUrl(originalUrl)) {
      throw new Error('Invalid URL provided');
    }
    
    // Check if already shortened
    const existing = this.findExistingShortUrl(originalUrl);
    if (existing && !customAlias) {
      return existing;
    }
    
    try {
      const shortUrl = await this.callShorteningService(service, originalUrl, options);
      
      const urlData = {
        id: this.generateUrlId(),
        originalUrl,
        shortUrl,
        service,
        customAlias,
        title: title || this.extractTitle(originalUrl),
        created: Date.now(),
        expirationDate,
        clickCount: 0,
        lastAccessed: null,
        teslaUseCase: this.detectTeslaUseCase(originalUrl)
      };
      
      this.shortenedUrls.set(urlData.id, urlData);
      this.saveToStorage();
      
      return urlData;
      
    } catch (error) {
      throw new Error(`URL shortening failed: ${error.message}`);
    }
  }
  
  async callShorteningService(service, url, options) {
    const serviceConfig = this.services[service];
    if (!serviceConfig) {
      throw new Error(`Unknown service: ${service}`);
    }
    
    if (serviceConfig.method === 'GET') {
      const params = new URLSearchParams();
      Object.entries(serviceConfig.params).forEach(([key, value]) => {
        params.append(key, value.replace('{url}', encodeURIComponent(url)));
      });
      
      const response = await fetch(`${serviceConfig.endpoint}?${params}`);
      return await response.text();
      
    } else if (serviceConfig.method === 'POST') {
      const headers = { 'Content-Type': 'application/json' };
      if (serviceConfig.headers) {
        Object.assign(headers, serviceConfig.headers);
      }
      
      const body = {
        long_url: url,
        ...(options.customAlias && { custom_bitlink: options.customAlias })
      };
      
      const response = await fetch(serviceConfig.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      return data.link || data.id;
    }
  }
  
  generateQRCode(url, options = {}) {
    const {
      size = 200,
      errorCorrection = 'M',
      margin = 4,
      darkColor = '#000000',
      lightColor = '#FFFFFF'
    } = options;
    
    // Use qrserver.com API for QR generation (Tesla-compatible)
    const qrUrl = new URL('https://api.qrserver.com/v1/create-qr-code/');
    qrUrl.searchParams.set('size', `${size}x${size}`);
    qrUrl.searchParams.set('data', url);
    qrUrl.searchParams.set('ecc', errorCorrection);
    qrUrl.searchParams.set('margin', margin);
    qrUrl.searchParams.set('color', darkColor.replace('#', ''));
    qrUrl.searchParams.set('bgcolor', lightColor.replace('#', ''));
    
    return qrUrl.toString();
  }
  
  detectTeslaUseCase(url) {
    for (const [key, useCase] of Object.entries(this.teslaUseCases)) {
      if (url.includes(useCase.template.split('{')[0])) {
        return key;
      }
    }
    
    // Check for common Tesla-related domains
    const teslaDomains = [
      'tesla.com',
      'supercharge.info',
      'teslamotorsclub.com',
      'teslafi.com',
      'abetterrouteplanner.com'
    ];
    
    for (const domain of teslaDomains) {
      if (url.includes(domain)) {
        return 'tesla_related';
      }
    }
    
    return null;
  }
}
```

### Tesla-Specific Features

#### Quick Tesla Sharing

```javascript
class TeslaQuickShare {
  constructor() {
    this.urlShortener = new URLShortenerService();
    this.locationService = new LocationService();
  }
  
  async shareCurrentLocation() {
    try {
      const position = await this.locationService.getCurrentPosition();
      const url = `https://maps.google.com/maps?q=${position.latitude},${position.longitude}`;
      
      const shortUrl = await this.urlShortener.shortenUrl(url, {
        title: 'My Current Location',
        teslaUseCase: 'location_share'
      });
      
      return {
        shortUrl: shortUrl.shortUrl,
        qrCode: this.urlShortener.generateQRCode(shortUrl.shortUrl),
        message: `I'm here: ${shortUrl.shortUrl}`
      };
      
    } catch (error) {
      throw new Error(`Failed to share location: ${error.message}`);
    }
  }
  
  async shareChargingStation(stationId) {
    const stationUrl = `https://supercharge.info/marker/${stationId}`;
    
    try {
      const stationData = await this.getStationData(stationId);
      const shortUrl = await this.urlShortener.shortenUrl(stationUrl, {
        title: `Supercharger: ${stationData.name}`,
        teslaUseCase: 'supercharger_location'
      });
      
      return {
        shortUrl: shortUrl.shortUrl,
        qrCode: this.urlShortener.generateQRCode(shortUrl.shortUrl),
        message: `Great charging spot: ${shortUrl.shortUrl}`,
        stationInfo: stationData
      };
      
    } catch (error) {
      throw new Error(`Failed to share charging station: ${error.message}`);
    }
  }
  
  async shareTrip(origin, destination, waypoints = []) {
    let url = `https://maps.google.com/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
    
    if (waypoints.length > 0) {
      const waypointStr = waypoints.map(wp => encodeURIComponent(wp)).join('/');
      url += `/${waypointStr}`;
    }
    
    try {
      const shortUrl = await this.urlShortener.shortenUrl(url, {
        title: `Trip: ${origin} to ${destination}`,
        teslaUseCase: 'trip_route'
      });
      
      return {
        shortUrl: shortUrl.shortUrl,
        qrCode: this.urlShortener.generateQRCode(shortUrl.shortUrl),
        message: `Check out my trip route: ${shortUrl.shortUrl}`,
        tripDetails: {
          origin,
          destination,
          waypoints,
          estimatedDistance: await this.calculateDistance(origin, destination)
        }
      };
      
    } catch (error) {
      throw new Error(`Failed to share trip: ${error.message}`);
    }
  }
  
  async shareDashboardConfig() {
    try {
      const config = await this.exportDashboardConfig();
      const configId = await this.uploadConfig(config);
      const url = `https://tesla-dashboard.app/config/${configId}`;
      
      const shortUrl = await this.urlShortener.shortenUrl(url, {
        title: 'My Tesla Dashboard Config',
        teslaUseCase: 'dashboard_config'
      });
      
      return {
        shortUrl: shortUrl.shortUrl,
        qrCode: this.urlShortener.generateQRCode(shortUrl.shortUrl),
        message: `Try my dashboard setup: ${shortUrl.shortUrl}`,
        configPreview: this.generateConfigPreview(config)
      };
      
    } catch (error) {
      throw new Error(`Failed to share dashboard config: ${error.message}`);
    }
  }
}
```

### User Interface Design

#### URL Shortener Interface

```css
.url-shortener-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-system-background);
}

.shortener-header {
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  color: white;
  padding: 24px 20px;
  border-radius: 0 0 24px 24px;
}

.shortener-form {
  padding: 24px 20px;
  background: white;
  margin: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.url-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.url-input {
  flex: 1;
  padding: 16px;
  border: 2px solid var(--color-quaternary-label);
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
}

.url-input:focus {
  border-color: var(--color-blue);
}

.shorten-button {
  padding: 16px 24px;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.advanced-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-label);
}

.option-select,
.option-input {
  padding: 12px;
  border: 1px solid var(--color-quaternary-label);
  border-radius: 8px;
  font-size: 14px;
}

.result-section {
  margin: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: none;
}

.result-section.visible {
  display: block;
}

.result-url {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-secondary-system-background);
  border-radius: 12px;
  margin-bottom: 16px;
}

.short-url {
  flex: 1;
  font-family: monospace;
  font-size: 16px;
  color: var(--color-blue);
}

.copy-button {
  padding: 8px 16px;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.qr-code-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--color-secondary-system-background);
  border-radius: 12px;
}

.qr-code-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
}

.qr-code-info {
  flex: 1;
}

.tesla-shortcuts {
  margin: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.shortcut-button {
  padding: 16px;
  background: var(--color-secondary-system-background);
  border: none;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shortcut-button:hover {
  background: var(--color-blue);
  color: white;
  transform: translateY(-2px);
}

.shortcut-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.shortcut-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.shortcut-description {
  font-size: 12px;
  opacity: 0.7;
}

.url-history {
  margin: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-quaternary-label);
}

.history-item:last-child {
  border-bottom: none;
}

.history-url {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.original-url {
  font-size: 14px;
  color: var(--color-secondary-label);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.short-url-small {
  font-size: 12px;
  font-family: monospace;
  color: var(--color-blue);
}

.click-count {
  font-size: 12px;
  color: var(--color-tertiary-label);
  padding: 2px 8px;
  background: var(--color-quaternary-label);
  border-radius: 4px;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.action-button-small {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 16px;
  background: var(--color-quaternary-label);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-button-small:hover {
  background: var(--color-blue);
  color: white;
}
```

#### Analytics & Link Management

```javascript
class URLAnalytics {
  constructor() {
    this.analytics = new Map();
    this.geoData = new Map();
    this.referrerData = new Map();
  }
  
  trackClick(shortUrlId, clickData) {
    if (!this.analytics.has(shortUrlId)) {
      this.analytics.set(shortUrlId, {
        totalClicks: 0,
        uniqueClicks: 0,
        clickHistory: [],
        geoBreakdown: new Map(),
        deviceBreakdown: new Map(),
        referrerBreakdown: new Map()
      });
    }
    
    const stats = this.analytics.get(shortUrlId);
    
    const click = {
      timestamp: Date.now(),
      ip: clickData.ip,
      userAgent: clickData.userAgent,
      referrer: clickData.referrer,
      country: clickData.country,
      city: clickData.city,
      device: this.detectDevice(clickData.userAgent)
    };
    
    stats.totalClicks++;
    stats.clickHistory.push(click);
    
    // Update breakdowns
    this.updateBreakdown(stats.geoBreakdown, clickData.country);
    this.updateBreakdown(stats.deviceBreakdown, click.device);
    this.updateBreakdown(stats.referrerBreakdown, clickData.referrer);
    
    // Check for unique clicks (by IP)
    const isUnique = !stats.clickHistory.some(c => 
      c.ip === clickData.ip && c.timestamp > Date.now() - 86400000 // 24 hours
    );
    
    if (isUnique) {
      stats.uniqueClicks++;
    }
    
    this.analytics.set(shortUrlId, stats);
  }
  
  generateAnalyticsReport(shortUrlId, timeframe = '7d') {
    const stats = this.analytics.get(shortUrlId);
    if (!stats) return null;
    
    const now = Date.now();
    const timeframes = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };
    
    const cutoff = now - timeframes[timeframe];
    const filteredClicks = stats.clickHistory.filter(click => click.timestamp > cutoff);
    
    return {
      summary: {
        totalClicks: filteredClicks.length,
        uniqueClicks: this.countUniqueClicks(filteredClicks),
        clickThroughRate: this.calculateCTR(shortUrlId, timeframe),
        averageClicksPerDay: filteredClicks.length / (timeframes[timeframe] / 86400000)
      },
      timeDistribution: this.generateTimeDistribution(filteredClicks),
      geoDistribution: this.generateGeoDistribution(filteredClicks),
      deviceDistribution: this.generateDeviceDistribution(filteredClicks),
      referrerDistribution: this.generateReferrerDistribution(filteredClicks)
    };
  }
}
```

## 20. Lists & Reminders

### Purpose & Overview

Comprehensive task management and reminder system with Tesla integration for vehicle maintenance, trip planning, and productivity management.

### Core Features

#### Task Management System

```javascript
class TaskManager {
  constructor() {
    this.lists = new Map();
    this.reminders = new Map();
    this.categories = this.initializeCategories();
    this.syncService = new TaskSyncService();
    this.teslaIntegration = new TeslaTaskIntegration();
  }
  
  initializeCategories() {
    return {
      tesla: {
        name: 'Tesla',
        icon: '🚗',
        color: '#E31937',
        templates: [
          'Check tire pressure',
          'Schedule service appointment',
          'Update software',
          'Clean charging port',
          'Replace cabin air filter'
        ]
      },
      travel: {
        name: 'Travel',
        icon: '🗺️',
        color: '#007AFF',
        templates: [
          'Plan route with charging stops',
          'Check weather forecast',
          'Book accommodations',
          'Pack emergency kit',
          'Download offline maps'
        ]
      },
      maintenance: {
        name: 'Maintenance',
        icon: '🔧',
        color: '#FF9500',
        templates: [
          'Rotate tires - every 6,250 miles',
          'Replace air filter - every 2 years',
          'Brake fluid check - every 2 years',
          'A/C desiccant bag - every 6 years',
          'Battery coolant - every 4 years'
        ]
      },
      shopping: {
        name: 'Shopping',
        icon: '🛒',
        color: '#34C759',
        templates: [
          'Tesla accessories',
          'Car care products',
          'Emergency supplies',
          'Charging cables',
          'Interior organizers'
        ]
      }
    };
  }
  
  createList(name, category = 'general', options = {}) {
    const list = {
      id: `list_${Date.now()}`,
      name,
      category,
      color: options.color || this.categories[category]?.color || '#007AFF',
      icon: options.icon || this.categories[category]?.icon || '📝',
      created: Date.now(),
      modified: Date.now(),
      tasks: [],
      shared: options.shared || false,
      collaborators: options.collaborators || [],
      settings: {
        sortBy: 'created', // created, due_date, priority, alphabetical
        showCompleted: false,
        autoArchive: true,
        notifications: true
      }
    };
    
    this.lists.set(list.id, list);
    this.syncService.syncList(list);
    
    return list;
  }
  
  addTask(listId, taskData) {
    const list = this.lists.get(listId);
    if (!list) throw new Error('List not found');
    
    const task = {
      id: `task_${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      completed: false,
      priority: taskData.priority || 'medium', // low, medium, high, critical
      dueDate: taskData.dueDate || null,
      reminderDate: taskData.reminderDate || null,
      tags: taskData.tags || [],
      subtasks: [],
      attachments: [],
      location: taskData.location || null,
      teslaRelated: taskData.teslaRelated || false,
      created: Date.now(),
      modified: Date.now(),
      completedDate: null
    };
    
    list.tasks.push(task);
    list.modified = Date.now();
    
    // Set up reminder if specified
    if (task.reminderDate) {
      this.createReminder(task);
    }
    
    // Tesla integration
    if (task.teslaRelated) {
      this.teslaIntegration.processTask(task);
    }
    
    this.syncService.syncList(list);
    return task;
  }
  
  createReminder(task) {
    const reminder = {
      id: `reminder_${Date.now()}`,
      taskId: task.id,
      title: task.title,
      message: task.description || `Reminder: ${task.title}`,
      scheduledFor: task.reminderDate,
      type: this.determineReminderType(task),
      recurring: false,
      locationBased: !!task.location,
      teslaIntegrated: task.teslaRelated,
      created: Date.now(),
      triggered: false
    };
    
    this.reminders.set(reminder.id, reminder);
    this.scheduleReminder(reminder);
    
    return reminder;
  }
  
  determineReminderType(task) {
    if (task.location) return 'location';
    if (task.teslaRelated) return 'tesla';
    if (task.dueDate) return 'deadline';
    return 'standard';
  }
}
```

#### Tesla Integration Features

```javascript
class TeslaTaskIntegration {
  constructor() {
    this.maintenanceSchedule = this.initializeMaintenanceSchedule();
    this.automationRules = this.initializeAutomationRules();
  }
  
  initializeMaintenanceSchedule() {
    return {
      tire_rotation: {
        interval: 6250, // miles
        lastService: null,
        priority: 'medium',
        description: 'Rotate tires to ensure even wear'
      },
      cabin_air_filter: {
        interval: 24, // months
        lastService: null,
        priority: 'low',
        description: 'Replace cabin air filter for better air quality'
      },
      brake_fluid: {
        interval: 24, // months
        lastService: null,
        priority: 'high',
        description: 'Test brake fluid for contamination'
      },
      ac_desiccant: {
        interval: 72, // months
        lastService: null,
        priority: 'medium',
        description: 'Replace A/C desiccant bag'
      },
      battery_coolant: {
        interval: 48, // months
        lastService: null,
        priority: 'high',
        description: 'Replace battery coolant'
      }
    };
  }
  
  async processTask(task) {
    // Check if task relates to vehicle maintenance
    if (this.isMaintenanceTask(task)) {
      await this.scheduleMaintenanceReminder(task);
    }
    
    // Check if task relates to trip planning
    if (this.isTripTask(task)) {
      await this.enhanceWithTripData(task);
    }
    
    // Check if task relates to charging
    if (this.isChargingTask(task)) {
      await this.integrateWithChargingSchedule(task);
    }
  }
  
  async checkMaintenanceNeeded() {
    const vehicleData = await teslaAPI.getVehicleData();
    const odometer = vehicleData.vehicle_state.odometer;
    const serviceDates = await this.getServiceHistory();
    
    const neededMaintenance = [];
    
    Object.entries(this.maintenanceSchedule).forEach(([service, schedule]) => {
      const lastService = serviceDates[service];
      let isNeeded = false;
      
      if (schedule.interval < 100) { // Time-based (months)
        const monthsSinceService = lastService ? 
          (Date.now() - lastService) / (30 * 24 * 60 * 60 * 1000) : 
          Infinity;
        isNeeded = monthsSinceService >= schedule.interval;
      } else { // Mileage-based
        const milesSinceService = lastService ? 
          odometer - lastService.odometer : 
          odometer;
        isNeeded = milesSinceService >= schedule.interval;
      }
      
      if (isNeeded) {
        neededMaintenance.push({
          service,
          priority: schedule.priority,
          description: schedule.description,
          overdue: this.calculateOverdue(service, lastService, odometer)
        });
      }
    });
    
    return neededMaintenance;
  }
  
  async createMaintenanceTasks() {
    const needed = await this.checkMaintenanceNeeded();
    const tasks = [];
    
    for (const maintenance of needed) {
      const task = {
        title: `${maintenance.service.replace('_', ' ').toUpperCase()} - ${maintenance.description}`,
        description: `Vehicle maintenance: ${maintenance.description}`,
        priority: maintenance.priority,
        dueDate: this.calculateMaintenanceDueDate(maintenance),
        tags: ['maintenance', 'tesla', maintenance.service],
        teslaRelated: true,
        category: 'maintenance'
      };
      
      tasks.push(task);
    }
    
    return tasks;
  }
  
  async createTripPreparationList(tripData) {
    const checklist = [
      {
        title: 'Plan route with charging stops',
        description: `Plan optimal route from ${tripData.origin} to ${tripData.destination}`,
        priority: 'high',
        category: 'trip_planning'
      },
      {
        title: 'Check weather forecast',
        description: 'Review weather conditions along route',
        priority: 'medium',
        category: 'trip_planning'
      },
      {
        title: 'Ensure sufficient charge',
        description: `Target ${tripData.recommendedStartCharge}% charge for departure`,
        priority: 'high',
        category: 'charging'
      },
      {
        title: 'Download offline maps',
        description: 'Download maps for areas with poor cellular coverage',
        priority: 'medium',
        category: 'navigation'
      },
      {
        title: 'Pack emergency kit',
        description: 'Emergency supplies, first aid, tools',
        priority: 'low',
        category: 'safety'
      }
    ];
    
    // Add location-specific tasks
    if (tripData.includesWinterDriving) {
      checklist.push({
        title: 'Prepare for winter driving',
        description: 'Check tire pressure, pack winter supplies',
        priority: 'high',
        category: 'winter_prep'
      });
    }
    
    if (tripData.includesRemoteAreas) {
      checklist.push({
        title: 'Backup charging plan',
        description: 'Research backup charging options and mobile connectors',
        priority: 'high',
        category: 'charging'
      });
    }
    
    return checklist;
  }
}
```

### User Interface Design

#### Lists & Tasks Interface

```css
.lists-app {
  display: flex;
  height: 100vh;
  background: var(--color-system-background);
}

.lists-sidebar {
  width: 300px;
  background: var(--color-secondary-system-background);
  border-right: 1px solid var(--color-quaternary-label);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  background: linear-gradient(135deg, #55efc4 0%, #00b894 100%);
  color: white;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.new-list-button {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.lists-collection {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.list-item:hover {
  background: var(--color-tertiary-system-background);
}

.list-item.active {
  background: var(--color-blue);
  color: white;
}

.list-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
}

.list-info {
  flex: 1;
}

.list-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.list-count {
  font-size: 12px;
  opacity: 0.7;
}

.task-count-badge {
  background: var(--color-red);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-header {
  background: white;
  border-bottom: 1px solid var(--color-quaternary-label);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-label);
}

.list-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 18px;
  background: var(--color-secondary-system-background);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-button:hover {
  background: var(--color-blue);
  color: white;
}

.tasks-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.task-input-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-input {
  width: 100%;
  padding: 12px 0;
  border: none;
  font-size: 16px;
  outline: none;
  background: transparent;
}

.task-input::placeholder {
  color: var(--color-tertiary-label);
}

.task-options {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-quaternary-label);
}

.option-button {
  padding: 6px 12px;
  background: var(--color-secondary-system-background);
  border: none;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.option-button.active {
  background: var(--color-blue);
  color: white;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.task-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title {
  text-decoration: line-through;
}

.task-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-quaternary-label);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.task-checkbox.checked {
  background: var(--color-green);
  border-color: var(--color-green);
  position: relative;
}

.task-checkbox.checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.task-content {
  flex: 1;
}

.task-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  line-height: 1.3;
}

.task-description {
  font-size: 14px;
  color: var(--color-secondary-label);
  line-height: 1.4;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.task-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-secondary-label);
}

.task-due-date.overdue {
  color: var(--color-red);
  font-weight: 600;
}

.task-priority {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-high {
  background: rgba(255, 59, 48, 0.1);
  color: var(--color-red);
}

.priority-medium {
  background: rgba(255, 149, 0, 0.1);
  color: var(--color-orange);
}

.priority-low {
  background: rgba(52, 199, 89, 0.1);
  color: var(--color-green);
}

.task-tags {
  display: flex;
  gap: 4px;
}

.task-tag {
  padding: 2px 6px;
  background: var(--color-quaternary-label);
  border-radius: 4px;
  font-size: 10px;
  color: var(--color-secondary-label);
}

.task-tag.tesla {
  background: rgba(227, 25, 55, 0.1);
  color: var(--tesla-red);
}
```

#### Smart Reminder System

```javascript
class SmartReminderSystem {
  constructor() {
    this.reminders = new Map();
    this.locationWatcher = null;
    this.notificationQueue = [];
    this.teslaIntegration = new TeslaReminderIntegration();
  }
  
  createLocationBasedReminder(task, location, radius = 1000) {
    const reminder = {
      id: `location_reminder_${Date.now()}`,
      taskId: task.id,
      type: 'location',
      location: {
        latitude: location.lat,
        longitude: location.lng,
        address: location.address,
        radius: radius
      },
      triggered: false,
      message: `Reminder: ${task.title}`,
      created: Date.now()
    };
    
    this.reminders.set(reminder.id, reminder);
    this.setupLocationWatching();
    
    return reminder;
  }
  
  createTimeBasedReminder(task, reminderTime, recurring = false) {
    const reminder = {
      id: `time_reminder_${Date.now()}`,
      taskId: task.id,
      type: 'time',
      scheduledFor: reminderTime,
      recurring: recurring,
      triggered: false,
      message: `Reminder: ${task.title}`,
      created: Date.now()
    };
    
    this.reminders.set(reminder.id, reminder);
    this.scheduleTimeReminder(reminder);
    
    return reminder;
  }
  
  createTeslaBasedReminder(task, condition) {
    const reminder = {
      id: `tesla_reminder_${Date.now()}`,
      taskId: task.id,
      type: 'tesla',
      condition: condition, // 'low_battery', 'charging_complete', 'arrive_destination'
      triggered: false,
      message: `Tesla Reminder: ${task.title}`,
      created: Date.now()
    };
    
    this.reminders.set(reminder.id, reminder);
    this.teslaIntegration.setupConditionWatcher(reminder);
    
    return reminder;
  }
  
  async checkLocationReminders(currentLocation) {
    for (const [id, reminder] of this.reminders) {
      if (reminder.type === 'location' && !reminder.triggered) {
        const distance = this.calculateDistance(
          currentLocation,
          reminder.location
        );
        
        if (distance <= reminder.location.radius) {
          await this.triggerReminder(reminder);
        }
      }
    }
  }
  
  async triggerReminder(reminder) {
    reminder.triggered = true;
    reminder.triggeredAt = Date.now();
    
    const notification = {
      title: 'Task Reminder',
      message: reminder.message,
      type: reminder.type,
      taskId: reminder.taskId,
      actions: [
        { text: 'Mark Complete', action: 'complete_task' },
        { text: 'Snooze', action: 'snooze_reminder' },
        { text: 'Dismiss', action: 'dismiss_reminder' }
      ]
    };
    
    await this.showNotification(notification);
    this.reminders.set(reminder.id, reminder);
  }
  
  generateSmartSuggestions(task) {
    const suggestions = [];
    
    // Time-based suggestions
    if (task.dueDate) {
      const timeUntilDue = task.dueDate - Date.now();
      const oneDayBefore = task.dueDate - (24 * 60 * 60 * 1000);
      const oneHourBefore = task.dueDate - (60 * 60 * 1000);
      
      if (timeUntilDue > 24 * 60 * 60 * 1000) {
        suggestions.push({
          type: 'time',
          time: oneDayBefore,
          description: 'Remind me 1 day before due date'
        });
      }
      
      if (timeUntilDue > 60 * 60 * 1000) {
        suggestions.push({
          type: 'time',
          time: oneHourBefore,
          description: 'Remind me 1 hour before due date'
        });
      }
    }
    
    // Location-based suggestions
    if (task.location) {
      suggestions.push({
        type: 'location',
        location: task.location,
        description: `Remind me when I arrive at ${task.location.address}`
      });
    }
    
    // Tesla-based suggestions
    if (task.teslaRelated) {
      if (task.title.toLowerCase().includes('charge')) {
        suggestions.push({
          type: 'tesla',
          condition: 'low_battery',
          description: 'Remind me when battery is low'
        });
      }
      
      if (task.title.toLowerCase().includes('service')) {
        suggestions.push({
          type: 'tesla',
          condition: 'maintenance_due',
          description: 'Remind me when maintenance is due'
        });
      }
    }
    
    return suggestions;
  }
}
```