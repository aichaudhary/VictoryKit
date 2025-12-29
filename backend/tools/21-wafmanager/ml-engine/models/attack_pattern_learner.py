"""
Attack Pattern Learner - Learns attack patterns from traffic data
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
import re
from datetime import datetime


class AttackPatternLearner:
    def __init__(self):
        # Attack signatures
        self.signatures = {
            'sqli': [
                r"(?i)(union\s+select|select\s+from|insert\s+into|delete\s+from)",
                r"(?i)(or\s+1\s*=\s*1|and\s+1\s*=\s*1)",
                r"(?i)(';|\"--|/\*|\*/|@@|char\(|concat\()",
                r"(?i)(sleep\(|benchmark\(|waitfor\s+delay)"
            ],
            'xss': [
                r"<script[^>]*>",
                r"javascript:",
                r"on\w+\s*=",
                r"<img[^>]+onerror",
                r"eval\s*\(",
                r"document\.(cookie|location|write)"
            ],
            'rce': [
                r"(?i)(;|\||`|\\$\\(|\\$\\{)",
                r"(?i)(cat\s+/etc|/bin/(ba)?sh|cmd\s*/c)",
                r"(?i)(wget|curl|nc\s+-)",
                r"(?i)(base64\s+-d|python\s+-c|php\s+-r)"
            ],
            'lfi': [
                r"\\.\\./",
                r"/etc/passwd",
                r"/etc/shadow",
                r"c:\\\\windows",
                r"file://"
            ],
            'ssrf': [
                r"(?i)(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)",
                r"(?i)(169\\.254\\.|metadata\\.)",
                r"(?i)(file://|gopher://|dict://)"
            ],
            'bot': [
                r"(?i)(sqlmap|nikto|nessus|acunetix)",
                r"(?i)(masscan|nmap|zmap)",
                r"(?i)(python-requests|go-http|java/)"
            ]
        }
        
        self.severity_map = {
            'sqli': 'critical',
            'xss': 'high',
            'rce': 'critical',
            'lfi': 'high',
            'ssrf': 'high',
            'bot': 'medium'
        }
    
    def detect_patterns(self, requests: List[Dict], window_minutes: int = 60) -> Dict[str, Any]:
        """Detect attack patterns from request data"""
        patterns = []
        by_ip = defaultdict(list)
        by_category = defaultdict(list)
        
        for request in requests:
            # Analyze each request
            matches = self._analyze_request(request)
            
            if matches:
                for match in matches:
                    by_category[match['category']].append(request)
                
                by_ip[request.get('ip', 'unknown')].append({
                    'request': request,
                    'matches': matches
                })
        
        # Identify patterns
        for ip, ip_requests in by_ip.items():
            if len(ip_requests) >= 3:
                pattern = self._extract_pattern(ip, ip_requests)
                if pattern:
                    patterns.append(pattern)
        
        # Category-based patterns
        for category, cat_requests in by_category.items():
            if len(cat_requests) >= 5:
                patterns.append({
                    'type': 'category_surge',
                    'category': category,
                    'count': len(cat_requests),
                    'severity': self.severity_map.get(category, 'medium'),
                    'description': f'Surge in {category} attacks detected'
                })
        
        return {
            'patterns': patterns,
            'summary': {
                'total_requests': len(requests),
                'malicious_requests': sum(len(reqs) for reqs in by_ip.values()),
                'unique_attackers': len(by_ip),
                'categories_detected': list(by_category.keys())
            },
            'top_attackers': self._get_top_attackers(by_ip),
            'category_breakdown': {cat: len(reqs) for cat, reqs in by_category.items()}
        }
    
    def _analyze_request(self, request: Dict) -> List[Dict]:
        """Analyze a single request for attack patterns"""
        matches = []
        
        # Fields to check
        check_fields = [
            ('uri', request.get('uri', '')),
            ('query', request.get('queryString', '')),
            ('body', request.get('body', '')),
            ('headers', str(request.get('headers', '')))
        ]
        
        for category, patterns in self.signatures.items():
            for pattern in patterns:
                for field_name, field_value in check_fields:
                    if field_value and re.search(pattern, str(field_value)):
                        matches.append({
                            'category': category,
                            'field': field_name,
                            'pattern': pattern[:50],
                            'severity': self.severity_map.get(category, 'medium')
                        })
                        break
        
        return matches
    
    def _extract_pattern(self, ip: str, ip_requests: List[Dict]) -> Optional[Dict]:
        """Extract attack pattern from IP's requests"""
        categories = defaultdict(int)
        fields = defaultdict(int)
        
        for item in ip_requests:
            for match in item.get('matches', []):
                categories[match['category']] += 1
                fields[match['field']] += 1
        
        if not categories:
            return None
        
        main_category = max(categories.keys(), key=lambda k: categories[k])
        
        return {
            'type': 'ip_attack_pattern',
            'ip': ip,
            'request_count': len(ip_requests),
            'main_category': main_category,
            'categories': dict(categories),
            'target_fields': dict(fields),
            'severity': self.severity_map.get(main_category, 'medium'),
            'recommendation': f'Consider blocking IP {ip} - {len(ip_requests)} malicious requests detected'
        }
    
    def _get_top_attackers(self, by_ip: Dict) -> List[Dict]:
        """Get top attacking IPs"""
        attackers = []
        for ip, requests in by_ip.items():
            attackers.append({
                'ip': ip,
                'request_count': len(requests),
                'categories': list(set(
                    m['category'] for r in requests for m in r.get('matches', [])
                ))
            })
        
        return sorted(attackers, key=lambda x: x['request_count'], reverse=True)[:10]
    
    def generate_rule(self, pattern: Dict) -> Dict[str, Any]:
        """Generate WAF rule from detected pattern"""
        if pattern.get('type') == 'ip_attack_pattern':
            return {
                'name': f"Block IP {pattern['ip']}",
                'type': 'ip_set',
                'action': 'block',
                'conditions': [{
                    'field': 'ip',
                    'operator': 'exactly',
                    'value': pattern['ip']
                }],
                'priority': 10 if pattern['severity'] == 'critical' else 50,
                'metadata': {
                    'generated': True,
                    'source': 'pattern_learner',
                    'reason': pattern.get('recommendation', 'Auto-generated rule')
                }
            }
        elif pattern.get('type') == 'category_surge':
            return {
                'name': f"Block {pattern['category'].upper()} attacks",
                'type': 'custom',
                'category': pattern['category'],
                'action': 'block',
                'conditions': self._get_category_conditions(pattern['category']),
                'priority': 20,
                'metadata': {
                    'generated': True,
                    'source': 'pattern_learner'
                }
            }
        
        return {'message': 'Cannot generate rule for this pattern type'}
    
    def _get_category_conditions(self, category: str) -> List[Dict]:
        """Get conditions for a category"""
        patterns = self.signatures.get(category, [])
        if not patterns:
            return []
        
        return [{
            'field': 'uri',
            'operator': 'regex',
            'value': patterns[0]
        }]
    
    def score_request(self, request: Dict) -> Dict[str, Any]:
        """Score a request for attack likelihood"""
        matches = self._analyze_request(request)
        
        if not matches:
            return {
                'score': 0,
                'risk_level': 'safe',
                'matches': [],
                'recommendation': 'allow'
            }
        
        # Calculate score
        severity_scores = {'critical': 40, 'high': 25, 'medium': 15, 'low': 5}
        score = sum(severity_scores.get(m['severity'], 10) for m in matches)
        score = min(score, 100)
        
        risk_level = 'critical' if score >= 80 else ('high' if score >= 50 else ('medium' if score >= 25 else 'low'))
        
        return {
            'score': score,
            'risk_level': risk_level,
            'matches': matches,
            'recommendation': 'block' if score >= 50 else ('challenge' if score >= 25 else 'monitor')
        }
