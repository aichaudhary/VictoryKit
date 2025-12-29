"""Risk Assessment Engine"""

from typing import Dict, Any, List
from datetime import datetime


class AssessmentEngine:
    """Comprehensive risk assessment analysis"""
    
    def __init__(self):
        self.frameworks = self._load_frameworks()
    
    def analyze(self, assessment: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive assessment analysis"""
        risks = assessment.get('risks', [])
        controls = assessment.get('controls', [])
        methodology = assessment.get('methodology', 'qualitative')
        
        # Risk analysis
        risk_analysis = self._analyze_risks(risks)
        
        # Control analysis
        control_analysis = self._analyze_controls(controls)
        
        # Maturity assessment
        maturity = self._assess_maturity(assessment)
        
        # Heat map data
        heat_map = self._generate_heat_map(risks)
        
        # Trends (simulated)
        trends = self._analyze_trends(risks)
        
        # Generate insights
        insights = self._generate_insights(risk_analysis, control_analysis)
        
        return {
            'assessmentName': assessment.get('name'),
            'methodology': methodology,
            'analyzedAt': datetime.utcnow().isoformat(),
            'riskAnalysis': risk_analysis,
            'controlAnalysis': control_analysis,
            'maturity': maturity,
            'heatMap': heat_map,
            'trends': trends,
            'insights': insights,
            'recommendations': self._generate_recommendations(risk_analysis, control_analysis)
        }
    
    def get_framework(self, framework: str) -> Dict[str, Any]:
        """Get risk assessment framework template"""
        template = self.frameworks.get(framework.lower())
        if not template:
            return {
                'error': f'Framework {framework} not found',
                'available': list(self.frameworks.keys())
            }
        return template
    
    def _analyze_risks(self, risks: List[Dict]) -> Dict[str, Any]:
        """Analyze risk portfolio"""
        if not risks:
            return {'totalRisks': 0, 'summary': 'No risks identified'}
        
        # Count by level
        by_level = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0, 'informational': 0}
        by_category = {}
        by_status = {}
        total_inherent = 0
        total_residual = 0
        
        for risk in risks:
            # By level
            level = risk.get('inherentRisk', {}).get('level') or \
                    risk.get('residualRisk', {}).get('level', 'medium')
            by_level[level] = by_level.get(level, 0) + 1
            
            # By category
            category = risk.get('category', 'other')
            if category not in by_category:
                by_category[category] = {'count': 0, 'avgScore': 0, 'scores': []}
            by_category[category]['count'] += 1
            score = risk.get('inherentRisk', {}).get('score', 50)
            by_category[category]['scores'].append(score)
            
            # By status
            status = risk.get('status', 'identified')
            by_status[status] = by_status.get(status, 0) + 1
            
            # Totals
            total_inherent += risk.get('inherentRisk', {}).get('score', 0)
            total_residual += risk.get('residualRisk', {}).get('score', 0)
        
        # Calculate averages
        for cat in by_category:
            by_category[cat]['avgScore'] = round(
                sum(by_category[cat]['scores']) / len(by_category[cat]['scores'])
            )
            del by_category[cat]['scores']
        
        avg_inherent = round(total_inherent / len(risks))
        avg_residual = round(total_residual / len(risks))
        
        # Top risks
        top_risks = sorted(
            risks,
            key=lambda x: x.get('inherentRisk', {}).get('score', 0),
            reverse=True
        )[:5]
        
        return {
            'totalRisks': len(risks),
            'byLevel': by_level,
            'byCategory': by_category,
            'byStatus': by_status,
            'averageInherentScore': avg_inherent,
            'averageResidualScore': avg_residual,
            'riskReduction': avg_inherent - avg_residual,
            'reductionPercent': round((1 - avg_residual / avg_inherent) * 100) if avg_inherent > 0 else 0,
            'topRisks': [
                {
                    'name': r.get('name'),
                    'category': r.get('category'),
                    'score': r.get('inherentRisk', {}).get('score'),
                    'level': r.get('inherentRisk', {}).get('level')
                }
                for r in top_risks
            ]
        }
    
    def _analyze_controls(self, controls: List[Dict]) -> Dict[str, Any]:
        """Analyze control framework"""
        if not controls:
            return {'totalControls': 0, 'status': 'No controls defined'}
        
        implemented = 0
        tested = 0
        total_effectiveness = 0
        by_type = {}
        
        for control in controls:
            # Implementation status
            if control.get('implementation', {}).get('status') == 'implemented':
                implemented += 1
            
            # Testing status
            if control.get('effectiveness', {}).get('rating') != 'not_tested':
                tested += 1
            
            # Effectiveness
            total_effectiveness += control.get('effectiveness', {}).get('score', 0)
            
            # By type
            ctrl_type = control.get('type', 'other')
            if ctrl_type not in by_type:
                by_type[ctrl_type] = 0
            by_type[ctrl_type] += 1
        
        return {
            'totalControls': len(controls),
            'implemented': implemented,
            'implementationRate': round(implemented / len(controls) * 100),
            'tested': tested,
            'testingRate': round(tested / len(controls) * 100),
            'averageEffectiveness': round(total_effectiveness / len(controls)),
            'byType': by_type
        }
    
    def _assess_maturity(self, assessment: Dict) -> Dict[str, Any]:
        """Assess risk management maturity"""
        score = 0
        factors = []
        
        # Methodology
        if assessment.get('methodology') in ['nist', 'iso27005', 'fair']:
            score += 15
            factors.append({'name': 'Standard methodology', 'points': 15})
        elif assessment.get('methodology'):
            score += 10
            factors.append({'name': 'Defined methodology', 'points': 10})
        
        # Scope
        scope = assessment.get('scope', {})
        if scope.get('description') and scope.get('assets'):
            score += 15
            factors.append({'name': 'Complete scope definition', 'points': 15})
        elif scope.get('description'):
            score += 10
            factors.append({'name': 'Basic scope definition', 'points': 10})
        
        # Risk appetite
        if assessment.get('riskAppetite', {}).get('thresholds'):
            score += 15
            factors.append({'name': 'Risk appetite defined', 'points': 15})
        
        # Controls
        controls = assessment.get('controls', [])
        if len(controls) >= 10:
            score += 20
            factors.append({'name': 'Comprehensive controls', 'points': 20})
        elif len(controls) >= 5:
            score += 10
            factors.append({'name': 'Basic controls', 'points': 10})
        
        # Team
        if assessment.get('team') and len(assessment.get('team', [])) >= 3:
            score += 10
            factors.append({'name': 'Full team assigned', 'points': 10})
        
        # Schedule
        if assessment.get('schedule', {}).get('frequency'):
            score += 10
            factors.append({'name': 'Regular review schedule', 'points': 10})
        
        # Determine level
        if score >= 80:
            level = 'optimized'
            description = 'Risk management is embedded in organizational culture'
        elif score >= 60:
            level = 'managed'
            description = 'Risk management processes are measured and controlled'
        elif score >= 40:
            level = 'defined'
            description = 'Risk management processes are documented and standardized'
        elif score >= 20:
            level = 'developing'
            description = 'Basic risk management practices in place'
        else:
            level = 'initial'
            description = 'Ad-hoc risk management activities'
        
        return {
            'score': score,
            'level': level,
            'description': description,
            'factors': factors,
            'nextLevel': self._get_next_level_actions(level)
        }
    
    def _generate_heat_map(self, risks: List[Dict]) -> Dict[str, Any]:
        """Generate risk heat map data"""
        matrix = [[0 for _ in range(5)] for _ in range(5)]
        
        for risk in risks:
            likelihood = risk.get('likelihood', {}).get('score', 3) - 1
            impact = risk.get('impact', {}).get('score', 3) - 1
            likelihood = max(0, min(4, likelihood))
            impact = max(0, min(4, impact))
            matrix[likelihood][impact] += 1
        
        zones = {
            'critical': sum(matrix[i][j] for i in range(3, 5) for j in range(3, 5)),
            'high': sum(matrix[i][j] for i in range(2, 5) for j in range(2, 4)) + 
                    sum(matrix[i][j] for i in range(2, 4) for j in range(2, 5)),
            'medium': sum(matrix[i][j] for i in range(1, 4) for j in range(1, 4)),
            'low': sum(matrix[i][j] for i in range(0, 3) for j in range(0, 3))
        }
        
        return {
            'matrix': matrix,
            'zones': zones,
            'labels': {
                'likelihood': ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'],
                'impact': ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic']
            }
        }
    
    def _analyze_trends(self, risks: List[Dict]) -> Dict[str, Any]:
        """Analyze risk trends (simulated)"""
        # In production, this would analyze historical data
        return {
            'overallTrend': 'stable',
            'riskCount': {
                'current': len(risks),
                'previousPeriod': len(risks) + 2,
                'change': -2,
                'trend': 'improving'
            },
            'averageScore': {
                'current': sum(r.get('inherentRisk', {}).get('score', 50) for r in risks) / max(len(risks), 1),
                'trend': 'stable'
            }
        }
    
    def _generate_insights(self, risk_analysis: Dict, control_analysis: Dict) -> List[Dict]:
        """Generate assessment insights"""
        insights = []
        
        # Risk concentration
        by_level = risk_analysis.get('byLevel', {})
        critical_high = by_level.get('critical', 0) + by_level.get('high', 0)
        total = risk_analysis.get('totalRisks', 0)
        
        if total > 0 and critical_high / total > 0.5:
            insights.append({
                'type': 'warning',
                'title': 'High Risk Concentration',
                'message': f'{round(critical_high / total * 100)}% of risks are critical or high',
                'action': 'Prioritize risk treatment activities'
            })
        
        # Control effectiveness
        avg_effectiveness = control_analysis.get('averageEffectiveness', 0)
        if avg_effectiveness < 50:
            insights.append({
                'type': 'warning',
                'title': 'Low Control Effectiveness',
                'message': f'Average control effectiveness is only {avg_effectiveness}%',
                'action': 'Review and improve control implementation'
            })
        
        # Risk reduction
        reduction = risk_analysis.get('reductionPercent', 0)
        if reduction > 30:
            insights.append({
                'type': 'success',
                'title': 'Good Risk Reduction',
                'message': f'Controls have reduced risk by {reduction}%',
                'action': 'Maintain current control framework'
            })
        
        return insights
    
    def _generate_recommendations(self, risk_analysis: Dict, control_analysis: Dict) -> List[str]:
        """Generate action recommendations"""
        recommendations = []
        
        # Based on top risks
        top_risks = risk_analysis.get('topRisks', [])
        if top_risks:
            recommendations.append(f'Focus on treating top {len(top_risks)} high-impact risks')
        
        # Based on control gaps
        if control_analysis.get('implementationRate', 100) < 80:
            recommendations.append('Complete implementation of planned controls')
        
        if control_analysis.get('testingRate', 100) < 50:
            recommendations.append('Schedule control effectiveness testing')
        
        # Based on categories
        by_category = risk_analysis.get('byCategory', {})
        high_cat = max(by_category.items(), key=lambda x: x[1]['avgScore'])[0] if by_category else None
        if high_cat:
            recommendations.append(f'Priority: Address {high_cat} category risks')
        
        return recommendations
    
    def _get_next_level_actions(self, current_level: str) -> List[str]:
        """Get actions to reach next maturity level"""
        actions = {
            'initial': [
                'Establish formal risk assessment process',
                'Define risk management roles',
                'Create basic risk register'
            ],
            'developing': [
                'Document risk management procedures',
                'Implement standard methodology',
                'Train risk management team'
            ],
            'defined': [
                'Implement risk metrics and KRIs',
                'Automate risk monitoring',
                'Integrate with business processes'
            ],
            'managed': [
                'Optimize risk treatment strategies',
                'Implement predictive analytics',
                'Embed risk culture'
            ],
            'optimized': [
                'Maintain excellence',
                'Share best practices',
                'Continuous improvement'
            ]
        }
        return actions.get(current_level, [])
    
    def _load_frameworks(self) -> Dict[str, Any]:
        """Load framework templates"""
        return {
            'nist': {
                'name': 'NIST Risk Management Framework',
                'version': 'SP 800-37 Rev 2',
                'phases': ['Prepare', 'Categorize', 'Select', 'Implement', 'Assess', 'Authorize', 'Monitor'],
                'riskCategories': ['Confidentiality', 'Integrity', 'Availability'],
                'impactLevels': ['Low', 'Moderate', 'High'],
                'controlFamilies': [
                    'Access Control', 'Awareness Training', 'Audit', 'Configuration Management',
                    'Contingency Planning', 'Identification', 'Incident Response', 'Maintenance'
                ]
            },
            'iso27005': {
                'name': 'ISO/IEC 27005',
                'version': '2022',
                'phases': ['Context Establishment', 'Risk Identification', 'Risk Analysis', 
                          'Risk Evaluation', 'Risk Treatment', 'Monitoring Review'],
                'riskCategories': ['Strategic', 'Operational', 'Compliance', 'Financial'],
                'treatmentOptions': ['Modify', 'Retain', 'Avoid', 'Share']
            },
            'fair': {
                'name': 'Factor Analysis of Information Risk',
                'version': '3.0',
                'components': {
                    'lef': ['Threat Event Frequency', 'Contact Frequency', 'Probability of Action', 'Vulnerability'],
                    'lm': ['Primary Loss', 'Secondary Loss', 'Asset Value', 'Threat Capability']
                },
                'lossTypes': ['Productivity', 'Response', 'Replacement', 'Competitive Advantage', 
                             'Fines', 'Reputation']
            },
            'octave': {
                'name': 'OCTAVE Allegro',
                'phases': [
                    'Establish Drivers', 'Profile Assets', 'Identify Threats',
                    'Identify Vulnerabilities', 'Identify Risks', 'Analyze Risks',
                    'Select Mitigation', 'Develop Implementation'
                ],
                'assetTypes': ['Information', 'Systems', 'Applications', 'People']
            }
        }
