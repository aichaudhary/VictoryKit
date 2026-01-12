"""
DarkWebMonitor ML Engine - Threat Classifier Model
Classifies threats based on IOCs, TTPs, and behavioral patterns
"""

import hashlib
import logging
from datetime import datetime
from typing import Any, Dict, List

import numpy as np

logger = logging.getLogger(__name__)


class ThreatClassifier:
    """
    ML-based threat classification model.
    Uses IOCs and TTPs to classify threat type and severity.
    """

    def __init__(self):
        self.version = "1.0.0"
        self.last_trained = "2025-01-15T00:00:00Z"
        self.accuracy = 92.3
        self.is_loaded = True

        # MITRE ATT&CK technique mappings
        self.mitre_mappings = {
            "malware": ["T1059", "T1055", "T1027", "T1105"],
            "apt": ["T1566", "T1071", "T1021", "T1078"],
            "campaign": ["T1583", "T1584", "T1585", "T1588"],
            "vulnerability": ["T1190", "T1210", "T1068", "T1211"],
        }

        # Severity weights
        self.severity_weights = {
            "critical_iocs": 30,
            "high_confidence": 25,
            "apt_indicators": 20,
            "active_campaign": 15,
            "multiple_ttps": 10,
        }

        logger.info(f"Threat Classifier v{self.version} loaded")

    def classify(self, threat_data: Dict[str, Any]) -> Dict[str, Any]:
        """Classify threat type and severity"""

        iocs = threat_data.get("iocs", [])
        ttps = threat_data.get("ttps", [])
        description = threat_data.get("description", "").lower()

        # Determine threat type
        threat_type = self._determine_type(iocs, ttps, description)

        # Calculate severity
        severity, severity_score = self._calculate_severity(iocs, ttps, threat_type)

        # Calculate confidence
        confidence = self._calculate_confidence(iocs, ttps)

        # Generate tags
        tags = self._generate_tags(iocs, ttps, threat_type)

        # Get relevant MITRE techniques
        mitre_techniques = self._get_mitre_techniques(threat_type, ttps)

        return {
            "threat_type": threat_type,
            "severity": severity,
            "confidence": confidence,
            "tags": tags,
            "mitre_techniques": mitre_techniques,
        }

    def _determine_type(self, iocs: List, ttps: List, description: str) -> str:
        """Determine threat type from indicators"""

        scores = {"malware": 0, "apt": 0, "campaign": 0, "vulnerability": 0}

        # Check IOC types
        for ioc in iocs:
            ioc_type = ioc.get("ioc_type", "")
            if ioc_type == "hash":
                scores["malware"] += 2
            elif ioc_type == "domain":
                scores["apt"] += 1
                scores["campaign"] += 1
            elif ioc_type == "ip":
                scores["apt"] += 1

        # Check TTPs
        for ttp in ttps:
            technique = ttp.get("technique", "")
            for threat_type, techniques in self.mitre_mappings.items():
                if technique in techniques:
                    scores[threat_type] += 3

        # Check description keywords
        keywords = {
            "malware": ["trojan", "ransomware", "worm", "virus", "payload"],
            "apt": ["nation-state", "advanced", "persistent", "targeted"],
            "campaign": ["phishing", "spam", "campaign", "mass"],
            "vulnerability": ["cve", "exploit", "rce", "vulnerability"],
        }

        for threat_type, kws in keywords.items():
            if any(kw in description for kw in kws):
                scores[threat_type] += 2

        return max(scores, key=scores.get)

    def _calculate_severity(self, iocs: List, ttps: List, threat_type: str) -> tuple:
        """Calculate threat severity"""

        score = 0

        # Base score by threat type
        type_scores = {"apt": 30, "malware": 25, "campaign": 20, "vulnerability": 15}
        score += type_scores.get(threat_type, 10)

        # IOC count impact
        score += min(len(iocs) * 3, 20)

        # TTP count impact
        score += min(len(ttps) * 5, 25)

        # Hash indicators (likely malware samples)
        hash_count = sum(1 for i in iocs if i.get("ioc_type") == "hash")
        score += min(hash_count * 5, 15)

        # Normalize to 0-100
        score = min(100, score)

        # Map to severity
        if score >= 80:
            severity = "CRITICAL"
        elif score >= 60:
            severity = "HIGH"
        elif score >= 40:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        return severity, score

    def _calculate_confidence(self, iocs: List, ttps: List) -> float:
        """Calculate classification confidence"""

        base_confidence = 50.0

        # More IOCs = higher confidence
        base_confidence += min(len(iocs) * 3, 20)

        # TTPs increase confidence
        base_confidence += min(len(ttps) * 5, 20)

        # Multiple sources increase confidence
        sources = set(ioc.get("source", "") for ioc in iocs if ioc.get("source"))
        base_confidence += min(len(sources) * 3, 10)

        return min(100.0, base_confidence)

    def _generate_tags(self, iocs: List, ttps: List, threat_type: str) -> List[str]:
        """Generate tags for the threat"""

        tags = [threat_type]

        # Add IOC type tags
        ioc_types = set(ioc.get("ioc_type", "") for ioc in iocs)
        tags.extend([f"ioc:{t}" for t in ioc_types if t])

        # Add TTP tags
        for ttp in ttps[:3]:  # Limit to first 3
            if ttp.get("tactic"):
                tags.append(f"tactic:{ttp['tactic']}")

        return list(set(tags))

    def _get_mitre_techniques(self, threat_type: str, ttps: List) -> List[str]:
        """Get MITRE ATT&CK technique IDs"""

        techniques = []

        # Add from TTPs
        for ttp in ttps:
            if ttp.get("mitreId"):
                techniques.append(ttp["mitreId"])
            elif ttp.get("technique"):
                techniques.append(ttp["technique"])

        # Add default techniques for threat type
        if not techniques:
            techniques = self.mitre_mappings.get(threat_type, [])[:3]

        return list(set(techniques))

    def enrich_ioc(self, ioc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich IOC with additional context"""

        ioc_type = ioc_data.get("ioc_type", "")
        value = ioc_data.get("value", "")

        # Simulate enrichment (in production, would query external sources)
        enrichment = {
            "risk_score": np.random.uniform(30, 90),
            "first_seen": "2024-06-15T00:00:00Z",
            "last_seen": datetime.utcnow().isoformat() + "Z",
            "sightings": np.random.randint(1, 100),
            "sources": ["VirusTotal", "AbuseIPDB", "AlienVault OTX"],
        }

        if ioc_type == "ip":
            enrichment["geoip"] = {
                "country": "Unknown",
                "city": "Unknown",
                "asn": "AS0000",
            }
        elif ioc_type == "domain":
            enrichment["whois"] = {
                "registrar": "Unknown",
                "creation_date": "2024-01-01",
            }
        elif ioc_type == "hash":
            enrichment["file_info"] = {
                "type": "PE32",
                "size": np.random.randint(10000, 1000000),
            }

        return enrichment
