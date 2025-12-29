"""
AuditTrail ML Engine
Port: 8017
Log analysis, anomaly detection, and pattern recognition
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime
import uvicorn

from models.log_analyzer import LogAnalyzer
from models.anomaly_detector import AnomalyDetector
from models.pattern_recognizer import PatternRecognizer

app = FastAPI(
    title="AuditTrail ML Engine",
    description="ML-powered audit log analysis and anomaly detection",
    version="1.0.0"
)

# Initialize models
log_analyzer = LogAnalyzer()
anomaly_detector = AnomalyDetector()
pattern_recognizer = PatternRecognizer()


class LogEntry(BaseModel):
    logId: str
    timestamp: str
    eventType: str
    action: str
    status: str = "success"
    actor: Optional[Dict] = None
    resource: Optional[Dict] = None
    details: Optional[Dict] = None


class LogBatch(BaseModel):
    logs: List[Dict]
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    eventTypes: Optional[List[str]] = None


class AnomalyRequest(BaseModel):
    logs: List[Dict]
    baseline: Optional[Dict] = None
    sensitivity: float = 0.7


class PatternRequest(BaseModel):
    logs: List[Dict]
    patternTypes: Optional[List[str]] = None


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AuditTrail ML Engine",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/analyze/logs")
async def analyze_logs(request: LogBatch):
    """Analyze a batch of audit logs"""
    try:
        analysis = log_analyzer.analyze(request.logs)
        return {
            "analysis": analysis,
            "logCount": len(request.logs),
            "analyzedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/anomalies")
async def detect_anomalies(request: AnomalyRequest):
    """Detect anomalies in audit logs"""
    try:
        anomalies = anomaly_detector.detect(
            request.logs,
            baseline=request.baseline,
            sensitivity=request.sensitivity
        )
        return {
            "anomalies": anomalies,
            "totalLogs": len(request.logs),
            "anomalyCount": len(anomalies),
            "detectedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/patterns")
async def detect_patterns(request: PatternRequest):
    """Detect patterns in audit logs"""
    try:
        patterns = pattern_recognizer.detect(
            request.logs,
            pattern_types=request.patternTypes
        )
        return {
            "patterns": patterns,
            "totalLogs": len(request.logs),
            "patternCount": len(patterns),
            "detectedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/behavior")
async def analyze_user_behavior(request: LogBatch):
    """Analyze user behavior from audit logs"""
    try:
        behavior = log_analyzer.analyze_user_behavior(request.logs)
        return {
            "behaviorAnalysis": behavior,
            "analyzedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/risk")
async def predict_risk(log: LogEntry):
    """Predict risk level for a log entry"""
    try:
        risk = log_analyzer.predict_risk(log.dict())
        return {
            "logId": log.logId,
            "riskPrediction": risk,
            "predictedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/compliance/{framework}")
async def get_compliance_requirements(framework: str):
    """Get compliance logging requirements for a framework"""
    requirements = {
        "soc2": {
            "requiredEvents": ["authentication", "authorization", "data_access", "data_modification", "admin"],
            "retention": 365,
            "fields": ["timestamp", "actor", "action", "resource", "status", "ip"],
            "integrity": "hash_chain_required"
        },
        "hipaa": {
            "requiredEvents": ["authentication", "data_access", "data_modification"],
            "retention": 2190,  # 6 years
            "fields": ["timestamp", "actor", "action", "resource", "status", "patient_id"],
            "integrity": "hash_chain_required"
        },
        "gdpr": {
            "requiredEvents": ["data_access", "data_modification", "data_deletion", "consent"],
            "retention": 1095,  # 3 years
            "fields": ["timestamp", "actor", "action", "resource", "legal_basis"],
            "integrity": "hash_chain_required"
        },
        "pci_dss": {
            "requiredEvents": ["authentication", "authorization", "data_access", "admin"],
            "retention": 365,
            "fields": ["timestamp", "actor", "action", "resource", "status"],
            "integrity": "hash_chain_required"
        }
    }
    
    if framework.lower() not in requirements:
        raise HTTPException(status_code=404, detail=f"Framework '{framework}' not found")
    
    return {
        "framework": framework,
        "requirements": requirements[framework.lower()]
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8017)
