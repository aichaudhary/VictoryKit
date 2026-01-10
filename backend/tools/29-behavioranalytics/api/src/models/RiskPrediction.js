const mongoose = require('mongoose');

const riskPredictionSchema = new mongoose.Schema({
  predictionId: { type: String, required: true, unique: true, index: true },
  
  entityType: {
    type: String,
    enum: ['asset', 'user', 'department', 'organization', 'threat', 'vendor'],
    required: true,
    index: true
  },
  
  entityId: { type: String, required: true, index: true },
  entityName: { type: String },
  
  currentRiskScore: { type: Number, required: true, min: 0, max: 100 },
  
  predictions: [{
    timeframe: { type: String, required: true }, // "7_days", "30_days", etc.
    predictedScore: { type: Number, min: 0, max: 100 },
    confidenceLevel: { type: Number, min: 0, max: 100 },
    predictionDate: { type: Date, default: Date.now },
    factors: [{
      factor: { type: String },
      impact: { type: String, enum: ['positive', 'negative', 'neutral'] },
      magnitude: { type: Number }
    }]
  }],
  
  trajectory: {
    direction: { type: String, enum: ['improving', 'stable', 'deteriorating'], required: true },
    velocity: { type: Number }, // Rate of change (score points per day)
    acceleration: { type: Number } // Change in velocity
  },
  
  scenarios: [{
    scenarioName: { type: String },
    description: { type: String },
    assumptions: [{ type: String }],
    predictedScore: { type: Number, min: 0, max: 100 },
    probability: { type: Number, min: 0, max: 100 },
    recommendedActions: [{ type: String }]
  }],
  
  mlModel: {
    modelName: { type: String },
    modelVersion: { type: String },
    algorithm: { type: String },
    trainingData: {
      startDate: { type: Date },
      endDate: { type: Date },
      samples: { type: Number }
    },
    performance: {
      accuracy: { type: Number, min: 0, max: 100 },
      precision: { type: Number, min: 0, max: 100 },
      recall: { type: Number, min: 0, max: 100 },
      f1Score: { type: Number, min: 0, max: 1 }
    }
  },
  
  influencingFactors: [{
    factor: { type: String },
    currentValue: { type: mongoose.Schema.Types.Mixed },
    predictedValue: { type: mongoose.Schema.Types.Mixed },
    importance: { type: Number, min: 0, max: 1 }
  }],
  
  recommendations: [{
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    action: { type: String },
    expectedImpact: { type: Number }, // Expected score reduction
    timeToImplement: { type: String },
    cost: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  
  alerts: [{
    alertType: { type: String, enum: ['warning', 'critical', 'info'] },
    message: { type: String },
    threshold: { type: Number },
    triggered: { type: Boolean, default: false },
    triggeredAt: { type: Date }
  }],
  
  historicalAccuracy: {
    predictions: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    averageError: { type: Number }, // Average difference between prediction and actual
    lastValidation: { type: Date }
  },
  
  validUntil: { type: Date, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

riskPredictionSchema.index({ entityType: 1, entityId: 1 });
riskPredictionSchema.index({ 'trajectory.direction': 1, currentRiskScore: -1 });
riskPredictionSchema.index({ validUntil: 1 });

module.exports = mongoose.model('RiskPrediction', riskPredictionSchema);
