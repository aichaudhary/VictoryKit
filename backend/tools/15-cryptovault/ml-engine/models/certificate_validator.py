"""
CryptoVault - Certificate Validator
Validates SSL/TLS certificates for security and configuration issues
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List


class CertificateValidator:
    """Validates certificates for security issues and best practices."""
    
    def __init__(self):
        self.key_strength = {
            "RSA-4096": {"strength": "high", "bits": 4096},
            "RSA-2048": {"strength": "medium", "bits": 2048},
            "RSA-1024": {"strength": "weak", "bits": 1024, "deprecated": True},
            "ECDSA-P384": {"strength": "high", "bits": 384},
            "ECDSA-P256": {"strength": "high", "bits": 256},
            "DSA-1024": {"strength": "weak", "bits": 1024, "deprecated": True}
        }
        
        self.weak_signatures = ["SHA1", "MD5", "MD2"]
    
    def validate(self, cert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive certificate validation."""
        errors = []
        warnings = []
        risk_score = 0
        
        common_name = cert_data.get("commonName", "")
        cert_type = cert_data.get("type", "ssl_tls")
        key_algorithm = cert_data.get("keyAlgorithm", "RSA-2048")
        validity = cert_data.get("validity", {})
        domains = cert_data.get("domains", [])
        chain = cert_data.get("chain", [])
        
        # Validity period checks
        not_after = validity.get("notAfter")
        not_before = validity.get("notBefore")
        days_remaining = validity.get("daysRemaining")
        
        if not_after:
            try:
                expiry = datetime.fromisoformat(not_after.replace("Z", "+00:00"))
                now = datetime.now(expiry.tzinfo) if expiry.tzinfo else datetime.now()
                days_remaining = (expiry - now).days
                
                if days_remaining <= 0:
                    risk_score += 50
                    errors.append({
                        "code": "CERT_EXPIRED",
                        "message": f"Certificate expired {abs(days_remaining)} days ago",
                        "severity": "critical"
                    })
                elif days_remaining <= 7:
                    risk_score += 40
                    errors.append({
                        "code": "CERT_EXPIRING_CRITICAL",
                        "message": f"Certificate expires in {days_remaining} days",
                        "severity": "critical"
                    })
                elif days_remaining <= 30:
                    risk_score += 20
                    warnings.append({
                        "code": "CERT_EXPIRING_SOON",
                        "message": f"Certificate expires in {days_remaining} days",
                        "severity": "high"
                    })
                elif days_remaining <= 90:
                    warnings.append({
                        "code": "CERT_EXPIRING",
                        "message": f"Certificate expires in {days_remaining} days",
                        "severity": "medium"
                    })
            except (ValueError, TypeError):
                warnings.append({
                    "code": "INVALID_EXPIRY_DATE",
                    "message": "Could not parse certificate expiry date",
                    "severity": "medium"
                })
        
        # Key algorithm strength
        key_info = self.key_strength.get(key_algorithm, {"strength": "unknown"})
        
        if key_info.get("deprecated"):
            risk_score += 35
            errors.append({
                "code": "DEPRECATED_KEY_ALGORITHM",
                "message": f"{key_algorithm} is deprecated and insecure",
                "severity": "critical"
            })
        elif key_info["strength"] == "weak":
            risk_score += 25
            errors.append({
                "code": "WEAK_KEY_ALGORITHM",
                "message": f"{key_algorithm} does not provide adequate security",
                "severity": "high"
            })
        elif key_info["strength"] == "medium":
            risk_score += 10
            warnings.append({
                "code": "MODERATE_KEY_STRENGTH",
                "message": f"{key_algorithm} - consider upgrading to RSA-4096 or ECDSA-P384",
                "severity": "low"
            })
        
        # Certificate chain validation
        if not chain or len(chain) == 0:
            risk_score += 10
            warnings.append({
                "code": "MISSING_CHAIN",
                "message": "Certificate chain not provided for validation",
                "severity": "medium"
            })
        else:
            # Check chain completeness
            if len(chain) == 1:
                warnings.append({
                    "code": "INCOMPLETE_CHAIN",
                    "message": "Certificate chain may be incomplete",
                    "severity": "low"
                })
            
            # Check for self-signed
            if len(chain) > 0:
                first = chain[0]
                if first.get("subject") == first.get("issuer"):
                    warnings.append({
                        "code": "SELF_SIGNED",
                        "message": "Certificate is self-signed",
                        "severity": "info"
                    })
        
        # Domain validation
        if not domains or len(domains) == 0:
            warnings.append({
                "code": "NO_DOMAINS",
                "message": "No domains/SANs specified",
                "severity": "low"
            })
        else:
            # Check for wildcard usage
            wildcard_count = sum(1 for d in domains if d.get("name", "").startswith("*"))
            if wildcard_count > 3:
                warnings.append({
                    "code": "EXCESSIVE_WILDCARDS",
                    "message": f"Certificate has {wildcard_count} wildcard domains",
                    "severity": "low"
                })
        
        # Certificate type specific checks
        if cert_type == "root_ca":
            warnings.append({
                "code": "ROOT_CA",
                "message": "Root CA certificates require special handling",
                "severity": "info"
            })
        
        # Calculate overall status
        is_valid = len([e for e in errors if e["severity"] == "critical"]) == 0
        risk_level = "critical" if risk_score >= 50 else "high" if risk_score >= 30 else "medium" if risk_score >= 15 else "low"
        
        recommendations = self._generate_recommendations(errors, warnings, key_algorithm, days_remaining)
        
        return {
            "certificateId": cert_data.get("certificateId"),
            "commonName": common_name,
            "valid": is_valid,
            "riskScore": min(100, risk_score),
            "riskLevel": risk_level,
            "daysUntilExpiry": days_remaining,
            "errors": errors,
            "warnings": warnings,
            "recommendations": recommendations,
            "keyStrength": key_info,
            "chainLength": len(chain),
            "domainCount": len(domains),
            "validatedAt": datetime.now().isoformat()
        }
    
    def _generate_recommendations(
        self, 
        errors: List[Dict], 
        warnings: List[Dict], 
        key_algorithm: str,
        days_remaining: int
    ) -> List[Dict[str, Any]]:
        """Generate actionable recommendations."""
        recommendations = []
        
        error_codes = [e["code"] for e in errors]
        warning_codes = [w["code"] for w in warnings]
        
        if "CERT_EXPIRED" in error_codes:
            recommendations.append({
                "priority": "critical",
                "action": "Renew certificate immediately",
                "description": "Expired certificates will cause service disruptions and security warnings"
            })
        
        if "CERT_EXPIRING_CRITICAL" in error_codes:
            recommendations.append({
                "priority": "critical",
                "action": "Initiate emergency certificate renewal",
                "description": "Certificate will expire very soon"
            })
        
        if "CERT_EXPIRING_SOON" in warning_codes:
            recommendations.append({
                "priority": "high",
                "action": "Schedule certificate renewal",
                "description": "Renew certificate before expiration to avoid service disruption"
            })
        
        if "DEPRECATED_KEY_ALGORITHM" in error_codes or "WEAK_KEY_ALGORITHM" in error_codes:
            recommendations.append({
                "priority": "high",
                "action": f"Migrate from {key_algorithm} to RSA-4096 or ECDSA-P384",
                "description": "Current key algorithm does not meet security standards"
            })
        
        if "MISSING_CHAIN" in warning_codes:
            recommendations.append({
                "priority": "medium",
                "action": "Include full certificate chain",
                "description": "Incomplete chains may cause validation failures in some clients"
            })
        
        if "MODERATE_KEY_STRENGTH" in warning_codes:
            recommendations.append({
                "priority": "low",
                "action": "Plan upgrade to stronger key algorithm",
                "description": "Upgrade to RSA-4096 or ECDSA-P384 for improved security"
            })
        
        # Auto-renewal recommendation
        if days_remaining and 0 < days_remaining <= 90:
            recommendations.append({
                "priority": "medium",
                "action": "Enable automatic certificate renewal",
                "description": "Use Let's Encrypt, AWS ACM, or similar for auto-renewal"
            })
        
        return recommendations
