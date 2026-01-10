"""
MalwareHunter ML Engine - Static Analyzer Model
Static analysis of PE files and other executables
"""

import numpy as np
import logging
from typing import Dict, Any, List
import hashlib
import math

logger = logging.getLogger(__name__)


class StaticAnalyzer:
    """
    Static file analysis for malware detection.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Suspicious imports
        self.suspicious_imports = [
            "VirtualAlloc", "VirtualProtect", "CreateRemoteThread",
            "WriteProcessMemory", "LoadLibrary", "GetProcAddress",
            "CreateProcess", "WinExec", "ShellExecute",
            "RegSetValue", "InternetOpen", "URLDownloadToFile"
        ]
        
        # Suspicious strings
        self.suspicious_patterns = [
            "http://", "https://", ".onion", "bitcoin:",
            "encrypt", "decrypt", "password", "credential",
            "powershell", "cmd.exe", "wscript", "cscript"
        ]
        
        logger.info(f"Static Analyzer v{self.version} loaded")
    
    def analyze(self, sample: Dict[str, Any]) -> Dict[str, Any]:
        """Perform static analysis on sample"""
        
        file_hash = sample.get("file_hash", "")
        file_size = sample.get("file_size", 0) or np.random.randint(10000, 5000000)
        file_type = sample.get("file_type", "PE32")
        
        # Simulate analysis results
        hash_int = int(hashlib.md5(file_hash.encode()).hexdigest()[:8], 16)
        
        # Calculate entropy (simulated)
        entropy = 5.0 + (hash_int % 300) / 100  # 5.0 - 8.0 range
        
        # Determine if packed (high entropy suggests packing)
        packed = entropy > 7.0
        
        # Simulate imports found
        num_imports = hash_int % 8
        imports = np.random.choice(
            self.suspicious_imports, 
            min(num_imports, len(self.suspicious_imports)), 
            replace=False
        ).tolist()
        
        # Simulate suspicious strings
        num_strings = hash_int % 6
        suspicious_strings = np.random.choice(
            self.suspicious_patterns,
            min(num_strings, len(self.suspicious_patterns)),
            replace=False
        ).tolist()
        
        # Determine if signed
        signed = (hash_int % 100) < 20  # 20% chance signed
        
        # Generate risk indicators
        risk_indicators = []
        
        if packed:
            risk_indicators.append({
                "type": "packing",
                "description": "File appears to be packed or obfuscated",
                "severity": "HIGH"
            })
        
        if entropy > 7.5:
            risk_indicators.append({
                "type": "high_entropy",
                "description": f"Unusually high entropy ({entropy:.2f})",
                "severity": "MEDIUM"
            })
        
        if len(imports) > 3:
            risk_indicators.append({
                "type": "suspicious_imports",
                "description": f"Found {len(imports)} suspicious API imports",
                "severity": "HIGH"
            })
        
        if len(suspicious_strings) > 2:
            risk_indicators.append({
                "type": "suspicious_strings",
                "description": f"Found {len(suspicious_strings)} suspicious strings",
                "severity": "MEDIUM"
            })
        
        if not signed:
            risk_indicators.append({
                "type": "unsigned",
                "description": "File is not digitally signed",
                "severity": "LOW"
            })
        
        return {
            "file_type": file_type,
            "file_size": file_size,
            "entropy": round(entropy, 2),
            "imports": imports,
            "suspicious_strings": suspicious_strings,
            "packed": packed,
            "signed": signed,
            "risk_indicators": risk_indicators
        }
