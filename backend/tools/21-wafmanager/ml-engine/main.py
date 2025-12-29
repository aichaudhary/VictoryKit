"""
WAFManager ML Engine
Port: 8021
Rule Optimization, False Positive Detection, Attack Pattern Learning
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

from models.rule_optimizer import RuleOptimizer
from models.false_positive_detector import FalsePositiveDetector
from models.attack_pattern_learner import AttackPatternLearner

app = FastAPI(
    title="WAFManager ML Engine",
    version="1.0.0",
    description="ML-powered WAF rule optimization and attack detection"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rule_optimizer = RuleOptimizer()
fp_detector = FalsePositiveDetector()
pattern_learner = AttackPatternLearner()


class RuleData(BaseModel):
    id: str
    name: str
    type: str
    category: str
    conditions: List[Dict[str, Any]] = []
    statistics: Dict[str, Any] = {}


class OptimizeRequest(BaseModel):
    rules: List[RuleData]


class EventData(BaseModel):
    event_id: str
    request: Dict[str, Any]
    matched_rules: List[Dict[str, Any]] = []
    action: str
    category: Optional[str] = None
    risk_score: Optional[float] = None


class AnalyzeRequest(BaseModel):
    events: List[EventData]


class PatternRequest(BaseModel):
    requests: List[Dict[str, Any]]
    window_minutes: int = 60


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "WAFManager ML Engine",
        "version": "1.0.0"
    }


@app.post("/optimize")
async def optimize_rules(request: OptimizeRequest):
    """Optimize WAF rules for performance and accuracy"""
    try:
        result = rule_optimizer.optimize(request.rules)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/false-positives")
async def analyze_false_positives(request: AnalyzeRequest):
    """Analyze events for potential false positives"""
    try:
        result = fp_detector.analyze(request.events)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/patterns")
async def detect_attack_patterns(request: PatternRequest):
    """Detect attack patterns from request data"""
    try:
        result = pattern_learner.detect_patterns(request.requests, request.window_minutes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/rule")
async def generate_rule(request: PatternRequest):
    """Generate WAF rule from detected pattern"""
    try:
        patterns = pattern_learner.detect_patterns(request.requests, request.window_minutes)
        if patterns.get("patterns"):
            rule = pattern_learner.generate_rule(patterns["patterns"][0])
            return rule
        return {"message": "No patterns detected to generate rule"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/score/request")
async def score_request(request: Dict[str, Any]):
    """Score a request for attack likelihood"""
    try:
        score = pattern_learner.score_request(request)
        return score
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/categories")
async def get_categories():
    """Get supported attack categories"""
    return {
        "categories": [
            {"id": "sqli", "name": "SQL Injection", "severity": "critical"},
            {"id": "xss", "name": "Cross-Site Scripting", "severity": "high"},
            {"id": "rce", "name": "Remote Code Execution", "severity": "critical"},
            {"id": "lfi", "name": "Local File Inclusion", "severity": "high"},
            {"id": "rfi", "name": "Remote File Inclusion", "severity": "critical"},
            {"id": "ssrf", "name": "Server-Side Request Forgery", "severity": "high"},
            {"id": "xxe", "name": "XML External Entity", "severity": "high"},
            {"id": "bot", "name": "Bot Activity", "severity": "medium"},
            {"id": "rate", "name": "Rate Limit Exceeded", "severity": "medium"},
            {"id": "geo", "name": "Geo-blocked", "severity": "low"}
        ]
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8021)
