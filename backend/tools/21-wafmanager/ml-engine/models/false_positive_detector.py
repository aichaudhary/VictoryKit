"""
False Positive Detector - Identifies potential false positive blocks
"""

from typing import List, Dict, Any
from collections import defaultdict
import re


class FalsePositiveDetector:
    def __init__(self):
        # Common false positive patterns
        self.safe_patterns = {
            'user_agent': [
                r'googlebot',
                r'bingbot',
                r'chrome',
                r'firefox',
                r'safari'
            ],
            'uri': [
                r'^/api/v\d+/',
                r'^/static/',
                r'^/assets/',
                r'\.js$',
                r'\.css$'
            ]
        }
        
        self.suspicious_but_valid = [
            'SELECT',
            'FROM',
            'WHERE',
            'ORDER BY',
            '<script',
            'javascript:'
        ]
    
    def analyze(self, events: List[Any]) -> Dict[str, Any]:
        """Analyze events for false positives"""
        events_data = [e.dict() if hasattr(e, 'dict') else e for e in events]
        
        potential_fps = []
        by_rule = defaultdict(list)
        by_category = defaultdict(list)
        
        for event in events_data:
            # Check each blocked event
            if event.get('action') != 'blocked':
                continue
            
            fp_score = self._calculate_fp_score(event)
            
            if fp_score > 0.5:
                potential_fps.append({
                    'event_id': event.get('event_id'),
                    'fp_score': round(fp_score, 3),
                    'reasons': self._get_fp_reasons(event),
                    'request_sample': {
                        'ip': event.get('request', {}).get('ip'),
                        'uri': event.get('request', {}).get('uri'),
                        'method': event.get('request', {}).get('method')
                    }
                })
            
            # Group by rule
            for matched in event.get('matched_rules', []):
                by_rule[matched.get('ruleId', 'unknown')].append(event)
            
            # Group by category
            by_category[event.get('category', 'unknown')].append(event)
        
        # Analyze rules with high FP rates
        rule_analysis = []
        for rule_id, rule_events in by_rule.items():
            fp_count = sum(1 for e in rule_events if self._calculate_fp_score(e) > 0.5)
            fp_rate = fp_count / len(rule_events) if rule_events else 0
            
            if fp_rate > 0.3:
                rule_analysis.append({
                    'rule_id': rule_id,
                    'total_blocks': len(rule_events),
                    'potential_fps': fp_count,
                    'fp_rate': round(fp_rate, 3),
                    'recommendation': 'Review and tune rule' if fp_rate > 0.5 else 'Monitor closely'
                })
        
        return {
            'analyzed_events': len(events_data),
            'potential_false_positives': potential_fps[:50],  # Limit output
            'fp_count': len(potential_fps),
            'fp_rate': round(len(potential_fps) / max(len(events_data), 1), 3),
            'rule_analysis': sorted(rule_analysis, key=lambda x: x['fp_rate'], reverse=True),
            'category_breakdown': {cat: len(evts) for cat, evts in by_category.items()},
            'recommendations': self._generate_recommendations(potential_fps, rule_analysis)
        }
    
    def _calculate_fp_score(self, event: Dict) -> float:
        """Calculate false positive likelihood score"""
        score = 0.0
        factors = 0
        
        request = event.get('request', {})
        
        # Check user agent
        user_agent = request.get('userAgent', '').lower()
        for pattern in self.safe_patterns['user_agent']:
            if re.search(pattern, user_agent):
                score += 0.3
                factors += 1
                break
        
        # Check URI
        uri = request.get('uri', '')
        for pattern in self.safe_patterns['uri']:
            if re.search(pattern, uri):
                score += 0.2
                factors += 1
                break
        
        # Check if it's a common method
        method = request.get('method', '')
        if method in ['GET', 'HEAD', 'OPTIONS']:
            score += 0.1
            factors += 1
        
        # Check risk score if available
        risk_score = event.get('risk_score', 50)
        if risk_score < 30:
            score += 0.3
            factors += 1
        
        # Normalize
        return min(score, 1.0)
    
    def _get_fp_reasons(self, event: Dict) -> List[str]:
        """Get reasons why this might be a false positive"""
        reasons = []
        request = event.get('request', {})
        
        user_agent = request.get('userAgent', '').lower()
        for pattern in self.safe_patterns['user_agent']:
            if re.search(pattern, user_agent):
                reasons.append(f'Legitimate user agent detected: {pattern}')
                break
        
        uri = request.get('uri', '')
        for pattern in self.safe_patterns['uri']:
            if re.search(pattern, uri):
                reasons.append(f'Common static/API path: {uri[:50]}')
                break
        
        if event.get('risk_score', 50) < 30:
            reasons.append('Low risk score')
        
        return reasons
    
    def _generate_recommendations(self, fps: List[Dict], rule_analysis: List[Dict]) -> List[Dict]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if len(fps) > 10:
            recommendations.append({
                'priority': 'high',
                'type': 'review',
                'message': f'{len(fps)} potential false positives detected - manual review recommended'
            })
        
        high_fp_rules = [r for r in rule_analysis if r['fp_rate'] > 0.5]
        if high_fp_rules:
            recommendations.append({
                'priority': 'high',
                'type': 'tune_rules',
                'message': f'{len(high_fp_rules)} rules have >50% false positive rate',
                'rules': [r['rule_id'] for r in high_fp_rules]
            })
        
        return recommendations
