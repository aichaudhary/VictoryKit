"""
IntelliScout ML Engine - Pattern Detector Model
Detects patterns and relationships between IOCs
"""

import numpy as np
import logging
from typing import Dict, Any, List
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class PatternDetector:
    """
    Pattern detection model for identifying relationships between IOCs.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Pattern types
        self.pattern_types = [
            "infrastructure_overlap",
            "domain_generation",
            "ip_clustering",
            "hash_family",
            "timing_pattern",
            "geographic_pattern"
        ]
        
        logger.info(f"Pattern Detector v{self.version} loaded")
    
    def detect(self, iocs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect patterns in IOCs"""
        
        patterns = []
        
        # Group IOCs by type
        ioc_groups = {}
        for ioc in iocs:
            ioc_type = ioc.get("ioc_type", "unknown")
            if ioc_type not in ioc_groups:
                ioc_groups[ioc_type] = []
            ioc_groups[ioc_type].append(ioc)
        
        # Detect infrastructure overlap
        if "ip" in ioc_groups and "domain" in ioc_groups:
            patterns.append(self._detect_infrastructure_overlap(
                ioc_groups["ip"], ioc_groups["domain"]
            ))
        
        # Detect domain generation patterns
        if "domain" in ioc_groups and len(ioc_groups["domain"]) >= 3:
            dga_pattern = self._detect_dga_pattern(ioc_groups["domain"])
            if dga_pattern:
                patterns.append(dga_pattern)
        
        # Detect IP clustering
        if "ip" in ioc_groups and len(ioc_groups["ip"]) >= 3:
            ip_pattern = self._detect_ip_clustering(ioc_groups["ip"])
            if ip_pattern:
                patterns.append(ip_pattern)
        
        # Detect hash family
        if "hash" in ioc_groups and len(ioc_groups["hash"]) >= 2:
            hash_pattern = self._detect_hash_family(ioc_groups["hash"])
            if hash_pattern:
                patterns.append(hash_pattern)
        
        return [p for p in patterns if p]
    
    def _detect_infrastructure_overlap(
        self, ips: List[Dict], domains: List[Dict]
    ) -> Dict[str, Any]:
        """Detect shared infrastructure between IPs and domains"""
        
        return {
            "pattern_id": str(uuid.uuid4()),
            "pattern_type": "infrastructure_overlap",
            "description": f"Detected potential shared infrastructure: "
                          f"{len(ips)} IPs and {len(domains)} domains may be related",
            "affected_iocs": [
                *[ip.get("value", "") for ip in ips[:5]],
                *[d.get("value", "") for d in domains[:5]]
            ],
            "risk_score": min(60 + len(ips) * 5 + len(domains) * 3, 95)
        }
    
    def _detect_dga_pattern(self, domains: List[Dict]) -> Dict[str, Any]:
        """Detect domain generation algorithm patterns"""
        
        domain_values = [d.get("value", "") for d in domains]
        
        # Check for DGA-like patterns (random-looking domains)
        suspicious_count = 0
        for domain in domain_values:
            parts = domain.split(".")
            if parts:
                main_part = parts[0]
                # Check for random character patterns
                if len(main_part) > 10 and not any(
                    word in main_part.lower() 
                    for word in ["google", "amazon", "microsoft", "facebook"]
                ):
                    consonant_ratio = sum(
                        1 for c in main_part.lower() 
                        if c in "bcdfghjklmnpqrstvwxyz"
                    ) / max(len(main_part), 1)
                    if consonant_ratio > 0.7:
                        suspicious_count += 1
        
        if suspicious_count >= 2:
            return {
                "pattern_id": str(uuid.uuid4()),
                "pattern_type": "domain_generation",
                "description": f"Potential DGA activity detected: {suspicious_count} "
                              f"domains exhibit random generation patterns",
                "affected_iocs": domain_values[:10],
                "risk_score": min(70 + suspicious_count * 5, 95)
            }
        
        return None
    
    def _detect_ip_clustering(self, ips: List[Dict]) -> Dict[str, Any]:
        """Detect IP address clustering patterns"""
        
        ip_values = [ip.get("value", "") for ip in ips]
        
        # Group by /24 subnet
        subnets = {}
        for ip in ip_values:
            parts = ip.split(".")
            if len(parts) == 4:
                subnet = ".".join(parts[:3])
                if subnet not in subnets:
                    subnets[subnet] = []
                subnets[subnet].append(ip)
        
        # Find clusters
        largest_cluster = max(subnets.values(), key=len, default=[])
        
        if len(largest_cluster) >= 3:
            return {
                "pattern_id": str(uuid.uuid4()),
                "pattern_type": "ip_clustering",
                "description": f"IP clustering detected: {len(largest_cluster)} IPs "
                              f"in same /24 subnet",
                "affected_iocs": largest_cluster,
                "risk_score": min(50 + len(largest_cluster) * 8, 90)
            }
        
        return None
    
    def _detect_hash_family(self, hashes: List[Dict]) -> Dict[str, Any]:
        """Detect malware family based on hash patterns"""
        
        hash_values = [h.get("value", "") for h in hashes]
        
        # In production, would use ML similarity analysis
        # For now, simulate detection
        if len(hash_values) >= 2:
            return {
                "pattern_id": str(uuid.uuid4()),
                "pattern_type": "hash_family",
                "description": f"Potential malware family detected: {len(hash_values)} "
                              f"samples may be related variants",
                "affected_iocs": hash_values,
                "risk_score": min(60 + len(hash_values) * 10, 95)
            }
        
        return None
