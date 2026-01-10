"""
DataLossPrevention ML Engine
AI-powered data classification, PII detection, anomaly detection, and content analysis
Port: 8041
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Tuple, Any
import numpy as np
from datetime import datetime
import hashlib
import re
import json
import pickle
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
from collections import Counter
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DataLossPrevention ML Engine", version="2.0.0")

# CORS configuration
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

class ClassificationRequest(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None
    file_path: Optional[str] = None

class ClassificationResponse(BaseModel):
    classification: str
    confidence: float
    data_types: List[Dict[str, Any]]
    risk_score: int
    recommendations: List[str]

class PIIDetectionRequest(BaseModel):
    content: str
    detect_types: Optional[List[str]] = None

class PIIDetectionResponse(BaseModel):
    pii_found: bool
    detections: List[Dict[str, Any]]
    total_instances: int
    confidence: float

class AnomalyDetectionRequest(BaseModel):
    user_id: str
    activity: Dict[str, Any]

class AnomalyDetectionResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    risk_level: str
    anomalies_detected: List[Dict[str, str]]

class ContentSimilarityRequest(BaseModel):
    content1: str
    content2: str

class ContentSimilarityResponse(BaseModel):
    similarity_score: float
    is_duplicate: bool
    is_derivative: bool

class PolicyMatchRequest(BaseModel):
    content: str
    policy_patterns: List[str]

class PolicyMatchResponse(BaseModel):
    matched: bool
    matched_patterns: List[str]
    confidence: float

# ============================================================================
# ML MODELS & UTILITIES
# ============================================================================

@app.get("/")
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'DataLossPrevention-ML',
        'version': '1.0.0',
        'models': {
            'presidio_analyzer': get_presidio_analyzer() is not None,
            'presidio_anonymizer': get_presidio_anonymizer() is not None
        }
    })


@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze content for sensitive data using ML models
    """
    try:
        data = request.json
        content = data.get('content', '')
        language = data.get('language', 'en')
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        analyzer_engine = get_presidio_analyzer()
        findings = []
        
        if analyzer_engine:
            # Use Presidio for PII detection
            results = analyzer_engine.analyze(
                text=content,
                language=language,
                entities=[
                    "PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", 
                    "CREDIT_CARD", "US_SSN", "US_BANK_NUMBER",
                    "US_DRIVER_LICENSE", "US_PASSPORT", "US_ITIN",
                    "IBAN_CODE", "IP_ADDRESS", "MEDICAL_LICENSE",
                    "DATE_TIME", "LOCATION", "NRP", "ORGANIZATION"
                ]
            )
            
            for result in results:
                findings.append({
                    'type': result.entity_type,
                    'score': result.score,
                    'start': result.start,
                    'end': result.end,
                    'value': content[result.start:result.end] if result.score > 0.85 else '[REDACTED]',
                    'severity': get_severity(result.entity_type, result.score)
                })
        else:
            # Fallback to basic pattern matching
            findings = basic_pii_detection(content)
        
        return jsonify({
            'success': True,
            'findings': findings,
            'totalFindings': len(findings),
            'riskScore': calculate_risk_score(findings)
        })
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/anonymize', methods=['POST'])
def anonymize():
    """
    Anonymize/redact sensitive data in content
    """
    try:
        data = request.json
        content = data.get('content', '')
        operators = data.get('operators', {})  # Custom anonymization operators
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        analyzer_engine = get_presidio_analyzer()
        anonymizer_engine = get_presidio_anonymizer()
        
        if analyzer_engine and anonymizer_engine:
            # First analyze
            results = analyzer_engine.analyze(text=content, language='en')
            
            # Then anonymize
            anonymized = anonymizer_engine.anonymize(
                text=content,
                analyzer_results=results
            )
            
            return jsonify({
                'success': True,
                'originalLength': len(content),
                'anonymizedText': anonymized.text,
                'itemsAnonymized': len(results)
            })
        else:
            # Basic redaction fallback
            redacted = basic_redaction(content)
            return jsonify({
                'success': True,
                'anonymizedText': redacted,
                'warning': 'Using basic redaction - Presidio not available'
            })
            
    except Exception as e:
        logger.error(f"Anonymization error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/classify', methods=['POST'])
def classify():
    """
    Classify document sensitivity level using ML
    """
    try:
        data = request.json
        content = data.get('content', '')
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        # Analyze for sensitive data
        analyzer_engine = get_presidio_analyzer()
        
        if analyzer_engine:
            results = analyzer_engine.analyze(text=content, language='en')
            
            # Calculate classification based on findings
            classification = determine_classification(results)
            
            return jsonify({
                'success': True,
                'classification': classification['level'],
                'confidence': classification['confidence'],
                'reason': classification['reason'],
                'findings': len(results)
            })
        else:
            # Basic classification
            return jsonify({
                'success': True,
                'classification': 'internal',
                'confidence': 0.5,
                'reason': 'ML models not available - default classification',
                'findings': 0
            })
            
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/scan-document', methods=['POST'])
def scan_document():
    """
    Comprehensive document scan with ML-enhanced detection
    """
    try:
        data = request.json
        content = data.get('content', '')
        document_type = data.get('documentType', 'text')
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        # Multi-layer analysis
        results = {
            'pii_detection': [],
            'keyword_detection': [],
            'pattern_detection': [],
            'classification': None
        }
        
        # PII Detection
        analyzer_engine = get_presidio_analyzer()
        if analyzer_engine:
            pii_results = analyzer_engine.analyze(text=content, language='en')
            results['pii_detection'] = [{
                'type': r.entity_type,
                'score': r.score,
                'start': r.start,
                'end': r.end
            } for r in pii_results]
        
        # Keyword detection for business-sensitive terms
        keywords = detect_sensitive_keywords(content)
        results['keyword_detection'] = keywords
        
        # Pattern detection for compliance (HIPAA, PCI, etc.)
        patterns = detect_compliance_patterns(content)
        results['pattern_detection'] = patterns
        
        # Overall classification
        results['classification'] = calculate_document_classification(results)
        
        return jsonify({
            'success': True,
            'documentType': document_type,
            'results': results,
            'overallRisk': results['classification']['riskScore']
        })
        
    except Exception as e:
        logger.error(f"Document scan error: {str(e)}")
        return jsonify({'error': str(e)}), 500


def get_severity(entity_type, score):
    """Map entity type and score to severity level"""
    critical_types = ['US_SSN', 'CREDIT_CARD', 'US_BANK_NUMBER', 'US_PASSPORT']
    high_types = ['US_DRIVER_LICENSE', 'IBAN_CODE', 'MEDICAL_LICENSE', 'US_ITIN']
    medium_types = ['PERSON', 'EMAIL_ADDRESS', 'PHONE_NUMBER', 'DATE_TIME']
    
    if entity_type in critical_types:
        return 'critical' if score > 0.8 else 'high'
    elif entity_type in high_types:
        return 'high' if score > 0.8 else 'medium'
    elif entity_type in medium_types:
        return 'medium' if score > 0.7 else 'low'
    return 'low'


def calculate_risk_score(findings):
    """Calculate overall risk score from findings"""
    if not findings:
        return 0
    
    severity_weights = {
        'critical': 40,
        'high': 25,
        'medium': 15,
        'low': 5
    }
    
    total_score = sum(severity_weights.get(f.get('severity', 'low'), 5) for f in findings)
    return min(100, total_score)


def determine_classification(results):
    """Determine document classification based on analysis results"""
    if not results:
        return {'level': 'public', 'confidence': 0.9, 'reason': 'No sensitive data detected'}
    
    critical_count = sum(1 for r in results if r.entity_type in ['US_SSN', 'CREDIT_CARD', 'US_BANK_NUMBER'])
    high_count = sum(1 for r in results if r.entity_type in ['US_DRIVER_LICENSE', 'IBAN_CODE', 'MEDICAL_LICENSE'])
    
    if critical_count > 0:
        return {
            'level': 'restricted',
            'confidence': 0.95,
            'reason': f'Contains {critical_count} critical PII elements'
        }
    elif high_count > 0:
        return {
            'level': 'confidential',
            'confidence': 0.85,
            'reason': f'Contains {high_count} sensitive PII elements'
        }
    elif len(results) > 0:
        return {
            'level': 'internal',
            'confidence': 0.75,
            'reason': f'Contains {len(results)} PII elements'
        }
    
    return {'level': 'public', 'confidence': 0.7, 'reason': 'Minimal sensitive data'}


def basic_pii_detection(content):
    """Basic regex-based PII detection as fallback"""
    import re
    findings = []
    
    # SSN pattern
    ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'
    for match in re.finditer(ssn_pattern, content):
        findings.append({
            'type': 'US_SSN',
            'score': 0.9,
            'start': match.start(),
            'end': match.end(),
            'severity': 'critical'
        })
    
    # Credit card pattern
    cc_pattern = r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b'
    for match in re.finditer(cc_pattern, content):
        findings.append({
            'type': 'CREDIT_CARD',
            'score': 0.85,
            'start': match.start(),
            'end': match.end(),
            'severity': 'critical'
        })
    
    # Email pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    for match in re.finditer(email_pattern, content):
        findings.append({
            'type': 'EMAIL_ADDRESS',
            'score': 0.95,
            'start': match.start(),
            'end': match.end(),
            'severity': 'medium'
        })
    
    return findings


def basic_redaction(content):
    """Basic redaction as fallback"""
    import re
    
    # Redact SSN
    content = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN REDACTED]', content)
    
    # Redact credit cards
    content = re.sub(r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b', '[CC REDACTED]', content)
    
    # Redact emails
    content = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL REDACTED]', content)
    
    return content


def detect_sensitive_keywords(content):
    """Detect business-sensitive keywords"""
    keywords = []
    
    sensitive_terms = [
        ('confidential', 'high'),
        ('secret', 'critical'),
        ('proprietary', 'high'),
        ('internal only', 'medium'),
        ('restricted', 'high'),
        ('classified', 'critical'),
        ('trade secret', 'critical'),
        ('nda', 'high'),
        ('attorney-client', 'critical'),
        ('hipaa', 'high'),
        ('pci', 'high'),
        ('gdpr', 'medium'),
        ('salary', 'medium'),
        ('compensation', 'medium'),
        ('social security', 'critical'),
        ('password', 'critical'),
        ('api key', 'critical'),
        ('private key', 'critical')
    ]
    
    content_lower = content.lower()
    for term, severity in sensitive_terms:
        if term in content_lower:
            keywords.append({
                'keyword': term,
                'severity': severity,
                'count': content_lower.count(term)
            })
    
    return keywords


def detect_compliance_patterns(content):
    """Detect compliance-related patterns"""
    import re
    patterns = []
    
    # HIPAA - Medical terms
    medical_terms = ['diagnosis', 'patient', 'medical record', 'prescription', 'treatment']
    medical_count = sum(1 for term in medical_terms if term in content.lower())
    if medical_count >= 2:
        patterns.append({
            'compliance': 'HIPAA',
            'confidence': min(0.9, 0.3 * medical_count),
            'reason': f'Found {medical_count} medical-related terms'
        })
    
    # PCI-DSS - Payment card data
    if re.search(r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b', content):
        patterns.append({
            'compliance': 'PCI-DSS',
            'confidence': 0.95,
            'reason': 'Credit card number pattern detected'
        })
    
    # GDPR - EU personal data
    gdpr_terms = ['gdpr', 'data subject', 'right to be forgotten', 'data controller']
    gdpr_count = sum(1 for term in gdpr_terms if term in content.lower())
    if gdpr_count >= 1:
        patterns.append({
            'compliance': 'GDPR',
            'confidence': min(0.85, 0.25 * gdpr_count),
            'reason': f'Found {gdpr_count} GDPR-related terms'
        })
    
    return patterns


def calculate_document_classification(results):
    """Calculate overall document classification from all detection results"""
    risk_score = 0
    
    # PII contribution
    pii_count = len(results.get('pii_detection', []))
    risk_score += min(50, pii_count * 10)
    
    # Keyword contribution
    for kw in results.get('keyword_detection', []):
        if kw['severity'] == 'critical':
            risk_score += 15
        elif kw['severity'] == 'high':
            risk_score += 10
        else:
            risk_score += 5
    
    # Compliance pattern contribution
    for pattern in results.get('pattern_detection', []):
        risk_score += int(pattern['confidence'] * 20)
    
    risk_score = min(100, risk_score)
    
    # Determine classification level
    if risk_score >= 80:
        level = 'restricted'
    elif risk_score >= 60:
        level = 'confidential'
    elif risk_score >= 30:
        level = 'internal'
    else:
        level = 'public'
    
    return {
        'level': level,
        'riskScore': risk_score,
        'confidence': min(0.95, 0.5 + (risk_score / 200))
    }


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8041))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting DataLossPrevention ML Engine on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
