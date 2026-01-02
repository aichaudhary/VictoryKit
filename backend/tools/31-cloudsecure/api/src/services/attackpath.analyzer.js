/**
 * Attack Path Analyzer Service
 * Analyzes potential attack paths through cloud infrastructure
 */

const { v4: uuidv4 } = require('uuid');

class AttackPathAnalyzer {
  constructor() {
    this.mitreMapping = this.getMITREMapping();
  }

  /**
   * Analyze attack paths from resources and findings
   */
  async analyze(resources, findings) {
    const attackPaths = [];

    // Identify high-value targets
    const highValueTargets = this.identifyHighValueTargets(resources);

    // Identify entry points
    const entryPoints = this.identifyEntryPoints(resources, findings);

    // Build attack paths
    for (const entryPoint of entryPoints) {
      for (const target of highValueTargets) {
        const path = await this.buildAttackPath(entryPoint, target, resources, findings);
        if (path) {
          attackPaths.push(path);
        }
      }
    }

    // Score and sort attack paths
    return attackPaths
      .map(path => this.scoreAttackPath(path, resources, findings))
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Identify high-value targets
   */
  identifyHighValueTargets(resources) {
    const targets = [];

    const highValueTypes = [
      'aws:rds:instance',
      'aws:s3:bucket',
      'azure:sql:database',
      'azure:storage:account',
      'gcp:sql:instance',
      'gcp:storage:bucket',
      'aws:secretsmanager:secret',
      'azure:keyvault:vault'
    ];

    for (const resource of resources) {
      if (highValueTypes.includes(resource.resourceType)) {
        targets.push({
          resourceId: resource.resourceId,
          resourceName: resource.resourceName,
          resourceType: resource.resourceType,
          provider: resource.provider,
          targetType: this.classifyTargetType(resource.resourceType),
          dataClassification: this.inferDataClassification(resource)
        });
      }
    }

    return targets;
  }

  /**
   * Classify target type
   */
  classifyTargetType(resourceType) {
    if (resourceType.includes('rds') || resourceType.includes('sql')) return 'database';
    if (resourceType.includes('s3') || resourceType.includes('storage')) return 'storage';
    if (resourceType.includes('secret') || resourceType.includes('keyvault')) return 'secrets';
    return 'other';
  }

  /**
   * Infer data classification from resource
   */
  inferDataClassification(resource) {
    const name = resource.resourceName.toLowerCase();
    if (name.includes('prod') || name.includes('pii') || name.includes('customer')) return 'sensitive';
    if (name.includes('backup') || name.includes('archive')) return 'critical';
    if (name.includes('log') || name.includes('audit')) return 'internal';
    return 'general';
  }

  /**
   * Identify entry points
   */
  identifyEntryPoints(resources, findings) {
    const entryPoints = [];

    // Find resources with critical/high severity findings that expose them
    const exposedFindings = findings.filter(f => 
      ['critical', 'high'].includes(f.severity) &&
      ['network-security', 'identity-access'].includes(f.category)
    );

    for (const finding of exposedFindings) {
      const resource = resources.find(r => r.resourceId === finding.resourceId);
      if (resource) {
        entryPoints.push({
          resourceId: resource.resourceId,
          resourceName: resource.resourceName,
          resourceType: resource.resourceType,
          provider: resource.provider,
          exposureType: this.classifyExposureType(finding),
          vulnerability: finding.title,
          severity: finding.severity,
          findingId: finding.findingId
        });
      }
    }

    return entryPoints;
  }

  /**
   * Classify exposure type
   */
  classifyExposureType(finding) {
    if (finding.title.toLowerCase().includes('public')) return 'internet-facing';
    if (finding.title.toLowerCase().includes('ssh') || finding.title.toLowerCase().includes('rdp')) return 'remote-access';
    if (finding.title.toLowerCase().includes('iam') || finding.title.toLowerCase().includes('mfa')) return 'weak-authentication';
    return 'misconfiguration';
  }

  /**
   * Build attack path between entry point and target
   */
  async buildAttackPath(entryPoint, target, resources, findings) {
    // Simple path building - in production, use graph-based analysis
    const hops = [];

    // Step 1: Initial Access
    hops.push({
      step: 1,
      action: 'Initial Access',
      resource: entryPoint.resourceId,
      resourceType: entryPoint.resourceType,
      technique: this.mapToMITRE('initial-access', entryPoint.exposureType),
      description: `Attacker exploits ${entryPoint.vulnerability} on ${entryPoint.resourceName}`
    });

    // Step 2: Lateral Movement (if applicable)
    if (entryPoint.provider === target.provider) {
      hops.push({
        step: 2,
        action: 'Lateral Movement',
        resource: `${entryPoint.provider}-network`,
        resourceType: 'network',
        technique: this.mapToMITRE('lateral-movement', entryPoint.provider),
        description: `Attacker moves laterally within ${entryPoint.provider} network`
      });
    }

    // Step 3: Privilege Escalation
    const iamFindings = findings.filter(f => 
      f.category === 'identity-access' && f.provider === target.provider
    );
    if (iamFindings.length > 0) {
      hops.push({
        step: 3,
        action: 'Privilege Escalation',
        resource: iamFindings[0].resourceId,
        resourceType: iamFindings[0].resourceType,
        technique: this.mapToMITRE('privilege-escalation', 'iam'),
        description: `Attacker escalates privileges via ${iamFindings[0].title}`
      });
    }

    // Step 4: Data Access
    hops.push({
      step: hops.length + 1,
      action: 'Data Access',
      resource: target.resourceId,
      resourceType: target.resourceType,
      technique: this.mapToMITRE('collection', target.targetType),
      description: `Attacker accesses ${target.targetType} ${target.resourceName}`
    });

    // Step 5: Exfiltration
    hops.push({
      step: hops.length + 1,
      action: 'Exfiltration',
      resource: target.resourceId,
      resourceType: target.resourceType,
      technique: this.mapToMITRE('exfiltration', 'default'),
      description: `Attacker exfiltrates data from ${target.resourceName}`
    });

    return {
      pathId: uuidv4(),
      name: `${entryPoint.resourceName} → ${target.resourceName}`,
      description: `Attack path from exposed ${entryPoint.resourceType} to ${target.targetType}`,
      entryPoint: entryPoint.resourceId,
      target: target.resourceId,
      provider: entryPoint.provider,
      hops,
      hopCount: hops.length,
      blastRadius: this.calculateBlastRadius(target, resources)
    };
  }

  /**
   * Score attack path
   */
  scoreAttackPath(path, resources, findings) {
    let riskScore = 0;

    // Base score from hop count (fewer hops = higher risk)
    riskScore += Math.max(0, 100 - (path.hopCount * 10));

    // Add score from entry point severity
    const entryPointFindings = findings.filter(f => 
      f.resourceId === path.entryPoint && f.severity === 'critical'
    );
    riskScore += entryPointFindings.length * 20;

    // Add score from target sensitivity
    const target = resources.find(r => r.resourceId === path.target);
    if (target) {
      const classification = this.inferDataClassification(target);
      if (classification === 'sensitive') riskScore += 30;
      if (classification === 'critical') riskScore += 25;
    }

    // Add score from blast radius
    riskScore += path.blastRadius.affectedResources.length * 5;

    // Cap at 100
    path.riskScore = Math.min(100, riskScore);
    path.severity = path.riskScore >= 80 ? 'critical' :
                    path.riskScore >= 60 ? 'high' :
                    path.riskScore >= 40 ? 'medium' : 'low';

    return path;
  }

  /**
   * Calculate blast radius
   */
  calculateBlastRadius(target, resources) {
    const affectedResources = [];
    const affectedServices = new Set();
    const affectedRegions = new Set();

    // Find related resources
    for (const resource of resources) {
      if (resource.provider === target.provider) {
        // Same provider resources could be affected
        if (resource.resourceId !== target.resourceId) {
          affectedResources.push({
            resourceId: resource.resourceId,
            resourceName: resource.resourceName,
            resourceType: resource.resourceType,
            impactLevel: this.calculateImpactLevel(resource, target)
          });
        }
        
        const service = resource.resourceType.split(':')[1];
        affectedServices.add(service);
        
        if (resource.region) {
          affectedRegions.add(resource.region);
        }
      }
    }

    // Estimate data records at risk (mock)
    const estimatedRecordsAtRisk = Math.floor(Math.random() * 1000000);
    const estimatedCost = estimatedRecordsAtRisk * 150; // Average cost per breached record

    return {
      affectedResources: affectedResources.slice(0, 10), // Top 10
      affectedServices: Array.from(affectedServices),
      affectedRegions: Array.from(affectedRegions),
      estimatedRecordsAtRisk,
      estimatedCost,
      impactSummary: this.generateImpactSummary(affectedResources, estimatedRecordsAtRisk)
    };
  }

  /**
   * Calculate impact level
   */
  calculateImpactLevel(resource, target) {
    // Simplified impact calculation
    const sameType = resource.resourceType === target.resourceType;
    const isDatabase = resource.resourceType.includes('sql') || resource.resourceType.includes('rds');
    const isStorage = resource.resourceType.includes('s3') || resource.resourceType.includes('storage');

    if (sameType) return 'high';
    if (isDatabase || isStorage) return 'medium';
    return 'low';
  }

  /**
   * Generate impact summary
   */
  generateImpactSummary(affectedResources, recordsAtRisk) {
    const highImpact = affectedResources.filter(r => r.impactLevel === 'high').length;
    const mediumImpact = affectedResources.filter(r => r.impactLevel === 'medium').length;

    return `Potential breach affecting ${recordsAtRisk.toLocaleString()} records. ` +
           `${highImpact} high-impact and ${mediumImpact} medium-impact resources at risk.`;
  }

  /**
   * Map to MITRE ATT&CK
   */
  mapToMITRE(tactic, technique) {
    const mapping = this.mitreMapping[tactic];
    if (mapping) {
      return mapping[technique] || mapping['default'] || { id: 'T0000', name: 'Unknown Technique' };
    }
    return { id: 'T0000', name: 'Unknown Technique' };
  }

  /**
   * Get MITRE ATT&CK mapping
   */
  getMITREMapping() {
    return {
      'initial-access': {
        'internet-facing': { id: 'T1190', name: 'Exploit Public-Facing Application' },
        'remote-access': { id: 'T1133', name: 'External Remote Services' },
        'weak-authentication': { id: 'T1078', name: 'Valid Accounts' },
        'misconfiguration': { id: 'T1195', name: 'Supply Chain Compromise' },
        'default': { id: 'T1190', name: 'Exploit Public-Facing Application' }
      },
      'lateral-movement': {
        'aws': { id: 'T1021', name: 'Remote Services - AWS Systems Manager' },
        'azure': { id: 'T1021', name: 'Remote Services - Azure Bastion' },
        'gcp': { id: 'T1021', name: 'Remote Services - Google Cloud IAP' },
        'default': { id: 'T1021', name: 'Remote Services' }
      },
      'privilege-escalation': {
        'iam': { id: 'T1548', name: 'Abuse Elevation Control Mechanism' },
        'default': { id: 'T1548', name: 'Abuse Elevation Control Mechanism' }
      },
      'collection': {
        'database': { id: 'T1530', name: 'Data from Cloud Storage Object' },
        'storage': { id: 'T1530', name: 'Data from Cloud Storage Object' },
        'secrets': { id: 'T1552', name: 'Unsecured Credentials' },
        'default': { id: 'T1119', name: 'Automated Collection' }
      },
      'exfiltration': {
        'default': { id: 'T1567', name: 'Exfiltration Over Web Service' }
      }
    };
  }

  /**
   * Generate remediation plan for an attack path
   */
  generateRemediationPlan(attackPath, findings) {
    const plan = {
      pathId: attackPath.pathId,
      priority: attackPath.severity,
      estimatedEffort: this.estimateEffort(attackPath),
      steps: []
    };

    // Step 1: Address entry point
    plan.steps.push({
      order: 1,
      priority: 'critical',
      action: 'Close Entry Point',
      description: `Remediate the vulnerability on ${attackPath.hops[0].resource}`,
      relatedFindings: findings.filter(f => f.resourceId === attackPath.entryPoint).map(f => f.findingId)
    });

    // Step 2: Strengthen network controls
    plan.steps.push({
      order: 2,
      priority: 'high',
      action: 'Network Segmentation',
      description: 'Implement network segmentation to limit lateral movement',
      relatedFindings: []
    });

    // Step 3: Enhance IAM
    plan.steps.push({
      order: 3,
      priority: 'high',
      action: 'Strengthen IAM Controls',
      description: 'Implement least privilege and enable MFA',
      relatedFindings: findings.filter(f => f.category === 'identity-access').map(f => f.findingId)
    });

    // Step 4: Protect target
    plan.steps.push({
      order: 4,
      priority: 'high',
      action: 'Protect High-Value Target',
      description: `Add additional controls around ${attackPath.target}`,
      relatedFindings: findings.filter(f => f.resourceId === attackPath.target).map(f => f.findingId)
    });

    // Step 5: Monitoring
    plan.steps.push({
      order: 5,
      priority: 'medium',
      action: 'Enhance Monitoring',
      description: 'Implement detection for this attack path pattern',
      relatedFindings: []
    });

    return plan;
  }

  /**
   * Estimate remediation effort
   */
  estimateEffort(attackPath) {
    const hopCount = attackPath.hopCount;
    if (hopCount <= 2) return '1-2 days';
    if (hopCount <= 4) return '3-5 days';
    return '1-2 weeks';
  }
}

module.exports = new AttackPathAnalyzer();
