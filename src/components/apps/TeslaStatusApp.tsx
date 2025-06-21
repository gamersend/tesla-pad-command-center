
import React, { useState } from 'react';
import { 
  Car, 
  Battery, 
  Thermometer, 
  MapPin, 
  Clock, 
  Zap,
  Shield,
  Settings,
  Play,
  Pause,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeslaAPI } from '@/hooks/useTeslaAPI';
import { useAutomation } from '@/hooks/useAutomation';

const TeslaStatusApp: React.FC = () => {
  const { vehicleData, loading, error, isConfigured } = useTeslaAPI();
  const { rules, enableRule, disableRule, deleteRule } = useAutomation();

  if (!isConfigured) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Car size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Tesla API Not Configured</h2>
          <p className="text-gray-300 mb-4">
            Configure your Tesla API settings to view vehicle status and automation.
          </p>
          <Button variant="outline" className="text-gray-400 border-gray-400 hover:bg-gray-400 hover:text-black">
            <Settings className="w-4 h-4 mr-2" />
            Open Settings
          </Button>
        </div>
      </div>
    );
  }

  const formatLastSeen = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-y-auto">
      <div className="p-6">
        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="status" className="data-[state=active]:bg-gray-700">Vehicle Status</TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-gray-700">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            {loading && !vehicleData && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading vehicle data...</p>
              </div>
            )}

            {error && (
              <Card className="bg-red-900/20 border-red-800">
                <CardContent className="p-6 text-center">
                  <p className="text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {vehicleData && (
              <>
                {/* Vehicle Overview */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Car className="w-5 h-5 mr-2" />
                      {vehicleData.display_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Status</div>
                        <Badge className={`${
                          vehicleData.state === 'online' ? 'bg-green-600' :
                          vehicleData.state === 'asleep' ? 'bg-yellow-600' : 'bg-red-600'
                        } text-white`}>
                          {vehicleData.state.charAt(0).toUpperCase() + vehicleData.state.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Software</div>
                        <div className="text-white">{vehicleData.vehicle_state?.car_version || 'Unknown'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Battery & Range */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Battery className="w-5 h-5 mr-2 text-green-400" />
                      Battery & Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {vehicleData.charge_state?.battery_level || 0}%
                        </div>
                        <div className="text-sm text-gray-400">Battery Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {Math.round(vehicleData.charge_state?.est_battery_range || 0)}
                        </div>
                        <div className="text-sm text-gray-400">Miles Range</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {vehicleData.charge_state?.charge_rate || 0}
                        </div>
                        <div className="text-sm text-gray-400">MPH Charging</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Charging State</span>
                        <Badge variant={vehicleData.charge_state?.charging_state === 'Charging' ? 'default' : 'secondary'}>
                          {vehicleData.charge_state?.charging_state || 'Unknown'}
                        </Badge>
                      </div>
                      {vehicleData.charge_state?.time_to_full_charge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time to Full</span>
                          <span className="text-white">{vehicleData.charge_state.time_to_full_charge} hours</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Climate */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Thermometer className="w-5 h-5 mr-2 text-orange-400" />
                      Climate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">
                          {vehicleData.climate_state?.inside_temp ? Math.round(vehicleData.climate_state.inside_temp) : '--'}°C
                        </div>
                        <div className="text-sm text-gray-400">Interior</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {vehicleData.climate_state?.outside_temp ? Math.round(vehicleData.climate_state.outside_temp) : '--'}°C
                        </div>
                        <div className="text-sm text-gray-400">Exterior</div>
                      </div>
                      <div className="text-center">
                        <Badge className={`${vehicleData.climate_state?.is_climate_on ? 'bg-green-600' : 'bg-gray-600'} text-white`}>
                          {vehicleData.climate_state?.is_climate_on ? 'On' : 'Off'}
                        </Badge>
                        <div className="text-sm text-gray-400 mt-1">Climate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Shield className="w-5 h-5 mr-2 text-green-400" />
                      Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Doors</span>
                      <Badge className={`${vehicleData.vehicle_state?.locked ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                        {vehicleData.vehicle_state?.locked ? 'Locked' : 'Unlocked'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Sentry Mode</span>
                      <Badge className={`${vehicleData.vehicle_state?.sentry_mode ? 'bg-yellow-600' : 'bg-gray-600'} text-white`}>
                        {vehicleData.vehicle_state?.sentry_mode ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Odometer */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                      Location & Mileage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Odometer</span>
                      <span className="text-white">
                        {vehicleData.vehicle_state?.odometer ? Math.round(vehicleData.vehicle_state.odometer).toLocaleString() : '--'} miles
                      </span>
                    </div>
                    {vehicleData.drive_state?.latitude && vehicleData.drive_state?.longitude && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Coordinates</span>
                        <span className="text-white text-sm">
                          {vehicleData.drive_state.latitude.toFixed(4)}, {vehicleData.drive_state.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Automation Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rules.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400">No automation rules configured</p>
                  </div>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} className="border border-gray-600 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{rule.name}</h3>
                          <p className="text-sm text-gray-400">{rule.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                enableRule(rule.id);
                              } else {
                                disableRule(rule.id);
                              }
                            }}
                          />
                          {rule.custom && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteRule(rule.id)}
                              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="border-blue-400 text-blue-400">
                            {rule.trigger.type}
                          </Badge>
                          {rule.custom && (
                            <Badge variant="outline" className="border-purple-400 text-purple-400">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <div className="text-gray-400">
                          {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''} configured
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
                    <Play className="w-4 h-4 mr-2" />
                    Create Rule
                  </Button>
                  <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black">
                    <Settings className="w-4 h-4 mr-2" />
                    Automation Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeslaStatusApp;
