
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  id: string;
  plan_type: 'free' | 'starter' | 'pro' | 'fleet';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  payment_provider?: string;
  current_period_end?: string;
}

interface FeatureAccess {
  teslaControl: string;
  aiAssistant: string;
  automation: string;
  analytics: string;
  multiVehicle: string;
  cryptoPayments: string;
  prioritySupport: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [featureAccess, setFeatureAccess] = useState<FeatureAccess | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setFeatureAccess(null);
      setLoading(false);
      return;
    }

    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
        setDefaultFreeSubscription();
        return;
      }

      const finalSubscription = subscription || {
        id: 'free',
        plan_type: 'free' as const,
        status: 'active' as const,
      };

      setSubscription(finalSubscription);
      updateFeatureAccess(finalSubscription.plan_type);
    } catch (error) {
      console.error('Subscription loading error:', error);
      setDefaultFreeSubscription();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultFreeSubscription = () => {
    const freeSubscription = {
      id: 'free',
      plan_type: 'free' as const,
      status: 'active' as const,
    };
    setSubscription(freeSubscription);
    updateFeatureAccess('free');
  };

  const updateFeatureAccess = (planType: string) => {
    const featureMatrix: Record<string, FeatureAccess> = {
      free: {
        teslaControl: 'basic',
        aiAssistant: 'limited',
        automation: 'disabled',
        analytics: 'basic',
        multiVehicle: 'disabled',
        cryptoPayments: 'disabled',
        prioritySupport: 'disabled'
      },
      starter: {
        teslaControl: 'full',
        aiAssistant: 'unlimited',
        automation: 'basic',
        analytics: 'standard',
        multiVehicle: 'single',
        cryptoPayments: 'enabled',
        prioritySupport: 'email'
      },
      pro: {
        teslaControl: 'advanced',
        aiAssistant: 'unlimited',
        automation: 'unlimited',
        analytics: 'advanced',
        multiVehicle: 'limited',
        cryptoPayments: 'enabled',
        prioritySupport: 'priority'
      },
      fleet: {
        teslaControl: 'enterprise',
        aiAssistant: 'unlimited',
        automation: 'enterprise',
        analytics: 'enterprise',
        multiVehicle: 'unlimited',
        cryptoPayments: 'enabled',
        prioritySupport: 'dedicated'
      }
    };

    setFeatureAccess(featureMatrix[planType] || featureMatrix.free);
  };

  const checkFeatureAccess = (feature: keyof FeatureAccess): boolean => {
    if (!featureAccess) return false;
    const access = featureAccess[feature];
    return access !== 'disabled';
  };

  const hasUnlimitedAccess = (feature: keyof FeatureAccess): boolean => {
    if (!featureAccess) return false;
    const access = featureAccess[feature];
    return access === 'unlimited' || access === 'enterprise';
  };

  return {
    subscription,
    loading,
    featureAccess,
    checkFeatureAccess,
    hasUnlimitedAccess,
    refreshSubscription: loadSubscription,
  };
};
