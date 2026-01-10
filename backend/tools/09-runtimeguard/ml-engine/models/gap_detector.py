"""
ComplianceCheck ML Engine - Gap Detector Model
Detect compliance gaps and issues
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class GapDetector:
    """
    Detect compliance gaps and prioritize remediation.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Critical control categories by framework
        self.critical_controls = {
            "SOC2": ["CC6.1", "CC6.2", "CC6.3", "CC7.1", "CC7.2"],
            "HIPAA": ["164.312(a)", "164.312(b)", "164.312(c)", "164.312(d)"],
            "PCI-DSS": ["3.4", "8.2", "10.1", "11.3", "12.1"],
            "GDPR": ["Art. 32", "Art. 33", "Art. 34", "Art. 25"],
            "ISO27001": ["A.9", "A.12", "A.13", "A.18"],
            "NIST": ["PR.AC", "PR.DS", "DE.CM", "RS.RP"]
        }
        
        logger.info(f"Gap Detector v{self.version} loaded")
    
    def detect_gaps(self, control: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect gaps in a single control"""
        
        gaps = []
        evidence = control.get("evidence", [])
        framework = control.get("framework", "")
        control_id = control.get("control_id", "")
        
        # Check for missing evidence
        if not evidence:
            gaps.append({
                "type": "MISSING_EVIDENCE",
                "severity": "HIGH",
                "description": "No evidence provided for this control",
                "remediation": "Collect and document evidence of control implementation"
            })
        
        # Check if control is in critical list
        is_critical = any(control_id.startswith(cc) for cc in self.critical_controls.get(framework, []))
        
        if is_critical and len(evidence) < 3:
            gaps.append({
                "type": "INSUFFICIENT_EVIDENCE",
                "severity": "CRITICAL",
                "description": "Critical control requires more comprehensive evidence",
                "remediation": "Provide policy, technical implementation, and testing evidence"
            })
        
        return gaps
    
    def analyze_audit(self, audit: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze full audit for gaps"""
        
        controls = audit.get("controls", [])
        framework = audit.get("framework", "")
        
        total = len(controls)
        compliant = 0
        non_compliant = 0
        partial = 0
        critical_gaps = []
        
        for control in controls:
            status = control.get("status", "").upper()
            
            if status == "COMPLIANT":
                compliant += 1
            elif status == "NON_COMPLIANT":
                non_compliant += 1
                # Check if critical
                control_id = control.get("control_id", "")
                is_critical = any(control_id.startswith(cc) for cc in self.critical_controls.get(framework, []))
                
                if is_critical:
                    critical_gaps.append({
                        "control_id": control_id,
                        "title": control.get("title", "Unknown"),
                        "severity": "CRITICAL",
                        "priority": 1
                    })
            elif status == "PARTIAL":
                partial += 1
        
        # Calculate compliance percentage
        compliance_pct = (compliant / total * 100) if total > 0 else 0
        
        # Calculate risk score (0-100, higher = more risk)
        risk_score = 100 - compliance_pct
        risk_score += len(critical_gaps) * 5  # Add penalty for critical gaps
        risk_score = min(risk_score, 100)
        
        return {
            "total_controls": total,
            "compliant": compliant,
            "non_compliant": non_compliant,
            "partial": partial,
            "compliance_percentage": round(compliance_pct, 1),
            "critical_gaps": critical_gaps,
            "risk_score": round(risk_score, 1)
        }
