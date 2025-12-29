"""
ComplianceCheck ML Engine - Report Engine Model
Generate compliance reports
"""

import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)


class ReportEngine:
    """
    Generate compliance assessment reports.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        logger.info(f"Report Engine v{self.version} loaded")
    
    def generate(self, audit: Dict[str, Any]) -> Dict[str, Any]:
        """Generate compliance report"""
        
        framework = audit.get("framework", "")
        controls = audit.get("controls", [])
        
        # Analyze controls
        analysis = self._analyze_controls(controls)
        
        # Generate executive summary
        executive_summary = self._generate_executive_summary(framework, analysis)
        
        # Generate findings
        findings = self._generate_findings(controls)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(analysis, framework)
        
        return {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "executive_summary": executive_summary,
            "compliance_score": analysis["compliance_score"],
            "findings": findings,
            "recommendations": recommendations
        }
    
    def _analyze_controls(self, controls: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze controls for report"""
        
        total = len(controls)
        compliant = sum(1 for c in controls if c.get("status", "").upper() == "COMPLIANT")
        non_compliant = sum(1 for c in controls if c.get("status", "").upper() == "NON_COMPLIANT")
        partial = sum(1 for c in controls if c.get("status", "").upper() == "PARTIAL")
        
        compliance_score = (compliant + partial * 0.5) / total * 100 if total > 0 else 0
        
        return {
            "total": total,
            "compliant": compliant,
            "non_compliant": non_compliant,
            "partial": partial,
            "compliance_score": round(compliance_score, 1)
        }
    
    def _generate_executive_summary(self, framework: str, analysis: Dict[str, Any]) -> str:
        """Generate executive summary"""
        
        score = analysis["compliance_score"]
        total = analysis["total"]
        compliant = analysis["compliant"]
        non_compliant = analysis["non_compliant"]
        
        # Determine overall status
        if score >= 90:
            status = "excellent"
            risk = "LOW"
        elif score >= 70:
            status = "satisfactory"
            risk = "MEDIUM"
        elif score >= 50:
            status = "needs improvement"
            risk = "HIGH"
        else:
            status = "critical attention required"
            risk = "CRITICAL"
        
        summary = f"""This compliance assessment evaluated {total} controls against the {framework} framework.

Overall Compliance Score: {score:.1f}%
Status: The organization's compliance posture is {status}.

Key Findings:
- {compliant} controls ({compliant/total*100:.0f}%) are fully compliant
- {non_compliant} controls ({non_compliant/total*100:.0f}%) are non-compliant
- {analysis['partial']} controls ({analysis['partial']/total*100:.0f}%) are partially compliant

Risk Level: {risk}

"""
        
        if non_compliant > 0:
            summary += "Immediate action is recommended to address non-compliant controls."
        else:
            summary += "Continue monitoring and maintaining current compliance controls."
        
        return summary
    
    def _generate_findings(self, controls: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate findings list"""
        
        findings = []
        
        # Sort by status (non-compliant first)
        status_order = {"NON_COMPLIANT": 0, "PARTIAL": 1, "COMPLIANT": 2, "NOT_APPLICABLE": 3}
        sorted_controls = sorted(
            controls,
            key=lambda x: status_order.get(x.get("status", "").upper(), 4)
        )
        
        for control in sorted_controls:
            status = control.get("status", "").upper()
            if status in ["NON_COMPLIANT", "PARTIAL"]:
                findings.append({
                    "control_id": control.get("control_id"),
                    "title": control.get("title"),
                    "status": status,
                    "description": control.get("description", ""),
                    "risk_level": "HIGH" if status == "NON_COMPLIANT" else "MEDIUM",
                    "remediation_priority": 1 if status == "NON_COMPLIANT" else 2
                })
        
        return findings[:20]  # Top 20 findings
    
    def _generate_recommendations(self, analysis: Dict[str, Any], framework: str) -> List[Dict[str, Any]]:
        """Generate recommendations"""
        
        recommendations = []
        
        if analysis["non_compliant"] > 0:
            recommendations.append({
                "priority": "HIGH",
                "title": "Address Non-Compliant Controls",
                "description": f"Remediate {analysis['non_compliant']} non-compliant controls to reduce risk exposure",
                "timeline": "30 days"
            })
        
        if analysis["partial"] > 0:
            recommendations.append({
                "priority": "MEDIUM",
                "title": "Complete Partial Controls",
                "description": f"Finish implementation of {analysis['partial']} partially compliant controls",
                "timeline": "60 days"
            })
        
        recommendations.append({
            "priority": "LOW",
            "title": "Establish Continuous Monitoring",
            "description": "Implement ongoing compliance monitoring and regular assessments",
            "timeline": "90 days"
        })
        
        recommendations.append({
            "priority": "LOW",
            "title": "Document Evidence",
            "description": "Maintain comprehensive evidence documentation for all controls",
            "timeline": "Ongoing"
        })
        
        return recommendations
