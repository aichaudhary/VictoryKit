"""
DataGuardian ML Engine - Privacy Scanner Model
Scan schemas and databases for privacy concerns
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class PrivacyScanner:
    """
    Scan database schemas for privacy-sensitive data.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Column name patterns indicating sensitive data
        self.pii_indicators = [
            "name", "first_name", "last_name", "full_name",
            "email", "email_address", "mail",
            "phone", "telephone", "mobile", "cell",
            "address", "street", "city", "zip", "postal",
            "ssn", "social_security", "tax_id",
            "dob", "date_of_birth", "birth_date", "birthday",
            "age", "gender", "nationality", "ethnicity"
        ]
        
        self.phi_indicators = [
            "diagnosis", "condition", "disease", "symptom",
            "treatment", "medication", "prescription",
            "medical", "health", "patient", "mrn",
            "blood_type", "allergy", "immunization",
            "lab_result", "test_result", "procedure"
        ]
        
        self.pci_indicators = [
            "card", "credit_card", "debit_card",
            "card_number", "pan", "cvv", "cvc",
            "expiry", "expiration", "exp_date",
            "account_number", "routing_number",
            "bank_account", "iban", "swift"
        ]
        
        logger.info(f"Privacy Scanner v{self.version} loaded")
    
    def scan_schema(self, schema: Dict[str, Any]) -> Dict[str, Any]:
        """Scan database schema for privacy concerns"""
        
        columns = schema.get("columns", [])
        total_fields = len(columns)
        
        pii_fields = []
        phi_fields = []
        pci_fields = []
        
        for column in columns:
            col_name = column.get("name", "").lower()
            samples = column.get("sample_values", [])
            
            # Check for PII
            if self._matches_indicators(col_name, self.pii_indicators):
                pii_fields.append({
                    "column_name": column["name"],
                    "data_type": column.get("data_type", "string"),
                    "indicator_matched": self._get_matched_indicator(col_name, self.pii_indicators),
                    "risk_level": "HIGH"
                })
            
            # Check for PHI
            if self._matches_indicators(col_name, self.phi_indicators):
                phi_fields.append({
                    "column_name": column["name"],
                    "data_type": column.get("data_type", "string"),
                    "indicator_matched": self._get_matched_indicator(col_name, self.phi_indicators),
                    "risk_level": "CRITICAL"
                })
            
            # Check for PCI
            if self._matches_indicators(col_name, self.pci_indicators):
                pci_fields.append({
                    "column_name": column["name"],
                    "data_type": column.get("data_type", "string"),
                    "indicator_matched": self._get_matched_indicator(col_name, self.pci_indicators),
                    "risk_level": "CRITICAL"
                })
        
        # Calculate risk score
        sensitive_count = len(pii_fields) + len(phi_fields) * 2 + len(pci_fields) * 2
        risk_score = min(100, (sensitive_count / max(total_fields, 1)) * 100 + len(pci_fields) * 10)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(pii_fields, phi_fields, pci_fields)
        
        return {
            "total_fields": total_fields,
            "pii_fields": pii_fields,
            "phi_fields": phi_fields,
            "pci_fields": pci_fields,
            "risk_score": round(risk_score, 1),
            "recommendations": recommendations
        }
    
    def _matches_indicators(self, name: str, indicators: List[str]) -> bool:
        """Check if name matches any indicators"""
        name_lower = name.lower()
        return any(indicator in name_lower for indicator in indicators)
    
    def _get_matched_indicator(self, name: str, indicators: List[str]) -> str:
        """Get the matched indicator"""
        name_lower = name.lower()
        for indicator in indicators:
            if indicator in name_lower:
                return indicator
        return ""
    
    def _generate_recommendations(
        self,
        pii_fields: List[Dict],
        phi_fields: List[Dict],
        pci_fields: List[Dict]
    ) -> List[str]:
        """Generate privacy recommendations"""
        
        recommendations = []
        
        if pci_fields:
            recommendations.append("CRITICAL: PCI data detected - Implement PCI-DSS compliant encryption and tokenization")
            recommendations.append("Ensure PCI data is never stored in plaintext")
        
        if phi_fields:
            recommendations.append("CRITICAL: PHI data detected - Ensure HIPAA compliance with encryption at rest and in transit")
            recommendations.append("Implement role-based access control for health data")
        
        if pii_fields:
            recommendations.append("HIGH: PII data detected - Apply encryption and access controls")
            recommendations.append("Implement data retention policies for PII")
            recommendations.append("Ensure GDPR/CCPA compliance for personal data")
        
        if not recommendations:
            recommendations.append("No sensitive data patterns detected - continue regular monitoring")
        
        return recommendations
