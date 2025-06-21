import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Bell, Settings, DollarSign, Zap } from 'lucide-react';
import './CryptoTrackerApp.css';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  featured: boolean;
  tesla?: boolean;
  currentPrice: number | null;
  priceChange24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  lastUpdated: number | null;
}

interface Holding {
  id: string;
  coinId: string;
  amount: number;
  averagePrice: number;
  totalInvested: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
  notes: string;
  dateAdded: number;
}

interface PriceAlert {
  id: string;
  coinId: string;
  targetPrice: number;
  direction: 'above' | 'below';
  enabled: boolean;
  created: number;
  triggered: boolean;
}

interface MarketData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  lastUpdated: number;
}

const CryptoTrackerApp: React.FC = () => {
  const [coins, setCoins] = useState<Map<string, Coin>>(new Map());
  const [portfolio, setPortfolio] = useState<Map<string, Holding>>(new Map());
  const [priceAlerts, setPriceAlerts] = useState<Map<string, PriceAlert>>(new Map());
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0
  });
  const [activeTab, setActiveTab] = useState<'prices' | 'portfolio' | 'alerts'>('prices');
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [showTeslaPayment, setShowTeslaPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initializeSupportedCoins = () => {
    const featuredCoins = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', featured: true },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', featured: true },
      { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', featured: true, tesla: true },
      { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', featured: true },
      { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash', featured: true },
      { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', featured: true },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', featured: true },
      { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', featured: true },
      { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', featured: true },
      { id: 'solana', symbol: 'SOL', name: 'Solana', featured: true }
    ];

    const coinMap = new Map<string, Coin>();
    featuredCoins.forEach(coin => {
      coinMap.set(coin.id, {
        ...coin,
        currentPrice: null,
        priceChange24h: null,
        marketCap: null,
        volume24h: null,
        lastUpdated: null
      });
    });

    setCoins(coinMap);
    return coinMap;
  };

  const fetchCoinPrices = async (coinMap: Map<string, Coin>) => {
    try {
      const ids = Array.from(coinMap.keys()).join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      const updatedCoins = new Map(coinMap);
      Object.entries(data).forEach(([coinId, priceData]: [string, any]) => {
        if (updatedCoins.has(coinId)) {
          const coin = updatedCoins.get(coinId)!;
          coin.currentPrice = priceData.usd;
          coin.priceChange24h = priceData.usd_24h_change;
          coin.marketCap = priceData.usd_market_cap;
          coin.volume24h = priceData.usd_24h_vol;
          coin.lastUpdated = Date.now();
          updatedCoins.set(coinId, coin);
        }
      });
      
      setCoins(updatedCoins);
      updatePortfolioValues(updatedCoins);
      
    } catch (error) {
      console.error('Failed to fetch coin prices:', error);
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/global');
      const data = await response.json();
      
      setMarketData({
        totalMarketCap: data.data.total_market_cap.usd,
        totalVolume: data.data.total_volume.usd,
        btcDominance: data.data.market_cap_percentage.bitcoin,
        ethDominance: data.data.market_cap_percentage.ethereum,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    }
  };

  const updatePortfolioValues = (coinMap: Map<string, Coin>) => {
    let totalValue = 0;
    let totalInvested = 0;
    
    const updatedPortfolio = new Map(portfolio);
    updatedPortfolio.forEach(holding => {
      const coin = coinMap.get(holding.coinId);
      if (coin && coin.currentPrice) {
        holding.currentValue = holding.amount * coin.currentPrice;
        holding.profitLoss = holding.currentValue - holding.totalInvested;
        holding.profitLossPercent = (holding.profitLoss / holding.totalInvested) * 100;
        
        totalValue += holding.currentValue;
        totalInvested += holding.totalInvested;
      }
    });
    
    setPortfolio(updatedPortfolio);
    setPortfolioSummary({
      totalValue,
      totalInvested,
      totalProfitLoss: totalValue - totalInvested,
      totalProfitLossPercent: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
    });
  };

  const addToPortfolio = (coinId: string, amount: number, averagePrice: number, notes: string = '') => {
    const coin = coins.get(coinId);
    if (!coin) return;

    const holding: Holding = {
      id: `holding_${Date.now()}`,
      coinId,
      amount,
      averagePrice,
      totalInvested: amount * averagePrice,
      notes,
      dateAdded: Date.now()
    };

    const updatedPortfolio = new Map(portfolio);
    updatedPortfolio.set(holding.id, holding);
    setPortfolio(updatedPortfolio);
    updatePortfolioValues(coins);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '--';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number | null) => {
    if (marketCap === null) return '--';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const getCoinIcon = (symbol: string) => {
    const colors = {
      'BTC': '#f7931a',
      'ETH': '#627eea',
      'DOGE': '#c2a633',
      'LTC': '#bfbbbb',
      'BCH': '#8dc351',
      'LINK': '#375bd2',
      'ADA': '#0033ad',
      'DOT': '#e6007a',
      'BNB': '#f3ba2f',
      'SOL': '#9945ff'
    };
    return colors[symbol as keyof typeof colors] || '#f39c12';
  };

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      const coinMap = initializeSupportedCoins();
      await Promise.all([
        fetchCoinPrices(coinMap),
        fetchMarketData()
      ]);
      setIsLoading(false);
    };

    initializeApp();

    // Update prices every 30 seconds
    const interval = setInterval(() => {
      fetchCoinPrices(coins);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="crypto-tracker-app">
        <div className="crypto-header">
          <h1 className="crypto-title">💰 Crypto Tracker Pro</h1>
          <div className="market-summary">Loading market data...</div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-xl font-semibold mb-2">Loading Crypto Data</div>
            <div className="text-gray-500">Fetching real-time prices...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-tracker-app">
      {/* Header */}
      <div className="crypto-header">
        <h1 className="crypto-title">💰 Crypto Tracker Pro</h1>
        <div className="market-summary">
          {marketData && (
            <>
              <div className="market-stat">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">{formatMarketCap(marketData.totalMarketCap)}</span>
              </div>
              <div className="market-stat">
                <span className="stat-label">24h Volume</span>
                <span className="stat-value">{formatMarketCap(marketData.totalVolume)}</span>
              </div>
              <div className="market-stat">
                <span className="stat-label">BTC Dominance</span>
                <span className="stat-value">{marketData.btcDominance.toFixed(1)}%</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="crypto-content">
        {/* Sidebar */}
        <div className="crypto-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Portfolio Summary</h3>
            <div className="portfolio-summary">
              <div className="portfolio-value">
                {formatPrice(portfolioSummary.totalValue)}
              </div>
              <div className={`portfolio-change ${portfolioSummary.totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                <span className="change-arrow">
                  {portfolioSummary.totalProfitLoss >= 0 ? '↗' : '↘'}
                </span>
                {formatPrice(Math.abs(portfolioSummary.totalProfitLoss))} 
                ({Math.abs(portfolioSummary.totalProfitLossPercent).toFixed(2)}%)
              </div>
            </div>

            <div className="quick-actions">
              <button 
                className="action-btn"
                onClick={() => setShowAddHolding(true)}
              >
                <Plus size={16} />
                Add Holding
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => setShowTeslaPayment(true)}
              >
                <Zap size={16} />
                Tesla Payment
              </button>
              <button className="action-btn secondary">
                <Bell size={16} />
                Price Alerts
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="crypto-main">
          {/* Tabs */}
          <div className="main-tabs">
            <button 
              className={`tab-btn ${activeTab === 'prices' ? 'active' : ''}`}
              onClick={() => setActiveTab('prices')}
            >
              Prices
            </button>
            <button 
              className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio
            </button>
            <button 
              className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              Alerts
            </button>
          </div>

          {/* Prices Tab */}
          {activeTab === 'prices' && (
            <div className="prices-grid">
              {Array.from(coins.values()).map(coin => (
                <div 
                  key={coin.id} 
                  className={`coin-card ${coin.tesla ? 'tesla-coin' : ''}`}
                >
                  <div className="coin-header">
                    <div 
                      className="coin-icon"
                      style={{ background: getCoinIcon(coin.symbol) }}
                    >
                      {coin.symbol.substring(0, 3)}
                    </div>
                    <div className="coin-info">
                      <div className="coin-name">{coin.name}</div>
                      <div className="coin-symbol">{coin.symbol}</div>
                    </div>
                  </div>

                  <div className="coin-price">
                    {formatPrice(coin.currentPrice)}
                  </div>

                  <div className={`coin-change ${(coin.priceChange24h || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {(coin.priceChange24h || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(coin.priceChange24h || 0).toFixed(2)}%
                  </div>

                  <div className="coin-stats">
                    <div className="coin-stat">
                      <div className="stat-value">{formatMarketCap(coin.marketCap)}</div>
                      <div className="stat-label">Market Cap</div>
                    </div>
                    <div className="coin-stat">
                      <div className="stat-value">{formatMarketCap(coin.volume24h)}</div>
                      <div className="stat-label">24h Volume</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="portfolio-holdings">
              <div className="holdings-header">
                <h3>Your Holdings</h3>
                <button 
                  className="action-btn"
                  onClick={() => setShowAddHolding(true)}
                >
                  <Plus size={16} />
                  Add Holding
                </button>
              </div>

              {portfolio.size === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-xl font-semibold mb-2">No Holdings Yet</div>
                  <div className="text-gray-500 mb-4">Add your first cryptocurrency holding to track your portfolio</div>
                  <button 
                    className="action-btn"
                    onClick={() => setShowAddHolding(true)}
                  >
                    Add Your First Holding
                  </button>
                </div>
              ) : (
                <table className="holdings-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Holdings</th>
                      <th>Avg Cost</th>
                      <th>Current Value</th>
                      <th>Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(portfolio.values()).map(holding => {
                      const coin = coins.get(holding.coinId);
                      if (!coin) return null;

                      return (
                        <tr key={holding.id}>
                          <td>
                            <div className="holding-coin">
                              <div 
                                className="holding-icon"
                                style={{ background: getCoinIcon(coin.symbol) }}
                              >
                                {coin.symbol.substring(0, 3)}
                              </div>
                              <div className="holding-info">
                                <div className="holding-name">{coin.name}</div>
                                <div className="holding-amount">{holding.amount.toFixed(4)} {coin.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="holding-value">
                            {formatPrice(holding.totalInvested)}
                          </td>
                          <td className="holding-value">
                            {formatPrice(holding.averagePrice)}
                          </td>
                          <td className="holding-value">
                            {formatPrice(holding.currentValue || 0)}
                          </td>
                          <td className={`holding-change ${(holding.profitLoss || 0) >= 0 ? 'positive' : 'negative'}`}>
                            {formatPrice(Math.abs(holding.profitLoss || 0))}
                            <br />
                            <small>({Math.abs(holding.profitLossPercent || 0).toFixed(2)}%)</small>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="portfolio-holdings">
              <div className="holdings-header">
                <h3>Price Alerts</h3>
                <button className="action-btn">
                  <Plus size={16} />
                  Add Alert
                </button>
              </div>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔔</div>
                <div className="text-xl font-semibold mb-2">Price Alerts Coming Soon</div>
                <div className="text-gray-500">Set up notifications when your favorite cryptos hit target prices</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddHolding && (
        <AddHoldingModal 
          coins={coins}
          onAdd={addToPortfolio}
          onClose={() => setShowAddHolding(false)}
        />
      )}

      {/* Tesla Payment Modal */}
      {showTeslaPayment && (
        <TeslaPaymentModal 
          onClose={() => setShowTeslaPayment(false)}
        />
      )}
    </div>
  );
};

// Add Holding Modal Component
const AddHoldingModal: React.FC<{
  coins: Map<string, Coin>;
  onAdd: (coinId: string, amount: number, averagePrice: number, notes: string) => void;
  onClose: () => void;
}> = ({ coins, onAdd, onClose }) => {
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCoin && amount && averagePrice) {
      onAdd(selectedCoin, parseFloat(amount), parseFloat(averagePrice), notes);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4">Add Portfolio Holding</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Cryptocurrency</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              required
            >
              <option value="">Select a cryptocurrency...</option>
              {Array.from(coins.values()).map(coin => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input 
              type="number"
              step="any"
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Average Purchase Price (USD)</label>
            <input 
              type="number"
              step="any"
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="0.00"
              value={averagePrice}
              onChange={(e) => setAveragePrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Purchase notes, exchange used, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Add Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Tesla Payment Modal Component
const TeslaPaymentModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [paymentStep, setPaymentStep] = useState<'select' | 'payment'>('select');
  const [paymentData, setPaymentData] = useState<any>(null);

  const plans = {
    starter: { name: 'Starter', price: 9.99, features: ['Basic Tesla Control', 'Core Apps', 'Single Vehicle'] },
    pro: { name: 'Pro', price: 24.99, features: ['Advanced Automation', 'All Apps', '3 Vehicles'] },
    fleet: { name: 'Fleet', price: 99.99, features: ['Unlimited Vehicles', 'Fleet Management', 'Custom Features'] }
  };

  const initiateCryptoPayment = async () => {
    // Simulate crypto payment generation
    const cryptoAmount = (plans[selectedPlan as keyof typeof plans].price / 0.08).toFixed(6); // Mock DOGE price
    
    setPaymentData({
      plan: selectedPlan,
      usdAmount: plans[selectedPlan as keyof typeof plans].price,
      cryptoAmount,
      address: 'DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=dogecoin:DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L?amount=${cryptoAmount}`,
      expiresAt: Date.now() + (15 * 60 * 1000)
    });
    
    setPaymentStep('payment');
  };

  return (
    <div className="tesla-payment-modal">
      <div className="payment-content">
        {paymentStep === 'select' && (
          <>
            <div className="payment-header">
              <div className="tesla-logo">TESLA</div>
              <h3>Pay with Dogecoin</h3>
              <p>Tesla accepts DOGE for premium dashboard features</p>
            </div>

            <div className="space-y-4 mb-6">
              {Object.entries(plans).map(([key, plan]) => (
                <div 
                  key={key}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlan === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{plan.name}</div>
                      <div className="text-sm text-gray-500">{plan.features.join(', ')}</div>
                    </div>
                    <div className="text-xl font-bold">${plan.price}/mo</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="energy-comparison">
              <div className="comparison-title">
                <Zap className="text-yellow-500" size={20} />
                Energy Efficiency
              </div>
              <div className="comparison-text">
                DOGE uses significantly less energy than Bitcoin - perfect for eco-conscious Tesla owners. 
                One DOGE transaction uses the same energy as driving a Tesla just 0.1 miles!
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 px-4 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600"
                onClick={initiateCryptoPayment}
              >
                Pay with DOGE
              </button>
            </div>
          </>
        )}

        {paymentStep === 'payment' && paymentData && (
          <>
            <div className="payment-header">
              <div className="tesla-logo">TESLA</div>
              <h3>Complete Payment</h3>
            </div>

            <div className="payment-details">
              <div className="payment-amount">{paymentData.cryptoAmount} DOGE</div>
              <div className="payment-conversion">≈ ${paymentData.usdAmount} USD</div>
            </div>

            <div className="qr-code">
              <img src={paymentData.qrCode} alt="Payment QR Code" />
            </div>

            <div className="payment-address">
              {paymentData.address}
            </div>

            <div className="payment-timer">
              <span>⏰</span>
              <span>Payment expires in 15:00</span>
            </div>

            <div className="payment-status pending">
              Waiting for payment confirmation...
            </div>

            <div className="energy-comparison">
              <div className="comparison-title">
                <span>🌱</span>
                Eco-Friendly Choice
              </div>
              <div className="comparison-text">
                By using DOGE instead of Bitcoin, you're saving approximately 740 kWh of energy - 
                enough to drive your Tesla 2,960 miles!
              </div>
            </div>

            <button 
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium mt-4"
              onClick={onClose}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CryptoTrackerApp;
