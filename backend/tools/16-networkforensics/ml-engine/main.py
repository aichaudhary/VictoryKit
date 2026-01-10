from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
import os
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier
import uvicorn
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NetworkMonitor ML Engine",
    description="AI-powered network traffic analysis and anomaly detection",
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

# Data models
class TrafficData(BaseModel):
    sourceIP: str
    destinationIP: str
    sourcePort: int
    destinationPort: int
    protocol: str
    packetSize: int
    timestamp: Optional[str] = None
    sessionId: Optional[str] = None
    deviceId: Optional[str] = None

class TrafficBatch(BaseModel):
    traffic_data: List[TrafficData]

class PredictionRequest(BaseModel):
    features: Dict[str, Any]

class AnomalyDetectionResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    confidence: float
    classification: str
    recommendations: List[str]

class NetworkInsights(BaseModel):
    total_traffic: int
    anomaly_rate: float
    top_protocols: Dict[str, int]
    peak_hours: List[int]
    risk_score: float
    predictions: Dict[str, Any]

# ML Models class
class NetworkMLModels:
    def __init__(self):
        self.models_dir = "models"
        os.makedirs(self.models_dir, exist_ok=True)

        # Initialize models
        self.isolation_forest = None
        self.rf_classifier = None
        self.xgb_classifier = None
        self.lgb_classifier = None
        self.catboost_classifier = None
        self.scaler = StandardScaler()
        self.label_encoders = {}

        # Load or train models
        self.load_or_train_models()

    def load_or_train_models(self):
        """Load existing models or train new ones"""
        try:
            # Try to load existing models
            self.load_models()
            logger.info("Loaded existing ML models")
        except:
            # Train new models if loading fails
            logger.info("Training new ML models...")
            self.train_models()

    def load_models(self):
        """Load pre-trained models"""
        model_files = {
            'isolation_forest': 'isolation_forest.joblib',
            'rf_classifier': 'rf_classifier.joblib',
            'xgb_classifier': 'xgb_classifier.joblib',
            'lgb_classifier': 'lgb_classifier.joblib',
            'catboost_classifier': 'catboost_classifier.joblib',
            'scaler': 'scaler.joblib'
        }

        for model_name, filename in model_files.items():
            filepath = os.path.join(self.models_dir, filename)
            if os.path.exists(filepath):
                setattr(self, model_name, joblib.load(filepath))

    def train_models(self):
        """Train ML models with synthetic network traffic data"""
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 10000

        # Create synthetic network traffic features
        data = {
            'packet_size': np.random.exponential(1000, n_samples),
            'source_port': np.random.choice([80, 443, 22, 3389, 53, 25, 110, 143], n_samples),
            'dest_port': np.random.choice([80, 443, 22, 3389, 53, 25, 110, 143], n_samples),
            'protocol': np.random.choice(['TCP', 'UDP', 'HTTP', 'HTTPS'], n_samples),
            'duration': np.random.exponential(10, n_samples),
            'bytes_sent': np.random.exponential(5000, n_samples),
            'bytes_received': np.random.exponential(8000, n_samples),
            'packets_sent': np.random.poisson(50, n_samples),
            'packets_received': np.random.poisson(80, n_samples),
            'is_anomaly': np.random.choice([0, 1], n_samples, p=[0.95, 0.05])
        }

        df = pd.DataFrame(data)

        # Encode categorical variables
        for col in ['protocol']:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            self.label_encoders[col] = le

        # Prepare features
        feature_cols = ['packet_size', 'source_port', 'dest_port', 'protocol',
                       'duration', 'bytes_sent', 'bytes_received', 'packets_sent', 'packets_received']
        X = df[feature_cols]
        y = df['is_anomaly']

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Train Isolation Forest for anomaly detection
        self.isolation_forest = IsolationForest(
            contamination=0.05,
            random_state=42,
            n_estimators=100
        )
        self.isolation_forest.fit(X_scaled)

        # Train Random Forest Classifier
        self.rf_classifier = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            class_weight='balanced'
        )
        self.rf_classifier.fit(X_scaled, y)

        # Train XGBoost Classifier
        self.xgb_classifier = xgb.XGBClassifier(
            objective='binary:logistic',
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        self.xgb_classifier.fit(X_scaled, y)

        # Train LightGBM Classifier
        self.lgb_classifier = lgb.LGBMClassifier(
            objective='binary',
            n_estimators=100,
            learning_rate=0.1,
            num_leaves=31,
            random_state=42
        )
        self.lgb_classifier.fit(X_scaled, y)

        # Train CatBoost Classifier
        self.catboost_classifier = CatBoostClassifier(
            iterations=100,
            learning_rate=0.1,
            depth=6,
            verbose=False,
            random_state=42
        )
        self.catboost_classifier.fit(X_scaled, y, verbose=False)

        # Save models
        self.save_models()
        logger.info("ML models trained and saved successfully")

    def save_models(self):
        """Save trained models"""
        models_to_save = {
            'isolation_forest': self.isolation_forest,
            'rf_classifier': self.rf_classifier,
            'xgb_classifier': self.xgb_classifier,
            'lgb_classifier': self.lgb_classifier,
            'catboost_classifier': self.catboost_classifier,
            'scaler': self.scaler
        }

        for model_name, model in models_to_save.items():
            filepath = os.path.join(self.models_dir, f'{model_name}.joblib')
            joblib.dump(model, filepath)

    def preprocess_traffic_data(self, traffic_data: TrafficData) -> np.ndarray:
        """Preprocess traffic data for ML models"""
        # Extract features
        features = {
            'packet_size': traffic_data.packetSize,
            'source_port': traffic_data.sourcePort,
            'dest_port': traffic_data.destinationPort,
            'protocol': traffic_data.protocol,
            'duration': 1.0,  # Default duration
            'bytes_sent': traffic_data.packetSize,
            'bytes_received': traffic_data.packetSize,
            'packets_sent': 1,
            'packets_received': 1
        }

        # Convert to DataFrame
        df = pd.DataFrame([features])

        # Encode categorical variables
        for col in ['protocol']:
            if col in self.label_encoders:
                df[col] = self.label_encoders[col].transform(df[col])
            else:
                df[col] = 0  # Default encoding

        # Scale features
        scaled_features = self.scaler.transform(df)
        return scaled_features

    def detect_anomaly(self, traffic_data: TrafficData) -> AnomalyDetectionResult:
        """Detect network traffic anomalies"""
        try:
            features = self.preprocess_traffic_data(traffic_data)

            # Get anomaly scores from multiple models
            iso_score = self.isolation_forest.decision_function(features)[0]
            rf_prob = self.rf_classifier.predict_proba(features)[0][1]
            xgb_prob = self.xgb_classifier.predict_proba(features)[0][1]
            lgb_prob = self.lgb_classifier.predict_proba(features)[0][1]
            cat_prob = self.catboost_classifier.predict_proba(features)[0][1]

            # Ensemble anomaly score
            ensemble_score = np.mean([iso_score, rf_prob, xgb_prob, lgb_prob, cat_prob])

            # Determine if anomaly
            is_anomaly = ensemble_score > 0.6
            confidence = min(ensemble_score * 100, 100)

            # Classify anomaly type
            if is_anomaly:
                if traffic_data.protocol.upper() in ['TCP', 'UDP'] and traffic_data.sourcePort in [22, 3389]:
                    classification = "Potential unauthorized access attempt"
                elif traffic_data.packetSize > 10000:
                    classification = "Large packet transfer"
                elif traffic_data.sourcePort == traffic_data.destinationPort:
                    classification = "Port scanning activity"
                else:
                    classification = "Suspicious traffic pattern"
            else:
                classification = "Normal traffic"

            # Generate recommendations
            recommendations = []
            if is_anomaly:
                if "access" in classification.lower():
                    recommendations.extend([
                        "Review access logs for the source IP",
                        "Check if the access attempt was authorized",
                        "Consider blocking the source IP temporarily"
                    ])
                elif "scanning" in classification.lower():
                    recommendations.extend([
                        "Monitor for additional scanning activity",
                        "Implement rate limiting for the target port",
                        "Review firewall rules"
                    ])
                else:
                    recommendations.extend([
                        "Investigate the traffic source and destination",
                        "Check for unusual network behavior patterns",
                        "Review recent security alerts"
                    ])

            return AnomalyDetectionResult(
                is_anomaly=is_anomaly,
                anomaly_score=float(ensemble_score),
                confidence=float(confidence),
                classification=classification,
                recommendations=recommendations
            )

        except Exception as e:
            logger.error(f"Anomaly detection error: {e}")
            return AnomalyDetectionResult(
                is_anomaly=False,
                anomaly_score=0.0,
                confidence=0.0,
                classification="Error in analysis",
                recommendations=["Please try again or contact support"]
            )

    def analyze_traffic_batch(self, traffic_batch: TrafficBatch) -> Dict[str, Any]:
        """Analyze a batch of traffic data"""
        results = []
        anomaly_count = 0

        for traffic in traffic_batch.traffic_data:
            result = self.detect_anomaly(traffic)
            results.append({
                'traffic': traffic.dict(),
                'analysis': result.dict()
            })
            if result.is_anomaly:
                anomaly_count += 1

        # Calculate batch statistics
        total_traffic = len(traffic_batch.traffic_data)
        anomaly_rate = anomaly_count / total_traffic if total_traffic > 0 else 0

        # Protocol distribution
        protocols = {}
        for traffic in traffic_batch.traffic_data:
            proto = traffic.protocol
            protocols[proto] = protocols.get(proto, 0) + 1

        return {
            'total_analyzed': total_traffic,
            'anomalies_detected': anomaly_count,
            'anomaly_rate': anomaly_rate,
            'protocol_distribution': protocols,
            'results': results
        }

    def get_network_insights(self, historical_data: Optional[List[Dict]] = None) -> NetworkInsights:
        """Generate network insights and predictions"""
        # Mock insights - in real implementation, use historical data
        insights = NetworkInsights(
            total_traffic=10000,
            anomaly_rate=0.05,
            top_protocols={"TCP": 4500, "UDP": 3200, "HTTP": 1500, "HTTPS": 800},
            peak_hours=[9, 10, 11, 14, 15, 16],
            risk_score=0.3,
            predictions={
                "next_hour_traffic": 1200,
                "expected_anomalies": 8,
                "network_load_prediction": "moderate",
                "security_recommendations": [
                    "Monitor TCP traffic on port 22",
                    "Review large packet transfers",
                    "Check for unusual protocol usage"
                ]
            }
        )

        return insights

# Initialize ML models
ml_models = NetworkMLModels()

@app.get("/")
async def root():
    return {"message": "NetworkMonitor ML Engine API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": all([
            ml_models.isolation_forest is not None,
            ml_models.rf_classifier is not None,
            ml_models.xgb_classifier is not None,
            ml_models.lgb_classifier is not None,
            ml_models.catboost_classifier is not None
        ])
    }

@app.post("/analyze/traffic", response_model=AnomalyDetectionResult)
async def analyze_traffic(traffic: TrafficData):
    """Analyze single traffic entry for anomalies"""
    return ml_models.detect_anomaly(traffic)

@app.post("/analyze/batch")
async def analyze_traffic_batch(traffic_batch: TrafficBatch):
    """Analyze batch of traffic data"""
    return ml_models.analyze_traffic_batch(traffic_batch)

@app.get("/insights", response_model=NetworkInsights)
async def get_network_insights():
    """Get network insights and predictions"""
    return ml_models.get_network_insights()

@app.post("/predict")
async def predict_from_features(request: PredictionRequest):
    """Make prediction from raw features"""
    try:
        # Convert features to numpy array
        features = np.array([list(request.features.values())])

        # Get predictions from all models
        predictions = {}

        if ml_models.isolation_forest:
            predictions['isolation_forest'] = ml_models.isolation_forest.decision_function(features)[0]

        if ml_models.rf_classifier:
            rf_pred = ml_models.rf_classifier.predict_proba(features)[0]
            predictions['random_forest'] = {'normal': rf_pred[0], 'anomaly': rf_pred[1]}

        if ml_models.xgb_classifier:
            xgb_pred = ml_models.xgb_classifier.predict_proba(features)[0]
            predictions['xgboost'] = {'normal': xgb_pred[0], 'anomaly': xgb_pred[1]}

        if ml_models.lgb_classifier:
            lgb_pred = ml_models.lgb_classifier.predict_proba(features)[0]
            predictions['lightgbm'] = {'normal': lgb_pred[0], 'anomaly': lgb_pred[1]}

        if ml_models.catboost_classifier:
            cat_pred = ml_models.catboost_classifier.predict_proba(features)[0]
            predictions['catboost'] = {'normal': cat_pred[0], 'anomaly': cat_pred[1]}

        return {
            "predictions": predictions,
            "ensemble_score": np.mean([p if isinstance(p, (int, float)) else p.get('anomaly', 0) for p in predictions.values()]),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/retrain")
async def retrain_models(background_tasks: BackgroundTasks):
    """Retrain ML models with new data"""
    background_tasks.add_task(ml_models.train_models)
    return {"message": "Model retraining started in background"}

if __name__ == "__main__":
    port = int(os.getenv("ML_PORT", 8016))
    uvicorn.run(app, host="0.0.0.0", port=port)