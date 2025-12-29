"""
VulnScan ML Engine - Main FastAPI Application
Vulnerability Scanning & Assessment
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from models.vuln_classifier import VulnerabilityClassifier
from models.risk_scorer import RiskScorer
from models.exploit_predictor import ExploitPredictor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="VulnScan ML Engine",
    description="Machine Learning Engine for Vulnerability Scanning & Assessment",
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
vuln_classifier = VulnerabilityClassifier()
risk_scorer = RiskScorer()
exploit_predictor = ExploitPredictor()


# Pydantic models
class VulnerabilityInput(BaseModel):
    vuln_id: str
    cve_id: Optional[str] = None
    title: str
    description: str
    affected_product: Optional[str] = None
    affected_version: Optional[str] = None
    cvss_vector: Optional[str] = None


class ScanTargetInput(BaseModel):
    target_id: str
    target_type: str  # 'host', 'application', 'network', 'container'
    target_address: str
    ports: Optional[List[int]] = None
    services: Optional[List[str]] = None


class VulnerabilityResult(BaseModel):
    vuln_id: str
    cve_id: Optional[str]
    severity: str  # 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'
    cvss_score: float = Field(..., ge=0, le=10)
    category: str
    exploitation_probability: float
    remediation_priority: int
    recommendations: List[str]


class RiskAssessment(BaseModel):
    target_id: str
    overall_risk_score: float
    risk_level: str
    vulnerability_count: Dict[str, int]
    top_risks: List[Dict[str, Any]]
    exposure_score: float
    attack_surface: str


class ExploitPrediction(BaseModel):
    vuln_id: str
    cve_id: Optional[str]
    exploitability_score: float
    known_exploits: bool
    exploit_maturity: str
    time_to_exploit: Optional[str]
    attack_vectors: List[str]


class ModelInfo(BaseModel):
    model_version: str
    last_updated: str
    vulnerabilities_known: int
    cve_database_date: str


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "VulnScan ML Engine",
        "version": "1.0.0",
        "models_loaded": {
            "vuln_classifier": vuln_classifier.is_loaded,
            "risk_scorer": risk_scorer.is_loaded,
            "exploit_predictor": exploit_predictor.is_loaded,
        }
    }


# Classify vulnerability
@app.post("/classify", response_model=VulnerabilityResult)
async def classify_vulnerability(vuln: VulnerabilityInput):
    try:
        logger.info(f"Classifying vulnerability {vuln.vuln_id}")
        
        result = vuln_classifier.classify(vuln.model_dump())
        exploit_prob = exploit_predictor.predict_probability(vuln.model_dump())
        
        return VulnerabilityResult(
            vuln_id=vuln.vuln_id,
            cve_id=vuln.cve_id,
            severity=result["severity"],
            cvss_score=result["cvss_score"],
            category=result["category"],
            exploitation_probability=exploit_prob,
            remediation_priority=result["remediation_priority"],
            recommendations=result["recommendations"]
        )
    except Exception as e:
        logger.error(f"Error classifying vulnerability: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch classify vulnerabilities
@app.post("/classify/batch", response_model=List[VulnerabilityResult])
async def batch_classify(vulns: List[VulnerabilityInput]):
    if len(vulns) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 vulnerabilities per batch")
    
    results = []
    for vuln in vulns:
        try:
            result = await classify_vulnerability(vuln)
            results.append(result)
        except Exception as e:
            logger.error(f"Error classifying {vuln.vuln_id}: {e}")
    
    return results


# Assess risk for target
@app.post("/assess/risk", response_model=RiskAssessment)
async def assess_risk(target: ScanTargetInput, vulns: List[VulnerabilityInput] = []):
    try:
        logger.info(f"Assessing risk for target {target.target_id}")
        
        result = risk_scorer.assess(target.model_dump(), [v.model_dump() for v in vulns])
        
        return RiskAssessment(
            target_id=target.target_id,
            overall_risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            vulnerability_count=result["vuln_count"],
            top_risks=result["top_risks"],
            exposure_score=result["exposure_score"],
            attack_surface=result["attack_surface"]
        )
    except Exception as e:
        logger.error(f"Error assessing risk: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Predict exploitability
@app.post("/predict/exploit", response_model=ExploitPrediction)
async def predict_exploit(vuln: VulnerabilityInput):
    try:
        logger.info(f"Predicting exploitability for {vuln.vuln_id}")
        
        result = exploit_predictor.predict(vuln.model_dump())
        
        return ExploitPrediction(
            vuln_id=vuln.vuln_id,
            cve_id=vuln.cve_id,
            exploitability_score=result["exploitability_score"],
            known_exploits=result["known_exploits"],
            exploit_maturity=result["exploit_maturity"],
            time_to_exploit=result.get("time_to_exploit"),
            attack_vectors=result["attack_vectors"]
        )
    except Exception as e:
        logger.error(f"Error predicting exploit: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# CVE lookup
@app.get("/lookup/{cve_id}")
async def lookup_cve(cve_id: str):
    try:
        result = vuln_classifier.lookup_cve(cve_id)
        return result
    except Exception as e:
        logger.error(f"Error looking up CVE: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get model info
@app.get("/model-info", response_model=ModelInfo)
async def get_model_info():
    return ModelInfo(
        model_version=vuln_classifier.version,
        last_updated=vuln_classifier.last_updated,
        vulnerabilities_known=len(vuln_classifier.known_cves),
        cve_database_date=vuln_classifier.cve_db_date
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
