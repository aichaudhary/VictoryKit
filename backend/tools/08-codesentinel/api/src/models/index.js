/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ CODESENTINEL - Models Index
 * Static Application Security Testing (SAST) Engine Models
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Model Inventory:
 * ────────────────────────────────────────────────────────────────────────────────
 * 1. Codebase        - Project repositories and codebases under analysis
 * 2. CodeIssue       - Security vulnerabilities and code issues found
 * 3. CodeScan        - Individual scan sessions and their results
 * 4. Dependency      - Software composition analysis (SCA) data
 * 5. FixSuggestion   - AI-generated code remediation suggestions
 * 6. ScanReport      - Comprehensive security analysis reports
 * 7. SecretFinding   - Credential and secret detection results
 * 8. SecurityRule    - SAST rules and detection patterns
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Total Models: 8
 * Total Indexes: 45+
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const Codebase = require('./Codebase');
const CodeIssue = require('./Issue');
const CodeScan = require('./Scan');
const Dependency = require('./Dependency');
const FixSuggestion = require('./FixSuggestion');
const ScanReport = require('./ScanReport');
const SecretFinding = require('./SecretFinding');
const SecurityRule = require('./SecurityRule');

module.exports = {
  // Core Models
  Codebase,
  CodeIssue,
  CodeScan,
  
  // Extended Models
  Dependency,
  FixSuggestion,
  ScanReport,
  SecretFinding,
  SecurityRule,
  
  // Aliases for compatibility
  Issue: CodeIssue,
  Scan: CodeScan,
  Report: ScanReport,
  Secret: SecretFinding,
  Rule: SecurityRule,
  Fix: FixSuggestion
};
