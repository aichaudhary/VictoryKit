"""
DataGuardian ML Engine - Data Classifier Model
Classify and detect sensitive data types
"""

import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class DataClassifier:
    """
    Classify data and detect PII, PHI, PCI patterns.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # PII patterns
        self.pii_patterns = {
            "ssn": {
                "pattern": r"\b\d{3}-\d{2}-\d{4}\b",
                "category": "PII",
                "description": "Social Security Number",
                "risk": "CRITICAL"
            },
            "email": {
                "pattern": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
                "category": "PII",
                "description": "Email Address",
                "risk": "HIGH"
            },
            "phone": {
                "pattern": r"\b(?:\+1[-.]?)?\(?[0-9]{3}\)?[-.]?[0-9]{3}[-.]?[0-9]{4}\b",
                "category": "PII",
                "description": "Phone Number",
                "risk": "MEDIUM"
            },
            "ip_address": {
                "pattern": r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b",
                "category": "PII",
                "description": "IP Address",
                "risk": "MEDIUM"
            },
            "drivers_license": {
                "pattern": r"\b[A-Z]{1,2}\d{5,8}\b",
                "category": "PII",
                "description": "Driver's License Number",
                "risk": "HIGH"
            }
        }
        
        # PCI patterns
        self.pci_patterns = {
            "credit_card": {
                "pattern": r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9][0-9])[0-9]{12})\b",
                "category": "PCI",
                "description": "Credit Card Number",
                "risk": "CRITICAL"
            },
            "cvv": {
                "pattern": r"\b[0-9]{3,4}\b",  # Note: needs context
                "category": "PCI",
                "description": "Card Verification Value",
                "risk": "CRITICAL"
            }
        }
        
        # PHI patterns (HIPAA)
        self.phi_patterns = {
            "mrn": {
                "pattern": r"\b(?:MRN|Medical Record)[\s#:]*[0-9]{6,10}\b",
                "category": "PHI",
                "description": "Medical Record Number",
                "risk": "CRITICAL"
            },
            "npi": {
                "pattern": r"\b[0-9]{10}\b",  # NPI is 10 digits
                "category": "PHI",
                "description": "National Provider Identifier",
                "risk": "HIGH"
            }
        }
        
        # Column name patterns for classification
        self.column_patterns = {
            "PII": ["name", "first_name", "last_name", "email", "phone", "address", "ssn", "dob", "birth", "age"],
            "PHI": ["diagnosis", "treatment", "medical", "health", "patient", "condition", "prescription", "medication"],
            "PCI": ["card", "credit", "cvv", "expiry", "payment", "account_number", "routing"],
            "SENSITIVE": ["password", "secret", "token", "api_key", "credential", "private_key"]
        }
        
        logger.info(f"Data Classifier v{self.version} loaded")
    
    def classify(self, content: str) -> Dict[str, Any]:
        """Classify content for sensitive data"""
        
        patterns_matched = []
        risk_level = "LOW"
        data_type = "PUBLIC"
        category = "General"
        confidence = 0.0
        
        # Check PII patterns
        for name, pattern_info in self.pii_patterns.items():
            if re.search(pattern_info["pattern"], content, re.IGNORECASE):
                patterns_matched.append(name)
                data_type = "PII"
                category = pattern_info["description"]
                if pattern_info["risk"] == "CRITICAL":
                    risk_level = "CRITICAL"
                elif pattern_info["risk"] == "HIGH" and risk_level != "CRITICAL":
                    risk_level = "HIGH"
        
        # Check PCI patterns
        for name, pattern_info in self.pci_patterns.items():
            if re.search(pattern_info["pattern"], content):
                patterns_matched.append(name)
                data_type = "PCI"
                category = pattern_info["description"]
                risk_level = "CRITICAL"
        
        # Check PHI patterns
        for name, pattern_info in self.phi_patterns.items():
            if re.search(pattern_info["pattern"], content, re.IGNORECASE):
                patterns_matched.append(name)
                data_type = "PHI"
                category = pattern_info["description"]
                risk_level = "CRITICAL"
        
        # Calculate confidence
        if patterns_matched:
            confidence = min(0.95, 0.7 + len(patterns_matched) * 0.1)
        else:
            confidence = 0.5
        
        return {
            "data_type": data_type,
            "category": category,
            "confidence": round(confidence, 2),
            "patterns_matched": patterns_matched,
            "risk_level": risk_level
        }
    
    def detect_pii(self, content: str) -> List[Dict[str, Any]]:
        """Detect all PII in content"""
        
        findings = []
        
        for name, pattern_info in self.pii_patterns.items():
            matches = re.finditer(pattern_info["pattern"], content, re.IGNORECASE)
            for match in matches:
                findings.append({
                    "type": name,
                    "description": pattern_info["description"],
                    "value_masked": self._mask_value(match.group()),
                    "position": match.start(),
                    "risk": pattern_info["risk"]
                })
        
        for name, pattern_info in self.pci_patterns.items():
            if name == "cvv":
                continue  # Skip CVV without context
            matches = re.finditer(pattern_info["pattern"], content)
            for match in matches:
                findings.append({
                    "type": name,
                    "description": pattern_info["description"],
                    "value_masked": self._mask_value(match.group()),
                    "position": match.start(),
                    "risk": pattern_info["risk"]
                })
        
        return findings
    
    def get_categories(self) -> List[Dict[str, Any]]:
        """Get all data categories"""
        
        return [
            {"code": "PII", "name": "Personally Identifiable Information", "examples": ["SSN", "Email", "Phone"]},
            {"code": "PHI", "name": "Protected Health Information", "examples": ["MRN", "Diagnosis", "Treatment"]},
            {"code": "PCI", "name": "Payment Card Industry Data", "examples": ["Credit Card", "CVV", "Account"]},
            {"code": "SENSITIVE", "name": "Sensitive Business Data", "examples": ["Passwords", "API Keys", "Secrets"]},
            {"code": "PUBLIC", "name": "Public/Non-sensitive Data", "examples": ["Product Names", "Public Docs"]}
        ]
    
    def _mask_value(self, value: str) -> str:
        """Mask sensitive value"""
        if len(value) <= 4:
            return "****"
        return value[:2] + "*" * (len(value) - 4) + value[-2:]
