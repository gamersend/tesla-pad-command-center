
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from './PaymentModal';
import { toast } from '@/hooks/use-toast';

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || '?';
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'starter': return 'bg-blue-600';
      case 'pro': return 'bg-purple-600';
      case 'fleet': return 'bg-gold-600';
      default: return 'bg-gray-600';
    }
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-purple-600 text-white text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-black/90 border-purple-500 text-white" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.first_name} {user.user_metadata?.last_name}
              </p>
              <p className="text-xs leading-none text-purple-300">
                {user.email}
              </p>
              <Badge className={`${getPlanColor(subscription?.plan_type || 'free')} text-white text-xs w-fit`}>
                {subscription?.plan_type?.toUpperCase() || 'FREE'} PLAN
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-purple-500/50" />
          
          {subscription?.plan_type === 'free' && (
            <DropdownMenuItem 
              onClick={() => setShowPaymentModal(true)}
              className="text-yellow-400 hover:text-yellow-300 hover:bg-purple-900/50"
            >
              🚀 Upgrade Plan
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem className="hover:bg-purple-900/50">
            ⚙️ Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem className="hover:bg-purple-900/50">
            🚗 Tesla Vehicles
          </DropdownMenuItem>
          
          <DropdownMenuItem className="hover:bg-purple-900/50">
            📊 Usage & Billing
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-purple-500/50" />
          
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            🚪 Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
    </>
  );
};
