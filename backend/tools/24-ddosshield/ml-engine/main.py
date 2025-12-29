"""
DDoSShield ML Engine
Port: 8024
DDoS detection, traffic analysis, and attack classification
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn

from models.attack_detector import AttackDetector
from models.traffic_analyzer import TrafficAnalyzer
from models.pattern_learner import PatternLearner

app = FastAPI(
    title="DDoSShield ML Engine",
    description="ML-powered DDoS detection and traffic analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
attack_detector = AttackDetector()
traffic_analyzer = TrafficAnalyzer()
pattern_learner = PatternLearner()


class TrafficMetrics(BaseModel):
    bandwidth: Optional[Dict[str, Any]] = None
    packets: Optional[Dict[str, Any]] = None
    requests: Optional[Dict[str, Any]] = None
    connections: Optional[Dict[str, Any]] = None
    latency: Optional[Dict[str, Any]] = None


class TrafficData(BaseModel):
    metrics: Optional[TrafficMetrics] = None
    source: Optional[Dict[str, Any]] = None
    breakdown: Optional[Dict[str, Any]] = None
    target: Optional[Dict[str, Any]] = None


class PatternData(BaseModel):
    traffic_samples: List[Dict[str, Any]]
    label: Optional[str] = None


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "DDoSShield ML Engine",
        "version": "1.0.0"
    }


@app.post("/detect")
async def detect_attack(data: TrafficData):
    """Detect DDoS attack from traffic data"""
    try:
        result = attack_detector.detect(data.dict())
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/traffic")
async def analyze_traffic(data: TrafficData):
    """Analyze traffic patterns and anomalies"""
    try:
        result = traffic_analyzer.analyze(data.dict())
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify")
async def classify_attack(data: TrafficData):
    """Classify attack type from traffic characteristics"""
    try:
        result = attack_detector.classify(data.dict())
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/source")
async def analyze_source(data: TrafficData):
    """Analyze attack source distribution"""
    try:
        result = traffic_analyzer.analyze_source(data.dict())
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/escalation")
async def predict_escalation(data: TrafficData):
    """Predict if attack will escalate"""
    try:
        result = pattern_learner.predict_escalation(data.dict())
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/learn/pattern")
async def learn_pattern(data: PatternData):
    """Learn from traffic patterns"""
    try:
        result = pattern_learner.learn(data.traffic_samples, data.label)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/signatures")
async def get_signatures():
    """Get known attack signatures"""
    return {
        "success": True,
        "data": attack_detector.get_signatures()
    }


@app.post("/recommend/mitigation")
async def recommend_mitigation(data: TrafficData):
    """Recommend mitigation strategy"""
    try:
        detection = attack_detector.detect(data.dict())
        recommendations = attack_detector.recommend_mitigation(detection)
        return {
            "success": True,
            "data": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8024)
