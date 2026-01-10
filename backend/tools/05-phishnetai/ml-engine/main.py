"""
PhishGuard ML Engine - Main FastAPI Application
Phishing Detection & URL Analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from models.url_analyzer import URLAnalyzer
from models.content_scanner import ContentScanner
from models.brand_detector import BrandDetector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PhishGuard ML Engine",
    description="Machine Learning Engine for Phishing Detection",
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
url_analyzer = URLAnalyzer()
content_scanner = ContentScanner()
brand_detector = BrandDetector()


# Pydantic models
class URLInput(BaseModel):
    url_id: str
    url: str
    source: Optional[str] = None  # 'email', 'sms', 'social', 'web'
    context: Optional[str] = None


class EmailInput(BaseModel):
    email_id: str
    sender: str
    subject: str
    body: str
    urls: List[str] = []
    attachments: List[str] = []


class PhishingResult(BaseModel):
    url_id: str
    url: str
    is_phishing: bool
    confidence: float = Field(..., ge=0, le=100)
    risk_level: str  # 'SAFE', 'SUSPICIOUS', 'LIKELY_PHISHING', 'PHISHING'
    indicators: List[Dict[str, Any]]
    targeted_brand: Optional[str] = None


class ContentAnalysisResult(BaseModel):
    content_id: str
    is_malicious: bool
    phishing_score: float
    spam_score: float
    indicators: List[str]
    extracted_urls: List[str]
    urgency_level: str


class BrandImpersonation(BaseModel):
    url: str
    impersonated_brand: Optional[str]
    similarity_score: float
    legitimate_domain: Optional[str]
    is_impersonation: bool


class ModelInfo(BaseModel):
    model_version: str
    last_trained: str
    accuracy: float
    brands_detected: int


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PhishGuard ML Engine",
        "version": "1.0.0",
        "models_loaded": {
            "url_analyzer": url_analyzer.is_loaded,
            "content_scanner": content_scanner.is_loaded,
            "brand_detector": brand_detector.is_loaded,
        }
    }


# Analyze URL
@app.post("/analyze/url", response_model=PhishingResult)
async def analyze_url(url_input: URLInput):
    try:
        logger.info(f"Analyzing URL {url_input.url_id}")
        
        result = url_analyzer.analyze(url_input.model_dump())
        brand_result = brand_detector.detect(url_input.url)
        
        return PhishingResult(
            url_id=url_input.url_id,
            url=url_input.url,
            is_phishing=result["is_phishing"],
            confidence=result["confidence"],
            risk_level=result["risk_level"],
            indicators=result["indicators"],
            targeted_brand=brand_result.get("brand")
        )
    except Exception as e:
        logger.error(f"Error analyzing URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch analyze URLs
@app.post("/analyze/batch", response_model=List[PhishingResult])
async def batch_analyze(urls: List[URLInput]):
    if len(urls) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 URLs per batch")
    
    results = []
    for url in urls:
        try:
            result = await analyze_url(url)
            results.append(result)
        except Exception as e:
            logger.error(f"Error analyzing URL {url.url_id}: {e}")
    
    return results


# Analyze email content
@app.post("/analyze/email", response_model=ContentAnalysisResult)
async def analyze_email(email: EmailInput):
    try:
        logger.info(f"Analyzing email {email.email_id}")
        
        result = content_scanner.scan_email(email.model_dump())
        
        return ContentAnalysisResult(
            content_id=email.email_id,
            is_malicious=result["is_malicious"],
            phishing_score=result["phishing_score"],
            spam_score=result["spam_score"],
            indicators=result["indicators"],
            extracted_urls=result["extracted_urls"],
            urgency_level=result["urgency_level"]
        )
    except Exception as e:
        logger.error(f"Error analyzing email: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Detect brand impersonation
@app.post("/detect/brand", response_model=BrandImpersonation)
async def detect_brand(url_input: URLInput):
    try:
        logger.info(f"Detecting brand impersonation for {url_input.url}")
        
        result = brand_detector.detect(url_input.url)
        
        return BrandImpersonation(
            url=url_input.url,
            impersonated_brand=result.get("brand"),
            similarity_score=result["similarity_score"],
            legitimate_domain=result.get("legitimate_domain"),
            is_impersonation=result["is_impersonation"]
        )
    except Exception as e:
        logger.error(f"Error detecting brand: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Quick URL check
@app.get("/check/{url:path}")
async def quick_check(url: str):
    try:
        result = url_analyzer.quick_check(url)
        return result
    except Exception as e:
        logger.error(f"Error checking URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get model info
@app.get("/model-info", response_model=ModelInfo)
async def get_model_info():
    return ModelInfo(
        model_version=url_analyzer.version,
        last_trained=url_analyzer.last_trained,
        accuracy=url_analyzer.accuracy,
        brands_detected=len(brand_detector.known_brands)
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
