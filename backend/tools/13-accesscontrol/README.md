# AccessControl Backend API

## Overview

AccessControl is a comprehensive AI-powered access management and authorization system that provides role-based access control (RBAC), attribute-based access control (ABAC), and intelligent policy enforcement for enterprise security.

## Architecture

### Core Components

- **Authentication Service**: JWT-based authentication with MFA support
- **Authorization Engine**: RBAC/ABAC policy evaluation and enforcement
- **User Management**: Comprehensive user lifecycle management
- **Role Management**: Hierarchical role structure with inheritance
- **Policy Engine**: Dynamic policy creation and evaluation
- **Audit System**: Complete audit trail with compliance reporting
- **AI Integration**: Claude Opus/Sonnet 4.5 for intelligent recommendations

### Database Schema

#### Users Collection
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  roles: [ObjectId],
  permissions: [String],
  status: String,
  mfaEnabled: Boolean,
  profile: Object,
  lastLogin: Date,
  // ... additional fields
}
```

#### Roles Collection
```javascript
{
  name: String,
  description: String,
  permissions: [String],
  parentRole: ObjectId,
  childRoles: [ObjectId],
  isSystem: Boolean,
  priority: Number,
  // ... additional fields
}
```

#### Policies Collection
```javascript
{
  name: String,
  description: String,
  effect: String,
  rules: [Object],
  conditions: Object,
  scope: Object,
  priority: Number,
  // ... additional fields
}
```

#### Audit Logs Collection
```javascript
{
  timestamp: Date,
  user: Object,
  action: Object,
  result: String,
  severity: String,
  category: String,
  // ... additional fields
}
```

## API Endpoints

### Authentication
- `POST /api/v1/accesscontrol/auth/login` - User login
- `POST /api/v1/accesscontrol/auth/logout` - User logout
- `POST /api/v1/accesscontrol/auth/mfa/setup` - Setup MFA
- `POST /api/v1/accesscontrol/auth/mfa/verify` - Verify and enable MFA
- `POST /api/v1/accesscontrol/auth/mfa/disable` - Disable MFA
- `GET /api/v1/accesscontrol/auth/me` - Get current user

### Users
- `GET /api/v1/accesscontrol/users` - List users
- `GET /api/v1/accesscontrol/users/:id` - Get user details
- `POST /api/v1/accesscontrol/users` - Create user
- `PUT /api/v1/accesscontrol/users/:id` - Update user
- `DELETE /api/v1/accesscontrol/users/:id` - Delete user
- `POST /api/v1/accesscontrol/users/:id/roles` - Assign role to user
- `DELETE /api/v1/accesscontrol/users/:id/roles/:roleId` - Remove role from user

### Roles
- `GET /api/v1/accesscontrol/roles` - List roles
- `GET /api/v1/accesscontrol/roles/:id` - Get role details
- `POST /api/v1/accesscontrol/roles` - Create role
- `PUT /api/v1/accesscontrol/roles/:id` - Update role
- `DELETE /api/v1/accesscontrol/roles/:id` - Delete role
- `GET /api/v1/accesscontrol/roles/:id/hierarchy` - Get role hierarchy
- `GET /api/v1/accesscontrol/roles/user/:userId` - Get user roles

### Dashboard
- `GET /api/v1/accesscontrol/dashboard` - Get dashboard overview
- `GET /api/v1/accesscontrol/dashboard/activity` - Get activity summary
- `GET /api/v1/accesscontrol/dashboard/security` - Get security metrics

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB 5+
- Redis (optional, for enhanced performance)

### Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd backend/tools/13-accesscontrol/api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or using local installation
   mongod
   ```

5. **Start the API server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4013` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/accesscontrol` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `24h` |
| `ANTHROPIC_API_KEY` | Claude API key for AI features | Required for AI features |

## Security Features

### Authentication
- JWT-based authentication with configurable expiration
- Multi-factor authentication (TOTP) support
- Account lockout after failed attempts
- Secure password hashing with bcrypt

### Authorization
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Hierarchical role inheritance
- Dynamic permission evaluation
- Policy-based access control

### Audit & Compliance
- Comprehensive audit logging
- GDPR/HIPAA compliance support
- Real-time security monitoring
- Compliance reporting

### AI Integration
- Claude Opus/Sonnet 4.5 for intelligent policy analysis
- Automated permission recommendations
- Risk assessment and anomaly detection
- Natural language policy creation

## Development

### Project Structure
```
src/
├── models/          # Mongoose models
├── routes/          # API route handlers
├── controllers/     # Business logic controllers
├── middleware/      # Custom middleware
├── services/        # External service integrations
├── utils/           # Utility functions
└── server.js        # Main application entry point
```

### Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4013
CMD ["npm", "start"]
```

### Production Checklist
- [ ] Environment variables configured
- [ ] MongoDB connection secured
- [ ] JWT secrets rotated
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Security headers enabled

## API Documentation

Complete API documentation is available at `/api/docs` when running in development mode.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **JWT Token Invalid**
   - Check `JWT_SECRET` in environment
   - Verify token expiration
   - Ensure proper token format

3. **Permission Denied**
   - Check user roles and permissions
   - Verify policy configurations
   - Review audit logs for details

### Logs
- Application logs are written to `logs/app.log`
- Error logs are written to `logs/error.log`
- Audit logs are stored in MongoDB

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure security best practices
5. Get code review approval

## License

This project is part of the VictoryKit security platform.

## Support

For support and questions:
- Check the troubleshooting guide
- Review the API documentation
- Contact the development team