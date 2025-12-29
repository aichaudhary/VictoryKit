"""
Certificate Analyzer - SSL/TLS certificate analysis
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta


class CertificateAnalyzer:
    """Analyze SSL/TLS certificates for security issues"""
    
    def __init__(self):
        self.trusted_issuers = [
            "DigiCert", "Let's Encrypt", "Comodo", "GlobalSign",
            "Sectigo", "GoDaddy", "Entrust", "Thawte", "GeoTrust"
        ]
        
        self.weak_algorithms = [
            'sha1', 'md5', 'md4', 'md2'
        ]
        
        self.strong_key_sizes = {
            'RSA': 2048,
            'EC': 256,
            'DSA': 2048
        }
    
    def analyze(self, cert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive certificate analysis"""
        issues = []
        warnings = []
        info = []
        
        # Validity analysis
        validity_result = self._analyze_validity(cert_data.get('validity', {}))
        issues.extend(validity_result.get('issues', []))
        warnings.extend(validity_result.get('warnings', []))
        info.extend(validity_result.get('info', []))
        
        # Key analysis
        key_result = self._analyze_key(cert_data.get('publicKey', {}))
        issues.extend(key_result.get('issues', []))
        warnings.extend(key_result.get('warnings', []))
        
        # Signature analysis
        sig_result = self._analyze_signature(cert_data.get('signature', {}))
        issues.extend(sig_result.get('issues', []))
        warnings.extend(sig_result.get('warnings', []))
        
        # Issuer analysis
        issuer_result = self._analyze_issuer(cert_data.get('issuer', {}))
        info.extend(issuer_result.get('info', []))
        
        # Extensions analysis
        ext_result = self._analyze_extensions(cert_data.get('extensions', {}))
        warnings.extend(ext_result.get('warnings', []))
        info.extend(ext_result.get('info', []))
        
        # Calculate overall health
        health = self._calculate_health(issues, warnings)
        
        return {
            'domain': cert_data.get('domain', 'unknown'),
            'health': health,
            'issues': issues,
            'warnings': warnings,
            'info': info,
            'summary': {
                'critical_issues': len([i for i in issues if i.get('severity') == 'critical']),
                'high_issues': len([i for i in issues if i.get('severity') == 'high']),
                'warnings': len(warnings),
                'info': len(info)
            }
        }
    
    def _analyze_validity(self, validity: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze certificate validity period"""
        issues = []
        warnings = []
        info = []
        
        not_after = validity.get('notAfter')
        days_remaining = validity.get('daysRemaining', 0)
        is_expired = validity.get('isExpired', False)
        
        if is_expired:
            issues.append({
                'type': 'expired',
                'severity': 'critical',
                'description': 'Certificate has expired',
                'recommendation': 'Renew certificate immediately'
            })
        elif days_remaining <= 7:
            issues.append({
                'type': 'expiring_critical',
                'severity': 'critical',
                'description': f'Certificate expires in {days_remaining} days',
                'recommendation': 'Renew certificate urgently'
            })
        elif days_remaining <= 30:
            warnings.append({
                'type': 'expiring_soon',
                'description': f'Certificate expires in {days_remaining} days',
                'recommendation': 'Plan certificate renewal'
            })
        elif days_remaining <= 60:
            info.append({
                'type': 'expiration_notice',
                'description': f'Certificate expires in {days_remaining} days'
            })
        
        # Check validity period length
        not_before = validity.get('notBefore')
        if not_before and not_after:
            try:
                if isinstance(not_before, str):
                    start = datetime.fromisoformat(not_before.replace('Z', '+00:00'))
                else:
                    start = not_before
                if isinstance(not_after, str):
                    end = datetime.fromisoformat(not_after.replace('Z', '+00:00'))
                else:
                    end = not_after
                
                validity_days = (end - start).days
                if validity_days > 398:  # More than 13 months
                    info.append({
                        'type': 'long_validity',
                        'description': f'Certificate validity period is {validity_days} days',
                        'note': 'Consider shorter validity for better security'
                    })
            except (ValueError, TypeError):
                pass
        
        return {'issues': issues, 'warnings': warnings, 'info': info}
    
    def _analyze_key(self, public_key: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze public key strength"""
        issues = []
        warnings = []
        
        algorithm = public_key.get('algorithm', '').upper()
        size = public_key.get('size', 0)
        
        min_size = self.strong_key_sizes.get(algorithm, 2048)
        
        if size > 0 and size < min_size:
            if size < 1024:
                issues.append({
                    'type': 'weak_key',
                    'severity': 'critical',
                    'description': f'Critically weak key size: {size} bits',
                    'recommendation': f'Use at least {min_size} bits for {algorithm}'
                })
            else:
                issues.append({
                    'type': 'weak_key',
                    'severity': 'high',
                    'description': f'Weak key size: {size} bits',
                    'recommendation': f'Use at least {min_size} bits for {algorithm}'
                })
        
        # Check for deprecated algorithms
        if algorithm in ['DSA', 'RSA1']:
            warnings.append({
                'type': 'deprecated_algorithm',
                'description': f'Using deprecated key algorithm: {algorithm}'
            })
        
        return {'issues': issues, 'warnings': warnings}
    
    def _analyze_signature(self, signature: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze signature algorithm"""
        issues = []
        warnings = []
        
        algorithm = signature.get('algorithm', '').lower()
        hash_alg = signature.get('hashAlgorithm', '').lower()
        
        # Check for weak hash algorithms
        for weak in self.weak_algorithms:
            if weak in algorithm or weak in hash_alg:
                if weak in ['md5', 'md4', 'md2']:
                    issues.append({
                        'type': 'weak_signature',
                        'severity': 'critical',
                        'description': f'Using broken hash algorithm: {weak.upper()}',
                        'recommendation': 'Use SHA-256 or stronger'
                    })
                elif weak == 'sha1':
                    issues.append({
                        'type': 'weak_signature',
                        'severity': 'high',
                        'description': 'Using deprecated SHA-1 signature',
                        'recommendation': 'Use SHA-256 or stronger'
                    })
        
        return {'issues': issues, 'warnings': warnings}
    
    def _analyze_issuer(self, issuer: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze certificate issuer"""
        info = []
        
        org = issuer.get('organization', '')
        cn = issuer.get('commonName', '')
        
        is_trusted = any(
            trusted.lower() in org.lower() or trusted.lower() in cn.lower()
            for trusted in self.trusted_issuers
        )
        
        if is_trusted:
            info.append({
                'type': 'trusted_issuer',
                'description': f'Certificate issued by trusted CA: {org or cn}'
            })
        else:
            info.append({
                'type': 'unknown_issuer',
                'description': f'Certificate issuer: {org or cn}'
            })
        
        return {'info': info}
    
    def _analyze_extensions(self, extensions: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze certificate extensions"""
        warnings = []
        info = []
        
        # Check Subject Alternative Names
        sans = extensions.get('subjectAltNames', [])
        if len(sans) > 0:
            info.append({
                'type': 'san_count',
                'description': f'Certificate covers {len(sans)} domain(s)'
            })
        
        # Check for wildcard
        has_wildcard = any('*' in san for san in sans)
        if has_wildcard:
            info.append({
                'type': 'wildcard',
                'description': 'Certificate includes wildcard domain(s)'
            })
        
        # Check key usage
        key_usage = extensions.get('keyUsage', [])
        if not key_usage:
            warnings.append({
                'type': 'missing_key_usage',
                'description': 'No Key Usage extension specified'
            })
        
        return {'warnings': warnings, 'info': info}
    
    def _calculate_health(self, issues: List, warnings: List) -> str:
        """Calculate overall health status"""
        critical_count = len([i for i in issues if i.get('severity') == 'critical'])
        high_count = len([i for i in issues if i.get('severity') == 'high'])
        
        if critical_count > 0:
            return 'critical'
        elif high_count > 0:
            return 'poor'
        elif len(warnings) > 2:
            return 'fair'
        elif len(warnings) > 0:
            return 'good'
        return 'excellent'
    
    def predict_expiration_risk(self, cert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict certificate expiration risk"""
        validity = cert_data.get('validity', {})
        days_remaining = validity.get('daysRemaining', 0)
        
        if days_remaining <= 0:
            risk_level = 'expired'
            risk_score = 100
            action = 'Certificate has expired. Immediate renewal required.'
        elif days_remaining <= 7:
            risk_level = 'critical'
            risk_score = 95
            action = 'Urgent renewal required within days.'
        elif days_remaining <= 14:
            risk_level = 'high'
            risk_score = 80
            action = 'High priority renewal needed.'
        elif days_remaining <= 30:
            risk_level = 'medium'
            risk_score = 60
            action = 'Schedule renewal soon.'
        elif days_remaining <= 60:
            risk_level = 'low'
            risk_score = 30
            action = 'Plan renewal within next month.'
        else:
            risk_level = 'minimal'
            risk_score = 10
            action = 'No immediate action required.'
        
        return {
            'domain': cert_data.get('domain'),
            'days_remaining': days_remaining,
            'risk_level': risk_level,
            'risk_score': risk_score,
            'recommended_action': action,
            'renewal_deadline': (datetime.now() + timedelta(days=max(0, days_remaining - 7))).isoformat()
        }
