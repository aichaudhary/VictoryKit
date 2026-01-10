"""
SecureCode ML Engine - Code Quality Analyzer Model
Analyze code quality and maintainability
"""

import logging
from typing import Dict, Any, List
import re

logger = logging.getLogger(__name__)


class CodeQualityAnalyzer:
    """
    Analyze code quality metrics and issues.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        logger.info(f"Code Quality Analyzer v{self.version} loaded")
    
    def analyze(self, code_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze code quality"""
        
        code = code_data.get("code", "")
        language = code_data.get("language", "")
        
        lines = code.split('\n')
        
        # Calculate metrics
        complexity = self._calculate_complexity(code, language)
        maintainability = self._calculate_maintainability(code, lines)
        security_score = self._calculate_security_score(code, language)
        
        # Find issues
        issues = self._find_issues(code, lines, language)
        
        # Calculate overall quality
        quality_score = (maintainability * 0.4 + (100 - complexity) * 0.3 + security_score * 0.3)
        
        return {
            "quality_score": round(quality_score, 1),
            "maintainability": round(maintainability, 1),
            "complexity": round(complexity, 1),
            "security_score": round(security_score, 1),
            "issues": issues
        }
    
    def _calculate_complexity(self, code: str, language: str) -> float:
        """Calculate cyclomatic complexity estimate"""
        
        # Count decision points
        decision_patterns = [
            r'\bif\b', r'\belse\b', r'\belif\b', r'\bwhile\b', 
            r'\bfor\b', r'\bswitch\b', r'\bcase\b', r'\bcatch\b',
            r'\?\s*:', r'\&\&', r'\|\|'
        ]
        
        complexity = 1  # Base complexity
        for pattern in decision_patterns:
            complexity += len(re.findall(pattern, code))
        
        # Normalize to 0-100 scale
        lines = len(code.split('\n'))
        normalized = min((complexity / max(lines, 1)) * 100, 100)
        
        return normalized
    
    def _calculate_maintainability(self, code: str, lines: List[str]) -> float:
        """Calculate maintainability index"""
        
        score = 100
        
        # Check line length
        long_lines = sum(1 for line in lines if len(line) > 120)
        score -= (long_lines / max(len(lines), 1)) * 20
        
        # Check for comments
        comment_patterns = [r'#', r'//', r'/\*', r'\*/', r'"""', r"'''"]
        has_comments = any(re.search(p, code) for p in comment_patterns)
        if not has_comments and len(lines) > 20:
            score -= 15
        
        # Check function/method length (approximation)
        func_pattern = r'def\s+\w+|function\s+\w+|public\s+\w+\s+\w+\s*\('
        functions = len(re.findall(func_pattern, code))
        if functions > 0:
            avg_func_length = len(lines) / functions
            if avg_func_length > 50:
                score -= 10
        
        # Check for code duplication (simple heuristic)
        unique_lines = set(line.strip() for line in lines if line.strip())
        duplication_ratio = 1 - (len(unique_lines) / max(len([l for l in lines if l.strip()]), 1))
        score -= duplication_ratio * 20
        
        return max(score, 0)
    
    def _calculate_security_score(self, code: str, language: str) -> float:
        """Calculate security score"""
        
        score = 100
        
        # Check for common security issues
        security_issues = [
            (r'eval\s*\(', 20),
            (r'exec\s*\(', 20),
            (r'password\s*=\s*["\'][^"\']+["\']', 15),
            (r'secret\s*=\s*["\'][^"\']+["\']', 15),
            (r'api_key\s*=\s*["\'][^"\']+["\']', 15),
            (r'os\.system\s*\(', 15),
            (r'shell\s*=\s*True', 15),
            (r'innerHTML\s*=', 10),
            (r'document\.write\s*\(', 10),
            (r'pickle\.loads?\s*\(', 15),
            (r'yaml\.load\s*\([^,]*\)', 10)
        ]
        
        for pattern, penalty in security_issues:
            if re.search(pattern, code, re.IGNORECASE):
                score -= penalty
        
        return max(score, 0)
    
    def _find_issues(self, code: str, lines: List[str], language: str) -> List[Dict[str, Any]]:
        """Find code quality issues"""
        
        issues = []
        
        for line_num, line in enumerate(lines, 1):
            # Long line
            if len(line) > 120:
                issues.append({
                    "type": "STYLE",
                    "line": line_num,
                    "message": f"Line exceeds 120 characters ({len(line)})",
                    "severity": "LOW"
                })
            
            # TODO comments
            if re.search(r'\bTODO\b', line, re.IGNORECASE):
                issues.append({
                    "type": "MAINTAINABILITY",
                    "line": line_num,
                    "message": "TODO comment found - consider addressing",
                    "severity": "LOW"
                })
            
            # FIXME comments
            if re.search(r'\bFIXME\b', line, re.IGNORECASE):
                issues.append({
                    "type": "MAINTAINABILITY",
                    "line": line_num,
                    "message": "FIXME comment found - requires attention",
                    "severity": "MEDIUM"
                })
            
            # Empty catch blocks
            if re.search(r'catch\s*\([^)]*\)\s*\{\s*\}', line):
                issues.append({
                    "type": "ERROR_HANDLING",
                    "line": line_num,
                    "message": "Empty catch block - errors are silently ignored",
                    "severity": "MEDIUM"
                })
            
            # Magic numbers
            if re.search(r'[^a-zA-Z0-9_]((?<!\.)\d{4,}|[2-9]\d{2,})(?![a-zA-Z0-9_])', line):
                if not re.search(r'#|//|/\*', line):  # Not in comment
                    issues.append({
                        "type": "MAINTAINABILITY",
                        "line": line_num,
                        "message": "Magic number detected - consider using named constant",
                        "severity": "LOW"
                    })
        
        return issues[:50]  # Limit to 50 issues
