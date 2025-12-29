"""
NetworkGuard ML Engine - Main FastAPI Application
Network Security Monitoring & Anomaly Detection
Port: 8012
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from models.traffic_analyzer import TrafficAnalyzer
from models.anomaly_detector import AnomalyDetector
from models.threat_classifier import ThreatClassifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NetworkGuard ML Engine",
    description="AI-Powered Network Security Monitoring",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
traffic_analyzer = TrafficAnalyzer()
anomaly_detector = AnomalyDetector()
threat_classifier = ThreatClassifier()


class FlowInput(BaseModel):
    sourceIp: str
    sourcePort: int
    destinationIp: str
    destinationPort: int
    protocol: str = "TCP"
    bytes: int = 0
    packets: int = 0
    duration: float = 0


class AlertInput(BaseModel):
    severity: str
    category: str
    title: str
    description: Optional[str] = ""
    source: Optional[Dict[str, Any]] = {}
    destination: Optional[Dict[str, Any]] = {}
    protocol: Optional[str] = "OTHER"
    payload: Optional[Dict[str, Any]] = {}


class PacketInput(BaseModel):
    data: str
    protocol: str
    length: int


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "NetworkGuard ML Engine",
        "version": "1.0.0",
        "models": {
            "traffic_analyzer": traffic_analyzer.is_loaded,
            "anomaly_detector": anomaly_detector.is_loaded,
            "threat_classifier": threat_classifier.is_loaded
        }
    }


@app.post("/analyze/flow")
async def analyze_flow(flow: FlowInput):
    try:
        analysis = traffic_analyzer.analyze(flow.model_dump())
        anomaly = anomaly_detector.detect(flow.model_dump())
        
        return {
            **analysis,
            **anomaly
        }
    except Exception as e:
        logger.error(f"Flow analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/alert")
async def analyze_alert(alert: AlertInput):
    try:
        classification = threat_classifier.classify(alert.model_dump())
        return classification
    except Exception as e:
        logger.error(f"Alert analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/anomaly")
async def detect_anomaly(flows: List[FlowInput]):
    try:
        results = []
        for flow in flows:
            anomaly = anomaly_detector.detect(flow.model_dump())
            results.append({
                "flow": f"{flow.sourceIp}:{flow.sourcePort} -> {flow.destinationIp}:{flow.destinationPort}",
                **anomaly
            })
        return {"results": results}
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/packet")
async def analyze_packet(packet: PacketInput):
    try:
        analysis = traffic_analyzer.analyze_packet(packet.model_dump())
        return analysis
    except Exception as e:
        logger.error(f"Packet analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/signatures")
async def get_signatures():
    return threat_classifier.get_signatures()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8012)
