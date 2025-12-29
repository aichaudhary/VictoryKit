"""
ThreatModel ML Engine
Port: 8018
Threat modeling analysis with STRIDE/PASTA frameworks
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime
import uvicorn

from models.stride_analyzer import StrideAnalyzer
from models.pasta_analyzer import PastaAnalyzer
from models.threat_classifier import ThreatClassifier

app = FastAPI(
    title="ThreatModel ML Engine",
    description="ML-powered threat modeling and analysis",
    version="1.0.0"
)

# Initialize models
stride_analyzer = StrideAnalyzer()
pasta_analyzer = PastaAnalyzer()
threat_classifier = ThreatClassifier()


class ComponentData(BaseModel):
    name: str
    type: str
    trustLevel: Optional[str] = "partially_trusted"
    exposedInterfaces: Optional[List[Dict]] = []
    dataHandled: Optional[List[Dict]] = []


class ThreatModelData(BaseModel):
    name: str
    components: List[Dict]
    dataFlows: Optional[List[Dict]] = []
    trustBoundaries: Optional[List[Dict]] = []


class ThreatData(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    affectedComponents: Optional[List[str]] = []


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ThreatModel ML Engine",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/analyze/stride")
async def analyze_stride(model: ThreatModelData):
    """Perform STRIDE analysis on a threat model"""
    try:
        analysis = stride_analyzer.analyze(model.dict())
        return {
            "strideAnalysis": analysis,
            "analyzedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/pasta")
async def analyze_pasta(model: ThreatModelData):
    """Perform PASTA analysis on a threat model"""
    try:
        analysis = pasta_analyzer.analyze(model.dict())
        return {
            "pastaAnalysis": analysis,
            "analyzedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/component")
async def analyze_component(component: ComponentData):
    """Analyze threats for a specific component"""
    try:
        threats = stride_analyzer.analyze_component(component.dict())
        return {
            "component": component.name,
            "threats": threats,
            "analyzedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify/threat")
async def classify_threat(threat: ThreatData):
    """Classify a threat using STRIDE categories"""
    try:
        classification = threat_classifier.classify(threat.dict())
        return {
            "threat": threat.name,
            "classification": classification,
            "classifiedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/attack-surface")
async def analyze_attack_surface(model: ThreatModelData):
    """Analyze attack surface of a threat model"""
    try:
        surface = stride_analyzer.analyze_attack_surface(model.dict())
        return {
            "attackSurface": surface,
            "analyzedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/mitigations")
async def generate_mitigations(threat: ThreatData):
    """Generate mitigation recommendations for a threat"""
    try:
        mitigations = threat_classifier.generate_mitigations(threat.dict())
        return {
            "threat": threat.name,
            "mitigations": mitigations,
            "generatedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/templates/{framework}")
async def get_threat_templates(framework: str):
    """Get threat templates for a framework"""
    templates = {
        "stride": stride_analyzer.get_threat_templates(),
        "pasta": pasta_analyzer.get_stage_templates(),
        "owasp_top10": threat_classifier.get_owasp_templates()
    }
    
    if framework.lower() not in templates:
        raise HTTPException(status_code=404, detail=f"Framework '{framework}' not found")
    
    return {
        "framework": framework,
        "templates": templates[framework.lower()]
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8018)
