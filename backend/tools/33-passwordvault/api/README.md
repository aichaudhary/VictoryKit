# PasswordVault API

Enterprise-grade password and secrets management platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Advanced Encryption**: AES-256-GCM encryption with PBKDF2 key derivation
- **Multi-Tenant Organizations**: Complete organization management with RBAC
- **MFA Support**: TOTP, SMS, and Email-based multi-factor authentication
- **Social Authentication**: Google, Microsoft, and GitHub OAuth integration
- **AI-Powered Analysis**: Password strength analysis and breach detection
- **Audit Logging**: Comprehensive security audit trails
- **Compliance Ready**: SOC 2, HIPAA, PCI DSS, and GDPR compliance features
- **Zero-Trust Architecture**: Role-based access control and permission management
- **Version Control**: Secret versioning and change tracking
- **Backup & Recovery**: Automated backup and disaster recovery
- **API-First Design**: RESTful API with OpenAPI documentation

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js
- **Encryption**: Crypto (AES-256-GCM), bcrypt, node-forge
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **External APIs**: SendGrid, Twilio, OpenAI, HaveIBeenPwned, VirusTotal
- **Testing**: Jest, Supertest
- **Process Management**: PM2, nodemon

## 📋 Prerequisites

- Node.js 18+
- MongoDB 6+
- Redis (optional, for session storage)
- npm or yarn

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   cd backend/tools/33-passwordvault/api
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Ensure MongoDB is running
   npm run seed  # Optional: seed with sample data
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Start Production Server**
   ```bash
   npm start
   ```

## 📚 API Documentation

Once the server is running, visit:
- **API Docs**: `http://localhost:4000/api/docs`
- **Health Check**: `http://localhost:4000/health`

## 🔧 Configuration

### Required Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/passwordvault

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d

# Encryption
MASTER_ENCRYPTION_KEY=your-256-bit-key

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com
```

### Optional Environment Variables

```env
# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
MICROSOFT_CLIENT_ID=your-microsoft-client-id
GITHUB_CLIENT_ID=your-github-client-id

# External APIs
OPENAI_API_KEY=your-openai-key
HAVE_I_BEEN_PWNED_API_KEY=your-hibp-key
VIRUSTOTAL_API_KEY=your-vt-key

# Redis
REDIS_URL=redis://localhost:6379
```

## 🏗️ Project Structure

```
src/
├── controllers/          # Route controllers
│   ├── auth.controller.js
│   ├── vault.controller.js
│   ├── secret.controller.js
│   ├── audit.controller.js
│   └── organization.controller.js
├── models/              # Mongoose models
│   ├── User.js
│   ├── Vault.js
│   ├── Secret.js
│   ├── AccessLog.js
│   └── Organization.js
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── vault.routes.js
│   ├── secret.routes.js
│   ├── audit.routes.js
│   └── organization.routes.js
├── services/            # Business logic services
│   ├── auth.service.js
│   ├── vault.service.js
│   ├── secret.service.js
│   ├── audit.service.js
│   ├── organization.service.js
│   └── encryption.service.js
├── middleware/          # Express middleware
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   └── error.middleware.js
├── utils/               # Utility functions
└── app.js               # Express app setup
```

## 🔐 Security Features

- **Encryption**: AES-256-GCM for data at rest
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **MFA**: TOTP, SMS, and email verification
- **Rate Limiting**: API rate limiting and DDoS protection
- **Input Validation**: Comprehensive input sanitization
- **Audit Logging**: All actions logged for compliance
- **Session Management**: Secure session handling

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## 📦 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t passwordvault-api .
docker run -p 4000:4000 passwordvault-api
```

### PM2
```bash
pm2 start ecosystem.config.js
```

## 🔍 Monitoring

- **Health Checks**: `/health` endpoint
- **Metrics**: Prometheus metrics (optional)
- **Logging**: Winston structured logging
- **Error Tracking**: Sentry integration (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@passwordvault.com or join our Slack community.

## 🚀 Roadmap

- [ ] Frontend React application
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Hardware security module (HSM) integration
- [ ] Advanced compliance reporting
- [ ] Real-time collaboration features