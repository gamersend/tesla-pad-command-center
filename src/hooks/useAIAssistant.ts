
import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: any;
}

interface AIConfig {
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface VehicleData {
  charge_state: {
    battery_level: number;
    est_battery_range: number;
    charging_state: string;
    time_to_full_charge?: number;
  };
  climate_state: {
    is_climate_on: boolean;
    inside_temp: number;
  };
  drive_state: {
    shift_state: string;
    latitude?: number;
    longitude?: number;
  };
  vehicle_state: {
    locked: boolean;
    odometer: number;
  };
}

class TeslaCommandProcessor {
  private commandPatterns = {
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

  async processCommand(input: string) {
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
              error: (error as Error).message
            };
          }
        }
      }
    }
    
    return null; // No Tesla command found
  }

  private async handleClimateCommand(match: RegExpMatchArray, input: string) {
    if (input.includes('temperature') && match[1]) {
      const temperature = parseInt(match[1]);
      console.log('Setting temperature to', temperature);
      return {
        action: 'set_temperature',
        message: `Temperature set to ${temperature}°F`,
        data: { temperature }
      };
    }
    
    if (input.includes('on') || input.includes('start')) {
      console.log('Starting climate control');
      return {
        action: 'start_climate',
        message: 'Climate control started',
        data: { status: 'on' }
      };
    }
    
    if (input.includes('off') || input.includes('stop')) {
      console.log('Stopping climate control');
      return {
        action: 'stop_climate',
        message: 'Climate control stopped',
        data: { status: 'off' }
      };
    }
    
    if (input.includes('seat heating')) {
      console.log('Activating seat heating');
      return {
        action: 'seat_heating',
        message: 'Driver seat heating activated',
        data: { seat: 'driver', level: 3 }
      };
    }

    return { action: 'climate_general', message: 'Climate command processed', data: {} };
  }

  private async handleChargingCommand(match: RegExpMatchArray, input: string) {
    if (input.includes('start')) {
      console.log('Starting charging');
      return {
        action: 'start_charging',
        message: 'Charging started',
        data: { status: 'charging' }
      };
    }
    
    if (input.includes('stop')) {
      console.log('Stopping charging');
      return {
        action: 'stop_charging',
        message: 'Charging stopped',
        data: { status: 'stopped' }
      };
    }

    if (match[1]) {
      const limit = parseInt(match[1]);
      console.log('Setting charge limit to', limit);
      return {
        action: 'set_charge_limit',
        message: `Charge limit set to ${limit}%`,
        data: { limit }
      };
    }

    return { action: 'charging_general', message: 'Charging command processed', data: {} };
  }

  private async handleSecurityCommand(match: RegExpMatchArray, input: string) {
    if (input.includes('lock')) {
      console.log('Locking vehicle');
      return {
        action: 'lock_vehicle',
        message: 'Vehicle locked',
        data: { locked: true }
      };
    }
    
    if (input.includes('unlock')) {
      console.log('Unlocking vehicle');
      return {
        action: 'unlock_vehicle',
        message: 'Vehicle unlocked',
        data: { locked: false }
      };
    }

    if (input.includes('flash') || input.includes('lights')) {
      console.log('Flashing lights');
      return {
        action: 'flash_lights',
        message: 'Lights flashed',
        data: { action: 'flash_lights' }
      };
    }

    if (input.includes('honk') || input.includes('horn')) {
      console.log('Honking horn');
      return {
        action: 'honk_horn',
        message: 'Horn honked',
        data: { action: 'honk_horn' }
      };
    }

    return { action: 'security_general', message: 'Security command processed', data: {} };
  }

  private async handleInformationQuery(match: RegExpMatchArray, input: string) {
    // Mock vehicle data - in real implementation this would come from Tesla API
    const vehicleData: VehicleData = {
      charge_state: {
        battery_level: 85,
        est_battery_range: 287,
        charging_state: 'Not Charging'
      },
      climate_state: {
        is_climate_on: false,
        inside_temp: 72
      },
      drive_state: {
        shift_state: 'P'
      },
      vehicle_state: {
        locked: true,
        odometer: 12345
      }
    };
    
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
        const timeRemaining = vehicleData.charge_state.time_to_full_charge || 0;
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
      return {
        action: 'location_info',
        message: 'You are currently at Home • Parked',
        data: { address: 'Home • Parked' }
      };
    }

    return { action: 'info_general', message: 'Information retrieved', data: {} };
  }
}

class TeslaContextManager {
  private contextData = {
    vehicle: null as VehicleData | null,
    location: null,
    weather: null,
    calendar: null,
    preferences: null
  };

  async gatherCurrentContext() {
    try {
      // Mock vehicle data
      this.contextData.vehicle = {
        charge_state: {
          battery_level: 85,
          est_battery_range: 287,
          charging_state: 'Not Charging'
        },
        climate_state: {
          is_climate_on: false,
          inside_temp: 72
        },
        drive_state: {
          shift_state: 'P'
        },
        vehicle_state: {
          locked: true,
          odometer: 12345
        }
      };
      
      return this.contextData;
    } catch (error) {
      console.warn('Failed to gather some context data:', error);
      return this.contextData;
    }
  }

  enhanceQueryWithContext(userQuery: string) {
    const contextPrompt = this.buildContextPrompt();
    
    return `Context:
${contextPrompt}

User Query: ${userQuery}

Please provide a helpful response considering the Tesla vehicle context. For vehicle-related commands, be specific about the action and provide confirmation. For general questions, use the context to provide more relevant answers.`;
  }

  private buildContextPrompt() {
    const context = [];
    
    if (this.contextData.vehicle) {
      const vehicle = this.contextData.vehicle;
      context.push(`Vehicle Status:
- Battery: ${vehicle.charge_state?.battery_level}%
- Range: ${Math.round(vehicle.charge_state?.est_battery_range || 0)} miles
- Charging: ${vehicle.charge_state?.charging_state || 'Not charging'}
- Climate: ${vehicle.climate_state?.is_climate_on ? 'On' : 'Off'}
- Location: ${vehicle.drive_state?.shift_state || 'Unknown'}`);
    }
    
    const now = new Date();
    context.push(`Current Time: ${now.toLocaleString()}`);
    
    return context.join('\n');
  }
}

class AIResponseCache {
  private cache = new Map();
  private maxCacheSize = 50;
  private cacheTimeout = 300000; // 5 minutes
  private commonResponses = new Map([
    ['what is my battery level', "I'll check your current battery level for you."],
    ['lock the car', 'Locking your Tesla now.'],
    ['unlock the car', 'Unlocking your Tesla now.'],
    ['start climate', 'Starting climate control.'],
    ['stop climate', 'Stopping climate control.'],
    ['how far can I drive', 'Let me check your current range.'],
    ['where am I', "I'll get your current location."],
    ['what time is it', () => `It's currently ${new Date().toLocaleTimeString()}.`],
    ['hello', 'Hello! How can I help you with your Tesla today?'],
    ['thank you', "You're welcome! Is there anything else I can help you with?"]
  ]);

  getCachedResponse(query: string, context: any) {
    const commonResponse = this.commonResponses.get(query.toLowerCase().trim());
    if (commonResponse) {
      return typeof commonResponse === 'function' ? commonResponse() : commonResponse;
    }
    
    const cacheKey = this.generateCacheKey(query, context);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.response;
    }
    
    return null;
  }

  setCachedResponse(query: string, context: any, response: string) {
    const cacheKey = this.generateCacheKey(query, context);
    
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }

  private generateCacheKey(query: string, context: any) {
    const contextString = JSON.stringify({
      battery: context.vehicle?.charge_state?.battery_level,
      charging: context.vehicle?.charge_state?.charging_state,
      climate: context.vehicle?.climate_state?.is_climate_on,
      time: Math.floor(Date.now() / 60000)
    });
    
    return `${query.toLowerCase().trim()}_${this.simpleHash(contextString)}`;
  }

  private simpleHash(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

export const useAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const commandProcessor = useRef(new TeslaCommandProcessor());
  const contextManager = useRef(new TeslaContextManager());
  const responseCache = useRef(new AIResponseCache());
  const recognition = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';
      
      recognition.current.onstart = () => setIsListening(true);
      recognition.current.onend = () => setIsListening(false);
      recognition.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          sendMessage(finalTranscript.trim());
        }
      };
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check cache first
      const context = await contextManager.current.gatherCurrentContext();
      const cachedResponse = responseCache.current.getCachedResponse(content, context);
      
      if (cachedResponse) {
        const assistantMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: cachedResponse,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Check for Tesla-specific commands
      const teslaCommand = await commandProcessor.current.processCommand(content);
      
      if (teslaCommand && teslaCommand.success) {
        const assistantMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: teslaCommand.message,
          timestamp: Date.now(),
          metadata: { command: true, action: teslaCommand.action, data: teslaCommand.data }
        };
        setMessages(prev => [...prev, assistantMessage]);
        responseCache.current.setCachedResponse(content, context, teslaCommand.message);
        setIsLoading(false);
        return;
      }

      // Try Ollama first (local AI)
      let response = await tryOllamaAPI(content, context);
      
      // Fallback to OpenAI if Ollama fails
      if (!response) {
        response = await tryOpenAI(content, context);
      }
      
      if (!response) {
        response = "I'm having trouble connecting to AI services right now. Please try again in a moment.";
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      responseCache.current.setCachedResponse(content, context, response);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: "I encountered an error processing your request. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const tryOllamaAPI = async (content: string, context: any) => {
    try {
      setConnectionStatus('connecting');
      const enhancedQuery = contextManager.current.enhanceQueryWithContext(content);
      
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3-mini-4k-instruct',
          messages: [
            {
              role: 'system',
              content: 'You are Tesla Companion AI, a helpful assistant integrated into a Tesla dashboard. Keep responses concise and actionable. Always prioritize safety.'
            },
            { role: 'user', content: enhancedQuery }
          ],
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 150
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('connected');
        return data.message?.content || 'No response from AI';
      }
      
      setConnectionStatus('disconnected');
      return null;
    } catch (error) {
      console.warn('Ollama API failed:', error);
      setConnectionStatus('disconnected');
      return null;
    }
  };

  const tryOpenAI = async (content: string, context: any) => {
    try {
      setConnectionStatus('connecting');
      const enhancedQuery = contextManager.current.enhanceQueryWithContext(content);
      
      // In a real implementation, this would use a secure edge function
      // For demo purposes, we'll simulate the response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnectionStatus('connected');
      
      // Simulate AI response based on content
      if (content.toLowerCase().includes('battery')) {
        return `Your Tesla's battery is currently at 85% with approximately 287 miles of range remaining. You're all set for your next trip!`;
      } else if (content.toLowerCase().includes('climate')) {
        return `I can help you control your Tesla's climate system. Would you like me to start pre-conditioning or adjust the temperature?`;
      } else if (content.toLowerCase().includes('charging')) {
        return `Your Tesla is currently not charging. The battery is at 85%. Would you like me to help you find nearby Superchargers?`;
      } else {
        return `I'm here to help with your Tesla and general questions. You can ask me about battery status, climate control, charging, or anything else you need assistance with.`;
      }
    } catch (error) {
      console.warn('OpenAI API failed:', error);
      setConnectionStatus('disconnected');
      return null;
    }
  };

  const startVoiceInput = useCallback(() => {
    if (recognition.current && !isListening) {
      recognition.current.start();
    }
  }, [isListening]);

  const stopVoiceInput = useCallback(() => {
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
  }, [isListening]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isListening,
    connectionStatus,
    sendMessage,
    startVoiceInput,
    stopVoiceInput,
    clearMessages
  };
};
