"""
SecureCode ML Engine - Fix Suggester Model
AI-powered code fix suggestions
"""

import logging
from typing import Dict, Any
import re

logger = logging.getLogger(__name__)


class FixSuggester:
    """
    AI-powered code fix suggestions for security vulnerabilities.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Fix templates by vulnerability type
        self.fix_templates = {
            "sql_injection": {
                "python": {
                    "pattern": r'execute\s*\(\s*["\']([^"\']*%s[^"\']*)["\']',
                    "fix": 'execute("SELECT * FROM table WHERE id = %s", (user_input,))',
                    "explanation": "Use parameterized queries with placeholders instead of string formatting"
                },
                "javascript": {
                    "pattern": r'query\s*\(\s*`([^`]*\$\{[^}]+\}[^`]*)`',
                    "fix": 'query("SELECT * FROM table WHERE id = $1", [userId])',
                    "explanation": "Use parameterized queries with numbered placeholders"
                }
            },
            "xss": {
                "javascript": {
                    "pattern": r'innerHTML\s*=\s*([^;]+)',
                    "fix": 'textContent = sanitizedContent',
                    "explanation": "Use textContent instead of innerHTML, or sanitize input with DOMPurify"
                }
            },
            "command_injection": {
                "python": {
                    "pattern": r'os\.system\s*\(\s*([^)]+)\)',
                    "fix": 'subprocess.run(["command", arg], shell=False, check=True)',
                    "explanation": "Use subprocess with shell=False and pass arguments as a list"
                }
            },
            "hardcoded_secret": {
                "python": {
                    "pattern": r'(password|secret|api_key)\s*=\s*["\'][^"\']+["\']',
                    "fix": 'password = os.environ.get("PASSWORD")',
                    "explanation": "Store secrets in environment variables or a secrets manager"
                },
                "javascript": {
                    "pattern": r'(password|secret|apiKey)\s*[:=]\s*["\'][^"\']+["\']',
                    "fix": 'const password = process.env.PASSWORD',
                    "explanation": "Store secrets in environment variables"
                }
            },
            "eval": {
                "python": {
                    "pattern": r'eval\s*\(\s*([^)]+)\)',
                    "fix": 'json.loads(data)  # If parsing JSON, use json module',
                    "explanation": "Avoid eval(). Use specific parsers like json.loads() for data"
                },
                "javascript": {
                    "pattern": r'eval\s*\(\s*([^)]+)\)',
                    "fix": 'JSON.parse(data)  // If parsing JSON',
                    "explanation": "Avoid eval(). Use JSON.parse() for JSON data"
                }
            }
        }
        
        logger.info(f"Fix Suggester v{self.version} loaded")
    
    def suggest(self, code_data: Dict[str, Any], vuln_id: str) -> Dict[str, Any]:
        """Suggest fix for vulnerability"""
        
        code = code_data.get("code", "")
        language = code_data.get("language", "").lower()
        
        # Determine vulnerability type from vuln_id
        vuln_type = self._determine_vuln_type(vuln_id, code)
        
        # Get fix template
        fix_info = self._get_fix_template(vuln_type, language)
        
        # Find the vulnerable code
        vulnerable_code = self._extract_vulnerable_code(code, vuln_type, language)
        
        # Generate fixed code
        fixed_code = self._generate_fix(vulnerable_code, fix_info, language)
        
        return {
            "original_code": vulnerable_code,
            "fixed_code": fixed_code,
            "explanation": fix_info.get("explanation", "Apply secure coding practices"),
            "confidence": self._calculate_confidence(vuln_type, language)
        }
    
    def _determine_vuln_type(self, vuln_id: str, code: str) -> str:
        """Determine vulnerability type"""
        
        vuln_id_lower = vuln_id.lower()
        
        if "89" in vuln_id or "sql" in vuln_id_lower:
            return "sql_injection"
        elif "79" in vuln_id or "xss" in vuln_id_lower:
            return "xss"
        elif "78" in vuln_id or "command" in vuln_id_lower:
            return "command_injection"
        elif "798" in vuln_id or "secret" in vuln_id_lower or "password" in vuln_id_lower:
            return "hardcoded_secret"
        elif "95" in vuln_id or "eval" in vuln_id_lower:
            return "eval"
        
        # Check code content
        if re.search(r'eval\s*\(', code):
            return "eval"
        elif re.search(r'password\s*=\s*["\']', code):
            return "hardcoded_secret"
        
        return "unknown"
    
    def _get_fix_template(self, vuln_type: str, language: str) -> Dict[str, str]:
        """Get fix template for vulnerability type"""
        
        templates = self.fix_templates.get(vuln_type, {})
        return templates.get(language, {
            "fix": "// Apply secure coding fix",
            "explanation": "Review and fix according to secure coding guidelines"
        })
    
    def _extract_vulnerable_code(self, code: str, vuln_type: str, language: str) -> str:
        """Extract the vulnerable code segment"""
        
        templates = self.fix_templates.get(vuln_type, {})
        lang_template = templates.get(language, {})
        pattern = lang_template.get("pattern")
        
        if pattern:
            match = re.search(pattern, code)
            if match:
                return match.group(0)
        
        # Return first 100 chars if no match
        return code[:100] if len(code) > 100 else code
    
    def _generate_fix(self, vulnerable_code: str, fix_info: Dict[str, str], language: str) -> str:
        """Generate fixed code"""
        
        return fix_info.get("fix", f"// Fixed version of: {vulnerable_code[:50]}")
    
    def _calculate_confidence(self, vuln_type: str, language: str) -> float:
        """Calculate fix confidence"""
        
        # Higher confidence for well-known patterns
        high_confidence = ["sql_injection", "xss", "eval", "hardcoded_secret"]
        
        if vuln_type in high_confidence:
            return 0.9
        elif vuln_type != "unknown":
            return 0.7
        else:
            return 0.5
