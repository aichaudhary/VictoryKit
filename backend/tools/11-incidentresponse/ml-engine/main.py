"""
IncidentResponse ML Engine - Main FastAPI Application
AI-Powered Security Incident Analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from models.incident_classifier import IncidentClassifier
from models.threat_analyzer import ThreatAnalyzer
from models.recommendation_engine import RecommendationEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="IncidentResponse ML Engine",
    description="AI-Powered Security Incident Analysis Engine",
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
incident_classifier = IncidentClassifier()
threat_analyzer = ThreatAnalyzer()
recommendation_engine = RecommendationEngine()


# Pydantic models
class IndicatorInput(BaseModel):
    type: str
    value: str
    malicious: Optional[bool] = None


class IncidentInput(BaseModel):
    title: str
    description: Optional[str] = ""
    indicators: Optional[List[IndicatorInput]] = []
    affectedAssets: Optional[List[Dict[str, Any]]] = []
    timeline: Optional[List[Dict[str, Any]]] = []


class EvidenceInput(BaseModel):
    type: str
    name: str
    description: Optional[str] = ""
    source: Optional[Dict[str, Any]] = {}
    storage: Optional[Dict[str, Any]] = {}


class ClassificationResult(BaseModel):
    type: str
    category: str
    techniques: List[str]
    confidence: float


class AnalysisResult(BaseModel):
    classification: ClassificationResult
    threat_level: str
    recommendations: List[str]
    suggested_playbooks: List[str]


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "IncidentResponse ML Engine",
        "version": "1.0.0",
        "models_loaded": {
            "incident_classifier": incident_classifier.is_loaded,
            "threat_analyzer": threat_analyzer.is_loaded,
            "recommendation_engine": recommendation_engine.is_loaded,
        }
    }


# Classify incident
@app.post("/classify/incident", response_model=AnalysisResult)
async def classify_incident(incident: IncidentInput):
    try:
        logger.info(f"Classifying incident: {incident.title}")
        
        # Get classification
        classification = incident_classifier.classify(incident.model_dump())
        
        # Analyze threat
        threat_analysis = threat_analyzer.analyze(incident.model_dump(), classification)
        
        # Get recommendations
        recommendations = recommendation_engine.get_recommendations(classification)
        playbooks = recommendation_engine.get_playbooks(classification["type"])
        
        return AnalysisResult(
            classification=ClassificationResult(
                type=classification["type"],
                category=classification["category"],
                techniques=classification["techniques"],
                confidence=classification["confidence"]
            ),
            threat_level=threat_analysis["threat_level"],
            recommendations=recommendations,
            suggested_playbooks=playbooks
        )
    except Exception as e:
        logger.error(f"Error classifying incident: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Analyze threat indicators
@app.post("/analyze/indicators")
async def analyze_indicators(indicators: List[IndicatorInput]):
    try:
        results = threat_analyzer.analyze_indicators([i.model_dump() for i in indicators])
        return {"indicators": results}
    except Exception as e:
        logger.error(f"Error analyzing indicators: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Analyze evidence
@app.post("/analyze/evidence")
async def analyze_evidence(evidence: EvidenceInput):
    try:
        logger.info(f"Analyzing evidence: {evidence.name}")
        
        analysis = threat_analyzer.analyze_evidence(evidence.model_dump())
        
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing evidence: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get MITRE techniques
@app.get("/mitre/techniques/{technique_id}")
async def get_technique(technique_id: str):
    return incident_classifier.get_technique_info(technique_id)


# Get playbook templates
@app.get("/playbooks/templates")
async def get_playbook_templates():
    return recommendation_engine.get_playbook_templates()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8011)
