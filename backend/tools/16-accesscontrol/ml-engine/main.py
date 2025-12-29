"""
AccessControl ML Engine
Port: 8016
Policy analysis and optimization using ML
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime
import uvicorn

from models.policy_analyzer import PolicyAnalyzer
from models.conflict_detector import ConflictDetector
from models.recommendation_engine import RecommendationEngine

app = FastAPI(
    title="AccessControl ML Engine",
    description="ML-powered access control analysis and optimization",
    version="1.0.0"
)

# Initialize models
policy_analyzer = PolicyAnalyzer()
conflict_detector = ConflictDetector()
recommendation_engine = RecommendationEngine()


class Policy(BaseModel):
    policyId: str
    name: str
    type: str = "rbac"
    effect: str = "allow"
    subjects: Optional[Dict] = None
    resources: Optional[Dict] = None
    actions: List[str] = []
    conditions: Optional[List[Dict]] = None
    context: Optional[Dict] = None


class PolicySet(BaseModel):
    policies: List[Dict]


class AccessRequest(BaseModel):
    subject: Dict
    resource: Dict
    action: str
    context: Optional[Dict] = None


class OptimizationRequest(BaseModel):
    policies: List[Dict]
    objectives: Optional[List[str]] = None


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AccessControl ML Engine",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/analyze/policy")
async def analyze_policy(policy: Policy):
    """Analyze a single policy for issues and recommendations"""
    try:
        analysis = policy_analyzer.analyze(policy.dict())
        return {
            "policyId": policy.policyId,
            "analysis": analysis,
            "analyzedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/conflicts")
async def detect_conflicts(policy_set: PolicySet):
    """Detect conflicts between policies"""
    try:
        conflicts = conflict_detector.detect(policy_set.policies)
        return {
            "totalPolicies": len(policy_set.policies),
            "conflicts": conflicts,
            "conflictCount": len(conflicts),
            "analyzedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/optimize/policies")
async def optimize_policies(request: OptimizationRequest):
    """Optimize policy set for performance and security"""
    try:
        optimized = recommendation_engine.optimize(
            request.policies,
            request.objectives or ["security", "performance"]
        )
        return {
            "originalCount": len(request.policies),
            "optimizedCount": len(optimized["policies"]),
            "recommendations": optimized["recommendations"],
            "improvements": optimized["improvements"],
            "optimizedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend/access")
async def recommend_access(request: AccessRequest):
    """Recommend access level based on context"""
    try:
        recommendation = recommendation_engine.recommend_access(
            request.subject,
            request.resource,
            request.action,
            request.context or {}
        )
        return {
            "recommendation": recommendation,
            "generatedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/risk")
async def analyze_access_risk(request: AccessRequest):
    """Analyze risk level of an access request"""
    try:
        risk = policy_analyzer.analyze_access_risk(
            request.subject,
            request.resource,
            request.action,
            request.context or {}
        )
        return {
            "riskAssessment": risk,
            "analyzedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/best-practices")
async def get_best_practices():
    """Get RBAC/ABAC best practices"""
    return {
        "bestPractices": [
            {
                "category": "Least Privilege",
                "recommendations": [
                    "Grant only minimum required permissions",
                    "Avoid using wildcard (*) actions",
                    "Review and revoke unused access regularly"
                ]
            },
            {
                "category": "Role Design",
                "recommendations": [
                    "Create roles based on job functions",
                    "Limit role inheritance depth to 3 levels",
                    "Avoid overlapping permissions across roles"
                ]
            },
            {
                "category": "Policy Structure",
                "recommendations": [
                    "Use deny policies sparingly",
                    "Add conditions to limit policy scope",
                    "Implement time-based access restrictions"
                ]
            },
            {
                "category": "Monitoring",
                "recommendations": [
                    "Log all access decisions",
                    "Alert on privilege escalation attempts",
                    "Regular access reviews and certifications"
                ]
            }
        ]
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8016)
