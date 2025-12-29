"""
Recommendation Engine
Provides recommendations for access control optimization
"""

from typing import Dict, List, Any
from datetime import datetime


class RecommendationEngine:
    def __init__(self):
        pass
    
    def optimize(self, policies: List[Dict], objectives: List[str]) -> Dict:
        """Optimize policy set based on objectives"""
        recommendations = []
        improvements = []
        optimized_policies = policies.copy()
        
        if 'security' in objectives:
            security_recs = self._optimize_security(policies)
            recommendations.extend(security_recs['recommendations'])
            improvements.extend(security_recs['improvements'])
        
        if 'performance' in objectives:
            perf_recs = self._optimize_performance(policies)
            recommendations.extend(perf_recs['recommendations'])
            improvements.extend(perf_recs['improvements'])
        
        if 'maintainability' in objectives:
            maint_recs = self._optimize_maintainability(policies)
            recommendations.extend(maint_recs['recommendations'])
            improvements.extend(maint_recs['improvements'])
        
        return {
            'policies': optimized_policies,
            'recommendations': recommendations,
            'improvements': improvements,
            'summary': {
                'totalRecommendations': len(recommendations),
                'highPriority': len([r for r in recommendations if r.get('priority') == 'high']),
                'mediumPriority': len([r for r in recommendations if r.get('priority') == 'medium']),
                'lowPriority': len([r for r in recommendations if r.get('priority') == 'low'])
            }
        }
    
    def _optimize_security(self, policies: List[Dict]) -> Dict:
        """Security-focused optimizations"""
        recommendations = []
        improvements = []
        
        for policy in policies:
            # Check for wildcard actions
            if '*' in policy.get('actions', []):
                recommendations.append({
                    'policyId': policy.get('policyId'),
                    'type': 'REMOVE_WILDCARD',
                    'priority': 'high',
                    'description': 'Replace wildcard action with specific actions',
                    'impact': 'Reduces attack surface by limiting permissions'
                })
            
            # Check for missing MFA
            if not policy.get('context', {}).get('mfaRequired'):
                if policy.get('effect') == 'allow':
                    privileged = any(a in policy.get('actions', []) 
                                   for a in ['admin', 'delete', 'execute'])
                    if privileged:
                        recommendations.append({
                            'policyId': policy.get('policyId'),
                            'type': 'ADD_MFA_REQUIREMENT',
                            'priority': 'high',
                            'description': 'Add MFA requirement for privileged actions',
                            'impact': 'Prevents unauthorized access with stolen credentials'
                        })
            
            # Check for IP restrictions
            if not policy.get('context', {}).get('ipRestrictions'):
                if policy.get('effect') == 'allow':
                    recommendations.append({
                        'policyId': policy.get('policyId'),
                        'type': 'ADD_IP_RESTRICTIONS',
                        'priority': 'medium',
                        'description': 'Consider adding IP-based restrictions',
                        'impact': 'Limits access to known networks'
                    })
        
        # Check for deny-by-default
        has_default_deny = any(
            p.get('effect') == 'deny' and 
            not p.get('subjects') and 
            not p.get('resources')
            for p in policies
        )
        if not has_default_deny:
            improvements.append({
                'type': 'ADD_DEFAULT_DENY',
                'description': 'Add a default deny policy with lowest priority',
                'impact': 'Ensures any unmatched access is denied'
            })
        
        return {
            'recommendations': recommendations,
            'improvements': improvements
        }
    
    def _optimize_performance(self, policies: List[Dict]) -> Dict:
        """Performance-focused optimizations"""
        recommendations = []
        improvements = []
        
        # Check for policy count
        if len(policies) > 100:
            improvements.append({
                'type': 'REDUCE_POLICY_COUNT',
                'description': f'Consider consolidating {len(policies)} policies',
                'impact': 'Reduces evaluation time'
            })
        
        # Check for complex conditions
        for policy in policies:
            conditions = policy.get('conditions', [])
            if len(conditions) > 5:
                recommendations.append({
                    'policyId': policy.get('policyId'),
                    'type': 'SIMPLIFY_CONDITIONS',
                    'priority': 'low',
                    'description': f'Policy has {len(conditions)} conditions - consider simplifying',
                    'impact': 'Reduces evaluation complexity'
                })
        
        # Check for priority ordering
        priorities = [p.get('priority', 100) for p in policies]
        if len(set(priorities)) < len(policies) * 0.5:
            improvements.append({
                'type': 'IMPROVE_PRIORITY_DISTRIBUTION',
                'description': 'Many policies share the same priority - consider spreading priorities',
                'impact': 'Makes policy precedence clearer and evaluation faster'
            })
        
        return {
            'recommendations': recommendations,
            'improvements': improvements
        }
    
    def _optimize_maintainability(self, policies: List[Dict]) -> Dict:
        """Maintainability-focused optimizations"""
        recommendations = []
        improvements = []
        
        # Check for naming conventions
        for policy in policies:
            name = policy.get('name', '')
            if not name or len(name) < 5:
                recommendations.append({
                    'policyId': policy.get('policyId'),
                    'type': 'IMPROVE_NAMING',
                    'priority': 'low',
                    'description': 'Use descriptive policy names',
                    'impact': 'Improves policy management and auditing'
                })
            
            if not policy.get('description'):
                recommendations.append({
                    'policyId': policy.get('policyId'),
                    'type': 'ADD_DESCRIPTION',
                    'priority': 'low',
                    'description': 'Add description to policy',
                    'impact': 'Helps understand policy purpose'
                })
        
        # Check for role-based grouping
        role_policies = [p for p in policies if p.get('subjects', {}).get('roles')]
        if len(role_policies) < len(policies) * 0.5:
            improvements.append({
                'type': 'USE_ROLE_BASED_POLICIES',
                'description': 'Consider using role-based policies instead of user-specific ones',
                'impact': 'Simplifies management as users change'
            })
        
        return {
            'recommendations': recommendations,
            'improvements': improvements
        }
    
    def recommend_access(self, subject: Dict, resource: Dict, 
                        action: str, context: Dict) -> Dict:
        """Recommend access level based on context"""
        # Analyze subject risk
        subject_risk = self._assess_subject_risk(subject)
        
        # Analyze resource sensitivity
        resource_sensitivity = self._assess_resource_sensitivity(resource)
        
        # Analyze action risk
        action_risk = self._assess_action_risk(action)
        
        # Analyze context
        context_factors = self._analyze_context(context)
        
        # Calculate overall recommendation
        total_risk = (subject_risk + resource_sensitivity + action_risk) / 3
        
        if total_risk > 70:
            recommendation = 'deny'
            reason = 'High-risk combination of subject, resource, and action'
            required_controls = ['mfa', 'approval', 'logging']
        elif total_risk > 40:
            recommendation = 'allow_with_controls'
            reason = 'Medium risk - additional controls recommended'
            required_controls = ['mfa', 'logging']
        else:
            recommendation = 'allow'
            reason = 'Low-risk access request'
            required_controls = ['logging']
        
        return {
            'recommendation': recommendation,
            'reason': reason,
            'riskScore': round(total_risk),
            'breakdown': {
                'subjectRisk': subject_risk,
                'resourceSensitivity': resource_sensitivity,
                'actionRisk': action_risk,
                'contextFactors': context_factors
            },
            'requiredControls': required_controls,
            'suggestedPolicy': self._generate_policy_suggestion(
                subject, resource, action, recommendation
            )
        }
    
    def _assess_subject_risk(self, subject: Dict) -> int:
        """Assess risk level of subject"""
        risk = 30  # Base risk
        
        # External subjects are higher risk
        if subject.get('type') == 'external':
            risk += 30
        
        # Service accounts need scrutiny
        if subject.get('type') == 'service_account':
            risk += 10
        
        # Admin users have higher risk
        roles = subject.get('roles', [])
        if any('admin' in r.lower() for r in roles):
            risk += 20
        
        return min(risk, 100)
    
    def _assess_resource_sensitivity(self, resource: Dict) -> int:
        """Assess sensitivity of resource"""
        sensitivity = 20  # Base sensitivity
        
        sensitive_types = ['secrets', 'credentials', 'keys', 'pii', 'financial', 'admin']
        resource_type = resource.get('type', '').lower()
        
        for sensitive in sensitive_types:
            if sensitive in resource_type:
                sensitivity += 30
                break
        
        return min(sensitivity, 100)
    
    def _assess_action_risk(self, action: str) -> int:
        """Assess risk level of action"""
        risk_levels = {
            'read': 10,
            'write': 40,
            'create': 30,
            'update': 35,
            'delete': 60,
            'execute': 50,
            'admin': 80,
            '*': 100
        }
        return risk_levels.get(action.lower(), 30)
    
    def _analyze_context(self, context: Dict) -> List[Dict]:
        """Analyze context factors"""
        factors = []
        
        if context.get('mfaVerified'):
            factors.append({'factor': 'mfa', 'status': 'verified', 'impact': 'reduces_risk'})
        else:
            factors.append({'factor': 'mfa', 'status': 'not_verified', 'impact': 'increases_risk'})
        
        if context.get('location') == 'internal':
            factors.append({'factor': 'location', 'status': 'internal', 'impact': 'reduces_risk'})
        else:
            factors.append({'factor': 'location', 'status': 'external', 'impact': 'increases_risk'})
        
        return factors
    
    def _generate_policy_suggestion(self, subject: Dict, resource: Dict, 
                                   action: str, recommendation: str) -> Dict:
        """Generate a policy suggestion"""
        return {
            'effect': 'allow' if recommendation != 'deny' else 'deny',
            'subjects': {
                'roles': subject.get('roles', []),
                'users': [subject.get('userId')] if subject.get('userId') else []
            },
            'resources': {
                'types': [resource.get('type')] if resource.get('type') else [],
                'identifiers': [resource.get('id')] if resource.get('id') else []
            },
            'actions': [action],
            'context': {
                'mfaRequired': recommendation == 'allow_with_controls'
            }
        }
