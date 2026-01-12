"""
incidentcommand ML Engine - Threat Analyzer Model
Analyze threat indicators and evidence
"""

import logging
import re
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class ThreatAnalyzer:
    """
    Analyze threat indicators, IOCs, and evidence.
    """

    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True

        # Known malicious patterns
        self.malicious_patterns = {
            "ip": [
                r"^10\.",  # Private - not malicious but suspicious external
                r"^192\.168\.",  # Private
                r"^172\.(1[6-9]|2[0-9]|3[0-1])\.",  # Private
            ],
            "domain": [
                r"\.ru$",
                r"\.cn$",
                r"\.top$",
                r"\.xyz$",  # High-risk TLDs
                r"(temp|test|malware|evil|hack)",  # Suspicious keywords
            ],
            "hash": [
                # Known malware hash patterns would go here
            ],
        }

        logger.info(f"Threat Analyzer v{self.version} loaded")

    def analyze(
        self, incident: Dict[str, Any], classification: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze incident and determine threat level"""

        inc_type = classification.get("type", "other")
        confidence = classification.get("confidence", 50)
        indicators = incident.get("indicators", [])
        affected_assets = incident.get("affectedAssets", [])

        # Calculate threat score
        threat_score = 0

        # Base score from incident type
        type_scores = {
            "ransomware": 90,
            "apt": 85,
            "data_breach": 80,
            "malware": 70,
            "insider_threat": 75,
            "phishing": 60,
            "ddos": 65,
            "unauthorized_access": 55,
            "other": 40,
        }
        threat_score = type_scores.get(inc_type, 40)

        # Adjust for confidence
        threat_score = threat_score * (confidence / 100)

        # Adjust for number of affected assets
        asset_count = len(affected_assets)
        if asset_count > 10:
            threat_score += 15
        elif asset_count > 5:
            threat_score += 10
        elif asset_count > 0:
            threat_score += 5

        # Adjust for malicious indicators
        malicious_count = sum(1 for i in indicators if i.get("malicious"))
        threat_score += malicious_count * 3

        # Cap at 100
        threat_score = min(100, threat_score)

        # Determine threat level
        if threat_score >= 80:
            threat_level = "CRITICAL"
        elif threat_score >= 60:
            threat_level = "HIGH"
        elif threat_score >= 40:
            threat_level = "MEDIUM"
        else:
            threat_level = "LOW"

        return {
            "threat_level": threat_level,
            "threat_score": round(threat_score, 1),
            "factors": {
                "incident_type": inc_type,
                "confidence": confidence,
                "affected_assets": asset_count,
                "malicious_indicators": malicious_count,
            },
        }

    def analyze_indicators(
        self, indicators: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze a list of indicators"""

        results = []

        for indicator in indicators:
            ind_type = indicator.get("type", "")
            value = indicator.get("value", "")

            risk_score = 0
            findings = []

            if ind_type == "ip":
                # Check if external or known bad
                if not any(re.match(p, value) for p in self.malicious_patterns["ip"]):
                    risk_score = 60  # External IP
                    findings.append("External IP address detected")
                else:
                    risk_score = 20
                    findings.append("Internal/private IP address")

            elif ind_type == "domain":
                for pattern in self.malicious_patterns["domain"]:
                    if re.search(pattern, value, re.IGNORECASE):
                        risk_score = 80
                        findings.append(f"High-risk domain pattern detected")
                        break
                if not findings:
                    risk_score = 40
                    findings.append("Domain requires further investigation")

            elif ind_type == "hash":
                risk_score = 50
                findings.append("Hash requires lookup in threat intelligence")

            elif ind_type == "url":
                risk_score = 60
                findings.append("URL requires sandbox analysis")

            elif ind_type == "email":
                risk_score = 50
                findings.append("Email address associated with incident")

            results.append(
                {
                    "type": ind_type,
                    "value": value,
                    "risk_score": risk_score,
                    "malicious": risk_score >= 70,
                    "findings": findings,
                }
            )

        return results

    def analyze_evidence(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze evidence item"""

        ev_type = evidence.get("type", "")
        name = evidence.get("name", "")
        description = evidence.get("description", "")

        findings = []
        artifacts = []

        # Generate analysis based on evidence type
        if ev_type == "malware_sample":
            findings = [
                "Malware sample preserved for analysis",
                "Static analysis recommended",
                "Dynamic analysis in sandbox recommended",
            ]
            artifacts.append(
                {
                    "type": "recommendation",
                    "value": "Submit to VirusTotal for community analysis",
                }
            )

        elif ev_type == "memory_dump":
            findings = [
                "Memory dump collected",
                "Volatility analysis recommended",
                "Check for injected processes",
            ]
            artifacts.append(
                {"type": "tool", "value": "Use Volatility Framework for analysis"}
            )

        elif ev_type == "disk_image":
            findings = [
                "Disk image preserved",
                "Timeline analysis recommended",
                "Check for deleted files",
            ]
            artifacts.append(
                {"type": "tool", "value": "Use Autopsy or FTK for forensic analysis"}
            )

        elif ev_type == "network_capture":
            findings = [
                "Network capture collected",
                "Protocol analysis recommended",
                "Check for C2 communications",
            ]
            artifacts.append(
                {"type": "tool", "value": "Use Wireshark or Zeek for analysis"}
            )

        elif ev_type == "log_file":
            findings = [
                "Log file collected",
                "Timeline correlation recommended",
                "Search for anomalous events",
            ]

        else:
            findings = [
                f"Evidence of type '{ev_type}' collected",
                "Manual review recommended",
            ]

        return {
            "findings": findings,
            "artifacts": artifacts,
            "summary": f"Analysis of {ev_type}: {name}",
            "recommendations": [
                "Maintain chain of custody",
                "Document all analysis steps",
                "Preserve original evidence",
            ],
        }
