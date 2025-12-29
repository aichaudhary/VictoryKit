"""
SecureCode ML Engine - Main FastAPI Application
AI-Powered Code Security Analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from models.vuln_detector import VulnDetector
from models.code_quality import CodeQualityAnalyzer
from models.fix_suggester import FixSuggester

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SecureCode ML Engine",
    description="AI-Powered Code Security Analysis Engine",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
vuln_detector = VulnDetector()
code_quality = CodeQualityAnalyzer()
fix_suggester = FixSuggester()


# Pydantic models
class CodeInput(BaseModel):
    code_id: str
    language: str  # 'python', 'javascript', 'java', 'csharp', 'go', 'php'
    code: str
    file_path: Optional[str] = None
    context: Optional[str] = None


class ScanInput(BaseModel):
    scan_id: str
    files: List[CodeInput]
    scan_type: str = "full"  # 'full', 'quick', 'security_only'


class VulnerabilityResult(BaseModel):
    vuln_id: str
    title: str
    severity: str
    cwe_id: Optional[str]
    line_number: int
    column: Optional[int]
    code_snippet: str
    description: str
    fix_suggestion: Optional[str]


class QualityResult(BaseModel):
    code_id: str
    quality_score: float
    maintainability: float
    complexity: float
    security_score: float
    issues: List[Dict[str, Any]]


class FixSuggestion(BaseModel):
    vuln_id: str
    original_code: str
    fixed_code: str
    explanation: str
    confidence: float


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SecureCode ML Engine",
        "version": "1.0.0",
        "models_loaded": {
            "vuln_detector": vuln_detector.is_loaded,
            "code_quality": code_quality.is_loaded,
            "fix_suggester": fix_suggester.is_loaded,
        }
    }


# Analyze code for vulnerabilities
@app.post("/analyze/security", response_model=List[VulnerabilityResult])
async def analyze_security(code: CodeInput):
    try:
        logger.info(f"Analyzing code {code.code_id}")
        
        vulnerabilities = vuln_detector.detect(code.model_dump())
        
        return [
            VulnerabilityResult(
                vuln_id=v["vuln_id"],
                title=v["title"],
                severity=v["severity"],
                cwe_id=v.get("cwe_id"),
                line_number=v["line_number"],
                column=v.get("column"),
                code_snippet=v["code_snippet"],
                description=v["description"],
                fix_suggestion=v.get("fix_suggestion")
            )
            for v in vulnerabilities
        ]
    except Exception as e:
        logger.error(f"Error analyzing code: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch analyze
@app.post("/analyze/batch")
async def batch_analyze(scan: ScanInput):
    try:
        logger.info(f"Batch analyzing {len(scan.files)} files")
        
        all_results = {
            "scan_id": scan.scan_id,
            "total_files": len(scan.files),
            "total_vulnerabilities": 0,
            "by_severity": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
            "vulnerabilities": []
        }
        
        for file in scan.files:
            vulns = vuln_detector.detect(file.model_dump())
            all_results["total_vulnerabilities"] += len(vulns)
            
            for v in vulns:
                all_results["by_severity"][v.get("severity", "MEDIUM")] += 1
                v["file_path"] = file.file_path
                all_results["vulnerabilities"].append(v)
        
        return all_results
    except Exception as e:
        logger.error(f"Error in batch analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Analyze code quality
@app.post("/analyze/quality", response_model=QualityResult)
async def analyze_quality(code: CodeInput):
    try:
        logger.info(f"Analyzing quality for {code.code_id}")
        
        result = code_quality.analyze(code.model_dump())
        
        return QualityResult(
            code_id=code.code_id,
            quality_score=result["quality_score"],
            maintainability=result["maintainability"],
            complexity=result["complexity"],
            security_score=result["security_score"],
            issues=result["issues"]
        )
    except Exception as e:
        logger.error(f"Error analyzing quality: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Suggest fix
@app.post("/suggest/fix", response_model=FixSuggestion)
async def suggest_fix(code: CodeInput, vuln_id: str):
    try:
        logger.info(f"Suggesting fix for {vuln_id}")
        
        fix = fix_suggester.suggest(code.model_dump(), vuln_id)
        
        return FixSuggestion(
            vuln_id=vuln_id,
            original_code=fix["original_code"],
            fixed_code=fix["fixed_code"],
            explanation=fix["explanation"],
            confidence=fix["confidence"]
        )
    except Exception as e:
        logger.error(f"Error suggesting fix: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get supported languages
@app.get("/languages")
async def get_supported_languages():
    return {
        "languages": vuln_detector.supported_languages,
        "frameworks": vuln_detector.supported_frameworks
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
