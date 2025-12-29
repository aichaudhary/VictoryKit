"""
IncidentResponse ML Engine - Recommendation Engine Model
Generate response recommendations and playbooks
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """
    Generate incident response recommendations and playbook suggestions.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Response recommendations by incident type
        self.recommendations = {
            "ransomware": [
                "Immediately isolate affected systems from the network",
                "Preserve evidence before any recovery attempts",
                "Do NOT pay the ransom - consult with legal and law enforcement",
                "Check backup integrity and availability",
                "Identify the ransomware variant for potential decryptors",
                "Document all affected systems and data",
                "Engage incident response team and legal counsel",
                "Prepare communications for stakeholders"
            ],
            "phishing": [
                "Reset credentials for affected accounts immediately",
                "Block sender address and malicious URLs at email gateway",
                "Scan affected systems for malware",
                "Review email logs for similar messages to other users",
                "Alert potentially affected users",
                "Check for lateral movement from compromised accounts",
                "Update email security rules",
                "Conduct targeted security awareness training"
            ],
            "malware": [
                "Isolate infected endpoints from the network",
                "Collect malware samples for analysis",
                "Run IOC sweep across all endpoints",
                "Update antivirus/EDR signatures",
                "Analyze persistence mechanisms",
                "Check for command & control communications",
                "Review user actions leading to infection",
                "Prepare for potential data exfiltration"
            ],
            "data_breach": [
                "Identify the scope and type of data exposed",
                "Preserve all logs and evidence",
                "Assess regulatory notification requirements (GDPR, CCPA, etc.)",
                "Engage legal counsel immediately",
                "Identify attack vector and close the gap",
                "Prepare breach notification for affected parties",
                "Engage PR/communications team",
                "Review access controls and monitoring"
            ],
            "ddos": [
                "Enable DDoS mitigation services",
                "Contact upstream ISP for assistance",
                "Implement rate limiting and traffic filtering",
                "Identify attack vectors and source IPs",
                "Scale infrastructure if possible",
                "Prepare for potential secondary attacks",
                "Document impact on services",
                "Review and update DDoS response procedures"
            ],
            "insider_threat": [
                "Preserve all user activity logs and evidence",
                "Engage HR and legal departments",
                "Do NOT alert the suspected insider",
                "Review access permissions and recent activities",
                "Monitor for data exfiltration attempts",
                "Prepare for potential legal action",
                "Document chain of evidence carefully",
                "Review access controls and monitoring gaps"
            ],
            "apt": [
                "Assume widespread compromise",
                "Engage threat intelligence team",
                "Conduct thorough environment sweep",
                "Look for persistence mechanisms",
                "Plan for extended investigation timeline",
                "Consider engaging external IR support",
                "Review all privileged account activity",
                "Prepare for potential nation-state involvement"
            ],
            "unauthorized_access": [
                "Reset affected account credentials",
                "Review authentication logs",
                "Check for privilege escalation",
                "Implement additional authentication controls",
                "Review access policies",
                "Monitor for continued unauthorized attempts",
                "Update password policies if needed",
                "Consider MFA enforcement"
            ],
            "other": [
                "Gather additional information to classify incident",
                "Assess impact and scope",
                "Identify affected assets and data",
                "Document timeline of events",
                "Escalate to senior analysts as needed",
                "Preserve evidence",
                "Engage appropriate teams"
            ]
        }
        
        # Playbook templates
        self.playbook_templates = {
            "ransomware": {
                "name": "Ransomware Response Playbook",
                "phases": ["Identification", "Containment", "Eradication", "Recovery", "Lessons Learned"],
                "estimated_duration": "48-72 hours"
            },
            "phishing": {
                "name": "Phishing Response Playbook",
                "phases": ["Detection", "Analysis", "Containment", "Remediation", "Prevention"],
                "estimated_duration": "4-8 hours"
            },
            "malware": {
                "name": "Malware Incident Playbook",
                "phases": ["Detection", "Analysis", "Containment", "Eradication", "Recovery"],
                "estimated_duration": "8-24 hours"
            },
            "data_breach": {
                "name": "Data Breach Response Playbook",
                "phases": ["Discovery", "Investigation", "Notification", "Remediation", "Recovery"],
                "estimated_duration": "72+ hours"
            },
            "ddos": {
                "name": "DDoS Mitigation Playbook",
                "phases": ["Detection", "Mitigation", "Analysis", "Recovery"],
                "estimated_duration": "2-8 hours"
            },
            "insider_threat": {
                "name": "Insider Threat Response Playbook",
                "phases": ["Detection", "Investigation", "Evidence Collection", "Action", "Prevention"],
                "estimated_duration": "24-72 hours"
            },
            "apt": {
                "name": "APT Response Playbook",
                "phases": ["Detection", "Scoping", "Containment", "Eradication", "Recovery", "Hunt"],
                "estimated_duration": "Weeks to months"
            }
        }
        
        logger.info(f"Recommendation Engine v{self.version} loaded")
    
    def get_recommendations(self, classification: Dict[str, Any]) -> List[str]:
        """Get recommendations for an incident type"""
        
        inc_type = classification.get("type", "other")
        return self.recommendations.get(inc_type, self.recommendations["other"])
    
    def get_playbooks(self, incident_type: str) -> List[str]:
        """Get suggested playbook names for incident type"""
        
        playbook_mapping = {
            "ransomware": ["Ransomware Response", "Data Recovery", "Business Continuity"],
            "phishing": ["Phishing Response", "Credential Compromise", "Email Security"],
            "malware": ["Malware Containment", "Endpoint Investigation", "IOC Sweep"],
            "data_breach": ["Data Breach Response", "Regulatory Notification", "Evidence Preservation"],
            "ddos": ["DDoS Mitigation", "Service Restoration", "Attack Analysis"],
            "insider_threat": ["Insider Threat Response", "Evidence Collection", "HR Coordination"],
            "apt": ["APT Response", "Threat Hunting", "Extended Investigation"],
            "unauthorized_access": ["Access Compromise Response", "Credential Reset", "Access Review"]
        }
        
        return playbook_mapping.get(incident_type, ["General Incident Response"])
    
    def get_playbook_templates(self) -> List[Dict[str, Any]]:
        """Get all playbook templates"""
        
        return [
            {"type": k, **v} for k, v in self.playbook_templates.items()
        ]
