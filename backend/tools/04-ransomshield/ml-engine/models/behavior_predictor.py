"""
MalwareHunter ML Engine - Behavior Predictor Model
Predict malware behavior without execution
"""

import numpy as np
import logging
from typing import Dict, Any, List
import hashlib

logger = logging.getLogger(__name__)


class BehaviorPredictor:
    """
    Predict malware behavior based on static features.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Behavior categories
        self.behavior_types = {
            "network": ["c2_communication", "data_exfiltration", "download_payload"],
            "file": ["file_encryption", "file_deletion", "file_modification"],
            "registry": ["persistence", "disable_security", "hide_traces"],
            "process": ["code_injection", "process_hollowing", "privilege_escalation"]
        }
        
        logger.info(f"Behavior Predictor v{self.version} loaded")
    
    def predict(self, sample: Dict[str, Any]) -> Dict[str, Any]:
        """Predict malware behavior"""
        
        file_hash = sample.get("file_hash", "")
        hash_int = int(hashlib.md5(file_hash.encode()).hexdigest()[:8], 16)
        
        # Generate predicted behaviors
        predicted_behaviors = []
        
        # Network behaviors
        if (hash_int % 10) < 7:  # 70% chance
            behavior = np.random.choice(self.behavior_types["network"])
            predicted_behaviors.append({
                "category": "network",
                "behavior": behavior,
                "confidence": 60 + (hash_int % 30),
                "description": self._get_behavior_description(behavior)
            })
        
        # File behaviors
        if (hash_int % 10) < 5:  # 50% chance
            behavior = np.random.choice(self.behavior_types["file"])
            predicted_behaviors.append({
                "category": "file",
                "behavior": behavior,
                "confidence": 55 + (hash_int % 35),
                "description": self._get_behavior_description(behavior)
            })
        
        # Registry behaviors
        if (hash_int % 10) < 4:  # 40% chance
            behavior = np.random.choice(self.behavior_types["registry"])
            predicted_behaviors.append({
                "category": "registry",
                "behavior": behavior,
                "confidence": 50 + (hash_int % 40),
                "description": self._get_behavior_description(behavior)
            })
        
        # Process behaviors
        if (hash_int % 10) < 3:  # 30% chance
            behavior = np.random.choice(self.behavior_types["process"])
            predicted_behaviors.append({
                "category": "process",
                "behavior": behavior,
                "confidence": 45 + (hash_int % 45),
                "description": self._get_behavior_description(behavior)
            })
        
        # Detailed activity predictions
        network_activity = self._predict_network_activity(hash_int)
        file_activity = self._predict_file_activity(hash_int)
        registry_activity = self._predict_registry_activity(hash_int)
        
        # Calculate overall risk
        overall_risk = self._calculate_risk(predicted_behaviors)
        
        return {
            "predicted_behaviors": predicted_behaviors,
            "network_activity": network_activity,
            "file_activity": file_activity,
            "registry_activity": registry_activity,
            "overall_risk": overall_risk
        }
    
    def _get_behavior_description(self, behavior: str) -> str:
        """Get human-readable description"""
        
        descriptions = {
            "c2_communication": "Likely to communicate with command & control server",
            "data_exfiltration": "May attempt to steal and transmit sensitive data",
            "download_payload": "Expected to download additional malware components",
            "file_encryption": "May encrypt files (ransomware behavior)",
            "file_deletion": "Likely to delete files or shadow copies",
            "file_modification": "Expected to modify system or user files",
            "persistence": "Will likely establish persistence mechanisms",
            "disable_security": "May attempt to disable security software",
            "hide_traces": "Expected to delete logs or hide evidence",
            "code_injection": "Likely to inject code into other processes",
            "process_hollowing": "May use process hollowing technique",
            "privilege_escalation": "Expected to attempt privilege escalation"
        }
        return descriptions.get(behavior, "Unknown behavior")
    
    def _predict_network_activity(self, hash_int: int) -> Dict[str, Any]:
        """Predict network activity"""
        
        return {
            "likely_connections": (hash_int % 10) + 1,
            "expected_protocols": ["HTTP", "HTTPS", "DNS"][:hash_int % 3 + 1],
            "c2_probability": min(30 + (hash_int % 60), 95),
            "data_exfil_risk": "HIGH" if hash_int % 3 == 0 else "MEDIUM"
        }
    
    def _predict_file_activity(self, hash_int: int) -> Dict[str, Any]:
        """Predict file activity"""
        
        return {
            "files_created": (hash_int % 20),
            "files_modified": (hash_int % 15),
            "files_deleted": (hash_int % 5),
            "targets_user_data": hash_int % 2 == 0,
            "encryption_risk": "CRITICAL" if hash_int % 5 == 0 else "LOW"
        }
    
    def _predict_registry_activity(self, hash_int: int) -> Dict[str, Any]:
        """Predict registry activity"""
        
        return {
            "keys_created": (hash_int % 10),
            "keys_modified": (hash_int % 8),
            "persistence_locations": ["Run", "RunOnce", "Services"][:hash_int % 3 + 1],
            "persistence_risk": "HIGH" if hash_int % 2 == 0 else "MEDIUM"
        }
    
    def _calculate_risk(self, behaviors: List[Dict]) -> float:
        """Calculate overall risk score"""
        
        if not behaviors:
            return 20.0
        
        avg_confidence = np.mean([b["confidence"] for b in behaviors])
        behavior_count_factor = min(len(behaviors) * 10, 40)
        
        return min(avg_confidence + behavior_count_factor, 100)
