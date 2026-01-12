/**
 * RiskQuantify Pro - Models Index
 * ================================
 * Centralized model exports for the Enterprise Risk Quantification Platform
 * 
 * Models:
 * - Risk: Core risk entities with FAIR framework support
 * - RiskAssessment: Assessment workflows and sessions
 * - RiskRegister: Risk register snapshots and reporting
 * - Threat: Threat intelligence catalog
 * - Asset: Asset inventory for risk mapping
 * - Control: Control library and effectiveness tracking
 * - Assessment: Assessment templates and configurations
 * 
 * @module models
 * @version 19.0.0
 */

const Risk = require('./Risk');
const RiskAssessment = require('./RiskAssessment');
const RiskRegister = require('./RiskRegister');
const Threat = require('./Threat');
const Asset = require('./Asset');
const Control = require('./Control');
const Assessment = require('./Assessment');

module.exports = {
  // Primary Risk Models
  Risk,
  RiskAssessment,
  RiskRegister,
  
  // Supporting Models
  Threat,
  Asset,
  Control,
  Assessment,
  
  // Aliases for consistency
  RiskModel: Risk,
  AssessmentModel: RiskAssessment,
  RegisterModel: RiskRegister,
  ThreatModel: Threat,
  AssetModel: Asset,
  ControlModel: Control,
  
  // Model names for dynamic loading
  modelNames: [
    'Risk',
    'RiskAssessment',
    'RiskRegister',
    'Threat',
    'Asset',
    'Control',
    'Assessment'
  ]
};
