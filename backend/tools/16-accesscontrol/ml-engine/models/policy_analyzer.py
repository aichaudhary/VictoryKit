"""
Policy Analyzer
Analyzes policies for security issues and optimization opportunities
"""

from typing import Dict, List, Any
from datetime import datetime


class PolicyAnalyzer:
    def __init__(self):
        self.risk_weights = {
            'wildcard_actions': 30,
            'no_conditions': 15,
            'no_time_restrictions': 10,
            'global_scope': 20,
            'privileged_access': 25
        }
    
    def analyze(self, policy: Dict) -> Dict:
        """Analyze a policy for security issues"""
        issues = []
        recommendations = []
        risk_score = 0
        
        # Check for wildcard actions
        actions = policy.get('actions', [])
        if '*' in actions:
            issues.append({
                'severity': 'high',
                'type': 'WILDCARD_ACTIONS',
                'message': 'Policy grants all actions using wildcard (*)',
                'remediation': 'Replace wildcard with specific required actions'
            })
            risk_score += self.risk_weights['wildcard_actions']
        
        # Check for missing conditions
        conditions = policy.get('conditions', [])
        if not conditions and policy.get('effect') == 'allow':
            issues.append({
                'severity': 'medium',
                'type': 'NO_CONDITIONS',
                'message': 'Allow policy has no conditions',
                'remediation': 'Add conditions to limit scope'
            })
            risk_score += self.risk_weights['no_conditions']
        
        # Check for missing context restrictions
        context = policy.get('context', {})
        if not context.get('timeRestrictions') and policy.get('effect') == 'allow':
            recommendations.append({
                'type': 'ADD_TIME_RESTRICTIONS',
                'message': 'Consider adding time-based access restrictions',
                'priority': 'medium'
            })
            risk_score += self.risk_weights['no_time_restrictions']
        
        # Check subject specificity
        subjects = policy.get('subjects', {})
        if not subjects.get('users') and not subjects.get('roles') and not subjects.get('groups'):
            issues.append({
                'severity': 'high',
                'type': 'UNSCOPED_SUBJECTS',
                'message': 'Policy has no defined subjects',
                'remediation': 'Define specific users, roles, or groups'
            })
            risk_score += 25
        
        # Check resource specificity
        resources = policy.get('resources', {})
        if not resources.get('types') and not resources.get('identifiers') and not resources.get('patterns'):
            issues.append({
                'severity': 'high',
                'type': 'UNSCOPED_RESOURCES',
                'message': 'Policy applies to all resources',
                'remediation': 'Limit to specific resource types or identifiers'
            })
            risk_score += 20
        
        # Determine risk level
        if risk_score >= 50:
            risk_level = 'high'
        elif risk_score >= 25:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'riskScore': min(risk_score, 100),
            'riskLevel': risk_level,
            'issues': issues,
            'recommendations': recommendations,
            'compliance': self._check_compliance(policy)
        }
    
    def analyze_access_risk(self, subject: Dict, resource: Dict, 
                           action: str, context: Dict) -> Dict:
        """Analyze risk level of an access request"""
        risk_factors = []
        risk_score = 0
        
        # Check privileged actions
        privileged_actions = ['admin', 'delete', 'execute', '*']
        if action in privileged_actions:
            risk_factors.append({
                'factor': 'PRIVILEGED_ACTION',
                'description': f'Action "{action}" is privileged',
                'weight': 25
            })
            risk_score += 25
        
        # Check sensitive resources
        sensitive_types = ['secrets', 'credentials', 'keys', 'admin', 'config']
        resource_type = resource.get('type', '').lower()
        if any(s in resource_type for s in sensitive_types):
            risk_factors.append({
                'factor': 'SENSITIVE_RESOURCE',
                'description': f'Resource type "{resource_type}" is sensitive',
                'weight': 30
            })
            risk_score += 30
        
        # Check context
        if not context.get('mfaVerified'):
            risk_factors.append({
                'factor': 'NO_MFA',
                'description': 'Request not MFA verified',
                'weight': 15
            })
            risk_score += 15
        
        # Check unusual access time
        current_hour = datetime.now().hour
        if current_hour < 6 or current_hour > 22:
            risk_factors.append({
                'factor': 'UNUSUAL_TIME',
                'description': 'Access requested outside business hours',
                'weight': 10
            })
            risk_score += 10
        
        # Determine risk level
        if risk_score >= 50:
            risk_level = 'high'
            recommendation = 'Require additional verification'
        elif risk_score >= 25:
            risk_level = 'medium'
            recommendation = 'Log and monitor this access'
        else:
            risk_level = 'low'
            recommendation = 'Normal access'
        
        return {
            'riskScore': min(risk_score, 100),
            'riskLevel': risk_level,
            'riskFactors': risk_factors,
            'recommendation': recommendation
        }
    
    def _check_compliance(self, policy: Dict) -> Dict:
        """Check policy compliance with standards"""
        compliance_checks = {
            'leastPrivilege': '*' not in policy.get('actions', []),
            'conditionsApplied': len(policy.get('conditions', [])) > 0,
            'timeRestricted': bool(policy.get('context', {}).get('timeRestrictions')),
            'mfaEnforced': bool(policy.get('context', {}).get('mfaRequired')),
            'scopeLimited': bool(policy.get('scope', {}).get('applications'))
        }
        
        passed = sum(1 for v in compliance_checks.values() if v)
        total = len(compliance_checks)
        
        return {
            'checks': compliance_checks,
            'score': round((passed / total) * 100),
            'passed': passed,
            'total': total
        }
