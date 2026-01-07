"""
CryptoVault ML Service
Port: 8015

Provides AI/ML capabilities for:
- Cryptographic pattern analysis
- Key usage analytics
- Vault operation anomaly detection
- Predictive key lifecycle management
- Algorithm performance optimization
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier
import shap
import motor.motor_asyncio
import json

app = FastAPI(
    title="CryptoVault ML Service",
    description="AI/ML service for cryptographic intelligence and vault analytics",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client.cryptovault_db

# ML Models (will be loaded/initialized)
models = {}

# Pydantic models for API
class VaultOperation(BaseModel):
    operation: str
    vaultId: str
    keyId: str
    userId: str
    timestamp: datetime
    success: bool
    dataSize: int
    algorithm: str
    responseTime: Optional[float] = None

class KeyUsagePattern(BaseModel):
    keyId: str
    usageCount: int
    timeWindow: str
    patterns: Dict[str, Any]

class AnomalyDetectionRequest(BaseModel):
    operations: List[VaultOperation]
    threshold: Optional[float] = 0.95

class LifecyclePredictionRequest(BaseModel):
    keyId: str
    currentUsage: int
    daysSinceCreation: int
    algorithm: str

class VaultDesignRequest(BaseModel):
    orgSize: str
    securityLevel: str
    complianceReqs: List[str]
    keyTypes: List[str]

class AlgorithmRecommendation(BaseModel):
    useCase: str
    securityLevel: str
    performanceNeeds: str
    complianceReqs: List[str]

@app.on_event("startup")
async def startup_event():
    """Initialize ML models and database connections"""
    print("🚀 Starting CryptoVault ML Service...")

    # Initialize models directory
    os.makedirs("models", exist_ok=True)

    # Load or train models
    await initialize_models()

    print("✅ ML Service ready on port 8015")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Shutting down ML Service...")
    client.close()

async def initialize_models():
    """Initialize and load ML models"""
    global models

    # Vault anomaly detector (XGBoost)
    try:
        models['vault_anomaly_detector'] = joblib.load('models/vault_anomaly_detector.pkl')
    except:
        print("🔍 Training vault anomaly detection model...")
        models['vault_anomaly_detector'] = await train_vault_anomaly_detector()

    # Key lifecycle predictor (LightGBM)
    try:
        models['key_lifecycle_predictor'] = joblib.load('models/key_lifecycle_predictor.pkl')
    except:
        print("🔄 Training key lifecycle predictor...")
        models['key_lifecycle_predictor'] = await train_key_lifecycle_predictor()

    # Algorithm recommender (CatBoost)
    try:
        models['crypto_algorithm_recommender'] = joblib.load('models/crypto_algorithm_recommender.pkl')
    except:
        print("🧠 Training cryptographic algorithm recommender...")
        models['crypto_algorithm_recommender'] = await train_crypto_algorithm_recommender()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CryptoVault ML",
        "models_loaded": list(models.keys()),
        "timestamp": datetime.utcnow()
    }

@app.post("/analyze/vault-operations")
async def analyze_vault_operations(request: AnomalyDetectionRequest):
    """Analyze vault operation patterns for anomalies"""
    try:
        # Convert operations to DataFrame
        df = pd.DataFrame([op.dict() for op in request.operations])

        # Feature engineering
        features = await extract_vault_features(df)

        # Predict anomalies
        anomaly_scores = models['vault_anomaly_detector'].predict_proba(features)[:, 1]

        # Identify anomalies
        anomalies = []
        for i, score in enumerate(anomaly_scores):
            if score > request.threshold:
                anomalies.append({
                    "operation_index": i,
                    "anomaly_score": float(score),
                    "operation_data": request.operations[i].dict()
                })

        return {
            "total_operations": len(request.operations),
            "anomalies_detected": len(anomalies),
            "anomaly_rate": len(anomalies) / len(request.operations),
            "anomalies": anomalies,
            "recommendations": generate_vault_anomaly_recommendations(anomalies)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vault operation analysis failed: {str(e)}")

@app.post("/predict/key-lifecycle")
async def predict_key_lifecycle(request: LifecyclePredictionRequest):
    """Predict optimal key lifecycle management"""
    try:
        # Prepare features
        features = np.array([[
            request.currentUsage,
            request.daysSinceCreation,
            hash(request.algorithm) % 1000,  # Simple hash for algorithm
            request.currentUsage / max(request.daysSinceCreation, 1)  # Usage rate
        ]])

        # Predict lifecycle events
        lifecycle_prob = models['key_lifecycle_predictor'].predict_proba(features)[0, 1]

        # Calculate recommended actions
        recommendations = calculate_lifecycle_recommendations(lifecycle_prob, request.daysSinceCreation)

        return {
            "key_id": request.keyId,
            "lifecycle_risk_score": float(lifecycle_prob),
            "recommendations": recommendations,
            "next_actions": get_next_lifecycle_actions(recommendations),
            "rationale": generate_lifecycle_rationale(lifecycle_prob, request)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Key lifecycle prediction failed: {str(e)}")

@app.post("/recommend/vault-design")
async def recommend_vault_design(request: VaultDesignRequest):
    """Recommend optimal vault architecture"""
    try:
        # This would use a more complex model, but for now return structured recommendations
        recommendations = {
            "vault_hierarchy": recommend_vault_hierarchy(request),
            "key_separation": recommend_key_separation(request),
            "access_controls": recommend_access_controls(request),
            "backup_strategy": recommend_backup_strategy(request),
            "monitoring_setup": recommend_monitoring_setup(request)
        }

        return {
            "design_recommendations": recommendations,
            "implementation_priority": ["vault_hierarchy", "access_controls", "key_separation", "monitoring_setup", "backup_strategy"],
            "estimated_complexity": calculate_design_complexity(request),
            "compliance_alignment": check_design_compliance(request)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vault design recommendation failed: {str(e)}")

@app.post("/recommend/crypto-algorithm")
async def recommend_crypto_algorithm(request: AlgorithmRecommendation):
    """Recommend optimal cryptographic algorithm"""
    try:
        # Prepare features
        features = np.array([[
            hash(request.useCase) % 100,
            hash(request.securityLevel) % 100,
            hash(request.performanceNeeds) % 100,
            len(request.complianceReqs),
            sum(hash(req) % 10 for req in request.complianceReqs)
        ]])

        # Get recommendations
        recommendations = models['crypto_algorithm_recommender'].predict_proba(features)[0]

        # Map to algorithm names
        algorithm_names = [
            'AES-256-GCM', 'AES-128-GCM', 'ChaCha20-Poly1305',
            'RSA-4096', 'ECDSA-P384', 'Ed25519'
        ]

        # Create recommendation list
        algo_recommendations = []
        for name, prob in zip(algorithm_names, recommendations):
            algo_recommendations.append({
                "algorithm": name,
                "confidence": float(prob),
                "suitability_score": calculate_crypto_suitability_score(name, request)
            })

        # Sort by combined score
        algo_recommendations.sort(key=lambda x: x['suitability_score'], reverse=True)

        return {
            "recommendations": algo_recommendations[:3],
            "analysis": analyze_crypto_choice(request),
            "implementation_notes": get_crypto_implementation_notes(algo_recommendations[0]['algorithm'])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cryptographic algorithm recommendation failed: {str(e)}")

@app.get("/analytics/key-usage/{key_id}")
async def get_key_usage_analytics(key_id: str, days: int = 30):
    """Get key usage analytics"""
    try:
        # Query vault operations
        pipeline = [
            {"$match": {"keyId": key_id, "timestamp": {"$gte": datetime.utcnow() - timedelta(days=days)}}},
            {"$group": {
                "_id": {
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "operation": "$operation"
                },
                "count": {"$sum": 1},
                "avg_response_time": {"$avg": "$responseTime"},
                "success_rate": {"$avg": {"$cond": ["$success", 1, 0]}}
            }},
            {"$sort": {"_id.date": 1}}
        ]

        results = await db.operationslog.aggregate(pipeline).to_list(length=None)

        # Process results
        analytics = {
            "key_id": key_id,
            "period_days": days,
            "total_operations": sum(r['count'] for r in results),
            "daily_stats": [],
            "patterns": await detect_key_usage_patterns(results),
            "recommendations": []
        }

        # Group by date
        daily_data = {}
        for result in results:
            date = result['_id']['date']
            if date not in daily_data:
                daily_data[date] = {"date": date, "operations": {}}
            daily_data[date]["operations"][result['_id']['operation']] = {
                "count": result['count'],
                "avg_response_time": result.get('avg_response_time'),
                "success_rate": result['success_rate']
            }

        analytics["daily_stats"] = list(daily_data.values())

        # Generate recommendations
        analytics["recommendations"] = await generate_key_usage_recommendations(analytics)

        return analytics

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")

# Helper functions
async def extract_vault_features(df: pd.DataFrame) -> np.ndarray:
    """Extract features for vault anomaly detection"""
    features = []

    for _, row in df.iterrows():
        # Basic features
        feature_vector = [
            row['dataSize'],
            1 if row['success'] else 0,
            row.get('responseTime', 0),
            hash(row['algorithm']) % 100,
            hash(row['userId']) % 100,
            hash(row['keyId']) % 100,
            hash(row['vaultId']) % 100
        ]

        # Time-based features
        hour = row['timestamp'].hour
        feature_vector.extend([
            hour,  # Hour of day
            1 if hour < 6 or hour > 22 else 0,  # Off-hours flag
            row['timestamp'].weekday()  # Day of week
        ])

        # Operation type features
        operation_types = ['store', 'retrieve', 'rotate', 'delete', 'sign', 'verify', 'encrypt', 'decrypt']
        for op_type in operation_types:
            feature_vector.append(1 if row['operation'] == op_type else 0)

        features.append(feature_vector)

    return np.array(features)

def generate_vault_anomaly_recommendations(anomalies: List[Dict]) -> List[str]:
    """Generate recommendations based on detected anomalies"""
    recommendations = []

    if len(anomalies) > 10:
        recommendations.append("High anomaly rate detected. Consider reviewing vault access controls.")

    if any(a['operation_data']['success'] == False for a in anomalies):
        recommendations.append("Failed operations detected. Check key validity and vault permissions.")

    failed_operations = [a for a in anomalies if not a['operation_data']['success']]
    if len(failed_operations) > len(anomalies) * 0.3:
        recommendations.append("High failure rate detected. Investigate vault infrastructure issues.")

    return recommendations

def calculate_lifecycle_recommendations(probability: float, days_since_creation: int) -> Dict[str, Any]:
    """Calculate key lifecycle recommendations"""
    recommendations = {
        "rotation_needed": False,
        "rotation_urgency": "low",
        "retirement_consideration": False,
        "monitoring_increase": False
    }

    if probability > 0.8:
        recommendations["rotation_needed"] = True
        recommendations["rotation_urgency"] = "high"
        recommendations["monitoring_increase"] = True
    elif probability > 0.6:
        recommendations["rotation_needed"] = True
        recommendations["rotation_urgency"] = "medium"
    elif days_since_creation > 365:
        recommendations["retirement_consideration"] = True

    return recommendations

def get_next_lifecycle_actions(recommendations: Dict[str, Any]) -> List[str]:
    """Get next recommended actions"""
    actions = []

    if recommendations["rotation_needed"]:
        urgency = recommendations["rotation_urgency"]
        if urgency == "high":
            actions.append("Schedule immediate key rotation")
        elif urgency == "medium":
            actions.append("Plan key rotation within next 30 days")

    if recommendations["retirement_consideration"]:
        actions.append("Evaluate key retirement based on usage patterns")

    if recommendations["monitoring_increase"]:
        actions.append("Increase monitoring frequency for this key")

    return actions

def generate_lifecycle_rationale(probability: float, request: LifecyclePredictionRequest) -> str:
    """Generate explanation for lifecycle recommendations"""
    if probability > 0.8:
        return f"High lifecycle risk ({probability:.2%}) due to intensive usage ({request.currentUsage} operations) and age ({request.daysSinceCreation} days)."
    elif probability > 0.6:
        return f"Moderate lifecycle risk ({probability:.2%}) based on usage patterns and key age."
    else:
        return f"Low lifecycle risk ({probability:.2%}). Key can continue normal operations."

def recommend_vault_hierarchy(request: VaultDesignRequest) -> Dict[str, Any]:
    """Recommend vault hierarchy structure"""
    hierarchy = {
        "root_vault": "enterprise-wide master vault",
        "department_vaults": ["it", "finance", "legal", "operations"],
        "application_vaults": "per-application isolation",
        "environment_separation": ["development", "staging", "production"]
    }

    if request.orgSize == "large":
        hierarchy["regional_vaults"] = ["americas", "emea", "apac"]

    return hierarchy

def recommend_key_separation(request: VaultDesignRequest) -> Dict[str, Any]:
    """Recommend key separation strategy"""
    return {
        "encryption_keys": "separate vault from signing keys",
        "production_vs_dev": "strict separation with different policies",
        "key_types": ["data_encryption", "authentication", "signing", "tls_certificates"],
        "rotation_policies": "different schedules per key type"
    }

def recommend_access_controls(request: VaultDesignRequest) -> Dict[str, Any]:
    """Recommend access control structure"""
    return {
        "rbac_model": "role-based access control",
        "principle_of_least_privilege": True,
        "multi_factor_authentication": True,
        "audit_logging": "all access attempts",
        "emergency_access": "break-glass procedures"
    }

def recommend_backup_strategy(request: VaultDesignRequest) -> Dict[str, Any]:
    """Recommend backup strategy"""
    return {
        "encrypted_backups": True,
        "offsite_storage": True,
        "regular_testing": "quarterly restore tests",
        "key_backup_separation": "separate from data backups"
    }

def recommend_monitoring_setup(request: VaultDesignRequest) -> Dict[str, Any]:
    """Recommend monitoring setup"""
    return {
        "real_time_alerts": ["unauthorized_access", "key_rotation_failures", "anomalous_usage"],
        "compliance_reporting": "automated daily/weekly reports",
        "performance_monitoring": "response times and throughput",
        "capacity_planning": "usage trends and projections"
    }

def calculate_design_complexity(request: VaultDesignRequest) -> str:
    """Calculate implementation complexity"""
    complexity_score = 0

    if request.orgSize == "large":
        complexity_score += 2
    if len(request.complianceReqs) > 3:
        complexity_score += 2
    if request.securityLevel == "maximum":
        complexity_score += 1

    if complexity_score >= 4:
        return "high"
    elif complexity_score >= 2:
        return "medium"
    else:
        return "low"

def check_design_compliance(request: VaultDesignRequest) -> Dict[str, bool]:
    """Check compliance alignment"""
    compliance = {}
    for req in request.complianceReqs:
        if req.upper() in ["GDPR", "HIPAA", "PCI DSS", "SOX"]:
            compliance[req] = True
        else:
            compliance[req] = False
    return compliance

def calculate_crypto_suitability_score(algorithm: str, request: AlgorithmRecommendation) -> float:
    """Calculate how suitable a crypto algorithm is for the requirements"""
    score = 0.5  # Base score

    # Security level adjustments
    if request.securityLevel == 'high' and 'AES-256' in algorithm:
        score += 0.3
    elif request.securityLevel == 'standard' and 'AES-128' in algorithm:
        score += 0.2

    # Performance adjustments
    if request.performanceNeeds == 'high' and 'ChaCha20' in algorithm:
        score += 0.2

    # Compliance adjustments
    compliance_keywords = ['GDPR', 'HIPAA', 'PCI', 'FIPS']
    if any(keyword in ' '.join(request.complianceReqs) for keyword in compliance_keywords):
        if 'AES' in algorithm:
            score += 0.1

    return min(1.0, score)

def analyze_crypto_choice(request: AlgorithmRecommendation) -> str:
    """Provide analysis of algorithm choice"""
    analysis = f"For {request.useCase} with {request.securityLevel} security requirements"

    if request.performanceNeeds == 'high':
        analysis += " and high performance needs"
    if request.complianceReqs:
        analysis += f", considering {', '.join(request.complianceReqs)} compliance"

    analysis += ", the recommendations prioritize security, performance, and compliance alignment."

    return analysis

def get_crypto_implementation_notes(algorithm: str) -> str:
    """Get implementation notes for recommended algorithm"""
    notes = {
        'AES-256-GCM': 'Industry standard for symmetric encryption. Use GCM mode for authenticated encryption.',
        'AES-128-GCM': 'Balanced security and performance. Suitable for most applications.',
        'ChaCha20-Poly1305': 'Excellent performance, especially on mobile devices. Good for high-throughput scenarios.',
        'RSA-4096': 'Strong asymmetric encryption. Use for key exchange, not bulk data.',
        'ECDSA-P384': 'Efficient elliptic curve cryptography. Good for digital signatures.',
        'Ed25519': 'Modern, fast elliptic curve signature algorithm.'
    }

    return notes.get(algorithm, 'Standard cryptographic best practices apply.')

async def detect_key_usage_patterns(results: List[Dict]) -> Dict[str, Any]:
    """Detect patterns in key usage"""
    patterns = {
        "peak_hours": [],
        "unusual_activity": False,
        "usage_trends": "stable"
    }

    if results:
        total_ops = sum(r['count'] for r in results)
        avg_daily = total_ops / max(len(set(r['_id']['date'] for r in results)), 1)

        if avg_daily > 1000:
            patterns["usage_trends"] = "high"
        elif avg_daily < 10:
            patterns["usage_trends"] = "low"

    return patterns

async def generate_key_usage_recommendations(analytics: Dict) -> List[str]:
    """Generate recommendations based on usage analytics"""
    recommendations = []

    if analytics.get('patterns', {}).get('usage_trends') == 'high':
        recommendations.append("High usage detected. Consider implementing rate limiting.")

    if analytics['total_operations'] > 10000:
        recommendations.append("Consider key rotation due to high usage volume.")

    return recommendations

# Model training functions (simplified for demo)
async def train_vault_anomaly_detector():
    """Train XGBoost vault anomaly detection model"""
    # Generate synthetic training data
    np.random.seed(42)
    n_samples = 1000

    # Normal vault operations
    normal_data = np.random.normal([
        1000, 1, 50, 50, 50, 50, 50, 12, 0, 2,  # Basic features
        1, 0, 0, 0, 0, 0, 0, 0  # Operation types (mostly retrieve)
    ], [
        200, 0.1, 20, 10, 10, 10, 10, 4, 0.2, 1,
        0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3
    ], (int(n_samples * 0.9), 18))

    # Anomalous operations
    anomaly_data = np.random.normal([
        5000, 0.3, 200, 80, 80, 80, 80, 3, 0.8, 5,
        0, 0, 0, 1, 0, 0, 0, 0  # Mostly delete operations
    ], [
        1000, 0.3, 50, 20, 20, 20, 20, 2, 0.2, 2,
        0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1
    ], (int(n_samples * 0.1), 18))

    X = np.vstack([normal_data, anomaly_data])
    y = np.hstack([np.zeros(int(n_samples * 0.9)), np.ones(int(n_samples * 0.1))])

    # Train model
    model = xgb.XGBClassifier(
        objective='binary:logistic',
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1
    )
    model.fit(X, y)

    # Save model
    joblib.dump(model, 'models/vault_anomaly_detector.pkl')

    return model

async def train_key_lifecycle_predictor():
    """Train LightGBM key lifecycle prediction model"""
    np.random.seed(42)
    n_samples = 1000

    # Generate synthetic data
    X = np.random.rand(n_samples, 4) * np.array([10000, 365, 1000, 100])
    y = (X[:, 0] / np.maximum(X[:, 1], 1) > 50).astype(int)  # High usage rate indicates lifecycle action needed

    model = lgb.LGBMClassifier(
        objective='binary',
        num_leaves=31,
        learning_rate=0.1,
        n_estimators=100
    )
    model.fit(X, y)

    joblib.dump(model, 'models/key_lifecycle_predictor.pkl')

    return model

async def train_crypto_algorithm_recommender():
    """Train CatBoost cryptographic algorithm recommendation model"""
    np.random.seed(42)
    n_samples = 1000

    # Generate synthetic data
    X = np.random.rand(n_samples, 5) * 100
    y = np.random.randint(0, 6, n_samples)  # 6 algorithm options

    model = CatBoostClassifier(
        iterations=100,
        learning_rate=0.1,
        depth=6,
        verbose=False
    )
    model.fit(X, y)

    joblib.dump(model, 'models/crypto_algorithm_recommender.pkl')

    return model

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8015)
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
