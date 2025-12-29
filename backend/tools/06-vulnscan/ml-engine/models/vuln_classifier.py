"""
VulnScan ML Engine - Vulnerability Classifier Model
Classify and categorize vulnerabilities
"""

import numpy as np
import logging
from typing import Dict, Any, List, Optional
import re

logger = logging.getLogger(__name__)


class VulnerabilityClassifier:
    """
    ML-based vulnerability classification and severity assessment.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.last_updated = "2025-01-15T00:00:00Z"
        self.cve_db_date = "2025-01-15"
        self.is_loaded = True
        
        # Known CVEs (sample database)
        self.known_cves = {
            "CVE-2024-0001": {"severity": "CRITICAL", "cvss": 9.8, "category": "RCE"},
            "CVE-2024-0002": {"severity": "HIGH", "cvss": 8.5, "category": "SQLi"},
            "CVE-2024-0003": {"severity": "MEDIUM", "cvss": 5.5, "category": "XSS"},
            "CVE-2023-44487": {"severity": "HIGH", "cvss": 7.5, "category": "DoS"},
            "CVE-2023-4863": {"severity": "CRITICAL", "cvss": 9.6, "category": "Heap Overflow"},
            "CVE-2021-44228": {"severity": "CRITICAL", "cvss": 10.0, "category": "RCE"},
            "CVE-2021-45046": {"severity": "CRITICAL", "cvss": 9.0, "category": "RCE"},
            "CVE-2022-22965": {"severity": "CRITICAL", "cvss": 9.8, "category": "RCE"},
        }
        
        # Vulnerability categories
        self.categories = {
            "rce": "Remote Code Execution",
            "sqli": "SQL Injection",
            "xss": "Cross-Site Scripting",
            "csrf": "Cross-Site Request Forgery",
            "ssrf": "Server-Side Request Forgery",
            "lfi": "Local File Inclusion",
            "rfi": "Remote File Inclusion",
            "dos": "Denial of Service",
            "auth_bypass": "Authentication Bypass",
            "priv_esc": "Privilege Escalation",
            "info_disclosure": "Information Disclosure",
            "buffer_overflow": "Buffer Overflow",
            "memory_corruption": "Memory Corruption"
        }
        
        logger.info(f"Vulnerability Classifier v{self.version} loaded")
    
    def classify(self, vuln_data: Dict[str, Any]) -> Dict[str, Any]:
        """Classify vulnerability and determine severity"""
        
        cve_id = vuln_data.get("cve_id")
        title = vuln_data.get("title", "").lower()
        description = vuln_data.get("description", "").lower()
        cvss_vector = vuln_data.get("cvss_vector")
        
        # Check known CVEs first
        if cve_id and cve_id in self.known_cves:
            known = self.known_cves[cve_id]
            return {
                "severity": known["severity"],
                "cvss_score": known["cvss"],
                "category": known["category"],
                "remediation_priority": self._get_priority(known["cvss"]),
                "recommendations": self._get_recommendations(known["category"])
            }
        
        # Analyze by keywords
        category = self._detect_category(title, description)
        cvss_score = self._estimate_cvss(category, description, cvss_vector)
        severity = self._score_to_severity(cvss_score)
        
        return {
            "severity": severity,
            "cvss_score": cvss_score,
            "category": category,
            "remediation_priority": self._get_priority(cvss_score),
            "recommendations": self._get_recommendations(category)
        }
    
    def _detect_category(self, title: str, description: str) -> str:
        """Detect vulnerability category"""
        
        text = f"{title} {description}"
        
        category_keywords = {
            "Remote Code Execution": ["remote code execution", "rce", "execute arbitrary code", "command injection"],
            "SQL Injection": ["sql injection", "sqli", "database injection"],
            "Cross-Site Scripting": ["cross-site scripting", "xss", "script injection"],
            "Denial of Service": ["denial of service", "dos", "resource exhaustion", "crash"],
            "Authentication Bypass": ["authentication bypass", "auth bypass", "login bypass"],
            "Privilege Escalation": ["privilege escalation", "priv esc", "elevation of privilege"],
            "Buffer Overflow": ["buffer overflow", "heap overflow", "stack overflow"],
            "Information Disclosure": ["information disclosure", "data leak", "sensitive data exposure"],
            "Path Traversal": ["path traversal", "directory traversal", "lfi", "rfi"],
            "SSRF": ["ssrf", "server-side request forgery"],
        }
        
        for category, keywords in category_keywords.items():
            if any(kw in text for kw in keywords):
                return category
        
        return "Unknown"
    
    def _estimate_cvss(self, category: str, description: str, cvss_vector: Optional[str]) -> float:
        """Estimate CVSS score"""
        
        # Base scores by category
        category_scores = {
            "Remote Code Execution": 9.5,
            "SQL Injection": 8.5,
            "Buffer Overflow": 8.5,
            "Authentication Bypass": 8.0,
            "Privilege Escalation": 7.5,
            "Cross-Site Scripting": 6.5,
            "Denial of Service": 7.0,
            "SSRF": 7.5,
            "Path Traversal": 7.0,
            "Information Disclosure": 5.5,
            "Unknown": 5.0
        }
        
        base_score = category_scores.get(category, 5.0)
        
        # Adjust based on keywords
        if "unauthenticated" in description or "without authentication" in description:
            base_score = min(base_score + 1.0, 10.0)
        if "remote" in description:
            base_score = min(base_score + 0.5, 10.0)
        if "requires user interaction" in description:
            base_score = max(base_score - 0.5, 0.0)
        
        return round(base_score, 1)
    
    def _score_to_severity(self, score: float) -> str:
        """Convert CVSS score to severity"""
        
        if score >= 9.0:
            return "CRITICAL"
        elif score >= 7.0:
            return "HIGH"
        elif score >= 4.0:
            return "MEDIUM"
        elif score >= 0.1:
            return "LOW"
        else:
            return "INFO"
    
    def _get_priority(self, cvss_score: float) -> int:
        """Get remediation priority (1-5)"""
        
        if cvss_score >= 9.0:
            return 1
        elif cvss_score >= 7.0:
            return 2
        elif cvss_score >= 4.0:
            return 3
        elif cvss_score >= 1.0:
            return 4
        else:
            return 5
    
    def _get_recommendations(self, category: str) -> List[str]:
        """Get remediation recommendations"""
        
        recommendations = {
            "Remote Code Execution": [
                "Apply vendor patches immediately",
                "Implement network segmentation",
                "Enable Web Application Firewall rules",
                "Conduct code review for similar patterns"
            ],
            "SQL Injection": [
                "Use parameterized queries/prepared statements",
                "Implement input validation",
                "Apply least privilege database permissions",
                "Enable WAF SQL injection rules"
            ],
            "Cross-Site Scripting": [
                "Implement Content Security Policy",
                "Use output encoding/escaping",
                "Enable HTTPOnly and Secure cookie flags",
                "Validate and sanitize user input"
            ],
            "Authentication Bypass": [
                "Apply vendor security patches",
                "Implement multi-factor authentication",
                "Review access control configurations",
                "Enable account lockout policies"
            ],
            "Denial of Service": [
                "Implement rate limiting",
                "Configure resource quotas",
                "Enable DDoS protection",
                "Apply vendor patches"
            ]
        }
        
        return recommendations.get(category, [
            "Apply vendor security patches",
            "Review security configurations",
            "Implement defense in depth measures"
        ])
    
    def lookup_cve(self, cve_id: str) -> Dict[str, Any]:
        """Lookup CVE information"""
        
        if cve_id in self.known_cves:
            cve = self.known_cves[cve_id]
            return {
                "cve_id": cve_id,
                "found": True,
                "severity": cve["severity"],
                "cvss_score": cve["cvss"],
                "category": cve["category"],
                "recommendations": self._get_recommendations(cve["category"])
            }
        
        return {
            "cve_id": cve_id,
            "found": False,
            "message": "CVE not found in database"
        }
