"""
IntelliScout ML Engine - Correlation Engine
Correlates threats based on shared IOCs, TTPs, and patterns
"""

import numpy as np
import logging
from typing import Dict, Any, List
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class CorrelationEngine:
    """
    Threat correlation engine for finding relationships between threats.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Simulated threat database (in production, would be actual DB)
        self.threat_db = self._init_threat_db()
        
        logger.info(f"Correlation Engine v{self.version} loaded")
    
    def _init_threat_db(self) -> List[Dict[str, Any]]:
        """Initialize sample threat database"""
        return [
            {
                "threat_id": "THR-001",
                "name": "APT28 Campaign",
                "threat_type": "apt",
                "iocs": [
                    {"ioc_type": "domain", "value": "malicious-site.com"},
                    {"ioc_type": "ip", "value": "192.168.1.100"},
                    {"ioc_type": "hash", "value": "abc123def456"}
                ],
                "ttps": [{"technique": "T1566"}, {"technique": "T1071"}]
            },
            {
                "threat_id": "THR-002",
                "name": "Emotet Malware",
                "threat_type": "malware",
                "iocs": [
                    {"ioc_type": "hash", "value": "def789ghi012"},
                    {"ioc_type": "domain", "value": "c2-server.net"}
                ],
                "ttps": [{"technique": "T1055"}, {"technique": "T1059"}]
            },
            {
                "threat_id": "THR-003",
                "name": "Phishing Campaign Alpha",
                "threat_type": "campaign",
                "iocs": [
                    {"ioc_type": "domain", "value": "fake-login.com"},
                    {"ioc_type": "email", "value": "attacker@malicious.com"}
                ],
                "ttps": [{"technique": "T1566.001"}]
            }
        ]
    
    def correlate(self, threat_data: Dict[str, Any]) -> Dict[str, Any]:
        """Find correlated threats"""
        
        input_iocs = threat_data.get("iocs", [])
        input_ttps = threat_data.get("ttps", [])
        
        related_threats = []
        common_iocs = []
        
        # Extract IOC values for comparison
        input_ioc_values = set(
            ioc.get("value", "") for ioc in input_iocs
        )
        input_ttp_techniques = set(
            ttp.get("technique", "") for ttp in input_ttps
        )
        
        for threat in self.threat_db:
            threat_ioc_values = set(
                ioc.get("value", "") for ioc in threat.get("iocs", [])
            )
            threat_ttp_techniques = set(
                ttp.get("technique", "") for ttp in threat.get("ttps", [])
            )
            
            # Find IOC overlap
            ioc_overlap = input_ioc_values & threat_ioc_values
            
            # Find TTP overlap
            ttp_overlap = input_ttp_techniques & threat_ttp_techniques
            
            # Calculate correlation score
            if ioc_overlap or ttp_overlap:
                correlation_score = (
                    len(ioc_overlap) * 30 + 
                    len(ttp_overlap) * 20
                )
                
                related_threats.append({
                    "threat_id": threat["threat_id"],
                    "name": threat["name"],
                    "threat_type": threat["threat_type"],
                    "correlation_score": min(correlation_score, 100),
                    "shared_iocs": list(ioc_overlap),
                    "shared_ttps": list(ttp_overlap)
                })
                
                common_iocs.extend(ioc_overlap)
        
        # Sort by correlation score
        related_threats.sort(key=lambda x: x["correlation_score"], reverse=True)
        
        # Calculate overall confidence
        if related_threats:
            avg_score = np.mean([t["correlation_score"] for t in related_threats])
            confidence = min(avg_score + len(related_threats) * 5, 95)
        else:
            confidence = 0
        
        return {
            "related_threats": related_threats[:10],  # Top 10
            "common_iocs": list(set(common_iocs)),
            "confidence": round(confidence, 2)
        }
    
    def add_threat(self, threat_data: Dict[str, Any]) -> bool:
        """Add threat to database for future correlation"""
        try:
            self.threat_db.append(threat_data)
            logger.info(f"Added threat {threat_data.get('threat_id')} to correlation DB")
            return True
        except Exception as e:
            logger.error(f"Error adding threat: {e}")
            return False
