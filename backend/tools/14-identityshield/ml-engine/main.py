"""
IdentityShield ML Engine - Main FastAPI Application
Identity and Access Management Security AI
Port: 8014
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from models.identity_analyzer import IdentityAnalyzer
from models.privilege_analyzer import PrivilegeAnalyzer
from models.anomaly_detector import AnomalyDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="IdentityShield ML Engine",
    description="AI-Powered Identity and Access Management Security",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

identity_analyzer = IdentityAnalyzer()
privilege_analyzer = PrivilegeAnalyzer()
anomaly_detector = AnomalyDetector()


class IdentityInput(BaseModel):
    identityId: str
    type: str = "user"
    provider: str = "aws"
    roles: List[Dict[str, Any]] = []
    permissions: List[Dict[str, Any]] = []
    authentication: Dict[str, Any] = {}


class RoleInput(BaseModel):
    roleId: str
    name: str
    type: str = "custom"
    permissions: List[Dict[str, Any]] = []
    trustPolicy: Dict[str, Any] = {}
    assumableBy: List[Dict[str, Any]] = []


class PermissionsInput(BaseModel):
    permissions: List[Dict[str, Any]]


class PolicyInput(BaseModel):
    policyId: str
    name: str
    type: str = "customer_managed"
    document: Dict[str, Any] = {}


class ActivityInput(BaseModel):
    identityId: str
    activities: List[Dict[str, Any]]


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "IdentityShield ML Engine",
        "version": "1.0.0",
        "models": {
            "identity_analyzer": identity_analyzer.is_loaded,
            "privilege_analyzer": privilege_analyzer.is_loaded,
            "anomaly_detector": anomaly_detector.is_loaded
        }
    }


@app.post("/analyze/identity")
async def analyze_identity(identity: IdentityInput):
    try:
        result = identity_analyzer.analyze(identity.model_dump())
        return result
    except Exception as e:
        logger.error(f"Identity analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/role")
async def analyze_role(role: RoleInput):
    try:
        result = privilege_analyzer.analyze_role(role.model_dump())
        return result
    except Exception as e:
        logger.error(f"Role analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/permissions")
async def analyze_permissions(data: PermissionsInput):
    try:
        result = privilege_analyzer.analyze_permissions(data.permissions)
        return result
    except Exception as e:
        logger.error(f"Permission analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/evaluate/policy")
async def evaluate_policy(policy: PolicyInput):
    try:
        result = privilege_analyzer.evaluate_policy(policy.model_dump())
        return result
    except Exception as e:
        logger.error(f"Policy evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/anomaly")
async def detect_anomaly(activity: ActivityInput):
    try:
        result = anomaly_detector.detect(activity.model_dump())
        return result
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/{identity_id}")
async def get_recommendations(identity_id: str):
    try:
        result = identity_analyzer.get_recommendations(identity_id)
        return result
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8014)
