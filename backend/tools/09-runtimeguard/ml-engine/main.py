"""
ComplianceCheck ML Engine - Main FastAPI Application
Compliance Assessment & Policy Verification
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from models.policy_analyzer import PolicyAnalyzer
from models.gap_detector import GapDetector
from models.report_engine import ReportEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ComplianceCheck ML Engine",
    description="Compliance Assessment & Policy Verification Engine",
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
policy_analyzer = PolicyAnalyzer()
gap_detector = GapDetector()
report_engine = ReportEngine()


# Pydantic models
class ControlInput(BaseModel):
    control_id: str
    framework: str  # 'SOC2', 'HIPAA', 'PCI-DSS', 'GDPR', 'ISO27001', 'NIST'
    title: str
    description: str
    evidence: Optional[List[str]] = []
    status: Optional[str] = None


class AuditInput(BaseModel):
    audit_id: str
    framework: str
    scope: List[str]
    controls: List[ControlInput]


class ComplianceResult(BaseModel):
    control_id: str
    status: str  # 'COMPLIANT', 'NON_COMPLIANT', 'PARTIAL', 'NOT_APPLICABLE'
    score: float
    gaps: List[Dict[str, Any]]
    recommendations: List[str]


class GapAnalysis(BaseModel):
    framework: str
    total_controls: int
    compliant: int
    non_compliant: int
    partial: int
    compliance_percentage: float
    critical_gaps: List[Dict[str, Any]]
    risk_score: float


class ComplianceReport(BaseModel):
    audit_id: str
    framework: str
    generated_at: str
    executive_summary: str
    compliance_score: float
    findings: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ComplianceCheck ML Engine",
        "version": "1.0.0",
        "models_loaded": {
            "policy_analyzer": policy_analyzer.is_loaded,
            "gap_detector": gap_detector.is_loaded,
            "report_engine": report_engine.is_loaded,
        }
    }


# Analyze control
@app.post("/analyze/control", response_model=ComplianceResult)
async def analyze_control(control: ControlInput):
    try:
        logger.info(f"Analyzing control {control.control_id}")
        
        result = policy_analyzer.analyze(control.model_dump())
        gaps = gap_detector.detect_gaps(control.model_dump())
        
        return ComplianceResult(
            control_id=control.control_id,
            status=result["status"],
            score=result["score"],
            gaps=gaps,
            recommendations=result["recommendations"]
        )
    except Exception as e:
        logger.error(f"Error analyzing control: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Analyze audit
@app.post("/analyze/audit", response_model=GapAnalysis)
async def analyze_audit(audit: AuditInput):
    try:
        logger.info(f"Analyzing audit {audit.audit_id}")
        
        result = gap_detector.analyze_audit(audit.model_dump())
        
        return GapAnalysis(
            framework=audit.framework,
            total_controls=result["total_controls"],
            compliant=result["compliant"],
            non_compliant=result["non_compliant"],
            partial=result["partial"],
            compliance_percentage=result["compliance_percentage"],
            critical_gaps=result["critical_gaps"],
            risk_score=result["risk_score"]
        )
    except Exception as e:
        logger.error(f"Error analyzing audit: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Generate report
@app.post("/generate/report", response_model=ComplianceReport)
async def generate_report(audit: AuditInput):
    try:
        logger.info(f"Generating report for {audit.audit_id}")
        
        report = report_engine.generate(audit.model_dump())
        
        return ComplianceReport(
            audit_id=audit.audit_id,
            framework=audit.framework,
            generated_at=report["generated_at"],
            executive_summary=report["executive_summary"],
            compliance_score=report["compliance_score"],
            findings=report["findings"],
            recommendations=report["recommendations"]
        )
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get framework requirements
@app.get("/frameworks/{framework}")
async def get_framework_requirements(framework: str):
    return policy_analyzer.get_framework_requirements(framework)


# Get supported frameworks
@app.get("/frameworks")
async def get_supported_frameworks():
    return {
        "frameworks": list(policy_analyzer.frameworks.keys())
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8009)
