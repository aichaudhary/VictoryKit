"""
SecureCode ML Engine - Vulnerability Detector Model
Detect security vulnerabilities in source code
"""

import logging
from typing import Dict, Any, List
import re

logger = logging.getLogger(__name__)


class VulnDetector:
    """
    ML-based vulnerability detection in source code.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        self.supported_languages = [
            "python", "javascript", "typescript", "java", 
            "csharp", "go", "php", "ruby", "rust"
        ]
        
        self.supported_frameworks = [
            "express", "django", "flask", "spring", "react",
            "angular", "vue", "rails", "laravel", "fastapi"
        ]
        
        # Vulnerability patterns by language
        self.patterns = {
            "python": [
                {
                    "name": "SQL Injection",
                    "pattern": r'execute\s*\(\s*["\'].*%s|format\s*\(',
                    "cwe": "CWE-89",
                    "severity": "CRITICAL"
                },
                {
                    "name": "Command Injection",
                    "pattern": r'os\.system\s*\(|subprocess\.call\s*\(\s*[^,\]]+\s*,\s*shell\s*=\s*True',
                    "cwe": "CWE-78",
                    "severity": "CRITICAL"
                },
                {
                    "name": "Hardcoded Secret",
                    "pattern": r'(?:password|secret|api_key|token)\s*=\s*["\'][^"\']+["\']',
                    "cwe": "CWE-798",
                    "severity": "HIGH"
                },
                {
                    "name": "Insecure Deserialization",
                    "pattern": r'pickle\.loads?\s*\(|yaml\.load\s*\([^,]*\)',
                    "cwe": "CWE-502",
                    "severity": "HIGH"
                },
                {
                    "name": "Eval Usage",
                    "pattern": r'eval\s*\(|exec\s*\(',
                    "cwe": "CWE-95",
                    "severity": "CRITICAL"
                }
            ],
            "javascript": [
                {
                    "name": "SQL Injection",
                    "pattern": r'query\s*\(\s*[`"\'].*\$\{|query\s*\(\s*.*\+',
                    "cwe": "CWE-89",
                    "severity": "CRITICAL"
                },
                {
                    "name": "XSS Vulnerability",
                    "pattern": r'innerHTML\s*=|document\.write\s*\(|dangerouslySetInnerHTML',
                    "cwe": "CWE-79",
                    "severity": "HIGH"
                },
                {
                    "name": "Command Injection",
                    "pattern": r'exec\s*\(|spawn\s*\([^,]+\+',
                    "cwe": "CWE-78",
                    "severity": "CRITICAL"
                },
                {
                    "name": "Hardcoded Secret",
                    "pattern": r'(?:password|secret|apiKey|token)\s*[:=]\s*["\'][^"\']+["\']',
                    "cwe": "CWE-798",
                    "severity": "HIGH"
                },
                {
                    "name": "Eval Usage",
                    "pattern": r'eval\s*\(',
                    "cwe": "CWE-95",
                    "severity": "CRITICAL"
                },
                {
                    "name": "Prototype Pollution",
                    "pattern": r'\[.*\]\s*=.*__proto__|Object\.assign\s*\(\s*\{\}',
                    "cwe": "CWE-1321",
                    "severity": "HIGH"
                }
            ],
            "java": [
                {
                    "name": "SQL Injection",
                    "pattern": r'executeQuery\s*\(\s*.*\+|createQuery\s*\(\s*.*\+',
                    "cwe": "CWE-89",
                    "severity": "CRITICAL"
                },
                {
                    "name": "XXE Vulnerability",
                    "pattern": r'XMLInputFactory|DocumentBuilderFactory(?!.*setFeature)',
                    "cwe": "CWE-611",
                    "severity": "HIGH"
                },
                {
                    "name": "Insecure Deserialization",
                    "pattern": r'ObjectInputStream|readObject\s*\(',
                    "cwe": "CWE-502",
                    "severity": "HIGH"
                },
                {
                    "name": "Hardcoded Secret",
                    "pattern": r'(?:password|secret|apiKey)\s*=\s*"[^"]+"',
                    "cwe": "CWE-798",
                    "severity": "HIGH"
                }
            ]
        }
        
        logger.info(f"Vulnerability Detector v{self.version} loaded")
    
    def detect(self, code_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect vulnerabilities in code"""
        
        language = code_data.get("language", "").lower()
        code = code_data.get("code", "")
        code_id = code_data.get("code_id", "unknown")
        
        vulnerabilities = []
        
        # Get patterns for language
        patterns = self.patterns.get(language, self.patterns.get("javascript", []))
        
        # Check each pattern
        lines = code.split('\n')
        for line_num, line in enumerate(lines, 1):
            for pattern_def in patterns:
                if re.search(pattern_def["pattern"], line, re.IGNORECASE):
                    vuln_id = f"{code_id}-{line_num}-{pattern_def['cwe']}"
                    
                    vulnerabilities.append({
                        "vuln_id": vuln_id,
                        "title": pattern_def["name"],
                        "severity": pattern_def["severity"],
                        "cwe_id": pattern_def["cwe"],
                        "line_number": line_num,
                        "column": 1,
                        "code_snippet": line.strip()[:100],
                        "description": self._get_description(pattern_def["name"]),
                        "fix_suggestion": self._get_fix_suggestion(pattern_def["name"], language)
                    })
        
        return vulnerabilities
    
    def _get_description(self, vuln_name: str) -> str:
        """Get vulnerability description"""
        
        descriptions = {
            "SQL Injection": "User input is directly concatenated into SQL queries, allowing attackers to manipulate database operations.",
            "Command Injection": "User input is passed to system commands without sanitization, allowing arbitrary command execution.",
            "XSS Vulnerability": "User input is rendered without escaping, allowing injection of malicious scripts.",
            "Hardcoded Secret": "Sensitive credentials are hardcoded in source code, risking exposure in version control.",
            "Insecure Deserialization": "Untrusted data is deserialized, potentially allowing arbitrary code execution.",
            "Eval Usage": "Dynamic code evaluation is used, which can execute arbitrary code if input is not sanitized.",
            "XXE Vulnerability": "XML parser is not configured to prevent external entity processing.",
            "Prototype Pollution": "Object properties can be modified via __proto__, potentially affecting application behavior."
        }
        
        return descriptions.get(vuln_name, "Security vulnerability detected that requires review.")
    
    def _get_fix_suggestion(self, vuln_name: str, language: str) -> str:
        """Get fix suggestion"""
        
        fixes = {
            "SQL Injection": "Use parameterized queries or prepared statements instead of string concatenation.",
            "Command Injection": "Use subprocess with shell=False and pass arguments as a list. Validate all input.",
            "XSS Vulnerability": "Escape all user input before rendering. Use textContent instead of innerHTML.",
            "Hardcoded Secret": "Move secrets to environment variables or a secure secrets manager.",
            "Insecure Deserialization": "Validate data before deserialization. Use safe alternatives like JSON.",
            "Eval Usage": "Avoid eval(). Use safer alternatives like JSON.parse() for data.",
            "XXE Vulnerability": "Disable external entities in XML parser configuration.",
            "Prototype Pollution": "Validate object keys. Use Object.create(null) for dictionary objects."
        }
        
        return fixes.get(vuln_name, "Review and fix the security issue following secure coding practices.")
