# ContainerScan - Multi-Modal Biometric Authentication System

![ContainerScan Banner](https://img.shields.io/badge/Tool%2034-ContainerScan-8b5cf6?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

## 🔐 Overview

**ContainerScan** is an enterprise-grade multi-modal biometric authentication platform that provides secure identity verification using face recognition, fingerprint matching, voice authentication, iris scanning, behavioral biometrics, and palm recognition. Powered by AI for real-time quality analysis, spoof detection, and adaptive authentication.

### Key Features

- 🎭 **Six Biometric Modalities**: Face, Fingerprint, Voice, Iris, Behavioral, Palm
- 🛡️ **Advanced Security**: Liveness detection, anti-spoofing, cancelable templates
- 🤖 **AI-Powered Analysis**: Real-time quality assessment and threat detection
- 🔄 **Adaptive Authentication**: Context-aware security level adjustment
- 📊 **Compliance Ready**: GDPR, CCPA, BIPA, ISO 24745, ISO 30107, NIST 800-63B
- ⚡ **Real-time Processing**: WebSocket-based streaming responses

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ContainerScan System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │   Frontend   │  │   Backend    │  │    AI Assistant       │  │
│  │   Port 3034  │  │   Port 4034  │  │    Port 6034          │  │
│  │              │  │              │  │                       │  │
│  │ • React/TS   │  │ • Express.js │  │ • WebSocket Server    │  │
│  │ • Vite       │  │ • MongoDB    │  │ • Gemini 1.5 Pro      │  │
│  │ • Tailwind   │  │ • REST API   │  │ • 10 AI Functions     │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                       │              │
│         └─────────────────┴───────────────────────┘              │
│                           │                                      │
│                    ┌──────┴──────┐                               │
│                    │   MongoDB   │                               │
│                    │ containerscan │                               │
│                    │    _db      │                               │
│                    └─────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
34-containerscan/
├── api/                          # Backend API
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   └── index.js
│   │   ├── models/               # MongoDB schemas
│   │   │   ├── UserBiometricProfile.model.js
│   │   │   ├── BiometricSession.model.js
│   │   │   └── BiometricAlert.model.js
│   │   ├── routes/               # API routes
│   │   │   └── index.js
│   │   ├── services/             # Business logic
│   │   │   └── biometricService.js
│   │   └── middleware/           # Express middleware
│   │       └── biometricAuth.middleware.js
│   └── package.json
│
├── ai-assistant/                 # AI WebSocket Service
│   ├── src/
│   │   ├── server.js             # WebSocket server
│   │   └── functionExecutor.js   # AI function handlers
│   └── package.json
│
└── frontend/                     # React Frontend (see /frontend/tools/34-containerscan)
    ├── src/
    │   └── services/
    │       ├── biometricAPI.ts   # REST API client
    │       ├── aiService.ts      # WebSocket AI client
    │       └── config.ts         # Configuration loader
    ├── containerscan-config.json   # Tool configuration
    ├── index.html
    ├── vite.config.ts
    ├── nginx.conf
    └── package.json
```

## 🎭 Biometric Modalities

### 1. Face Recognition
- **Detection Model**: RetinaFace with 68 landmark points
- **Recognition Model**: ArcFace embeddings (512-dimensional)
- **Liveness Detection**: Passive + Active (blink, smile, head turn)
- **Anti-Spoofing**: Photo, video, mask, deepfake detection

### 2. Fingerprint Authentication
- **Supported Fingers**: All 10 fingers
- **Sensor Types**: Optical, capacitive, ultrasonic
- **Minutiae Extraction**: Ridge endings, bifurcations, loops, whorls
- **NFIQ Quality**: Threshold 2 (scale 1-5)

### 3. Voice Verification
- **Enrollment**: Minimum 3 phrases, 3+ seconds each
- **Modes**: Text-dependent and text-independent
- **Features**: MFCC, pitch, formants, spectral analysis
- **Anti-Spoofing**: Replay and synthesis detection

### 4. Iris Recognition
- **Resolution**: 640x480 minimum
- **Algorithm**: IrisCode with Hamming distance
- **Template Size**: 2048 bits
- **Quality Checks**: Focus, pupil dilation, occlusion

### 5. Behavioral Biometrics
- **Typing Dynamics**: Keystroke timing, dwell time, flight time
- **Mouse Patterns**: Velocity, curvature, click patterns
- **Touch Gestures**: Pressure, swipe patterns
- **Continuous Monitoring**: Real-time behavioral analysis

### 6. Palm Recognition
- **Regions**: Full palm, major lines, vein patterns
- **Infrared Scanning**: Vein pattern detection
- **Palm Print**: Principal lines and wrinkles

## 🔒 Security Features

### Encryption
- **Template Encryption**: AES-256-GCM
- **Transport Security**: TLS 1.3
- **Key Management**: HSM integration ready

### Privacy Protection
- **Cancelable Biometrics**: Revocable templates
- **Template Protection**: BioHashing
- **Data Minimization**: Store only necessary data
- **Retention Policies**: Configurable auto-deletion

### Access Control
- **RBAC**: Role-based access control
- **Session Timeout**: Configurable (default 30 minutes)
- **Failed Attempts**: Max 5 with 15-minute lockout
- **MFA Required**: For administrative access

## 🤖 AI Functions

The AI assistant provides 10 intelligent functions:

| Function | Description |
|----------|-------------|
| `biometric_quality_analyzer` | Analyze sample quality, identify issues, provide recommendations |
| `spoof_detection_engine` | Detect presentation attacks (photo, video, mask, synthetic) |
| `liveness_verification` | Verify live presence with passive/active challenges |
| `match_score_calculator` | Calculate match scores with fusion support |
| `behavioral_pattern_analyzer` | Analyze typing, mouse, touch patterns |
| `risk_assessment_engine` | Assess authentication risk, recommend actions |
| `template_optimizer` | Optimize template quality and storage |
| `authentication_advisor` | Recommend modality based on context |
| `compliance_checker` | Check compliance with regulatory frameworks |
| `anomaly_detector` | Detect unusual patterns and threats |

## 📊 Matching Thresholds

| Modality | Low Security | Medium | High Security |
|----------|-------------|--------|---------------|
| Face | 0.55 | 0.65 | 0.75 |
| Fingerprint | 0.60 | 0.70 | 0.80 |
| Voice | 0.50 | 0.60 | 0.70 |
| Iris | 0.80 | 0.85 | 0.90 |
| Behavioral | 0.60 | 0.70 | 0.80 |
| Palm | 0.65 | 0.75 | 0.85 |

## 🛠️ API Endpoints

### Enrollment
```
POST   /api/enroll           - Enroll biometric sample
PUT    /api/enroll/:userId   - Update biometric profile
DELETE /api/enroll/:userId   - Delete biometric profile
```

### Authentication
```
POST   /api/auth/biometric   - Single modality authentication
POST   /api/auth/mfa         - Multi-factor authentication
```

### Profile Management
```
GET    /api/profile/:userId          - Get biometric profile
GET    /api/sessions/:userId         - Get authentication sessions
```

### Analysis
```
POST   /api/analyze/quality   - Analyze sample quality
POST   /api/analyze/spoof     - Detect spoofing attempts
POST   /api/analyze/liveness  - Verify liveness
POST   /api/analyze/anomalies - Detect anomalies
```

### Alerts & Reports
```
GET    /api/alerts            - Get security alerts
POST   /api/alerts/:id/acknowledge - Acknowledge alert
GET    /api/reports           - Get reports
POST   /api/reports/generate  - Generate report
```

## 📋 Compliance Frameworks

### GDPR (General Data Protection Regulation)
- ✅ Lawful basis for processing
- ✅ Consent management
- ✅ Right to erasure
- ✅ Data portability
- ✅ Privacy by design
- ✅ Security measures
- ✅ Data Protection Impact Assessment

### CCPA (California Consumer Privacy Act)
- ✅ Right to know
- ✅ Right to delete
- ✅ Opt-out rights

### BIPA (Biometric Information Privacy Act)
- ✅ Written policy
- ✅ Informed consent
- ✅ Prohibition on sale
- ✅ Secure storage
- ✅ Data protection

### ISO 24745 (Biometric Template Protection)
- ✅ Template protection
- ✅ Irreversibility
- ⚠️ Unlinkability (partial)

### ISO 30107 (Presentation Attack Detection)
- ✅ PAD framework
- ✅ PAD performance testing

### NIST 800-63B
- ✅ AAL2/AAL3 authenticator requirements
- ✅ Biometric FAR/FRR thresholds
- ✅ Liveness detection (PAD)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Installation

```bash
# Backend API
cd backend/tools/34-containerscan/api
npm install
npm run dev

# AI Assistant
cd backend/tools/34-containerscan/ai-assistant
npm install
npm run dev

# Frontend
cd frontend/tools/34-containerscan
npm install
npm run dev
```

### Environment Variables

```env
# API Configuration
API_PORT=4034
MONGODB_URI=mongodb://localhost:27017/containerscan_db

# AI Assistant
AI_PORT=6034
GEMINI_API_KEY=your_gemini_api_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

## 🌐 Port Allocation

| Service | Port |
|---------|------|
| Frontend | 3034 |
| Backend API | 4034 |
| AI WebSocket | 6034 |
| ML Service | 8034 |

## 🎨 Theme

- **Primary Color**: Purple/Violet (`#8b5cf6`)
- **Secondary**: Slate (`#475569`)
- **Accent**: Indigo (`#6366f1`)
- **Background**: Slate Dark (`#0f172a`)
- **Surface**: Slate (`#1e293b`)

## 📄 Database Schema

### UserBiometricProfile
```javascript
{
  userId: String,
  profiles: {
    face: { enrolled: Boolean, templates: [...], settings: {...} },
    fingerprint: { enrolled: Boolean, templates: [...], settings: {...} },
    voice: { enrolled: Boolean, templates: [...], settings: {...} },
    iris: { enrolled: Boolean, templates: [...], settings: {...} },
    behavioral: { enrolled: Boolean, templates: [...], settings: {...} },
    palm: { enrolled: Boolean, templates: [...], settings: {...} }
  },
  settings: {
    defaultModality: String,
    mfaEnabled: Boolean,
    mfaModalities: [String],
    adaptiveAuth: Boolean,
    continuousAuth: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### BiometricSession
```javascript
{
  userId: String,
  modality: String,
  action: 'enrollment' | 'authentication' | 'verification',
  status: 'success' | 'failure' | 'pending' | 'suspicious',
  matchScore: Number,
  livenessScore: Number,
  spoofDetected: Boolean,
  deviceInfo: {...},
  location: {...},
  timestamp: Date,
  duration: Number
}
```

### BiometricAlert
```javascript
{
  type: 'spoof_attempt' | 'multiple_failures' | 'anomaly' | 'device_change' | 'location_change',
  severity: 'low' | 'medium' | 'high' | 'critical',
  userId: String,
  message: String,
  details: {...},
  timestamp: Date,
  acknowledged: Boolean
}
```

## 📞 WebSocket Events

### Client → Server
```javascript
// Send chat message
{ type: 'message', content: 'string', stream: boolean }

// Call AI function
{ type: 'function_call', id: 'string', function: { name: 'string', parameters: {...} } }

// Ping
{ type: 'ping' }
```

### Server → Client
```javascript
// Connection confirmed
{ type: 'connected', connectionId: 'string', availableFunctions: [...] }

// Chat response
{ type: 'message', message: { id, role, content, timestamp } }

// Streaming response
{ type: 'stream', id: 'string', content: 'string', isComplete: boolean }

// Function result
{ type: 'function_result', id: 'string', function: 'string', success: boolean, data: {...} }

// Error
{ type: 'error', error: 'string' }
```

## 🔗 Integration

### Identity Providers
- SAML 2.0
- OAuth 2.0
- OpenID Connect
- LDAP/Active Directory

### Platforms
- AWS, Azure, GCP
- Kubernetes
- Docker

### SDKs
- Web (JavaScript/TypeScript)
- iOS (Swift)
- Android (Kotlin)
- React Native
- Flutter

## 📈 Metrics

- **FAR (False Accept Rate)**: Target < 0.001%
- **FRR (False Reject Rate)**: Target < 1%
- **EER (Equal Error Rate)**: Target < 0.5%
- **FTE (Failure to Enroll)**: Target < 0.5%
- **FTA (Failure to Acquire)**: Target < 1%

## 📄 License

Proprietary - VictoryKit / Maula.AI

## 🤝 Support

For support, contact the ContainerScan team or open an issue in the repository.

---

**ContainerScan** - Secure Multi-Modal Biometric Authentication Platform
*Part of the VictoryKit Security Suite*
