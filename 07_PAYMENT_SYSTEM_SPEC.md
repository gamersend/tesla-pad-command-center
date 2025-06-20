### Comprehensive Multi-Gateway Payment Architecture

#### Payment Gateway Integration Strategy

**Primary Strategy: Dual Payment Processing**

- **Fiat Payments**: PayPal JavaScript SDK v4 (Tesla Chromium 79 compatible)
- **Cryptocurrency**: NOWPayments + CoinGecko API integration
- **Backup Systems**: Coinbase Commerce (crypto), Stripe Billing (subscription management)
- **Tesla Optimization**: All payment flows designed for touch interface and cellular network limitations

#### PayPal Integration (Primary Fiat Gateway)

```javascript
class PayPalIntegration {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.isTestMode = process.env.NODE_ENV !== 'production';
    this.subscriptionPlans = this.initializeSubscriptionPlans();
    this.currentPayment = null;
    this.loadPayPalSDK();
  }
  
  initializeSubscriptionPlans() {
    return {
      starter: {
        planId: 'P-STARTER-TESLA-DASHBOARD',
        name: 'Tesla Dashboard Starter',
        price: 9.99,
        currency: 'USD',
        interval: 'MONTH',
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
          vehicles: 1,
          aiQueries: 100,
          automationTriggers: 5,
          cloudStorage: '1GB'
        }
      },
      
      pro: {
        planId: 'P-PRO-TESLA-DASHBOARD',
        name: 'Tesla Dashboard Pro',
        price: 24.99,
        currency: 'USD',
        interval: 'MONTH',
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
          vehicles: 3,
          aiQueries: 'unlimited',
          automationTriggers: 'unlimited',
          cloudStorage: '10GB'
        }
      },
      
      fleet: {
        planId: 'P-FLEET-TESLA-DASHBOARD',
        name: 'Tesla Dashboard Fleet',
        price: 99.99,
        currency: 'USD',
        interval: 'MONTH',
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
  }
  
  loadPayPalSDK() {
    // Use PayPal SDK v4 - fully compatible with Tesla's Chromium 79
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=USD&intent=subscription&vault=true&disable-funding=credit,card`;
    script.onload = () => this.initializePayPalButtons();
    script.onerror = () => this.handleSDKLoadError();
    document.head.appendChild(script);
  }
  
  initializePayPalButtons() {
    Object.keys(this.subscriptionPlans).forEach(planType => {
      const container = document.getElementById(`paypal-${planType}-button`);
      if (!container) return;
      
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'subscribe',
          height: 50,
          tagline: false
        },
        
        createSubscription: (data, actions) => {
          return actions.subscription.create({
            plan_id: this.subscriptionPlans[planType].planId,
            subscriber: {
              name: {
                given_name: this.getUserFirstName(),
                surname: this.getUserLastName()
              },
              email_address: this.getUserEmail()
            },
            application_context: {
              brand_name: 'Tesla Dashboard Pro',
              locale: 'en-US',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'SUBSCRIBE_NOW',
              payment_method: {
                payer_selected: 'PAYPAL',
                payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
              },
              return_url: `${window.location.origin}/payment/success?plan=${planType}`,
              cancel_url: `${window.location.origin}/payment/cancel?plan=${planType}`
            }
          });
        },
        
        onApprove: async (data, actions) => {
          this.showPaymentProcessing('Verifying your PayPal subscription...');
          
          try {
            const subscriptionDetails = await actions.subscription.get();
            const result = await this.verifyPayPalSubscription(data.subscriptionID, subscriptionDetails, planType);
            
            if (result.success) {
              await this.activateSubscription(planType, result.subscriptionData);
              this.showPaymentSuccess(planType);
              this.redirectToSuccess(planType);
            } else {
              throw new Error(result.error || 'Subscription verification failed');
            }
          } catch (error) {
            this.handlePaymentError(error, planType);
          }
        },
        
        onError: (err) => {
          console.error('PayPal error:', err);
          this.handlePaymentError(err, planType);
        },
        
        onCancel: (data) => {
          this.handlePaymentCancel(data, planType);
        }
      }).render(`#paypal-${planType}-button`);
    });
  }
  
  async verifyPayPalSubscription(subscriptionId, subscriptionDetails, planType) {
    try {
      const response = await fetch('/api/payments/paypal/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          subscriptionId,
          subscriptionDetails,
          planType,
          userId: await this.getCurrentUserId()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('PayPal verification error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async activateSubscription(planType, subscriptionData) {
    // Update user subscription in Supabase
    const { data: user } = await supabase.auth.getUser();
    
    const subscriptionRecord = {
      user_id: user.id,
      plan_type: planType,
      payment_provider: 'paypal',
      external_subscription_id: subscriptionData.subscriptionId,
      status: 'active',
      current_period_start: new Date(subscriptionData.start_time),
      current_period_end: new Date(subscriptionData.billing_info.next_billing_time),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const { error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionRecord, { onConflict: 'user_id' });
    
    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }
    
    // Update user role and permissions
    await this.updateUserPermissions(user.id, planType);
    
    // Send welcome email
    await this.sendWelcomeEmail(user.email, planType);
    
    // Track successful conversion
    this.trackEvent('payment', 'subscription_created', planType, subscriptionData.amount);
  }
  
  showPaymentSuccess(planType) {
    const modal = document.createElement('div');
    modal.className = 'payment-success-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="success-icon">✅</div>
        <h2>Welcome to Tesla Dashboard ${planType.charAt(0).toUpperCase() + planType.slice(1)}!</h2>
        <p>Your subscription has been activated successfully.</p>
        <div class="plan-features">
          <h3>What's included:</h3>
          <ul>
            ${this.subscriptionPlans[planType].features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
        <button class="continue-button" onclick="this.closest('.payment-success-modal').remove()">
          Continue to Dashboard
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
}
```

#### NOWPayments Cryptocurrency Integration

```javascript
class NOWPaymentsCrypto {
  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY;
    this.baseUrl = 'https://api.nowpayments.io/v1';
    this.webhookSecret = process.env.NOWPAYMENTS_WEBHOOK_SECRET;
    this.supportedCurrencies = new Map();
    this.exchangeRates = new Map();
    this.initializeSupportedCurrencies();
    this.setupExchangeRateUpdates();
  }
  
  initializeSupportedCurrencies() {
    const currencies = [
      { symbol: 'BTC', name: 'Bitcoin', logo: '/crypto/btc.svg', minAmount: 0.0001, network: 'bitcoin' },
      { symbol: 'ETH', name: 'Ethereum', logo: '/crypto/eth.svg', minAmount: 0.001, network: 'ethereum' },
      { symbol: 'USDT', name: 'Tether', logo: '/crypto/usdt.svg', minAmount: 1, network: 'ethereum' },
      { symbol: 'USDC', name: 'USD Coin', logo: '/crypto/usdc.svg', minAmount: 1, network: 'ethereum' },
      { symbol: 'DOGE', name: 'Dogecoin', logo: '/crypto/doge.svg', minAmount: 1, network: 'dogecoin', featured: true }, // Tesla's favorite
      { symbol: 'LTC', name: 'Litecoin', logo: '/crypto/ltc.svg', minAmount: 0.01, network: 'litecoin' },
      { symbol: 'BCH', name: 'Bitcoin Cash', logo: '/crypto/bch.svg', minAmount: 0.001, network: 'bitcoin-cash' },
      { symbol: 'XRP', name: 'Ripple', logo: '/crypto/xrp.svg', minAmount: 1, network: 'ripple' },
      { symbol: 'ADA', name: 'Cardano', logo: '/crypto/ada.svg', minAmount: 1, network: 'cardano' },
      { symbol: 'MATIC', name: 'Polygon', logo: '/crypto/matic.svg', minAmount: 1, network: 'polygon' }
    ];
    
    currencies.forEach(currency => {
      this.supportedCurrencies.set(currency.symbol, currency);
    });
  }
  
  async createCryptoPayment(planType, cryptoCurrency, userEmail) {
    const planPrices = {
      'starter': 9.99,
      'pro': 24.99,
      'fleet': 99.99
    };
    
    const usdAmount = planPrices[planType];
    if (!usdAmount) {
      throw new Error(`Invalid plan type: ${planType}`);
    }
    
    const currency = this.supportedCurrencies.get(cryptoCurrency.toUpperCase());
    if (!currency) {
      throw new Error(`Unsupported cryptocurrency: ${cryptoCurrency}`);
    }
    
    try {
      // Get current exchange rate
      const exchangeRate = await this.getExchangeRate(cryptoCurrency);
      const cryptoAmount = (usdAmount / exchangeRate).toFixed(8);
      
      // Check minimum amount
      if (parseFloat(cryptoAmount) < currency.minAmount) {
        throw new Error(`Amount below minimum for ${currency.name}: ${currency.minAmount} ${cryptoCurrency}`);
      }
      
      const paymentData = {
        price_amount: usdAmount,
        price_currency: 'USD',
        pay_currency: cryptoCurrency.toLowerCase(),
        order_id: `tesla_dashboard_${planType}_${Date.now()}`,
        order_description: `Tesla Dashboard ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan - Monthly Subscription`,
        ipn_callback_url: `${window.location.origin}/api/payments/crypto/webhook`,
        success_url: `${window.location.origin}/payment/crypto-success?plan=${planType}`,
        cancel_url: `${window.location.origin}/payment/cancel?plan=${planType}`,
        customer_email: userEmail,
        is_fixed_rate: true,
        is_fee_paid_by_user: false
      };
      
      const response = await fetch(`${this.baseUrl}/payment`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Payment creation failed: ${error}`);
      }
      
      const result = await response.json();
      
      if (result.payment_id) {
        // Store payment in local database for tracking
        await this.storePendingPayment(result, planType, userEmail);
        this.showCryptoPaymentModal(result, currency, planType);
        return result;
      } else {
        throw new Error('Failed to create crypto payment - no payment ID returned');
      }
      
    } catch (error) {
      console.error('Crypto payment creation error:', error);
      this.handleCryptoError(error, planType);
      throw error;
    }
  }
  
  async storePendingPayment(paymentData, planType, userEmail) {
    const { data: user } = await supabase.auth.getUser();
    
    const pendingPayment = {
      user_id: user?.id,
      payment_id: paymentData.payment_id,
      plan_type: planType,
      payment_provider: 'nowpayments',
      amount_usd: paymentData.price_amount,
      amount_crypto: paymentData.pay_amount,
      currency: paymentData.pay_currency,
      payment_address: paymentData.pay_address,
      status: 'waiting',
      expires_at: new Date(Date.now() + (30 * 60 * 1000)), // 30 minutes
      created_at: new Date()
    };
    
    const { error } = await supabase
      .from('pending_crypto_payments')
      .insert(pendingPayment);
    
    if (error) {
      console.error('Failed to store pending payment:', error);
    }
  }
  
  showCryptoPaymentModal(paymentData, currency, planType) {
    const modal = document.createElement('div');
    modal.className = 'crypto-payment-modal';
    modal.innerHTML = `
      <div class="crypto-modal-content">
        <div class="crypto-header">
          <div class="crypto-logo">
            <img src="${currency.logo}" alt="${currency.name}" width="32" height="32">
            <h2>Pay with ${currency.name}</h2>
          </div>
          <button class="modal-close" onclick="this.closest('.crypto-payment-modal').remove()">&times;</button>
        </div>
        
        <div class="payment-summary">
          <div class="plan-info">
            <h3>Tesla Dashboard ${planType.charAt(0).toUpperCase() + planType.slice(1)}</h3>
            <p class="plan-price">$${paymentData.price_amount} USD</p>
          </div>
          
          <div class="conversion-rate">
            <p>Exchange Rate: 1 ${currency.symbol} = $${(paymentData.price_amount / paymentData.pay_amount).toFixed(2)} USD</p>
          </div>
        </div>
        
        <div class="crypto-payment-details">
          <div class="payment-amount">
            <label>Amount to Send:</label>
            <div class="amount-display">
              <span class="amount">${paymentData.pay_amount}</span>
              <span class="currency">${currency.symbol}</span>
              <button class="copy-amount" onclick="navigator.clipboard.writeText('${paymentData.pay_amount}')">📋</button>
            </div>
          </div>
          
          <div class="payment-address">
            <label>Send to Address:</label>
            <div class="address-container">
              <input type="text" value="${paymentData.pay_address}" readonly>
              <button class="copy-address" onclick="navigator.clipboard.writeText('${paymentData.pay_address}')">Copy Address</button>
            </div>
          </div>
          
          <div class="qr-code-section">
            <div class="qr-code">
              <canvas id="qr-canvas-${paymentData.payment_id}"></canvas>
            </div>
            <p class="qr-instruction">Scan QR code with your ${currency.name} wallet</p>
          </div>
          
          <div class="payment-timer">
            <div class="timer-display">
              <span class="timer-label">Time Remaining:</span>
              <span class="countdown" id="countdown-${paymentData.payment_id}">30:00</span>
            </div>
            <div class="timer-bar">
              <div class="timer-progress" id="progress-${paymentData.payment_id}"></div>
            </div>
          </div>
          
          <div class="payment-status">
            <div class="status-indicator waiting" id="status-indicator-${paymentData.payment_id}"></div>
            <span class="status-text" id="status-text-${paymentData.payment_id}">Waiting for payment...</span>
          </div>
          
          <div class="network-info">
            <p><strong>Network:</strong> ${currency.network}</p>
            <p><strong>Confirmations Required:</strong> ${this.getRequiredConfirmations(currency.symbol)}</p>
            <p><strong>Estimated Confirmation Time:</strong> ${this.getEstimatedConfirmationTime(currency.symbol)}</p>
          </div>
        </div>
        
        <div class="payment-actions">
          <button class="refresh-status" onclick="window.cryptoPayment.checkPaymentStatus('${paymentData.payment_id}')">
            🔄 Refresh Status
          </button>
          <button class="cancel-payment" onclick="window.cryptoPayment.cancelPayment('${paymentData.payment_id}')">
            Cancel Payment
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Generate QR code
    this.generateQRCode(paymentData, `qr-canvas-${paymentData.payment_id}`);
    
    // Start payment monitoring
    this.startPaymentPolling(paymentData.payment_id);
    this.startCountdown(paymentData.payment_id, 30 * 60); // 30 minutes
    
    // Store reference for status updates
    window.cryptoPayment = this;
  }
  
  generateQRCode(paymentData, canvasId) {
    // Create QR code for payment (using a QR library or API)
    const qrData = `${paymentData.pay_currency}:${paymentData.pay_address}?amount=${paymentData.pay_amount}`;
    
    // Using QR.js library (would need to be included)
    const canvas = document.getElementById(canvasId);
    if (canvas && window.QRCode) {
      const qr = new QRCode(canvas, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff'
      });
    } else {
      // Fallback to API-generated QR code
      const img = document.createElement('img');
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
      img.alt = 'Payment QR Code';
      canvas.parentNode.replaceChild(img, canvas);
    }
  }
  
  async startPaymentPolling(paymentId) {
    const pollInterval = setInterval(async () => {
      try {
        const status = await this.checkPaymentStatus(paymentId);
        this.updatePaymentStatus(paymentId, status);
        
        if (['finished', 'confirmed'].includes(status.payment_status)) {
          clearInterval(pollInterval);
          await this.handleSuccessfulCryptoPayment(paymentId, status);
        } else if (['failed', 'expired', 'refunded'].includes(status.payment_status)) {
          clearInterval(pollInterval);
          this.handleCryptoPaymentFailure(paymentId, status);
        }
        
      } catch (error) {
        console.error('Payment polling error:', error);
        // Continue polling despite errors
      }
    }, 10000); // Poll every 10 seconds
    
    // Store interval reference for cleanup
    this.paymentPollingIntervals = this.paymentPollingIntervals || new Map();
    this.paymentPollingIntervals.set(paymentId, pollInterval);
  }
  
  async checkPaymentStatus(paymentId) {
    const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
      headers: { 'x-api-key': this.apiKey }
    });
    
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }
    
    return await response.json();
  }
  
  updatePaymentStatus(paymentId, statusData) {
    const statusIndicator = document.getElementById(`status-indicator-${paymentId}`);
    const statusText = document.getElementById(`status-text-${paymentId}`);
    
    if (statusIndicator && statusText) {
      statusIndicator.className = `status-indicator ${statusData.payment_status}`;
      
      const statusMessages = {
        'waiting': 'Waiting for payment...',
        'confirming': 'Payment detected, confirming...',
        'confirmed': 'Payment confirmed!',
        'sending': 'Processing payment...',
        'partially_paid': 'Partial payment received',
        'finished': 'Payment completed successfully!',
        'failed': 'Payment failed',
        'refunded': 'Payment refunded',
        'expired': 'Payment expired'
      };
      
      statusText.textContent = statusMessages[statusData.payment_status] || statusData.payment_status;
      
      // Show additional info for certain statuses
      if (statusData.payment_status === 'confirming') {
        statusText.textContent += ` (${statusData.confirmations || 0}/${this.getRequiredConfirmations(statusData.pay_currency)} confirmations)`;
      }
    }
  }
  
  startCountdown(paymentId, seconds) {
    const countdownElement = document.getElementById(`countdown-${paymentId}`);
    const progressElement = document.getElementById(`progress-${paymentId}`);
    const totalSeconds = seconds;
    
    const timer = setInterval(() => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      
      if (countdownElement) {
        countdownElement.textContent = 
          `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
      
      if (progressElement) {
        const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
        progressElement.style.width = `${progress}%`;
      }
      
      if (seconds <= 0) {
        clearInterval(timer);
        this.handleCryptoTimeout(paymentId);
      }
      
      seconds--;
    }, 1000);
    
    // Store timer reference for cleanup
    this.paymentTimers = this.paymentTimers || new Map();
    this.paymentTimers.set(paymentId, timer);
  }
  
  async handleSuccessfulCryptoPayment(paymentId, statusData) {
    try {
      // Verify payment with backend
      const verificationResponse = await fetch('/api/payments/crypto/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          paymentId,
          statusData,
          timestamp: Date.now()
        })
      });
      
      if (!verificationResponse.ok) {
        throw new Error('Payment verification failed');
      }
      
      const verificationResult = await verificationResponse.json();
      
      if (verificationResult.success) {
        // Update subscription
        await this.activateSubscription(verificationResult.planType, verificationResult.subscriptionData);
        
        // Show success message
        this.showCryptoPaymentSuccess(verificationResult.planType);
        
        // Clean up
        this.cleanupPaymentModal(paymentId);
        
        // Redirect to success page
        setTimeout(() => {
          window.location.href = `/payment/success?plan=${verificationResult.planType}&provider=crypto`;
        }, 3000);
      }
      
    } catch (error) {
      console.error('Crypto payment verification error:', error);
      this.handleCryptoError(error, 'unknown');
    }
  }
  
  getRequiredConfirmations(currency) {
    const confirmations = {
      'btc': 2,
      'eth': 12,
      'doge': 6,
      'ltc': 6,
      'bch': 6,
      'usdt': 12,
      'usdc': 12
    };
    
    return confirmations[currency.toLowerCase()] || 6;
  }
  
  getEstimatedConfirmationTime(currency) {
    const times = {
      'btc': '10-20 minutes',
      'eth': '2-5 minutes',
      'doge': '6-12 minutes',
      'ltc': '2-5 minutes',
      'bch': '10-20 minutes',
      'usdt': '2-5 minutes',
      'usdc': '2-5 minutes'
    };
    
    return times[currency.toLowerCase()] || '5-15 minutes';
  }
}
```

#### Subscription Management System

```javascript
class SubscriptionManager {
  constructor() {
    this.currentSubscription = null;
    this.billingHistory = [];
    this.usageMetrics = new Map();
    this.featureFlags = new Map();
    this.loadUserSubscription();
    this.setupUsageTracking();
  }
  
  async loadUserSubscription() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        this.setFreeUserDefaults();
        return;
      }
      
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_features (*),
          billing_history (*)
        `)
        .eq('user_id', user.user.id)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found is OK
        console.error('Error loading subscription:', error);
        this.setFreeUserDefaults();
        return;
      }
      
      this.currentSubscription = subscription || null;
      this.updateFeatureAccess();
      this.loadBillingHistory(user.user.id);
      this.trackSubscriptionMetrics();
      
    } catch (error) {
      console.error('Subscription loading error:', error);
      this.setFreeUserDefaults();
    }
  }
  
  setFreeUserDefaults() {
    this.currentSubscription = {
      plan_type: 'free',
      status: 'active',
      features: {
        vehicles: 1,
        aiQueries: 10,
        automationTriggers: 0,
        cloudStorage: '100MB',
        support: 'community'
      }
    };
    this.updateFeatureAccess();
  }
  
  updateFeatureAccess() {
    const subscription = this.currentSubscription;
    if (!subscription) return;
    
    // Define feature access by plan
    const featureMatrix = {
      free: {
        teslaControl: 'basic',
        aiAssistant: 'limited', // 10 queries per day
        automation: 'disabled',
        analytics: 'basic',
        sharing: 'disabled',
        multiVehicle: 'disabled',
        homeAssistant: 'disabled',
        cryptoPayments: 'disabled',
        customWallpapers: 'disabled',
        exportData: 'disabled',
        prioritySupport: 'disabled'
      },
      
      starter: {
        teslaControl: 'full',
        aiAssistant: 'unlimited',
        automation: 'basic', // 5 triggers
        analytics: 'standard',
        sharing: 'basic',
        multiVehicle: 'single',
        homeAssistant: 'disabled',
        cryptoPayments: 'enabled',
        customWallpapers: 'basic',
        exportData: 'basic',
        prioritySupport: 'email'
      },
      
      pro: {
        teslaControl: 'advanced',
        aiAssistant: 'unlimited',
        automation: 'unlimited',
        analytics: 'advanced',
        sharing: 'unlimited',
        multiVehicle: 'limited', // up to 3
        homeAssistant: 'enabled',
        cryptoPayments: 'enabled',
        customWallpapers: 'unlimited',
        exportData: 'full',
        prioritySupport: 'priority'
      },
      
      fleet: {
        teslaControl: 'enterprise',
        aiAssistant: 'unlimited',
        automation: 'enterprise',
        analytics: 'enterprise',
        sharing: 'enterprise',
        multiVehicle: 'unlimited',
        homeAssistant: 'enterprise',
        cryptoPayments: 'enabled',
        customWallpapers: 'unlimited',
        exportData: 'enterprise',
        prioritySupport: 'dedicated'
      }
    };
    
    const features = featureMatrix[subscription.plan_type] || featureMatrix.free;
    
    // Update DOM classes for feature gating
    Object.entries(features).forEach(([feature, access]) => {
      document.body.classList.remove(`${feature}-basic`, `${feature}-limited`, `${feature}-full`, `${feature}-advanced`, `${feature}-enterprise`, `${feature}-enabled`, `${feature}-disabled`);
      document.body.classList.add(`${feature}-${access}`);
    });
    
    // Update feature flags
    this.featureFlags.clear();
    Object.entries(features).forEach(([feature, access]) => {
      this.featureFlags.set(feature, access);
    });
    
    // Update UI elements
    this.updateSubscriptionUI();
  }
  
  updateSubscriptionUI() {
    const subscription = this.currentSubscription;
    
    // Update plan display
    const planDisplay = document.querySelector('.current-plan-display');
    if (planDisplay) {
      planDisplay.innerHTML = `
        <div class="plan-info">
          <h3>${subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} Plan</h3>
          <p class="plan-status status-${subscription.status}">${subscription.status}</p>
          ${subscription.plan_type !== 'free' ? `
            <p class="billing-cycle">
              ${subscription.current_period_end ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}` : ''}
            </p>
          ` : ''}
        </div>
        <div class="plan-actions">
          ${subscription.plan_type === 'free' ? `
            <button class="upgrade-button" onclick="window.location.href='/upgrade'">Upgrade Plan</button>
          ` : `
            <button class="manage-button" onclick="this.manageSubscription()">Manage Subscription</button>
          `}
        </div>
      `;
    }
    
    // Update feature availability indicators
    const featureElements = document.querySelectorAll('[data-feature]');
    featureElements.forEach(element => {
      const feature = element.dataset.feature;
      const access = this.featureFlags.get(feature);
      
      element.classList.remove('feature-available', 'feature-limited', 'feature-disabled');
      
      if (access === 'disabled') {
        element.classList.add('feature-disabled');
        element.setAttribute('title', 'This feature requires a paid plan');
      } else if (access === 'limited') {
        element.classList.add('feature-limited');
        element.setAttribute('title', 'This feature has usage limits');
      } else {
        element.classList.add('feature-available');
        element.removeAttribute('title');
      }
    });
    
    // Update usage counters
    this.updateUsageCounters();
  }
  
  updateUsageCounters() {
    const subscription = this.currentSubscription;
    if (!subscription) return;
    
    // AI queries counter
    if (subscription.plan_type === 'free') {
      const aiUsage = this.getUsageMetric('aiQueries', 'daily');
      const aiCounter = document.querySelector('.ai-usage-counter');
      if (aiCounter) {
        aiCounter.innerHTML = `
          <span class="usage-count">${aiUsage}/10</span>
          <span class="usage-label">AI queries today</span>
          <div class="usage-bar">
            <div class="usage-progress" style="width: ${(aiUsage/10)*100}%"></div>
          </div>
        `;
      }
    }
    
    // Automation triggers counter
    if (subscription.plan_type === 'starter') {
      const automationUsage = this.getUsageMetric('automationTriggers', 'total');
      const automationCounter = document.querySelector('.automation-usage-counter');
      if (automationCounter) {
        automationCounter.innerHTML = `
          <span class="usage-count">${automationUsage}/5</span>
          <span class="usage-label">Automation triggers</span>
          <div class="usage-bar">
            <div class="usage-progress" style="width: ${(automationUsage/5)*100}%"></div>
          </div>
        `;
      }
    }
    
    // Vehicle count
    const vehicleUsage = this.getUsageMetric('vehicles', 'total');
    const vehicleCounter = document.querySelector('.vehicle-usage-counter');
    if (vehicleCounter && subscription.plan_type !== 'fleet') {
      const maxVehicles = {
        'free': 1,
        'starter': 1,
        'pro': 3
      }[subscription.plan_type] || 1;
      
      vehicleCounter.innerHTML = `
        <span class="usage-count">${vehicleUsage}/${maxVehicles}</span>
        <span class="usage-label">Tesla vehicles</span>
        <div class="usage-bar">
          <div class="usage-progress" style="width: ${(vehicleUsage/maxVehicles)*100}%"></div>
        </div>
      `;
    }
  }
  
  checkFeatureAccess(feature, action = 'use') {
    const access = this.featureFlags.get(feature);
    
    if (access === 'disabled') {
      this.showUpgradePrompt(feature);
      return false;
    }
    
    if (access === 'limited') {
      return this.checkUsageLimit(feature, action);
    }
    
    return true;
  }
  
  checkUsageLimit(feature, action) {
    const subscription = this.currentSubscription;
    
    switch (feature) {
      case 'aiAssistant':
        if (subscription.plan_type === 'free') {
          const dailyUsage = this.getUsageMetric('aiQueries', 'daily');
          if (dailyUsage >= 10) {
            this.showUsageLimitPrompt('AI queries', '10 per day');
            return false;
          }
          this.incrementUsageMetric('aiQueries', 'daily');
        }
        break;
        
      case 'automation':
        if (subscription.plan_type === 'starter') {
          const totalTriggers = this.getUsageMetric('automationTriggers', 'total');
          if (totalTriggers >= 5) {
            this.showUsageLimitPrompt('Automation triggers', '5 total');
            return false;
          }
          if (action === 'create') {
            this.incrementUsageMetric('automationTriggers', 'total');
          }
        }
        break;
        
      case 'multiVehicle':
        const vehicleCount = this.getUsageMetric('vehicles', 'total');
        const maxVehicles = {
          'free': 1,
          'starter': 1,
          'pro': 3
        }[subscription.plan_type] || 1;
        
        if (vehicleCount >= maxVehicles) {
          this.showUsageLimitPrompt('Tesla vehicles', `${maxVehicles} maximum`);
          return false;
        }
        break;
    }
    
    return true;
  }
  
  showUpgradePrompt(feature) {
    const modal = document.createElement('div');
    modal.className = 'upgrade-prompt-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="upgrade-icon">🚀</div>
        <h2>Upgrade Required</h2>
        <p>This feature requires a paid plan.</p>
        <div class="feature-info">
          <h3>What you'll get:</h3>
          <ul>
            <li>Unlimited AI assistant queries</li>
            <li>Advanced Tesla automation</li>
            <li>Multi-vehicle support</li>
            <li>Priority customer support</li>
            <li>And much more!</li>
          </ul>
        </div>
        <div class="upgrade-actions">
          <button class="upgrade-now-button" onclick="window.location.href='/upgrade'">
            Upgrade Now
          </button>
          <button class="maybe-later-button" onclick="this.closest('.upgrade-prompt-modal').remove()">
            Maybe Later
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  showUsageLimitPrompt(featureName, limit) {
    const modal = document.createElement('div');
    modal.className = 'usage-limit-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="limit-icon">⚠️</div>
        <h2>Usage Limit Reached</h2>
        <p>You've reached your limit for ${featureName} (${limit}).</p>
        <div class="limit-options">
          <button class="upgrade-button" onclick="window.location.href='/upgrade'">
            Upgrade for Unlimited Access
          </button>
          <button class="wait-button" onclick="this.closest('.usage-limit-modal').remove()">
            Wait for Reset
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  getUsageMetric(metric, period) {
    const key = `${metric}_${period}`;
    const usage = this.usageMetrics.get(key);
    
    if (!usage) return 0;
    
    // Check if usage data is still valid based on period
    const now = Date.now();
    switch (period) {
      case 'daily':
        const dayStart = new Date().setHours(0, 0, 0, 0);
        return usage.timestamp >= dayStart ? usage.count : 0;
        
      case 'monthly':
        const monthStart = new Date().setDate(1);
        return usage.timestamp >= monthStart ? usage.count : 0;
        
      case 'total':
        return usage.count;
        
      default:
        return usage.count;
    }
  }
  
  incrementUsageMetric(metric, period) {
    const key = `${metric}_${period}`;
    const current = this.getUsageMetric(metric, period);
    
    this.usageMetrics.set(key, {
      count: current + 1,
      timestamp: Date.now()
    });
    
    // Persist to localStorage
    localStorage.setItem('usageMetrics', JSON.stringify(Array.from(this.usageMetrics.entries())));
    
    // Update UI
    this.updateUsageCounters();
  }
}
```

---

## 🔐 


## 📂 Project Management Docs (The "How")

### 🗺️ A_
---

### 🔄 B_

---

### 🤝 C_
---

---

### ✨ E_