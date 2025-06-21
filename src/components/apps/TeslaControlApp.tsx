
import React, { useState } from 'react';
import { 
  Car, 
  Thermometer, 
  Zap, 
  Lock, 
  Unlock, 
  Play, 
  Square, 
  Battery, 
  MapPin,
  Settings,
  Gauge,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeslaAPI } from '@/hooks/useTeslaAPI';

const TeslaControlApp: React.FC = () => {
  const { vehicleData, loading, error, isConfigured, executeCommand, refresh } = useTeslaAPI();
  const [executingCommand, setExecutingCommand] = useState<string | null>(null);

  if (!isConfigured) {
    return (
      <div className="h-full bg-gradient-to-br from-red-900 via-black to-red-900 text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Car size={64} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2">Tesla API Not Configured</h2>
          <p className="text-gray-300 mb-4">
            Please configure your Tesla API settings in the Settings app to control your vehicle.
          </p>
          <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black">
            <Settings className="w-4 h-4 mr-2" />
            Open Settings
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gradient-to-br from-red-900 via-black to-red-900 text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Car size={64} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const handleCommand = async (command: string, params: any = {}) => {
    setExecutingCommand(command);
    await executeCommand(command, params);
    setExecutingCommand(null);
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'online': return 'bg-green-500';
      case 'asleep': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-400';
    if (level > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-red-900 text-white overflow-y-auto">
      {loading && !vehicleData && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Connecting to your Tesla...</p>
          </div>
        </div>
      )}

      {vehicleData && (
        <div className="p-6 space-y-6">
          {/* Vehicle Status Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Car size={32} className="text-red-400" />
              <h1 className="text-3xl font-bold">{vehicleData.display_name}</h1>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <Badge className={`${getStatusColor(vehicleData.state)} text-black`}>
                {vehicleData.state.charAt(0).toUpperCase() + vehicleData.state.slice(1)}
              </Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                v{vehicleData.vehicle_state?.car_version || 'Unknown'}
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <Battery className={`w-8 h-8 mx-auto mb-2 ${getBatteryColor(vehicleData.charge_state?.battery_level || 0)}`} />
                <div className="text-2xl font-bold">{vehicleData.charge_state?.battery_level || 0}%</div>
                <div className="text-sm text-gray-400">Battery</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <Gauge className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold">{Math.round(vehicleData.charge_state?.est_battery_range || 0)}</div>
                <div className="text-sm text-gray-400">Miles</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <Thermometer className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                <div className="text-2xl font-bold">{vehicleData.climate_state?.inside_temp ? Math.round(vehicleData.climate_state.inside_temp) : '--'}°</div>
                <div className="text-sm text-gray-400">Interior</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold">{vehicleData.vehicle_state?.odometer ? Math.round(vehicleData.vehicle_state.odometer).toLocaleString() : '--'}</div>
                <div className="text-sm text-gray-400">Miles</div>
              </CardContent>
            </Card>
          </div>

          {/* Climate Controls */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Thermometer className="w-5 h-5 mr-2 text-orange-400" />
                Climate Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status: {vehicleData.climate_state?.is_climate_on ? 'On' : 'Off'}</span>
                <Badge variant={vehicleData.climate_state?.is_climate_on ? 'default' : 'secondary'}>
                  {vehicleData.climate_state?.is_climate_on ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleCommand('auto_conditioning_start')}
                  disabled={executingCommand === 'auto_conditioning_start' || vehicleData.climate_state?.is_climate_on}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {executingCommand === 'auto_conditioning_start' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Start Climate
                </Button>
                
                <Button 
                  onClick={() => handleCommand('auto_conditioning_stop')}
                  disabled={executingCommand === 'auto_conditioning_stop' || !vehicleData.climate_state?.is_climate_on}
                  variant="outline"
                  className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                >
                  {executingCommand === 'auto_conditioning_stop' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  Stop Climate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charging Controls */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Zap className="w-5 h-5 mr-2 text-blue-400" />
                Charging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="font-semibold">{vehicleData.charge_state?.charging_state || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Rate</div>
                  <div className="font-semibold">{vehicleData.charge_state?.charge_rate || 0} mph</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleCommand('charge_start')}
                  disabled={executingCommand === 'charge_start' || vehicleData.charge_state?.charging_state === 'Charging'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {executingCommand === 'charge_start' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Start Charging
                </Button>
                
                <Button 
                  onClick={() => handleCommand('charge_stop')}
                  disabled={executingCommand === 'charge_stop' || vehicleData.charge_state?.charging_state !== 'Charging'}
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  {executingCommand === 'charge_stop' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  Stop Charging
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Controls */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Lock className="w-5 h-5 mr-2 text-green-400" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Doors: {vehicleData.vehicle_state?.locked ? 'Locked' : 'Unlocked'}</span>
                <Badge variant={vehicleData.vehicle_state?.locked ? 'default' : 'destructive'}>
                  {vehicleData.vehicle_state?.locked ? 'Secure' : 'Unlocked'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleCommand('door_lock')}
                  disabled={executingCommand === 'door_lock' || vehicleData.vehicle_state?.locked}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {executingCommand === 'door_lock' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Lock
                </Button>
                
                <Button 
                  onClick={() => handleCommand('door_unlock')}
                  disabled={executingCommand === 'door_unlock' || !vehicleData.vehicle_state?.locked}
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                >
                  {executingCommand === 'door_unlock' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Unlock className="w-4 h-4 mr-2" />
                  )}
                  Unlock
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleCommand('flash_lights')}
                  disabled={executingCommand === 'flash_lights'}
                  variant="outline"
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
                >
                  {executingCommand === 'flash_lights' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Sun className="w-4 h-4 mr-2" />
                  )}
                  Flash Lights
                </Button>
                
                <Button 
                  onClick={() => handleCommand('honk_horn')}
                  disabled={executingCommand === 'honk_horn'}
                  variant="outline"
                  className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                >
                  {executingCommand === 'honk_horn' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Car className="w-4 h-4 mr-2" />
                  )}
                  Honk Horn
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Refresh Button */}
          <div className="text-center">
            <Button 
              onClick={refresh}
              disabled={loading}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                'Refresh Data'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeslaControlApp;
