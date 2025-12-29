"""
DataGuardian ML Engine - Main FastAPI Application
Data Protection & Privacy Compliance Engine
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from models.data_classifier import DataClassifier
from models.privacy_scanner import PrivacyScanner
from models.encryption_advisor import EncryptionAdvisor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="DataGuardian ML Engine",
    description="Data Protection & Privacy Compliance Engine",
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
data_classifier = DataClassifier()
privacy_scanner = PrivacyScanner()
encryption_advisor = EncryptionAdvisor()


# Pydantic models
class DataInput(BaseModel):
    content: str
    source: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}


class BatchDataInput(BaseModel):
    items: List[DataInput]


class ColumnInput(BaseModel):
    name: str
    sample_values: List[str]
    data_type: Optional[str] = "string"


class SchemaInput(BaseModel):
    table_name: str
    columns: List[ColumnInput]


class ClassificationResult(BaseModel):
    data_type: str  # 'PII', 'PHI', 'PCI', 'SENSITIVE', 'PUBLIC'
    category: str
    confidence: float
    patterns_matched: List[str]
    risk_level: str


class PrivacyScanResult(BaseModel):
    total_fields: int
    pii_fields: List[Dict[str, Any]]
    phi_fields: List[Dict[str, Any]]
    pci_fields: List[Dict[str, Any]]
    risk_score: float
    recommendations: List[str]


class EncryptionRecommendation(BaseModel):
    field_name: str
    data_type: str
    encryption_method: str
    key_management: str
    priority: str


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "DataGuardian ML Engine",
        "version": "1.0.0",
        "models_loaded": {
            "data_classifier": data_classifier.is_loaded,
            "privacy_scanner": privacy_scanner.is_loaded,
            "encryption_advisor": encryption_advisor.is_loaded,
        }
    }


# Classify data
@app.post("/classify", response_model=ClassificationResult)
async def classify_data(data: DataInput):
    try:
        logger.info(f"Classifying data from source: {data.source}")
        
        result = data_classifier.classify(data.content)
        
        return ClassificationResult(
            data_type=result["data_type"],
            category=result["category"],
            confidence=result["confidence"],
            patterns_matched=result["patterns_matched"],
            risk_level=result["risk_level"]
        )
    except Exception as e:
        logger.error(f"Error classifying data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch classify
@app.post("/classify/batch")
async def classify_batch(data: BatchDataInput):
    try:
        results = []
        for item in data.items:
            result = data_classifier.classify(item.content)
            results.append({
                "source": item.source,
                **result
            })
        
        return {"results": results, "total": len(results)}
    except Exception as e:
        logger.error(f"Error in batch classification: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Scan schema for privacy
@app.post("/scan/schema", response_model=PrivacyScanResult)
async def scan_schema(schema: SchemaInput):
    try:
        logger.info(f"Scanning schema: {schema.table_name}")
        
        result = privacy_scanner.scan_schema(schema.model_dump())
        
        return PrivacyScanResult(
            total_fields=result["total_fields"],
            pii_fields=result["pii_fields"],
            phi_fields=result["phi_fields"],
            pci_fields=result["pci_fields"],
            risk_score=result["risk_score"],
            recommendations=result["recommendations"]
        )
    except Exception as e:
        logger.error(f"Error scanning schema: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get encryption recommendations
@app.post("/recommend/encryption")
async def recommend_encryption(schema: SchemaInput):
    try:
        logger.info(f"Generating encryption recommendations for: {schema.table_name}")
        
        recommendations = encryption_advisor.recommend(schema.model_dump())
        
        return {
            "table_name": schema.table_name,
            "recommendations": recommendations
        }
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Detect PII in text
@app.post("/detect/pii")
async def detect_pii(data: DataInput):
    try:
        findings = data_classifier.detect_pii(data.content)
        return {
            "findings": findings,
            "count": len(findings),
            "risk_level": "HIGH" if len(findings) > 0 else "LOW"
        }
    except Exception as e:
        logger.error(f"Error detecting PII: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get data categories
@app.get("/categories")
async def get_categories():
    return {
        "categories": data_classifier.get_categories()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
