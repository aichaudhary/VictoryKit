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
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AuditTrail ML Engine - FINAL TOOL",
    description="AI-powered compliance risk analysis and audit anomaly detection",
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
class AuditLogData(BaseModel):
    eventType: str
    severity: str
    sourceIP: Optional[str] = None
    userId: Optional[str] = None
    action: str
    resource: Optional[str] = None
    success: bool = True
    complianceFrameworks: List[str] = []
    timestamp: Optional[str] = None

class ComplianceAssessment(BaseModel):
    framework: str
    logs: List[AuditLogData]
    assessmentPeriod: Dict[str, str]

class AnomalyDetectionResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    confidence: float
    risk_level: str
    classification: str
    compliance_implications: List[str]
    recommendations: List[str]

class ComplianceRiskPrediction(BaseModel):
    framework: str
    current_risk_score: float
    predicted_risk_score: float
    risk_trend: str
    time_to_violation: Optional[int] = None
    critical_findings: List[str]
    mitigation_steps: List[str]

class AuditAnalytics(BaseModel):
    total_events: int
    anomaly_rate: float
    compliance_scores: Dict[str, float]
    risk_distribution: Dict[str, int]
    top_violations: List[Dict[str, Any]]
    predictive_insights: Dict[str, Any]

# ML Models class
class AuditTrailMLModels:
    def __init__(self):
        self.models_dir = "models"
        os.makedirs(self.models_dir, exist_ok=True)

        # Initialize models
        self.isolation_forest = None
        self.rf_classifier = None
        self.xgb_classifier = None
        self.lgb_classifier = None
        self.catboost_classifier = None
        self.compliance_predictor = None
        self.scaler = StandardScaler()
        self.label_encoders = {}

        # Cryptographic keys for integrity verification
        self.private_key = None
        self.public_key = None
        self.load_or_generate_keys()

        # Load or train models
        self.load_or_train_models()

    def load_or_generate_keys(self):
        """Load or generate cryptographic keys for audit integrity"""
        private_key_path = os.path.join(self.models_dir, 'private_key.pem')
        public_key_path = os.path.join(self.models_dir, 'public_key.pem')

        if os.path.exists(private_key_path) and os.path.exists(public_key_path):
            # Load existing keys
            with open(private_key_path, 'rb') as f:
                self.private_key = serialization.load_pem_private_key(f.read(), password=None)
            with open(public_key_path, 'rb') as f:
                self.public_key = serialization.load_pem_public_key(f.read())
        else:
            # Generate new keys
            self.private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048
            )
            self.public_key = self.private_key.public_key()

            # Save keys
            private_pem = self.private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            )
            public_pem = self.public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )

            with open(private_key_path, 'wb') as f:
                f.write(private_pem)
            with open(public_key_path, 'wb') as f:
                f.write(public_pem)

    def load_or_train_models(self):
        """Load existing models or train new ones"""
        try:
            # Try to load existing models
            self.load_models()
            logger.info("Loaded existing AuditTrail ML models")
        except:
            # Train new models if loading fails
            logger.info("Training new AuditTrail ML models...")
            self.train_models()

    def load_models(self):
        """Load pre-trained models"""
        model_files = {
            'isolation_forest': 'isolation_forest.joblib',
            'rf_classifier': 'rf_classifier.joblib',
            'xgb_classifier': 'xgb_classifier.joblib',
            'lgb_classifier': 'lgb_classifier.joblib',
            'catboost_classifier': 'catboost_classifier.joblib',
            'compliance_predictor': 'compliance_predictor.joblib',
            'scaler': 'scaler.joblib'
        }

        for model_name, filename in model_files.items():
            filepath = os.path.join(self.models_dir, filename)
            if os.path.exists(filepath):
                setattr(self, model_name, joblib.load(filepath))

    def train_models(self):
        """Train ML models with synthetic audit trail data"""
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 10000

        # Create synthetic audit data
        data = {
            'event_type': np.random.choice(['login', 'logout', 'file_access', 'data_export', 'config_change', 'failed_login'], n_samples),
            'severity': np.random.choice(['low', 'medium', 'high', 'critical'], n_samples, p=[0.6, 0.25, 0.1, 0.05]),
            'user_id': np.random.randint(1, 1000, n_samples),
            'source_ip': [f"192.168.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}" for _ in range(n_samples)],
            'action_success': np.random.choice([True, False], n_samples, p=[0.95, 0.05]),
            'resource_type': np.random.choice(['file', 'database', 'network', 'system', 'application'], n_samples),
            'time_of_day': np.random.randint(0, 24, n_samples),
            'is_compliance_violation': np.random.choice([0, 1], n_samples, p=[0.85, 0.15]),
            'risk_score': np.random.exponential(0.5, n_samples),
            'anomaly_score': np.random.exponential(0.3, n_samples)
        }

        df = pd.DataFrame(data)

        # Encode categorical variables
        categorical_cols = ['event_type', 'severity', 'source_ip', 'resource_type']
        for col in categorical_cols:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            self.label_encoders[col] = le

        # Prepare features for anomaly detection
        feature_cols = ['event_type', 'severity', 'user_id', 'source_ip', 'action_success',
                       'resource_type', 'time_of_day', 'risk_score']
        X = df[feature_cols]
        y = df['is_compliance_violation']

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Train Isolation Forest for anomaly detection
        self.isolation_forest = IsolationForest(
            contamination=0.15,
            random_state=42,
            n_estimators=100
        )
        self.isolation_forest.fit(X_scaled)

        # Train Random Forest Classifier for compliance violations
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
            random_state=42,
            scale_pos_weight=len(y)/(2*sum(y))  # Handle class imbalance
        )
        self.xgb_classifier.fit(X_scaled, y)

        # Train LightGBM Classifier
        self.lgb_classifier = lgb.LGBMClassifier(
            objective='binary',
            n_estimators=100,
            learning_rate=0.1,
            num_leaves=31,
            random_state=42,
            class_weight='balanced'
        )
        self.lgb_classifier.fit(X_scaled, y)

        # Train CatBoost Classifier
        self.catboost_classifier = CatBoostClassifier(
            iterations=100,
            learning_rate=0.1,
            depth=6,
            verbose=False,
            random_state=42,
            auto_class_weights='Balanced'
        )
        self.catboost_classifier.fit(X_scaled, y, verbose=False)

        # Train compliance risk predictor (regression)
        self.compliance_predictor = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        self.compliance_predictor.fit(X_scaled, df['risk_score'])

        # Save models
        self.save_models()
        logger.info("AuditTrail ML models trained and saved successfully")

    def save_models(self):
        """Save trained models"""
        models_to_save = {
            'isolation_forest': self.isolation_forest,
            'rf_classifier': self.rf_classifier,
            'xgb_classifier': self.xgb_classifier,
            'lgb_classifier': self.lgb_classifier,
            'catboost_classifier': self.catboost_classifier,
            'compliance_predictor': self.compliance_predictor,
            'scaler': self.scaler
        }

        for model_name, model in models_to_save.items():
            filepath = os.path.join(self.models_dir, f'{model_name}.joblib')
            joblib.dump(model, filepath)

    def preprocess_audit_data(self, audit_data: AuditLogData) -> np.ndarray:
        """Preprocess audit data for ML models"""
        # Extract features
        features = {
            'event_type': audit_data.eventType,
            'severity': audit_data.severity,
            'user_id': hash(audit_data.userId or 'anonymous') % 10000,
            'source_ip': audit_data.sourceIP or '0.0.0.0',
            'action_success': 1 if audit_data.success else 0,
            'resource_type': audit_data.resource or 'unknown',
            'time_of_day': datetime.now().hour if not audit_data.timestamp else datetime.fromisoformat(audit_data.timestamp.replace('Z', '+00:00')).hour,
            'risk_score': 0.5  # Default risk score
        }

        # Convert to DataFrame
        df = pd.DataFrame([features])

        # Encode categorical variables
        for col in ['event_type', 'severity', 'source_ip', 'resource_type']:
            if col in self.label_encoders:
                df[col] = self.label_encoders[col].transform(df[col])
            else:
                df[col] = 0  # Default encoding

        # Scale features
        scaled_features = self.scaler.transform(df)
        return scaled_features

    def detect_anomaly(self, audit_data: AuditLogData) -> AnomalyDetectionResult:
        """Detect audit log anomalies"""
        try:
            features = self.preprocess_audit_data(audit_data)

            # Get anomaly scores from multiple models
            iso_score = self.isolation_forest.decision_function(features)[0]
            rf_prob = self.rf_classifier.predict_proba(features)[0][1]
            xgb_prob = self.xgb_classifier.predict_proba(features)[0][1]
            lgb_prob = self.lgb_classifier.predict_proba(features)[0][1]
            cat_prob = self.catboost_classifier.predict_proba(features)[0][1]

            # Ensemble anomaly score
            ensemble_score = np.mean([iso_score, rf_prob, xgb_prob, lgb_prob, cat_prob])

            # Determine if anomaly
            is_anomaly = ensemble_score > 0.65
            confidence = min(ensemble_score * 100, 100)

            # Determine risk level
            if ensemble_score > 0.8:
                risk_level = 'critical'
            elif ensemble_score > 0.7:
                risk_level = 'high'
            elif ensemble_score > 0.6:
                risk_level = 'medium'
            else:
                risk_level = 'low'

            # Classify anomaly type
            compliance_implications = []
            recommendations = []

            if audit_data.eventType == 'failed_login' and not audit_data.success:
                classification = "Authentication failure pattern"
                compliance_implications.extend(['SOX 404', 'ISO 27001 A.9', 'NIST AC-2'])
                recommendations.extend([
                    'Implement account lockout policies',
                    'Enable multi-factor authentication',
                    'Monitor for brute force attacks'
                ])
            elif audit_data.severity == 'critical':
                classification = "Critical security event"
                compliance_implications.extend(['GDPR Article 33', 'HIPAA Security Rule', 'PCI-DSS 12.10'])
                recommendations.extend([
                    'Immediate incident response activation',
                    'Preserve digital evidence',
                    'Notify compliance officer'
                ])
            elif audit_data.eventType == 'data_export' and audit_data.resource:
                classification = "Sensitive data access"
                compliance_implications.extend(['GDPR Article 30', 'HIPAA Privacy Rule', 'PCI-DSS 10.2'])
                recommendations.extend([
                    'Verify data export authorization',
                    'Implement data loss prevention',
                    'Review data handling procedures'
                ])
            else:
                classification = "General audit anomaly"
                recommendations.extend([
                    'Review user access patterns',
                    'Verify system configuration',
                    'Check for policy violations'
                ])

            return AnomalyDetectionResult(
                is_anomaly=is_anomaly,
                anomaly_score=float(ensemble_score),
                confidence=float(confidence),
                risk_level=risk_level,
                classification=classification,
                compliance_implications=compliance_implications,
                recommendations=recommendations
            )

        except Exception as e:
            logger.error(f"Anomaly detection error: {e}")
            return AnomalyDetectionResult(
                is_anomaly=False,
                anomaly_score=0.0,
                confidence=0.0,
                risk_level='unknown',
                classification="Analysis error",
                compliance_implications=[],
                recommendations=["Please try again or contact support"]
            )

    def predict_compliance_risk(self, framework: str, historical_data: List[AuditLogData]) -> ComplianceRiskPrediction:
        """Predict compliance risk for a specific framework"""
        try:
            if not historical_data:
                return ComplianceRiskPrediction(
                    framework=framework,
                    current_risk_score=0.5,
                    predicted_risk_score=0.5,
                    risk_trend='stable',
                    critical_findings=[],
                    mitigation_steps=['Insufficient data for analysis']
                )

            # Analyze historical patterns
            violation_count = sum(1 for log in historical_data
                                if not log.success or log.severity in ['high', 'critical'])
            total_events = len(historical_data)
            current_risk = violation_count / total_events if total_events > 0 else 0

            # Simple trend prediction (in production, use time series analysis)
            predicted_risk = min(current_risk * 1.1, 1.0)  # Assume slight increase

            # Determine risk trend
            if predicted_risk > current_risk * 1.2:
                risk_trend = 'increasing'
                time_to_violation = 30  # days
            elif predicted_risk < current_risk * 0.8:
                risk_trend = 'decreasing'
                time_to_violation = None
            else:
                risk_trend = 'stable'
                time_to_violation = None

            # Generate critical findings
            critical_findings = []
            if current_risk > 0.3:
                critical_findings.append(f"High violation rate: {current_risk:.1%}")
            if violation_count > total_events * 0.2:
                critical_findings.append("Excessive security events detected")

            # Generate mitigation steps
            mitigation_steps = []
            if framework == 'GDPR':
                mitigation_steps.extend([
                    'Implement data protection impact assessments',
                    'Enhance data subject access request procedures',
                    'Strengthen data breach notification processes'
                ])
            elif framework == 'HIPAA':
                mitigation_steps.extend([
                    'Review and update security risk analysis',
                    'Implement technical safeguards for ePHI',
                    'Enhance workforce training programs'
                ])
            elif framework == 'PCI-DSS':
                mitigation_steps.extend([
                    'Strengthen network segmentation',
                    'Implement file integrity monitoring',
                    'Regular security testing and scanning'
                ])

            return ComplianceRiskPrediction(
                framework=framework,
                current_risk_score=float(current_risk),
                predicted_risk_score=float(predicted_risk),
                risk_trend=risk_trend,
                time_to_violation=time_to_violation,
                critical_findings=critical_findings,
                mitigation_steps=mitigation_steps
            )

        except Exception as e:
            logger.error(f"Compliance risk prediction error: {e}")
            return ComplianceRiskPrediction(
                framework=framework,
                current_risk_score=0.5,
                predicted_risk_score=0.5,
                risk_trend='unknown',
                critical_findings=['Analysis error occurred'],
                mitigation_steps=['Contact support for detailed analysis']
            )

    def generate_audit_analytics(self, audit_logs: List[AuditLogData]) -> AuditAnalytics:
        """Generate comprehensive audit analytics"""
        try:
            total_events = len(audit_logs)
            if total_events == 0:
                return AuditAnalytics(
                    total_events=0,
                    anomaly_rate=0.0,
                    compliance_scores={},
                    risk_distribution={'low': 0, 'medium': 0, 'high': 0, 'critical': 0},
                    top_violations=[],
                    predictive_insights={}
                )

            # Analyze anomalies
            anomaly_results = [self.detect_anomaly(log) for log in audit_logs]
            anomaly_count = sum(1 for result in anomaly_results if result.is_anomaly)
            anomaly_rate = anomaly_count / total_events

            # Compliance scores by framework
            compliance_scores = {}
            frameworks = set()
            for log in audit_logs:
                frameworks.update(log.complianceFrameworks)

            for framework in frameworks:
                framework_logs = [log for log in audit_logs if framework in log.complianceFrameworks]
                if framework_logs:
                    violations = sum(1 for log in framework_logs if not log.success or log.severity in ['high', 'critical'])
                    compliance_scores[framework] = 1.0 - (violations / len(framework_logs))

            # Risk distribution
            risk_distribution = {'low': 0, 'medium': 0, 'high': 0, 'critical': 0}
            for result in anomaly_results:
                risk_distribution[result.risk_level] = risk_distribution.get(result.risk_level, 0) + 1

            # Top violations
            violation_counts = {}
            for result in anomaly_results:
                if result.is_anomaly:
                    violation_counts[result.classification] = violation_counts.get(result.classification, 0) + 1

            top_violations = [
                {'violation': k, 'count': v, 'percentage': v/total_events}
                for k, v in sorted(violation_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            ]

            # Predictive insights
            predictive_insights = {
                'risk_trend': 'stable',
                'predicted_anomalies_next_week': int(anomaly_count * 1.2),
                'compliance_improvement_needed': any(score < 0.8 for score in compliance_scores.values()),
                'critical_attention_required': risk_distribution.get('critical', 0) > 5
            }

            return AuditAnalytics(
                total_events=total_events,
                anomaly_rate=float(anomaly_rate),
                compliance_scores=compliance_scores,
                risk_distribution=risk_distribution,
                top_violations=top_violations,
                predictive_insights=predictive_insights
            )

        except Exception as e:
            logger.error(f"Audit analytics generation error: {e}")
            return AuditAnalytics(
                total_events=len(audit_logs),
                anomaly_rate=0.0,
                compliance_scores={},
                risk_distribution={'low': 0, 'medium': 0, 'high': 0, 'critical': 0},
                top_violations=[],
                predictive_insights={'error': 'Analysis failed'}
            )

    def verify_audit_integrity(self, audit_log: Dict[str, Any]) -> Dict[str, Any]:
        """Verify the cryptographic integrity of an audit log"""
        try:
            # Recalculate hash of the log data
            log_data = {k: v for k, v in audit_log.items() if k not in ['integrity', 'chainHash']}
            log_string = json.dumps(log_data, sort_keys=True)
            calculated_hash = hashlib.sha256(log_string.encode()).hexdigest()

            # Verify signature if present
            signature_valid = False
            if 'signature' in audit_log.get('integrity', {}):
                try:
                    signature = bytes.fromhex(audit_log['integrity']['signature'])
                    self.public_key.verify(
                        signature,
                        calculated_hash.encode(),
                        padding.PSS(
                            mgf=padding.MGF1(hashes.SHA256()),
                            salt_length=padding.PSS.MAX_LENGTH
                        ),
                        hashes.SHA256()
                    )
                    signature_valid = True
                except:
                    signature_valid = False

            # Check hash integrity
            stored_hash = audit_log.get('integrity', {}).get('hash', '')
            hash_integrity = calculated_hash == stored_hash

            return {
                'integrity_verified': hash_integrity and signature_valid,
                'hash_integrity': hash_integrity,
                'signature_valid': signature_valid,
                'calculated_hash': calculated_hash,
                'stored_hash': stored_hash,
                'tamper_detected': not (hash_integrity and signature_valid)
            }

        except Exception as e:
            logger.error(f"Integrity verification error: {e}")
            return {
                'integrity_verified': False,
                'error': str(e),
                'tamper_detected': True
            }

# Initialize ML models
ml_models = AuditTrailMLModels()

@app.get("/")
async def root():
    return {"message": "AuditTrail ML Engine API - FINAL TOOL", "version": "1.0.0"}

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
            ml_models.catboost_classifier is not None,
            ml_models.compliance_predictor is not None
        ]),
        "cryptographic_keys_loaded": ml_models.private_key is not None and ml_models.public_key is not None
    }

@app.post("/analyze/anomaly", response_model=AnomalyDetectionResult)
async def analyze_anomaly(audit_log: AuditLogData):
    """Analyze single audit log entry for anomalies"""
    return ml_models.detect_anomaly(audit_log)

@app.post("/predict/compliance-risk", response_model=ComplianceRiskPrediction)
async def predict_compliance_risk(assessment: ComplianceAssessment):
    """Predict compliance risk for a framework"""
    return ml_models.predict_compliance_risk(assessment.framework, assessment.logs)

@app.post("/analytics/audit", response_model=AuditAnalytics)
async def generate_audit_analytics(audit_logs: List[AuditLogData]):
    """Generate comprehensive audit analytics"""
    return ml_models.generate_audit_analytics(audit_logs)

@app.post("/verify/integrity")
async def verify_audit_integrity(audit_log: Dict[str, Any]):
    """Verify cryptographic integrity of audit log"""
    return ml_models.verify_audit_integrity(audit_log)

@app.post("/assess/compliance")
async def assess_compliance_batch(assessment: ComplianceAssessment):
    """Perform comprehensive compliance assessment"""
    try:
        # Analyze all logs for anomalies
        anomaly_results = [ml_models.detect_anomaly(log) for log in assessment.logs]

        # Generate compliance prediction
        risk_prediction = ml_models.predict_compliance_risk(assessment.framework, assessment.logs)

        # Generate overall analytics
        analytics = ml_models.generate_audit_analytics(assessment.logs)

        # Calculate compliance score
        total_logs = len(assessment.logs)
        anomalous_logs = sum(1 for result in anomaly_results if result.is_anomaly)
        compliance_score = 1.0 - (anomalous_logs / total_logs) if total_logs > 0 else 1.0

        return {
            "framework": assessment.framework,
            "assessment_period": assessment.assessmentPeriod,
            "compliance_score": float(compliance_score),
            "total_logs_analyzed": total_logs,
            "anomalous_logs": anomalous_logs,
            "anomaly_rate": float(anomalous_logs / total_logs) if total_logs > 0 else 0.0,
            "risk_prediction": risk_prediction.dict(),
            "analytics": analytics.dict(),
            "critical_findings": [
                finding for result in anomaly_results
                for finding in result.compliance_implications
                if result.is_anomaly
            ][:10],  # Top 10 critical findings
            "recommendations": list(set([
                rec for result in anomaly_results
                for rec in result.recommendations
                if result.is_anomaly
            ]))[:10],  # Top 10 unique recommendations
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance assessment error: {str(e)}")

@app.post("/retrain")
async def retrain_models(background_tasks: BackgroundTasks):
    """Retrain ML models with new data"""
    background_tasks.add_task(ml_models.train_models)
    return {"message": "AuditTrail ML models retraining started in background"}

if __name__ == "__main__":
    port = int(os.getenv("ML_PORT", 8017))
    uvicorn.run(app, host="0.0.0.0", port=port)


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
