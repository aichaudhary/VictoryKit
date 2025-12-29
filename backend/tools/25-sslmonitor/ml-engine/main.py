"""
SSLMonitor ML Engine
Port: 8025
SSL/TLS Certificate Analysis and Security Assessment
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn

from models.certificate_analyzer import CertificateAnalyzer
from models.security_scorer import SecurityScorer
from models.vulnerability_detector import VulnerabilityDetector

app = FastAPI(
    title="SSLMonitor ML Engine",
    description="ML-powered SSL/TLS certificate analysis",
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
certificate_analyzer = CertificateAnalyzer()
security_scorer = SecurityScorer()
vulnerability_detector = VulnerabilityDetector()


class CertificateData(BaseModel):
    domain: str
    subject: Optional[Dict[str, Any]] = None
    issuer: Optional[Dict[str, Any]] = None
    validity: Optional[Dict[str, Any]] = None
    publicKey: Optional[Dict[str, Any]] = None
    signature: Optional[Dict[str, Any]] = None
    extensions: Optional[Dict[str, Any]] = None
    protocols: Optional[List[Dict[str, Any]]] = None
    ciphers: Optional[List[Dict[str, Any]]] = None


class ScanData(BaseModel):
    hostname: str
    port: Optional[int] = 443
    protocols: Optional[List[str]] = None
    ciphers: Optional[List[str]] = None


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SSLMonitor ML Engine",
        "version": "1.0.0"
    }


@app.post("/analyze/certificate")
async def analyze_certificate(data: CertificateData):
    """Analyze certificate for security issues"""
    try:
        result = certificate_analyzer.analyze(data.dict())
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/score/security")
async def score_security(data: CertificateData):
    """Calculate security score for certificate"""
    try:
        result = security_scorer.calculate_score(data.dict())
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/vulnerabilities")
async def detect_vulnerabilities(data: ScanData):
    """Detect SSL/TLS vulnerabilities"""
    try:
        result = vulnerability_detector.detect(data.dict())
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/protocols")
async def analyze_protocols(data: ScanData):
    """Analyze supported protocols"""
    try:
        result = vulnerability_detector.analyze_protocols(data.protocols or [])
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/ciphers")
async def analyze_ciphers(data: ScanData):
    """Analyze cipher suites"""
    try:
        result = vulnerability_detector.analyze_ciphers(data.ciphers or [])
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/expiration")
async def predict_expiration(data: CertificateData):
    """Predict expiration risk"""
    try:
        result = certificate_analyzer.predict_expiration_risk(data.dict())
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend/improvements")
async def recommend_improvements(data: CertificateData):
    """Recommend security improvements"""
    try:
        analysis = certificate_analyzer.analyze(data.dict())
        score = security_scorer.calculate_score(data.dict())
        recommendations = security_scorer.get_recommendations(analysis, score)
        return {
            "success": True,
            "data": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/vulnerabilities/list")
async def list_vulnerabilities():
    """List known SSL/TLS vulnerabilities"""
    return {
        "success": True,
        "data": vulnerability_detector.get_known_vulnerabilities()
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8025)
