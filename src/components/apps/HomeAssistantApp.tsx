
import React, { useState, useEffect } from 'react';
import { Settings, Home, Zap, Lock, Thermometer, Car, Plus, Wifi, WifiOff, Play, Pause, ChevronRight, Bell, MapPin, Clock, Calendar } from 'lucide-react';

interface HomeAssistantEntity {
  entity_id: string;
  state: string;
  attributes: any;
  friendly_name: string;
  last_changed: string;
  domain: string;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: any;
  conditions?: any[];
  actions: any[];
  enabled: boolean;
  lastTriggered?: number;
  custom?: boolean;
}

const HomeAssistantApp: React.FC = () => {
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [entities, setEntities] = useState<Map<string, HomeAssistantEntity>>(new Map());
  const [entitiesByDomain, setEntitiesByDomain] = useState<Record<string, HomeAssistantEntity[]>>({});
  const [automations, setAutomations] = useState<Map<string, AutomationRule>>(new Map());
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showAutomationBuilder, setShowAutomationBuilder] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [haConfig, setHaConfig] = useState({
    url: localStorage.getItem('ha_url') || '',
    token: localStorage.getItem('ha_token') || '',
    autoConnect: localStorage.getItem('ha_auto_connect') === 'true'
  });

  // Initialize default automations
  useEffect(() => {
    const defaultAutomations = [
      {
        id: 'arrive_home',
        name: 'Arrive Home',
        description: 'Turn on lights and open garage when Tesla arrives home',
        trigger: { type: 'location', event: 'arrive', location: 'home', radius: 100 },
        conditions: [{ entity: 'sun.sun', state: 'below_horizon' }],
        actions: [
          { service: 'cover.open_cover', entity: 'cover.garage_door' },
          { service: 'light.turn_on', entity: 'light.driveway', brightness: 255 },
          { service: 'light.turn_on', entity: 'light.entrance', brightness: 200 }
        ],
        enabled: false
      },
      {
        id: 'leave_home',
        name: 'Leave Home',
        description: 'Secure home and adjust climate when Tesla leaves',
        trigger: { type: 'location', event: 'leave', location: 'home', radius: 200 },
        actions: [
          { service: 'cover.close_cover', entity: 'cover.garage_door' },
          { service: 'light.turn_off', entity: 'group.all_lights' },
          { service: 'climate.set_temperature', entity: 'climate.house', temperature: 68 }
        ],
        enabled: false
      },
      {
        id: 'charging_complete',
        name: 'Charging Complete',
        description: 'Notify and indicate when Tesla charging completes',
        trigger: { type: 'tesla_event', event: 'charging_complete' },
        actions: [
          { service: 'notify.mobile_app', message: 'Tesla charging complete' },
          { service: 'light.turn_on', entity: 'light.garage', color: 'green', brightness: 100 }
        ],
        enabled: false
      }
    ];

    const automationMap = new Map();
    defaultAutomations.forEach(auto => automationMap.set(auto.id, auto));
    setAutomations(automationMap);
  }, []);

  // Mock entities for demonstration
  useEffect(() => {
    if (connectionState === 'connected') {
      const mockEntities = [
        // Lights
        { entity_id: 'light.living_room', state: 'on', attributes: { brightness: 200, friendly_name: 'Living Room Light' }, domain: 'light' },
        { entity_id: 'light.kitchen', state: 'off', attributes: { friendly_name: 'Kitchen Light' }, domain: 'light' },
        { entity_id: 'light.bedroom', state: 'on', attributes: { brightness: 150, friendly_name: 'Bedroom Light' }, domain: 'light' },
        { entity_id: 'light.garage', state: 'off', attributes: { friendly_name: 'Garage Light' }, domain: 'light' },
        
        // Switches
        { entity_id: 'switch.coffee_maker', state: 'off', attributes: { friendly_name: 'Coffee Maker' }, domain: 'switch' },
        { entity_id: 'switch.outside_lights', state: 'on', attributes: { friendly_name: 'Outside Lights' }, domain: 'switch' },
        
        // Covers (Garage, blinds, etc.)
        { entity_id: 'cover.garage_door', state: 'closed', attributes: { friendly_name: 'Garage Door' }, domain: 'cover' },
        { entity_id: 'cover.living_room_blinds', state: 'open', attributes: { friendly_name: 'Living Room Blinds' }, domain: 'cover' },
        
        // Climate
        { entity_id: 'climate.house', state: 'heat', attributes: { temperature: 72, target_temp_high: 75, target_temp_low: 68, friendly_name: 'House Thermostat' }, domain: 'climate' },
        
        // Locks
        { entity_id: 'lock.front_door', state: 'locked', attributes: { friendly_name: 'Front Door Lock' }, domain: 'lock' },
        { entity_id: 'lock.back_door', state: 'unlocked', attributes: { friendly_name: 'Back Door Lock' }, domain: 'lock' },
        
        // Sensors
        { entity_id: 'sensor.outside_temperature', state: '68', attributes: { unit_of_measurement: '°F', friendly_name: 'Outside Temperature' }, domain: 'sensor' },
        { entity_id: 'sensor.energy_usage', state: '2.4', attributes: { unit_of_measurement: 'kW', friendly_name: 'Current Energy Usage' }, domain: 'sensor' },
        
        // Security
        { entity_id: 'alarm_control_panel.house', state: 'disarmed', attributes: { friendly_name: 'House Alarm' }, domain: 'alarm_control_panel' }
      ];

      const entityMap = new Map();
      const domains: Record<string, HomeAssistantEntity[]> = {
        light: [],
        switch: [],
        cover: [],
        climate: [],
        lock: [],
        sensor: [],
        alarm_control_panel: []
      };

      mockEntities.forEach(entity => {
        const entityData = {
          ...entity,
          friendly_name: entity.attributes.friendly_name,
          last_changed: new Date().toISOString()
        };
        entityMap.set(entity.entity_id, entityData);
        
        if (domains[entity.domain]) {
          domains[entity.domain].push(entityData);
        }
      });

      setEntities(entityMap);
      setEntitiesByDomain(domains);
    }
  }, [connectionState]);

  const connectToHomeAssistant = async (url: string, token: string) => {
    setConnectionState('connecting');
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would validate the connection
      // const response = await fetch(`${url}/api/`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // Store configuration
      localStorage.setItem('ha_url', url);
      localStorage.setItem('ha_token', token);
      localStorage.setItem('ha_auto_connect', 'true');
      
      setHaConfig({ url, token, autoConnect: true });
      setConnectionState('connected');
      setShowConnectionModal(false);
      
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionState('disconnected');
      alert('Failed to connect to Home Assistant. Please check your URL and token.');
    }
  };

  const callService = async (domain: string, service: string, entityId: string, serviceData: any = {}) => {
    console.log(`Calling service: ${domain}.${service} on ${entityId}`, serviceData);
    
    // Simulate service call and update entity state
    const entity = entities.get(entityId);
    if (entity) {
      const updatedEntity = { ...entity };
      
      // Update state based on service call
      if (domain === 'light' && service === 'turn_on') {
        updatedEntity.state = 'on';
        if (serviceData.brightness) {
          updatedEntity.attributes.brightness = serviceData.brightness;
        }
      } else if (domain === 'light' && service === 'turn_off') {
        updatedEntity.state = 'off';
      } else if (domain === 'switch' && service === 'turn_on') {
        updatedEntity.state = 'on';
      } else if (domain === 'switch' && service === 'turn_off') {
        updatedEntity.state = 'off';
      } else if (domain === 'cover' && service === 'open_cover') {
        updatedEntity.state = 'open';
      } else if (domain === 'cover' && service === 'close_cover') {
        updatedEntity.state = 'closed';
      } else if (domain === 'lock' && service === 'lock') {
        updatedEntity.state = 'locked';
      } else if (domain === 'lock' && service === 'unlock') {
        updatedEntity.state = 'unlocked';
      }
      
      // Update entity in state
      const newEntities = new Map(entities);
      newEntities.set(entityId, updatedEntity);
      setEntities(newEntities);
      
      // Update domain grouping
      const newDomains = { ...entitiesByDomain };
      const domainEntities = newDomains[domain] || [];
      const entityIndex = domainEntities.findIndex(e => e.entity_id === entityId);
      if (entityIndex >= 0) {
        domainEntities[entityIndex] = updatedEntity;
        setEntitiesByDomain(newDomains);
      }
    }
  };

  const toggleAutomation = (automationId: string) => {
    const automation = automations.get(automationId);
    if (automation) {
      const updatedAutomation = { ...automation, enabled: !automation.enabled };
      const newAutomations = new Map(automations);
      newAutomations.set(automationId, updatedAutomation);
      setAutomations(newAutomations);
    }
  };

  const executeAutomation = async (automationId: string) => {
    const automation = automations.get(automationId);
    if (automation && automation.enabled) {
      console.log(`Executing automation: ${automation.name}`);
      
      // Execute all actions
      for (const action of automation.actions) {
        try {
          const [domain, service] = action.service.split('.');
          await callService(domain, service, action.entity, action);
          await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay between actions
        } catch (error) {
          console.error('Failed to execute action:', error);
        }
      }
      
      // Update last triggered time
      const updatedAutomation = { ...automation, lastTriggered: Date.now() };
      const newAutomations = new Map(automations);
      newAutomations.set(automationId, updatedAutomation);
      setAutomations(newAutomations);
    }
  };

  const renderEntityControl = (entity: HomeAssistantEntity) => {
    const isOn = entity.state === 'on' || entity.state === 'open' || entity.state === 'unlocked';
    
    switch (entity.domain) {
      case 'light':
      case 'switch':
        return (
          <button
            onClick={() => callService(entity.domain, isOn ? `turn_off` : `turn_on`, entity.entity_id)}
            className={`entity-toggle ${isOn ? 'on' : ''}`}
          >
            <div className="toggle-slider" />
          </button>
        );
      
      case 'cover':
        return (
          <div className="cover-controls">
            <button
              onClick={() => callService('cover', 'open_cover', entity.entity_id)}
              className="cover-btn"
              title="Open"
            >
              ↑
            </button>
            <button
              onClick={() => callService('cover', 'close_cover', entity.entity_id)}
              className="cover-btn"
              title="Close"
            >
              ↓
            </button>
          </div>
        );
      
      case 'lock':
        return (
          <button
            onClick={() => callService('lock', isOn ? 'lock' : 'unlock', entity.entity_id)}
            className={`entity-toggle ${isOn ? 'on' : ''}`}
          >
            <div className="toggle-slider" />
          </button>
        );
      
      default:
        return (
          <span className="entity-state-text">
            {entity.state} {entity.attributes.unit_of_measurement || ''}
          </span>
        );
    }
  };

  const renderDomainIcon = (domain: string) => {
    switch (domain) {
      case 'light': return <Zap className="domain-icon" />;
      case 'switch': return <Zap className="domain-icon" />;
      case 'cover': return <Home className="domain-icon" />;
      case 'climate': return <Thermometer className="domain-icon" />;
      case 'lock': return <Lock className="domain-icon" />;
      case 'sensor': return <Settings className="domain-icon" />;
      case 'alarm_control_panel': return <Bell className="domain-icon" />;
      default: return <Settings className="domain-icon" />;
    }
  };

  if (showConnectionModal) {
    return (
      <div className="ha-connection-modal">
        <div className="connection-form">
          <h2 className="form-title">Connect to Home Assistant</h2>
          <p className="form-description">
            Enter your Home Assistant URL and Long-Lived Access Token to connect your smart home.
          </p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const url = formData.get('url') as string;
            const token = formData.get('token') as string;
            connectToHomeAssistant(url, token);
          }}>
            <div className="form-group">
              <label className="form-label">Home Assistant URL</label>
              <input
                type="url"
                name="url"
                className="form-input"
                placeholder="https://homeassistant.local:8123"
                defaultValue={haConfig.url}
                required
              />
              <div className="form-help">Include http:// or https:// and port if needed</div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Long-Lived Access Token</label>
              <input
                type="password"
                name="token"
                className="form-input"
                placeholder="Your Home Assistant token"
                defaultValue={haConfig.token}
                required
              />
              <div className="form-help">
                Create in Home Assistant: Profile → Security → Long-Lived Access Tokens
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="form-btn secondary"
                onClick={() => setShowConnectionModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="form-btn primary"
                disabled={connectionState === 'connecting'}
              >
                {connectionState === 'connecting' ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="home-assistant-app">
      {/* Header */}
      <div className="ha-header">
        <div className="ha-title">Home Assistant</div>
        <div className="connection-status">
          <div className={`status-indicator ${connectionState}`} />
          <span>
            {connectionState === 'connected' && 'Connected'}
            {connectionState === 'connecting' && 'Connecting...'}
            {connectionState === 'disconnected' && 'Disconnected'}
          </span>
          {connectionState === 'connected' && (
            <span className="connection-url">• {new URL(haConfig.url).hostname}</span>
          )}
        </div>
      </div>

      {connectionState === 'disconnected' ? (
        <div className="connection-setup">
          <div className="setup-content">
            <div className="setup-icon">
              <WifiOff size={64} />
            </div>
            <h2>Connect Your Smart Home</h2>
            <p>
              Integrate your Tesla dashboard with Home Assistant to control lights, locks, 
              climate, and more. Create intelligent automations that respond to your Tesla's location and status.
            </p>
            <button
              className="connect-btn"
              onClick={() => setShowConnectionModal(true)}
            >
              <Wifi size={20} />
              Connect to Home Assistant
            </button>
          </div>
        </div>
      ) : (
        <div className="ha-content">
          {/* Sidebar */}
          <div className="ha-sidebar">
            <div className="domain-sections">
              {Object.entries(entitiesByDomain).map(([domain, domainEntities]) => (
                domainEntities.length > 0 && (
                  <div key={domain} className="domain-section">
                    <div className="domain-title">
                      {renderDomainIcon(domain)}
                      {domain.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="entity-list">
                      {domainEntities.slice(0, 4).map(entity => (
                        <div key={entity.entity_id} className="entity-item">
                          <div className="entity-info">
                            <div className="entity-name">{entity.friendly_name}</div>
                            <div className="entity-state">
                              {entity.state} {entity.attributes.unit_of_measurement || ''}
                            </div>
                          </div>
                          <div className="entity-control">
                            {renderEntityControl(entity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div className="ha-main-area">
            {/* Quick Actions */}
            <div className="quick-actions">
              <div className="quick-action-card" onClick={() => {
                callService('light', 'turn_off', 'group.all_lights');
                callService('lock', 'lock', 'lock.front_door');
                callService('alarm_control_panel', 'arm_away', 'alarm_control_panel.house');
              }}>
                <div className="action-icon security">🛡️</div>
                <div className="action-title">Secure Home</div>
                <div className="action-description">Lock doors, turn off lights, arm alarm</div>
              </div>

              <div className="quick-action-card" onClick={() => {
                callService('light', 'turn_on', 'light.living_room');
                callService('light', 'turn_on', 'light.kitchen');
                callService('cover', 'open_cover', 'cover.garage_door');
              }}>
                <div className="action-icon lights">💡</div>
                <div className="action-title">Welcome Home</div>
                <div className="action-description">Turn on lights, open garage</div>
              </div>

              <div className="quick-action-card" onClick={() => {
                callService('climate', 'set_temperature', 'climate.house', { temperature: 72 });
              }}>
                <div className="action-icon climate">🌡️</div>
                <div className="action-title">Comfort Mode</div>
                <div className="action-description">Set optimal temperature</div>
              </div>

              <div className="quick-action-card" onClick={() => {
                callService('switch', 'turn_on', 'switch.coffee_maker');
              }}>
                <div className="action-icon garage">☕</div>
                <div className="action-title">Morning Routine</div>
                <div className="action-description">Start coffee maker</div>
              </div>
            </div>

            {/* Tesla Integration Automations */}
            <div className="automation-section">
              <div className="section-header">
                <h3 className="section-title">
                  <Car size={24} style={{ marginRight: '8px' }} />
                  Tesla Automations
                </h3>
                <button className="add-automation-btn" onClick={() => setShowAutomationBuilder(true)}>
                  <Plus size={16} />
                  Add Automation
                </button>
              </div>

              <div className="automation-list">
                {Array.from(automations.values()).map(automation => (
                  <div key={automation.id} className="automation-item">
                    <div className="automation-info">
                      <div className="automation-name">{automation.name}</div>
                      <div className="automation-description">{automation.description}</div>
                      {automation.lastTriggered && (
                        <div className="automation-last-run">
                          Last run: {new Date(automation.lastTriggered).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="automation-controls">
                      <span className={`automation-status ${automation.enabled ? 'enabled' : 'disabled'}`}>
                        {automation.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        className="automation-toggle"
                        onClick={() => toggleAutomation(automation.id)}
                      >
                        {automation.enabled ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      {automation.enabled && (
                        <button
                          className="automation-test"
                          onClick={() => executeAutomation(automation.id)}
                          title="Test automation"
                        >
                          <Zap size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tesla Integration Status */}
            <div className="tesla-integration-status">
              <h3>Tesla Integration Status</h3>
              <div className="integration-cards">
                <div className="integration-card">
                  <div className="card-icon">📍</div>
                  <div className="card-title">Location Tracking</div>
                  <div className="card-status">Active</div>
                  <div className="card-description">Monitoring Tesla location for home automation triggers</div>
                </div>
                
                <div className="integration-card">
                  <div className="card-icon">🔋</div>
                  <div className="card-title">Charging Status</div>
                  <div className="card-status">Monitoring</div>
                  <div className="card-description">Watching for charging events and battery levels</div>
                </div>
                
                <div className="integration-card">
                  <div className="card-icon">🌡️</div>
                  <div className="card-title">Climate Sync</div>
                  <div className="card-status">Ready</div>
                  <div className="card-description">Can coordinate Tesla and home climate systems</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeAssistantApp;
