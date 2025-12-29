"""
CryptoVault ML Engine - Main FastAPI Application
Encryption & Key Management Security Analysis
Port: 8015
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uvicorn

from models.key_analyzer import KeyAnalyzer
from models.certificate_validator import CertificateValidator
from models.secret_analyzer import SecretAnalyzer

app = FastAPI(
    title="CryptoVault ML Engine",
    description="AI-powered encryption and key management analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize analyzers
key_analyzer = KeyAnalyzer()
cert_validator = CertificateValidator()
secret_analyzer = SecretAnalyzer()


class KeyData(BaseModel):
    keyId: str
    name: str
    algorithm: str
    keyType: str = "symmetric"
    purpose: str = "encrypt_decrypt"
    rotation: Optional[Dict[str, Any]] = None
    usage: Optional[Dict[str, Any]] = None


class CertificateData(BaseModel):
    certificateId: str
    commonName: str
    type: str = "ssl_tls"
    keyAlgorithm: str = "RSA-2048"
    validity: Optional[Dict[str, Any]] = None
    domains: Optional[List[Dict[str, str]]] = None
    chain: Optional[List[Dict[str, str]]] = None


class SecretData(BaseModel):
    secretId: str
    name: str
    type: str = "generic"
    rotation: Optional[Dict[str, Any]] = None
    usage: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class EncryptionRecommendation(BaseModel):
    useCase: str
    dataType: str = "general"
    complianceRequirements: Optional[List[str]] = None


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CryptoVault ML Engine",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/analyze/key")
async def analyze_key(data: KeyData):
    """Analyze encryption key for security risks."""
    try:
        result = key_analyzer.analyze(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/validate/certificate")
async def validate_certificate(data: CertificateData):
    """Validate SSL/TLS certificate."""
    try:
        result = cert_validator.validate(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/secret")
async def analyze_secret(data: SecretData):
    """Analyze secret for security risks."""
    try:
        result = secret_analyzer.analyze(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend/encryption")
async def recommend_encryption(data: EncryptionRecommendation):
    """Get encryption algorithm recommendations based on use case."""
    try:
        result = key_analyzer.recommend_algorithm(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/algorithms")
async def list_algorithms():
    """List supported encryption algorithms with their properties."""
    return {
        "symmetric": [
            {"name": "AES-256-GCM", "keySize": 256, "strength": "high", "recommended": True},
            {"name": "AES-256-CBC", "keySize": 256, "strength": "high", "recommended": True},
            {"name": "AES-128-GCM", "keySize": 128, "strength": "medium", "recommended": False},
            {"name": "ChaCha20-Poly1305", "keySize": 256, "strength": "high", "recommended": True}
        ],
        "asymmetric": [
            {"name": "RSA-4096", "keySize": 4096, "strength": "high", "recommended": True},
            {"name": "RSA-2048", "keySize": 2048, "strength": "medium", "recommended": False},
            {"name": "ECDSA-P384", "keySize": 384, "strength": "high", "recommended": True},
            {"name": "ECDSA-P256", "keySize": 256, "strength": "high", "recommended": True},
            {"name": "Ed25519", "keySize": 256, "strength": "high", "recommended": True}
        ],
        "hash": [
            {"name": "SHA-512", "digestSize": 512, "strength": "high", "recommended": True},
            {"name": "SHA-384", "digestSize": 384, "strength": "high", "recommended": True},
            {"name": "SHA-256", "digestSize": 256, "strength": "high", "recommended": True},
            {"name": "SHA-1", "digestSize": 160, "strength": "weak", "recommended": False, "deprecated": True}
        ]
    }


@app.get("/compliance/{framework}")
async def get_compliance_requirements(framework: str):
    """Get cryptographic requirements for compliance frameworks."""
    frameworks = {
        "pci-dss": {
            "name": "PCI DSS",
            "version": "4.0",
            "requirements": {
                "keyManagement": "Documented key management procedures required",
                "minimumKeyLength": {"symmetric": 128, "asymmetric": 2048},
                "rotation": "At least annually or upon suspected compromise",
                "algorithms": ["AES", "RSA-2048+", "ECDSA"],
                "prohibitedAlgorithms": ["DES", "3DES", "MD5", "SHA-1"]
            }
        },
        "hipaa": {
            "name": "HIPAA",
            "requirements": {
                "encryption": "Required for ePHI in transit and at rest",
                "minimumKeyLength": {"symmetric": 128, "asymmetric": 2048},
                "algorithms": ["AES-128+"],
                "accessControl": "Role-based access to encryption keys"
            }
        },
        "sox": {
            "name": "SOX",
            "requirements": {
                "keyManagement": "Strict key custody and audit trails",
                "rotation": "Based on risk assessment",
                "auditLogging": "All key operations must be logged"
            }
        },
        "gdpr": {
            "name": "GDPR",
            "requirements": {
                "encryption": "Appropriate technical measures for personal data",
                "pseudonymization": "Encouraged for data protection",
                "keyManagement": "Keys should be managed separately from data"
            }
        }
    }
    
    if framework.lower() not in frameworks:
        raise HTTPException(status_code=404, detail=f"Framework {framework} not found")
    
    return frameworks[framework.lower()]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8015)
