export interface VehicleData {
  id: string;
  display_name: string;
  state: string;
  charge_state: {
    battery_level: number;
    charging_state: string;
    est_battery_range: number;
    charge_rate: number;
    time_to_full_charge: number;
    battery_range: number;
  };
  climate_state: {
    is_climate_on: boolean;
    inside_temp: number;
    outside_temp: number;
  };
  vehicle_state: {
    locked: boolean;
    sentry_mode: boolean;
    odometer: number;
    car_version: string;
  };
  drive_state: {
    latitude: number;
    longitude: number;
    shift_state: string;
    speed: number;
  };
}

export interface CommandResponse {
  success: boolean;
  result?: any;
  error?: string;
  executedAt?: number;
}

class APIRateLimiter {
  private requestHistory: Array<{ timestamp: number; type: string; provider: string }> = [];
  private limits = {
    tessie: { calls: 200, window: 900000 }, // 200 calls per 15 minutes
    tesla_fleet: { calls: 1000, window: 86400000 }, // 1000 calls per day
    wake_commands: { calls: 5, window: 900000 } // 5 wake commands per 15 minutes
  };
  public currentProvider: 'tessie' | 'tesla_fleet' = 'tessie';

  canMakeRequest(commandType: string = 'general'): boolean {
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
  
  recordRequest(commandType: string = 'general'): void {
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
  
  getTimeUntilNextRequest(): number {
    const now = Date.now();
    const limit = this.limits[this.currentProvider];
    const oldestRelevantRequest = this.requestHistory
      .filter(req => now - req.timestamp < limit.window)
      .sort((a, b) => a.timestamp - b.timestamp)[0];
    
    if (!oldestRelevantRequest) return 0;
    
    return Math.max(0, (oldestRelevantRequest.timestamp + limit.window) - now);
  }
}

abstract class BaseAPI {
  abstract authenticate(): Promise<void>;
  abstract getVehicleData(vehicleId: string): Promise<VehicleData>;
  abstract executeCommand(vehicleId: string, command: string, params?: any): Promise<any>;
  abstract wakeVehicle(vehicleId: string): Promise<any>;
  abstract isAvailable(): boolean;
  abstract getVehicles(): Promise<VehicleData[]>;
}

class TessieAPI extends BaseAPI {
  private apiKey: string;
  private baseURL: string = 'https://api.tessie.com';

  constructor() {
    super();
    this.apiKey = '';
  }

  async authenticate(): Promise<void> {
    const settings = JSON.parse(localStorage.getItem('tesla_dashboard_settings') || '{}');
    this.apiKey = settings.teslaApiKey || '';
    
    if (!this.apiKey || settings.teslaApiProvider !== 'tessie') {
      throw new Error('Tessie API key not configured');
    }

    // Test authentication
    try {
      const response = await fetch(`${this.baseURL}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid Tessie API key');
      }
    } catch (error) {
      throw new Error('Tessie API authentication failed');
    }
  }

  async getVehicles(): Promise<VehicleData[]> {
    const response = await fetch(`${this.baseURL}/vehicles`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vehicles from Tessie');
    }

    return await response.json();
  }

  async getVehicleData(vehicleId: string): Promise<VehicleData> {
    const response = await fetch(`${this.baseURL}/vehicles/${vehicleId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle data from Tessie');
    }

    return await response.json();
  }

  async executeCommand(vehicleId: string, command: string, params: any = {}): Promise<any> {
    const response = await fetch(`${this.baseURL}/vehicles/${vehicleId}/command/${command}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Failed to execute command ${command}`);
    }

    return await response.json();
  }

  async wakeVehicle(vehicleId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/vehicles/${vehicleId}/wake`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to wake vehicle');
    }

    return await response.json();
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

class TeslaFleetAPI extends BaseAPI {
  private apiKey: string;
  private baseURL: string = 'https://fleet-api.prd.na.vn.cloud.tesla.com';

  constructor() {
    super();
    this.apiKey = '';
  }

  async authenticate(): Promise<void> {
    const settings = JSON.parse(localStorage.getItem('tesla_dashboard_settings') || '{}');
    this.apiKey = settings.teslaApiKey || '';
    
    if (!this.apiKey || settings.teslaApiProvider !== 'fleet') {
      throw new Error('Tesla Fleet API key not configured');
    }

    // Test authentication
    try {
      const response = await fetch(`${this.baseURL}/api/1/vehicles`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid Tesla Fleet API key');
      }
    } catch (error) {
      throw new Error('Tesla Fleet API authentication failed');
    }
  }

  async getVehicles(): Promise<VehicleData[]> {
    const response = await fetch(`${this.baseURL}/api/1/vehicles`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vehicles from Tesla Fleet API');
    }

    const data = await response.json();
    return data.response || [];
  }

  async getVehicleData(vehicleId: string): Promise<VehicleData> {
    const response = await fetch(`${this.baseURL}/api/1/vehicles/${vehicleId}/vehicle_data`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle data from Tesla Fleet API');
    }

    const data = await response.json();
    return data.response;
  }

  async executeCommand(vehicleId: string, command: string, params: any = {}): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/1/vehicles/${vehicleId}/command/${command}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Failed to execute command ${command}`);
    }

    const data = await response.json();
    return data.response;
  }

  async wakeVehicle(vehicleId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/1/vehicles/${vehicleId}/wake_up`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to wake vehicle');
    }

    const data = await response.json();
    return data.response;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

class TeslaAPIManager {
  private primaryAPI: TessieAPI;
  private fallbackAPI: TeslaFleetAPI;
  private currentAPI: BaseAPI | null = null;
  private vehicleCache = new Map<string, { data: VehicleData; timestamp: number }>();
  private rateLimiter = new APIRateLimiter();

  constructor() {
    this.primaryAPI = new TessieAPI();
    this.fallbackAPI = new TeslaFleetAPI();
    this.initializeAPI();
  }

  async initializeAPI(): Promise<void> {
    try {
      await this.primaryAPI.authenticate();
      this.currentAPI = this.primaryAPI;
      this.rateLimiter.currentProvider = 'tessie';
      console.log('Using Tessie API as primary');
    } catch (error) {
      console.warn('Tessie API unavailable, falling back to Tesla Fleet API');
      try {
        await this.fallbackAPI.authenticate();
        this.currentAPI = this.fallbackAPI;
        this.rateLimiter.currentProvider = 'tesla_fleet';
        console.log('Using Tesla Fleet API as fallback');
      } catch (fallbackError) {
        console.error('Both APIs failed to authenticate');
        throw new Error('No Tesla API available');
      }
    }
  }

  async getVehicleData(vehicleId: string, useCache: boolean = true): Promise<VehicleData> {
    if (useCache && this.vehicleCache.has(vehicleId)) {
      const cached = this.vehicleCache.get(vehicleId)!;
      if (Date.now() - cached.timestamp < 30000) {
        return cached.data;
      }
    }

    try {
      if (!this.rateLimiter.canMakeRequest()) {
        throw new Error('Rate limit exceeded');
      }

      if (!this.currentAPI) {
        await this.initializeAPI();
      }

      const data = await this.currentAPI!.getVehicleData(vehicleId);
      this.cacheVehicleData(vehicleId, data);
      this.rateLimiter.recordRequest();

      return data;
    } catch (error) {
      return await this.handleAPIError(error, 'getVehicleData', vehicleId, useCache);
    }
  }

  async executeCommand(vehicleId: string, command: string, params: any = {}): Promise<CommandResponse> {
    try {
      await this.ensureVehicleAwake(vehicleId);

      if (!this.rateLimiter.canMakeRequest()) {
        throw new Error('Rate limit exceeded');
      }

      if (!this.currentAPI) {
        await this.initializeAPI();
      }

      const result = await this.currentAPI!.executeCommand(vehicleId, command, params);
      this.rateLimiter.recordRequest();

      console.log(`Tesla command executed: ${command}`, { vehicleId, params, result });

      return {
        success: true,
        result: result,
        executedAt: Date.now()
      };

    } catch (error) {
      const errorResult = await this.handleAPIError(error, 'executeCommand', vehicleId, command, params);
      return errorResult as CommandResponse;
    }
  }

  private async handleAPIError(error: any, method: string, ...args: any[]): Promise<any> {
    console.error(`API Error in ${method}:`, error);

    if (this.currentAPI === this.primaryAPI && this.fallbackAPI.isAvailable()) {
      console.log('Switching to fallback API');
      this.currentAPI = this.fallbackAPI;
      this.rateLimiter.currentProvider = 'tesla_fleet';

      try {
        switch (method) {
          case 'getVehicleData':
            return await this.getVehicleData(args[0], args[1]);
          case 'executeCommand':
            return await this.executeCommand(args[0], args[1], args[2]);
          default:
            throw error;
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
    }

    return {
      success: false,
      error: error.message,
      timestamp: Date.now()
    };
  }

  async getVehicles(): Promise<VehicleData[]> {
    if (!this.currentAPI) {
      await this.initializeAPI();
    }

    return await this.currentAPI!.getVehicles();
  }

  isConfigured(): boolean {
    const settings = JSON.parse(localStorage.getItem('tesla_dashboard_settings') || '{}');
    return !!(settings.teslaApiKey && settings.teslaApiProvider && settings.vehicleId);
  }

  getCurrentVehicleId(): string {
    const settings = JSON.parse(localStorage.getItem('tesla_dashboard_settings') || '{}');
    return settings.vehicleId || '';
  }
}

// Export singleton instance
export const teslaAPI = new TeslaAPIManager();
