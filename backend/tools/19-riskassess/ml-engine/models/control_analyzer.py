"""Control Effectiveness Analyzer"""

from typing import Dict, Any, List


class ControlAnalyzer:
    """Analyze and recommend security controls"""
    
    def __init__(self):
        self.control_library = self._load_control_library()
    
    def analyze(self, controls: List[Dict], risks: List[Dict]) -> Dict[str, Any]:
        """Analyze control coverage and effectiveness"""
        if not controls:
            return {
                'summary': {'totalControls': 0, 'coverage': 0},
                'gaps': [],
                'recommendations': ['Implement basic security controls']
            }
        
        # Calculate metrics
        total = len(controls)
        implemented = len([c for c in controls if c.get('implementation', {}).get('status') == 'implemented'])
        tested = len([c for c in controls if c.get('effectiveness', {}).get('rating') != 'not_tested'])
        
        # Calculate average effectiveness
        effectiveness_scores = [
            c.get('effectiveness', {}).get('score', 0) for c in controls
        ]
        avg_effectiveness = sum(effectiveness_scores) / total if total > 0 else 0
        
        # Analyze by type
        by_type = {}
        for control in controls:
            ctrl_type = control.get('type', 'other')
            if ctrl_type not in by_type:
                by_type[ctrl_type] = {'count': 0, 'implemented': 0, 'avgEffectiveness': 0, 'scores': []}
            by_type[ctrl_type]['count'] += 1
            if control.get('implementation', {}).get('status') == 'implemented':
                by_type[ctrl_type]['implemented'] += 1
            by_type[ctrl_type]['scores'].append(control.get('effectiveness', {}).get('score', 0))
        
        for t in by_type:
            by_type[t]['avgEffectiveness'] = round(
                sum(by_type[t]['scores']) / len(by_type[t]['scores'])
            ) if by_type[t]['scores'] else 0
            del by_type[t]['scores']
        
        # Find gaps
        gaps = self._find_gaps(controls, risks)
        
        # Coverage analysis
        coverage = self._calculate_coverage(controls, risks)
        
        return {
            'summary': {
                'totalControls': total,
                'implemented': implemented,
                'implementationRate': round(implemented / total * 100) if total > 0 else 0,
                'tested': tested,
                'testRate': round(tested / total * 100) if total > 0 else 0,
                'avgEffectiveness': round(avg_effectiveness)
            },
            'byType': by_type,
            'coverage': coverage,
            'gaps': gaps,
            'recommendations': self._generate_recommendations(controls, risks, gaps)
        }
    
    def recommend_controls(self, risk: Dict) -> Dict[str, Any]:
        """Recommend controls for a specific risk"""
        category = risk.get('category', 'security')
        inherent_level = risk.get('inherentRisk', {}).get('level', 'medium')
        
        # Get relevant controls from library
        relevant = self.control_library.get(category, self.control_library.get('security', []))
        
        # Prioritize based on risk level
        priority_map = {
            'critical': ['preventive', 'detective'],
            'high': ['preventive', 'detective', 'corrective'],
            'medium': ['preventive', 'detective'],
            'low': ['detective']
        }
        
        priority_types = priority_map.get(inherent_level, ['preventive'])
        
        recommended = []
        for control in relevant:
            if control['type'] in priority_types:
                priority = 'high' if inherent_level in ['critical', 'high'] else 'medium'
                recommended.append({
                    **control,
                    'priority': priority,
                    'expectedEffectiveness': control.get('effectiveness', 70)
                })
        
        # Sort by expected effectiveness
        recommended.sort(key=lambda x: x['expectedEffectiveness'], reverse=True)
        
        # Calculate projected residual
        if recommended:
            top_controls = recommended[:3]
            projected_reduction = min(90, sum(c['expectedEffectiveness'] for c in top_controls) / len(top_controls))
        else:
            projected_reduction = 0
        
        return {
            'riskCategory': category,
            'riskLevel': inherent_level,
            'recommendedControls': recommended[:5],
            'projectedRiskReduction': round(projected_reduction),
            'implementationGuidance': self._get_implementation_guidance(category)
        }
    
    def _find_gaps(self, controls: List[Dict], risks: List[Dict]) -> List[Dict]:
        """Find control gaps"""
        gaps = []
        
        # Check for missing control types
        control_types = set(c.get('type') for c in controls)
        required_types = {'preventive', 'detective', 'corrective'}
        missing_types = required_types - control_types
        
        for missing in missing_types:
            gaps.append({
                'type': 'missing_control_type',
                'description': f'No {missing} controls implemented',
                'severity': 'high' if missing == 'preventive' else 'medium',
                'recommendation': f'Implement {missing} controls'
            })
        
        # Check for high risks without controls
        for risk in risks:
            level = risk.get('inherentRisk', {}).get('level') or risk.get('level')
            risk_controls = risk.get('controls', [])
            
            if level in ['critical', 'high'] and len(risk_controls) == 0:
                gaps.append({
                    'type': 'uncontrolled_risk',
                    'description': f'{level.upper()} risk "{risk.get("name")}" has no controls',
                    'severity': 'critical' if level == 'critical' else 'high',
                    'recommendation': 'Assign appropriate controls immediately'
                })
        
        # Check for ineffective controls
        for control in controls:
            effectiveness = control.get('effectiveness', {}).get('score', 0)
            if effectiveness < 30:
                gaps.append({
                    'type': 'ineffective_control',
                    'description': f'Control "{control.get("name")}" has low effectiveness ({effectiveness}%)',
                    'severity': 'medium',
                    'recommendation': 'Review and improve control implementation'
                })
        
        return gaps
    
    def _calculate_coverage(self, controls: List[Dict], risks: List[Dict]) -> Dict[str, Any]:
        """Calculate control coverage"""
        if not risks:
            return {'overallCoverage': 100, 'byCategory': {}}
        
        covered_risks = 0
        by_category = {}
        
        for risk in risks:
            category = risk.get('category', 'other')
            has_controls = len(risk.get('controls', [])) > 0
            
            if category not in by_category:
                by_category[category] = {'total': 0, 'covered': 0}
            by_category[category]['total'] += 1
            
            if has_controls:
                covered_risks += 1
                by_category[category]['covered'] += 1
        
        for cat in by_category:
            by_category[cat]['coverage'] = round(
                by_category[cat]['covered'] / by_category[cat]['total'] * 100
            )
        
        return {
            'overallCoverage': round(covered_risks / len(risks) * 100),
            'coveredRisks': covered_risks,
            'uncoveredRisks': len(risks) - covered_risks,
            'byCategory': by_category
        }
    
    def _generate_recommendations(self, controls: List[Dict], risks: List[Dict], gaps: List[Dict]) -> List[str]:
        """Generate control recommendations"""
        recommendations = []
        
        # Based on gaps
        critical_gaps = [g for g in gaps if g['severity'] == 'critical']
        if critical_gaps:
            recommendations.append(f'Address {len(critical_gaps)} critical control gaps immediately')
        
        # Based on testing
        untested = [c for c in controls if c.get('effectiveness', {}).get('rating') == 'not_tested']
        if len(untested) > len(controls) * 0.3:
            recommendations.append('Schedule control effectiveness testing for untested controls')
        
        # Based on implementation
        not_implemented = [c for c in controls if c.get('implementation', {}).get('status') != 'implemented']
        if not_implemented:
            recommendations.append(f'Complete implementation of {len(not_implemented)} planned controls')
        
        # Based on risk coverage
        high_risks_uncovered = [
            r for r in risks 
            if r.get('inherentRisk', {}).get('level') in ['critical', 'high']
            and len(r.get('controls', [])) == 0
        ]
        if high_risks_uncovered:
            recommendations.append(f'Assign controls to {len(high_risks_uncovered)} high/critical risks')
        
        if not recommendations:
            recommendations.append('Control framework is adequate - continue monitoring')
        
        return recommendations
    
    def _get_implementation_guidance(self, category: str) -> List[str]:
        """Get implementation guidance by category"""
        guidance = {
            'security': [
                'Start with preventive controls',
                'Implement defense in depth',
                'Enable logging and monitoring',
                'Establish incident response procedures'
            ],
            'compliance': [
                'Map controls to regulatory requirements',
                'Document all control activities',
                'Establish regular audit schedule',
                'Maintain evidence of compliance'
            ],
            'operational': [
                'Focus on business continuity',
                'Implement redundancy where critical',
                'Establish clear procedures',
                'Train personnel on controls'
            ],
            'financial': [
                'Implement segregation of duties',
                'Establish approval workflows',
                'Enable transaction monitoring',
                'Regular reconciliation procedures'
            ]
        }
        return guidance.get(category, guidance['security'])
    
    def _load_control_library(self) -> Dict[str, List[Dict]]:
        """Load control library"""
        return {
            'security': [
                {'name': 'Multi-factor Authentication', 'type': 'preventive', 'effectiveness': 85},
                {'name': 'Intrusion Detection System', 'type': 'detective', 'effectiveness': 75},
                {'name': 'Firewall', 'type': 'preventive', 'effectiveness': 80},
                {'name': 'Encryption at Rest', 'type': 'preventive', 'effectiveness': 90},
                {'name': 'Security Awareness Training', 'type': 'preventive', 'effectiveness': 60},
                {'name': 'Vulnerability Scanning', 'type': 'detective', 'effectiveness': 70},
                {'name': 'Incident Response Plan', 'type': 'corrective', 'effectiveness': 65},
                {'name': 'Access Control Lists', 'type': 'preventive', 'effectiveness': 75}
            ],
            'compliance': [
                {'name': 'Policy Framework', 'type': 'directive', 'effectiveness': 70},
                {'name': 'Audit Logging', 'type': 'detective', 'effectiveness': 80},
                {'name': 'Data Classification', 'type': 'preventive', 'effectiveness': 65},
                {'name': 'Privacy Controls', 'type': 'preventive', 'effectiveness': 75},
                {'name': 'Compliance Monitoring', 'type': 'detective', 'effectiveness': 70}
            ],
            'operational': [
                {'name': 'Backup and Recovery', 'type': 'corrective', 'effectiveness': 85},
                {'name': 'Change Management', 'type': 'preventive', 'effectiveness': 70},
                {'name': 'Capacity Planning', 'type': 'preventive', 'effectiveness': 60},
                {'name': 'Performance Monitoring', 'type': 'detective', 'effectiveness': 75}
            ],
            'third_party': [
                {'name': 'Vendor Risk Assessment', 'type': 'preventive', 'effectiveness': 70},
                {'name': 'Contract Security Requirements', 'type': 'directive', 'effectiveness': 65},
                {'name': 'Third-party Monitoring', 'type': 'detective', 'effectiveness': 60}
            ]
        }
