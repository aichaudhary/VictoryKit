"""
Security Analyzer - Analyzes APIs for security vulnerabilities
"""

from typing import List, Dict, Any, Optional
import re


class SecurityAnalyzer:
    def __init__(self):
        # OWASP API Security Top 10 checks
        self.vulnerability_checks = {
            'BROKEN_AUTHENTICATION': self._check_authentication,
            'EXCESSIVE_DATA_EXPOSURE': self._check_data_exposure,
            'LACK_OF_RESOURCES_LIMITING': self._check_rate_limiting,
            'INJECTION': self._check_injection,
            'SECURITY_MISCONFIGURATION': self._check_misconfiguration,
            'SENSITIVE_DATA_EXPOSURE': self._check_sensitive_data
        }
        
        self.sensitive_patterns = [
            r'password', r'token', r'secret', r'key', r'apikey',
            r'ssn', r'credit', r'card', r'cvv', r'pin',
            r'email', r'phone', r'address'
        ]
    
    def scan_endpoint(
        self, 
        path: str, 
        method: str, 
        parameters: List[Dict], 
        request_body: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Scan a single endpoint for vulnerabilities"""
        vulnerabilities = []
        
        # Check path for sensitive data
        path_vulns = self._check_path(path)
        vulnerabilities.extend(path_vulns)
        
        # Check parameters
        param_vulns = self._check_parameters(parameters)
        vulnerabilities.extend(param_vulns)
        
        # Check request body if present
        if request_body:
            body_vulns = self._check_request_body(request_body)
            vulnerabilities.extend(body_vulns)
        
        # Check method-specific issues
        method_vulns = self._check_method(method, path)
        vulnerabilities.extend(method_vulns)
        
        return {
            'vulnerabilities': vulnerabilities,
            'risk_score': self._calculate_risk_score(vulnerabilities),
            'scanned_at': 'now'
        }
    
    def analyze_api(
        self,
        api_id: str,
        base_url: str,
        endpoints: List[Dict],
        authentication: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Comprehensive API security analysis"""
        all_vulnerabilities = []
        endpoint_results = []
        
        # Check API-level security
        if not authentication or authentication.get('type') == 'none':
            all_vulnerabilities.append({
                'type': 'BROKEN_AUTHENTICATION',
                'severity': 'critical',
                'description': 'API has no authentication configured',
                'remediation': 'Implement authentication (OAuth2, JWT, API keys)',
                'location': 'api_level'
            })
        
        # Analyze each endpoint
        for endpoint in endpoints:
            result = self.scan_endpoint(
                endpoint.get('path', ''),
                endpoint.get('method', 'GET'),
                endpoint.get('parameters', []),
                endpoint.get('request_body')
            )
            
            endpoint_results.append({
                'path': endpoint.get('path'),
                'method': endpoint.get('method'),
                'vulnerabilities': result['vulnerabilities'],
                'risk_score': result['risk_score']
            })
            
            all_vulnerabilities.extend(result['vulnerabilities'])
        
        # Aggregate results
        severity_counts = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
        for vuln in all_vulnerabilities:
            sev = vuln.get('severity', 'medium')
            severity_counts[sev] = severity_counts.get(sev, 0) + 1
        
        return {
            'api_id': api_id,
            'total_endpoints': len(endpoints),
            'total_vulnerabilities': len(all_vulnerabilities),
            'by_severity': severity_counts,
            'endpoint_results': endpoint_results,
            'top_vulnerabilities': all_vulnerabilities[:10],
            'recommendations': self._generate_recommendations(all_vulnerabilities)
        }
    
    def calculate_score(
        self,
        endpoints: List[Dict],
        authentication: Optional[Dict]
    ) -> Dict[str, Any]:
        """Calculate security score"""
        score = 100
        deductions = []
        
        # Authentication check
        if not authentication or authentication.get('type') == 'none':
            score -= 25
            deductions.append({'reason': 'No authentication', 'points': 25})
        elif authentication.get('type') == 'api_key':
            score -= 10
            deductions.append({'reason': 'Basic API key auth (consider OAuth2)', 'points': 10})
        
        # Endpoint analysis
        for endpoint in endpoints:
            params = endpoint.get('parameters', [])
            
            # Check for validation
            no_validation = [p for p in params if not p.get('validation')]
            if no_validation:
                score -= min(5 * len(no_validation), 15)
            
            # Check for authentication
            security = endpoint.get('security', {})
            if not security.get('authentication'):
                score -= 5
        
        score = max(0, min(100, score))
        
        grade = 'A+' if score >= 95 else \
                'A' if score >= 85 else \
                'B' if score >= 75 else \
                'C' if score >= 65 else \
                'D' if score >= 50 else 'F'
        
        return {
            'score': score,
            'grade': grade,
            'deductions': deductions,
            'recommendations': self._score_recommendations(score)
        }
    
    def _check_path(self, path: str) -> List[Dict]:
        """Check path for vulnerabilities"""
        vulnerabilities = []
        path_lower = path.lower()
        
        for pattern in self.sensitive_patterns:
            if re.search(pattern, path_lower):
                vulnerabilities.append({
                    'type': 'SENSITIVE_DATA_EXPOSURE',
                    'severity': 'high',
                    'description': f'Path contains sensitive term: {pattern}',
                    'remediation': 'Avoid exposing sensitive identifiers in URLs',
                    'location': f'path: {path}'
                })
                break
        
        # Check for version in path
        if not re.search(r'/v\d+/', path):
            vulnerabilities.append({
                'type': 'IMPROPER_ASSETS_MANAGEMENT',
                'severity': 'low',
                'description': 'API path does not include version',
                'remediation': 'Include API version in path (e.g., /v1/)',
                'location': f'path: {path}'
            })
        
        return vulnerabilities
    
    def _check_parameters(self, params: List[Dict]) -> List[Dict]:
        """Check parameters for vulnerabilities"""
        vulnerabilities = []
        
        for param in params:
            name = param.get('name', '').lower()
            
            # Check for injection-prone parameters
            if name in ['query', 'filter', 'sort', 'search', 'sql', 'command']:
                if not param.get('validation'):
                    vulnerabilities.append({
                        'type': 'INJECTION',
                        'severity': 'high',
                        'description': f'Parameter "{name}" may be injection-prone',
                        'remediation': 'Add strict validation for this parameter',
                        'location': f'parameter: {name}'
                    })
            
            # Check for mass assignment
            if param.get('location') == 'body' and not param.get('validation'):
                vulnerabilities.append({
                    'type': 'MASS_ASSIGNMENT',
                    'severity': 'medium',
                    'description': 'Body parameters lack validation schema',
                    'remediation': 'Define strict schema for request body',
                    'location': 'request_body'
                })
        
        return vulnerabilities
    
    def _check_request_body(self, body: Dict) -> List[Dict]:
        """Check request body configuration"""
        vulnerabilities = []
        
        if not body.get('schema'):
            vulnerabilities.append({
                'type': 'SECURITY_MISCONFIGURATION',
                'severity': 'medium',
                'description': 'Request body has no schema defined',
                'remediation': 'Define JSON schema for request validation'
            })
        
        return vulnerabilities
    
    def _check_method(self, method: str, path: str) -> List[Dict]:
        """Check HTTP method usage"""
        vulnerabilities = []
        
        # Dangerous methods on sensitive paths
        if method in ['DELETE', 'PUT', 'PATCH']:
            for pattern in ['admin', 'user', 'account', 'config']:
                if pattern in path.lower():
                    vulnerabilities.append({
                        'type': 'BROKEN_FUNCTION_LEVEL_AUTH',
                        'severity': 'high',
                        'description': f'{method} on sensitive path requires careful authorization',
                        'remediation': 'Ensure proper authorization checks',
                        'location': f'{method} {path}'
                    })
                    break
        
        return vulnerabilities
    
    def _check_authentication(self, api: Dict) -> List[Dict]:
        return []
    
    def _check_data_exposure(self, api: Dict) -> List[Dict]:
        return []
    
    def _check_rate_limiting(self, api: Dict) -> List[Dict]:
        return []
    
    def _check_injection(self, api: Dict) -> List[Dict]:
        return []
    
    def _check_misconfiguration(self, api: Dict) -> List[Dict]:
        return []
    
    def _check_sensitive_data(self, api: Dict) -> List[Dict]:
        return []
    
    def _calculate_risk_score(self, vulnerabilities: List[Dict]) -> int:
        """Calculate risk score from vulnerabilities"""
        score = 0
        severity_scores = {'critical': 40, 'high': 25, 'medium': 15, 'low': 5}
        
        for vuln in vulnerabilities:
            score += severity_scores.get(vuln.get('severity', 'medium'), 10)
        
        return min(score, 100)
    
    def _generate_recommendations(self, vulnerabilities: List[Dict]) -> List[Dict]:
        """Generate remediation recommendations"""
        recommendations = []
        vuln_types = set(v.get('type') for v in vulnerabilities)
        
        if 'BROKEN_AUTHENTICATION' in vuln_types:
            recommendations.append({
                'priority': 'critical',
                'category': 'authentication',
                'action': 'Implement OAuth2 or JWT authentication'
            })
        
        if 'INJECTION' in vuln_types:
            recommendations.append({
                'priority': 'critical',
                'category': 'input_validation',
                'action': 'Add input validation and parameterized queries'
            })
        
        if 'SENSITIVE_DATA_EXPOSURE' in vuln_types:
            recommendations.append({
                'priority': 'high',
                'category': 'data_protection',
                'action': 'Review and minimize data exposure in responses'
            })
        
        return recommendations
    
    def _score_recommendations(self, score: int) -> List[str]:
        """Recommendations based on score"""
        if score >= 90:
            return ['Maintain current security practices', 'Consider penetration testing']
        elif score >= 70:
            return ['Address high severity issues', 'Implement additional input validation']
        else:
            return ['Critical security improvements needed', 'Implement authentication', 'Add rate limiting']
