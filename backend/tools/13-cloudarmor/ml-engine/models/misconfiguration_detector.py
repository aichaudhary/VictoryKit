"""
CloudArmor ML Engine - Misconfiguration Detector
Detect cloud security misconfigurations
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class MisconfigurationDetector:
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Security checks by resource type
        self.checks = {
            "aws:s3:bucket": [
                {"id": "S3_PUBLIC_ACCESS", "name": "S3 bucket has public access", "severity": "critical", "field": "publicAccessBlockConfiguration"},
                {"id": "S3_ENCRYPTION", "name": "S3 bucket not encrypted", "severity": "high", "field": "serverSideEncryptionConfiguration"},
                {"id": "S3_VERSIONING", "name": "S3 versioning not enabled", "severity": "medium", "field": "versioning"},
                {"id": "S3_LOGGING", "name": "S3 access logging not enabled", "severity": "medium", "field": "loggingConfiguration"}
            ],
            "aws:ec2:instance": [
                {"id": "EC2_PUBLIC_IP", "name": "EC2 has public IP", "severity": "high", "field": "publicIpAddress"},
                {"id": "EC2_IMDSv2", "name": "IMDSv2 not enforced", "severity": "high", "field": "metadataOptions.httpTokens"},
                {"id": "EC2_EBS_ENCRYPTION", "name": "EBS volumes not encrypted", "severity": "high", "field": "blockDeviceMappings"}
            ],
            "aws:rds:instance": [
                {"id": "RDS_PUBLIC", "name": "RDS publicly accessible", "severity": "critical", "field": "publiclyAccessible"},
                {"id": "RDS_ENCRYPTION", "name": "RDS not encrypted", "severity": "high", "field": "storageEncrypted"},
                {"id": "RDS_MULTI_AZ", "name": "RDS not multi-AZ", "severity": "medium", "field": "multiAZ"}
            ],
            "aws:iam:user": [
                {"id": "IAM_MFA", "name": "MFA not enabled", "severity": "high", "field": "mfaEnabled"},
                {"id": "IAM_KEY_ROTATION", "name": "Access keys not rotated", "severity": "medium", "field": "accessKeyLastRotated"}
            ],
            "azure:storage:account": [
                {"id": "AZURE_STORAGE_HTTPS", "name": "HTTPS not enforced", "severity": "high", "field": "enableHttpsTrafficOnly"},
                {"id": "AZURE_STORAGE_ENCRYPTION", "name": "Encryption not enabled", "severity": "high", "field": "encryption.services"}
            ],
            "gcp:storage:bucket": [
                {"id": "GCP_BUCKET_PUBLIC", "name": "Bucket publicly accessible", "severity": "critical", "field": "iamConfiguration.publicAccessPrevention"},
                {"id": "GCP_BUCKET_UNIFORM", "name": "Uniform access not enabled", "severity": "medium", "field": "iamConfiguration.uniformBucketLevelAccess"}
            ]
        }
        
        logger.info(f"Misconfiguration Detector v{self.version} loaded")
    
    def detect(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        resource_type = resource.get("type", "")
        config = resource.get("configuration", {})
        
        findings = []
        checks = self.checks.get(resource_type, [])
        
        for check in checks:
            field_path = check["field"].split(".")
            value = config
            
            for part in field_path:
                if isinstance(value, dict):
                    value = value.get(part)
                else:
                    value = None
                    break
            
            # Check for missing or insecure configuration
            is_violation = False
            
            if value is None:
                is_violation = True
            elif check["id"].endswith("_PUBLIC") or check["id"].endswith("_PUBLIC_ACCESS"):
                is_violation = value == True or value == "enabled"
            elif check["id"].endswith("_ENCRYPTION") or check["id"].endswith("_ENCRYPTED"):
                is_violation = value != True and value != "enabled"
            elif check["id"].endswith("_MFA"):
                is_violation = value != True
            
            if is_violation:
                findings.append({
                    "checkId": check["id"],
                    "name": check["name"],
                    "severity": check["severity"],
                    "category": self._get_category(check["id"]),
                    "recommendation": self._get_recommendation(check["id"])
                })
        
        return findings
    
    def evaluate_policy(self, policy: Dict[str, Any]) -> Dict[str, Any]:
        conditions = policy.get("conditions", [])
        config = policy.get("resourceConfiguration", {})
        
        violations = []
        
        for condition in conditions:
            field = condition.get("field", "")
            operator = condition.get("operator", "")
            expected = condition.get("value")
            
            actual = self._get_nested_value(config, field)
            
            is_violation = self._evaluate_condition(actual, operator, expected)
            
            if is_violation:
                violations.append({
                    "field": field,
                    "expected": expected,
                    "actual": actual,
                    "operator": operator
                })
        
        return {
            "policyName": policy.get("name", ""),
            "compliant": len(violations) == 0,
            "violations": violations,
            "violationCount": len(violations)
        }
    
    def get_benchmarks(self) -> Dict[str, Any]:
        return {
            "benchmarks": [
                {"name": "CIS AWS Foundations", "version": "1.4.0", "controls": 58},
                {"name": "CIS Azure Foundations", "version": "1.3.1", "controls": 52},
                {"name": "CIS GCP Foundations", "version": "1.2.0", "controls": 45},
                {"name": "AWS Well-Architected", "version": "2023", "pillars": 6},
                {"name": "NIST CSF", "version": "1.1", "categories": 5}
            ],
            "totalChecks": sum(len(c) for c in self.checks.values()),
            "supportedResourceTypes": list(self.checks.keys())
        }
    
    def _get_category(self, check_id: str) -> str:
        if "PUBLIC" in check_id:
            return "public_exposure"
        elif "ENCRYPTION" in check_id or "ENCRYPTED" in check_id:
            return "encryption"
        elif "MFA" in check_id or "IAM" in check_id:
            return "access_control"
        elif "LOGGING" in check_id:
            return "logging"
        else:
            return "configuration"
    
    def _get_recommendation(self, check_id: str) -> str:
        recommendations = {
            "S3_PUBLIC_ACCESS": "Enable S3 Block Public Access settings",
            "S3_ENCRYPTION": "Enable default encryption for S3 bucket",
            "S3_VERSIONING": "Enable versioning for data protection",
            "S3_LOGGING": "Enable access logging for audit trail",
            "EC2_PUBLIC_IP": "Use private subnets and NAT gateway",
            "EC2_IMDSv2": "Enforce IMDSv2 for metadata service",
            "EC2_EBS_ENCRYPTION": "Enable EBS encryption by default",
            "RDS_PUBLIC": "Place RDS in private subnet",
            "RDS_ENCRYPTION": "Enable RDS storage encryption",
            "RDS_MULTI_AZ": "Enable Multi-AZ for high availability",
            "IAM_MFA": "Enable MFA for all IAM users",
            "IAM_KEY_ROTATION": "Rotate access keys every 90 days"
        }
        return recommendations.get(check_id, "Review and remediate configuration")
    
    def _get_nested_value(self, obj: Dict, path: str):
        parts = path.split(".")
        for part in parts:
            if isinstance(obj, dict):
                obj = obj.get(part)
            else:
                return None
        return obj
    
    def _evaluate_condition(self, actual, operator: str, expected) -> bool:
        if operator == "equals":
            return actual != expected
        elif operator == "not_equals":
            return actual == expected
        elif operator == "exists":
            return actual is None
        elif operator == "not_exists":
            return actual is not None
        return False
