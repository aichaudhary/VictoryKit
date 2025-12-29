"""
Anomaly Detector
Detects anomalies in audit log patterns
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import Counter
import statistics


class AnomalyDetector:
    """Detects anomalies in audit logs."""
    
    def __init__(self):
        self.anomaly_types = [
            'UNUSUAL_TIME',
            'UNUSUAL_LOCATION',
            'UNUSUAL_FREQUENCY',
            'UNUSUAL_PATTERN',
            'FAILED_ATTEMPTS',
            'PRIVILEGE_ESCALATION',
            'DATA_EXFILTRATION'
        ]
    
    def detect(self, logs: List[Dict], baseline: Optional[Dict] = None, 
               sensitivity: float = 0.7) -> List[Dict]:
        """Detect anomalies in logs."""
        anomalies = []
        
        # Build baseline if not provided
        if not baseline:
            baseline = self._build_baseline(logs)
        
        # Group logs by actor
        actor_logs = {}
        for log in logs:
            actor_id = log.get('actor', {}).get('id', 'unknown')
            if actor_id not in actor_logs:
                actor_logs[actor_id] = []
            actor_logs[actor_id].append(log)
        
        # Check for various anomaly types
        anomalies.extend(self._detect_time_anomalies(logs, baseline, sensitivity))
        anomalies.extend(self._detect_frequency_anomalies(actor_logs, baseline, sensitivity))
        anomalies.extend(self._detect_failed_attempt_anomalies(actor_logs, sensitivity))
        anomalies.extend(self._detect_privilege_anomalies(logs))
        
        return anomalies
    
    def _build_baseline(self, logs: List[Dict]) -> Dict:
        """Build a baseline from logs."""
        if not logs:
            return {}
        
        # Calculate hourly activity baseline
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
        
        # Calculate actor activity baseline
        actor_counts = Counter(
            log.get('actor', {}).get('id', 'unknown') for log in logs
        )
        
        avg_per_actor = statistics.mean(actor_counts.values()) if actor_counts else 0
        std_per_actor = statistics.stdev(actor_counts.values()) if len(actor_counts) > 1 else 0
        
        return {
            'hourlyActivity': dict(hours),
            'averageActorActivity': avg_per_actor,
            'stdActorActivity': std_per_actor,
            'normalHours': [h for h in range(6, 22)],  # 6 AM to 10 PM
            'totalLogs': len(logs)
        }
    
    def _detect_time_anomalies(self, logs: List[Dict], baseline: Dict, 
                               sensitivity: float) -> List[Dict]:
        """Detect unusual time-based activity."""
        anomalies = []
        normal_hours = baseline.get('normalHours', list(range(6, 22)))
        
        for log in logs:
            timestamp = log.get('timestamp')
            if not timestamp:
                continue
            
            try:
                if isinstance(timestamp, str):
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                else:
                    dt = timestamp
                
                if dt.hour not in normal_hours:
                    # Higher sensitivity = more strict
                    if sensitivity > 0.5:
                        anomalies.append({
                            'type': 'UNUSUAL_TIME',
                            'logId': log.get('logId'),
                            'description': f'Activity at unusual hour ({dt.hour}:00)',
                            'severity': 'medium' if dt.hour in [5, 22, 23] else 'high',
                            'log': log,
                            'confidence': 0.7 + (sensitivity * 0.2)
                        })
            except (ValueError, TypeError):
                pass
        
        return anomalies
    
    def _detect_frequency_anomalies(self, actor_logs: Dict, baseline: Dict,
                                    sensitivity: float) -> List[Dict]:
        """Detect unusual activity frequency."""
        anomalies = []
        
        avg = baseline.get('averageActorActivity', 10)
        std = baseline.get('stdActorActivity', 5)
        threshold = avg + (std * (2 - sensitivity))  # Higher sensitivity = lower threshold
        
        for actor_id, logs in actor_logs.items():
            if len(logs) > threshold:
                anomalies.append({
                    'type': 'UNUSUAL_FREQUENCY',
                    'actorId': actor_id,
                    'description': f'Actor has {len(logs)} actions (threshold: {threshold:.0f})',
                    'severity': 'high' if len(logs) > threshold * 2 else 'medium',
                    'count': len(logs),
                    'threshold': threshold,
                    'confidence': min(0.9, 0.6 + (len(logs) / threshold - 1) * 0.3)
                })
        
        return anomalies
    
    def _detect_failed_attempt_anomalies(self, actor_logs: Dict,
                                         sensitivity: float) -> List[Dict]:
        """Detect unusual failed attempt patterns."""
        anomalies = []
        failure_threshold = 5 if sensitivity > 0.7 else 10
        
        for actor_id, logs in actor_logs.items():
            failures = [log for log in logs if log.get('status') == 'failure']
            
            if len(failures) >= failure_threshold:
                # Check if failures are consecutive or within short timeframe
                anomalies.append({
                    'type': 'FAILED_ATTEMPTS',
                    'actorId': actor_id,
                    'description': f'Actor has {len(failures)} failed attempts',
                    'severity': 'critical' if len(failures) > failure_threshold * 2 else 'high',
                    'failureCount': len(failures),
                    'confidence': min(0.95, 0.7 + len(failures) * 0.02)
                })
        
        return anomalies
    
    def _detect_privilege_anomalies(self, logs: List[Dict]) -> List[Dict]:
        """Detect privilege escalation patterns."""
        anomalies = []
        
        privilege_keywords = ['admin', 'privilege', 'escalate', 'role', 'permission', 'grant']
        
        for log in logs:
            action = log.get('action', '').lower()
            event_type = log.get('eventType', '')
            
            # Check for privilege-related actions
            if any(kw in action for kw in privilege_keywords):
                if event_type == 'admin' or log.get('status') != 'failure':
                    anomalies.append({
                        'type': 'PRIVILEGE_ESCALATION',
                        'logId': log.get('logId'),
                        'description': f'Privilege-related action: {log.get("action")}',
                        'severity': 'high',
                        'log': log,
                        'confidence': 0.8
                    })
        
        return anomalies
