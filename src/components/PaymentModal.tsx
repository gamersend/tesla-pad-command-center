
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlanFeatures {
  [key: string]: {
    name: string;
    price: number;
    features: string[];
    limitations: {
      vehicles: string;
      aiQueries: string;
      automationTriggers: string;
      cloudStorage: string;
    };
  };
}

const SUBSCRIPTION_PLANS: PlanFeatures = {
  starter: {
    name: 'Tesla Dashboard Starter',
    price: 9.99,
    features: [
      'Basic Tesla Control Hub',
      'Core Productivity Apps (8)',
      'Weather & Maps Integration',
      'Basic AI Assistant (100 queries/month)',
      'Standard Support',
      'Single Vehicle Support',
      '1GB Cloud Storage'
    ],
    limitations: {
      vehicles: '1',
      aiQueries: '100',
      automationTriggers: '5',
      cloudStorage: '1GB'
    }
  },
  pro: {
    name: 'Tesla Dashboard Pro',
    price: 24.99,
    features: [
      'Advanced Tesla Automation',
      'Complete App Suite (26 apps)',
      'Unlimited AI Assistant',
      'Home Assistant Integration',
      'Crypto Payment Support',
      'Advanced Analytics',
      'Priority Support',
      'Multi-Vehicle Support (3)',
      'Data Export Tools',
      'Custom Wallpapers'
    ],
    limitations: {
      vehicles: '3',
      aiQueries: 'unlimited',
      automationTriggers: 'unlimited',
      cloudStorage: '10GB'
    }
  },
  fleet: {
    name: 'Tesla Dashboard Fleet',
    price: 99.99,
    features: [
      'Unlimited Tesla Vehicles',
      'Fleet Management Dashboard',
      'Advanced Analytics & Reporting',
      'Custom API Integrations',
      'White-label Options',
      'Dedicated Support Manager',
      'Custom Feature Development',
      'Enterprise Security',
      'SLA Guarantees'
    ],
    limitations: {
      vehicles: 'unlimited',
      aiQueries: 'unlimited',
      automationTriggers: 'unlimited',
      cloudStorage: '100GB'
    }
  }
};

const CRYPTO_CURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin', logo: '₿', featured: false },
  { symbol: 'ETH', name: 'Ethereum', logo: 'Ξ', featured: false },
  { symbol: 'DOGE', name: 'Dogecoin', logo: 'Ð', featured: true },
  { symbol: 'USDT', name: 'Tether', logo: '₮', featured: false },
  { symbol: 'USDC', name: 'USD Coin', logo: '$', featured: false },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'crypto'>('paypal');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('DOGE');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalPayment = async (planType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate PayPal integration
    toast({
      title: "PayPal Integration",
      description: "PayPal payment integration would be implemented here using PayPal SDK v4 for Tesla Chromium 79 compatibility.",
    });
    
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Successful! 🎉",
        description: `Welcome to Tesla Dashboard ${planType.charAt(0).toUpperCase() + planType.slice(1)}! Your subscription is now active.`,
      });
      onClose();
    }, 2000);
  };

  const handleCryptoPayment = async (planType: string, cryptoCurrency: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate NOWPayments integration
    toast({
      title: "Crypto Payment Initiated",
      description: `Creating ${cryptoCurrency} payment for Tesla Dashboard ${planType} plan. NOWPayments integration would handle the crypto transaction.`,
    });
    
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Crypto Payment Created! 💰",
        description: `Your ${cryptoCurrency} payment is being processed. You'll receive confirmation once the transaction is confirmed on the blockchain.`,
      });
      onClose();
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-purple-900 text-white border-purple-500">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">🚀 Upgrade Tesla Dashboard</DialogTitle>
          <DialogDescription className="text-purple-200">
            Choose your plan and payment method to unlock premium Tesla features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => (
              <Card 
                key={planKey}
                className={`cursor-pointer transition-all ${
                  selectedPlan === planKey 
                    ? 'bg-purple-600/50 border-purple-400 ring-2 ring-purple-400' 
                    : 'bg-black/50 border-purple-500/50 hover:border-purple-400'
                }`}
                onClick={() => setSelectedPlan(planKey)}
              >
                <CardHeader>
                  <CardTitle className="text-white flex justify-between items-center">
                    {plan.name.split(' ').pop()}
                    {planKey === 'pro' && <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">Popular</Badge>}
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-center text-purple-100">
                        <span className="mr-2">✅</span>
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-purple-300">+ {plan.features.length - 5} more features</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Method Selection */}
          <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'paypal' | 'crypto')}>
            <TabsList className="grid w-full grid-cols-2 bg-purple-900/50">
              <TabsTrigger value="paypal" className="text-white data-[state=active]:bg-purple-600">
                💳 PayPal
              </TabsTrigger>
              <TabsTrigger value="crypto" className="text-white data-[state=active]:bg-purple-600">
                ₿ Cryptocurrency
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paypal" className="space-y-4">
              <Card className="bg-black/50 border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2">💳</span>
                    PayPal Payment
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Secure payment processing with PayPal - Tesla Chromium 79 optimized
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handlePayPalPayment(selectedPlan)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                  >
                    {isProcessing ? "Processing..." : `Pay $${SUBSCRIPTION_PLANS[selectedPlan].price} with PayPal`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto" className="space-y-4">
              <Card className="bg-black/50 border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2">₿</span>
                    Cryptocurrency Payment
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Pay with crypto via NOWPayments - Support for 10+ cryptocurrencies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {CRYPTO_CURRENCIES.map((crypto) => (
                      <Button
                        key={crypto.symbol}
                        variant={selectedCrypto === crypto.symbol ? "default" : "outline"}
                        onClick={() => setSelectedCrypto(crypto.symbol)}
                        className={`h-16 flex flex-col items-center justify-center ${
                          selectedCrypto === crypto.symbol 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : 'bg-black/50 border-purple-500/50 hover:border-purple-400 text-white'
                        } ${crypto.featured ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        <span className="text-lg">{crypto.logo}</span>
                        <span className="text-xs">{crypto.symbol}</span>
                        {crypto.featured && <span className="text-xs text-yellow-400">⭐ Featured</span>}
                      </Button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handleCryptoPayment(selectedPlan, selectedCrypto)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white"
                  >
                    {isProcessing ? "Creating Payment..." : `Pay with ${selectedCrypto}`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Selected Plan Summary */}
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400">
            <CardHeader>
              <CardTitle className="text-white">📋 Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-white">
                <span>{SUBSCRIPTION_PLANS[selectedPlan].name}</span>
                <span className="text-xl font-bold">${SUBSCRIPTION_PLANS[selectedPlan].price}/month</span>
              </div>
              <p className="text-purple-200 text-sm mt-2">
                Monthly subscription • Cancel anytime • No setup fees
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
