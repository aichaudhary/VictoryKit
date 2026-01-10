"""
APIGuard ML Engine
Port: 8022
API Security Analysis, Anomaly Detection, Schema Validation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

from models.security_analyzer import SecurityAnalyzer
from models.anomaly_detector import AnomalyDetector
from models.schema_validator import SchemaValidator

app = FastAPI(
    title="APIGuard ML Engine",
    version="1.0.0",
    description="ML-powered API security analysis and anomaly detection"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security_analyzer = SecurityAnalyzer()
anomaly_detector = AnomalyDetector()
schema_validator = SchemaValidator()


class EndpointScanRequest(BaseModel):
    path: str
    method: str
    parameters: List[Dict[str, Any]] = []
    request_body: Optional[Dict[str, Any]] = None


class APIAnalysisRequest(BaseModel):
    api_id: str
    base_url: str
    endpoints: List[Dict[str, Any]]
    authentication: Optional[Dict[str, Any]] = None


class TrafficData(BaseModel):
    requests: List[Dict[str, Any]]
    window_minutes: int = 60


class SchemaRequest(BaseModel):
    schema_type: str = "openapi"
    schema_content: Dict[str, Any]


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "APIGuard ML Engine",
        "version": "1.0.0"
    }


@app.post("/scan/endpoint")
async def scan_endpoint(request: EndpointScanRequest):
    """Scan an endpoint for security vulnerabilities"""
    try:
        result = security_analyzer.scan_endpoint(
            request.path,
            request.method,
            request.parameters,
            request.request_body
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/api")
async def analyze_api(request: APIAnalysisRequest):
    """Perform comprehensive API security analysis"""
    try:
        result = security_analyzer.analyze_api(
            request.api_id,
            request.base_url,
            request.endpoints,
            request.authentication
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/anomalies")
async def detect_anomalies(request: TrafficData):
    """Detect anomalies in API traffic"""
    try:
        result = anomaly_detector.detect(request.requests, request.window_minutes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/validate/schema")
async def validate_schema(request: SchemaRequest):
    """Validate API schema for security best practices"""
    try:
        result = schema_validator.validate(request.schema_type, request.schema_content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/score/security")
async def score_security(request: APIAnalysisRequest):
    """Calculate security score for an API"""
    try:
        score = security_analyzer.calculate_score(
            request.endpoints,
            request.authentication
        )
        return score
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/vulnerabilities/types")
async def get_vulnerability_types():
    """Get list of vulnerability types"""
    return {
        "types": [
            {"id": "BROKEN_AUTHENTICATION", "severity": "critical", "owasp": "API1"},
            {"id": "BROKEN_AUTHORIZATION", "severity": "critical", "owasp": "API1"},
            {"id": "EXCESSIVE_DATA_EXPOSURE", "severity": "high", "owasp": "API3"},
            {"id": "LACK_OF_RESOURCES_LIMITING", "severity": "medium", "owasp": "API4"},
            {"id": "BROKEN_FUNCTION_LEVEL_AUTH", "severity": "high", "owasp": "API5"},
            {"id": "MASS_ASSIGNMENT", "severity": "medium", "owasp": "API6"},
            {"id": "SECURITY_MISCONFIGURATION", "severity": "medium", "owasp": "API7"},
            {"id": "INJECTION", "severity": "critical", "owasp": "API8"},
            {"id": "IMPROPER_ASSETS_MANAGEMENT", "severity": "medium", "owasp": "API9"},
            {"id": "INSUFFICIENT_LOGGING", "severity": "low", "owasp": "API10"}
        ]
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8022)
