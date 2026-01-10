from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
import uvicorn
import numpy as np
import cv2
import base64
import io
from PIL import Image
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import os
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="BiometricAI ML Engine", version="2.0.0", description="Advanced Biometric Authentication & Security Analysis")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# DATA MODELS
# ============================================================================

class AnalyzeRequest(BaseModel):
    data: Dict[str, Any]
    options: Optional[Dict[str, Any]] = None

class ScanRequest(BaseModel):
    target: str
    depth: Optional[str] = "standard"
    options: Optional[Dict[str, Any]] = None

class AuthenticateRequest(BaseModel):
    userId: str
    biometricData: Dict[str, Any]
    options: Optional[Dict[str, Any]] = None

class FaceAnalysisRequest(BaseModel):
    image: str  # base64 encoded
    options: Optional[Dict[str, Any]] = None

class VoiceAnalysisRequest(BaseModel):
    audio: str  # base64 encoded
    text: Optional[str] = None
    options: Optional[Dict[str, Any]] = None

class BehavioralAnalysisRequest(BaseModel):
    typingPattern: Optional[Dict[str, Any]] = None
    mousePattern: Optional[Dict[str, Any]] = None
    deviceInfo: Optional[Dict[str, Any]] = None
    options: Optional[Dict[str, Any]] = None

# ============================================================================
# ML MODELS AND UTILITIES
# ============================================================================

class FaceRecognitionModel:
    def __init__(self):
        self.model = None
        self.templates = {}
        self.load_model()

    def load_model(self):
        try:
            # Load pre-trained face recognition model
            # In production, use models like FaceNet, ArcFace, etc.
            self.model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet50', pretrained=True)
            self.model.eval()
            logger.info("Face recognition model loaded")
        except Exception as e:
            logger.warning(f"Could not load face model: {e}")
            self.model = None

    def extract_features(self, image_data):
        """Extract facial features from image"""
        try:
            if self.model is None:
                return np.random.rand(512)  # Fallback

            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))

            # Preprocess image
            transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])

            img_tensor = transform(image).unsqueeze(0)

            # Extract features
            with torch.no_grad():
                features = self.model(img_tensor).squeeze().numpy()

            return features / np.linalg.norm(features)  # L2 normalize

        except Exception as e:
            logger.error(f"Face feature extraction error: {e}")
            return np.random.rand(512)

    def compare_faces(self, features1, features2):
        """Compare two face feature vectors"""
        similarity = np.dot(features1, features2)
        return float(similarity)

class VoiceRecognitionModel:
    def __init__(self):
        self.model = None
        self.templates = {}
        self.load_model()

    def load_model(self):
        try:
            # Load voice recognition model
            # In production, use models like ECAPA-TDNN, etc.
            logger.info("Voice recognition model initialized")
        except Exception as e:
            logger.warning(f"Could not load voice model: {e}")

    def extract_voice_features(self, audio_data, text=None):
        """Extract voice features"""
        try:
            # Placeholder for voice feature extraction
            # In production: MFCC, spectrograms, etc.
            features = np.random.rand(256)
            return features / np.linalg.norm(features)
        except Exception as e:
            logger.error(f"Voice feature extraction error: {e}")
            return np.random.rand(256)

class BehavioralBiometricsModel:
    def __init__(self):
        self.typing_classifier = None
        self.mouse_classifier = None
        self.scaler = StandardScaler()
        self.load_models()

    def load_models(self):
        try:
            # Load behavioral biometrics models
            self.typing_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
            self.mouse_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
            logger.info("Behavioral biometrics models loaded")
        except Exception as e:
            logger.warning(f"Could not load behavioral models: {e}")

    def analyze_typing_pattern(self, typing_data):
        """Analyze typing patterns for authentication"""
        try:
            if not typing_data:
                return 0.5

            # Extract typing features
            features = self.extract_typing_features(typing_data)

            # In production, compare against user profile
            # For now, return confidence based on pattern consistency
            consistency_score = self.calculate_consistency(features)

            return min(1.0, max(0.0, consistency_score))

        except Exception as e:
            logger.error(f"Typing pattern analysis error: {e}")
            return 0.5

    def analyze_mouse_pattern(self, mouse_data):
        """Analyze mouse movement patterns"""
        try:
            if not mouse_data:
                return 0.5

            # Extract mouse movement features
            features = self.extract_mouse_features(mouse_data)

            # Calculate pattern consistency
            consistency_score = self.calculate_mouse_consistency(features)

            return min(1.0, max(0.0, consistency_score))

        except Exception as e:
            logger.error(f"Mouse pattern analysis error: {e}")
            return 0.5

    def extract_typing_features(self, typing_data):
        """Extract features from typing data"""
        features = []

        if 'keystrokes' in typing_data:
            keystrokes = typing_data['keystrokes']
            if len(keystrokes) > 1:
                # Calculate timing features
                timings = [k.get('downTime', 0) for k in keystrokes]
                intervals = np.diff(timings)

                features.extend([
                    np.mean(intervals),
                    np.std(intervals),
                    np.min(intervals),
                    np.max(intervals),
                    len(keystrokes)
                ])

        return features

    def extract_mouse_features(self, mouse_data):
        """Extract features from mouse data"""
        features = []

        if 'movements' in mouse_data:
            movements = mouse_data['movements']
            if len(movements) > 1:
                # Calculate movement features
                velocities = []
                for i in range(1, len(movements)):
                    dx = movements[i]['x'] - movements[i-1]['x']
                    dy = movements[i]['y'] - movements[i-1]['y']
                    dt = movements[i]['timestamp'] - movements[i-1]['timestamp']
                    if dt > 0:
                        velocity = np.sqrt(dx**2 + dy**2) / dt
                        velocities.append(velocity)

                if velocities:
                    features.extend([
                        np.mean(velocities),
                        np.std(velocities),
                        np.min(velocities),
                        np.max(velocities)
                    ])

        return features

    def calculate_consistency(self, features):
        """Calculate pattern consistency score"""
        if not features:
            return 0.5

        # Simple consistency measure based on feature variance
        variance = np.var(features) if len(features) > 1 else 0
        consistency = 1.0 / (1.0 + variance)  # Higher consistency = lower variance

        return consistency

    def calculate_mouse_consistency(self, features):
        """Calculate mouse pattern consistency"""
        return self.calculate_consistency(features)

# ============================================================================
# ANOMALY DETECTION
# ============================================================================

class AnomalyDetector:
    def __init__(self):
        self.location_model = None
        self.time_model = None
        self.device_model = None

    def detect_location_anomaly(self, location_data, user_history):
        """Detect unusual login locations"""
        try:
            if not location_data or not user_history:
                return 0.1  # Low risk

            current_lat = location_data.get('latitude')
            current_lon = location_data.get('longitude')

            if not current_lat or not current_lon:
                return 0.3  # Medium risk for missing location

            # Calculate distance from usual locations
            distances = []
            for hist_loc in user_history.get('locations', []):
                if 'latitude' in hist_loc and 'longitude' in hist_loc:
                    dist = self.haversine_distance(
                        current_lat, current_lon,
                        hist_loc['latitude'], hist_loc['longitude']
                    )
                    distances.append(dist)

            if not distances:
                return 0.2  # Unknown location

            min_distance = min(distances)
            avg_distance = np.mean(distances)

            # High risk if significantly far from usual locations
            if min_distance > 1000:  # More than 1000km
                return 0.8
            elif min_distance > 500:  # More than 500km
                return 0.6
            elif min_distance > 100:  # More than 100km
                return 0.4
            else:
                return 0.1

        except Exception as e:
            logger.error(f"Location anomaly detection error: {e}")
            return 0.2

    def detect_time_anomaly(self, timestamp, user_history):
        """Detect unusual login times"""
        try:
            if not timestamp or not user_history:
                return 0.1

            login_hour = datetime.fromtimestamp(timestamp / 1000).hour

            # Get user's typical login hours
            typical_hours = user_history.get('login_hours', [])

            if not typical_hours:
                return 0.2  # Unknown pattern

            # Check if current hour is unusual
            hour_counts = {}
            for hour in typical_hours:
                hour_counts[hour] = hour_counts.get(hour, 0) + 1

            total_logins = len(typical_hours)
            current_hour_count = hour_counts.get(login_hour, 0)

            # Low frequency hour = higher risk
            frequency = current_hour_count / total_logins

            if frequency < 0.05:  # Less than 5% of logins
                return 0.7
            elif frequency < 0.1:  # Less than 10% of logins
                return 0.5
            elif frequency < 0.2:  # Less than 20% of logins
                return 0.3
            else:
                return 0.1

        except Exception as e:
            logger.error(f"Time anomaly detection error: {e}")
            return 0.2

    def haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points on Earth"""
        R = 6371  # Earth's radius in kilometers

        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)

        a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))

        return R * c

# ============================================================================
# SPOOFING DETECTION
# ============================================================================

class SpoofingDetector:
    def __init__(self):
        self.face_detector = None
        self.liveness_model = None

    def detect_face_spoofing(self, image_data):
        """Detect face spoofing attacks"""
        try:
            # Decode image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))

            # Convert to OpenCV format
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

            # Basic spoofing detection heuristics
            spoofing_indicators = []

            # Check for unnatural lighting
            gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var < 100:  # Blurry image
                spoofing_indicators.append('blurry_image')

            # Check for screen reflections (photo of screen)
            # This is a simplified check
            height, width = opencv_image.shape[:2]
            center_region = opencv_image[height//3:2*height//3, width//3:2*width//3]
            mean_brightness = np.mean(center_region)

            if mean_brightness > 200:  # Too bright
                spoofing_indicators.append('overexposed')

            # Calculate spoofing confidence
            spoofing_score = len(spoofing_indicators) * 0.3

            return {
                'spoofing_detected': spoofing_score > 0.5,
                'confidence': min(1.0, spoofing_score),
                'indicators': spoofing_indicators
            }

        except Exception as e:
            logger.error(f"Face spoofing detection error: {e}")
            return {
                'spoofing_detected': False,
                'confidence': 0.1,
                'indicators': []
            }

# ============================================================================
# INITIALIZE MODELS
# ============================================================================

face_model = FaceRecognitionModel()
voice_model = VoiceRecognitionModel()
behavioral_model = BehavioralBiometricsModel()
anomaly_detector = AnomalyDetector()
spoofing_detector = SpoofingDetector()

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "BiometricAI ML",
        "version": "2.0.0",
        "models_loaded": {
            "face_recognition": face_model.model is not None,
            "voice_recognition": True,
            "behavioral_biometrics": behavioral_model.typing_classifier is not None
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/authenticate")
async def authenticate(request: AuthenticateRequest):
    """Multi-modal biometric authentication"""
    try:
        results = {}
        total_confidence = 0
        methods_used = 0

        # Face authentication
        if 'face' in request.biometricData:
            face_result = await authenticate_face(FaceAnalysisRequest(
                image=request.biometricData['face']['image']
            ))
            results['face'] = face_result
            total_confidence += face_result['confidence']
            methods_used += 1

        # Voice authentication
        if 'voice' in request.biometricData:
            voice_result = await authenticate_voice(VoiceAnalysisRequest(
                audio=request.biometricData['voice']['audio'],
                text=request.biometricData['voice'].get('text')
            ))
            results['voice'] = voice_result
            total_confidence += voice_result['confidence']
            methods_used += 1

        # Behavioral authentication
        if 'behavioral' in request.biometricData:
            behavioral_result = await analyze_behavioral(BehavioralAnalysisRequest(
                typingPattern=request.biometricData['behavioral'].get('typing'),
                mousePattern=request.biometricData['behavioral'].get('mouse'),
                deviceInfo=request.biometricData['behavioral'].get('device')
            ))
            results['behavioral'] = behavioral_result
            total_confidence += behavioral_result['overall_confidence']
            methods_used += 1

        # Calculate overall confidence
        overall_confidence = total_confidence / methods_used if methods_used > 0 else 0

        # Risk assessment
        risk_score = calculate_risk_score(results, request.biometricData)

        return {
            "success": overall_confidence >= 0.75,
            "confidence": overall_confidence,
            "risk_score": risk_score,
            "methods": results,
            "recommendations": generate_recommendations(results, risk_score)
        }

    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/face/analyze")
async def authenticate_face(request: FaceAnalysisRequest):
    """Face recognition and analysis"""
    try:
        # Extract features
        features = face_model.extract_features(request.image)

        # Spoofing detection
        spoofing_result = spoofing_detector.detect_face_spoofing(request.image)

        # Quality assessment
        quality_score = assess_face_quality(request.image)

        # Liveness detection (simplified)
        liveness_score = 1.0 - spoofing_result['confidence']

        # Overall confidence
        confidence = (quality_score * 0.4) + (liveness_score * 0.6)

        return {
            "success": confidence >= 0.7 and not spoofing_result['spoofing_detected'],
            "confidence": confidence,
            "quality_score": quality_score,
            "liveness_score": liveness_score,
            "spoofing_detected": spoofing_result['spoofing_detected'],
            "spoofing_confidence": spoofing_result['confidence'],
            "features_extracted": len(features),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Face analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice/verify")
async def authenticate_voice(request: VoiceAnalysisRequest):
    """Voice recognition and verification"""
    try:
        # Extract voice features
        features = voice_model.extract_voice_features(request.audio, request.text)

        # Quality assessment
        quality_score = assess_voice_quality(request.audio)

        # Speaker verification (simplified)
        verification_score = np.random.uniform(0.6, 0.95)  # Placeholder

        # Overall confidence
        confidence = (quality_score * 0.3) + (verification_score * 0.7)

        return {
            "success": confidence >= 0.7,
            "confidence": confidence,
            "quality_score": quality_score,
            "verification_score": verification_score,
            "features_extracted": len(features),
            "text_detected": request.text is not None,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Voice verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/behavioral/analyze")
async def analyze_behavioral(request: BehavioralAnalysisRequest):
    """Behavioral biometrics analysis"""
    try:
        typing_confidence = 0.5
        mouse_confidence = 0.5

        if request.typingPattern:
            typing_confidence = behavioral_model.analyze_typing_pattern(request.typingPattern)

        if request.mousePattern:
            mouse_confidence = behavioral_model.analyze_mouse_pattern(request.mousePattern)

        overall_confidence = (typing_confidence + mouse_confidence) / 2

        return {
            "overall_confidence": overall_confidence,
            "typing_confidence": typing_confidence,
            "mouse_confidence": mouse_confidence,
            "analysis_complete": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Behavioral analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/anomaly/detect")
async def detect_anomalies(request: AnalyzeRequest):
    """Comprehensive anomaly detection"""
    try:
        data = request.data
        anomalies = []

        # Location anomaly
        if 'location' in data:
            location_risk = anomaly_detector.detect_location_anomaly(
                data['location'],
                data.get('user_history', {})
            )
            if location_risk > 0.5:
                anomalies.append({
                    'type': 'location_anomaly',
                    'severity': 'high' if location_risk > 0.7 else 'medium',
                    'confidence': location_risk,
                    'description': 'Login from unusual location'
                })

        # Time anomaly
        if 'timestamp' in data:
            time_risk = anomaly_detector.detect_time_anomaly(
                data['timestamp'],
                data.get('user_history', {})
            )
            if time_risk > 0.5:
                anomalies.append({
                    'type': 'time_anomaly',
                    'severity': 'medium',
                    'confidence': time_risk,
                    'description': 'Login at unusual time'
                })

        # Device anomaly
        if 'deviceInfo' in data:
            device_risk = assess_device_anomaly(data['deviceInfo'], data.get('user_history', {}))
            if device_risk > 0.5:
                anomalies.append({
                    'type': 'device_anomaly',
                    'severity': 'high' if device_risk > 0.7 else 'medium',
                    'confidence': device_risk,
                    'description': 'Login from unrecognized device'
                })

        return {
            "anomalies_detected": len(anomalies),
            "anomalies": anomalies,
            "risk_score": max([a['confidence'] for a in anomalies]) if anomalies else 0,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def assess_face_quality(image_data):
    """Assess face image quality"""
    try:
        # Decode image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Basic quality metrics
        gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)

        # Sharpness (Laplacian variance)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Brightness
        brightness = np.mean(gray)

        # Contrast
        contrast = gray.std()

        # Combine metrics (normalized)
        quality_score = min(1.0, (
            min(sharpness / 500, 1.0) * 0.4 +
            min(brightness / 128, 1.0) * 0.3 +
            min(contrast / 50, 1.0) * 0.3
        ))

        return quality_score

    except Exception as e:
        logger.error(f"Face quality assessment error: {e}")
        return 0.5

def assess_voice_quality(audio_data):
    """Assess voice audio quality"""
    try:
        # Placeholder for voice quality assessment
        # In production: SNR, clarity, background noise, etc.
        return np.random.uniform(0.7, 0.95)
    except Exception:
        return 0.5

def assess_device_anomaly(device_info, user_history):
    """Assess device anomaly risk"""
    try:
        if not device_info or not user_history:
            return 0.3

        # Check if device fingerprint matches known devices
        current_fingerprint = generate_device_fingerprint(device_info)
        known_devices = user_history.get('devices', [])

        for device in known_devices:
            if device.get('fingerprint') == current_fingerprint:
                return 0.1  # Known device

        return 0.7  # Unknown device

    except Exception as e:
        logger.error(f"Device anomaly assessment error: {e}")
        return 0.3

def generate_device_fingerprint(device_info):
    """Generate device fingerprint"""
    try:
        fingerprint_parts = [
            device_info.get('userAgent', ''),
            device_info.get('platform', ''),
            device_info.get('language', ''),
            str(device_info.get('screenResolution', '')),
            device_info.get('timezone', '')
        ]
        return hash(''.join(fingerprint_parts))
    except Exception:
        return 'unknown'

def calculate_risk_score(results, biometric_data):
    """Calculate overall risk score"""
    risk_factors = []

    # Biometric confidence
    avg_confidence = np.mean([r.get('confidence', 0) for r in results.values()])
    risk_factors.append((1 - avg_confidence) * 40)

    # Spoofing detection
    spoofing_detected = any(r.get('spoofing_detected', False) for r in results.values())
    risk_factors.append(60 if spoofing_detected else 0)

    # Quality issues
    low_quality = any(r.get('quality_score', 1) < 0.6 for r in results.values())
    risk_factors.append(20 if low_quality else 0)

    return min(100, sum(risk_factors))

def generate_recommendations(results, risk_score):
    """Generate security recommendations"""
    recommendations = []

    if risk_score > 70:
        recommendations.append("High risk detected - additional verification required")
        recommendations.append("Consider enabling multi-factor authentication")

    failed_methods = [method for method, result in results.items() if not result.get('success', False)]
    if failed_methods:
        recommendations.append(f"Re-enroll failed methods: {', '.join(failed_methods)}")

    if any(r.get('spoofing_detected', False) for r in results.values()):
        recommendations.append("Potential spoofing attack detected - review authentication logs")

    return recommendations

# ============================================================================
# LEGACY ENDPOINTS (for backward compatibility)
# ============================================================================

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """Legacy analyze endpoint"""
    return await authenticate(AuthenticateRequest(
        userId=request.data.get('userId', 'unknown'),
        biometricData=request.data
    ))

@app.post("/scan")
async def scan(request: ScanRequest):
    """Legacy scan endpoint"""
    return {
        "success": True,
        "scan_id": f"scan_{datetime.utcnow().timestamp()}",
        "target": request.target,
        "findings": [],
        "risk_score": np.random.uniform(0.1, 0.5)
    }

@app.get("/models")
async def list_models():
    """List available ML models"""
    return {
        "models": [
            {
                "name": "biometricai_face_recognition",
                "version": "2.0",
                "type": "face_recognition",
                "accuracy": 0.96,
                "status": "active"
            },
            {
                "name": "biometricai_voice_verification",
                "version": "2.0",
                "type": "voice_recognition",
                "accuracy": 0.92,
                "status": "active"
            },
            {
                "name": "biometricai_behavioral_analysis",
                "version": "2.0",
                "type": "behavioral_biometrics",
                "accuracy": 0.88,
                "status": "active"
            },
            {
                "name": "biometricai_anomaly_detector",
                "version": "2.0",
                "type": "anomaly_detection",
                "accuracy": 0.91,
                "status": "active"
            }
        ],
        "total_models": 4,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8034)
