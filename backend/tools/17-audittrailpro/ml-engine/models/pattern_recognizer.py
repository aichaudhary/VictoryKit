"""
Pattern Recognizer
Recognizes patterns and sequences in audit logs
"""

from typing import Dict, List, Optional
from collections import Counter, defaultdict


class PatternRecognizer:
    """Recognizes patterns in audit logs."""
    
    def __init__(self):
        self.known_patterns = {
            'brute_force': {
                'description': 'Multiple failed authentication attempts',
                'indicators': ['authentication', 'failure'],
                'threshold': 5
            },
            'data_exfiltration': {
                'description': 'Large volume of data access',
                'indicators': ['data_access', 'success'],
                'threshold': 50
            },
            'privilege_abuse': {
                'description': 'Unusual administrative actions',
                'indicators': ['admin', 'success'],
                'threshold': 10
            },
            'account_compromise': {
                'description': 'Multiple failed attempts followed by success',
                'indicators': ['authentication'],
                'threshold': 1
            }
        }
    
    def detect(self, logs: List[Dict], pattern_types: Optional[List[str]] = None) -> List[Dict]:
        """Detect patterns in logs."""
        patterns = []
        
        types_to_check = pattern_types or list(self.known_patterns.keys())
        
        for pattern_type in types_to_check:
            if pattern_type not in self.known_patterns:
                continue
            
            detected = self._detect_pattern(logs, pattern_type)
            patterns.extend(detected)
        
        # Also detect action sequences
        sequences = self._detect_sequences(logs)
        patterns.extend(sequences)
        
        return patterns
    
    def _detect_pattern(self, logs: List[Dict], pattern_type: str) -> List[Dict]:
        """Detect a specific pattern type."""
        patterns = []
        pattern_def = self.known_patterns[pattern_type]
        
        # Group logs by actor
        actor_logs = defaultdict(list)
        for log in logs:
            actor_id = log.get('actor', {}).get('id', 'unknown')
            actor_logs[actor_id].append(log)
        
        for actor_id, actor_log_list in actor_logs.items():
            if pattern_type == 'brute_force':
                patterns.extend(self._detect_brute_force(actor_id, actor_log_list, pattern_def))
            elif pattern_type == 'data_exfiltration':
                patterns.extend(self._detect_data_exfiltration(actor_id, actor_log_list, pattern_def))
            elif pattern_type == 'privilege_abuse':
                patterns.extend(self._detect_privilege_abuse(actor_id, actor_log_list, pattern_def))
            elif pattern_type == 'account_compromise':
                patterns.extend(self._detect_account_compromise(actor_id, actor_log_list, pattern_def))
        
        return patterns
    
    def _detect_brute_force(self, actor_id: str, logs: List[Dict], 
                           pattern_def: Dict) -> List[Dict]:
        """Detect brute force patterns."""
        patterns = []
        
        auth_failures = [
            log for log in logs 
            if log.get('eventType') == 'authentication' and log.get('status') == 'failure'
        ]
        
        if len(auth_failures) >= pattern_def['threshold']:
            patterns.append({
                'type': 'brute_force',
                'actorId': actor_id,
                'description': pattern_def['description'],
                'severity': 'critical' if len(auth_failures) > 10 else 'high',
                'occurrences': len(auth_failures),
                'logs': [log.get('logId') for log in auth_failures[:10]],
                'confidence': min(0.95, 0.7 + len(auth_failures) * 0.02)
            })
        
        return patterns
    
    def _detect_data_exfiltration(self, actor_id: str, logs: List[Dict],
                                  pattern_def: Dict) -> List[Dict]:
        """Detect data exfiltration patterns."""
        patterns = []
        
        data_accesses = [
            log for log in logs 
            if log.get('eventType') == 'data_access' and log.get('status') == 'success'
        ]
        
        if len(data_accesses) >= pattern_def['threshold']:
            # Check for variety of resources
            resources = set(log.get('resource', {}).get('type') for log in data_accesses)
            
            patterns.append({
                'type': 'data_exfiltration',
                'actorId': actor_id,
                'description': pattern_def['description'],
                'severity': 'critical' if len(resources) > 5 else 'high',
                'occurrences': len(data_accesses),
                'uniqueResources': len(resources),
                'confidence': min(0.9, 0.6 + len(data_accesses) / 100)
            })
        
        return patterns
    
    def _detect_privilege_abuse(self, actor_id: str, logs: List[Dict],
                               pattern_def: Dict) -> List[Dict]:
        """Detect privilege abuse patterns."""
        patterns = []
        
        admin_actions = [
            log for log in logs 
            if log.get('eventType') == 'admin' and log.get('status') == 'success'
        ]
        
        if len(admin_actions) >= pattern_def['threshold']:
            patterns.append({
                'type': 'privilege_abuse',
                'actorId': actor_id,
                'description': pattern_def['description'],
                'severity': 'high',
                'occurrences': len(admin_actions),
                'actions': [log.get('action') for log in admin_actions[:10]],
                'confidence': 0.75
            })
        
        return patterns
    
    def _detect_account_compromise(self, actor_id: str, logs: List[Dict],
                                   pattern_def: Dict) -> List[Dict]:
        """Detect account compromise patterns (failures followed by success)."""
        patterns = []
        
        auth_logs = [log for log in logs if log.get('eventType') == 'authentication']
        
        # Sort by timestamp
        try:
            sorted_logs = sorted(auth_logs, key=lambda x: x.get('timestamp', ''))
        except (TypeError, ValueError):
            sorted_logs = auth_logs
        
        # Look for pattern: failures followed by success
        failure_count = 0
        for log in sorted_logs:
            if log.get('status') == 'failure':
                failure_count += 1
            elif log.get('status') == 'success' and failure_count >= 3:
                patterns.append({
                    'type': 'account_compromise',
                    'actorId': actor_id,
                    'description': f'{failure_count} failed attempts followed by successful login',
                    'severity': 'critical',
                    'failedAttempts': failure_count,
                    'successLogId': log.get('logId'),
                    'confidence': min(0.9, 0.7 + failure_count * 0.03)
                })
                failure_count = 0
        
        return patterns
    
    def _detect_sequences(self, logs: List[Dict]) -> List[Dict]:
        """Detect action sequences."""
        patterns = []
        
        # Group by actor
        actor_logs = defaultdict(list)
        for log in logs:
            actor_id = log.get('actor', {}).get('id', 'unknown')
            actor_logs[actor_id].append(log)
        
        for actor_id, actor_log_list in actor_logs.items():
            # Sort by timestamp
            try:
                sorted_logs = sorted(actor_log_list, key=lambda x: x.get('timestamp', ''))
            except (TypeError, ValueError):
                sorted_logs = actor_log_list
            
            # Extract action sequence
            actions = [log.get('action', 'unknown') for log in sorted_logs]
            
            # Find repeated sequences
            sequences = self._find_repeated_sequences(actions)
            for seq, count in sequences.items():
                if count >= 3:
                    patterns.append({
                        'type': 'repeated_sequence',
                        'actorId': actor_id,
                        'description': f'Repeated action sequence detected',
                        'sequence': list(seq),
                        'occurrences': count,
                        'severity': 'medium',
                        'confidence': 0.6
                    })
        
        return patterns
    
    def _find_repeated_sequences(self, actions: List[str], min_length: int = 2, 
                                 max_length: int = 5) -> Dict:
        """Find repeated sequences in actions."""
        sequences = Counter()
        
        for length in range(min_length, min(max_length + 1, len(actions))):
            for i in range(len(actions) - length + 1):
                seq = tuple(actions[i:i + length])
                sequences[seq] += 1
        
        # Filter to only sequences that repeat
        return {seq: count for seq, count in sequences.items() if count >= 2}
