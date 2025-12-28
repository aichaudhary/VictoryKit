const Transaction = require('../models/Transaction.model');
const Analysis = require('../models/Analysis.model');

class FraudService {
  calculateRiskLevel(fraudScore) {
    if (fraudScore >= 80) return 'critical';
    if (fraudScore >= 60) return 'high';
    if (fraudScore >= 40) return 'medium';
    return 'low';
  }

  async analyzePatterns(userId, timeRange) {
    const transactions = await Transaction.find({
      userId,
      timestamp: {
        $gte: timeRange.start,
        $lte: timeRange.end
      }
    });

    const patterns = [];

    // Velocity pattern
    const velocityGroups = this.groupByTimeWindow(transactions, 3600000); // 1 hour windows
    velocityGroups.forEach(group => {
      if (group.length > 5) {
        patterns.push({
          type: 'velocity',
          description: `${group.length} transactions within 1 hour`,
          severity: group.length > 10 ? 'high' : 'medium',
          occurrences: group.length,
          examples: group.slice(0, 3).map(t => t._id)
        });
      }
    });

    // Amount pattern
    const largeTransactions = transactions.filter(t => t.amount > 5000);
    if (largeTransactions.length > 0) {
      patterns.push({
        type: 'amount',
        description: `${largeTransactions.length} high-value transactions (>$5000)`,
        severity: largeTransactions.length > 3 ? 'high' : 'medium',
        occurrences: largeTransactions.length,
        examples: largeTransactions.slice(0, 3).map(t => t._id)
      });
    }

    // Location pattern
    const uniqueCountries = new Set(
      transactions
        .filter(t => t.geolocation?.country)
        .map(t => t.geolocation.country)
    );
    if (uniqueCountries.size > 3) {
      patterns.push({
        type: 'location',
        description: `Transactions from ${uniqueCountries.size} different countries`,
        severity: uniqueCountries.size > 5 ? 'high' : 'medium',
        occurrences: uniqueCountries.size,
        examples: []
      });
    }

    // Time pattern (unusual hours)
    const nightTransactions = transactions.filter(t => {
      const hour = new Date(t.timestamp).getHours();
      return hour >= 0 && hour <= 5; // 12 AM - 5 AM
    });
    if (nightTransactions.length > 2) {
      patterns.push({
        type: 'time',
        description: `${nightTransactions.length} transactions during unusual hours (12 AM - 5 AM)`,
        severity: 'medium',
        occurrences: nightTransactions.length,
        examples: nightTransactions.slice(0, 3).map(t => t._id)
      });
    }

    return patterns;
  }

  groupByTimeWindow(transactions, windowMs) {
    const sorted = transactions.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    const groups = [];
    let currentGroup = [];
    let windowStart = null;

    sorted.forEach(transaction => {
      const txTime = new Date(transaction.timestamp).getTime();
      
      if (!windowStart || txTime - windowStart > windowMs) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [transaction];
        windowStart = txTime;
      } else {
        currentGroup.push(transaction);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  async calculateStatistics(userId, timeRange) {
    const transactions = await Transaction.find({
      userId,
      timestamp: {
        $gte: timeRange.start,
        $lte: timeRange.end
      }
    });

    const stats = {
      totalTransactions: transactions.length,
      fraudulentCount: transactions.filter(t => t.isFraudulent).length,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      fraudulentAmount: transactions
        .filter(t => t.isFraudulent)
        .reduce((sum, t) => sum + t.amount, 0),
      avgFraudScore: transactions.reduce((sum, t) => sum + t.fraudScore, 0) / transactions.length || 0,
      riskDistribution: {
        low: transactions.filter(t => t.riskLevel === 'low').length,
        medium: transactions.filter(t => t.riskLevel === 'medium').length,
        high: transactions.filter(t => t.riskLevel === 'high').length,
        critical: transactions.filter(t => t.riskLevel === 'critical').length
      }
    };

    stats.fraudRate = stats.totalTransactions > 0
      ? (stats.fraudulentCount / stats.totalTransactions) * 100
      : 0;

    return stats;
  }

  generateInsights(stats, patterns) {
    const insights = [];

    // High fraud rate insight
    if (stats.fraudRate > 5) {
      insights.push({
        category: 'fraud_rate',
        finding: `Fraud rate is ${stats.fraudRate.toFixed(2)}%, which is above the 5% threshold`,
        recommendation: 'Review fraud detection rules and consider additional verification steps',
        priority: stats.fraudRate > 10 ? 'critical' : 'high'
      });
    }

    // Pattern insights
    patterns.forEach(pattern => {
      if (pattern.severity === 'high' || pattern.severity === 'critical') {
        insights.push({
          category: pattern.type,
          finding: pattern.description,
          recommendation: `Investigate ${pattern.type} pattern and implement additional controls`,
          priority: pattern.severity
        });
      }
    });

    // Amount insights
    if (stats.fraudulentAmount > stats.totalAmount * 0.1) {
      insights.push({
        category: 'financial_impact',
        finding: `Fraudulent transactions account for ${((stats.fraudulentAmount / stats.totalAmount) * 100).toFixed(2)}% of total transaction value`,
        recommendation: 'Focus on high-value transaction monitoring and implement additional authentication',
        priority: 'high'
      });
    }

    return insights;
  }
}

module.exports = new FraudService();
