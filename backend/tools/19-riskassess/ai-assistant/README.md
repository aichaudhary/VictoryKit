# RiskAssess AI Assistant

## Tool 19 - AI-Powered Risk Assessment Assistant

A sophisticated WebSocket-based AI assistant that provides intelligent risk analysis, threat modeling, impact assessment, compliance evaluation, and mitigation strategy recommendations using Claude Opus/Sonnet 4.5 with multi-LLM fallback capabilities.

## Features

### 🤖 AI-Powered Analysis
- **Risk Analysis**: Comprehensive risk assessment with scoring and recommendations
- **Threat Modeling**: Advanced threat actor analysis and attack vector identification
- **Impact Assessment**: Business impact analysis with quantitative estimates
- **Compliance Checking**: Multi-framework compliance evaluation (GDPR, HIPAA, PCI DSS, ISO 27001)
- **Mitigation Strategies**: Actionable risk mitigation plans with cost-benefit analysis
- **Scenario Planning**: Best/worst/most-likely scenario development

### 🔧 Technical Capabilities
- **Multi-LLM Support**: Claude (primary), Gemini, GPT-4 (fallbacks)
- **Real-time WebSocket Communication**: Instant AI responses
- **Risk Quantification**: Mathematical risk scoring algorithms
- **Context Awareness**: Maintains conversation context for complex analyses
- **Fallback Systems**: Graceful degradation when primary AI is unavailable

### 📊 Risk Frameworks Supported
- NIST SP 800-30 Risk Management
- ISO 31000 Risk Management
- FAIR (Factor Analysis of Information Risk)
- OCTAVE (Operationally Critical Threat, Asset, and Vulnerability Evaluation)
- CRAMM (CCTA Risk Analysis and Management Method)

## Architecture

```
WebSocket Server (Port 6019)
├── Connection Management
├── Session Tracking
├── AI Orchestration
│   ├── Claude Opus/Sonnet 4.5 (Primary)
│   ├── Google Gemini (Fallback)
│   └── OpenAI GPT-4 (Fallback)
└── Risk Analysis Engine
    ├── Quantitative Analysis
    ├── Qualitative Assessment
    └── Recommendation Engine
```

## Installation

1. **Navigate to the AI Assistant directory:**
   ```bash
   cd backend/tools/19-riskassess/ai-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **For production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Configuration

### Required API Keys
- `CLAUDE_API_KEY`: Anthropic Claude API key (primary AI)
- `GEMINI_API_KEY`: Google Gemini API key (fallback)
- `OPENAI_API_KEY`: OpenAI API key (fallback)

### Optional Configurations
- `AI_PORT`: WebSocket server port (default: 6019)
- `MAX_RISK_SCORE`: Maximum risk score value (default: 25)
- `ANALYSIS_TIMEOUT`: AI response timeout in milliseconds (default: 30000)

## WebSocket API

### Connection
Connect to `ws://localhost:6019` for WebSocket communication.

### Message Format
```json
{
  "type": "risk_analysis|threat_modeling|impact_assessment|compliance_check|mitigation_strategy|scenario_planning",
  "data": {
    // Risk-specific data
  },
  "context": {
    // Additional context (optional)
  }
}
```

### Response Format
```json
{
  "id": "unique-response-id",
  "type": "analysis-type",
  "content": "AI-generated analysis",
  "confidence": 0.85,
  "recommendations": ["Action 1", "Action 2"],
  "riskScore": 15,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Usage Examples

### Risk Analysis
```javascript
const ws = new WebSocket('ws://localhost:6019');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'risk_analysis',
    data: {
      name: 'Data Breach Risk',
      category: 'cybersecurity',
      probability: 4,
      impact: 5,
      description: 'Potential unauthorized access to customer data'
    },
    context: {
      industry: 'finance',
      dataVolume: '1M records'
    }
  }));
};
```

### Threat Modeling
```javascript
ws.send(JSON.stringify({
  type: 'threat_modeling',
  data: {
    system: 'Customer Portal',
    assets: ['user_data', 'payment_info'],
    attackSurface: ['web_app', 'api_endpoints']
  }
}));
```

### Compliance Check
```javascript
ws.send(JSON.stringify({
  type: 'compliance_check',
  data: {
    scenario: 'Cloud Migration',
    regulations: ['GDPR', 'HIPAA'],
    dataTypes: ['PII', 'PHI']
  }
}));
```

## Development

### Project Structure
```
ai-assistant/
├── src/
│   ├── server.ts          # Main WebSocket server
│   └── types.ts           # TypeScript type definitions
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .env                   # Environment variables
└── README.md             # This file
```

### Adding New Analysis Types
1. Add the analysis type to the `RiskQuery` interface
2. Create a handler function in `server.ts`
3. Add the case to the `handleRiskQuery` switch statement
4. Implement the AI prompt and response parsing

### Testing
```bash
npm test
```

## Integration with RiskAssess Tool

The AI Assistant integrates seamlessly with the RiskAssess frontend through WebSocket connections, providing:

- **Real-time Analysis**: Instant risk assessments as users input data
- **Collaborative Features**: Multi-user risk analysis sessions
- **Context Preservation**: Maintains analysis context across interactions
- **Fallback Handling**: Continues operation even if primary AI services are unavailable

## Performance Considerations

- **Connection Limits**: Maximum 10 concurrent connections per IP
- **Timeout Handling**: 30-second timeout for AI responses
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Memory Management**: Efficient session cleanup and garbage collection

## Security Features

- **API Key Encryption**: Secure storage of AI service credentials
- **Input Validation**: Comprehensive input sanitization and validation
- **Connection Monitoring**: Real-time monitoring of WebSocket connections
- **Audit Logging**: Complete audit trail of all AI interactions

## Monitoring and Logging

- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Performance Metrics**: Response times and success rates
- **Error Tracking**: Comprehensive error reporting and alerting
- **Usage Analytics**: AI usage patterns and effectiveness metrics

## Contributing

1. Follow the established code style and TypeScript conventions
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility with existing integrations

## License

This AI Assistant is part of the VictoryKit RiskAssess tool suite.

## Support

For technical support or feature requests, please contact the VictoryKit development team.