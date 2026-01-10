"""Risk Scoring Engine"""

from typing import Dict, Any, List
import math


class RiskScorer:
    """Calculate and analyze risk scores"""
    
    def __init__(self):
        self.likelihood_weights = {
            'rare': 1, 'unlikely': 2, 'possible': 3, 'likely': 4, 'almost_certain': 5
        }
        self.impact_weights = {
            'negligible': 1, 'minor': 2, 'moderate': 3, 'major': 4, 'catastrophic': 5
        }
    
    def calculate_score(self, risk: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate inherent and residual risk scores"""
        likelihood = risk.get('likelihood', {})
        impact = risk.get('impact', {})
        controls = risk.get('controls', [])
        
        # Get scores
        likelihood_score = likelihood.get('score') or \
            self.likelihood_weights.get(likelihood.get('level'), 3)
        impact_score = impact.get('score') or \
            self.impact_weights.get(impact.get('level'), 3)
        
        # Calculate inherent risk (0-100 scale)
        inherent_score = round((likelihood_score * impact_score) / 25 * 100)
        inherent_level = self._get_level(inherent_score)
        
        # Calculate residual risk
        if controls:
            avg_effectiveness = sum(
                c.get('effectiveness', 50) for c in controls
            ) / len(controls)
            residual_score = round(inherent_score * (1 - avg_effectiveness / 100))
        else:
            residual_score = inherent_score
        
        residual_level = self._get_level(residual_score)
        
        # Calculate composite impact
        impact_areas = impact.get('areas', {})
        composite_impact = self._calculate_composite_impact(impact_areas)
        
        return {
            'riskName': risk.get('name'),
            'category': risk.get('category'),
            'inherentRisk': {
                'score': inherent_score,
                'level': inherent_level,
                'likelihood': likelihood_score,
                'impact': impact_score
            },
            'residualRisk': {
                'score': residual_score,
                'level': residual_level
            },
            'controlEffectiveness': avg_effectiveness if controls else 0,
            'compositeImpact': composite_impact,
            'matrix': {
                'x': likelihood_score,
                'y': impact_score,
                'zone': inherent_level
            },
            'recommendation': self._get_recommendation(inherent_level, residual_level)
        }
    
    def predict_residual(self, risk: Dict, controls: List[Dict]) -> Dict[str, Any]:
        """Predict residual risk with proposed controls"""
        inherent = risk.get('inherentRisk', {})
        inherent_score = inherent.get('score', 50)
        
        predictions = []
        
        # Calculate for each control combination
        for i, control in enumerate(controls):
            effectiveness = control.get('effectiveness', {}).get('score', 50)
            predicted_residual = round(inherent_score * (1 - effectiveness / 100))
            
            predictions.append({
                'controlName': control.get('name'),
                'effectiveness': effectiveness,
                'predictedResidual': predicted_residual,
                'reduction': inherent_score - predicted_residual,
                'reductionPercent': round((1 - predicted_residual / inherent_score) * 100)
            })
        
        # Cumulative effect
        if controls:
            cumulative_effectiveness = 1 - math.prod(
                1 - c.get('effectiveness', {}).get('score', 50) / 100 
                for c in controls
            )
            cumulative_residual = round(inherent_score * (1 - cumulative_effectiveness))
        else:
            cumulative_effectiveness = 0
            cumulative_residual = inherent_score
        
        return {
            'inherentRisk': inherent_score,
            'predictions': predictions,
            'cumulative': {
                'effectiveness': round(cumulative_effectiveness * 100),
                'residualScore': cumulative_residual,
                'residualLevel': self._get_level(cumulative_residual),
                'totalReduction': inherent_score - cumulative_residual
            }
        }
    
    def simulate_treatments(self, risk: Dict, scenarios: List[Dict]) -> Dict[str, Any]:
        """Simulate different treatment scenarios"""
        inherent_score = risk.get('inherentRisk', {}).get('score', 50)
        
        results = []
        for scenario in scenarios:
            strategy = scenario.get('strategy', 'mitigate')
            
            if strategy == 'accept':
                residual = inherent_score
                cost = 0
            elif strategy == 'avoid':
                residual = 0
                cost = scenario.get('cost', 1000000)
            elif strategy == 'transfer':
                residual = round(inherent_score * 0.2)
                cost = scenario.get('cost', 50000)
            else:  # mitigate
                effectiveness = scenario.get('expectedEffectiveness', 50)
                residual = round(inherent_score * (1 - effectiveness / 100))
                cost = scenario.get('cost', 25000)
            
            roi = (inherent_score - residual) / max(cost, 1) * 10000
            
            results.append({
                'scenario': scenario.get('name', strategy),
                'strategy': strategy,
                'inherentScore': inherent_score,
                'residualScore': residual,
                'riskReduction': inherent_score - residual,
                'cost': cost,
                'roi': round(roi, 2),
                'recommendation': 'Recommended' if roi > 1 else 'Consider alternatives'
            })
        
        # Sort by ROI
        results.sort(key=lambda x: x['roi'], reverse=True)
        
        return {
            'risk': risk.get('name'),
            'scenarios': results,
            'bestOption': results[0] if results else None
        }
    
    def aggregate_risks(self, risks: List[Dict], method: str = 'weighted_average') -> Dict[str, Any]:
        """Calculate aggregate risk score"""
        if not risks:
            return {'aggregateScore': 0, 'level': 'informational', 'count': 0}
        
        scores = []
        weights = []
        
        for risk in risks:
            score = risk.get('residualRisk', {}).get('score') or \
                    risk.get('inherentRisk', {}).get('score', 50)
            scores.append(score)
            
            # Weight by impact
            impact = risk.get('impact', {}).get('score', 3)
            weights.append(impact)
        
        if method == 'max':
            aggregate = max(scores)
        elif method == 'average':
            aggregate = sum(scores) / len(scores)
        elif method == 'weighted_average':
            aggregate = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
        elif method == 'root_sum_square':
            aggregate = min(100, math.sqrt(sum(s ** 2 for s in scores)))
        else:
            aggregate = sum(scores) / len(scores)
        
        aggregate = round(aggregate)
        
        distribution = {
            'critical': len([s for s in scores if s >= 80]),
            'high': len([s for s in scores if 60 <= s < 80]),
            'medium': len([s for s in scores if 40 <= s < 60]),
            'low': len([s for s in scores if 20 <= s < 40]),
            'informational': len([s for s in scores if s < 20])
        }
        
        return {
            'aggregateScore': aggregate,
            'level': self._get_level(aggregate),
            'method': method,
            'count': len(risks),
            'distribution': distribution,
            'statistics': {
                'min': min(scores),
                'max': max(scores),
                'average': round(sum(scores) / len(scores)),
                'median': sorted(scores)[len(scores) // 2]
            }
        }
    
    def _get_level(self, score: int) -> str:
        """Get risk level from score"""
        if score >= 80:
            return 'critical'
        elif score >= 60:
            return 'high'
        elif score >= 40:
            return 'medium'
        elif score >= 20:
            return 'low'
        return 'informational'
    
    def _calculate_composite_impact(self, areas: Dict[str, int]) -> Dict[str, Any]:
        """Calculate composite impact across areas"""
        if not areas:
            return {'score': 0, 'primary': 'none'}
        
        weights = {
            'financial': 1.2,
            'operational': 1.0,
            'reputational': 0.9,
            'compliance': 1.1,
            'safety': 1.3
        }
        
        weighted_sum = sum(
            areas.get(area, 0) * weights.get(area, 1.0) 
            for area in weights
        )
        
        max_possible = sum(5 * w for w in weights.values())
        composite = round(weighted_sum / max_possible * 100)
        
        # Find primary impact area
        primary = max(areas.items(), key=lambda x: x[1])[0] if areas else 'none'
        
        return {
            'score': composite,
            'primary': primary,
            'areas': areas
        }
    
    def _get_recommendation(self, inherent: str, residual: str) -> str:
        """Get treatment recommendation"""
        if inherent == 'critical' and residual in ['critical', 'high']:
            return 'Urgent: Additional controls required immediately'
        elif inherent == 'critical' and residual in ['medium', 'low']:
            return 'Good progress but continue monitoring'
        elif inherent == 'high' and residual in ['high', 'critical']:
            return 'Priority: Implement planned treatments'
        elif inherent == 'high' and residual in ['medium', 'low']:
            return 'Adequate controls in place'
        elif inherent == 'medium':
            return 'Standard monitoring and periodic review'
        return 'Accept and document'
