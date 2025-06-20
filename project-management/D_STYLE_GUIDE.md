STYLE_GUIDE.md

#### Tesla Dashboard Code Style Guide

**Objective:** Maintain consistent, high-quality code that works flawlessly in Tesla's Chromium 79 browser while delivering optimal performance and user experience.

#### JavaScript Style Standards

**ES6 Compatibility Requirements**

```javascript
// ✅ GOOD: ES6 features fully supported in Chromium 79
const TeslaComponent = {
  constructor() {
    this.state = new Map();
    this.listeners = new Set();
  },
  
  async fetchData() {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  },
  
  handleClick = (event) => {
    // Arrow functions for proper 'this' binding
    this.processEvent(event);
  }
};

// ❌ BAD: ES2020+ features not supported in Tesla browser
const result = data?.nested?.property; // Optional chaining
const merged = { ...defaults, ...userConfig }; // Spread in object literals
const bigInt = 123n; // BigInt literals
const nullish = value ?? defaultValue; // Nullish coalescing
```

**Tesla-Specific Performance Patterns**

```javascript
// ✅ GOOD: Tesla memory management
class TeslaApp {
  constructor() {
    this.boundMethods = new Map();
    this.timers = [];
    this.intervals = [];
    this.observers = [];
  }
  
  bindMethod(methodName) {
    if (!this.boundMethods.has(methodName)) {
      this.boundMethods.set(methodName, this[methodName].bind(this));
    }
    return this.boundMethods.get(methodName);
  }
  
  addTimer(callback, delay) {
    const timer = setTimeout(callback, delay);
    this.timers.push(timer);
    return timer;
  }
  
  addInterval(callback, interval) {
    const intervalId = setInterval(callback, interval);
    this.intervals.push(intervalId);
    return intervalId;
  }
  
  cleanup() {
    // Essential for Tesla - prevents memory leaks
    this.timers.forEach(timer => clearTimeout(timer));
    this.intervals.forEach(interval => clearInterval(interval));
    this.observers.forEach(observer => observer.disconnect());
    
    this.boundMethods.clear();
    this.timers = [];
    this.intervals = [];
    this.observers = [];
  }
}

// ❌ BAD: Memory leak patterns that crash Tesla browser
class BadApp {
  setupEvents() {
    // Anonymous functions create memory leaks
    document.addEventListener('click', () => {
      this.handleClick();
    });
    
    // Timers without cleanup
    setInterval(() => {
      this.updateData();
    }, 1000);
    
    // No cleanup method
  }
}
```

**Error Handling Standards**

```javascript
// ✅ GOOD: Comprehensive Tesla error handling
class TeslaAPIManager {
  async executeCommand(command, params = {}) {
    try {
      // Rate limiting check
      if (!this.rateLimiter.canExecute()) {
        throw new TeslaError('RATE_LIMIT_EXCEEDED', 'Too many API calls');
      }
      
      // Network timeout for Tesla cellular
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`/api/tesla/${command}`, {
        method: 'POST',
        body: JSON.stringify(params),
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new TeslaError(
          'API_REQUEST_FAILED', 
          `Tesla API returned ${response.status}`,
          { command, params, status: response.status }
        );
      }
      
      return await response.json();
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new TeslaError('NETWORK_TIMEOUT', 'Request timed out - check cellular connection');
      }
      
      if (error instanceof TeslaError) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new TeslaError('UNKNOWN_ERROR', error.message, { originalError: error });
    }
  }
}

// Custom error class for Tesla-specific issues
class TeslaError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = 'TeslaError';
    this.code = code;
    this.context = context;
    this.timestamp = Date.now();
  }
}
```

#### CSS Style Standards

**Tesla-Optimized CSS Architecture**

```css
/* ✅ GOOD: Tesla performance-optimized CSS */
.tesla-app-container {
  /* Hardware acceleration for Tesla GPU */
  transform: translateZ(0);
  will-change: transform;
  
  /* Touch-optimized sizing (minimum 44px targets) */
  min-height: 44px;
  
  /* Tesla thermal awareness */
  transition: transform 0.2s ease-out;
  /* Avoid expensive transitions that cause overheating */
}

.tesla-button {
  /* Large touch targets for driving gloves */
  min-width: 60px;
  min-height: 60px;
  
  /* Tesla-friendly animations */
  transition: 
    background-color 0.15s ease-out,
    transform 0.1s ease-out;
  
  /* Avoid CPU-intensive effects */
  /* NO: box-shadow transitions, blur effects, complex gradients */
}

.tesla-optimized-animation {
  /* Use transform and opacity only for smooth performance */
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ❌ BAD: Performance-heavy CSS that overheats Tesla */
.bad-animation {
  /* Avoid these - they cause thermal throttling */
  transition: 
    box-shadow 0.3s ease,
    filter 0.3s ease,
    clip-path 0.3s ease;
  
  animation: complexAnimation 2s infinite;
}

@keyframes complexAnimation {
  0% { 
    filter: blur(0px) brightness(1);
    box-shadow: 0 0 50px rgba(0,0,0,0.5);
  }
  50% { 
    filter: blur(5px) brightness(1.2);
    box-shadow: 0 0 100px rgba(255,255,255,0.8);
  }
  100% { 
    filter: blur(0px) brightness(1);
    box-shadow: 0 0 50px rgba(0,0,0,0.5);
  }
}
```

**iPadOS Authentic Styling**

```css
/* ✅ GOOD: Authentic iPadOS design tokens */
:root {
  /* Apple's official iPadOS color system */
  --color-blue: #007AFF;
  --color-green: #34C759;
  --color-red: #FF3B30;
  --color-orange: #FF9500;
  --color-yellow: #FFCC00;
  --color-purple: #AF52DE;
  --color-pink: #FF2D92;
  --color-indigo: #5856D6;
  
  /* iPadOS semantic colors */
  --color-label: rgba(0, 0, 0, 0.85);
  --color-secondary-label: rgba(0, 0, 0, 0.68);
  --color-tertiary-label: rgba(0, 0, 0, 0.48);
  --color-quaternary-label: rgba(0, 0, 0, 0.28);
  
  /* iPadOS background colors */
  --color-system-background: #FFFFFF;
  --color-secondary-system-background: #F2F2F7;
  --color-tertiary-system-background: #FFFFFF;
  
  /* iPadOS typography */
  --font-system: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif;
  --font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  
  /* iPadOS corner radius (iOS 14+ standard) */
  --radius-small: 8px;
  --radius-medium: 12px;
  --radius-large: 16px;
  --radius-icon: 22px; /* App icon radius */
}

.ipados-app-icon {
  width: 76px;
  height: 76px;
  border-radius: var(--radius-icon);
  
  /* Authentic iPadOS icon shadow */
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.1);
  
  /* Authentic icon gradients */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  /* Icon touch interaction */
  transition: transform 0.15s ease-out;
}

.ipados-app-icon:active {
  transform: scale(0.95);
}

/* ❌ BAD: Generic styling that doesn't match iPadOS */
.generic-button {
  border-radius: 4px; /* Not iPadOS standard */
  background: #0066cc; /* Wrong blue */
  box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Wrong shadow */
}
```

#### Component Architecture

**Tesla Component Pattern**

```javascript
// ✅ GOOD: Tesla-optimized component architecture
class TeslaComponent {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.defaultOptions, ...options };
    this.state = new Proxy({}, {
      set: (target, key, value) => {
        const oldValue = target[key];
        target[key] = value;
        this.onStateChange(key, value, oldValue);
        return true;
      }
    });
    
    this.boundMethods = new Map();
    this.timers = [];
    this.intervals = [];
    this.observers = [];
    
    this.initialize();
  }
  
  get defaultOptions() {
    return {
      autoCleanup: true,
      thermalProtection: true,
      touchOptimized: true
    };
  }
  
  initialize() {
    this.setupEventListeners();
    this.render();
    
    if (this.options.autoCleanup) {
      this.setupAutoCleanup();
    }
  }
  
  setupEventListeners() {
    // Use bound methods to prevent memory leaks
    this.addEventListener('click', this.boundMethod('handleClick'));
    this.addEventListener('touchstart', this.boundMethod('handleTouchStart'));
  }
  
  boundMethod(methodName) {
    if (!this.boundMethods.has(methodName)) {
      this.boundMethods.set(methodName, this[methodName].bind(this));
    }
    return this.boundMethods.get(methodName);
  }
  
  addEventListener(event, handler) {
    this.element.addEventListener(event, handler);
    
    // Store for cleanup
    if (!this.eventListeners) {
      this.eventListeners = [];
    }
    this.eventListeners.push({ event, handler });
  }
  
  onStateChange(key, newValue, oldValue) {
    // Throttle renders for Tesla performance
    if (!this.renderPending) {
      this.renderPending = true;
      requestAnimationFrame(() => {
        this.render();
        this.renderPending = false;
      });
    }
  }
  
  render() {
    // Override in subclasses
    throw new Error('render() must be implemented by subclass');
  }
  
  setupAutoCleanup() {
    // Auto cleanup when element is removed from DOM
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && !document.contains(this.element)) {
            this.destroy();
          }
        });
      });
      
      observer.observe(this.element);
      this.observers.push(observer);
    }
  }
  
  destroy() {
    // Essential cleanup for Tesla
    this.eventListeners?.forEach(({ event, handler }) => {
      this.element.removeEventListener(event, handler);
    });
    
    this.timers.forEach(timer => clearTimeout(timer));
    this.intervals.forEach(interval => clearInterval(interval));
    this.observers.forEach(observer => observer.disconnect());
    
    this.boundMethods.clear();
    this.eventListeners = [];
    this.timers = [];
    this.intervals = [];
    this.observers = [];
    
    this.element = null;
  }
}

// Example implementation
class TeslaButton extends TeslaComponent {
  get defaultOptions() {
    return {
      ...super.defaultOptions,
      size: 'medium',
      variant: 'primary'
    };
  }
  
  render() {
    const { size, variant } = this.options;
    const { disabled, loading } = this.state;
    
    this.element.className = `tesla-button tesla-button--${size} tesla-button--${variant}`;
    
    if (disabled) {
      this.element.classList.add('tesla-button--disabled');
    }
    
    if (loading) {
      this.element.classList.add('tesla-button--loading');
    }
  }
  
  handleClick(event) {
    if (this.state.disabled || this.state.loading) {
      event.preventDefault();
      return;
    }
    
    // Add visual feedback
    this.element.classList.add('tesla-button--pressed');
    setTimeout(() => {
      this.element.classList.remove('tesla-button--pressed');
    }, 150);
    
    this.emit('click', event);
  }
}
```

#### File Organization Standards

**Project Structure**

```
tesla-dashboard/
├── src/
│   ├── core/                    # Core system functionality
│   │   ├── tesla-api.js        # Tesla API management
│   │   ├── performance.js      # Performance monitoring
│   │   ├── security.js         # Security and encryption
│   │   └── storage.js          # Data storage utilities
│   ├── components/             # Reusable UI components
│   │   ├── base/              # Base component classes
│   │   │   ├── TeslaComponent.js
│   │   │   └── TeslaApp.js
│   │   ├── ui/                # UI components
│   │   │   ├── TeslaButton.js
│   │   │   ├── TeslaModal.js
│   │   │   └── TeslaIcon.js
│   │   └── layout/            # Layout components
│   │       ├── TeslaGrid.js
│   │       └── TeslaNavigation.js
│   ├── apps/                  # Individual dashboard apps
│   │   ├── tesla-control/     # Tesla vehicle control
│   │   │   ├── index.js
│   │   │   ├── TeslaControlApp.js
│   │   │   ├── components/
│   │   │   └── styles.css
│   │   ├── weather/           # Weather application
│   │   └── calendar/          # Calendar integration
│   ├── styles/                # Global styling
│   │   ├── base.css           # Reset and base styles
│   │   ├── ipados.css         # iPadOS design system
│   │   ├── tesla.css          # Tesla-specific styles
│   │   └── animations.css     # Performance-optimized animations
│   ├── utils/                 # Utility functions
│   │   ├── dom.js            # DOM manipulation helpers
│   │   ├── network.js        # Network utilities
│   │   ├── validation.js     # Input validation
│   │   └── formatting.js     # Data formatting
│   └── assets/               # Static assets
│       ├── icons/            # SVG icon sprites
│       ├── images/           # Image assets
│       └── fonts/            # Font files
├── tests/                    # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   ├── performance/         # Performance tests
│   └── tesla/               # Tesla-specific tests
├── docs/                    # Documentation
│   ├── api/                 # API documentation
│   ├── components/          # Component documentation
│   └── guides/              # Developer guides
└── config/                  # Configuration files
    ├── webpack.config.js    # Build configuration
    ├── tesla.config.js      # Tesla-specific config
    └── eslint.config.js     # Linting rules
```

#### Naming Conventions

**JavaScript Naming**

```javascript
// ✅ GOOD: Clear, Tesla-specific naming
const teslaVehicleStatus = await getTeslaVehicleStatus();
const isChargingSessionActive = checkChargingStatus();
const climateControlManager = new TeslaClimateManager();

// Classes: PascalCase with Tesla prefix for Tesla-specific classes
class TeslaAPIManager { }
class PaymentProcessor { }
class PerformanceMonitor { }

// Functions: camelCase with descriptive names
function calculateChargingTime(currentLevel, targetLevel, chargeRate) { }
function formatBatteryPercentage(level) { }
function handleVehicleWakeUp() { }

// Constants: SCREAMING_SNAKE_CASE
const TESLA_API_RATE_LIMIT = 200;
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 10000;

// Private methods: leading underscore
class TeslaApp {
  _setupInternalState() { }
  _validateConfiguration() { }
  _handleInternalError() { }
}

// ❌ BAD: Generic or unclear naming
const data = await get();
const flag = check();
const mgr = new Manager();
```

**CSS Naming (BEM Methodology)**

```css
/* ✅ GOOD: BEM with Tesla/iPadOS context */
.tesla-control-panel { }
.tesla-control-panel__climate-section { }
.tesla-control-panel__climate-button { }
.tesla-control-panel__climate-button--active { }
.tesla-control-panel__climate-button--disabled { }

.ipados-app-icon { }
.ipados-app-icon__badge { }
.ipados-app-icon__badge--notification { }

.performance-monitor { }
.performance-monitor__fps-counter { }
.performance-monitor__fps-counter--warning { }
.performance-monitor__fps-counter--critical { }

/* ❌ BAD: Generic class names */
.button { }
.active { }
.container { }
```

#### Documentation Standards

**JSDoc Documentation**

```javascript
/**
 * Tesla Vehicle Climate Control Manager
 * 
 * Manages all climate-related functions for Tesla vehicles with proper
 * rate limiting, error handling, and thermal awareness for the Tesla browser.
 * 
 * @class TeslaClimateManager
 * @example
 * const climate = new TeslaClimateManager('vehicle_id_123');
 * await climate.setTemperature(22);
 * await climate.enableSeatHeating('driver', 3);
 */
class TeslaClimateManager {
  /**
   * Set cabin temperature with Tesla-safe validation
   * 
   * @param {number} temperature - Target temperature in Celsius (16-32°C)
   * @param {Object} options - Configuration options
   * @param {boolean} options.dualZone - Enable dual zone climate
   * @param {number} options.timeout - Request timeout in milliseconds
   * @returns {Promise<Object>} Climate control response
   * @throws {TeslaError} When temperature is out of range or API fails
   * 
   * @example
   * try {
   *   const result = await climate.setTemperature(22, { dualZone: true });
   *   console.log('Temperature set successfully:', result);
   * } catch (error) {
   *   if (error.code === 'TEMPERATURE_OUT_OF_RANGE') {
   *     console.error('Invalid temperature:', error.message);
   *   }
   * }
   */
  async setTemperature(temperature, options = {}) {
    // Temperature validation for Tesla climate system
    if (temperature < 16 || temperature > 32) {
      throw new TeslaError(
        'TEMPERATURE_OUT_OF_RANGE', 
        `Temperature ${temperature}°C is outside Tesla range (16-32°C)`
      );
    }
    
    // Rate limiting check (Tesla API: 200 calls per 15 minutes)
    if (!this.rateLimiter.canMakeRequest()) {
      throw new TeslaError('RATE_LIMIT_EXCEEDED', 'Too many climate requests');
    }
    
    // API call with thermal awareness
    return await this.teslaAPI.setClimateTemperature(this.vehicleId, temperature, options);
  }
}
```

**Component Documentation**

```javascript
/**
 * Tesla-optimized button component with authentic iPadOS styling
 * 
 * Features:
 * - Touch-optimized sizing (60px minimum)
 * - Tesla performance optimizations
 * - Authentic iPadOS visual design
 * - Automatic memory cleanup
 * 
 * @component TeslaButton
 * @param {HTMLElement} element - Button element to enhance
 * @param {Object} options - Configuration options
 * @param {string} options.size - Button size: 'small', 'medium', 'large'
 * @param {string} options.variant - Style variant: 'primary', 'secondary', 'danger'
 * @param {boolean} options.disabled - Whether button is disabled
 * 
 * @example
 * <button id="climate-button">Start Climate</button>
 * 
 * const button = new TeslaButton(
 *   document.getElementById('climate-button'),
 *   { size: 'large', variant: 'primary' }
 * );
 * 
 * button.on('click', () => {
 *   console.log('Climate button clicked');
 * });
 */
```

#### Code Quality Standards

**Linting Configuration**

```javascript
// .eslintrc.js - Tesla Dashboard ESLint Configuration
module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2018, // ES2018 max for Tesla Chromium 79
    sourceType: 'module'
  },
  rules: {
    // Tesla browser compatibility
    'no-optional-chaining': 'error',
    'no-nullish-coalescing': 'error',
    'no-dynamic-import': 'error',
    
    // Performance rules for Tesla
    'no-console': 'warn', // Allow console for debugging
    'no-alert': 'error', // Alerts can freeze Tesla browser
    'no-eval': 'error', // Security and performance
    
    // Memory management
    'no-global-assign': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    
    // Tesla-specific rules
    'tesla/require-cleanup': 'error', // Custom rule for cleanup methods
    'tesla/no-heavy-animations': 'warn', // Custom rule for performance
    'tesla/rate-limit-aware': 'error' // Custom rule for API calls
  },
  
  // Custom rules for Tesla development
  plugins: ['tesla-dashboard'],
  
  globals: {
    // Tesla browser globals
    'Tesla': 'readonly',
    'TeslaAPI': 'readonly'
  }
};
```

This comprehensive style guide ensures that all Tesla Dashboard code maintains the highest standards of quality, performance, and compatibility with the Tesla browser environment while delivering an authentic iPadOS experience.