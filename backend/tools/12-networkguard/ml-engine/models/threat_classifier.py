"""
NetworkGuard ML Engine - Threat Classifier
Classify network security threats
"""

import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class ThreatClassifier:
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Threat signatures
        self.signatures = {
            "intrusion": {
                "patterns": ["unauthorized", "exploit", "buffer overflow", "remote code"],
                "severity_boost": 20
            },
            "malware": {
                "patterns": ["malware", "virus", "trojan", "backdoor", "c2", "command and control"],
                "severity_boost": 25
            },
            "reconnaissance": {
                "patterns": ["scan", "probe", "enumeration", "discovery"],
                "severity_boost": 10
            },
            "exfiltration": {
                "patterns": ["exfiltration", "data theft", "leak", "transfer out"],
                "severity_boost": 30
            },
            "dos": {
                "patterns": ["denial of service", "flood", "ddos", "syn flood"],
                "severity_boost": 20
            }
        }
        
        # Recommendation templates
        self.recommendations = {
            "intrusion": [
                "Block source IP immediately",
                "Review firewall rules",
                "Patch affected systems",
                "Check for lateral movement"
            ],
            "malware": [
                "Isolate affected host",
                "Run full malware scan",
                "Block C2 communication",
                "Collect samples for analysis"
            ],
            "reconnaissance": [
                "Monitor source IP for further activity",
                "Review exposed services",
                "Update IDS signatures",
                "Consider blocking at perimeter"
            ],
            "exfiltration": [
                "Block destination immediately",
                "Review DLP policies",
                "Identify data at risk",
                "Check for insider threat indicators"
            ],
            "dos": [
                "Enable rate limiting",
                "Activate DDoS protection",
                "Contact ISP if needed",
                "Scale infrastructure"
            ]
        }
        
        logger.info(f"Threat Classifier v{self.version} loaded")
    
    def classify(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        severity = alert.get("severity", "medium")
        category = alert.get("category", "other")
        title = alert.get("title", "").lower()
        description = alert.get("description", "").lower()
        
        combined_text = f"{title} {description}"
        
        # Calculate base risk score
        severity_scores = {
            "critical": 90, "high": 70, "medium": 50, "low": 30, "info": 10
        }
        risk_score = severity_scores.get(severity, 50)
        
        # Match against signatures
        matched_threats = []
        for threat_type, config in self.signatures.items():
            for pattern in config["patterns"]:
                if pattern in combined_text:
                    matched_threats.append(threat_type)
                    risk_score = min(100, risk_score + config["severity_boost"])
                    break
        
        # Determine classification
        if category in self.signatures:
            classification = category
        elif matched_threats:
            classification = matched_threats[0]
        else:
            classification = "unknown"
        
        # Get recommendations
        recs = self.recommendations.get(classification, [
            "Review alert details",
            "Investigate source and destination",
            "Update detection rules if needed"
        ])
        
        # Determine confidence
        confidence = 0.9 if classification in self.signatures else 0.6
        
        return {
            "classification": classification,
            "confidence": confidence,
            "riskScore": risk_score,
            "threats": matched_threats,
            "recommendations": recs,
            "iocMatches": self._extract_iocs(alert)
        }
    
    def _extract_iocs(self, alert: Dict[str, Any]) -> List[Dict[str, Any]]:
        iocs = []
        
        source = alert.get("source", {})
        destination = alert.get("destination", {})
        
        if source.get("ip"):
            iocs.append({"type": "ip", "value": source["ip"], "direction": "source"})
        if destination.get("ip"):
            iocs.append({"type": "ip", "value": destination["ip"], "direction": "destination"})
        
        return iocs
    
    def get_signatures(self) -> Dict[str, Any]:
        return {
            "total": sum(len(s["patterns"]) for s in self.signatures.values()),
            "categories": list(self.signatures.keys()),
            "signatures": {k: v["patterns"] for k, v in self.signatures.items()}
        }
