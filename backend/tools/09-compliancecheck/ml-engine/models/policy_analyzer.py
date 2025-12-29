"""
ComplianceCheck ML Engine - Policy Analyzer Model
Analyze compliance policies and controls
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class PolicyAnalyzer:
    """
    Analyze compliance policies and determine compliance status.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Framework definitions
        self.frameworks = {
            "SOC2": {
                "name": "SOC 2 Type II",
                "categories": ["Security", "Availability", "Processing Integrity", "Confidentiality", "Privacy"],
                "control_count": 64
            },
            "HIPAA": {
                "name": "HIPAA Security Rule",
                "categories": ["Administrative", "Physical", "Technical"],
                "control_count": 54
            },
            "PCI-DSS": {
                "name": "PCI DSS v4.0",
                "categories": ["Build Secure Network", "Protect Cardholder Data", "Maintain Vulnerability Program", "Access Control", "Monitor Networks", "Security Policy"],
                "control_count": 78
            },
            "GDPR": {
                "name": "General Data Protection Regulation",
                "categories": ["Lawfulness", "Data Subject Rights", "Security", "Accountability"],
                "control_count": 43
            },
            "ISO27001": {
                "name": "ISO 27001:2022",
                "categories": ["Organizational", "People", "Physical", "Technological"],
                "control_count": 93
            },
            "NIST": {
                "name": "NIST Cybersecurity Framework",
                "categories": ["Identify", "Protect", "Detect", "Respond", "Recover"],
                "control_count": 108
            }
        }
        
        # Evidence keywords for compliance assessment
        self.evidence_keywords = {
            "policy": ["policy", "procedure", "standard", "guideline"],
            "technical": ["configuration", "setting", "implementation", "control"],
            "documentation": ["document", "record", "log", "audit trail"],
            "training": ["training", "awareness", "education", "certification"],
            "testing": ["test", "assessment", "review", "audit"]
        }
        
        logger.info(f"Policy Analyzer v{self.version} loaded")
    
    def analyze(self, control: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a single control for compliance"""
        
        framework = control.get("framework", "")
        description = control.get("description", "").lower()
        evidence = control.get("evidence", [])
        current_status = control.get("status")
        
        # Calculate evidence score
        evidence_score = self._calculate_evidence_score(evidence, description)
        
        # Determine compliance status
        if current_status:
            status = current_status.upper()
        else:
            status = self._determine_status(evidence_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(control, evidence_score)
        
        return {
            "status": status,
            "score": evidence_score,
            "recommendations": recommendations
        }
    
    def get_framework_requirements(self, framework: str) -> Dict[str, Any]:
        """Get framework requirements"""
        
        framework_upper = framework.upper()
        if framework_upper in self.frameworks:
            fw = self.frameworks[framework_upper]
            return {
                "framework": framework_upper,
                "name": fw["name"],
                "categories": fw["categories"],
                "total_controls": fw["control_count"],
                "description": f"{fw['name']} compliance framework"
            }
        
        return {"error": f"Framework {framework} not found"}
    
    def _calculate_evidence_score(self, evidence: List[str], description: str) -> float:
        """Calculate evidence score"""
        
        if not evidence:
            return 0.0
        
        score = 0
        max_score = 100
        
        # Check for evidence types
        evidence_text = " ".join(evidence).lower()
        
        for category, keywords in self.evidence_keywords.items():
            if any(kw in evidence_text for kw in keywords):
                score += 20
        
        # Cap at 100
        return min(score, max_score)
    
    def _determine_status(self, evidence_score: float) -> str:
        """Determine compliance status from score"""
        
        if evidence_score >= 80:
            return "COMPLIANT"
        elif evidence_score >= 50:
            return "PARTIAL"
        elif evidence_score > 0:
            return "NON_COMPLIANT"
        else:
            return "NOT_APPLICABLE"
    
    def _generate_recommendations(self, control: Dict[str, Any], score: float) -> List[str]:
        """Generate recommendations for control"""
        
        recommendations = []
        evidence = control.get("evidence", [])
        evidence_text = " ".join(evidence).lower() if evidence else ""
        
        if score < 80:
            if not any(kw in evidence_text for kw in self.evidence_keywords["policy"]):
                recommendations.append("Document formal policy and procedures for this control")
            
            if not any(kw in evidence_text for kw in self.evidence_keywords["technical"]):
                recommendations.append("Implement technical controls and document configurations")
            
            if not any(kw in evidence_text for kw in self.evidence_keywords["testing"]):
                recommendations.append("Conduct regular testing and maintain audit evidence")
            
            if not any(kw in evidence_text for kw in self.evidence_keywords["training"]):
                recommendations.append("Provide training and awareness programs for staff")
        
        if not recommendations:
            recommendations.append("Maintain current compliance posture with regular reviews")
        
        return recommendations
