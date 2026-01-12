/**
 * Services Index
 * Export all FraudGuard services
 */

// Scanner services
export { scanURL } from './urlScanner.js';
export { checkEmail, checkPassword } from './emailChecker.js';
export { validatePhone } from './phoneValidator.js';
export { checkIP } from './ipChecker.js';
export { passwordCheckerService } from './passwordChecker.js';

// External API clients
export { 
  virusTotalClient,
  hibpClient,
  abuseipdbClient,
  ipQualityScore,
  numverifyClient,
  urlscanClient,
  googleSafeBrowsing
} from './externalAPIs.js';

// Core services
export { default as fraudAnalyzer } from './fraudAnalyzer.js';
export { databaseService } from './database.js';
