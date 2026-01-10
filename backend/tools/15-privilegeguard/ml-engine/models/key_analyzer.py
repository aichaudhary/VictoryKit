"""
CryptoVault - Key Analyzer
Analyzes encryption keys for security risks and best practices
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List


class KeyAnalyzer:
    """Analyzes encryption keys for security vulnerabilities and compliance."""
    
    def __init__(self):
        self.algorithm_strength = {
            "AES-256": {"strength": "high", "score": 10, "quantum_safe": False},
            "AES-128": {"strength": "medium", "score": 7, "quantum_safe": False},
            "RSA-4096": {"strength": "high", "score": 10, "quantum_safe": False},
            "RSA-2048": {"strength": "medium", "score": 6, "quantum_safe": False},
            "ECDSA-P384": {"strength": "high", "score": 9, "quantum_safe": False},
            "ECDSA-P256": {"strength": "high", "score": 8, "quantum_safe": False},
            "HMAC-SHA256": {"strength": "high", "score": 9, "quantum_safe": False},
            "3DES": {"strength": "weak", "score": 3, "quantum_safe": False, "deprecated": True},
            "DES": {"strength": "critical", "score": 1, "quantum_safe": False, "deprecated": True}
        }
        
        self.rotation_recommendations = {
            "symmetric": 365,
            "asymmetric": 730,
            "hmac": 365
        }
    
    def analyze(self, key_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive key security analysis."""
        risk_score = 0
        risk_factors = []
        recommendations = []
        
        algorithm = key_data.get("algorithm", "unknown")
        key_type = key_data.get("keyType", "symmetric")
        rotation = key_data.get("rotation", {})
        usage = key_data.get("usage", {})
        
        # Algorithm strength analysis
        algo_info = self.algorithm_strength.get(algorithm, {"strength": "unknown", "score": 5})
        
        if algo_info.get("deprecated"):
            risk_score += 40
            risk_factors.append({
                "factor": "DEPRECATED_ALGORITHM",
                "severity": "critical",
                "description": f"{algorithm} is deprecated and should not be used",
                "impact": "Keys encrypted with deprecated algorithms are vulnerable"
            })
            recommendations.append({
                "priority": "critical",
                "action": f"Migrate from {algorithm} to AES-256 or RSA-4096 immediately"
            })
        elif algo_info["strength"] == "medium":
            risk_score += 15
            risk_factors.append({
                "factor": "MODERATE_ALGORITHM_STRENGTH",
                "severity": "medium",
                "description": f"{algorithm} provides moderate security",
                "impact": "May not meet future security requirements"
            })
            recommendations.append({
                "priority": "medium",
                "action": "Consider upgrading to stronger algorithm"
            })
        elif algo_info["strength"] == "weak":
            risk_score += 30
            risk_factors.append({
                "factor": "WEAK_ALGORITHM",
                "severity": "high",
                "description": f"{algorithm} is considered weak by modern standards",
                "impact": "Susceptible to cryptographic attacks"
            })
            recommendations.append({
                "priority": "high",
                "action": f"Replace {algorithm} with AES-256 or stronger"
            })
        
        # Quantum safety warning
        if not algo_info.get("quantum_safe", False):
            risk_factors.append({
                "factor": "NOT_QUANTUM_SAFE",
                "severity": "info",
                "description": f"{algorithm} is not quantum-resistant",
                "impact": "May need migration when quantum computers become practical"
            })
        
        # Rotation analysis
        rotation_enabled = rotation.get("enabled", False)
        last_rotated = rotation.get("lastRotated")
        interval_days = rotation.get("intervalDays", 365)
        
        if not rotation_enabled:
            risk_score += 25
            risk_factors.append({
                "factor": "ROTATION_DISABLED",
                "severity": "high",
                "description": "Automatic key rotation is disabled",
                "impact": "Increases risk of key compromise over time"
            })
            recommendations.append({
                "priority": "high",
                "action": f"Enable automatic rotation with {self.rotation_recommendations.get(key_type, 365)}-day interval"
            })
        elif last_rotated:
            try:
                last_rotated_date = datetime.fromisoformat(last_rotated.replace("Z", "+00:00"))
                days_since = (datetime.now(last_rotated_date.tzinfo) - last_rotated_date).days
                
                if days_since > interval_days:
                    risk_score += 20
                    risk_factors.append({
                        "factor": "ROTATION_OVERDUE",
                        "severity": "high",
                        "description": f"Key rotation overdue by {days_since - interval_days} days",
                        "impact": "Extended key exposure increases compromise risk"
                    })
                    recommendations.append({
                        "priority": "high",
                        "action": "Rotate key immediately"
                    })
                elif days_since > interval_days * 0.9:
                    risk_factors.append({
                        "factor": "ROTATION_DUE_SOON",
                        "severity": "info",
                        "description": f"Key rotation due in {interval_days - days_since} days",
                        "impact": None
                    })
            except (ValueError, TypeError):
                pass
        
        # Usage analysis
        encrypt_count = usage.get("encryptCount", 0)
        decrypt_count = usage.get("decryptCount", 0)
        last_used = usage.get("lastUsed")
        
        if encrypt_count == 0 and decrypt_count == 0:
            risk_score += 5
            risk_factors.append({
                "factor": "UNUSED_KEY",
                "severity": "low",
                "description": "Key has never been used",
                "impact": "May indicate orphaned or unnecessary key"
            })
            recommendations.append({
                "priority": "low",
                "action": "Review if key is still needed"
            })
        
        # High usage without rotation
        if encrypt_count > 1000000 and not rotation_enabled:
            risk_score += 15
            risk_factors.append({
                "factor": "HIGH_USAGE_NO_ROTATION",
                "severity": "high",
                "description": f"Key used {encrypt_count:,} times without rotation",
                "impact": "High-volume keys should be rotated more frequently"
            })
        
        # Calculate risk level
        risk_level = "critical" if risk_score >= 70 else "high" if risk_score >= 50 else "medium" if risk_score >= 25 else "low"
        
        return {
            "keyId": key_data.get("keyId"),
            "algorithm": algorithm,
            "algorithmStrength": algo_info["strength"],
            "riskScore": min(100, risk_score),
            "riskLevel": risk_level,
            "riskFactors": risk_factors,
            "recommendations": recommendations,
            "complianceStatus": self._check_compliance(algorithm, rotation_enabled),
            "analyzedAt": datetime.now().isoformat()
        }
    
    def recommend_algorithm(self, use_case: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend encryption algorithm based on use case."""
        purpose = use_case.get("useCase", "general").lower()
        data_type = use_case.get("dataType", "general").lower()
        compliance = use_case.get("complianceRequirements", [])
        
        recommendations = []
        
        if "encryption" in purpose or "data" in purpose:
            recommendations.append({
                "algorithm": "AES-256-GCM",
                "type": "symmetric",
                "reason": "Industry standard for data encryption with authentication",
                "performance": "high",
                "keySize": 256
            })
            
        if "signing" in purpose or "signature" in purpose:
            recommendations.append({
                "algorithm": "ECDSA-P384",
                "type": "asymmetric",
                "reason": "Strong signatures with smaller key sizes than RSA",
                "performance": "high",
                "keySize": 384
            })
            recommendations.append({
                "algorithm": "Ed25519",
                "type": "asymmetric",
                "reason": "Modern signature algorithm with excellent performance",
                "performance": "very high",
                "keySize": 256
            })
            
        if "key_exchange" in purpose or "tls" in purpose:
            recommendations.append({
                "algorithm": "ECDH-P384",
                "type": "asymmetric",
                "reason": "Efficient key exchange for TLS",
                "performance": "high",
                "keySize": 384
            })
            
        if "password" in purpose or "key_derivation" in purpose:
            recommendations.append({
                "algorithm": "Argon2id",
                "type": "kdf",
                "reason": "Memory-hard function resistant to GPU attacks",
                "performance": "configurable"
            })
            
        if any(c.lower() in ["pci-dss", "hipaa", "sox"] for c in compliance):
            recommendations = [r for r in recommendations if r.get("keySize", 128) >= 128]
            recommendations.insert(0, {
                "note": "Compliance requires documented key management procedures"
            })
        
        if not recommendations:
            recommendations = [
                {
                    "algorithm": "AES-256-GCM",
                    "type": "symmetric",
                    "reason": "General-purpose encryption recommendation",
                    "performance": "high",
                    "keySize": 256
                },
                {
                    "algorithm": "RSA-4096",
                    "type": "asymmetric",
                    "reason": "General-purpose asymmetric encryption",
                    "performance": "medium",
                    "keySize": 4096
                }
            ]
        
        return {
            "useCase": purpose,
            "dataType": data_type,
            "recommendations": recommendations,
            "generatedAt": datetime.now().isoformat()
        }
    
    def _check_compliance(self, algorithm: str, rotation_enabled: bool) -> Dict[str, Any]:
        """Check compliance with common standards."""
        algo_info = self.algorithm_strength.get(algorithm, {})
        
        compliant_with = []
        non_compliant_with = []
        
        if algo_info.get("strength") in ["high", "medium"] and not algo_info.get("deprecated"):
            if rotation_enabled:
                compliant_with.extend(["PCI-DSS", "HIPAA", "SOX"])
            else:
                compliant_with.append("HIPAA")
                non_compliant_with.extend(["PCI-DSS", "SOX"])
        else:
            non_compliant_with.extend(["PCI-DSS", "HIPAA", "SOX"])
        
        return {
            "compliantWith": compliant_with,
            "nonCompliantWith": non_compliant_with
        }
