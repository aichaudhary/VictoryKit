const axios = require('axios');
const { ApiError } = require('../../../../../shared/utils/apiError');
const logger = require('../../../../../shared/utils/logger');

class MLService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8001';
  }

  async predictFraud(transactionData) {
    try {
      const response = await axios.post(
        `${this.mlEngineUrl}/api/v1/predict`,
        transactionData,
        {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return {
        score: response.data.fraud_score || 0,
        confidence: response.data.confidence || 0,
        model: response.data.model_name || 'fraud-detector-v1',
        version: response.data.model_version || '1.0',
        features: response.data.feature_importance || {},
        flags: response.data.flags || []
      };
    } catch (error) {
      logger.error(`ML prediction failed: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        // ML service down - use rule-based fallback
        return this.ruleBasedPrediction(transactionData);
      }
      
      throw ApiError.serviceUnavailable('ML service temporarily unavailable');
    }
  }

  ruleBasedPrediction(data) {
    let score = 0;
    const flags = [];

    // High amount rule
    if (data.amount > 10000) {
      score += 30;
      flags.push({
        rule: 'high_amount',
        reason: 'Transaction amount exceeds $10,000',
        severity: 'medium'
      });
    }

    // Velocity rule (simplified - would check actual transaction history)
    if (data.velocity && data.velocity > 5) {
      score += 25;
      flags.push({
        rule: 'high_velocity',
        reason: 'Multiple transactions in short time',
        severity: 'high'
      });
    }

    // International transaction
    if (data.geolocation && data.geolocation.country !== 'US') {
      score += 15;
      flags.push({
        rule: 'international',
        reason: 'International transaction',
        severity: 'low'
      });
    }

    // New device
    if (data.deviceFingerprint === 'unknown') {
      score += 20;
      flags.push({
        rule: 'new_device',
        reason: 'Transaction from unrecognized device',
        severity: 'medium'
      });
    }

    return {
      score: Math.min(score, 100),
      confidence: 0.7,
      model: 'rule-based-fallback',
      version: '1.0',
      features: {},
      flags
    };
  }

  async trainModel(trainingData) {
    try {
      const response = await axios.post(
        `${this.mlEngineUrl}/api/v1/train`,
        trainingData,
        {
          timeout: 60000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data;
    } catch (error) {
      logger.error(`Model training failed: ${error.message}`);
      throw ApiError.internal('Model training failed');
    }
  }

  async getModelMetrics() {
    try {
      const response = await axios.get(`${this.mlEngineUrl}/api/v1/metrics`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch model metrics: ${error.message}`);
      throw ApiError.internal('Failed to fetch model metrics');
    }
  }
}

module.exports = new MLService();
