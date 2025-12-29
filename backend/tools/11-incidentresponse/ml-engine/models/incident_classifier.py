"""
IncidentResponse ML Engine - Incident Classifier Model
Classify security incidents using MITRE ATT&CK framework
"""

import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class IncidentClassifier:
    """
    Classify security incidents based on indicators and descriptions.
    Maps to MITRE ATT&CK framework.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Incident type patterns
        self.type_patterns = {
            "ransomware": {
                "keywords": ["ransomware", "encrypt", "ransom", "bitcoin", "decrypt", "locked files", "cryptolocker"],
                "techniques": ["T1486", "T1490", "T1489"],
                "category": "Impact"
            },
            "phishing": {
                "keywords": ["phishing", "credential", "fake login", "email link", "suspicious email", "spear"],
                "techniques": ["T1566", "T1598", "T1534"],
                "category": "Initial Access"
            },
            "malware": {
                "keywords": ["malware", "virus", "trojan", "worm", "backdoor", "dropper", "payload"],
                "techniques": ["T1204", "T1059", "T1055"],
                "category": "Execution"
            },
            "data_breach": {
                "keywords": ["data breach", "exfiltration", "data leak", "stolen data", "exposed", "compromised data"],
                "techniques": ["T1041", "T1567", "T1048"],
                "category": "Exfiltration"
            },
            "ddos": {
                "keywords": ["ddos", "denial of service", "flood", "traffic spike", "service down", "unavailable"],
                "techniques": ["T1498", "T1499"],
                "category": "Impact"
            },
            "insider_threat": {
                "keywords": ["insider", "employee", "unauthorized access", "privilege abuse", "internal"],
                "techniques": ["T1078", "T1098", "T1136"],
                "category": "Privilege Escalation"
            },
            "apt": {
                "keywords": ["apt", "advanced persistent", "nation state", "targeted attack", "campaign"],
                "techniques": ["T1005", "T1039", "T1074", "T1560"],
                "category": "Collection"
            },
            "unauthorized_access": {
                "keywords": ["unauthorized", "brute force", "account compromise", "login failure", "access denied"],
                "techniques": ["T1110", "T1078", "T1021"],
                "category": "Credential Access"
            }
        }
        
        # MITRE ATT&CK technique database (subset)
        self.mitre_techniques = {
            "T1486": {"name": "Data Encrypted for Impact", "tactic": "Impact"},
            "T1490": {"name": "Inhibit System Recovery", "tactic": "Impact"},
            "T1489": {"name": "Service Stop", "tactic": "Impact"},
            "T1566": {"name": "Phishing", "tactic": "Initial Access"},
            "T1598": {"name": "Phishing for Information", "tactic": "Reconnaissance"},
            "T1534": {"name": "Internal Spearphishing", "tactic": "Lateral Movement"},
            "T1204": {"name": "User Execution", "tactic": "Execution"},
            "T1059": {"name": "Command and Scripting Interpreter", "tactic": "Execution"},
            "T1055": {"name": "Process Injection", "tactic": "Defense Evasion"},
            "T1041": {"name": "Exfiltration Over C2 Channel", "tactic": "Exfiltration"},
            "T1567": {"name": "Exfiltration Over Web Service", "tactic": "Exfiltration"},
            "T1048": {"name": "Exfiltration Over Alternative Protocol", "tactic": "Exfiltration"},
            "T1498": {"name": "Network Denial of Service", "tactic": "Impact"},
            "T1499": {"name": "Endpoint Denial of Service", "tactic": "Impact"},
            "T1078": {"name": "Valid Accounts", "tactic": "Persistence"},
            "T1098": {"name": "Account Manipulation", "tactic": "Persistence"},
            "T1136": {"name": "Create Account", "tactic": "Persistence"},
            "T1005": {"name": "Data from Local System", "tactic": "Collection"},
            "T1039": {"name": "Data from Network Shared Drive", "tactic": "Collection"},
            "T1074": {"name": "Data Staged", "tactic": "Collection"},
            "T1560": {"name": "Archive Collected Data", "tactic": "Collection"},
            "T1110": {"name": "Brute Force", "tactic": "Credential Access"},
            "T1021": {"name": "Remote Services", "tactic": "Lateral Movement"}
        }
        
        logger.info(f"Incident Classifier v{self.version} loaded")
    
    def classify(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        """Classify an incident based on its attributes"""
        
        title = incident.get("title", "").lower()
        description = incident.get("description", "").lower()
        indicators = incident.get("indicators", [])
        
        combined_text = f"{title} {description}"
        
        # Score each incident type
        scores = {}
        for inc_type, pattern in self.type_patterns.items():
            score = 0
            for keyword in pattern["keywords"]:
                if keyword in combined_text:
                    score += 1
            scores[inc_type] = score
        
        # Check indicators for additional scoring
        for indicator in indicators:
            if indicator.get("malicious"):
                if indicator.get("type") in ["hash", "domain", "ip"]:
                    scores["malware"] = scores.get("malware", 0) + 2
                if indicator.get("type") == "email":
                    scores["phishing"] = scores.get("phishing", 0) + 2
        
        # Determine best match
        if max(scores.values(), default=0) > 0:
            best_type = max(scores, key=scores.get)
            confidence = min(90, 50 + scores[best_type] * 10)
        else:
            best_type = "other"
            confidence = 40
        
        # Get pattern info
        pattern_info = self.type_patterns.get(best_type, {
            "techniques": [],
            "category": "Unknown"
        })
        
        return {
            "type": best_type,
            "category": pattern_info.get("category", "Unknown"),
            "techniques": pattern_info.get("techniques", []),
            "confidence": confidence
        }
    
    def get_technique_info(self, technique_id: str) -> Dict[str, Any]:
        """Get MITRE ATT&CK technique information"""
        
        if technique_id in self.mitre_techniques:
            info = self.mitre_techniques[technique_id]
            return {
                "id": technique_id,
                "name": info["name"],
                "tactic": info["tactic"],
                "url": f"https://attack.mitre.org/techniques/{technique_id}/"
            }
        
        return {"error": f"Technique {technique_id} not found"}
