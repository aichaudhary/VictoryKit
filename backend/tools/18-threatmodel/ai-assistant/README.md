# ThreatModel AI Assistant

A sophisticated AI-powered assistant for threat modeling that provides intelligent analysis, risk assessment, and real-time collaboration features for the VictoryKit ThreatModel tool.

## 🚀 Features

- **Intelligent Threat Analysis**: Uses Claude AI to analyze components and identify potential security threats
- **Multiple Frameworks**: Supports STRIDE, PASTA, and OCTAVE threat modeling frameworks
- **Real-time Collaboration**: WebSocket-based real-time communication for collaborative threat modeling
- **Risk Assessment**: Automated risk scoring and prioritization
- **Mitigation Recommendations**: AI-generated mitigation strategies with cost-benefit analysis
- **Architecture Review**: Comprehensive security architecture analysis
- **Session Management**: Persistent sessions with conversation history
- **Multi-LLM Support**: Support for different Claude models based on use case

## 🏗️ Architecture

### Core Components

```
src/
├── server.ts                 # Main server application
├── types.ts                  # TypeScript type definitions
├── services/
│   ├── ai.service.ts         # Claude AI integration
│   ├── websocket.service.ts  # WebSocket communication
│   ├── threat-analysis.service.ts # Threat analysis logic
│   └── session.service.ts    # Session management
├── middleware/
│   ├── auth.middleware.ts    # JWT authentication
│   ├── rate-limit.middleware.ts # Rate limiting
│   └── error.middleware.ts   # Error handling
├── routes/
│   ├── threat-analysis.routes.ts # Analysis endpoints
│   └── session.routes.ts     # Session management
└── __tests__/                # Test files
```

### Communication Flow

1. **WebSocket Connection**: Clients connect via WebSocket with JWT authentication
2. **Session Management**: Each connection is associated with a user session
3. **Message Routing**: Messages are routed to appropriate analysis services
4. **AI Processing**: Claude AI processes requests and generates responses
5. **Real-time Updates**: Results are broadcast back to connected clients

## 🔧 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

### Setup

1. **Clone and navigate to the AI assistant directory:**
   ```bash
   cd backend/tools/18-threatmodel/ai-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the application:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

For development:
```bash
npm run dev
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `6018` |
| `NODE_ENV` | Environment | `development` |
| `ANTHROPIC_API_KEY` | Claude API key | Required |
| `CLAUDE_MODEL` | Default Claude model | `claude-3-5-sonnet-20241022` |
| `JWT_SECRET` | JWT signing secret | Required |
| `WS_CORS_ORIGIN` | WebSocket CORS origin | `http://localhost:3018` |
| `LOG_LEVEL` | Logging level | `info` |

### AI Models

The assistant supports multiple Claude models:

- **claude-3-5-sonnet-20241022**: Best for complex analysis and reasoning
- **claude-3-5-haiku-20241022**: Fast responses for basic analysis
- **claude-3-opus-20240229**: Maximum reasoning capability

## 📡 API Reference

### WebSocket Messages

#### Threat Analysis Request
```typescript
{
  type: 'threat_analysis_request',
  sessionId: string,
  analysisType: 'threat_identification' | 'risk_assessment' | 'mitigation_suggestions' | 'architecture_review' | 'compliance_check' | 'attack_vector_analysis',
  componentId?: string,
  context?: Record<string, any>,
  userPrompt?: string
}
```

#### Threat Analysis Response
```typescript
{
  type: 'threat_analysis_response',
  sessionId: string,
  analysisId: string,
  results: Array<{
    componentId?: string,
    threats?: Threat[],
    confidence: number,
    reasoning: string,
    recommendations: string[]
  }>,
  metadata: {
    model: string,
    processingTime: number,
    tokensUsed: number
  }
}
```

### REST API Endpoints

#### Threat Analysis
- `POST /api/threat-analysis/analyze` - Perform threat analysis
- `POST /api/threat-analysis/component/:componentId` - Analyze specific component
- `POST /api/threat-analysis/mitigations/:threatId` - Generate mitigations
- `POST /api/threat-analysis/risk` - Calculate risk assessment
- `POST /api/threat-analysis/chat` - Process chat messages

#### Session Management
- `POST /api/sessions` - Create new session
- `GET /api/sessions` - Get user sessions
- `GET /api/sessions/:sessionId` - Get session details
- `PUT /api/sessions/:sessionId/context` - Update session context
- `GET /api/sessions/:sessionId/history` - Get conversation history
- `DELETE /api/sessions/:sessionId/history` - Clear history
- `DELETE /api/sessions/:sessionId` - Delete session

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test -- --coverage
```

### Test Structure

- **Unit Tests**: Individual service and utility testing
- **Integration Tests**: API endpoint testing
- **WebSocket Tests**: Real-time communication testing
- **AI Service Tests**: Mocked AI response testing

## 🔒 Security

### Authentication
- JWT-based authentication required for all endpoints
- WebSocket connections validated with JWT tokens
- Session-based access control

### Rate Limiting
- Configurable rate limits per user/IP
- Separate limits for AI analysis endpoints
- Automatic cleanup of expired rate limit entries

### Data Protection
- No sensitive data stored in sessions
- Conversation history encrypted at rest
- Secure WebSocket connections with CORS validation

## 📊 Monitoring

### Logging
- Winston-based logging with configurable levels
- Structured JSON logs for analysis
- Separate error and combined log files

### Health Checks
- `/health` endpoint for service monitoring
- Session statistics and performance metrics
- AI service availability monitoring

### Metrics
- Request/response times
- AI token usage tracking
- Session activity monitoring
- Error rate tracking

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 6018

CMD ["npm", "start"]
```

### Production Considerations

1. **Environment Variables**: Use secure secret management
2. **Rate Limiting**: Configure appropriate limits for production load
3. **Logging**: Set up centralized logging aggregation
4. **Monitoring**: Implement health checks and alerting
5. **Scaling**: Consider horizontal scaling for high load
6. **Backup**: Regular backup of session data if persisted

## 🤝 Contributing

1. Follow the existing code style and architecture
2. Add tests for new features
3. Update documentation for API changes
4. Ensure all tests pass before submitting PR

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the logs in `logs/` directory
- Review the API documentation
- Create an issue in the VictoryKit repository

## 🔄 Version History

- **1.0.0**: Initial release with core threat analysis features
  - Claude AI integration
  - WebSocket real-time communication
  - Session management
  - Multiple threat modeling frameworks
  - Risk assessment and mitigation recommendations