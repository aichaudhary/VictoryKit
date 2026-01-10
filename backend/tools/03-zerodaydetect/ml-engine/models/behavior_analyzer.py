"""
ThreatRadar ML Engine - Behavior Analyzer Model
Behavioral analysis for detecting anomalous patterns
"""

import numpy as np
import logging
from typing import Dict, Any, List
from datetime import datetime
from collections import defaultdict

logger = logging.getLogger(__name__)


class BehaviorAnalyzer:
    """
    Behavioral analysis model for detecting deviations from baseline.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Simulated baselines (in production, would be learned from data)
        self.baselines = {
            "avg_bytes_per_hour": 50000,
            "avg_connections_per_hour": 100,
            "avg_unique_destinations": 20,
            "typical_ports": [80, 443, 53, 8080],
            "work_hours": (9, 18)  # 9 AM to 6 PM
        }
        
        logger.info(f"Behavior Analyzer v{self.version} loaded")
    
    def analyze(
        self, entity_id: str, entity_type: str, events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze behavior patterns for an entity"""
        
        if not events:
            return {
                "baseline_deviation": 0,
                "risk_score": 0,
                "anomalous_behaviors": []
            }
        
        anomalies = []
        deviation_scores = []
        
        # Calculate metrics from events
        total_bytes = sum(e.get("bytes_sent", 0) + e.get("bytes_received", 0) for e in events)
        unique_destinations = len(set(e.get("destination_ip", "") for e in events))
        unique_ports = set(e.get("destination_port", 0) for e in events)
        
        # Check bytes deviation
        bytes_deviation = total_bytes / max(self.baselines["avg_bytes_per_hour"], 1)
        if bytes_deviation > 3:
            deviation_scores.append(bytes_deviation)
            anomalies.append({
                "type": "high_data_transfer",
                "description": f"Data transfer {bytes_deviation:.1f}x above baseline",
                "severity": "HIGH" if bytes_deviation > 5 else "MEDIUM",
                "value": total_bytes
            })
        
        # Check connection count
        if len(events) > self.baselines["avg_connections_per_hour"] * 2:
            conn_deviation = len(events) / self.baselines["avg_connections_per_hour"]
            deviation_scores.append(conn_deviation)
            anomalies.append({
                "type": "high_connection_count",
                "description": f"Connection count {conn_deviation:.1f}x above baseline",
                "severity": "MEDIUM",
                "value": len(events)
            })
        
        # Check unique destinations
        if unique_destinations > self.baselines["avg_unique_destinations"] * 2:
            dest_deviation = unique_destinations / self.baselines["avg_unique_destinations"]
            deviation_scores.append(dest_deviation)
            anomalies.append({
                "type": "unusual_destinations",
                "description": f"Connecting to {unique_destinations} unique destinations",
                "severity": "MEDIUM",
                "value": unique_destinations
            })
        
        # Check for unusual ports
        unusual_ports = unique_ports - set(self.baselines["typical_ports"])
        if unusual_ports:
            deviation_scores.append(len(unusual_ports) / 5)
            anomalies.append({
                "type": "unusual_ports",
                "description": f"Using non-standard ports: {list(unusual_ports)[:5]}",
                "severity": "LOW",
                "value": list(unusual_ports)
            })
        
        # Check for off-hours activity
        for event in events:
            timestamp = event.get("timestamp")
            if timestamp:
                if isinstance(timestamp, str):
                    dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                else:
                    dt = timestamp
                hour = dt.hour
                work_start, work_end = self.baselines["work_hours"]
                if hour < work_start or hour > work_end:
                    anomalies.append({
                        "type": "off_hours_activity",
                        "description": f"Activity detected outside work hours ({hour}:00)",
                        "severity": "LOW",
                        "value": hour
                    })
                    deviation_scores.append(1.5)
                    break  # Only report once
        
        # Calculate overall deviation and risk
        baseline_deviation = np.mean(deviation_scores) if deviation_scores else 0
        risk_score = min(baseline_deviation * 20, 100)
        
        return {
            "baseline_deviation": round(baseline_deviation, 2),
            "risk_score": round(risk_score, 2),
            "anomalous_behaviors": anomalies
        }
