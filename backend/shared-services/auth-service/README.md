# 🔐 Auth Service - MAULA.AI

Authentication service for MAULA.AI platform. Handles user registration, login, JWT token generation, and SSO for all 50 tools.

## Features

- ✅ User registration and login
- ✅ JWT access and refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Email/password authentication
- ✅ OAuth support (Google, GitHub) - coming soon
- ✅ API key management - coming soon
- ✅ Subscription management
- ✅ CORS for all subdomains

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
nano .env
```

## Running the Service

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start

# Run tests
npm test
```

## API Endpoints

### Health Check
```
GET /health
```

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer <access-token>
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer <access-token>
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| NODE_ENV | Environment (development/production) | Yes |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT | Yes |
| JWT_EXPIRES_IN | Token expiration time | No (default: 7d) |

## Project Structure

```
auth-service/
├── src/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   ├── config/           # Configuration files
│   └── server.ts         # Main server file
├── tests/                # Test files
├── package.json
├── tsconfig.json
└── .env.example
```

## Testing

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!","firstName":"Test","lastName":"User"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}'
```

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Password:** bcrypt
- **Validation:** Joi

## License

MIT
