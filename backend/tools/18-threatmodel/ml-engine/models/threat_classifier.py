"""
Threat Classifier
Classifies and categorizes threats
"""

from typing import Dict, List, Any


class ThreatClassifier:
    """Classifies threats and generates mitigations."""
    
    def __init__(self):
        self.stride_keywords = {
            'spoofing': ['spoof', 'impersonate', 'fake', 'forge', 'credential', 'identity', 'session', 'phishing'],
            'tampering': ['tamper', 'modify', 'alter', 'inject', 'corrupt', 'change', 'manipulation'],
            'repudiation': ['repudiat', 'deny', 'log', 'audit', 'trace', 'evidence', 'attribution'],
            'information_disclosure': ['disclosure', 'leak', 'expose', 'breach', 'exfiltrat', 'intercept', 'sniff'],
            'denial_of_service': ['denial', 'dos', 'ddos', 'availability', 'crash', 'exhaust', 'flood'],
            'elevation_of_privilege': ['privilege', 'escalat', 'bypass', 'elevat', 'admin', 'root', 'unauthorized']
        }
        
        self.mitigation_templates = {
            'spoofing': [
                {'name': 'Multi-factor authentication', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Strong password policies', 'type': 'preventive', 'effectiveness': 'medium'},
                {'name': 'Session management', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Certificate-based authentication', 'type': 'preventive', 'effectiveness': 'high'}
            ],
            'tampering': [
                {'name': 'Input validation', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Integrity checks', 'type': 'detective', 'effectiveness': 'high'},
                {'name': 'Code signing', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Parameterized queries', 'type': 'preventive', 'effectiveness': 'high'}
            ],
            'repudiation': [
                {'name': 'Comprehensive logging', 'type': 'detective', 'effectiveness': 'high'},
                {'name': 'Secure audit trails', 'type': 'detective', 'effectiveness': 'high'},
                {'name': 'Digital signatures', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Timestamps', 'type': 'detective', 'effectiveness': 'medium'}
            ],
            'information_disclosure': [
                {'name': 'Encryption at rest', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Encryption in transit', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Access controls', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Data masking', 'type': 'preventive', 'effectiveness': 'medium'}
            ],
            'denial_of_service': [
                {'name': 'Rate limiting', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Load balancing', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'DDoS protection', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Resource quotas', 'type': 'preventive', 'effectiveness': 'medium'}
            ],
            'elevation_of_privilege': [
                {'name': 'Least privilege principle', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Role-based access control', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Privilege separation', 'type': 'preventive', 'effectiveness': 'high'},
                {'name': 'Regular access reviews', 'type': 'detective', 'effectiveness': 'medium'}
            ]
        }
    
    def classify(self, threat: Dict) -> Dict:
        """Classify a threat using STRIDE categories."""
        name = threat.get('name', '').lower()
        description = threat.get('description', '').lower()
        category = threat.get('category', '').lower()
        
        text = f"{name} {description} {category}"
        
        scores = {}
        for stride_cat, keywords in self.stride_keywords.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                scores[stride_cat] = score
        
        if not scores:
            # Default based on provided category
            if category in self.stride_keywords:
                scores[category] = 1
            else:
                scores['other'] = 1
        
        primary_category = max(scores.keys(), key=lambda k: scores[k])
        stride_letter = {
            'spoofing': 'S',
            'tampering': 'T',
            'repudiation': 'R',
            'information_disclosure': 'I',
            'denial_of_service': 'D',
            'elevation_of_privilege': 'E'
        }.get(primary_category, 'U')
        
        return {
            'primaryCategory': primary_category,
            'strideLetter': stride_letter,
            'allCategories': list(scores.keys()),
            'scores': scores,
            'confidence': min(0.9, 0.5 + max(scores.values()) * 0.1)
        }
    
    def generate_mitigations(self, threat: Dict) -> List[Dict]:
        """Generate mitigation recommendations for a threat."""
        classification = self.classify(threat)
        primary_category = classification['primaryCategory']
        
        mitigations = self.mitigation_templates.get(primary_category, [])
        
        # Add general mitigations
        general = [
            {'name': 'Security monitoring', 'type': 'detective', 'effectiveness': 'medium'},
            {'name': 'Incident response plan', 'type': 'corrective', 'effectiveness': 'medium'},
            {'name': 'Security awareness training', 'type': 'preventive', 'effectiveness': 'medium'}
        ]
        
        all_mitigations = mitigations + general
        
        # Add implementation guidance
        for mit in all_mitigations:
            mit['implementation'] = self._get_implementation_guidance(mit['name'])
        
        return all_mitigations
    
    def _get_implementation_guidance(self, mitigation_name: str) -> Dict:
        """Get implementation guidance for a mitigation."""
        guidance = {
            'Multi-factor authentication': {
                'effort': 'moderate',
                'timeline': '2-4 weeks',
                'technologies': ['TOTP', 'WebAuthn', 'SMS (not recommended)']
            },
            'Input validation': {
                'effort': 'moderate',
                'timeline': '1-2 weeks',
                'technologies': ['Schema validation', 'Sanitization libraries']
            },
            'Encryption at rest': {
                'effort': 'moderate',
                'timeline': '2-4 weeks',
                'technologies': ['AES-256', 'Database TDE', 'Key management']
            },
            'Rate limiting': {
                'effort': 'low',
                'timeline': '1 week',
                'technologies': ['API Gateway', 'Redis', 'Token bucket']
            },
            'Least privilege principle': {
                'effort': 'high',
                'timeline': '4-8 weeks',
                'technologies': ['IAM', 'RBAC', 'Attribute-based access']
            }
        }
        
        return guidance.get(mitigation_name, {
            'effort': 'moderate',
            'timeline': '2-4 weeks',
            'technologies': ['Consult security team']
        })
    
    def get_owasp_templates(self) -> List[Dict]:
        """Get OWASP Top 10 threat templates."""
        return [
            {
                'id': 'A01:2021',
                'name': 'Broken Access Control',
                'description': 'Restrictions on authenticated users not properly enforced',
                'strideMapping': ['elevation_of_privilege', 'information_disclosure']
            },
            {
                'id': 'A02:2021',
                'name': 'Cryptographic Failures',
                'description': 'Failures related to cryptography leading to data exposure',
                'strideMapping': ['information_disclosure']
            },
            {
                'id': 'A03:2021',
                'name': 'Injection',
                'description': 'Hostile data sent to interpreter as part of command or query',
                'strideMapping': ['tampering', 'elevation_of_privilege']
            },
            {
                'id': 'A04:2021',
                'name': 'Insecure Design',
                'description': 'Missing or ineffective control design',
                'strideMapping': ['all']
            },
            {
                'id': 'A05:2021',
                'name': 'Security Misconfiguration',
                'description': 'Improperly configured security settings',
                'strideMapping': ['information_disclosure', 'elevation_of_privilege']
            },
            {
                'id': 'A06:2021',
                'name': 'Vulnerable and Outdated Components',
                'description': 'Using components with known vulnerabilities',
                'strideMapping': ['all']
            },
            {
                'id': 'A07:2021',
                'name': 'Identification and Authentication Failures',
                'description': 'Weak authentication and session management',
                'strideMapping': ['spoofing']
            },
            {
                'id': 'A08:2021',
                'name': 'Software and Data Integrity Failures',
                'description': 'Code and infrastructure not protected against integrity violations',
                'strideMapping': ['tampering']
            },
            {
                'id': 'A09:2021',
                'name': 'Security Logging and Monitoring Failures',
                'description': 'Insufficient logging, detection, monitoring, and response',
                'strideMapping': ['repudiation']
            },
            {
                'id': 'A10:2021',
                'name': 'Server-Side Request Forgery',
                'description': 'Web application fetches remote resource without validating URL',
                'strideMapping': ['spoofing', 'information_disclosure']
            }
        ]
