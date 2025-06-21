
import { useState, useEffect } from 'react';
import { automationEngine, AutomationRule } from '@/services/automationEngine';

export const useAutomation = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshRules = () => {
    setRules(automationEngine.getRules());
  };

  useEffect(() => {
    refreshRules();
    automationEngine.startMonitoring();

    return () => {
      automationEngine.stopMonitoring();
    };
  }, []);

  const enableRule = (id: string) => {
    automationEngine.enableRule(id);
    refreshRules();
  };

  const disableRule = (id: string) => {
    automationEngine.disableRule(id);
    refreshRules();
  };

  const deleteRule = (id: string) => {
    automationEngine.deleteRule(id);
    refreshRules();
  };

  const createRule = (rule: Omit<AutomationRule, 'id' | 'created'>) => {
    setLoading(true);
    try {
      automationEngine.createCustomRule(rule);
      refreshRules();
    } finally {
      setLoading(false);
    }
  };

  const updateRule = (id: string, updates: Partial<AutomationRule>) => {
    automationEngine.updateRule(id, updates);
    refreshRules();
  };

  return {
    rules,
    loading,
    enableRule,
    disableRule,
    deleteRule,
    createRule,
    updateRule,
    refreshRules
  };
};
