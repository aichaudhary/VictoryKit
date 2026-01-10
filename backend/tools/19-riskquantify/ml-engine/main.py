"""
RiskAssess ML Engine
Port: 8019
Enterprise risk assessment and analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

from models.risk_scorer import RiskScorer
from models.control_analyzer import ControlAnalyzer
from models.assessment_engine import AssessmentEngine

app = FastAPI(
    title="RiskAssess ML Engine",
    version="1.0.0",
    description="ML-powered risk assessment and analysis"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize models
risk_scorer = RiskScorer()
control_analyzer = ControlAnalyzer()
assessment_engine = AssessmentEngine()


class RiskInput(BaseModel):
    name: str
    category: str
    likelihood: Dict[str, Any]
    impact: Dict[str, Any]
    controls: Optional[List[Dict]] = []


class ControlInput(BaseModel):
    name: str
    type: str
    implementation: Dict[str, Any]
    effectiveness: Optional[Dict[str, Any]] = {}


class AssessmentInput(BaseModel):
    name: str
    type: str
    risks: List[Dict[str, Any]]
    controls: Optional[List[Dict]] = []
    methodology: Optional[str] = "qualitative"


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "RiskAssess ML Engine",
        "version": "1.0.0"
    }


@app.post("/score/risk")
async def score_risk(risk: RiskInput):
    """Calculate risk score based on likelihood and impact"""
    try:
        result = risk_scorer.calculate_score(risk.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/score/risks/batch")
async def score_risks_batch(risks: List[RiskInput]):
    """Calculate scores for multiple risks"""
    try:
        results = [risk_scorer.calculate_score(r.dict()) for r in risks]
        return {"risks": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/assessment")
async def analyze_assessment(assessment: AssessmentInput):
    """Perform comprehensive assessment analysis"""
    try:
        result = assessment_engine.analyze(assessment.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/controls")
async def analyze_controls(data: Dict[str, Any]):
    """Analyze control effectiveness"""
    try:
        controls = data.get("controls", [])
        risks = data.get("risks", [])
        result = control_analyzer.analyze(controls, risks)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/residual")
async def predict_residual_risk(data: Dict[str, Any]):
    """Predict residual risk after controls"""
    try:
        risk = data.get("risk", {})
        controls = data.get("controls", [])
        result = risk_scorer.predict_residual(risk, controls)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend/controls")
async def recommend_controls(risk: RiskInput):
    """Recommend controls for a risk"""
    try:
        result = control_analyzer.recommend_controls(risk.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simulate/treatment")
async def simulate_treatment(data: Dict[str, Any]):
    """Simulate treatment scenarios"""
    try:
        risk = data.get("risk", {})
        scenarios = data.get("scenarios", [])
        result = risk_scorer.simulate_treatments(risk, scenarios)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/frameworks/{framework}")
async def get_framework_template(framework: str):
    """Get risk assessment framework template"""
    try:
        result = assessment_engine.get_framework(framework)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calculate/aggregate")
async def calculate_aggregate_risk(data: Dict[str, Any]):
    """Calculate aggregate risk for portfolio"""
    try:
        risks = data.get("risks", [])
        method = data.get("method", "weighted_average")
        result = risk_scorer.aggregate_risks(risks, method)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8019)
