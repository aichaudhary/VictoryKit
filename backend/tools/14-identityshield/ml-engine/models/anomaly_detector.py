"""
IdentityShield ML Engine - Anomaly Detector
Detect anomalous identity activities
"""

import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)


class AnomalyDetector:
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        self.suspicious_patterns = [
            {
                "name": "off_hours_access",
                "description": "Access outside business hours",
                "severity": "medium"
            },
            {
                "name": "unusual_location",
                "description": "Access from unusual location",
                "severity": "high"
            },
            {
                "name": "rapid_api_calls",
                "description": "Unusually high API call rate",
                "severity": "high"
            },
            {
                "name": "privilege_escalation",
                "description": "Attempt to escalate privileges",
                "severity": "critical"
            },
            {
                "name": "credential_exposure",
                "description": "Credentials accessed or exposed",
                "severity": "critical"
            },
            {
                "name": "data_exfiltration",
                "description": "Large data download pattern",
                "severity": "critical"
            }
        ]
        
        self.sensitive_actions = [
            "iam:CreateUser",
            "iam:CreateAccessKey",
            "iam:AttachUserPolicy",
            "iam:AttachRolePolicy",
            "sts:AssumeRole",
            "s3:GetObject",
            "secretsmanager:GetSecretValue",
            "kms:Decrypt"
        ]
        
        logger.info(f"Anomaly Detector v{self.version} loaded")
    
    def detect(self, data: Dict[str, Any]) -> Dict[str, Any]:
        identity_id = data.get("identityId")
        activities = data.get("activities", [])
        
        anomalies = []
        risk_score = 0
        
        # Analyze activity patterns
        for activity in activities:
            activity_anomalies = self._analyze_activity(activity)
            anomalies.extend(activity_anomalies)
        
        # Check for rapid API calls
        if len(activities) > 100:
            anomalies.append({
                "type": "RAPID_API_CALLS",
                "severity": "high",
                "description": f"High volume of API calls: {len(activities)}",
                "confidence": 0.85
            })
            risk_score += 25
        
        # Check for privilege escalation attempts
        priv_esc = [a for a in activities if a.get("action", "").startswith("iam:")]
        if len(priv_esc) > 5:
            anomalies.append({
                "type": "PRIVILEGE_ESCALATION_ATTEMPT",
                "severity": "critical",
                "description": f"Multiple IAM operations detected: {len(priv_esc)}",
                "confidence": 0.9
            })
            risk_score += 35
        
        # Check for data access patterns
        data_access = [a for a in activities 
                       if "GetObject" in a.get("action", "") or "Get" in a.get("action", "")]
        if len(data_access) > 50:
            anomalies.append({
                "type": "DATA_EXFILTRATION_RISK",
                "severity": "high",
                "description": f"Large number of data access operations: {len(data_access)}",
                "confidence": 0.75
            })
            risk_score += 30
        
        # Check for sensitive action usage
        sensitive_used = [a for a in activities if a.get("action") in self.sensitive_actions]
        if sensitive_used:
            for sa in sensitive_used[:5]:
                anomalies.append({
                    "type": "SENSITIVE_ACTION",
                    "severity": "medium",
                    "description": f"Sensitive action: {sa.get('action')}",
                    "confidence": 0.8
                })
            risk_score += len(sensitive_used) * 5
        
        risk_score = min(100, risk_score)
        
        return {
            "identityId": identity_id,
            "anomalyScore": risk_score,
            "riskLevel": self._get_risk_level(risk_score),
            "anomalies": anomalies[:20],
            "activityCount": len(activities),
            "recommendations": self._get_recommendations(anomalies),
            "detectedAt": datetime.utcnow().isoformat()
        }
    
    def _analyze_activity(self, activity: Dict[str, Any]) -> List[Dict[str, Any]]:
        anomalies = []
        
        timestamp = activity.get("timestamp")
        source_ip = activity.get("sourceIp", "")
        action = activity.get("action", "")
        status = activity.get("status", "success")
        
        # Check for off-hours access
        if timestamp:
            try:
                ts = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                hour = ts.hour
                if hour < 6 or hour > 22:
                    anomalies.append({
                        "type": "OFF_HOURS_ACCESS",
                        "severity": "medium",
                        "description": f"Activity at unusual hour: {hour}:00",
                        "confidence": 0.7
                    })
            except (ValueError, TypeError):
                pass
        
        # Check for failed sensitive actions
        if status == "failure" and action in self.sensitive_actions:
            anomalies.append({
                "type": "FAILED_SENSITIVE_ACTION",
                "severity": "high",
                "description": f"Failed attempt: {action}",
                "confidence": 0.85
            })
        
        # Check for unusual IP patterns
        if source_ip and not source_ip.startswith(("10.", "172.16.", "192.168.")):
            if "amazonaws" not in source_ip.lower():
                anomalies.append({
                    "type": "EXTERNAL_IP",
                    "severity": "low",
                    "description": f"Access from external IP: {source_ip}",
                    "confidence": 0.6
                })
        
        return anomalies
    
    def _get_recommendations(self, anomalies: List[Dict[str, Any]]) -> List[str]:
        recommendations = []
        
        anomaly_types = set(a.get("type") for a in anomalies)
        
        if "PRIVILEGE_ESCALATION_ATTEMPT" in anomaly_types:
            recommendations.append("Immediately review IAM activity and consider disabling access")
        
        if "DATA_EXFILTRATION_RISK" in anomaly_types:
            recommendations.append("Investigate data access patterns and implement DLP controls")
        
        if "OFF_HOURS_ACCESS" in anomaly_types:
            recommendations.append("Verify if off-hours access is authorized")
        
        if "FAILED_SENSITIVE_ACTION" in anomaly_types:
            recommendations.append("Investigate failed access attempts for potential breach")
        
        if not recommendations:
            recommendations.append("Continue monitoring identity activity")
        
        return recommendations
    
    def _get_risk_level(self, score: int) -> str:
        if score >= 70:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 25:
            return "medium"
        return "low"
