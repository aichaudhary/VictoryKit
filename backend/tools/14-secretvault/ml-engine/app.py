"""
EncryptionManager ML Service
Port: 8014

Provides AI/ML capabilities for:
- Encryption pattern analysis
- Key usage analytics
- Anomaly detection in encryption operations
- Predictive key rotation
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
    title="EncryptionManager ML Service",
    description="AI/ML service for encryption intelligence and analytics",
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
db = client.encryptionmanager_db

# ML Models (will be loaded/initialized)
models = {}

# Pydantic models for API
class EncryptionLog(BaseModel):
    operation: str
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
    logs: List[EncryptionLog]
    threshold: Optional[float] = 0.95

class PredictionRequest(BaseModel):
    keyId: str
    currentUsage: int
    daysSinceCreation: int
    algorithm: str

class AlgorithmRecommendation(BaseModel):
    dataType: str
    securityLevel: str
    performanceNeeds: str
    complianceReqs: List[str]

@app.on_event("startup")
async def startup_event():
    """Initialize ML models and database connections"""
    print("🚀 Starting EncryptionManager ML Service...")

    # Initialize models directory
    os.makedirs("models", exist_ok=True)

    # Load or train models
    await initialize_models()

    print("✅ ML Service ready on port 8014")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Shutting down ML Service...")
    client.close()

async def initialize_models():
    """Initialize and load ML models"""
    global models

    # Anomaly detection model (XGBoost)
    try:
        models['anomaly_detector'] = joblib.load('models/anomaly_detector.pkl')
    except:
        print("📊 Training anomaly detection model...")
        models['anomaly_detector'] = await train_anomaly_detector()

    # Key rotation predictor (LightGBM)
    try:
        models['rotation_predictor'] = joblib.load('models/rotation_predictor.pkl')
    except:
        print("🔄 Training key rotation predictor...")
        models['rotation_predictor'] = await train_rotation_predictor()

    # Algorithm recommender (CatBoost)
    try:
        models['algorithm_recommender'] = joblib.load('models/algorithm_recommender.pkl')
    except:
        print("🧠 Training algorithm recommender...")
        models['algorithm_recommender'] = await train_algorithm_recommender()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "EncryptionManager ML",
        "models_loaded": list(models.keys()),
        "timestamp": datetime.utcnow()
    }

@app.post("/analyze/patterns")
async def analyze_encryption_patterns(request: AnomalyDetectionRequest):
    """Analyze encryption operation patterns for anomalies"""
    try:
        # Convert logs to DataFrame
        df = pd.DataFrame([log.dict() for log in request.logs])

        # Feature engineering
        features = await extract_features(df)

        # Predict anomalies
        anomaly_scores = models['anomaly_detector'].predict_proba(features)[:, 1]

        # Identify anomalies
        anomalies = []
        for i, score in enumerate(anomaly_scores):
            if score > request.threshold:
                anomalies.append({
                    "log_index": i,
                    "anomaly_score": float(score),
                    "log_data": request.logs[i].dict()
                })

        return {
            "total_logs": len(request.logs),
            "anomalies_detected": len(anomalies),
            "anomaly_rate": len(anomalies) / len(request.logs),
            "anomalies": anomalies,
            "recommendations": generate_anomaly_recommendations(anomalies)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern analysis failed: {str(e)}")

@app.post("/predict/rotation")
async def predict_key_rotation(request: PredictionRequest):
    """Predict optimal key rotation timing"""
    try:
        # Prepare features
        features = np.array([[
            request.currentUsage,
            request.daysSinceCreation,
            hash(request.algorithm) % 1000,  # Simple hash for algorithm
            request.currentUsage / max(request.daysSinceCreation, 1)  # Usage rate
        ]])

        # Predict rotation probability
        rotation_prob = models['rotation_predictor'].predict_proba(features)[0, 1]

        # Calculate recommended rotation date
        days_to_rotation = calculate_rotation_days(rotation_prob, request.daysSinceCreation)

        return {
            "key_id": request.keyId,
            "rotation_probability": float(rotation_prob),
            "recommended_rotation_days": days_to_rotation,
            "recommended_date": (datetime.utcnow() + timedelta(days=days_to_rotation)).isoformat(),
            "urgency": "high" if rotation_prob > 0.8 else "medium" if rotation_prob > 0.6 else "low",
            "rationale": generate_rotation_rationale(rotation_prob, request)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rotation prediction failed: {str(e)}")

@app.post("/recommend/algorithm")
async def recommend_algorithm(request: AlgorithmRecommendation):
    """Recommend optimal encryption algorithm"""
    try:
        # Prepare categorical features
        features = np.array([[
            hash(request.dataType) % 100,
            hash(request.securityLevel) % 100,
            hash(request.performanceNeeds) % 100,
            len(request.complianceReqs),
            sum(hash(req) % 10 for req in request.complianceReqs)
        ]])

        # Get recommendations
        recommendations = models['algorithm_recommender'].predict_proba(features)[0]

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
                "suitability_score": calculate_suitability_score(name, request)
            })

        # Sort by combined score
        algo_recommendations.sort(key=lambda x: x['suitability_score'], reverse=True)

        return {
            "recommendations": algo_recommendations[:3],
            "analysis": analyze_algorithm_choice(request),
            "implementation_notes": get_implementation_notes(algo_recommendations[0]['algorithm'])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Algorithm recommendation failed: {str(e)}")

@app.get("/analytics/key-usage/{key_id}")
async def get_key_usage_analytics(key_id: str, days: int = 30):
    """Get key usage analytics"""
    try:
        # Query encryption logs
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

        results = await db.encryptionlogs.aggregate(pipeline).to_list(length=None)

        # Process results
        analytics = {
            "key_id": key_id,
            "period_days": days,
            "total_operations": sum(r['count'] for r in results),
            "daily_stats": [],
            "patterns": await detect_usage_patterns(results),
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
        analytics["recommendations"] = await generate_usage_recommendations(analytics)

        return analytics

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")

# Helper functions
async def extract_features(df: pd.DataFrame) -> np.ndarray:
    """Extract features for anomaly detection"""
    features = []

    for _, row in df.iterrows():
        # Basic features
        feature_vector = [
            row['dataSize'],
            1 if row['success'] else 0,
            row.get('responseTime', 0),
            hash(row['algorithm']) % 100,
            hash(row['userId']) % 100,
            hash(row['keyId']) % 100
        ]

        # Time-based features
        hour = row['timestamp'].hour
        feature_vector.extend([
            hour,  # Hour of day
            1 if hour < 6 or hour > 22 else 0,  # Off-hours flag
            row['timestamp'].weekday()  # Day of week
        ])

        features.append(feature_vector)

    return np.array(features)

def generate_anomaly_recommendations(anomalies: List[Dict]) -> List[str]:
    """Generate recommendations based on detected anomalies"""
    recommendations = []

    if len(anomalies) > 10:
        recommendations.append("High anomaly rate detected. Consider reviewing access controls.")

    if any(a['log_data']['success'] == False for a in anomalies):
        recommendations.append("Failed operations detected. Check key validity and permissions.")

    if anomalies:
        recommendations.append("Implement additional monitoring for suspicious patterns.")

    return recommendations

def calculate_rotation_days(probability: float, days_since_creation: int) -> int:
    """Calculate recommended days until rotation"""
    base_rotation_days = 90  # 90 days standard

    if probability > 0.8:
        return max(7, base_rotation_days - 60)  # Rotate soon
    elif probability > 0.6:
        return max(30, base_rotation_days - 30)  # Rotate moderately soon
    else:
        return max(base_rotation_days, days_since_creation + 30)  # Standard rotation

def generate_rotation_rationale(probability: float, request: PredictionRequest) -> str:
    """Generate explanation for rotation recommendation"""
    if probability > 0.8:
        return f"High rotation probability ({probability:.2%}) due to intensive usage ({request.currentUsage} operations)."
    elif probability > 0.6:
        return f"Moderate rotation probability ({probability:.2%}) based on usage patterns."
    else:
        return f"Low rotation probability ({probability:.2%}). Key can remain active longer."

def calculate_suitability_score(algorithm: str, request: AlgorithmRecommendation) -> float:
    """Calculate how suitable an algorithm is for the requirements"""
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
    compliance_keywords = ['GDPR', 'HIPAA', 'PCI']
    if any(keyword in ' '.join(request.complianceReqs) for keyword in compliance_keywords):
        if 'AES' in algorithm:
            score += 0.1

    return min(1.0, score)

def analyze_algorithm_choice(request: AlgorithmRecommendation) -> str:
    """Provide analysis of algorithm choice"""
    analysis = f"For {request.dataType} with {request.securityLevel} security requirements"

    if request.performanceNeeds == 'high':
        analysis += " and high performance needs"
    if request.complianceReqs:
        analysis += f", considering {', '.join(request.complianceReqs)} compliance"

    analysis += ", the recommendations prioritize security, performance, and compliance alignment."

    return analysis

def get_implementation_notes(algorithm: str) -> str:
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

async def detect_usage_patterns(results: List[Dict]) -> Dict[str, Any]:
    """Detect patterns in key usage"""
    patterns = {
        "peak_hours": [],
        "unusual_activity": False,
        "usage_trends": "stable"
    }

    # Simple pattern detection logic
    if results:
        total_ops = sum(r['count'] for r in results)
        avg_daily = total_ops / max(len(set(r['_id']['date'] for r in results)), 1)

        if avg_daily > 1000:
            patterns["usage_trends"] = "high"
        elif avg_daily < 10:
            patterns["usage_trends"] = "low"

    return patterns

async def generate_usage_recommendations(analytics: Dict) -> List[str]:
    """Generate recommendations based on usage analytics"""
    recommendations = []

    if analytics.get('patterns', {}).get('usage_trends') == 'high':
        recommendations.append("High usage detected. Consider implementing rate limiting.")

    if analytics['total_operations'] > 10000:
        recommendations.append("Consider key rotation due to high usage volume.")

    return recommendations

# Model training functions (simplified for demo)
async def train_anomaly_detector():
    """Train XGBoost anomaly detection model"""
    # Generate synthetic training data
    np.random.seed(42)
    n_samples = 1000

    # Normal operations
    normal_data = np.random.normal([1000, 1, 50, 50, 50, 50, 12, 0, 2],
                                   [200, 0.1, 20, 10, 10, 10, 4, 0.2, 1],
                                   (int(n_samples * 0.9), 9))

    # Anomalous operations
    anomaly_data = np.random.normal([5000, 0.3, 200, 80, 80, 80, 3, 0.8, 5],
                                    [1000, 0.3, 50, 20, 20, 20, 2, 0.2, 2],
                                    (int(n_samples * 0.1), 9))

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
    joblib.dump(model, 'models/anomaly_detector.pkl')

    return model

async def train_rotation_predictor():
    """Train LightGBM rotation prediction model"""
    np.random.seed(42)
    n_samples = 1000

    # Generate synthetic data
    X = np.random.rand(n_samples, 4) * np.array([10000, 365, 1000, 100])
    y = (X[:, 0] / np.maximum(X[:, 1], 1) > 50).astype(int)  # High usage rate indicates rotation need

    model = lgb.LGBMClassifier(
        objective='binary',
        num_leaves=31,
        learning_rate=0.1,
        n_estimators=100
    )
    model.fit(X, y)

    joblib.dump(model, 'models/rotation_predictor.pkl')

    return model

async def train_algorithm_recommender():
    """Train CatBoost algorithm recommendation model"""
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

    joblib.dump(model, 'models/algorithm_recommender.pkl')

    return model

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8014)</content>
<parameter name="filePath">/workspaces/VictoryKit/backend/tools/14-encryptionmanager/ml-engine/app.py