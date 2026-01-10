"""
MalwareHunter ML Engine - Main FastAPI Application
Malware Analysis & Classification
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import base64

from models.malware_classifier import MalwareClassifier
from models.static_analyzer import StaticAnalyzer
from models.behavior_predictor import BehaviorPredictor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MalwareHunter ML Engine",
    description="Machine Learning Engine for Malware Analysis",
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
malware_classifier = MalwareClassifier()
static_analyzer = StaticAnalyzer()
behavior_predictor = BehaviorPredictor()


# Pydantic models
class SampleInput(BaseModel):
    sample_id: str
    file_hash: str  # SHA256
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    content_base64: Optional[str] = None  # Base64 encoded file content


class ClassificationResult(BaseModel):
    sample_id: str
    is_malicious: bool
    malware_family: Optional[str] = None
    malware_type: str  # 'trojan', 'ransomware', 'worm', 'backdoor', 'clean'
    confidence: float = Field(..., ge=0, le=100)
    threat_level: str  # 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAN'


class StaticAnalysisResult(BaseModel):
    sample_id: str
    file_hash: str
    file_type: str
    file_size: int
    entropy: float
    imports: List[str]
    suspicious_strings: List[str]
    packed: bool
    signed: bool
    risk_indicators: List[Dict[str, Any]]


class BehaviorPrediction(BaseModel):
    sample_id: str
    predicted_behaviors: List[Dict[str, Any]]
    network_activity: Dict[str, Any]
    file_activity: Dict[str, Any]
    registry_activity: Dict[str, Any]
    overall_risk: float


class ModelInfo(BaseModel):
    model_version: str
    last_trained: str
    accuracy: float
    malware_families: int


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "MalwareHunter ML Engine",
        "version": "1.0.0",
        "models_loaded": {
            "malware_classifier": malware_classifier.is_loaded,
            "static_analyzer": static_analyzer.is_loaded,
            "behavior_predictor": behavior_predictor.is_loaded,
        }
    }


# Classify sample
@app.post("/classify", response_model=ClassificationResult)
async def classify_sample(sample: SampleInput):
    try:
        logger.info(f"Classifying sample {sample.sample_id}")
        
        result = malware_classifier.classify(sample.model_dump())
        
        return ClassificationResult(
            sample_id=sample.sample_id,
            is_malicious=result["is_malicious"],
            malware_family=result.get("malware_family"),
            malware_type=result["malware_type"],
            confidence=result["confidence"],
            threat_level=result["threat_level"]
        )
    except Exception as e:
        logger.error(f"Error classifying sample: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch classify
@app.post("/batch-classify", response_model=List[ClassificationResult])
async def batch_classify(samples: List[SampleInput]):
    if len(samples) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 samples per batch")
    
    results = []
    for sample in samples:
        try:
            result = await classify_sample(sample)
            results.append(result)
        except Exception as e:
            logger.error(f"Error classifying sample {sample.sample_id}: {e}")
    
    return results


# Static analysis
@app.post("/analyze/static", response_model=StaticAnalysisResult)
async def analyze_static(sample: SampleInput):
    try:
        logger.info(f"Static analysis for sample {sample.sample_id}")
        
        result = static_analyzer.analyze(sample.model_dump())
        
        return StaticAnalysisResult(
            sample_id=sample.sample_id,
            file_hash=sample.file_hash,
            file_type=result["file_type"],
            file_size=result["file_size"],
            entropy=result["entropy"],
            imports=result["imports"],
            suspicious_strings=result["suspicious_strings"],
            packed=result["packed"],
            signed=result["signed"],
            risk_indicators=result["risk_indicators"]
        )
    except Exception as e:
        logger.error(f"Error in static analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Predict behavior
@app.post("/predict/behavior", response_model=BehaviorPrediction)
async def predict_behavior(sample: SampleInput):
    try:
        logger.info(f"Behavior prediction for sample {sample.sample_id}")
        
        result = behavior_predictor.predict(sample.model_dump())
        
        return BehaviorPrediction(
            sample_id=sample.sample_id,
            predicted_behaviors=result["predicted_behaviors"],
            network_activity=result["network_activity"],
            file_activity=result["file_activity"],
            registry_activity=result["registry_activity"],
            overall_risk=result["overall_risk"]
        )
    except Exception as e:
        logger.error(f"Error predicting behavior: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Hash lookup
@app.get("/lookup/{file_hash}")
async def lookup_hash(file_hash: str):
    try:
        result = malware_classifier.lookup(file_hash)
        return result
    except Exception as e:
        logger.error(f"Error looking up hash: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get model info
@app.get("/model-info", response_model=ModelInfo)
async def get_model_info():
    return ModelInfo(
        model_version=malware_classifier.version,
        last_trained=malware_classifier.last_trained,
        accuracy=malware_classifier.accuracy,
        malware_families=len(malware_classifier.known_families)
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
