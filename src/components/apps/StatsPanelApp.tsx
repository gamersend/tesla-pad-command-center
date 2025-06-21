
import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Users, Zap, TrendingUp, Award } from 'lucide-react';

interface AppUsage {
  appId: string;
  appName: string;
  sessions: number;
  totalTime: number;
  averageSessionTime: number;
  category: string;
}

interface UsagePattern {
  mostUsedApps: AppUsage[];
  peakUsageTimes: {
    peakHour: { hour: number; timeRange: string; usage: number };
    peakDay: { day: number; dayName: string; usage: number };
  };
  averageSessionLength: number;
  totalSessions: number;
}

class TeslaDashboardAnalytics {
  private events: any[] = [];
  private sessionStart = Date.now();

  trackEvent(category: string, action: string, label?: string, value?: number) {
    const event = {
      timestamp: Date.now(),
      category,
      action,
      label,
      value,
      sessionDuration: Date.now() - this.sessionStart
    };
    
    this.events.push(event);
    
    // Store in localStorage
    const stored = JSON.parse(localStorage.getItem('tesla_analytics') || '[]');
    stored.push(event);
    localStorage.setItem('tesla_analytics', JSON.stringify(stored.slice(-1000))); // Keep last 1000 events
  }

  getStoredEvents(): any[] {
    return JSON.parse(localStorage.getItem('tesla_analytics') || '[]');
  }

  analyzeUsagePatterns(): UsagePattern {
    const events = this.getStoredEvents();
    const appUsage = new Map<string, { sessions: number; totalTime: number }>();
    
    // Analyze app usage
    events
      .filter(e => e.category === 'app_usage' && e.action === 'open')
      .forEach(event => {
        const appId = event.label || 'unknown';
        const current = appUsage.get(appId) || { sessions: 0, totalTime: 0 };
        appUsage.set(appId, {
          sessions: current.sessions + 1,
          totalTime: current.totalTime + (event.value || 0)
        });
      });

    const mostUsedApps = Array.from(appUsage.entries())
      .map(([appId, data]) => ({
        appId,
        appName: this.getAppName(appId),
        sessions: data.sessions,
        totalTime: data.totalTime,
        averageSessionTime: data.totalTime / data.sessions || 0,
        category: this.getAppCategory(appId)
      }))
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10);

    // Analyze peak usage times
    const hourlyUsage = new Array(24).fill(0);
    const dailyUsage = new Array(7).fill(0);

    events.forEach(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      
      hourlyUsage[hour] += 1;
      dailyUsage[day] += 1;
    });

    const peakHour = hourlyUsage.indexOf(Math.max(...hourlyUsage));
    const peakDay = dailyUsage.indexOf(Math.max(...dailyUsage));

    return {
      mostUsedApps,
      peakUsageTimes: {
        peakHour: {
          hour: peakHour,
          timeRange: `${peakHour}:00 - ${peakHour + 1}:00`,
          usage: hourlyUsage[peakHour]
        },
        peakDay: {
          day: peakDay,
          dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][peakDay],
          usage: dailyUsage[peakDay]
        }
      },
      averageSessionLength: events.length > 0 ? events.reduce((sum, e) => sum + (e.sessionDuration || 0), 0) / events.length : 0,
      totalSessions: events.filter(e => e.category === 'session' && e.action === 'start').length
    };
  }

  private getAppName(appId: string): string {
    const appNames: Record<string, string> = {
      'tesla-control': 'Tesla Control',
      'weather': 'Weather',
      'music': 'Music',
      'maps': 'Maps',
      'calendar': 'Calendar',
      'search': 'Search Hub',
      'color-picker': 'Color Picker',
      'dice': 'Dice Roller',
      'quotes': 'Quote Generator'
    };
    return appNames[appId] || appId;
  }

  private getAppCategory(appId: string): string {
    const categories: Record<string, string> = {
      'tesla-control': 'Tesla',
      'tesla-status': 'Tesla',
      'charging': 'Tesla',
      'climate': 'Tesla',
      'weather': 'Productivity',
      'music': 'Entertainment',
      'maps': 'Navigation',
      'calendar': 'Productivity',
      'search': 'Utility',
      'color-picker': 'Utility',
      'dice': 'Entertainment',
      'quotes': 'Entertainment'
    };
    return categories[appId] || 'Other';
  }
}

const StatsPanelApp: React.FC = () => {
  const [analytics] = useState(new TeslaDashboardAnalytics());
  const [patterns, setPatterns] = useState<UsagePattern | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track that stats panel was opened
    analytics.trackEvent('app_usage', 'open', 'stats-panel');
    
    // Load analytics data
    setTimeout(() => {
      const usagePatterns = analytics.analyzeUsagePatterns();
      setPatterns(usagePatterns);
      setLoading(false);
    }, 500);
  }, [analytics]);

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (loading || !patterns) {
    return (
      <div className="stats-panel-app">
        <div className="stats-header">
          <div className="stats-title">Dashboard Analytics</div>
          <div className="stats-subtitle">Loading usage statistics...</div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-panel-app">
      <div className="stats-header">
        <div className="stats-title">Dashboard Analytics</div>
        <div className="stats-subtitle">Track your Tesla dashboard usage patterns</div>
      </div>

      <div className="stats-grid">
        {/* Total Sessions */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-title">Total Sessions</div>
            <Users className="stat-card-icon" />
          </div>
          <div className="stat-metric">
            <div className="metric-value">{formatNumber(patterns.totalSessions)}</div>
            <div className="metric-change positive">+12%</div>
          </div>
        </div>

        {/* Average Session Length */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-title">Avg Session</div>
            <Clock className="stat-card-icon" />
          </div>
          <div className="stat-metric">
            <div className="metric-value">{formatDuration(patterns.averageSessionLength)}</div>
            <div className="metric-change positive">+5%</div>
          </div>
        </div>

        {/* Peak Usage Hour */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-title">Peak Hour</div>
            <TrendingUp className="stat-card-icon" />
          </div>
          <div className="stat-metric">
            <div className="metric-value">{patterns.peakUsageTimes.peakHour.timeRange}</div>
            <div className="metric-unit">{patterns.peakUsageTimes.peakHour.usage} events</div>
          </div>
        </div>

        {/* Peak Usage Day */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-title">Peak Day</div>
            <Award className="stat-card-icon" />
          </div>
          <div className="stat-metric">
            <div className="metric-value">{patterns.peakUsageTimes.peakDay.dayName}</div>
            <div className="metric-unit">{patterns.peakUsageTimes.peakDay.usage} events</div>
          </div>
        </div>

        {/* Most Used Apps */}
        <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
          <div className="stat-card-header">
            <div className="stat-card-title">Most Used Apps</div>
            <BarChart3 className="stat-card-icon" />
          </div>
          <div className="app-usage-list">
            {patterns.mostUsedApps.slice(0, 8).map((app, index) => (
              <div key={app.appId} className="app-usage-item">
                <div className="app-icon-small" style={{ 
                  background: `linear-gradient(135deg, hsl(${index * 45}, 70%, 60%), hsl(${index * 45 + 30}, 70%, 50%))` 
                }}>
                  {app.appName.charAt(0)}
                </div>
                <div className="app-usage-info">
                  <div className="app-name">{app.appName}</div>
                  <div className="app-usage-stats">
                    {app.sessions} sessions • {formatDuration(app.totalTime)} total
                  </div>
                </div>
                <div className="usage-bar">
                  <div 
                    className="usage-fill" 
                    style={{ 
                      width: `${(app.sessions / Math.max(...patterns.mostUsedApps.map(a => a.sessions))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-section">
          <div className="stat-card-header">
            <div className="stat-card-title">Recommendations</div>
            <Zap className="stat-card-icon" />
          </div>
          
          <div className="recommendation-item">
            <div className="recommendation-icon organization">📱</div>
            <div className="recommendation-content">
              <div className="recommendation-title">Optimize App Layout</div>
              <div className="recommendation-description">
                Consider moving less frequently used apps to folders to improve navigation efficiency.
              </div>
            </div>
          </div>

          <div className="recommendation-item">
            <div className="recommendation-icon efficiency">⚡</div>
            <div className="recommendation-content">
              <div className="recommendation-title">Peak Usage Optimization</div>
              <div className="recommendation-description">
                Your peak usage is during {patterns.peakUsageTimes.peakHour.timeRange}. 
                Consider setting up automations for this time period.
              </div>
            </div>
          </div>

          <div className="recommendation-item">
            <div className="recommendation-icon efficiency">🚗</div>
            <div className="recommendation-content">
              <div className="recommendation-title">Tesla Integration</div>
              <div className="recommendation-description">
                Explore more Tesla-specific features like automated climate control and charging schedules.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanelApp;
