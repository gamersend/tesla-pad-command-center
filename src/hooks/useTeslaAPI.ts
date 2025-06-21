
import { useState, useEffect, useCallback } from 'react';
import { teslaAPI, VehicleData, CommandResponse } from '@/services/teslaAPI';
import { toast } from '@/hooks/use-toast';

export const useTeslaAPI = () => {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(teslaAPI.isConfigured());
  }, []);

  const fetchVehicleData = useCallback(async (useCache: boolean = true) => {
    if (!teslaAPI.isConfigured()) {
      setError('Tesla API not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vehicleId = teslaAPI.getCurrentVehicleId();
      const data = await teslaAPI.getVehicleData(vehicleId, useCache);
      setVehicleData(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Tesla API Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const executeCommand = useCallback(async (command: string, params: any = {}) => {
    if (!teslaAPI.isConfigured()) {
      toast({
        title: "Configuration Required",
        description: "Please configure Tesla API settings first",
        variant: "destructive",
      });
      return { success: false, error: 'Not configured' };
    }

    setLoading(true);

    try {
      const vehicleId = teslaAPI.getCurrentVehicleId();
      const result = await teslaAPI.executeCommand(vehicleId, command, params);
      
      if (result.success) {
        toast({
          title: "Command Executed",
          description: `Successfully executed: ${command}`,
        });
        
        // Refresh vehicle data after command
        setTimeout(() => fetchVehicleData(false), 2000);
      } else {
        toast({
          title: "Command Failed",
          description: result.error || 'Unknown error',
          variant: "destructive",
        });
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error';
      toast({
        title: "Command Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchVehicleData]);

  // Auto-refresh vehicle data
  useEffect(() => {
    if (isConfigured) {
      fetchVehicleData();
      
      const interval = setInterval(() => {
        fetchVehicleData(true);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isConfigured, fetchVehicleData]);

  return {
    vehicleData,
    loading,
    error,
    isConfigured,
    fetchVehicleData,
    executeCommand,
    refresh: () => fetchVehicleData(false)
  };
};
