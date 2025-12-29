"""
NetworkGuard ML Engine - Traffic Analyzer
Deep packet inspection and flow analysis
"""

import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class TrafficAnalyzer:
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Port to service mapping
        self.port_services = {
            21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
            53: "DNS", 80: "HTTP", 110: "POP3", 143: "IMAP",
            443: "HTTPS", 445: "SMB", 993: "IMAPS", 995: "POP3S",
            3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
            6379: "Redis", 8080: "HTTP-Proxy", 8443: "HTTPS-Alt"
        }
        
        # High-risk ports
        self.high_risk_ports = [
            23, 445, 3389,  # Commonly attacked
            4444, 5555, 6666, 31337, 12345,  # Trojan ports
            1433, 1521, 27017  # Database ports exposed
        ]
        
        logger.info(f"Traffic Analyzer v{self.version} loaded")
    
    def analyze(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        dst_port = flow.get("destinationPort", 0)
        src_port = flow.get("sourcePort", 0)
        protocol = flow.get("protocol", "").upper()
        bytes_transferred = flow.get("bytes", 0)
        duration = flow.get("duration", 1)
        
        # Identify service
        service = self.port_services.get(dst_port, "Unknown")
        
        # Calculate bandwidth
        bandwidth = {
            "bytesPerSecond": bytes_transferred / max(duration, 0.1),
            "packetsPerSecond": flow.get("packets", 0) / max(duration, 0.1)
        }
        
        # Risk assessment
        risk_factors = []
        risk_score = 0
        
        if dst_port in self.high_risk_ports:
            risk_factors.append(f"High-risk port {dst_port}")
            risk_score += 40
        
        if protocol == "TELNET" or dst_port == 23:
            risk_factors.append("Unencrypted protocol (Telnet)")
            risk_score += 30
        
        if bytes_transferred > 100000000:  # 100MB
            risk_factors.append("Large data transfer")
            risk_score += 20
        
        # Check for ephemeral source port (normal client behavior)
        if src_port > 1024 and dst_port < 1024:
            pass  # Normal client-server pattern
        elif src_port < 1024 and dst_port > 1024:
            risk_factors.append("Unusual port direction")
            risk_score += 15
        
        return {
            "service": service,
            "bandwidth": bandwidth,
            "riskScore": min(risk_score, 100),
            "riskFactors": risk_factors,
            "classification": self._classify_traffic(protocol, dst_port)
        }
    
    def analyze_packet(self, packet: Dict[str, Any]) -> Dict[str, Any]:
        data = packet.get("data", "")
        protocol = packet.get("protocol", "")
        length = packet.get("length", 0)
        
        findings = []
        
        # Check for common attack patterns
        attack_patterns = {
            r"<script.*?>": "XSS attempt",
            r"(?:union|select|insert|update|delete|drop).*(?:from|into|table)": "SQL injection",
            r"\.\.\/|\.\.\\": "Path traversal",
            r"cmd\.exe|/bin/sh|/bin/bash": "Command injection",
            r"eval\s*\(|exec\s*\(": "Code execution attempt"
        }
        
        for pattern, threat in attack_patterns.items():
            if re.search(pattern, data, re.IGNORECASE):
                findings.append({
                    "type": "attack_pattern",
                    "threat": threat,
                    "severity": "high"
                })
        
        return {
            "protocol": protocol,
            "length": length,
            "findings": findings,
            "suspicious": len(findings) > 0
        }
    
    def _classify_traffic(self, protocol: str, port: int) -> str:
        if port in [80, 8080, 443, 8443]:
            return "web"
        elif port in [25, 110, 143, 993, 995, 587]:
            return "email"
        elif port in [21, 22, 990]:
            return "file_transfer"
        elif port in [3306, 5432, 1433, 1521, 27017]:
            return "database"
        elif port == 53:
            return "dns"
        elif port in [3389, 5900]:
            return "remote_access"
        else:
            return "other"
