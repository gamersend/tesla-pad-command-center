
import { teslaAPI, VehicleData } from './teslaAPI';
import { toast } from '@/hooks/use-toast';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  created?: number;
  custom?: boolean;
}

export interface AutomationTrigger {
  type: 'location' | 'calendar' | 'schedule' | 'vehicle_state' | 'time';
  location?: string;
  event?: 'arrive' | 'leave';
  radius?: number;
  conditions?: any;
  eventKeywords?: string[];
  timeBefore?: number;
  pattern?: string;
  time?: string;
  condition?: string;
  frequency?: string;
}

export interface AutomationAction {
  type: string;
  command?: string;
  params?: any;
  description: string;
  message?: string;
  priority?: string;
  actions?: string[];
  radius?: number;
  types?: string[];
  minimumLevel?: number;
  optimizeForCost?: boolean;
  targetLevel?: number;
  departureTime?: string;
  location?: string;
  duration?: number;
}

class TeslaAutomationEngine {
  private automationRules = new Map<string, AutomationRule>();
  private ruleStates = new Map<string, any>();
  private monitoringActive = false;

  constructor() {
    this.initializeDefaultRules();
    this.loadSavedRules();
  }

  private initializeDefaultRules(): void {
    const defaultRules: AutomationRule[] = [
      {
        id: 'arrive_home_evening',
        name: 'Arrive Home (Evening)',
        description: 'Actions when arriving home after 6 PM',
        enabled: false,
        trigger: {
          type: 'location',
          location: 'home',
          event: 'arrive',
          radius: 150,
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
            duration: 5000,
            description: 'Show welcome notification'
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
          timeBefore: 15,
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
            message: 'Vehicle prepared for departure.',
            description: 'Show preparation notification'
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
            type: 'notification',
            priority: 'high',
            message: 'Battery low. Consider finding a charging station.',
            description: 'Show low battery alert'
          }
        ]
      }
    ];

    defaultRules.forEach(rule => {
      this.automationRules.set(rule.id, rule);
    });
  }

  private loadSavedRules(): void {
    try {
      const savedRules = localStorage.getItem('tesla_automation_rules');
      if (savedRules) {
        const rules = JSON.parse(savedRules);
        Object.entries(rules).forEach(([id, rule]) => {
          this.automationRules.set(id, rule as AutomationRule);
        });
      }
    } catch (error) {
      console.error('Failed to load automation rules:', error);
    }
  }

  private saveRules(): void {
    try {
      const rules = Object.fromEntries(this.automationRules);
      localStorage.setItem('tesla_automation_rules', JSON.stringify(rules));
    } catch (error) {
      console.error('Failed to save automation rules:', error);
    }
  }

  startMonitoring(): void {
    if (this.monitoringActive) return;

    this.monitoringActive = true;
    
    // Check vehicle state every minute
    setInterval(() => {
      this.checkVehicleStateTriggers();
    }, 60000);

    // Check time-based triggers every minute
    setInterval(() => {
      this.checkTimeTriggers();
    }, 60000);

    console.log('Tesla automation monitoring started');
  }

  stopMonitoring(): void {
    this.monitoringActive = false;
    console.log('Tesla automation monitoring stopped');
  }

  private async checkVehicleStateTriggers(): Promise<void> {
    if (!teslaAPI.isConfigured()) return;

    try {
      const vehicleId = teslaAPI.getCurrentVehicleId();
      const vehicleData = await teslaAPI.getVehicleData(vehicleId);

      for (const [ruleId, rule] of this.automationRules) {
        if (!rule.enabled || rule.trigger.type !== 'vehicle_state') continue;

        if (this.evaluateVehicleCondition(vehicleData, rule.trigger.condition!)) {
          const ruleState = this.getRuleState(ruleId);
          
          // Check frequency restrictions
          if (rule.trigger.frequency === 'once_per_trip') {
            if (ruleState.lastTriggered && Date.now() - ruleState.lastTriggered < 3600000) {
              continue; // Skip if triggered in last hour
            }
          }

          await this.executeAutomationRule(rule, { vehicleData });
          this.setRuleState(ruleId, { lastTriggered: Date.now() });
        }
      }
    } catch (error) {
      console.error('Error checking vehicle state triggers:', error);
    }
  }

  private checkTimeTriggers(): void {
    const now = new Date();
    
    for (const [ruleId, rule] of this.automationRules) {
      if (!rule.enabled || rule.trigger.type !== 'time') continue;
      
      // Simple time matching - can be enhanced
      if (rule.trigger.time) {
        const [hours, minutes] = rule.trigger.time.split(':').map(Number);
        if (now.getHours() === hours && now.getMinutes() === minutes) {
          const ruleState = this.getRuleState(ruleId);
          
          // Prevent multiple triggers in same minute
          if (!ruleState.lastTriggered || Date.now() - ruleState.lastTriggered > 60000) {
            this.executeAutomationRule(rule);
            this.setRuleState(ruleId, { lastTriggered: Date.now() });
          }
        }
      }
    }
  }

  private evaluateVehicleCondition(vehicleData: VehicleData, condition: string): boolean {
    try {
      // Simple condition evaluation - can be enhanced with a proper parser
      if (condition.includes('battery_level <')) {
        const threshold = parseInt(condition.split('<')[1].trim());
        return vehicleData.charge_state.battery_level < threshold;
      }
      
      if (condition.includes('battery_level >')) {
        const threshold = parseInt(condition.split('>')[1].trim());
        return vehicleData.charge_state.battery_level > threshold;
      }

      if (condition.includes('charging_state =')) {
        const state = condition.split('=')[1].trim().replace(/['"]/g, '');
        return vehicleData.charge_state.charging_state === state;
      }

      return false;
    } catch (error) {
      console.error('Error evaluating condition:', condition, error);
      return false;
    }
  }

  private async executeAutomationRule(rule: AutomationRule, context: any = {}): Promise<void> {
    console.log(`Executing automation rule: ${rule.name}`);

    try {
      for (const action of rule.actions) {
        await this.executeAction(action, context);
        // Brief delay between actions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "Automation Executed",
        description: `${rule.name} completed successfully`,
      });

    } catch (error) {
      console.error(`Automation rule failed: ${rule.name}`, error);
      
      toast({
        title: "Automation Failed",
        description: `${rule.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }

  private async executeAction(action: AutomationAction, context: any): Promise<void> {
    const vehicleId = teslaAPI.getCurrentVehicleId();

    switch (action.type) {
      case 'vehicle_command':
        if (action.command) {
          await teslaAPI.executeCommand(vehicleId, action.command, action.params);
        }
        break;

      case 'climate_control':
        if (action.command === 'start_climate') {
          let params = action.params || {};
          
          await teslaAPI.executeCommand(vehicleId, 'auto_conditioning_start');
          
          if (params.temperature) {
            await teslaAPI.executeCommand(vehicleId, 'set_temps', {
              driver_temp: params.temperature,
              passenger_temp: params.temperature
            });
          }
        } else if (action.command === 'stop_climate') {
          await teslaAPI.executeCommand(vehicleId, 'auto_conditioning_stop');
        }
        break;

      case 'charging_check':
        if (context.vehicleData) {
          const currentLevel = context.vehicleData.charge_state.battery_level;
          if (action.minimumLevel && currentLevel < action.minimumLevel) {
            toast({
              title: "Charging Needed",
              description: `Battery at ${currentLevel}%, need ${action.minimumLevel}% for trip`,
              variant: "destructive",
            });
          }
        }
        break;

      case 'notification':
        if (action.message) {
          let message = action.message;
          
          // Simple template replacement
          if (context.vehicleData) {
            message = message.replace('{battery_level}', context.vehicleData.charge_state.battery_level.toString());
          }

          toast({
            title: "Automation Alert",
            description: message,
            variant: action.priority === 'high' ? 'destructive' : 'default',
          });
        }
        break;

      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private getRuleState(ruleId: string): any {
    return this.ruleStates.get(ruleId) || {};
  }

  private setRuleState(ruleId: string, state: any): void {
    this.ruleStates.set(ruleId, { ...this.getRuleState(ruleId), ...state });
  }

  // Public methods for managing rules
  getRules(): AutomationRule[] {
    return Array.from(this.automationRules.values());
  }

  getRule(id: string): AutomationRule | undefined {
    return this.automationRules.get(id);
  }

  updateRule(id: string, updates: Partial<AutomationRule>): void {
    const rule = this.automationRules.get(id);
    if (rule) {
      this.automationRules.set(id, { ...rule, ...updates });
      this.saveRules();
    }
  }

  enableRule(id: string): void {
    this.updateRule(id, { enabled: true });
  }

  disableRule(id: string): void {
    this.updateRule(id, { enabled: false });
  }

  deleteRule(id: string): void {
    this.automationRules.delete(id);
    this.ruleStates.delete(id);
    this.saveRules();
  }

  createCustomRule(rule: Omit<AutomationRule, 'id' | 'created'>): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: `custom_${Date.now()}`,
      created: Date.now(),
      custom: true
    };

    this.automationRules.set(newRule.id, newRule);
    this.saveRules();

    return newRule;
  }
}

// Export singleton instance
export const automationEngine = new TeslaAutomationEngine();
