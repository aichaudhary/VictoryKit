"""
CryptoVault - Secret Analyzer
Analyzes secrets and credentials for security risks
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List
import re


class SecretAnalyzer:
    """Analyzes secrets for security vulnerabilities and best practices."""
    
    def __init__(self):
        self.high_risk_types = [
            "database_credential",
            "api_key",
            "ssh_key",
            "oauth_token",
            "password"
        ]
        
        self.rotation_recommendations = {
            "api_key": 90,
            "database_credential": 90,
            "oauth_token": 30,
            "ssh_key": 365,
            "password": 90,
            "certificate": 365,
            "generic": 180
        }
    
    def analyze(self, secret_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive secret security analysis."""
        risk_score = 0
        risk_factors = []
        recommendations = []
        
        name = secret_data.get("name", "")
        secret_type = secret_data.get("type", "generic")
        rotation = secret_data.get("rotation", {})
        usage = secret_data.get("usage", {})
        metadata = secret_data.get("metadata", {})
        
        # High-risk secret type analysis
        if secret_type in self.high_risk_types:
            risk_score += 10
            risk_factors.append({
                "factor": "HIGH_RISK_SECRET_TYPE",
                "severity": "info",
                "description": f"{secret_type} is a high-value target for attackers",
                "impact": "Requires additional protection measures"
            })
        
        # Rotation analysis
        rotation_enabled = rotation.get("enabled", False)
        last_rotated = rotation.get("lastRotated")
        interval_days = rotation.get("intervalDays", self.rotation_recommendations.get(secret_type, 180))
        
        if not rotation_enabled:
            risk_score += 25
            risk_factors.append({
                "factor": "NO_AUTOMATIC_ROTATION",
                "severity": "high",
                "description": "Automatic secret rotation is not configured",
                "impact": "Secrets may remain valid indefinitely after compromise"
            })
            recommendations.append({
                "priority": "high",
                "action": "Enable automatic secret rotation",
                "description": f"Recommended rotation interval: {self.rotation_recommendations.get(secret_type, 180)} days"
            })
        
        if last_rotated:
            try:
                last_rotated_date = datetime.fromisoformat(last_rotated.replace("Z", "+00:00"))
                now = datetime.now(last_rotated_date.tzinfo) if last_rotated_date.tzinfo else datetime.now()
                days_since = (now - last_rotated_date).days
                
                recommended_interval = self.rotation_recommendations.get(secret_type, 180)
                
                if days_since > recommended_interval * 2:
                    risk_score += 30
                    risk_factors.append({
                        "factor": "SEVERELY_OVERDUE_ROTATION",
                        "severity": "critical",
                        "description": f"Secret not rotated in {days_since} days (recommended: {recommended_interval})",
                        "impact": "Significantly increased risk of compromise"
                    })
                    recommendations.append({
                        "priority": "critical",
                        "action": "Rotate secret immediately",
                        "description": "Secret age significantly exceeds recommended maximum"
                    })
                elif days_since > recommended_interval:
                    risk_score += 20
                    risk_factors.append({
                        "factor": "OVERDUE_ROTATION",
                        "severity": "high",
                        "description": f"Secret rotation overdue by {days_since - recommended_interval} days",
                        "impact": "Increased risk of undetected compromise"
                    })
                    recommendations.append({
                        "priority": "high",
                        "action": "Rotate secret soon",
                        "description": "Schedule rotation within the next week"
                    })
                elif days_since > recommended_interval * 0.8:
                    risk_factors.append({
                        "factor": "ROTATION_DUE_SOON",
                        "severity": "info",
                        "description": f"Secret rotation due in {recommended_interval - days_since} days",
                        "impact": None
                    })
            except (ValueError, TypeError):
                pass
        
        # Usage pattern analysis
        access_count = usage.get("accessCount", 0)
        last_accessed = usage.get("lastAccessed")
        
        if access_count == 0:
            risk_factors.append({
                "factor": "UNUSED_SECRET",
                "severity": "low",
                "description": "Secret has never been accessed",
                "impact": "May be orphaned or unnecessary"
            })
            recommendations.append({
                "priority": "low",
                "action": "Review secret necessity",
                "description": "Consider removing unused secrets"
            })
        elif access_count > 10000 and not rotation_enabled:
            risk_score += 15
            risk_factors.append({
                "factor": "HIGH_ACCESS_NO_ROTATION",
                "severity": "high",
                "description": f"Secret accessed {access_count:,} times without rotation",
                "impact": "High-frequency secrets should rotate more often"
            })
        
        # Check last access timing
        if last_accessed:
            try:
                last_access_date = datetime.fromisoformat(last_accessed.replace("Z", "+00:00"))
                now = datetime.now(last_access_date.tzinfo) if last_access_date.tzinfo else datetime.now()
                days_since_access = (now - last_access_date).days
                
                if days_since_access > 180:
                    risk_factors.append({
                        "factor": "STALE_SECRET",
                        "severity": "low",
                        "description": f"Secret not accessed in {days_since_access} days",
                        "impact": "May be unused and eligible for removal"
                    })
            except (ValueError, TypeError):
                pass
        
        # Naming convention analysis
        name_issues = self._analyze_name(name, secret_type)
        risk_factors.extend(name_issues["factors"])
        risk_score += name_issues["score"]
        
        # Environment analysis
        environment = metadata.get("environment", "")
        if environment.lower() in ["production", "prod"]:
            risk_factors.append({
                "factor": "PRODUCTION_SECRET",
                "severity": "info",
                "description": "This is a production environment secret",
                "impact": "Requires stricter access controls"
            })
            if not rotation_enabled:
                risk_score += 10
                recommendations.append({
                    "priority": "high",
                    "action": "Production secrets require automatic rotation",
                    "description": "Enable rotation for all production secrets"
                })
        
        # Calculate risk level
        risk_level = "critical" if risk_score >= 60 else "high" if risk_score >= 40 else "medium" if risk_score >= 20 else "low"
        
        return {
            "secretId": secret_data.get("secretId"),
            "name": name,
            "type": secret_type,
            "riskScore": min(100, risk_score),
            "riskLevel": risk_level,
            "riskFactors": risk_factors,
            "recommendations": recommendations,
            "rotationStatus": self._get_rotation_status(rotation, secret_type),
            "analyzedAt": datetime.now().isoformat()
        }
    
    def _analyze_name(self, name: str, secret_type: str) -> Dict[str, Any]:
        """Analyze secret name for security issues."""
        factors = []
        score = 0
        
        # Check for sensitive info in name
        sensitive_patterns = [
            (r'password', "Password keyword in name"),
            (r'secret', "Secret keyword in name"),
            (r'key', "Key keyword in name"),
            (r'token', "Token keyword in name"),
            (r'credential', "Credential keyword in name")
        ]
        
        lower_name = name.lower()
        for pattern, description in sensitive_patterns:
            if re.search(pattern, lower_name):
                factors.append({
                    "factor": "SENSITIVE_NAME",
                    "severity": "info",
                    "description": description,
                    "impact": "Name reveals secret purpose (acceptable but notable)"
                })
                break
        
        # Check for environment in name (good practice)
        env_patterns = [r'prod', r'staging', r'dev', r'test']
        has_env = any(re.search(p, lower_name) for p in env_patterns)
        
        if not has_env:
            factors.append({
                "factor": "MISSING_ENV_INDICATOR",
                "severity": "info",
                "description": "Secret name doesn't indicate environment",
                "impact": "Consider adding environment prefix/suffix"
            })
        
        return {"factors": factors, "score": score}
    
    def _get_rotation_status(self, rotation: Dict[str, Any], secret_type: str) -> Dict[str, Any]:
        """Get detailed rotation status."""
        enabled = rotation.get("enabled", False)
        last_rotated = rotation.get("lastRotated")
        interval = rotation.get("intervalDays", self.rotation_recommendations.get(secret_type, 180))
        
        status = {
            "enabled": enabled,
            "intervalDays": interval,
            "recommendedIntervalDays": self.rotation_recommendations.get(secret_type, 180)
        }
        
        if last_rotated:
            try:
                last_date = datetime.fromisoformat(last_rotated.replace("Z", "+00:00"))
                now = datetime.now(last_date.tzinfo) if last_date.tzinfo else datetime.now()
                days_since = (now - last_date).days
                next_rotation = last_date + timedelta(days=interval)
                
                status["lastRotated"] = last_rotated
                status["daysSinceRotation"] = days_since
                status["nextRotation"] = next_rotation.isoformat()
                status["overdue"] = days_since > interval
            except (ValueError, TypeError):
                status["parseError"] = True
        
        return status
