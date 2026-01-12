"""
ZeroDayDetect ML Engine - Main FastAPI Application
Real-time Threat Detection & Behavioral Analysis
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.anomaly_detector import AnomalyDetector
from models.behavior_analyzer import BehaviorAnalyzer
from models.threat_detector import ThreatDetector
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ZeroDayDetect ML Engine",
    description="Machine Learning Engine for Real-time Zero-Day Threat Detection",
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
threat_detector = ThreatDetector()
behavior_analyzer = BehaviorAnalyzer()
anomaly_detector = AnomalyDetector()


# Pydantic models
class NetworkEventInput(BaseModel):
    event_id: str
    source_ip: str
    destination_ip: str
    destination_port: int
    protocol: str  # 'TCP', 'UDP', 'ICMP'
    bytes_sent: int = 0
    bytes_received: int = 0
    packet_count: int = 1
    timestamp: Optional[datetime] = None
    payload_sample: Optional[str] = None  # Base64 encoded


class EndpointEventInput(BaseModel):
    event_id: str
    hostname: str
    process_name: str
    process_path: Optional[str] = None
    parent_process: Optional[str] = None
    command_line: Optional[str] = None
    user: Optional[str] = None
    event_type: str  # 'process_start', 'file_write', 'registry', 'network'
    timestamp: Optional[datetime] = None


class DetectionResult(BaseModel):
    event_id: str
    is_threat: bool
    threat_type: Optional[str] = None
    severity: str  # 'INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    confidence: float = Field(..., ge=0, le=100)
    indicators: List[str]
    recommended_action: str


class BehaviorResult(BaseModel):
    entity_id: str
    entity_type: str  # 'host', 'user', 'ip'
    baseline_deviation: float
    risk_score: float
    anomalous_behaviors: List[Dict[str, Any]]


class AnomalyResult(BaseModel):
    event_id: str
    is_anomaly: bool
    anomaly_score: float
    anomaly_type: str
    baseline_comparison: Dict[str, Any]


class ModelInfo(BaseModel):
    model_version: str
    last_trained: str
    detection_rate: float
    false_positive_rate: float


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ZeroDayDetect ML Engine",
        "version": "1.0.0",
        "models_loaded": {
            "threat_detector": threat_detector.is_loaded,
            "behavior_analyzer": behavior_analyzer.is_loaded,
            "anomaly_detector": anomaly_detector.is_loaded,
        },
    }


# Detect network threats
@app.post("/detect/network", response_model=DetectionResult)
async def detect_network_threat(event: NetworkEventInput):
    try:
        logger.info(f"Analyzing network event {event.event_id}")

        result = threat_detector.detect_network(event.model_dump())

        return DetectionResult(
            event_id=event.event_id,
            is_threat=result["is_threat"],
            threat_type=result.get("threat_type"),
            severity=result["severity"],
            confidence=result["confidence"],
            indicators=result["indicators"],
            recommended_action=result["recommended_action"],
        )
    except Exception as e:
        logger.error(f"Error detecting network threat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Detect endpoint threats
@app.post("/detect/endpoint", response_model=DetectionResult)
async def detect_endpoint_threat(event: EndpointEventInput):
    try:
        logger.info(f"Analyzing endpoint event {event.event_id}")

        result = threat_detector.detect_endpoint(event.model_dump())

        return DetectionResult(
            event_id=event.event_id,
            is_threat=result["is_threat"],
            threat_type=result.get("threat_type"),
            severity=result["severity"],
            confidence=result["confidence"],
            indicators=result["indicators"],
            recommended_action=result["recommended_action"],
        )
    except Exception as e:
        logger.error(f"Error detecting endpoint threat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch detection
@app.post("/detect/batch", response_model=List[DetectionResult])
async def batch_detect(events: List[NetworkEventInput]):
    if len(events) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 events per batch")

    results = []
    for event in events:
        try:
            result = await detect_network_threat(event)
            results.append(result)
        except Exception as e:
            logger.error(f"Error in batch detection for {event.event_id}: {e}")

    return results


# Analyze behavior
@app.post("/analyze/behavior", response_model=BehaviorResult)
async def analyze_behavior(
    entity_id: str, entity_type: str, events: List[NetworkEventInput]
):
    try:
        logger.info(f"Analyzing behavior for {entity_type}:{entity_id}")

        event_data = [e.model_dump() for e in events]
        result = behavior_analyzer.analyze(entity_id, entity_type, event_data)

        return BehaviorResult(
            entity_id=entity_id,
            entity_type=entity_type,
            baseline_deviation=result["baseline_deviation"],
            risk_score=result["risk_score"],
            anomalous_behaviors=result["anomalous_behaviors"],
        )
    except Exception as e:
        logger.error(f"Error analyzing behavior: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Detect anomalies
@app.post("/detect/anomaly", response_model=AnomalyResult)
async def detect_anomaly(event: NetworkEventInput):
    try:
        logger.info(f"Detecting anomaly for event {event.event_id}")

        result = anomaly_detector.detect(event.model_dump())

        return AnomalyResult(
            event_id=event.event_id,
            is_anomaly=result["is_anomaly"],
            anomaly_score=result["anomaly_score"],
            anomaly_type=result["anomaly_type"],
            baseline_comparison=result["baseline_comparison"],
        )
    except Exception as e:
        logger.error(f"Error detecting anomaly: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get model info
@app.get("/model-info", response_model=ModelInfo)
async def get_model_info():
    return ModelInfo(
        model_version=threat_detector.version,
        last_trained=threat_detector.last_trained,
        detection_rate=threat_detector.detection_rate,
        false_positive_rate=threat_detector.false_positive_rate,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
