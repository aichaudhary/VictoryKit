"""
IdentityShield ML Engine - Identity Analyzer
Analyze identity risk and security posture
"""

import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class IdentityAnalyzer:
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        self.risk_weights = {
            "no_mfa": 25,
            "multiple_access_keys": 10,
            "old_access_keys": 15,
            "privileged_access": 20,
            "inactive": 5,
            "no_recent_password_change": 10,
            "failed_logins": 15,
            "cross_account_access": 10
        }
        
        logger.info(f"Identity Analyzer v{self.version} loaded")
    
    def analyze(self, identity: Dict[str, Any]) -> Dict[str, Any]:
        risk_score = 0
        risk_factors = []
        recommendations = []
        
        auth = identity.get("authentication", {})
        permissions = identity.get("permissions", [])
        roles = identity.get("roles", [])
        
        # Check MFA
        if not auth.get("mfaEnabled"):
            risk_score += self.risk_weights["no_mfa"]
            risk_factors.append({
                "factor": "NO_MFA",
                "severity": "high",
                "description": "Multi-factor authentication is not enabled"
            })
            recommendations.append("Enable MFA immediately for this identity")
        
        # Check access keys
        access_keys = auth.get("accessKeys", [])
        if len(access_keys) > 1:
            risk_score += self.risk_weights["multiple_access_keys"]
            risk_factors.append({
                "factor": "MULTIPLE_ACCESS_KEYS",
                "severity": "medium",
                "description": f"Identity has {len(access_keys)} access keys"
            })
            recommendations.append("Reduce to single access key and rotate regularly")
        
        # Check for old access keys
        for key in access_keys:
            if key.get("createdAt"):
                try:
                    created = datetime.fromisoformat(key["createdAt"].replace("Z", "+00:00"))
                    if datetime.now(created.tzinfo) - created > timedelta(days=90):
                        risk_score += self.risk_weights["old_access_keys"]
                        risk_factors.append({
                            "factor": "OLD_ACCESS_KEY",
                            "severity": "high",
                            "description": f"Access key {key.get('keyId', 'unknown')} is over 90 days old"
                        })
                        recommendations.append("Rotate access keys every 90 days")
                        break
                except (ValueError, TypeError):
                    pass
        
        # Check privileged permissions
        privileged_count = sum(1 for p in permissions if p.get("isPrivileged"))
        if privileged_count > 0:
            risk_score += min(self.risk_weights["privileged_access"] * privileged_count, 40)
            risk_factors.append({
                "factor": "PRIVILEGED_ACCESS",
                "severity": "high" if privileged_count > 3 else "medium",
                "description": f"{privileged_count} privileged permissions assigned"
            })
            recommendations.append("Review and minimize privileged access")
        
        # Check failed login attempts
        failed_attempts = auth.get("failedAttempts", 0)
        if failed_attempts > 3:
            risk_score += self.risk_weights["failed_logins"]
            risk_factors.append({
                "factor": "FAILED_LOGINS",
                "severity": "high" if failed_attempts > 5 else "medium",
                "description": f"{failed_attempts} failed login attempts detected"
            })
            recommendations.append("Investigate suspicious login activity")
        
        # Check cross-account roles
        cross_account_roles = sum(
            1 for r in roles if r.get("type") == "cross_account"
        )
        if cross_account_roles > 0:
            risk_score += self.risk_weights["cross_account_access"]
            risk_factors.append({
                "factor": "CROSS_ACCOUNT_ACCESS",
                "severity": "medium",
                "description": f"Identity has {cross_account_roles} cross-account role(s)"
            })
        
        risk_score = min(100, risk_score)
        
        if risk_score >= 70:
            risk_level = "critical"
        elif risk_score >= 50:
            risk_level = "high"
        elif risk_score >= 25:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            "identityId": identity.get("identityId"),
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "riskFactors": risk_factors,
            "recommendations": recommendations,
            "analyzedAt": datetime.utcnow().isoformat()
        }
    
    def get_recommendations(self, identity_id: str) -> Dict[str, Any]:
        return {
            "identityId": identity_id,
            "recommendations": [
                {
                    "priority": "high",
                    "category": "authentication",
                    "action": "Enable MFA",
                    "description": "Enable multi-factor authentication for enhanced security"
                },
                {
                    "priority": "high",
                    "category": "access_keys",
                    "action": "Rotate access keys",
                    "description": "Rotate access keys every 90 days"
                },
                {
                    "priority": "medium",
                    "category": "permissions",
                    "action": "Review permissions",
                    "description": "Audit and remove unnecessary permissions"
                },
                {
                    "priority": "medium",
                    "category": "monitoring",
                    "action": "Enable activity logging",
                    "description": "Enable CloudTrail logging for this identity"
                }
            ]
        }
