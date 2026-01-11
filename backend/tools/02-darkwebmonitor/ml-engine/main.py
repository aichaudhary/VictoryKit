"""
DarkWebMonitor ML Engine - Main FastAPI Application
Threat Intelligence Analysis & Correlation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from models.threat_classifier import ThreatClassifier
from models.pattern_detector import PatternDetector
from models.correlation_engine import CorrelationEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="DarkWebMonitor ML Engine",
    description="Machine Learning Engine for Threat Intelligence Analysis",
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
threat_classifier = ThreatClassifier()
pattern_detector = PatternDetector()
correlation_engine = CorrelationEngine()


# Pydantic models
class IOCInput(BaseModel):
    ioc_type: str  # 'ip', 'domain', 'hash', 'url', 'email'
    value: str
    context: Optional[str] = None
    source: Optional[str] = None


class ThreatInput(BaseModel):
    threat_id: str
    name: str
    description: Optional[str] = None
    iocs: List[IOCInput]
    ttps: Optional[List[Dict[str, str]]] = None
    source: Optional[str] = None


class ClassificationResult(BaseModel):
    threat_id: str
    threat_type: str  # 'malware', 'apt', 'campaign', 'vulnerability'
    severity: str  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    confidence: float = Field(..., ge=0, le=100)
    tags: List[str]
    mitre_techniques: List[str]


class CorrelationResult(BaseModel):
    threat_id: str
    related_threats: List[Dict[str, Any]]
    common_iocs: List[str]
    confidence: float


class PatternResult(BaseModel):
    pattern_id: str
    pattern_type: str
    description: str
    affected_iocs: List[str]
    risk_score: float


class ModelInfo(BaseModel):
    model_version: str
    last_trained: str
    accuracy: float
    capabilities: List[str]


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "DarkWebMonitor ML Engine",
        "version": "1.0.0",
        "models_loaded": {
            "threat_classifier": threat_classifier.is_loaded,
            "pattern_detector": pattern_detector.is_loaded,
            "correlation_engine": correlation_engine.is_loaded,
        }
    }


# Classify threat
@app.post("/classify", response_model=ClassificationResult)
async def classify_threat(threat: ThreatInput):
    try:
        logger.info(f"Classifying threat {threat.threat_id}")
        
        result = threat_classifier.classify(threat.model_dump())
        
        return ClassificationResult(
            threat_id=threat.threat_id,
            threat_type=result["threat_type"],
            severity=result["severity"],
            confidence=result["confidence"],
            tags=result["tags"],
            mitre_techniques=result["mitre_techniques"]
        )
    except Exception as e:
        logger.error(f"Error classifying threat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch classify
@app.post("/batch-classify", response_model=List[ClassificationResult])
async def batch_classify(threats: List[ThreatInput]):
    if len(threats) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 threats per batch")
    
    results = []
    for threat in threats:
        try:
            result = await classify_threat(threat)
            results.append(result)
        except Exception as e:
            logger.error(f"Error classifying threat {threat.threat_id}: {e}")
    
    return results


# Correlate threats
@app.post("/correlate", response_model=CorrelationResult)
async def correlate_threats(threat: ThreatInput):
    try:
        logger.info(f"Correlating threat {threat.threat_id}")
        
        result = correlation_engine.correlate(threat.model_dump())
        
        return CorrelationResult(
            threat_id=threat.threat_id,
            related_threats=result["related_threats"],
            common_iocs=result["common_iocs"],
            confidence=result["confidence"]
        )
    except Exception as e:
        logger.error(f"Error correlating threat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Detect patterns
@app.post("/detect-patterns", response_model=List[PatternResult])
async def detect_patterns(iocs: List[IOCInput]):
    try:
        logger.info(f"Detecting patterns in {len(iocs)} IOCs")
        
        ioc_data = [ioc.model_dump() for ioc in iocs]
        patterns = pattern_detector.detect(ioc_data)
        
        return [PatternResult(**p) for p in patterns]
    except Exception as e:
        logger.error(f"Error detecting patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Enrich IOC
@app.post("/enrich-ioc")
async def enrich_ioc(ioc: IOCInput):
    try:
        logger.info(f"Enriching IOC: {ioc.ioc_type}:{ioc.value}")
        
        enrichment = threat_classifier.enrich_ioc(ioc.model_dump())
        
        return {
            "ioc": ioc.model_dump(),
            "enrichment": enrichment,
            "risk_score": enrichment.get("risk_score", 0),
            "last_seen": enrichment.get("last_seen"),
            "sources": enrichment.get("sources", [])
        }
    except Exception as e:
        logger.error(f"Error enriching IOC: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get model info
@app.get("/model-info", response_model=ModelInfo)
async def get_model_info():
    return ModelInfo(
        model_version=threat_classifier.version,
        last_trained=threat_classifier.last_trained,
        accuracy=threat_classifier.accuracy,
        capabilities=[
            "threat_classification",
            "ioc_correlation",
            "pattern_detection",
            "mitre_mapping",
            "ioc_enrichment"
        ]
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
