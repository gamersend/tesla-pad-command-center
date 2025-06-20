# 🔌 Tesla API and Automation System

## Overview

Comprehensive Tesla vehicle integration with dual API strategy, intelligent automation, and advanced vehicle control capabilities optimized for reliability and user experience.

## API Architecture Strategy

### Dual API Implementation

#### Primary: Tessie API

**Recommended for reliability and feature completeness**

```javascript
const TessieAPIConfig = {
  baseURL: 'https://api.tessie.com',
  authentication: 'Bearer Token',
  rateLimit: {
    calls: 200,
    window: 900000, // 15 minutes
    burst: 10 // Allow burst of 10 calls
  },
  
  advantages: [
    'Highest reliability and uptime',
    'Real-time streaming data',
    'Historical data access',
    'Multiple vehicle support',
    'Comprehensive command set',
    'Active development and support'
  ],
  
  pricing: 'Paid service - $4.99/month per vehicle',
  
  endpoints: {
    vehicles: '/vehicles',
    vehicleData: '/vehicles/{id}',
    commands: '/vehicles/{id}/command/{command}',
    streaming: '/vehicles/{id}/streaming',
    history: '/vehicles/{id}/history',
    location: '/vehicles/{id}/location'
  }
};
```

#### Fallback: Tesla Fleet API

**Official Tesla API for backup and fleet use**

```javascript
const TeslaFleetAPIConfig = {
  baseURL: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
  authentication: 'OAuth 2.0 Bearer Token',
  rateLimit: {
    calls: 1000,
    window: 86400000, // 24 hours
    burst: 5
  },
  
  advantages: [
    'Official Tesla API',
    'No third-party dependency',
    'Fleet management features',
    'Free for personal use',
    'Direct from Tesla'
  ],
  
  limitations: [
    'Lower rate limits',
    'Less reliable than Tessie',
    'Fewer historical features',
    'OAuth complexity',
    'Vehicle must be enrolled in Fleet API'
  ],
  
  endpoints: {
    vehicles: '/api/1/vehicles',
    vehicleData: '/api/1/vehicles/{id}/vehicle_data',
    commands: '/api/1/vehicles/{id}/command/{command}',
    wakeUp: '/api/1/vehicles/{id}/wake_up'
  }
};
```

## Tesla API Manager Implementation

### Core API Manager

```javascript
class TeslaAPIManager {
  constructor() {
    this.primaryAPI = new TessieAPI();
    this.fallbackAPI = new TeslaFleetAPI();
    this.currentAPI = null;
    this.vehicleCache = new Map();
    this.commandQueue = [];
    this.rateLimiter = new APIRateLimiter();
    this.errorHandler = new APIErrorHandler();
    
    this.initializeAPI();
  }
  
  async initializeAPI() {
    // Try Tessie first
    try {
      await this.primaryAPI.authenticate();
      this.currentAPI = this.primaryAPI;
      console.log('Using Tessie API as primary');
    } catch (error) {
      console.warn('Tessie API unavailable, falling back to Tesla Fleet API');
      try {
        await this.fallbackAPI.authenticate();
        this.currentAPI = this.fallbackAPI;
        console.log('Using Tesla Fleet API as fallback');
      } catch (fallbackError) {
        console.error('Both APIs failed to authenticate');
        throw new Error('No Tesla API available');
      }
    }
  }
  
  async getVehicleData(vehicleId, useCache = true) {
    if (useCache && this.vehicleCache.has(vehicleId)) {
      const cached = this.vehicleCache.get(vehicleId);
      if (Date.now() - cached.timestamp < 30000) { // 30 second cache
        return cached.data;
      }
    }
    
    try {
      if (!this.rateLimiter.canMakeRequest()) {
        throw new Error('Rate limit exceeded');
      }
      
      const data = await this.currentAPI.getVehicleData(vehicleId);
      this.cacheVehicleData(vehicleId, data);
      this.rateLimiter.recordRequest();
      
      return data;
    } catch (error) {
      return await this.handleAPIError(error, 'getVehicleData', [vehicleId, useCache]);
    }
  }
  
  async executeCommand(vehicleId, command, params = {}) {
    try {
      // Ensure vehicle is awake
      await this.ensureVehicleAwake(vehicleId);
      
      if (!this.rateLimiter.canMakeRequest()) {
        // Queue command if rate limited
        return await this.queueCommand(vehicleId, command, params);
      }
      
      const result = await this.currentAPI.executeCommand(vehicleId, command, params);
      this.rateLimiter.recordRequest();
      
      // Log command execution
      this.logCommandExecution(vehicleId, command, params, result);
      
      return {
        success: true,
        result: result,
        executedAt: Date.now()
      };
      
    } catch (error) {
      return await this.handleAPIError(error, 'executeCommand', [vehicleId, command, params]);
    }
  }
  
  async ensureVehicleAwake(vehicleId, maxRetries = 3) {
    const vehicleData = await this.getVehicleData(vehicleId, false);
    
    if (vehicleData.state === 'online') {
      return true;
    }
    
    console.log('Vehicle is asleep, attempting to wake...');
    this.showWakeUpNotification(vehicleId);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.currentAPI.wakeVehicle(vehicleId);
        
        // Poll for wake up (max 30 seconds)
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const updatedData = await this.getVehicleData(vehicleId, false);
          
          if (updatedData.state === 'online') {
            this.hideWakeUpNotification();
            return true;
          }
        }
      } catch (error) {
        console.warn(`Wake attempt ${attempt} failed:`, error);
      }
    }
    
    this.hideWakeUpNotification();
    throw new Error('Failed to wake vehicle after multiple attempts');
  }
  
  async handleAPIError(error, method, args) {
    console.error(`API Error in ${method}:`, error);
    
    // Try switching APIs if current one fails
    if (this.currentAPI === this.primaryAPI && this.fallbackAPI.isAvailable()) {
      console.log('Switching to fallback API');
      this.currentAPI = this.fallbackAPI;
      
      try {
        // Retry with fallback API
        switch (method) {
          case 'getVehicleData':
            return await this.getVehicleData(...args);
          case 'executeCommand':
            return await this.executeCommand(...args);
          default:
            throw error;
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
    }
    
    // Return error response
    return {
      success: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
}
```

### Rate Limiting System

```javascript
class APIRateLimiter {
  constructor() {
    this.requestHistory = [];
    this.limits = {
      tessie: { calls: 200, window: 900000 }, // 200 calls per 15 minutes
      tesla_fleet: { calls: 1000, window: 86400000 }, // 1000 calls per day
      wake_commands: { calls: 5, window: 900000 } // 5 wake commands per 15 minutes
    };
    
    this.currentProvider = 'tessie';
  }
  
  canMakeRequest(commandType = 'general') {
    const now = Date.now();
    const limit = this.limits[this.currentProvider];
    
    if (commandType === 'wake') {
      const wakeLimit = this.limits.wake_commands;
      const recentWakeCommands = this.requestHistory.filter(
        req => req.type === 'wake' && now - req.timestamp < wakeLimit.window
      );
      
      if (recentWakeCommands.length >= wakeLimit.calls) {
        return false;
      }
    }
    
    // Check general rate limit
    const recentRequests = this.requestHistory.filter(
      req => now - req.timestamp < limit.window
    );
    
    return recentRequests.length < limit.calls;
  }
  
  recordRequest(commandType = 'general') {
    this.requestHistory.push({
      timestamp: Date.now(),
      type: commandType,
      provider: this.currentProvider
    });
    
    // Clean old entries
    const now = Date.now();
    const maxWindow = Math.max(...Object.values(this.limits).map(l => l.window));
    this.requestHistory = this.requestHistory.filter(
      req => now - req.timestamp < maxWindow
    );
  }
  
  getTimeUntilNextRequest() {
    const now = Date.now();
    const limit = this.limits[this.currentProvider];
    const oldestRelevantRequest = this.requestHistory
      .filter(req => now - req.timestamp < limit.window)
      .sort((a, b) => a.timestamp - b.timestamp)[0];
    
    if (!oldestRelevantRequest) return 0;
    
    return Math.max(0, (oldestRelevantRequest.timestamp + limit.window) - now);
  }
}
```

## Tesla Vehicle Automation System

### Automation Engine

```javascript
class TeslaAutomationEngine {
  constructor() {
    this.automationRules = new Map();
    this.activeMonitors = new Map();
    this.locationService = new LocationService();
    this.calendarService = new CalendarService();
    this.weatherService = new WeatherService();
    this.scheduleService = new ScheduleService();
    
    this.initializeDefaultRules();
    this.startMonitoring();
  }
  
  initializeDefaultRules() {
    const defaultRules = [
      {
        id: 'arrive_home_evening',
        name: 'Arrive Home (Evening)',
        description: 'Actions when arriving home after 6 PM',
        enabled: false,
        trigger: {
          type: 'location',
          location: 'home',
          event: 'arrive',
          radius: 150, // meters
          conditions: {
            timeAfter: '18:00',
            timeBefore: '23:59'
          }
        },
        actions: [
          {
            type: 'vehicle_command',
            command: 'flash_lights',
            description: 'Flash lights to signal arrival'
          },
          {
            type: 'climate_control',
            command: 'stop_climate',
            description: 'Turn off climate control'
          },
          {
            type: 'notification',
            message: 'Welcome home! Vehicle secured.',
            duration: 5000
          }
        ]
      },
      
      {
        id: 'departure_preparation',
        name: 'Departure Preparation',
        description: 'Prepare vehicle before scheduled departure',
        enabled: false,
        trigger: {
          type: 'calendar',
          eventKeywords: ['meeting', 'appointment', 'work'],
          timeBefore: 15, // minutes before event
          conditions: {
            hasLocation: true,
            travelTimeRequired: true
          }
        },
        actions: [
          {
            type: 'climate_control',
            command: 'start_climate',
            params: { temperature: 22 },
            description: 'Pre-condition cabin'
          },
          {
            type: 'charging_check',
            minimumLevel: 80,
            description: 'Ensure sufficient charge for trip'
          },
          {
            type: 'notification',
            message: 'Vehicle prepared for {event_name}. Departure in {time_remaining}.',
            actions: ['View Route', 'Delay Departure']
          }
        ]
      },
      
      {
        id: 'charging_optimization',
        name: 'Smart Charging',
        description: 'Optimize charging based on schedule and rates',
        enabled: false,
        trigger: {
          type: 'schedule',
          pattern: 'daily',
          time: '23:00',
          conditions: {
            batteryBelow: 80,
            pluggedIn: true
          }
        },
        actions: [
          {
            type: 'charging_schedule',
            optimizeForCost: true,
            targetLevel: 80,
            departureTime: 'next_calendar_event',
            description: 'Schedule charging during off-peak hours'
          }
        ]
      },
      
      {
        id: 'low_battery_alert',
        name: 'Low Battery Alert',
        description: 'Alert when battery is low with nearby charging options',
        enabled: true,
        trigger: {
          type: 'vehicle_state',
          condition: 'battery_level < 20',
          frequency: 'once_per_trip'
        },
        actions: [
          {
            type: 'find_chargers',
            radius: 10, // miles
            types: ['supercharger', 'fast_charging']
          },
          {
            type: 'notification',
            priority: 'high',
            message: 'Battery low ({battery_level}%). Nearest Supercharger: {nearest_charger}',
            actions: ['Navigate to Charger', 'Find Alternatives']
          }
        ]
      },
      
      {
        id: 'weather_based_preconditioning',
        name: 'Weather-Based Pre-conditioning',
        description: 'Adjust pre-conditioning based on weather conditions',
        enabled: false,
        trigger: {
          type: 'calendar',
          timeBefore: 20, // minutes before departure
          conditions: {
            weatherExtreme: true // Very hot or cold
          }
        },
        actions: [
          {
            type: 'weather_check',
            location: 'departure'
          },
          {
            type: 'climate_control',
            command: 'start_climate',
            params: {
              temperature: 'weather_optimized',
              defrost: 'if_cold',
              maxDefrost: 'if_freezing'
            }
          }
        ]
      }
    ];
    
    defaultRules.forEach(rule => {
      this.automationRules.set(rule.id, rule);
    });
  }
  
  async processLocationTrigger(currentLocation) {
    for (const [ruleId, rule] of this.automationRules) {
      if (!rule.enabled || rule.trigger.type !== 'location') continue;
      
      const distance = this.calculateDistance(currentLocation, this.getLocationCoords(rule.trigger.location));
      const isWithinRadius = distance <= rule.trigger.radius;
      
      const ruleState = this.getRuleState(ruleId);
      const now = new Date();
      
      // Check time conditions
      if (rule.trigger.conditions) {
        if (rule.trigger.conditions.timeAfter) {
          const timeAfter = this.parseTime(rule.trigger.conditions.timeAfter);
          if (now.getHours() * 60 + now.getMinutes() < timeAfter) continue;
        }
        
        if (rule.trigger.conditions.timeBefore) {
          const timeBefore = this.parseTime(rule.trigger.conditions.timeBefore);
          if (now.getHours() * 60 + now.getMinutes() > timeBefore) continue;
        }
      }
      
      // Handle arrive/leave events
      if (rule.trigger.event === 'arrive' && isWithinRadius && !ruleState.lastTriggered) {
        await this.executeAutomationRule(rule);
        this.setRuleState(ruleId, { lastTriggered: Date.now() });
      } else if (rule.trigger.event === 'leave' && !isWithinRadius && ruleState.lastTriggered) {
        await this.executeAutomationRule(rule);
        this.setRuleState(ruleId, { lastTriggered: null });
      }
    }
  }
  
  async processCalendarTrigger() {
    const upcomingEvents = await this.calendarService.getUpcomingEvents(1440); // Next 24 hours
    
    for (const event of upcomingEvents) {
      for (const [ruleId, rule] of this.automationRules) {
        if (!rule.enabled || rule.trigger.type !== 'calendar') continue;
        
        const triggerTime = event.startTime - (rule.trigger.timeBefore * 60 * 1000);
        const now = Date.now();
        
        // Check if it's time to trigger (within 1 minute window)
        if (Math.abs(now - triggerTime) <= 60000) {
          // Check conditions
          if (rule.trigger.conditions) {
            if (rule.trigger.conditions.hasLocation && !event.location) continue;
            
            if (rule.trigger.eventKeywords) {
              const hasKeyword = rule.trigger.eventKeywords.some(keyword =>
                event.summary.toLowerCase().includes(keyword.toLowerCase())
              );
              if (!hasKeyword) continue;
            }
          }
          
          // Check if already triggered for this event
          const ruleState = this.getRuleState(ruleId);
          if (ruleState.lastEventId === event.id) continue;
          
          await this.executeAutomationRule(rule, { event });
          this.setRuleState(ruleId, { lastEventId: event.id });
        }
      }
    }
  }
  
  async executeAutomationRule(rule, context = {}) {
    console.log(`Executing automation rule: ${rule.name}`);
    
    try {
      for (const action of rule.actions) {
        await this.executeAction(action, context);
        // Brief delay between actions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      this.logAutomationExecution(rule, context, 'success');
      
    } catch (error) {
      console.error(`Automation rule failed: ${rule.name}`, error);
      this.logAutomationExecution(rule, context, 'error', error.message);
      
      this.showAutomationError(rule.name, error.message);
    }
  }
  
  async executeAction(action, context) {
    switch (action.type) {
      case 'vehicle_command':
        await teslaAPI.executeCommand(this.getCurrentVehicleId(), action.command, action.params);
        break;
        
      case 'climate_control':
        if (action.command === 'start_climate') {
          let params = action.params || {};
          
          if (params.temperature === 'weather_optimized') {
            const weather = await this.weatherService.getCurrentWeather();
            params.temperature = this.calculateOptimalTemperature(weather);
          }
          
          await teslaAPI.executeCommand(this.getCurrentVehicleId(), 'start_climate');
          if (params.temperature) {
            await teslaAPI.executeCommand(this.getCurrentVehicleId(), 'set_temperature', {
              driver_temp: params.temperature,
              passenger_temp: params.temperature
            });
          }
        } else {
          await teslaAPI.executeCommand(this.getCurrentVehicleId(), action.command, action.params);
        }
        break;
        
      case 'charging_schedule':
        await this.scheduleOptimalCharging(action);
        break;
        
      case 'find_chargers':
        const chargers = await this.findNearbyChargers(action.radius, action.types);
        context.nearestCharger = chargers[0];
        break;
        
      case 'notification':
        const message = this.processMessageTemplate(action.message, context);
        this.showNotification(message, action.priority, action.actions);
        break;
        
      case 'weather_check':
        const weather = await this.weatherService.getCurrentWeather();
        context.weather = weather;
        break;
        
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }
  
  createCustomAutomation(config) {
    const automation = {
      id: `custom_${Date.now()}`,
      name: config.name,
      description: config.description,
      enabled: config.enabled !== false,
      trigger: config.trigger,
      actions: config.actions,
      created: Date.now(),
      custom: true
    };
    
    this.automationRules.set(automation.id, automation);
    this.saveAutomationRules();
    
    return automation;
  }
}
```

### Smart Charging System

```javascript
class SmartChargingManager {
  constructor() {
    this.electricityRates = null;
    this.chargingSchedules = new Map();
    this.chargingHistory = [];
    this.optimizationSettings = {
      costOptimization: true,
      batteryHealthOptimization: true,
      departureTimeOptimization: true,
      weatherConsideration: true
    };
  }
  
  async optimizeChargingSchedule(departureTime, targetChargeLevel = 80) {
    const vehicleData = await teslaAPI.getVehicleData();
    const currentCharge = vehicleData.charge_state.battery_level;
    const chargingNeeded = targetChargeLevel - currentCharge;
    
    if (chargingNeeded <= 0) {
      return {
        recommendation: 'no_charging_needed',
        message: 'Vehicle already at target charge level'
      };
    }
    
    // Calculate charging time needed
    const chargingRate = await this.getEstimatedChargingRate();
    const chargingTimeNeeded = (chargingNeeded / 100) * vehicleData.charge_state.battery_range / chargingRate;
    
    // Get electricity rates
    const rates = await this.getElectricityRates();
    
    // Find optimal charging window
    const optimalWindow = this.findOptimalChargingWindow(
      chargingTimeNeeded,
      departureTime,
      rates
    );
    
    // Create charging schedule
    const schedule = {
      id: `schedule_${Date.now()}`,
      startTime: optimalWindow.startTime,
      endTime: optimalWindow.endTime,
      targetLevel: targetChargeLevel,
      estimatedCost: optimalWindow.estimatedCost,
      savings: optimalWindow.savings,
      departureTime: departureTime,
      weatherAdjustment: await this.getWeatherAdjustment(departureTime)
    };
    
    this.chargingSchedules.set(schedule.id, schedule);
    
    return {
      recommendation: 'schedule_created',
      schedule: schedule,
      message: `Optimal charging: ${new Date(schedule.startTime).toLocaleTimeString()} - ${new Date(schedule.endTime).toLocaleTimeString()}`
    };
  }
  
  findOptimalChargingWindow(duration, deadline, rates) {
    const windows = [];
    const now = Date.now();
    const windowStart = now;
    const windowEnd = deadline - duration;
    
    // Generate potential charging windows
    for (let start = windowStart; start <= windowEnd; start += 3600000) { // 1 hour increments
      const end = start + duration;
      
      if (end > deadline) break;
      
      const cost = this.calculateChargingCost(start, end, rates);
      const timeSlot = this.getTimeSlotInfo(start, end);
      
      windows.push({
        startTime: start,
        endTime: end,
        cost: cost,
        timeSlot: timeSlot,
        score: this.calculateWindowScore(start, end, cost, timeSlot)
      });
    }
    
    // Sort by score (lower is better)
    windows.sort((a, b) => a.score - b.score);
    
    const optimalWindow = windows[0];
    const baselineCost = this.calculateChargingCost(now, now + duration, rates);
    
    return {
      ...optimalWindow,
      estimatedCost: optimalWindow.cost,
      savings: baselineCost - optimalWindow.cost
    };
  }
  
  calculateWindowScore(startTime, endTime, cost, timeSlot) {
    let score = cost; // Base score on cost
    
    // Prefer off-peak hours
    if (timeSlot.isPeak) {
      score *= 1.5;
    } else if (timeSlot.isOffPeak) {
      score *= 0.8;
    }
    
    // Prefer overnight charging (11 PM - 6 AM)
    const startHour = new Date(startTime).getHours();
    if (startHour >= 23 || startHour <= 6) {
      score *= 0.9;
    }
    
    // Slight penalty for very late charging (closer to departure)
    const timeToDeadline = endTime - startTime;
    if (timeToDeadline < 2 * 3600000) { // Less than 2 hours before departure
      score *= 1.1;
    }
    
    return score;
  }
  
  async monitorChargingSession(sessionId) {
    const session = {
      id: sessionId,
      startTime: Date.now(),
      startLevel: null,
      endLevel: null,
      energyAdded: null,
      cost: null,
      efficiency: null,
      completed: false
    };
    
    // Get initial state
    const initialData = await teslaAPI.getVehicleData();
    session.startLevel = initialData.charge_state.battery_level;
    
    // Monitor charging progress
    const monitorInterval = setInterval(async () => {
      try {
        const vehicleData = await teslaAPI.getVehicleData();
        const chargingState = vehicleData.charge_state.charging_state;
        
        if (chargingState !== 'Charging') {
          // Charging complete or stopped
          session.endTime = Date.now();
          session.endLevel = vehicleData.charge_state.battery_level;
          session.energyAdded = ((session.endLevel - session.startLevel) / 100) * vehicleData.charge_state.battery_range;
          session.completed = true;
          
          this.completeChargingSession(session);
          clearInterval(monitorInterval);
        } else {
          // Update progress
          this.updateChargingProgress(sessionId, vehicleData);
        }
      } catch (error) {
        console.error('Error monitoring charging session:', error);
      }
    }, 30000); // Check every 30 seconds
    
    return session;
  }
  
  async getWeatherAdjustment(departureTime) {
    try {
      const weather = await weatherAPI.getForecast(departureTime);
      let adjustment = 0;
      
      // Cold weather reduces efficiency
      if (weather.temperature < 0) {
        adjustment = 15; // 15% more energy needed
      } else if (weather.temperature < 10) {
        adjustment = 10; // 10% more energy needed
      }
      
      // Hot weather also affects efficiency
      if (weather.temperature > 35) {
        adjustment = 8; // 8% more energy for cooling
      }
      
      return {
        temperature: weather.temperature,
        adjustment: adjustment,
        reason: adjustment > 0 ? `${adjustment}% extra charge recommended for extreme weather` : null
      };
    } catch (error) {
      return { adjustment: 0, reason: null };
    }
  }
}
```

## Advanced Vehicle Integration

### Multi-Vehicle Management

```javascript
class MultiVehicleManager {
  constructor() {
    this.vehicles = new Map();
    this.activeVehicle = null;
    this.householdSettings = {
      sharedAutomations: true,
      chargingPriority: 'round_robin', // 'round_robin', 'battery_level', 'manual'
      homeLocation: null,
      workLocations: []
    };
  }
  
  async discoverVehicles() {
    try {
      const tessieVehicles = await tessieAPI.getVehicles();
      const fleetVehicles = await fleetAPI.getVehicles();
      
      // Combine and deduplicate vehicles
      const allVehicles = [...tessieVehicles, ...fleetVehicles];
      const uniqueVehicles = this.deduplicateVehicles(allVehicles);
      
      uniqueVehicles.forEach(vehicle => {
        this.vehicles.set(vehicle.id, {
          ...vehicle,
          nickname: vehicle.display_name,
          primaryAPI: vehicle.source || 'tessie',
          automationsEnabled: true,
          chargingPriority: 1,
          added: Date.now()
        });
      });
      
      // Set first vehicle as active if none selected
      if (!this.activeVehicle && this.vehicles.size > 0) {
        this.activeVehicle = this.vehicles.keys().next().value;
      }
      
      this.saveVehicleConfiguration();
      return Array.from(this.vehicles.values());
      
    } catch (error) {
      console.error('Failed to discover vehicles:', error);
      return [];
    }
  }
  
  async manageHouseholdCharging() {
    const vehicles = Array.from(this.vehicles.values()).filter(v => v.automationsEnabled);
    const chargingVehicles = [];
    
    for (const vehicle of vehicles) {
      const vehicleData = await teslaAPI.getVehicleData(vehicle.id);
      
      if (vehicleData.charge_state.charging_state === 'Charging') {
        chargingVehicles.push({
          ...vehicle,
          currentLevel: vehicleData.charge_state.battery_level,
          chargingRate: vehicleData.charge_state.charge_rate,
          timeToFull: vehicleData.charge_state.time_to_full_charge
        });
      }
    }
    
    // Optimize charging across household
    if (chargingVehicles.length > 1) {
      await this.optimizeHouseholdCharging(chargingVehicles);
    }
  }
  
  async optimizeHouseholdCharging(chargingVehicles) {
    // Sort by priority and charging needs
    const sortedVehicles = chargingVehicles.sort((a, b) => {
      if (this.householdSettings.chargingPriority === 'battery_level') {
        return a.currentLevel - b.currentLevel; // Lowest battery first
      } else if (this.householdSettings.chargingPriority === 'round_robin') {
        return a.chargingPriority - b.chargingPriority;
      }
      return 0;
    });
    
    // Check if total charging load is sustainable
    const totalChargingRate = sortedVehicles.reduce((sum, v) => sum + v.chargingRate, 0);
    const maxHouseholdRate = this.getMaxHouseholdChargingRate();
    
    if (totalChargingRate > maxHouseholdRate) {
      // Need to reduce charging on some vehicles
      await this.throttleHouseholdCharging(sortedVehicles, maxHouseholdRate);
    }
  }
  
  createSharedAutomation(config) {
    const sharedAutomation = {
      ...config,
      id: `shared_${Date.now()}`,
      shared: true,
      appliesTo: config.vehicleIds || Array.from(this.vehicles.keys()),
      created: Date.now()
    };
    
    // Apply to all specified vehicles
    sharedAutomation.appliesTo.forEach(vehicleId => {
      if (this.vehicles.has(vehicleId)) {
        const vehicle = this.vehicles.get(vehicleId);
        if (!vehicle.sharedAutomations) {
          vehicle.sharedAutomations = [];
        }
        vehicle.sharedAutomations.push(sharedAutomation.id);
      }
    });
    
    return sharedAutomation;
  }
}
```

### Vehicle State Monitoring

```javascript
class VehicleStateMonitor {
  constructor() {
    this.monitoringActive = false;
    this.monitoringInterval = null;
    this.stateHistory = [];
    this.alertThresholds = {
      lowBattery: 20,
      highCabinTemp: 40,
      longUnplugged: 24 * 60 * 60 * 1000, // 24 hours
      suspiciousActivity: true
    };
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    if (this.monitoringActive) return;
    
    this.monitoringActive = true;
    this.monitoringInterval = setInterval(async () => {
      await this.checkVehicleState();
    }, 60000); // Check every minute when active
  }
  
  async checkVehicleState() {
    try {
      const vehicleData = await teslaAPI.getVehicleData();
      const currentState = this.extractRelevantState(vehicleData);
      
      // Store state history
      this.stateHistory.push({
        ...currentState,
        timestamp: Date.now()
      });
      
      // Limit history size
      if (this.stateHistory.length > 1440) { // 24 hours of minute data
        this.stateHistory = this.stateHistory.slice(-1440);
      }
      
      // Check for alerts
      await this.checkAlertConditions(currentState, vehicleData);
      
      // Adjust monitoring frequency based on vehicle state
      this.adjustMonitoringFrequency(currentState);
      
    } catch (error) {
      console.error('Vehicle state monitoring error:', error);
    }
  }
  
  extractRelevantState(vehicleData) {
    return {
      batteryLevel: vehicleData.charge_state?.battery_level,
      chargingState: vehicleData.charge_state?.charging_state,
      range: vehicleData.charge_state?.est_battery_range,
      locked: vehicleData.vehicle_state?.locked,
      sentryMode: vehicleData.vehicle_state?.sentry_mode,
      climateOn: vehicleData.climate_state?.is_climate_on,
      insideTemp: vehicleData.climate_state?.inside_temp,
      outsideTemp: vehicleData.climate_state?.outside_temp,
      location: vehicleData.drive_state ? {
        lat: vehicleData.drive_state.latitude,
        lng: vehicleData.drive_state.longitude
      } : null,
      shiftState: vehicleData.drive_state?.shift_state,
      speed: vehicleData.drive_state?.speed,
      odometer: vehicleData.vehicle_state?.odometer,
      softwareVersion: vehicleData.vehicle_state?.car_version
    };
  }
  
  async checkAlertConditions(currentState, fullVehicleData) {
    const alerts = [];
    
    // Low battery alert
    if (currentState.batteryLevel <= this.alertThresholds.lowBattery) {
      alerts.push({
        type: 'low_battery',
        severity: currentState.batteryLevel <= 10 ? 'critical' : 'warning',
        message: `Battery low: ${currentState.batteryLevel}%`,
        recommendations: await this.getNearbyChargingOptions()
      });
    }
    
    // High cabin temperature alert
    if (currentState.insideTemp > this.alertThresholds.highCabinTemp) {
      alerts.push({
        type: 'high_temp',
        severity: 'warning',
        message: `High cabin temperature: ${currentState.insideTemp}°C`,
        recommendations: ['Enable cabin overheat protection', 'Start climate control remotely']
      });
    }
    
    // Security alerts
    if (this.detectSuspiciousActivity(currentState)) {
      alerts.push({
        type: 'security',
        severity: 'critical',
        message: 'Unusual vehicle activity detected',
        recommendations: ['Check sentry mode footage', 'Verify vehicle location']
      });
    }
    
    // Software update available
    if (this.hasSoftwareUpdateAvailable(fullVehicleData)) {
      alerts.push({
        type: 'software_update',
        severity: 'info',
        message: 'Software update available',
        recommendations: ['Schedule installation during off-hours']
      });
    }
    
    // Process alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
  }
  
  detectSuspiciousActivity(currentState) {
    if (this.stateHistory.length < 10) return false;
    
    const recentHistory = this.stateHistory.slice(-10);
    
    // Check for unexpected location changes
    const locationChanges = recentHistory.filter((state, index) => {
      if (index === 0 || !state.location || !recentHistory[index - 1].location) return false;
      
      const distance = this.calculateDistance(
        state.location,
        recentHistory[index - 1].location
      );
      
      // Flag movement when vehicle should be parked
      return distance > 0.1 && state.shiftState === 'P'; // 0.1 mile threshold
    });
    
    // Check for unexpected unlocking
    const unexpectedUnlocks = recentHistory.filter((state, index) => {
      if (index === 0) return false;
      return !state.locked && recentHistory[index - 1].locked;
    });
    
    return locationChanges.length > 2 || unexpectedUnlocks.length > 1;
  }
  
  async processAlert(alert) {
    // Store alert
    this.storeAlert(alert);
    
    // Show notification
    this.showAlert(alert);
    
    // Auto-execute safe responses
    if (alert.type === 'high_temp' && alert.severity === 'critical') {
      try {
        await teslaAPI.executeCommand('start_climate');
        console.log('Auto-started climate due to high cabin temperature');
      } catch (error) {
        console.error('Failed to auto-start climate:', error);
      }
    }
    
    // Log for analytics
    if (window.analytics) {
      window.analytics.trackEvent('vehicle_alert', alert.type, alert.severity, null, {
        message: alert.message,
        timestamp: Date.now()
      });
    }
  }
}
```

This comprehensive Tesla API and Automation specification provides a robust foundation for vehicle integration with intelligent automation, multi-vehicle support, and advanced monitoring capabilities optimized for the Tesla ecosystem.