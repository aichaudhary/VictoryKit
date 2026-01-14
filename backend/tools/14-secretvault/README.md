# 🔐 SecretVault - Tool 14

> **Dual-Nature Platform: Community Incident Board + Enterprise Secret Management**

## Overview
SecretVault serves two critical functions:
1. **🚨 Incident Board**: Public community-driven security incident reporting platform
2. **🔐 Secret Vault**: Enterprise encryption key management system

**Production URL**: https://secretvault.maula.ai  
**Ports**: Frontend 3014 | Backend 4014

---

## 🚨 INCIDENT BOARD

### Purpose
A GitHub Issues-like platform for reporting real-world security incidents. Users can report, browse, and learn from security incidents worldwide.

### Incident Report Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | Brief incident title |
| username | string | ✅ | Reporter's display name |
| location | string | ✅ | Where it happened |
| date | date | ✅ | When it happened |
| category | enum | ✅ | phishing, data-breach, malware, scam, fraud, identity-theft, security, other |
| severity | enum | ✅ | low, medium, high, critical |
| what_happened | text | ✅ | Detailed description |
| why_it_happened | text | ❌ | Root cause analysis |
| when_discovered | date | ❌ | Discovery date |
| actions_taken | text | ❌ | Response/remediation |
| lessons_learned | text | ❌ | What to learn from this |

### API Endpoints

#### Incidents
```
GET    /api/incidents              # List all incidents (with pagination)
GET    /api/incidents/:id          # Get specific incident
POST   /api/incidents              # Create new incident report
PUT    /api/incidents/:id          # Update incident
DELETE /api/incidents/:id          # Delete incident (admin only)
POST   /api/incidents/:id/upvote   # Upvote an incident
POST   /api/incidents/:id/comment  # Add comment
GET    /api/incidents/stats        # Get incident statistics
GET    /api/incidents/categories   # Get category breakdown
```

#### Search & Filter
```
GET    /api/incidents/search?q=    # Full-text search
GET    /api/incidents/filter       # Filter by category, severity, date
GET    /api/incidents/trending     # Get trending incidents
GET    /api/incidents/recent       # Get recent incidents
```

---

## 🔐 SECRET VAULT

### Purpose
Enterprise encryption key management system for secure storage and handling of cryptographic keys.

### Key Types Supported
- **AES-256**: Symmetric encryption keys
- **RSA-2048/4096**: Asymmetric key pairs
- **HMAC-SHA256**: Message authentication keys
- **API Keys**: Third-party service credentials
- **Custom**: User-defined secret storage

### API Endpoints

#### Key Management
```
GET    /api/keys                   # List all keys (metadata only)
GET    /api/keys/:id               # Get key details
POST   /api/keys                   # Create/store new key
PUT    /api/keys/:id               # Update key metadata
DELETE /api/keys/:id               # Delete key (soft delete)
POST   /api/keys/:id/rotate        # Rotate key
```

#### Encryption Operations
```
POST   /api/encrypt                # Encrypt data with specified key
POST   /api/decrypt                # Decrypt data with specified key
POST   /api/generate               # Generate new cryptographic key
POST   /api/derive                 # Derive key from password
```

#### Audit & Security
```
GET    /api/audit/keys             # Key access audit log
GET    /api/audit/operations       # Encryption operation log
GET    /api/keys/:id/history       # Key version history
```

---

## Database Collections

### MongoDB: `secretvault_db`

#### incidents
```javascript
{
  _id: ObjectId,
  title: String,
  username: String,
  location: String,
  date: Date,
  category: String,       // enum
  severity: String,       // low, medium, high, critical
  status: String,         // open, investigating, resolved, closed
  what_happened: String,
  why_it_happened: String,
  when_discovered: Date,
  actions_taken: String,
  lessons_learned: String,
  tags: [String],
  upvotes: Number,
  comments: [{
    username: String,
    content: String,
    timestamp: Date
  }],
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### encryption_keys
```javascript
{
  _id: ObjectId,
  name: String,
  type: String,           // AES-256, RSA-2048, etc.
  key_value: String,      // Encrypted storage
  iv: String,             // For AES keys
  purpose: String,
  status: String,         // active, rotated, expired, revoked
  expiresAt: Date,
  lastUsed: Date,
  accessCount: Number,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### audit_logs
```javascript
{
  _id: ObjectId,
  action: String,         // created, accessed, rotated, deleted
  resource_type: String,  // key, incident
  resource_id: ObjectId,
  user: String,
  ip_address: String,
  details: Object,
  timestamp: Date
}
```

---

## Environment Variables

See `.env.example` for required configuration.

## Incident Categories

| Category | Description | Icon |
|----------|-------------|------|
| phishing | Email/SMS phishing attempts | 🎣 |
| data-breach | Data leaks or unauthorized access | 💾 |
| malware | Virus, ransomware, trojans | 🦠 |
| scam | Financial or social engineering scams | 💰 |
| fraud | Identity fraud, payment fraud | 🎭 |
| identity-theft | Personal identity compromise | 👤 |
| security | General security incidents | 🔐 |
| other | Uncategorized incidents | ❓ |

## Severity Levels

| Level | Color | Description |
|-------|-------|-------------|
| low | Green | Minor impact, informational |
| medium | Yellow | Moderate impact, needs attention |
| high | Orange | Significant impact, urgent |
| critical | Red | Severe impact, immediate action |

---

## Quick Start

```bash
cd backend/tools/14-secretvault/api
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

## Tech Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Encryption**: Node.js crypto module
- **Authentication**: JWT tokens
- **Rate Limiting**: express-rate-limit
