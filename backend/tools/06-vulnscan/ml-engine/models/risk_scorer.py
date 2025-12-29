"""
VulnScan ML Engine - Risk Scorer Model
Calculate risk scores for targets and vulnerabilities
"""

import numpy as np
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class RiskScorer:
    """
    Risk assessment and scoring for vulnerability management.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Target type risk multipliers
        self.target_multipliers = {
            "host": 1.0,
            "application": 1.2,
            "network": 1.3,
            "container": 0.9,
            "database": 1.5,
            "api": 1.2
        }
        
        # Service criticality
        self.service_criticality = {
            "ssh": 1.3,
            "rdp": 1.4,
            "http": 1.0,
            "https": 1.0,
            "ftp": 1.2,
            "telnet": 1.5,
            "mysql": 1.4,
            "postgresql": 1.4,
            "mongodb": 1.3,
            "redis": 1.2,
            "smb": 1.4,
            "ldap": 1.3
        }
        
        logger.info(f"Risk Scorer v{self.version} loaded")
    
    def assess(self, target: Dict[str, Any], vulns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess overall risk for a target"""
        
        target_type = target.get("target_type", "host")
        services = target.get("services", [])
        ports = target.get("ports", [])
        
        # Calculate base risk from target type
        target_multiplier = self.target_multipliers.get(target_type, 1.0)
        
        # Calculate service risk
        service_risk = 0
        for service in services:
            service_risk += self.service_criticality.get(service.lower(), 1.0)
        
        # Calculate vulnerability risk
        vuln_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
        vuln_risks = []
        
        for vuln in vulns:
            severity = self._estimate_severity(vuln)
            vuln_counts[severity] += 1
            vuln_risks.append({
                "vuln_id": vuln.get("vuln_id"),
                "title": vuln.get("title"),
                "severity": severity,
                "risk_contribution": self._severity_to_risk(severity)
            })
        
        # Calculate overall risk score
        vuln_score = (
            vuln_counts["CRITICAL"] * 10 +
            vuln_counts["HIGH"] * 7 +
            vuln_counts["MEDIUM"] * 4 +
            vuln_counts["LOW"] * 1
        )
        
        # Normalize and apply multipliers
        base_risk = min(vuln_score * target_multiplier, 100)
        exposure = self._calculate_exposure(ports, services)
        
        overall_risk = (base_risk * 0.7 + exposure * 0.3)
        risk_level = self._risk_to_level(overall_risk)
        
        # Get attack surface assessment
        attack_surface = self._assess_attack_surface(ports, services, target_type)
        
        # Sort top risks
        top_risks = sorted(vuln_risks, key=lambda x: x["risk_contribution"], reverse=True)[:5]
        
        return {
            "risk_score": round(overall_risk, 1),
            "risk_level": risk_level,
            "vuln_count": vuln_counts,
            "top_risks": top_risks,
            "exposure_score": round(exposure, 1),
            "attack_surface": attack_surface
        }
    
    def _estimate_severity(self, vuln: Dict[str, Any]) -> str:
        """Estimate vulnerability severity"""
        
        title = vuln.get("title", "").lower()
        description = vuln.get("description", "").lower()
        
        critical_keywords = ["remote code execution", "rce", "unauthenticated"]
        high_keywords = ["sql injection", "authentication bypass", "privilege escalation"]
        medium_keywords = ["cross-site scripting", "xss", "csrf"]
        
        text = f"{title} {description}"
        
        if any(kw in text for kw in critical_keywords):
            return "CRITICAL"
        elif any(kw in text for kw in high_keywords):
            return "HIGH"
        elif any(kw in text for kw in medium_keywords):
            return "MEDIUM"
        else:
            return "LOW"
    
    def _severity_to_risk(self, severity: str) -> float:
        """Convert severity to risk contribution"""
        
        mapping = {
            "CRITICAL": 10.0,
            "HIGH": 7.0,
            "MEDIUM": 4.0,
            "LOW": 1.0,
            "INFO": 0.0
        }
        return mapping.get(severity, 1.0)
    
    def _calculate_exposure(self, ports: List[int], services: List[str]) -> float:
        """Calculate exposure score"""
        
        # High risk ports
        high_risk_ports = {21, 22, 23, 25, 53, 110, 135, 139, 445, 1433, 1521, 3306, 3389, 5432}
        
        exposure = 0
        for port in ports:
            if port in high_risk_ports:
                exposure += 10
            elif port < 1024:
                exposure += 5
            else:
                exposure += 2
        
        # Service exposure
        exposure += len(services) * 3
        
        return min(exposure, 100)
    
    def _risk_to_level(self, risk_score: float) -> str:
        """Convert risk score to level"""
        
        if risk_score >= 80:
            return "CRITICAL"
        elif risk_score >= 60:
            return "HIGH"
        elif risk_score >= 40:
            return "MEDIUM"
        elif risk_score >= 20:
            return "LOW"
        else:
            return "MINIMAL"
    
    def _assess_attack_surface(self, ports: List[int], services: List[str], target_type: str) -> str:
        """Assess attack surface size"""
        
        surface_score = len(ports) * 2 + len(services) * 3
        
        if target_type in ["network", "application"]:
            surface_score *= 1.5
        
        if surface_score >= 50:
            return "LARGE"
        elif surface_score >= 25:
            return "MEDIUM"
        else:
            return "SMALL"
