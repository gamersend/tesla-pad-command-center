# 🧠 Tesla AI Assistant Specification

## Overview

**Tesla Companion AI** is a lightweight, Tesla-optimized AI assistant designed to work seamlessly within the browser constraints while providing intelligent vehicle control, productivity assistance, and contextual information.

## Architecture Strategy

### Dual AI Implementation

#### Primary: Local Ollama Integration

**Purpose**: Privacy-first, offline-capable AI processing **Model**: Phi-3-mini-4k-instruct (2.3GB quantized)

```javascript
const OllamaConfig = {
  endpoint: "http://localhost:11434/api/chat",
  model: "phi-3-mini-4k-instruct",
  context_length: 4096,
  temperature: 0.7,
  streaming: true,
  
  advantages: [
    "Complete privacy - no data leaves local network",
    "No internet required once model downloaded", 
    "Consistent performance regardless of cellular",
    "No API costs or rate limits",
    "Tesla-specific knowledge can be fine-tuned"
  ],
  
  requirements: [
    "User must install Ollama on local network device",
    "Phi-3-mini model downloaded (2.3GB)",
    "Local network connection accessible from Tesla",
    "Port 11434 accessible from Tesla browser"
  ]
};
```

#### Fallback: OpenAI Cloud API

**Purpose**: High-quality responses when local AI unavailable **Model**: GPT-3.5-turbo (optimized for speed and cost)

```javascript
const OpenAIConfig = {
  endpoint: "https://api.openai.com/v1/chat/completions",
  model: "gpt-3.5-turbo",
  max_tokens: 150, // Keep responses concise for Tesla performance
  temperature: 0.6,
  
  advantages: [
    "Always available with internet connection",
    "Higher quality responses than local models",
    "No local setup required",
    "Consistent performance"
  ],
  
  limitations: [
    "Requires API key and costs money",
    "Data sent to OpenAI servers",
    "Rate limiting may apply",
    "Dependent on cellular connection quality"
  ]
};
```

## Tesla-Specific AI Features

### Vehicle Control Integration

#### Natural Language Command Processing

```javascript
class TeslaCommandProcessor {
  constructor() {
    this.commandPatterns = {
      climate: {
        patterns: [
          /(?:set|adjust|change)\s+temperature\s+to\s+(\d+)/i,
          /(?:turn|switch)\s+(on|off)\s+(?:the\s+)?climate/i,
          /(?:start|stop)\s+(?:air\s+conditioning|ac|heat|heating)/i,
          /(?:turn\s+on|activate)\s+seat\s+heating/i
        ],
        handler: this.handleClimateCommand.bind(this)
      },
      
      charging: {
        patterns: [
          /(?:start|begin|initiate)\s+charging/i,
          /(?:stop|end|halt)\s+charging/i,
          /set\s+charge\s+limit\s+to\s+(\d+)%?/i,
          /find\s+(?:nearest|closest)\s+(?:supercharger|charging\s+station)/i
        ],
        handler: this.handleChargingCommand.bind(this)
      },
      
      security: {
        patterns: [
          /(?:lock|unlock)\s+(?:the\s+)?(?:car|vehicle|doors)/i,
          /(?:flash|blink)\s+(?:the\s+)?lights/i,
          /(?:honk|sound)\s+(?:the\s+)?horn/i,
          /(?:open|close)\s+(?:the\s+)?(?:trunk|frunk)/i
        ],
        handler: this.handleSecurityCommand.bind(this)
      },
      
      information: {
        patterns: [
          /(?:what(?:'s|'s| is))\s+(?:my|the)\s+battery\s+level/i,
          /how\s+far\s+can\s+I\s+drive/i,
          /(?:what(?:'s|'s| is))\s+(?:my|the)\s+range/i,
          /when\s+will\s+charging\s+(?:complete|finish)/i,
          /(?:where\s+am\s+I|what(?:'s|'s| is)\s+my\s+location)/i
        ],
        handler: this.handleInformationQuery.bind(this)
      }
    };
  }
  
  async processCommand(input) {
    const normalizedInput = input.toLowerCase().trim();
    
    for (const [category, config] of Object.entries(this.commandPatterns)) {
      for (const pattern of config.patterns) {
        const match = normalizedInput.match(pattern);
        if (match) {
          try {
            const result = await config.handler(match, normalizedInput);
            return {
              success: true,
              category,
              action: result.action,
              message: result.message,
              data: result.data
            };
          } catch (error) {
            return {
              success: false,
              category,
              error: error.message
            };
          }
        }
      }
    }
    
    // No specific Tesla command found, pass to general AI
    return this.handleGeneralQuery(input);
  }
  
  async handleClimateCommand(match, input) {
    if (input.includes('temperature') && match[1]) {
      const temperature = parseInt(match[1]);
      await teslaAPI.executeCommand('set_temperature', { 
        driver_temp: temperature,
        passenger_temp: temperature 
      });
      return {
        action: 'set_temperature',
        message: `Temperature set to ${temperature}°C`,
        data: { temperature }
      };
    }
    
    if (input.includes('on') || input.includes('start')) {
      await teslaAPI.executeCommand('start_climate');
      return {
        action: 'start_climate',
        message: 'Climate control started',
        data: { status: 'on' }
      };
    }
    
    if (input.includes('off') || input.includes('stop')) {
      await teslaAPI.executeCommand('stop_climate');
      return {
        action: 'stop_climate',
        message: 'Climate control stopped',
        data: { status: 'off' }
      };
    }
    
    if (input.includes('seat heating')) {
      await teslaAPI.executeCommand('set_seat_heating', { 
        seat: 'driver', 
        level: 3 
      });
      return {
        action: 'seat_heating',
        message: 'Driver seat heating activated',
        data: { seat: 'driver', level: 3 }
      };
    }
  }
  
  async handleInformationQuery(match, input) {
    const vehicleData = await teslaAPI.getVehicleData();
    
    if (input.includes('battery')) {
      const batteryLevel = vehicleData.charge_state.battery_level;
      const range = vehicleData.charge_state.est_battery_range;
      return {
        action: 'battery_info',
        message: `Battery is at ${batteryLevel}% with ${Math.round(range)} miles of range`,
        data: { battery_level: batteryLevel, range }
      };
    }
    
    if (input.includes('range') || input.includes('far')) {
      const range = vehicleData.charge_state.est_battery_range;
      return {
        action: 'range_info',
        message: `You can drive approximately ${Math.round(range)} miles`,
        data: { range }
      };
    }
    
    if (input.includes('charging')) {
      const chargingState = vehicleData.charge_state.charging_state;
      if (chargingState === 'Charging') {
        const timeRemaining = vehicleData.charge_state.time_to_full_charge;
        return {
          action: 'charging_info',
          message: `Charging will complete in ${timeRemaining} hours`,
          data: { time_remaining: timeRemaining }
        };
      } else {
        return {
          action: 'charging_info',
          message: 'Vehicle is not currently charging',
          data: { charging_state: chargingState }
        };
      }
    }
    
    if (input.includes('location')) {
      const location = vehicleData.drive_state;
      if (location.latitude && location.longitude) {
        const address = await this.reverseGeocode(location.latitude, location.longitude);
        return {
          action: 'location_info',
          message: `You are currently at ${address}`,
          data: { address, coordinates: { lat: location.latitude, lng: location.longitude } }
        };
      }
    }
  }
}
```

### Context-Aware AI System

#### Tesla Context Integration

```javascript
class TeslaContextManager {
  constructor() {
    this.contextData = {
      vehicle: null,
      location: null,
      weather: null,
      calendar: null,
      preferences: null
    };
    
    this.updateInterval = 60000; // Update context every minute
    this.startContextUpdates();
  }
  
  async gatherCurrentContext() {
    try {
      // Vehicle data
      this.contextData.vehicle = await teslaAPI.getVehicleData();
      
      // Location data
      this.contextData.location = await this.getCurrentLocation();
      
      // Weather data
      if (this.contextData.location) {
        this.contextData.weather = await weatherAPI.getCurrentWeather(
          this.contextData.location.latitude,
          this.contextData.location.longitude
        );
      }
      
      // Calendar data
      this.contextData.calendar = await calendarAPI.getUpcomingEvents(24); // Next 24 hours
      
      // User preferences
      this.contextData.preferences = this.getUserPreferences();
      
      return this.contextData;
    } catch (error) {
      console.warn('Failed to gather some context data:', error);
      return this.contextData;
    }
  }
  
  buildContextPrompt(userQuery) {
    const context = [];
    
    // Vehicle context
    if (this.contextData.vehicle) {
      const vehicle = this.contextData.vehicle;
      context.push(`Vehicle Status:
- Battery: ${vehicle.charge_state?.battery_level}%
- Range: ${Math.round(vehicle.charge_state?.est_battery_range || 0)} miles
- Charging: ${vehicle.charge_state?.charging_state || 'Not charging'}
- Climate: ${vehicle.climate_state?.is_climate_on ? 'On' : 'Off'}
- Location: ${vehicle.drive_state?.shift_state || 'Unknown'}`);
    }
    
    // Weather context
    if (this.contextData.weather) {
      const weather = this.contextData.weather;
      context.push(`Weather: ${weather.temperature}°C, ${weather.description}`);
    }
    
    // Calendar context
    if (this.contextData.calendar?.length > 0) {
      const nextEvent = this.contextData.calendar[0];
      const eventTime = new Date(nextEvent.start.dateTime || nextEvent.start.date);
      context.push(`Next Calendar Event: "${nextEvent.summary}" at ${eventTime.toLocaleTimeString()}`);
    }
    
    // Time context
    const now = new Date();
    context.push(`Current Time: ${now.toLocaleString()}`);
    
    return context.join('\n');
  }
  
  enhanceQueryWithContext(userQuery) {
    const contextPrompt = this.buildContextPrompt(userQuery);
    
    return `Context:
${contextPrompt}

User Query: ${userQuery}

Please provide a helpful response considering the Tesla vehicle context. For vehicle-related commands, be specific about the action and provide confirmation. For general questions, use the context to provide more relevant answers.`;
  }
}
```

## Performance Optimizations for Tesla

### Thermal Management

```javascript
class ThermalAwareAI {
  constructor() {
    this.thermalState = 'normal';
    this.performanceLevel = 'full';
    this.responseQueue = [];
    this.setupThermalMonitoring();
  }
  
  setupThermalMonitoring() {
    setInterval(() => {
      this.checkThermalState();
    }, 30000); // Check every 30 seconds
  }
  
  checkThermalState() {
    // Monitor performance.now() differences to detect throttling
    const start = performance.now();
    setTimeout(() => {
      const elapsed = performance.now() - start;
      
      if (elapsed > 50) { // Expected ~16ms, throttling if >50ms
        this.thermalState = 'throttling';
        this.adjustPerformance();
      } else if (elapsed > 25) {
        this.thermalState = 'warm';
        this.adjustPerformance();
      } else {
        this.thermalState = 'normal';
        this.performanceLevel = 'full';
      }
    }, 16);
  }
  
  adjustPerformance() {
    switch (this.thermalState) {
      case 'throttling':
        this.performanceLevel = 'minimal';
        // Pause AI processing temporarily
        this.pauseAIProcessing(60000); // 1 minute
        break;
        
      case 'warm':
        this.performanceLevel = 'reduced';
        // Limit concurrent AI requests
        this.maxConcurrentRequests = 1;
        break;
        
      case 'normal':
        this.performanceLevel = 'full';
        this.maxConcurrentRequests = 3;
        break;
    }
  }
  
  async processAIRequest(query, options = {}) {
    if (this.performanceLevel === 'minimal') {
      return {
        success: false,
        message: 'AI temporarily unavailable due to system thermal protection',
        suggestion: 'Please try again in a few minutes'
      };
    }
    
    if (this.performanceLevel === 'reduced') {
      // Use shorter responses and simpler processing
      options.max_tokens = Math.min(options.max_tokens || 100, 75);
      options.temperature = Math.min(options.temperature || 0.7, 0.5);
    }
    
    return await this.executeAIRequest(query, options);
  }
}
```

### Response Caching System

```javascript
class AIResponseCache {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 50; // Limit cache size for memory management
    this.cacheTimeout = 300000; // 5 minutes
    this.commonResponses = this.initializeCommonResponses();
  }
  
  initializeCommonResponses() {
    return new Map([
      ['what is my battery level', 'I\'ll check your current battery level for you.'],
      ['lock the car', 'Locking your Tesla now.'],
      ['unlock the car', 'Unlocking your Tesla now.'],
      ['start climate', 'Starting climate control.'],
      ['stop climate', 'Stopping climate control.'],
      ['how far can I drive', 'Let me check your current range.'],
      ['where am I', 'I\'ll get your current location.'],
      ['what time is it', () => `It's currently ${new Date().toLocaleTimeString()}.`],
      ['hello', 'Hello! How can I help you with your Tesla today?'],
      ['thank you', 'You\'re welcome! Is there anything else I can help you with?']
    ]);
  }
  
  generateCacheKey(query, context) {
    // Create a hash of the query and relevant context
    const contextString = JSON.stringify({
      battery: context.vehicle?.charge_state?.battery_level,
      charging: context.vehicle?.charge_state?.charging_state,
      climate: context.vehicle?.climate_state?.is_climate_on,
      time: Math.floor(Date.now() / 60000) // Round to minute for time-based caching
    });
    
    return `${query.toLowerCase().trim()}_${this.simpleHash(contextString)}`;
  }
  
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
  
  getCachedResponse(query, context) {
    // Check common responses first
    const commonResponse = this.commonResponses.get(query.toLowerCase().trim());
    if (commonResponse) {
      return typeof commonResponse === 'function' ? commonResponse() : commonResponse;
    }
    
    // Check cache
    const cacheKey = this.generateCacheKey(query, context);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.response;
    }
    
    return null;
  }
  
  setCachedResponse(query, context, response) {
    const cacheKey = this.generateCacheKey(query, context);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }
}
```

## AI Conversation Management

### Session Management

```javascript
class AIConversationManager {
  constructor() {
    this.sessions = new Map();
    this.currentSessionId = null;
    this.maxSessionLength = 20; // Maximum messages per session
    this.sessionTimeout = 1800000; // 30 minutes
  }
  
  startNewSession() {
    const sessionId = `session_${Date.now()}`;
    const session = {
      id: sessionId,
      messages: [],
      startTime: Date.now(),
      lastActivity: Date.now(),
      context: null
    };
    
    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;
    
    return session;
  }
  
  addMessage(role, content, metadata = {}) {
    const session = this.getCurrentSession();
    if (!session) {
      this.startNewSession();
      return this.addMessage(role, content, metadata);
    }
    
    const message = {
      id: `msg_${Date.now()}`,
      role, // 'user' or 'assistant'
      content,
      timestamp: Date.now(),
      metadata
    };
    
    session.messages.push(message);
    session.lastActivity = Date.now();
    
    // Trim session if too long
    if (session.messages.length > this.maxSessionLength) {
      session.messages = session.messages.slice(-this.maxSessionLength);
    }
    
    this.sessions.set(session.id, session);
    return message;
  }
  
  getCurrentSession() {
    if (!this.currentSessionId) return null;
    
    const session = this.sessions.get(this.currentSessionId);
    if (!session) return null;
    
    // Check if session has expired
    if (Date.now() - session.lastActivity > this.sessionTimeout) {
      this.endSession(session.id);
      return null;
    }
    
    return session;
  }
  
  buildConversationHistory(maxMessages = 10) {
    const session = this.getCurrentSession();
    if (!session || session.messages.length === 0) {
      return [];
    }
    
    // Get recent messages, prioritizing user-assistant pairs
    const recentMessages = session.messages.slice(-maxMessages);
    
    return recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));
  }
  
  clearSession() {
    if (this.currentSessionId) {
      this.sessions.delete(this.currentSessionId);
      this.currentSessionId = null;
    }
  }
  
  exportSession() {
    const session = this.getCurrentSession();
    if (!session) return null;
    
    return {
      id: session.id,
      startTime: session.startTime,
      duration: Date.now() - session.startTime,
      messageCount: session.messages.length,
      messages: session.messages,
      exported: Date.now()
    };
  }
}
```

### Smart Prompting System

#### Tesla-Specific Prompt Templates

```javascript
class TeslaPromptEngine {
  constructor() {
    this.systemPrompts = {
      general: `You are Tesla Companion AI, a helpful assistant integrated into a Tesla dashboard. You have access to vehicle data and can help with Tesla-specific tasks. Keep responses concise and actionable. Always prioritize safety - never suggest actions while driving.`,
      
      vehicle_control: `You are Tesla Companion AI with vehicle control capabilities. You can help with climate, charging, locks, and other vehicle functions. Always confirm actions before executing them. Be specific about what you're doing.`,
      
      trip_planning: `You are Tesla Companion AI specializing in trip planning. Consider charging stops, weather, and efficient routing. Always factor in Supercharger locations and charging time for longer trips.`,
      
      maintenance: `You are Tesla Companion AI for vehicle maintenance guidance. Provide accurate Tesla-specific maintenance information. Always recommend official Tesla service for complex issues.`
    };
    
    this.promptTemplates = {
      vehicle_status: `Based on the current vehicle data:
{vehicle_context}

{user_query}

Provide a clear, helpful response about the vehicle status.`,

      command_confirmation: `I'm about to execute this Tesla command:
Action: {action}
Details: {details}

Is this what you wanted me to do? I'll proceed if you confirm.`,

      trip_suggestion: `For your trip from {origin} to {destination}:
Distance: {distance}
Current Battery: {battery_level}%

{trip_analysis}

Would you like me to plan the optimal route with charging stops?`
    };
  }
  
  generatePrompt(type, context, userQuery) {
    const systemPrompt = this.systemPrompts[type] || this.systemPrompts.general;
    const template = this.promptTemplates[type];
    
    let prompt = systemPrompt + '\n\n';
    
    if (template) {
      prompt += this.populateTemplate(template, context, userQuery);
    } else {
      prompt += `Context: ${JSON.stringify(context, null, 2)}\n\nUser: ${userQuery}`;
    }
    
    return prompt;
  }
  
  populateTemplate(template, context, userQuery) {
    return template
      .replace('{vehicle_context}', this.formatVehicleContext(context.vehicle))
      .replace('{user_query}', userQuery)
      .replace('{action}', context.action || 'Unknown action')
      .replace('{details}', context.details || 'No details')
      .replace('{origin}', context.origin || 'Current location')
      .replace('{destination}', context.destination || 'Unknown destination')
      .replace('{distance}', context.distance || 'Unknown distance')
      .replace('{battery_level}', context.vehicle?.charge_state?.battery_level || 'Unknown')
      .replace('{trip_analysis}', context.trip_analysis || '');
  }
  
  formatVehicleContext(vehicle) {
    if (!vehicle) return 'Vehicle data unavailable';
    
    const context = [];
    
    if (vehicle.charge_state) {
      context.push(`Battery: ${vehicle.charge_state.battery_level}% (${Math.round(vehicle.charge_state.est_battery_range)} miles range)`);
      context.push(`Charging: ${vehicle.charge_state.charging_state}`);
    }
    
    if (vehicle.climate_state) {
      context.push(`Climate: ${vehicle.climate_state.is_climate_on ? 'On' : 'Off'}`);
      context.push(`Interior temp: ${vehicle.climate_state.inside_temp}°C`);
    }
    
    if (vehicle.vehicle_state) {
      context.push(`Doors locked: ${vehicle.vehicle_state.locked ? 'Yes' : 'No'}`);
      context.push(`Odometer: ${vehicle.vehicle_state.odometer} miles`);
    }
    
    return context.join('\n');
  }
}
```

## User Interface Integration

### Voice Input Support

```javascript
class VoiceInputManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.setupSpeechRecognition();
  }
  
  setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateVoiceUI('listening');
      };
      
      this.recognition.onresult = (event) => {
        this.handleSpeechResult(event);
      };
      
      this.recognition.onerror = (event) => {
        this.handleSpeechError(event);
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        this.updateVoiceUI('idle');
      };
    }
  }
  
  async startListening() {
    // Only allow when vehicle is parked for safety
    const vehicleState = await teslaAPI.getVehicleState();
    if (vehicleState.shift_state !== 'P') {
      throw new Error('Voice input only available when parked');
    }
    
    if (this.recognition && !this.isListening) {
      this.recognition.start();
    }
  }
  
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
  
  handleSpeechResult(event) {
    let finalTranscript = '';
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    if (finalTranscript) {
      this.processVoiceCommand(finalTranscript);
    }
    
    this.updateTranscriptionDisplay(finalTranscript, interimTranscript);
  }
}
```

### Chat Interface

```css
.ai-assistant-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-system-background);
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.assistant-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.assistant-status {
  font-size: 12px;
  opacity: 0.8;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.message.user .message-avatar {
  background: var(--color-blue);
  color: white;
}

.message.assistant .message-avatar {
  background: var(--color-secondary-system-background);
  color: var(--color-label);
}

.message-content {
  background: white;
  border-radius: 18px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.4;
}

.message.user .message-content {
  background: var(--color-blue);
  color: white;
}

.message-time {
  font-size: 11px;
  color: var(--color-tertiary-label);
  margin-top: 4px;
  text-align: center;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-secondary-label);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-input-area {
  padding: 16px 20px;
  background: var(--color-secondary-system-background);
  border-top: 1px solid var(--color-quaternary-label);
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 1px solid var(--color-quaternary-label);
  border-radius: 22px;
  font-size: 16px;
  outline: none;
  resize: none;
  background: white;
}

.input-actions {
  display: flex;
  gap: 8px;
}

.voice-button, .send-button {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.voice-button {
  background: var(--color-green);
  color: white;
}

.voice-button.listening {
  background: var(--color-red);
  animation: pulse 1s infinite;
}

.send-button {
  background: var(--color-blue);
  color: white;
}

.send-button:disabled {
  background: var(--color-quaternary-label);
  cursor: not-allowed;
}

.tesla-suggestions {
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
  overflow-x: auto;
}

.suggestion-pill {
  padding: 8px 16px;
  background: var(--color-tertiary-system-background);
  border: none;
  border-radius: 16px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease;
}

.suggestion-pill:hover {
  background: var(--color-blue);
  color: white;
}
```

## Privacy & Data Handling

### Local Data Protection

```javascript
class AIPrivacyManager {
  constructor() {
    this.encryptionEnabled = true;
    this.dataRetentionDays = 7; // Keep conversations for 7 days max
    this.sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card numbers
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email
    ];
  }
  
  sanitizeInput(input) {
    let sanitized = input;
    
    this.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    
    return sanitized;
  }
  
  encryptConversation(conversation) {
    if (!this.encryptionEnabled) return conversation;
    
    try {
      const encrypted = btoa(JSON.stringify(conversation));
      return encrypted;
    } catch (error) {
      console.warn('Encryption failed, storing unencrypted:', error);
      return conversation;
    }
  }
  
  decryptConversation(encrypted) {
    if (!this.encryptionEnabled) return encrypted;
    
    try {
      const decrypted = JSON.parse(atob(encrypted));
      return decrypted;
    } catch (error) {
      console.warn('Decryption failed:', error);
      return null;
    }
  }
  
  cleanupOldConversations() {
    const cutoffDate = Date.now() - (this.dataRetentionDays * 24 * 60 * 60 * 1000);
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ai_conversation_')) {
        try {
          const conversation = this.decryptConversation(localStorage.getItem(key));
          if (conversation && conversation.startTime < cutoffDate) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }
    });
  }
}
```

This AI Assistant specification provides a comprehensive, Tesla-optimized AI system that balances performance, privacy, and functionality within the constraints of the Tesla browser environment.