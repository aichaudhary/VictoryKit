"""
CloudArmor ML Engine - Main FastAPI Application
Cloud Security Posture Management AI
Port: 8013
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from models.posture_analyzer import PostureAnalyzer
from models.misconfiguration_detector import MisconfigurationDetector
from models.remediation_engine import RemediationEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CloudArmor ML Engine",
    description="AI-Powered Cloud Security Posture Management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

posture_analyzer = PostureAnalyzer()
misconfig_detector = MisconfigurationDetector()
remediation_engine = RemediationEngine()


class ResourceInput(BaseModel):
    resourceId: str
    type: str
    provider: str = "aws"
    configuration: Dict[str, Any] = {}
    tags: Dict[str, Any] = {}


class FindingInput(BaseModel):
    type: str
    title: str
    description: Optional[str] = ""
    severity: str
    category: str
    resource: Optional[Dict[str, Any]] = {}


class PolicyInput(BaseModel):
    name: str
    conditions: List[Dict[str, Any]] = []
    resourceConfiguration: Dict[str, Any] = {}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CloudArmor ML Engine",
        "version": "1.0.0",
        "models": {
            "posture_analyzer": posture_analyzer.is_loaded,
            "misconfiguration_detector": misconfig_detector.is_loaded,
            "remediation_engine": remediation_engine.is_loaded
        }
    }


@app.post("/analyze/resource")
async def analyze_resource(resource: ResourceInput):
    try:
        misconfigs = misconfig_detector.detect(resource.model_dump())
        posture = posture_analyzer.analyze(resource.model_dump(), misconfigs)
        
        return {
            "resourceId": resource.resourceId,
            "misconfigurations": misconfigs,
            "postureScore": posture["score"],
            "riskLevel": posture["risk_level"],
            "recommendations": posture["recommendations"]
        }
    except Exception as e:
        logger.error(f"Resource analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/finding")
async def analyze_finding(finding: FindingInput):
    try:
        analysis = posture_analyzer.analyze_finding(finding.model_dump())
        remediation = remediation_engine.get_remediation(finding.model_dump())
        
        return {
            **analysis,
            "remediation": remediation
        }
    except Exception as e:
        logger.error(f"Finding analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/misconfigurations")
async def detect_misconfigurations(resources: List[ResourceInput]):
    try:
        results = []
        for resource in resources:
            misconfigs = misconfig_detector.detect(resource.model_dump())
            results.append({
                "resourceId": resource.resourceId,
                "type": resource.type,
                "misconfigurations": misconfigs
            })
        return {"results": results}
    except Exception as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/evaluate/policy")
async def evaluate_policy(policy: PolicyInput):
    try:
        evaluation = misconfig_detector.evaluate_policy(policy.model_dump())
        return evaluation
    except Exception as e:
        logger.error(f"Policy evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/remediate")
async def get_remediation(finding: FindingInput):
    try:
        remediation = remediation_engine.get_remediation(finding.model_dump())
        return remediation
    except Exception as e:
        logger.error(f"Remediation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/benchmarks")
async def get_benchmarks():
    return misconfig_detector.get_benchmarks()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8013)
