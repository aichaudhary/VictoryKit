"""
BotDefender ML Engine
Port: 8023
Bot Detection and Behavioral Analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

from models.bot_detector import BotDetector
from models.behavior_analyzer import BehaviorAnalyzer
from models.fingerprint_analyzer import FingerprintAnalyzer

app = FastAPI(
    title="BotDefender ML Engine",
    version="1.0.0",
    description="ML-powered bot detection and behavioral analysis"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bot_detector = BotDetector()
behavior_analyzer = BehaviorAnalyzer()
fingerprint_analyzer = FingerprintAnalyzer()


class DetectionRequest(BaseModel):
    userAgent: Optional[str] = None
    ip: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    fingerprint: Optional[Dict[str, Any]] = None
    behavior: Optional[Dict[str, Any]] = None


class BehaviorData(BaseModel):
    mouse_movements: List[Dict[str, Any]] = []
    key_presses: List[Dict[str, Any]] = []
    scroll_events: List[Dict[str, Any]] = []
    click_events: List[Dict[str, Any]] = []
    session_duration: int = 0


class FingerprintData(BaseModel):
    components: Dict[str, Any]


class TrainingData(BaseModel):
    samples: List[Dict[str, Any]]
    labels: List[int]


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "BotDefender ML Engine",
        "version": "1.0.0"
    }


@app.post("/detect")
async def detect_bot(request: DetectionRequest):
    """Detect if request is from a bot"""
    try:
        result = bot_detector.detect(
            user_agent=request.userAgent,
            ip=request.ip,
            headers=request.headers,
            fingerprint=request.fingerprint,
            behavior=request.behavior
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/behavior")
async def analyze_behavior(data: BehaviorData):
    """Analyze user behavior patterns"""
    try:
        result = behavior_analyzer.analyze(
            mouse_movements=data.mouse_movements,
            key_presses=data.key_presses,
            scroll_events=data.scroll_events,
            click_events=data.click_events,
            session_duration=data.session_duration
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/fingerprint")
async def analyze_fingerprint(data: FingerprintData):
    """Analyze browser fingerprint"""
    try:
        result = fingerprint_analyzer.analyze(data.components)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify")
async def classify_bot(request: DetectionRequest):
    """Classify bot type and category"""
    try:
        detection = bot_detector.detect(
            user_agent=request.userAgent,
            ip=request.ip,
            headers=request.headers,
            fingerprint=request.fingerprint,
            behavior=request.behavior
        )
        
        classification = bot_detector.classify(detection)
        return classification
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/signatures")
async def get_bot_signatures():
    """Get known bot signatures"""
    return {
        "signatures": bot_detector.get_signatures(),
        "total": len(bot_detector.get_signatures())
    }


@app.post("/train")
async def train_model(data: TrainingData):
    """Train bot detection model with new data"""
    try:
        result = bot_detector.train(data.samples, data.labels)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8023)
