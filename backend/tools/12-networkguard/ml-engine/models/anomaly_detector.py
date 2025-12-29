"""
NetworkGuard ML Engine - Anomaly Detector
Network behavior anomaly detection
"""

import logging
from typing import Dict, Any, List
from collections import defaultdict

logger = logging.getLogger(__name__)


class AnomalyDetector:
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Baseline thresholds
        self.thresholds = {
            "max_connections_per_ip": 100,
            "max_bytes_per_flow": 500000000,  # 500MB
            "max_packets_per_second": 10000,
            "suspicious_port_threshold": 5
        }
        
        # Suspicious behaviors
        self.suspicious_patterns = {
            "port_scan": {"min_ports": 20, "time_window": 60},
            "data_exfil": {"min_bytes": 100000000, "time_window": 300},
            "beaconing": {"interval_variance": 0.1}
        }
        
        logger.info(f"Anomaly Detector v{self.version} loaded")
    
    def detect(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        anomaly_score = 0
        anomalies = []
        
        dst_port = flow.get("destinationPort", 0)
        bytes_transferred = flow.get("bytes", 0)
        packets = flow.get("packets", 0)
        duration = flow.get("duration", 1)
        
        # Check for excessive data transfer
        if bytes_transferred > self.thresholds["max_bytes_per_flow"]:
            anomaly_score += 35
            anomalies.append({
                "type": "excessive_data_transfer",
                "value": bytes_transferred,
                "threshold": self.thresholds["max_bytes_per_flow"]
            })
        
        # Check for high packet rate
        pps = packets / max(duration, 0.1)
        if pps > self.thresholds["max_packets_per_second"]:
            anomaly_score += 30
            anomalies.append({
                "type": "high_packet_rate",
                "value": pps,
                "threshold": self.thresholds["max_packets_per_second"]
            })
        
        # Check for unusual port
        unusual_ports = [4444, 5555, 6666, 31337, 12345, 65535]
        if dst_port in unusual_ports:
            anomaly_score += 40
            anomalies.append({
                "type": "suspicious_port",
                "value": dst_port
            })
        
        # Check for short-lived high-volume connection
        if duration < 1 and bytes_transferred > 10000000:
            anomaly_score += 25
            anomalies.append({
                "type": "burst_transfer",
                "duration": duration,
                "bytes": bytes_transferred
            })
        
        # Determine if anomalous
        is_anomaly = anomaly_score >= 30
        
        anomaly_type = None
        if is_anomaly:
            if any(a["type"] == "excessive_data_transfer" for a in anomalies):
                anomaly_type = "data_exfiltration"
            elif any(a["type"] == "high_packet_rate" for a in anomalies):
                anomaly_type = "dos_attack"
            elif any(a["type"] == "suspicious_port" for a in anomalies):
                anomaly_type = "backdoor_communication"
            else:
                anomaly_type = "behavioral"
        
        return {
            "isAnomaly": is_anomaly,
            "anomalyScore": min(anomaly_score, 100),
            "anomalyType": anomaly_type,
            "anomalies": anomalies,
            "threatIndicators": self._generate_indicators(anomalies, flow)
        }
    
    def _generate_indicators(self, anomalies: List[Dict], flow: Dict) -> List[Dict]:
        indicators = []
        
        for anomaly in anomalies:
            if anomaly["type"] == "suspicious_port":
                indicators.append({
                    "type": "port",
                    "value": str(anomaly["value"]),
                    "severity": "high"
                })
            elif anomaly["type"] == "excessive_data_transfer":
                indicators.append({
                    "type": "behavior",
                    "value": f"Large transfer: {anomaly['value']} bytes",
                    "severity": "medium"
                })
        
        # Add IP indicators for anomalous traffic
        if indicators:
            indicators.append({
                "type": "ip",
                "value": flow.get("sourceIp", "unknown"),
                "severity": "medium"
            })
        
        return indicators
