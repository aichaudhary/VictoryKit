"""
CloudArmor ML Engine - Posture Analyzer
Analyze cloud security posture
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class PostureAnalyzer:
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        logger.info(f"Posture Analyzer v{self.version} loaded")
    
    def analyze(self, resource: Dict[str, Any], misconfigurations: List[Dict]) -> Dict[str, Any]:
        base_score = 100
        recommendations = []
        
        # Deduct points for each misconfiguration
        severity_deductions = {
            "critical": 30, "high": 20, "medium": 10, "low": 5
        }
        
        for misconfig in misconfigurations:
            severity = misconfig.get("severity", "medium")
            base_score -= severity_deductions.get(severity, 10)
            
            if misconfig.get("recommendation"):
                recommendations.append(misconfig["recommendation"])
        
        # Ensure score is between 0-100
        score = max(0, min(100, base_score))
        
        # Determine risk level
        if score >= 80:
            risk_level = "low"
        elif score >= 60:
            risk_level = "medium"
        elif score >= 40:
            risk_level = "high"
        else:
            risk_level = "critical"
        
        return {
            "score": score,
            "risk_level": risk_level,
            "recommendations": recommendations[:5]
        }
    
    def analyze_finding(self, finding: Dict[str, Any]) -> Dict[str, Any]:
        severity = finding.get("severity", "medium")
        category = finding.get("category", "configuration")
        
        severity_scores = {
            "critical": 95, "high": 75, "medium": 50, "low": 25, "info": 10
        }
        risk_score = severity_scores.get(severity, 50)
        
        # Adjust based on category
        high_risk_categories = ["public_exposure", "access_control", "identity"]
        if category in high_risk_categories:
            risk_score = min(100, risk_score + 10)
        
        exploitability = "High" if risk_score > 70 else "Medium" if risk_score > 40 else "Low"
        impact = "Severe" if severity == "critical" else "Significant" if severity == "high" else "Moderate"
        
        return {
            "riskScore": risk_score,
            "exploitability": exploitability,
            "impact": impact,
            "confidence": 0.85
        }
