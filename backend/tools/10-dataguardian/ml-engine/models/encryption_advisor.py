"""
DataGuardian ML Engine - Encryption Advisor Model
Recommend encryption strategies for sensitive data
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class EncryptionAdvisor:
    """
    Recommend encryption strategies for data protection.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Encryption methods by data type
        self.encryption_methods = {
            "PCI": {
                "method": "AES-256-GCM with tokenization",
                "key_management": "HSM-backed key management",
                "standard": "PCI-DSS",
                "priority": "CRITICAL"
            },
            "PHI": {
                "method": "AES-256-CBC",
                "key_management": "Customer-managed keys with rotation",
                "standard": "HIPAA",
                "priority": "CRITICAL"
            },
            "PII": {
                "method": "AES-256-GCM",
                "key_management": "Managed encryption keys with 90-day rotation",
                "standard": "GDPR/CCPA",
                "priority": "HIGH"
            },
            "SENSITIVE": {
                "method": "AES-256-CBC",
                "key_management": "Application-level key management",
                "standard": "Internal Policy",
                "priority": "MEDIUM"
            },
            "PUBLIC": {
                "method": "TLS in transit only",
                "key_management": "Standard TLS certificates",
                "standard": "Best Practice",
                "priority": "LOW"
            }
        }
        
        # Column patterns for classification
        self.patterns = {
            "PCI": ["card", "credit", "cvv", "pan", "payment", "account_number"],
            "PHI": ["diagnosis", "treatment", "medical", "health", "patient", "medication"],
            "PII": ["ssn", "email", "phone", "address", "name", "dob", "birth"],
            "SENSITIVE": ["password", "secret", "token", "api_key", "private"]
        }
        
        logger.info(f"Encryption Advisor v{self.version} loaded")
    
    def recommend(self, schema: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate encryption recommendations for schema"""
        
        columns = schema.get("columns", [])
        recommendations = []
        
        for column in columns:
            col_name = column.get("name", "").lower()
            data_type = self._classify_column(col_name)
            
            if data_type != "PUBLIC":
                enc_config = self.encryption_methods[data_type]
                recommendations.append({
                    "field_name": column["name"],
                    "data_type": data_type,
                    "encryption_method": enc_config["method"],
                    "key_management": enc_config["key_management"],
                    "compliance_standard": enc_config["standard"],
                    "priority": enc_config["priority"],
                    "implementation_notes": self._get_implementation_notes(data_type, col_name)
                })
        
        # Sort by priority
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        recommendations.sort(key=lambda x: priority_order.get(x["priority"], 4))
        
        return recommendations
    
    def _classify_column(self, col_name: str) -> str:
        """Classify column data type"""
        
        for data_type, patterns in self.patterns.items():
            if any(pattern in col_name for pattern in patterns):
                return data_type
        
        return "PUBLIC"
    
    def _get_implementation_notes(self, data_type: str, col_name: str) -> str:
        """Get implementation notes for encryption"""
        
        notes = {
            "PCI": "Use tokenization for card numbers. Never store raw PAN. Implement point-to-point encryption.",
            "PHI": "Encrypt at rest and in transit. Maintain audit logs. Implement break-glass access.",
            "PII": "Use field-level encryption. Implement data masking for non-production environments.",
            "SENSITIVE": "Use envelope encryption. Rotate keys regularly. Implement access logging."
        }
        
        return notes.get(data_type, "Standard encryption practices apply.")
    
    def get_encryption_standards(self) -> List[Dict[str, Any]]:
        """Get list of encryption standards"""
        
        return [
            {
                "standard": "AES-256-GCM",
                "description": "Advanced Encryption Standard with Galois/Counter Mode",
                "use_cases": ["At-rest encryption", "Field-level encryption"],
                "key_size": 256
            },
            {
                "standard": "AES-256-CBC",
                "description": "Advanced Encryption Standard with Cipher Block Chaining",
                "use_cases": ["Database encryption", "File encryption"],
                "key_size": 256
            },
            {
                "standard": "RSA-2048",
                "description": "RSA asymmetric encryption",
                "use_cases": ["Key exchange", "Digital signatures"],
                "key_size": 2048
            },
            {
                "standard": "TLS 1.3",
                "description": "Transport Layer Security",
                "use_cases": ["In-transit encryption", "API security"],
                "key_size": "Varies"
            }
        ]
