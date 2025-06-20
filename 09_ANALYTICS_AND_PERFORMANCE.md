### Comprehensive Performance Monitoring System

#### Tesla-Optimized Performance Tracking

```javascript
class TeslaPerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: new FPSTracker(),
      memory: new MemoryTracker(),
      thermal: new ThermalTracker(),
      api: new APILatencyTracker(),
      network: new NetworkMonitor(),
      battery: new BatteryTracker()
    };
    
    this.performanceHistory = new Map();
    this.alertThresholds = {
      fps: { warning: 20, critical: 15 },
      memory: { warning: 80, critical: 90 }, // Percentage
      thermal: { warning: 'warm', critical: 'throttling' },
      apiLatency: { warning: 2000, critical: 5000 }, // ms
      batteryDrain: { warning: 5, critical: 10 } // % per hour
    };
    
    this.performanceOptimizations = new Map();
    this.isMonitoring = false;
    this.initializeMonitoring();
  }
  
  initializeMonitoring() {
    this.startPerformanceMonitoring();
    this.setupPerformanceOptimizations();
    this.initializeMetricsCollection();
  }
  
  startPerformanceMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Main performance monitoring loop
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000); // Every 30 seconds
    
    // More frequent FPS monitoring
    this.fpsInterval = setInterval(() => {
      this.updateFPSMetrics();
    }, 1000); // Every second
    
    // Thermal monitoring (critical for Tesla)
    this.thermalInterval = setInterval(() => {
      this.monitorThermalState();
    }, 5000); // Every 5 seconds
  }
  
  collectPerformanceMetrics() {
    const timestamp = Date.now();
    const metrics = {
      timestamp,
      fps: this.metrics.fps.getCurrentFPS(),
      memory: this.metrics.memory.getUsage(),
      thermal: this.metrics.thermal.getState(),
      apiLatency: this.metrics.api.getAverageLatency(),
      networkSpeed: this.metrics.network.getSpeed(),
      batteryDrain: this.metrics.battery.getDrainRate(),
      pageLoadTime: this.getPageLoadTime(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connectionType: this.getConnectionType()
    };
    
    // Store metrics
    this.performanceHistory.set(timestamp, metrics);
    
    // Keep only last 1000 measurements
    if (this.performanceHistory.size > 1000) {
      const oldestKey = Math.min(...this.performanceHistory.keys());
      this.performanceHistory.delete(oldestKey);
    }
    
    // Analyze performance and trigger optimizations if needed
    this.analyzePerformance(metrics);
    
    // Send to analytics if enabled
    if (window.PRIVACY_SETTINGS?.analyticsEnabled) {
      this.sendPerformanceData(metrics);
    }
  }
  
  analyzePerformance(metrics) {
    const issues = [];
    
    // FPS Analysis
    if (metrics.fps < this.alertThresholds.fps.critical) {
      issues.push({
        type: 'fps',
        severity: 'critical',
        value: metrics.fps,
        message: 'Frame rate critically low - user experience degraded',
        recommendations: [
          'Reduce visual effects',
          'Close unused apps',
          'Clear cache',
          'Restart dashboard'
        ]
      });
    } else if (metrics.fps < this.alertThresholds.fps.warning) {
      issues.push({
        type: 'fps',
        severity: 'warning',
        value: metrics.fps,
        message: 'Frame rate below optimal',
        recommendations: [
          'Disable non-essential animations',
          'Reduce active widgets'
        ]
      });
    }
    
    // Memory Analysis
    if (metrics.memory > this.alertThresholds.memory.critical) {
      issues.push({
        type: 'memory',
        severity: 'critical',
        value: metrics.memory,
        message: 'Memory usage critically high',
        recommendations: [
          'Clear application cache',
          'Restart dashboard',
          'Close background apps'
        ]
      });
    } else if (metrics.memory > this.alertThresholds.memory.warning) {
      issues.push({
        type: 'memory',
        severity: 'warning',
        value: metrics.memory,
        message: 'High memory usage detected',
        recommendations: [
          'Clear old data',
          'Reduce cached content'
        ]
      });
    }
    
    // Thermal Analysis (Critical for Tesla)
    if (metrics.thermal === 'throttling') {
      issues.push({
        type: 'thermal',
        severity: 'critical',
        value: metrics.thermal,
        message: 'Tesla CPU thermal throttling active',
        recommendations: [
          'Reduce CPU-intensive operations',
          'Pause animations',
          'Allow system to cool',
          'Park in shade if possible'
        ]
      });
    } else if (metrics.thermal === 'warm') {
      issues.push({
        type: 'thermal',
        severity: 'warning',
        value: metrics.thermal,
        message: 'Tesla system running warm',
        recommendations: [
          'Monitor temperature',
          'Reduce processing load'
        ]
      });
    }
    
    // API Latency Analysis
    if (metrics.apiLatency > this.alertThresholds.apiLatency.critical) {
      issues.push({
        type: 'api',
        severity: 'critical',
        value: metrics.apiLatency,
        message: 'Tesla API extremely slow',
        recommendations: [
          'Check cellular connection',
          'Enable offline mode',
          'Reduce API polling frequency'
        ]
      });
    }
    
    // Battery Drain Analysis
    if (metrics.batteryDrain > this.alertThresholds.batteryDrain.critical) {
      issues.push({
        type: 'battery',
        severity: 'critical',
        value: metrics.batteryDrain,
        message: 'High battery drain detected',
        recommendations: [
          'Enable power saving mode',
          'Reduce background activity',
          'Lower screen brightness'
        ]
      });
    }
    
    // Take action on critical issues
    if (issues.length > 0) {
      this.handlePerformanceIssues(issues);
    }
    
    return issues;
  }
  
  handlePerformanceIssues(issues) {
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    
    if (criticalIssues.length > 0) {
      // Auto-apply emergency optimizations
      this.applyEmergencyOptimizations(criticalIssues);
      
      // Show performance warning to user
      this.showPerformanceAlert(criticalIssues);
    }
    
    // Log performance issues
    this.logPerformanceIssues(issues);
  }
  
  applyEmergencyOptimizations(issues) {
    issues.forEach(issue => {
      switch (issue.type) {
        case 'fps':
          this.enablePerformanceMode();
          break;
          
        case 'memory':
          this.clearNonEssentialCache();
          break;
          
        case 'thermal':
          this.enableThermalProtection();
          break;
          
        case 'api':
          this.enableOfflineMode();
          break;
          
        case 'battery':
          this.enablePowerSavingMode();
          break;
      }
    });
  }
  
  enablePerformanceMode() {
    // Disable non-essential animations
    document.body.classList.add('performance-mode');
    
    // Reduce animation frame rate
    this.setAnimationFrameRate(20); // 20 FPS limit
    
    // Disable particle effects and transitions
    document.querySelectorAll('.particle-animation, .transition-heavy').forEach(el => {
      el.style.display = 'none';
    });
    
    console.log('Performance mode enabled - animations reduced');
  }
  
  clearNonEssentialCache() {
    // Clear application cache (non-essential data)
    const nonEssentialKeys = Object.keys(localStorage).filter(key => 
      !key.includes('essential') && 
      !key.includes('security') && 
      !key.includes('subscription')
    );
    
    nonEssentialKeys.forEach(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item.timestamp && Date.now() - item.timestamp > 3600000) { // 1 hour old
          localStorage.removeItem(key);
        }
      } catch (e) {
        // Remove corrupted items
        localStorage.removeItem(key);
      }
    });
    
    // Force garbage collection hint
    if (window.gc) {
      window.gc();
    }
    
    console.log('Non-essential cache cleared');
  }
  
  enableThermalProtection() {
    // Reduce CPU-intensive operations
    document.body.classList.add('thermal-protection');
    
    // Pause all timers and intervals except essential ones
    this.pauseNonEssentialTimers();
    
    // Reduce polling frequency
    this.setReducedPollingMode();
    
    // Show thermal warning
    this.showThermalWarning();
    
    console.log('Thermal protection enabled');
  }
  
  enableOfflineMode() {
    // Switch to cached data only
    window.OFFLINE_MODE = true;
    
    // Stop all API polling
    this.pauseAPIPolling();
    
    // Show offline indicator
    this.showOfflineIndicator();
    
    console.log('Offline mode enabled due to poor connectivity');
  }
  
  enablePowerSavingMode() {
    // Reduce screen brightness
    document.body.style.filter = 'brightness(0.8)';
    
    // Reduce background activity
    this.pauseNonEssentialTimers();
    
    // Lower refresh rates
    this.setReducedRefreshRates();
    
    console.log('Power saving mode enabled');
  }
  
  showPerformanceAlert(issues) {
    const alert = document.createElement('div');
    alert.className = 'performance-alert';
    alert.innerHTML = `
      <div class="alert-content">
        <div class="alert-icon">⚠️</div>
        <div class="alert-message">
          <h3>Performance Issues Detected</h3>
          <ul>
            ${issues.map(issue => `<li>${issue.message}</li>`).join('')}
          </ul>
        </div>
        <div class="alert-actions">
          <button onclick="this.parentElement.parentElement.parentElement.remove()">Dismiss</button>
          <button onclick="window.location.reload()">Restart Dashboard</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 10000);
  }
}

class FPSTracker {
  constructor() {
    this.fps = 0;
    this.frames = 0;
    this.lastTime = performance.now();
    this.history = [];
    this.maxHistory = 60; // Keep 1 minute of FPS data
    this.isTracking = false;
    this.startTracking();
  }
  
  startTracking() {
    if (this.isTracking) return;
    this.isTracking = true;
    
    const trackFrame = (currentTime) => {
      this.frames++;
      
      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
        
        this.history.push({
          timestamp: currentTime,
          fps: this.fps
        });
        
        if (this.history.length > this.maxHistory) {
          this.history.shift();
        }
        
        this.frames = 0;
        this.lastTime = currentTime;
        
        // Update FPS display if element exists
        const fpsDisplay = document.getElementById('fps-counter');
        if (fpsDisplay) {
          fpsDisplay.textContent = `${this.fps} FPS`;
          fpsDisplay.className = `fps-counter ${this.getFPSClass(this.fps)}`;
        }
      }
      
      if (this.isTracking) {
        requestAnimationFrame(trackFrame);
      }
    };
    
    requestAnimationFrame(trackFrame);
  }
  
  getFPSClass(fps) {
    if (fps >= 30) return 'fps-good';
    if (fps >= 20) return 'fps-warning';
    return 'fps-critical';
  }
  
  getCurrentFPS() {
    return this.fps;
  }
  
  getAverageFPS() {
    if (this.history.length === 0) return 0;
    const sum = this.history.reduce((acc, entry) => acc + entry.fps, 0);
    return Math.round(sum / this.history.length);
  }
  
  getMinFPS() {
    if (this.history.length === 0) return 0;
    return Math.min(...this.history.map(entry => entry.fps));
  }
  
  getMaxFPS() {
    if (this.history.length === 0) return 0;
    return Math.max(...this.history.map(entry => entry.fps));
  }
  
  stopTracking() {
    this.isTracking = false;
  }
}

class MemoryTracker {
  constructor() {
    this.measurements = [];
    this.maxMeasurements = 100;
    this.startTracking();
  }
  
  startTracking() {
    setInterval(() => {
      this.measureMemoryUsage();
    }, 30000); // Every 30 seconds
  }
  
  measureMemoryUsage() {
    let memoryInfo = null;
    
    // Try different methods to get memory info
    if ('memory' in performance) {
      memoryInfo = performance.memory;
    } else if ('webkitMemory' in performance) {
      memoryInfo = performance.webkitMemory;
    }
    
    const measurement = {
      timestamp: Date.now(),
      used: memoryInfo ? memoryInfo.usedJSHeapSize : null,
      total: memoryInfo ? memoryInfo.totalJSHeapSize : null,
      limit: memoryInfo ? memoryInfo.jsHeapSizeLimit : null,
      localStorageSize: this.getLocalStorageSize(),
      domNodeCount: document.querySelectorAll('*').length
    };
    
    this.measurements.push(measurement);
    
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }
    
    return measurement;
  }
  
  getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
  
  getUsage() {
    const latest = this.measurements[this.measurements.length - 1];
    if (!latest || !latest.used || !latest.limit) {
      // Fallback estimation
      return (this.getLocalStorageSize() / (5 * 1024 * 1024)) * 100; // Assume 5MB limit
    }
    
    return (latest.used / latest.limit) * 100;
  }
  
  getUsageTrend() {
    if (this.measurements.length < 10) return 'stable';
    
    const recent = this.measurements.slice(-10);
    const firstUsage = recent[0].used;
    const lastUsage = recent[recent.length - 1].used;
    
    if (!firstUsage || !lastUsage) return 'unknown';
    
    const change = ((lastUsage - firstUsage) / firstUsage) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }
}

class ThermalTracker {
  constructor() {
    this.thermalState = 'normal';
    this.temperatureHistory = [];
    this.performanceHistory = [];
    this.startMonitoring();
  }
  
  startMonitoring() {
    setInterval(() => {
      this.assessThermalState();
    }, 5000); // Every 5 seconds
  }
  
  assessThermalState() {
    // Use performance metrics to infer thermal state
    const startTime = performance.now();
    
    // CPU-intensive operation to test throttling
    this.performCPUTest();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.performanceHistory.push({
      timestamp: Date.now(),
      duration: duration
    });
    
    // Keep only last 20 measurements
    if (this.performanceHistory.length > 20) {
      this.performanceHistory.shift();
    }
    
    // Analyze performance degradation
    if (this.performanceHistory.length >= 5) {
      const recent = this.performanceHistory.slice(-5);
      const avgRecent = recent.reduce((sum, p) => sum + p.duration, 0) / recent.length;
      
      const baseline = this.performanceHistory.slice(0, 5);
      const avgBaseline = baseline.reduce((sum, p) => sum + p.duration, 0) / baseline.length;
      
      const degradation = (avgRecent - avgBaseline) / avgBaseline;
      
      if (degradation > 0.5) {
        this.thermalState = 'throttling';
      } else if (degradation > 0.2) {
        this.thermalState = 'warm';
      } else {
        this.thermalState = 'normal';
      }
    }
    
    return this.thermalState;
  }
  
  performCPUTest() {
    // Light CPU test to detect throttling
    const iterations = 10000;
    let result = 0;
    
    for (let i = 0; i < iterations; i++) {
      result += Math.sin(i) * Math.cos(i);
    }
    
    return result; // Prevent optimization
  }
  
  getState() {
    return this.thermalState;
  }
  
  getTemperatureEstimate() {
    // Rough estimation based on performance degradation
    switch (this.thermalState) {
      case 'normal': return '< 60°C';
      case 'warm': return '60-70°C';
      case 'throttling': return '> 70°C';
      default: return 'Unknown';
    }
  }
}

class APILatencyTracker {
  constructor() {
    this.latencies = [];
    this.maxLatencies = 50;
    this.averageLatency = 0;
  }
  
  recordLatency(latency) {
    this.latencies.push({
      timestamp: Date.now(),
      latency: latency
    });
    
    if (this.latencies.length > this.maxLatencies) {
      this.latencies.shift();
    }
    
    this.updateAverageLatency();
  }
  
  updateAverageLatency() {
    if (this.latencies.length === 0) {
      this.averageLatency = 0;
      return;
    }
    
    const sum = this.latencies.reduce((total, entry) => total + entry.latency, 0);
    this.averageLatency = sum / this.latencies.length;
  }
  
  getAverageLatency() {
    return this.averageLatency;
  }
  
  getLatestLatency() {
    return this.latencies.length > 0 ? this.latencies[this.latencies.length - 1].latency : 0;
  }
  
  getLatencyTrend() {
    if (this.latencies.length < 10) return 'stable';
    
    const recent = this.latencies.slice(-5);
    const earlier = this.latencies.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, l) => sum + l.latency, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, l) => sum + l.latency, 0) / earlier.length;
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (change > 20) return 'increasing';
    if (change < -20) return 'decreasing';
    return 'stable';
  }
}
```

### Usage Analytics System

```javascript
class TeslaDashboardAnalytics {
  constructor() {
    this.analyticsEnabled = window.PRIVACY_SETTINGS?.analyticsEnabled || false;
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.eventQueue = [];
    this.userBehaviorPatterns = new Map();
    this.appUsageStats = new Map();
    this.performanceMetrics = new Map();
    
    if (this.analyticsEnabled) {
      this.initializeAnalytics();
    }
  }
  
  initializeAnalytics() {
    this.loadStoredAnalytics();
    this.setupEventListeners();
    this.startSessionTracking();
    this.scheduleDataFlush();
  }
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  loadStoredAnalytics() {
    try {
      const stored = localStorage.getItem('analytics_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.appUsageStats = new Map(data.appUsage || []);
        this.userBehaviorPatterns = new Map(data.behaviorPatterns || []);
      }
    } catch (error) {
      console.error('Failed to load stored analytics:', error);
    }
  }
  
  setupEventListeners() {
    // Track app launches
    document.addEventListener('app-launched', (event) => {
      this.trackAppUsage(event.detail.appId, 'launch');
    });
    
    // Track app usage duration
    document.addEventListener('app-closed', (event) => {
      this.trackAppUsage(event.detail.appId, 'close', event.detail.duration);
    });
    
    // Track Tesla API calls
    document.addEventListener('tesla-api-call', (event) => {
      this.trackTeslaAPIUsage(event.detail.endpoint, event.detail.responseTime, event.detail.success);
    });
    
    // Track user interactions
    document.addEventListener('click', (event) => {
      this.trackUserInteraction('click', event.target);
    });
    
    // Track navigation
    window.addEventListener('hashchange', () => {
      this.trackNavigation(window.location.hash);
    });
  }
  
  trackEvent(category, action, label = null, value = null, customData = {}) {
    if (!this.analyticsEnabled) return;
    
    const event = {
      id: this.generateEventId(),
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
        sessionDuration: Date.now() - this.sessionStart,
        teslaModel: this.detectTeslaModel()
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
    
    // Update usage statistics
    this.updateAppUsageStats(appId, action, duration);
  }
  
  updateAppUsageStats(appId, action, duration) {
    const today = new Date().toDateString();
    const key = `${appId}_${today}`;
    
    if (!this.appUsageStats.has(key)) {
      this.appUsageStats.set(key, {
        appId,
        date: today,
        launches: 0,
        totalDuration: 0,
        sessions: []
      });
    }
    
    const stats = this.appUsageStats.get(key);
    
    if (action === 'launch') {
      stats.launches++;
      stats.sessions.push({ start: Date.now(), duration: null });
    } else if (action === 'close' && duration) {
      stats.totalDuration += duration;
      const lastSession = stats.sessions[stats.sessions.length - 1];
      if (lastSession) {
        lastSession.duration = duration;
      }
    }
    
    this.appUsageStats.set(key, stats);
  }
  
  trackTeslaAPIUsage(endpoint, responseTime, success) {
    this.trackEvent('tesla_api', 'call', endpoint, responseTime, {
      success,
      apiProvider: window.teslaAPI?.provider || 'unknown',
      vehicleState: window.teslaAPI?.getVehicleState() || 'unknown'
    });
    
    // Track API performance
    const apiKey = `api_${endpoint}`;
    if (!this.performanceMetrics.has(apiKey)) {
      this.performanceMetrics.set(apiKey, {
        endpoint,
        calls: 0,
        totalResponseTime: 0,
        successCount: 0,
        errorCount: 0
      });
    }
    
    const metrics = this.performanceMetrics.get(apiKey);
    metrics.calls++;
    metrics.totalResponseTime += responseTime;
    
    if (success) {
      metrics.successCount++;
    } else {
      metrics.errorCount++;
    }
    
    this.performanceMetrics.set(apiKey, metrics);
  }
  
  trackUserInteraction(type, element) {
    const elementInfo = this.getElementInfo(element);
    
    this.trackEvent('user_interaction', type, elementInfo.selector, null, {
      elementType: elementInfo.tagName,
      elementClass: elementInfo.className,
      elementId: elementInfo.id
    });
    
    // Update behavior patterns
    this.updateBehaviorPatterns(type, elementInfo);
  }
  
  updateBehaviorPatterns(interactionType, elementInfo) {
    const hour = new Date().getHours();
    const patternKey = `${interactionType}_${hour}`;
    
    if (!this.userBehaviorPatterns.has(patternKey)) {
      this.userBehaviorPatterns.set(patternKey, {
        count: 0,
        elements: new Map()
      });
    }
    
    const pattern = this.userBehaviorPatterns.get(patternKey);
    pattern.count++;
    
    const elementKey = elementInfo.selector;
    if (!pattern.elements.has(elementKey)) {
      pattern.elements.set(elementKey, 0);
    }
    pattern.elements.set(elementKey, pattern.elements.get(elementKey) + 1);
    
    this.userBehaviorPatterns.set(patternKey, pattern);
  }
  
  generateUsageReport() {
    return {
      session: this.generateSessionReport(),
      apps: this.generateAppUsageReport(),
      performance: this.generatePerformanceReport(),
      tesla: this.generateTeslaUsageReport(),
      behavior: this.generateBehaviorReport(),
      recommendations: this.generateRecommendations()
    };
  }
  
  generateSessionReport() {
    return {
      sessionId: this.sessionId,
      startTime: new Date(this.sessionStart).toISOString(),
      duration: this.formatDuration(Date.now() - this.sessionStart),
      totalEvents: this.eventQueue.length,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        teslaModel: this.detectTeslaModel()
      }
    };
  }
  
  generateAppUsageReport() {
    const today = new Date().toDateString();
    const todayStats = [];
    
    this.appUsageStats.forEach((stats, key) => {
      if (stats.date === today) {
        todayStats.push({
          appId: stats.appId,
          launches: stats.launches,
          totalDuration: this.formatDuration(stats.totalDuration),
          averageSession: stats.sessions.length > 0 
            ? this.formatDuration(stats.totalDuration / stats.sessions.length)
            : '0:00',
          category: this.getAppCategory(stats.appId)
        });
      }
    });
    
    return {
      today: todayStats.sort((a, b) => b.launches - a.launches),
      mostUsedApps: this.getMostUsedApps(7), // Last 7 days
      usageByCategory: this.getUsageByCategory()
    };
  }
  
  generatePerformanceReport() {
    const performanceData = [];
    
    this.performanceMetrics.forEach((metrics, key) => {
      if (metrics.calls > 0) {
        performanceData.push({
          endpoint: metrics.endpoint,
          calls: metrics.calls,
          averageResponseTime: Math.round(metrics.totalResponseTime / metrics.calls),
          successRate: Math.round((metrics.successCount / metrics.calls) * 100),
          errorRate: Math.round((metrics.errorCount / metrics.calls) * 100)
        });
      }
    });
    
    return {
      apiPerformance: performanceData.sort((a, b) => b.calls - a.calls),
      systemPerformance: this.getSystemPerformanceMetrics()
    };
  }
  
  generateTeslaUsageReport() {
    const teslaEvents = this.eventQueue.filter(event => 
      event.category === 'tesla_api' || 
      event.category === 'tesla_control'
    );
    
    const apiCalls = teslaEvents.filter(e => e.category === 'tesla_api');
    const controlActions = teslaEvents.filter(e => e.category === 'tesla_control');
    
    return {
      totalAPIcalls: apiCalls.length,
      totalControlActions: controlActions.length,
      mostUsedEndpoints: this.getMostUsedEndpoints(apiCalls),
      mostUsedControls: this.getMostUsedControls(controlActions),
      connectionReliability: this.calculateConnectionReliability(apiCalls)
    };
  }
  
  generateBehaviorReport() {
    const patterns = [];
    
    this.userBehaviorPatterns.forEach((pattern, key) => {
      const [action, hour] = key.split('_');
      patterns.push({
        action,
        hour: parseInt(hour),
        count: pattern.count,
        topElements: Array.from(pattern.elements.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      });
    });
    
    return {
      hourlyPatterns: this.groupPatternsByHour(patterns),
      mostActiveHours: this.getMostActiveHours(patterns),
      commonInteractions: this.getCommonInteractions(patterns)
    };
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    // Performance recommendations
    const avgFPS = window.performanceMonitor?.metrics.fps.getAverageFPS() || 30;
    if (avgFPS < 25) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Improve Performance',
        description: 'Frame rate is below optimal. Consider reducing visual effects.',
        action: 'Open Performance Settings',
        category: 'system'
      });
    }
    
    // Usage recommendations
    const unusedApps = this.getUnusedApps(7); // Apps not used in 7 days
    if (unusedApps.length > 0) {
      recommendations.push({
        type: 'usage',
        priority: 'medium',
        title: 'Optimize App Layout',
        description: `${unusedApps.length} apps haven't been used recently`,
        action: 'Review App Arrangement',
        category: 'organization'
      });
    }
    
    // Tesla-specific recommendations
    const apiErrorRate = this.calculateAPIErrorRate();
    if (apiErrorRate > 10) {
      recommendations.push({
        type: 'tesla',
        priority: 'medium',
        title: 'Check Tesla Connection',
        description: 'High API error rate detected. Check cellular connection.',
        action: 'Test Connection',
        category: 'connectivity'
      });
    }
    
    // Behavior recommendations
    const behaviorInsights = this.analyzeBehaviorPatterns();
    if (behaviorInsights.length > 0) {
      recommendations.push(...behaviorInsights);
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  flushEvents() {
    if (this.eventQueue.length === 0) return;
    
    // Store events locally
    this.storeAnalyticsData();
    
    // Send to backend if online and privacy allows
    if (this.analyticsEnabled && navigator.onLine) {
      this.sendEventsToBackend();
    }
    
    // Clear queue
    this.eventQueue = [];
  }
  
  storeAnalyticsData() {
    const dataToStore = {
      appUsage: Array.from(this.appUsageStats.entries()),
      behaviorPatterns: Array.from(this.userBehaviorPatterns.entries()),
      lastUpdate: Date.now()
    };
    
    try {
      localStorage.setItem('analytics_data', JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to store analytics data:', error);
    }
  }
  
  async sendEventsToBackend() {
    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          events: this.eventQueue
        })
      });
      
      if (!response.ok) {
        throw new Error(`Analytics upload failed: ${response.status}`);
      }
      
    } catch (error) {
      console.debug('Analytics upload failed (offline):', error);
      // Continue offline operation
    }
  }
  
  // Helper methods
  detectTeslaModel() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Tesla')) {
      if (userAgent.includes('Model S')) return 'Model S';
      if (userAgent.includes('Model 3')) return 'Model 3';
      if (userAgent.includes('Model X')) return 'Model X';
      if (userAgent.includes('Model Y')) return 'Model Y';
      return 'Tesla Unknown';
    }
    return 'Non-Tesla';
  }
  
  getAppCategory(appId) {
    const categories = {
      'tesla-control': 'Tesla Core',
      'tesla-status': 'Tesla Core',
      'charging-hub': 'Tesla Core',
      'climate-pro': 'Tesla Core',
      'weather-pro': 'Productivity',
      'calendar': 'Productivity',
      'notes-pro': 'Productivity',
      'music': 'Entertainment',
      'news-feed': 'Entertainment',
      'crypto-tracker': 'Advanced',
      'home-assistant': 'Advanced'
    };
    
    return categories[appId] || 'Utility';
  }
  
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
  }
}
```

---