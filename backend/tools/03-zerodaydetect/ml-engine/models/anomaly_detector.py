"""
ZeroDayDetect ML Engine - Anomaly Detector Model
Statistical anomaly detection for network events
"""

import logging
from datetime import datetime
from typing import Any, Dict

import numpy as np

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """
    Statistical anomaly detection using isolation forest principles.
    """

    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True

        # Statistical baselines (would be learned in production)
        self.stats = {
            "bytes_mean": 5000,
            "bytes_std": 15000,
            "packet_mean": 50,
            "packet_std": 100,
            "port_distribution": {443: 0.4, 80: 0.3, 53: 0.1, 22: 0.05, "other": 0.15},
        }

        logger.info(f"Anomaly Detector v{self.version} loaded")

    def detect(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Detect anomalies in network event"""

        bytes_sent = event.get("bytes_sent", 0)
        bytes_received = event.get("bytes_received", 0)
        total_bytes = bytes_sent + bytes_received
        packet_count = event.get("packet_count", 1)
        dest_port = event.get("destination_port", 0)

        anomaly_scores = []
        baseline_comparison = {}
        anomaly_type = "none"

        # Bytes anomaly score (z-score based)
        if total_bytes > 0:
            bytes_zscore = (total_bytes - self.stats["bytes_mean"]) / max(
                self.stats["bytes_std"], 1
            )
            anomaly_scores.append(min(abs(bytes_zscore) / 3, 1))
            baseline_comparison["bytes"] = {
                "value": total_bytes,
                "baseline_mean": self.stats["bytes_mean"],
                "z_score": round(bytes_zscore, 2),
            }
            if bytes_zscore > 3:
                anomaly_type = "high_volume"

        # Packet count anomaly
        if packet_count > 0:
            packet_zscore = (packet_count - self.stats["packet_mean"]) / max(
                self.stats["packet_std"], 1
            )
            anomaly_scores.append(min(abs(packet_zscore) / 3, 1))
            baseline_comparison["packets"] = {
                "value": packet_count,
                "baseline_mean": self.stats["packet_mean"],
                "z_score": round(packet_zscore, 2),
            }
            if packet_zscore > 3:
                anomaly_type = "high_packet_count"

        # Port rarity
        port_dist = self.stats["port_distribution"]
        port_probability = port_dist.get(dest_port, port_dist["other"])
        if port_probability < 0.1:
            anomaly_scores.append(0.5)
            baseline_comparison["port"] = {
                "value": dest_port,
                "probability": port_probability,
                "is_common": False,
            }
            if anomaly_type == "none":
                anomaly_type = "rare_port"
        else:
            baseline_comparison["port"] = {
                "value": dest_port,
                "probability": port_probability,
                "is_common": True,
            }

        # Bytes per packet ratio anomaly
        if packet_count > 0:
            bytes_per_packet = total_bytes / packet_count
            if bytes_per_packet > 1500:  # Jumbo frames or fragmentation
                anomaly_scores.append(0.4)
                baseline_comparison["bytes_per_packet"] = {
                    "value": bytes_per_packet,
                    "normal_range": "60-1500",
                }
                if anomaly_type == "none":
                    anomaly_type = "unusual_packet_size"

        # Calculate overall anomaly score
        overall_score = np.mean(anomaly_scores) * 100 if anomaly_scores else 0
        is_anomaly = overall_score > 40

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(overall_score, 2),
            "anomaly_type": anomaly_type if is_anomaly else "none",
            "baseline_comparison": baseline_comparison,
        }
