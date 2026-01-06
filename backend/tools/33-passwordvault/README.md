# PasswordVault - AI-Powered Enterprise Password & Secrets Management

**Tool #33** | Port: 3033 (Frontend) | 4033 (API) | 6033 (AI) | 8033 (ML)

> Secure vault-based password and secrets management with zero-knowledge encryption, multi-factor authentication, and AI-powered security assistance.

## 🌐 Access URLs

- **Frontend**: `https://passwordvault.maula.ai` (Production) | `http://localhost:3033` (Development)
- **API**: `http://localhost:4033/api`
- **AI Assistant**: `ws://localhost:6033/maula-ai`
- **ML Engine**: `http://localhost:8033`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [AI Functions](#ai-functions)
7. [Security](#security)
8. [Getting Started](#getting-started)
9. [Configuration](#configuration)

---

## 🎯 Overview

PasswordVault is an enterprise-grade password and secrets management solution that provides:

- **Zero-Knowledge Architecture**: Client-side encryption ensures only you can access your secrets
- **Multi-Factor Authentication**: Hardware keys, TOTP, biometrics, and more
- **Team Collaboration**: Secure sharing with role-based access control
- **AI Security Assistant**: Real-time help with password generation, audits, and best practices
- **Compliance Ready**: NIST, SOC2, ISO 27001, PCI-DSS, HIPAA, GDPR

### Secret Types Supported

| Type | Icon | Use Case |
|------|------|----------|
| Password | 🔑 | Login credentials |
| API Key | 💻 | Developer keys and secrets |
| Certificate | 📜 | SSL/TLS certificates |
| SSH Key | 🖥️ | Server access keys |
| Database | 🗄️ | Database credentials |
| Token | 🎫 | Access & refresh tokens |
| Credit Card | 💳 | Payment information |
| Identity | 🪪 | ID documents |
| Secure Note | 📝 | Encrypted notes |
| WiFi | 📶 | Network credentials |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     passwordvault.maula.ai                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Vite)              Port: 3033   │
│  ├── Dashboard                                                   │
│  ├── Vault Management                                            │
│  ├── Secret Browser                                              │
│  ├── Password Generator                                          │
│  ├── Security Audit                                              │
│  ├── Sharing Center                                              │
│  └── Maula AI Interface (/maula-ai)                             │
├─────────────────────────────────────────────────────────────────┤
│  API Gateway (Express.js)                          Port: 4033   │
│  ├── /api/auth         - Authentication                         │
│  ├── /api/vaults       - Vault CRUD & sharing                   │
│  ├── /api/secrets      - Secret management                      │
│  ├── /api/audit        - Activity logging                       │
│  ├── /api/organizations - Team management                       │
│  └── /api/generate-password - Password generation               │
├─────────────────────────────────────────────────────────────────┤
│  AI Assistant (WebSocket + Gemini 1.5 Pro)         Port: 6033   │
│  └── Real-time password help & security guidance                │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database                                                │
│  └── passwordvault_db                                            │
│      ├── users                                                   │
│      ├── organizations                                           │
│      ├── vaults                                                  │
│      ├── secrets                                                 │
│      └── accesslogs                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Core Features
- ✅ **Zero-Knowledge Encryption**: AES-256-GCM, ChaCha20-Poly1305
- ✅ **Client-Side Encryption**: Secrets encrypted before leaving device
- ✅ **Password Breach Monitoring**: Check against known breaches
- ✅ **Biometric Unlock**: Fingerprint and Face ID support
- ✅ **Hardware Key Support**: YubiKey, FIDO2 devices
- ✅ **Offline Access**: Access cached secrets offline
- ✅ **Auto-Fill**: Browser extension integration
- ✅ **Secure Notes**: Encrypted markdown notes
- ✅ **File Attachments**: Encrypted file storage
- ✅ **Custom Fields**: Add custom encrypted fields
- ✅ **Two-Factor Auth**: Multiple 2FA methods
- ✅ **Emergency Access**: Trusted contact access
- ✅ **Password History**: Track all versions
- ✅ **Audit Logs**: Complete activity trail
- ✅ **Role-Based Access**: Granular permissions
- ✅ **Secure Sharing**: Time-limited shares
- ✅ **Password Generator**: Cryptographically secure
- ✅ **Import/Export**: Migrate from other managers
- ✅ **API Access**: RESTful API for automation
- ✅ **SSO Integration**: LDAP, Okta, Azure AD

### Vault Types

| Type | Description | Use Case |
|------|-------------|----------|
| Personal | Private vault | Individual use |
| Team | Shared with team | Department secrets |
| Shared | Specific user access | Project collaboration |
| Enterprise | Organization-wide RBAC | Company-wide policies |

### Access Roles

| Role | Permissions |
|------|-------------|
| Owner | Full control including delete vault |
| Admin | Read, write, delete, share |
| Editor | Read, write |
| Viewer | Read only |

---

## 🗃️ Database Schema

### Users Collection
```javascript
{
  email: String (unique),
  passwordHash: String,
  masterKeyHash: String,
  name: String,
  organization: ObjectId,
  mfa: {
    enabled: Boolean,
    methods: ['totp', 'sms', 'hardware-key'],
    backupCodes: [String]
  },
  settings: {
    autoLockTimeout: Number,
    defaultVault: ObjectId,
    biometricEnabled: Boolean
  },
  lastLogin: Date,
  failedAttempts: Number,
  lockedUntil: Date
}
```

### Vaults Collection
```javascript
{
  name: String,
  description: String,
  organization: ObjectId,
  owner: ObjectId,
  type: 'personal' | 'team' | 'shared' | 'enterprise',
  encryptionKey: String (encrypted),
  encryptionAlgorithm: 'aes-256-gcm' | 'chacha20-poly1305',
  accessControl: {
    type: 'owner-only' | 'whitelist' | 'role-based',
    allowedUsers: [{
      user: ObjectId,
      role: 'viewer' | 'editor' | 'admin',
      permissions: [String]
    }]
  },
  settings: {
    requireMFA: Boolean,
    autoLock: { enabled: Boolean, timeout: Number },
    passwordPolicy: { minLength, complexity... },
    backup: { enabled, frequency, retention }
  },
  stats: {
    totalSecrets: Number,
    totalUsers: Number,
    lastAccessed: Date
  }
}
```

### Secrets Collection
```javascript
{
  name: String,
  description: String,
  vault: ObjectId,
  type: 'password' | 'api-key' | 'certificate' | 'ssh-key' | 'database' | 'token' | 'other',
  encryptedData: String,
  encryptionKey: String,
  iv: String,
  tag: String,
  url: String,
  username: String,
  tags: [String],
  autoRotate: {
    enabled: Boolean,
    frequency: String,
    lastRotated: Date,
    nextRotation: Date
  },
  expiryDate: Date,
  versions: [{
    version: Number,
    encryptedData: String,
    modifiedBy: ObjectId,
    modifiedAt: Date
  }],
  accessControl: {
    inheritFromVault: Boolean,
    allowedUsers: [{ user, permissions }]
  }
}
```

### AccessLogs Collection
```javascript
{
  action: 'create' | 'read' | 'update' | 'delete' | 'share' | 'login' | 'logout',
  resourceType: 'vault' | 'secret' | 'user' | 'organization',
  resourceId: ObjectId,
  user: ObjectId,
  organization: ObjectId,
  ipAddress: String,
  userAgent: String,
  timestamp: Date,
  details: Object,
  risk: { level: 'low' | 'medium' | 'high', reasons: [String] }
}
```

---

## 📡 API Documentation

### Authentication

```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd!",
  "name": "John Doe"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd!"
}
# Returns: { token, user }

# Profile
GET /api/auth/profile
Authorization: Bearer <token>
```

### Vaults

```bash
# Create vault
POST /api/vaults
Authorization: Bearer <token>
{
  "name": "Work Passwords",
  "type": "personal",
  "description": "Work-related credentials"
}

# Get all vaults
GET /api/vaults?page=1&limit=20&type=personal

# Get vault by ID
GET /api/vaults/:vaultId

# Update vault
PUT /api/vaults/:vaultId
{
  "name": "Updated Name",
  "settings": { "requireMFA": true }
}

# Delete vault
DELETE /api/vaults/:vaultId

# Share vault
POST /api/vaults/:vaultId/share
{
  "userId": "user_id",
  "permissions": ["read", "write"]
}
```

### Secrets

```bash
# Create secret
POST /api/secrets
{
  "vaultId": "vault_id",
  "name": "GitHub Access Token",
  "type": "token",
  "data": "ghp_xxxxxxxxxxxx",
  "tags": ["github", "development"]
}

# Get secrets
GET /api/secrets/:vaultId?page=1&limit=20&type=password

# Get secret
GET /api/secrets/:secretId

# Update secret
PUT /api/secrets/:secretId
{
  "name": "Updated Name",
  "data": "new_secret_value"
}

# Delete secret
DELETE /api/secrets/:secretId

# Rotate credentials
POST /api/secrets/:secretId/rotate
{
  "notifyUsers": true,
  "keepHistory": true
}

# Get versions
GET /api/secrets/:secretId/versions
```

### Password Generator

```bash
# Generate password
POST /api/generate-password
{
  "length": 20,
  "includeUppercase": true,
  "includeLowercase": true,
  "includeNumbers": true,
  "includeSymbols": true,
  "excludeAmbiguous": true
}

# Response
{
  "password": "Xy7#kL9@mN2$pQ4%",
  "strength": {
    "score": 7,
    "label": "Maximum",
    "length": 20
  },
  "entropy": 131
}

# Generate passphrase
POST /api/generate-password
{
  "passphrase": true,
  "wordCount": 5
}
```

### Security Audit

```bash
# Run audit
POST /api/security-audit
{
  "auditType": "full",
  "includeRecommendations": true,
  "complianceFramework": "NIST"
}

# Response
{
  "audit": {
    "score": 85,
    "grade": "B+",
    "summary": {
      "weakPasswords": 3,
      "expiredSecrets": 2,
      "duplicatePasswords": 4
    },
    "recommendations": [...]
  }
}
```

---

## 🤖 AI Functions

The Maula AI assistant supports these functions:

| Function | Description |
|----------|-------------|
| `generate_password` | Generate cryptographically secure passwords |
| `create_vault` | Create new secure vault |
| `store_secret` | Store encrypted secret |
| `assess_password_strength` | Analyze password security |
| `security_audit` | Run comprehensive security audit |
| `share_secret` | Securely share with users |
| `rotate_credentials` | Rotate and update credentials |
| `manage_access` | Grant/revoke vault access |
| `get_activity_log` | Retrieve activity logs |
| `emergency_access` | Configure emergency procedures |

### Example AI Conversations

```
User: Generate a strong password for my AWS account

AI: I'll generate a cryptographically secure password for your AWS account.

[FUNCTION: generate_password]
Result: {
  password: "Kx9#mL2$nP7@qR4!vB8",
  strength: { score: 7, label: "Maximum" },
  entropy: 125
}

Here's a 20-character password with maximum strength. 
Would you like me to store it in a vault?
```

```
User: Run a security audit on all my vaults

AI: Running a comprehensive security audit...

[FUNCTION: security_audit]
Result: {
  score: 85,
  grade: "B+",
  weakPasswords: 3,
  recommendations: [...]
}

Your security score is 85/100 (B+). I found:
- 3 weak passwords that should be rotated
- 2 expired secrets to update
- 4 duplicate passwords to replace

Would you like me to help fix these issues?
```

---

## 🔐 Security

### Encryption Standards
- **AES-256-GCM**: Authenticated encryption with associated data
- **ChaCha20-Poly1305**: Modern stream cipher with auth
- **PBKDF2-SHA512**: Key derivation (100,000 iterations)
- **Argon2id**: Memory-hard password hashing

### Compliance Frameworks

| Framework | Description |
|-----------|-------------|
| NIST SP 800-63 | Digital Identity Guidelines |
| SOC 2 Type II | Service Organization Control |
| ISO 27001 | Information Security Management |
| PCI-DSS | Payment Card Industry Standard |
| HIPAA | Healthcare Data Protection |
| GDPR | European Data Protection |

### Security Features
- Zero-knowledge architecture
- End-to-end encryption
- Perfect forward secrecy
- Breach detection via Have I Been Pwned
- Brute force protection
- Session management
- IP allowlisting
- Audit logging

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/VM07B/VictoryKit.git
cd VictoryKit

# Backend API
cd backend/tools/33-passwordvault/api
npm install
cp .env.example .env
npm start

# AI Assistant
cd ../ai-assistant
npm install
npm start

# Frontend
cd ../../../../frontend/tools/33-passwordvault
npm install
npm run dev
```

### Environment Variables

```env
# API (.env)
PORT=4033
MONGODB_URI=mongodb://localhost:27017/passwordvault_db
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-master-key

# AI Assistant (.env)
AI_PORT=6033
GEMINI_API_KEY=your-gemini-key
```

---

## ⚙️ Configuration

See `passwordvault-config.json` for full configuration:

```json
{
  "toolName": "PasswordVault",
  "subdomain": "passwordvault.maula.ai",
  "port": 3033,
  "apiPort": 4033,
  "aiPort": 6033,
  "theme": {
    "primaryColor": "#10b981",
    "gradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "features": {
    "zeroKnowledge": true,
    "clientSideEncryption": true,
    "passwordBreachMonitoring": true,
    "biometricUnlock": true
  }
}
```

---

## 📁 Directory Structure

```
33-passwordvault/
├── backend/
│   ├── api/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── vault.controller.js
│   │   │   │   ├── secret.controller.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── audit.controller.js
│   │   │   │   └── organization.controller.js
│   │   │   ├── models/
│   │   │   │   ├── User.model.js
│   │   │   │   ├── Vault.model.js
│   │   │   │   ├── Secret.model.js
│   │   │   │   ├── AccessLog.model.js
│   │   │   │   └── Organization.model.js
│   │   │   ├── routes/
│   │   │   │   ├── index.js
│   │   │   │   ├── vault.routes.js
│   │   │   │   ├── secret.routes.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── audit.routes.js
│   │   │   ├── services/
│   │   │   │   ├── vault.service.js
│   │   │   │   ├── secret.service.js
│   │   │   │   ├── encryption.service.js
│   │   │   │   └── password-analysis.service.js
│   │   │   └── middleware/
│   │   │       └── auth.middleware.js
│   │   └── package.json
│   └── ai-assistant/
│       ├── src/
│       │   ├── server.js
│       │   └── functionExecutor.js
│       └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   ├── passwordvaultAPI.ts
│   │   │   ├── aiService.ts
│   │   │   └── config.ts
│   │   └── App.tsx
│   ├── passwordvault-config.json
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## 👥 Team

Part of the **VictoryKit** security tools suite. Developed by multiple teams working in parallel.

**Branch**: `tool-33-passwordvault`

---

## 📄 License

MIT License - See LICENSE file for details.

---

*Last Updated: January 2026*
