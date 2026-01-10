"""
Log Analyzer
Analyzes audit logs for insights and risk assessment
"""

from typing import Dict, List, Any
from datetime import datetime
from collections import Counter


class LogAnalyzer:
    """Analyzes audit logs for security insights."""
    
    def __init__(self):
        self.risk_weights = {
            'authentication': {'failure': 20, 'blocked': 30},
            'authorization': {'failure': 25, 'blocked': 35},
            'data_modification': {'success': 10, 'failure': 20},
            'admin': {'success': 15, 'failure': 30},
            'security': {'success': 10, 'failure': 40}
        }
    
    def analyze(self, logs: List[Dict]) -> Dict:
        """Analyze a batch of logs."""
        if not logs:
            return {"error": "No logs provided"}
        
        # Basic statistics
        event_types = Counter(log.get('eventType', 'unknown') for log in logs)
        statuses = Counter(log.get('status', 'unknown') for log in logs)
        actors = Counter(log.get('actor', {}).get('id', 'unknown') for log in logs)
        
        # Risk analysis
        high_risk_logs = [log for log in logs if self._calculate_risk(log) > 50]
        
        # Time analysis
        time_distribution = self._analyze_time_distribution(logs)
        
        return {
            "summary": {
                "totalLogs": len(logs),
                "uniqueActors": len(actors),
                "highRiskLogs": len(high_risk_logs)
            },
            "distribution": {
                "byEventType": dict(event_types),
                "byStatus": dict(statuses),
                "topActors": dict(actors.most_common(10))
            },
            "timeAnalysis": time_distribution,
            "riskSummary": {
                "highRiskCount": len(high_risk_logs),
                "averageRisk": sum(self._calculate_risk(log) for log in logs) / len(logs)
            }
        }
    
    def analyze_user_behavior(self, logs: List[Dict]) -> Dict:
        """Analyze user behavior patterns."""
        user_activity = {}
        
        for log in logs:
            actor_id = log.get('actor', {}).get('id', 'unknown')
            
            if actor_id not in user_activity:
                user_activity[actor_id] = {
                    'name': log.get('actor', {}).get('name'),
                    'actions': [],
                    'resources': set(),
                    'failures': 0,
                    'timestamps': []
                }
            
            user_activity[actor_id]['actions'].append(log.get('action'))
            if log.get('resource', {}).get('type'):
                user_activity[actor_id]['resources'].add(log.get('resource', {}).get('type'))
            if log.get('status') == 'failure':
                user_activity[actor_id]['failures'] += 1
            user_activity[actor_id]['timestamps'].append(log.get('timestamp'))
        
        # Analyze patterns for each user
        behavior_analysis = []
        for user_id, activity in user_activity.items():
            analysis = {
                'userId': user_id,
                'name': activity['name'],
                'totalActions': len(activity['actions']),
                'uniqueActions': len(set(activity['actions'])),
                'resourcesAccessed': list(activity['resources']),
                'failureRate': activity['failures'] / len(activity['actions']) if activity['actions'] else 0,
                'riskIndicators': []
            }
            
            # Check for risk indicators
            if analysis['failureRate'] > 0.2:
                analysis['riskIndicators'].append('HIGH_FAILURE_RATE')
            if len(activity['resources']) > 10:
                analysis['riskIndicators'].append('BROAD_RESOURCE_ACCESS')
            
            behavior_analysis.append(analysis)
        
        return {
            'users': behavior_analysis,
            'totalUsers': len(user_activity)
        }
    
    def predict_risk(self, log: Dict) -> Dict:
        """Predict risk level for a log entry."""
        risk_score = self._calculate_risk(log)
        
        factors = []
        
        # Check event type risk
        event_type = log.get('eventType', '')
        if event_type in ['admin', 'security']:
            factors.append({'factor': 'SENSITIVE_EVENT_TYPE', 'weight': 15})
        
        # Check status
        if log.get('status') == 'failure':
            factors.append({'factor': 'FAILED_ACTION', 'weight': 20})
        elif log.get('status') == 'blocked':
            factors.append({'factor': 'BLOCKED_ACTION', 'weight': 25})
        
        # Check action
        action = log.get('action', '').lower()
        if any(word in action for word in ['delete', 'admin', 'privilege', 'escalate']):
            factors.append({'factor': 'HIGH_RISK_ACTION', 'weight': 20})
        
        # Determine level
        if risk_score >= 60:
            level = 'critical'
        elif risk_score >= 40:
            level = 'high'
        elif risk_score >= 20:
            level = 'medium'
        else:
            level = 'low'
        
        return {
            'riskScore': risk_score,
            'riskLevel': level,
            'factors': factors,
            'recommendation': self._get_risk_recommendation(level)
        }
    
    def _calculate_risk(self, log: Dict) -> int:
        """Calculate risk score for a log."""
        risk = 0
        
        event_type = log.get('eventType', '')
        status = log.get('status', 'success')
        
        # Event type and status based risk
        if event_type in self.risk_weights:
            risk += self.risk_weights[event_type].get(status, 0)
        
        # Action based risk
        action = log.get('action', '').lower()
        if 'delete' in action:
            risk += 15
        if 'admin' in action:
            risk += 10
        if 'privilege' in action or 'escalate' in action:
            risk += 20
        
        # Resource sensitivity
        resource_type = log.get('resource', {}).get('type', '').lower()
        sensitive_resources = ['secrets', 'credentials', 'keys', 'admin', 'pii']
        if any(s in resource_type for s in sensitive_resources):
            risk += 15
        
        return min(risk, 100)
    
    def _analyze_time_distribution(self, logs: List[Dict]) -> Dict:
        """Analyze time distribution of logs."""
        hours = Counter()
        
        for log in logs:
            timestamp = log.get('timestamp')
            if timestamp:
                try:
                    if isinstance(timestamp, str):
                        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    else:
                        dt = timestamp
                    hours[dt.hour] += 1
                except (ValueError, TypeError):
                    pass
        
        # Find peak hours
        peak_hours = [h for h, c in hours.most_common(3)]
        off_hours = [h for h in hours if h < 6 or h > 22]
        
        return {
            'byHour': dict(hours),
            'peakHours': peak_hours,
            'offHoursActivity': sum(hours[h] for h in off_hours)
        }
    
    def _get_risk_recommendation(self, level: str) -> str:
        """Get recommendation based on risk level."""
        recommendations = {
            'critical': 'Immediate investigation required. Consider blocking access.',
            'high': 'Investigate within 1 hour. Review related activities.',
            'medium': 'Review within 24 hours. Monitor for patterns.',
            'low': 'Standard monitoring. No immediate action required.'
        }
        return recommendations.get(level, 'Monitor activity.')
