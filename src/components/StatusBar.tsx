
import React from 'react';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';

export const StatusBar: React.FC = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();

  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  const currentDate = new Date().toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'starter': return 'bg-blue-600';
      case 'pro': return 'bg-purple-600';
      case 'fleet': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-black/40 backdrop-blur-md text-white text-sm border-b border-purple-500/30">
      {/* Left side - Tesla Dashboard branding */}
      <div className="flex items-center space-x-3">
        <span className="text-lg">🚗</span>
        <span className="font-semibold">Tesla Dashboard</span>
        {subscription && (
          <Badge className={`${getPlanColor(subscription.plan_type)} text-white text-xs`}>
            {subscription.plan_type.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Center - Current time and date */}
      <div className="flex items-center space-x-4">
        <span className="font-mono text-lg">{currentTime}</span>
        <span className="text-purple-300">{currentDate}</span>
      </div>

      {/* Right side - System indicators and user menu */}
      <div className="flex items-center space-x-4">
        {/* Connection status */}
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Online</span>
        </div>

        {/* Battery indicator (simulated) */}
        <div className="flex items-center space-x-1">
          <span className="text-xs">🔋</span>
          <span className="text-xs text-green-400">85%</span>
        </div>

        {/* Signal strength */}
        <div className="flex items-center space-x-1">
          <span className="text-xs">📶</span>
          <span className="text-xs text-blue-400">LTE</span>
        </div>

        {/* User menu */}
        {user && <UserMenu />}
      </div>
    </div>
  );
};
