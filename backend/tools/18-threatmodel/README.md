# ThreatModel

**Tool #18** | AI-Powered Threat Modeling & Risk Analysis Platform

[![Port: 3018](https://img.shields.io/badge/API-3018-blue.svg)](http://localhost:3018)
[![AI WebSocket: 6018](https://img.shields.io/badge/AI_WS-6018-purple.svg)](ws://localhost:6018)
[![Frontend: 3018](https://img.shields.io/badge/Frontend-3018-green.svg)](http://localhost:3018)
[![ML: 8018](https://img.shields.io/badge/ML-8018-orange.svg)](http://localhost:8018)

## Overview

ThreatModel is a comprehensive AI-powered threat modeling and risk analysis platform in the VictoryKit security suite. It provides systematic threat identification, STRIDE analysis, attack tree modeling, and AI-assisted risk assessment for comprehensive security threat modeling across the organization.

**Production URL:** `https://threatmodel.maula.ai`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   ThreatModel System                            │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)           Port 3018                 │
│  ├── Threat Modeling Canvas                                          │
│  ├── STRIDE Analysis Interface                                      │
│  ├── Attack Tree Builder                                             │
│  ├── Risk Assessment Dashboard                                       │
│  ├── Component Library                                               │
│  └── Maula AI Chat Interface                                         │
├─────────────────────────────────────────────────────────────────┤
│  AI Assistant (TypeScript/WebSocket)   Port 6018                 │
│  ├── Multi-LLM Support (Claude Opus/Sonnet 4.5, Gemini, GPT)    │
│  ├── Intelligent Threat Discovery                                   │
│  ├── STRIDE Analysis Automation                                     │
│  ├── Attack Tree Optimization                                        │
│  ├── Risk Quantification Intelligence                                │
│  └── Mitigation Strategy AI                                          │
├─────────────────────────────────────────────────────────────────┤
│  Backend API (Node.js/Express)         Port 4018                 │
│  ├── Threat Model Engine                                             │
│  ├── STRIDE Analysis Engine                                          │
│  ├── Attack Tree Engine                                              │
│  ├── Risk Assessment Engine                                          │
│  ├── Component Management                                            │
│  └── API Gateway Integration                                        │
├─────────────────────────────────────────────────────────────────┤
│  ML Service (Python)                   Port 8018                 │
│  ├── Threat Pattern Recognition                                      │
│  ├── Attack Tree Analysis                                            │
│  ├── Risk Probability Modeling                                       │
│  ├── STRIDE Classification                                           │
│  ├── Anomaly Detection in Threat Models                              │
│  └── Predictive Threat Analysis                                      │
├─────────────────────────────────────────────────────────────────┤
│  Integration Points                                                   │
│  ├── STRIDE Threat Modeling                                        │
│  ├── PASTA Threat Modeling                                         │
│  ├── OCTAVE Risk Assessment                                        │
│  ├── Trike Threat Modeling                                         │
│  ├── VAST Threat Modeling                                          │
│  └── Custom Threat Frameworks                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Core Features

### 🎯 **Systematic Threat Modeling**
- **STRIDE Analysis**: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege
- **PASTA Methodology**: Process for Attack Simulation and Threat Analysis
- **Attack Tree Modeling**: Hierarchical attack pattern representation with logical operators
- **Component-Based Modeling**: System decomposition with trust boundaries and data flows

### 🎨 **Interactive Threat Modeling Canvas**
- **Drag-and-Drop Interface**: Intuitive component placement and relationship mapping
- **Trust Boundary Visualization**: Clear demarcation of security boundaries
- **Data Flow Diagrams**: Automated data flow analysis and threat identification
- **Component Library**: Pre-built security components for rapid modeling

### 🤖 **AI-Powered Intelligence**
- **Intelligent Threat Discovery**: AI identification of threats based on system components
- **STRIDE Automation**: Automated STRIDE categorization and analysis
- **Attack Tree Optimization**: AI-assisted attack tree construction and refinement
- **Risk Quantification**: AI-powered risk scoring and probability analysis

### 📊 **Risk Assessment & Analysis**
- **Quantitative Risk Analysis**: Likelihood and impact assessment with scoring
- **Attack Tree Analysis**: Probabilistic attack tree evaluation
- **Mitigation Strategy Development**: AI-generated mitigation recommendations
- **Executive Reporting**: C-level threat model summaries and insights

## API Endpoints

### Threat Model Management
```
GET    /api/v1/threatmodel/models          # List all threat models
POST   /api/v1/threatmodel/models          # Create new threat model
GET    /api/v1/threatmodel/models/:id      # Get threat model details
PUT    /api/v1/threatmodel/models/:id      # Update threat model
DELETE /api/v1/threatmodel/models/:id      # Delete threat model
POST   /api/v1/threatmodel/models/:id/analyze # Analyze threat model
```

### Component Management
```
GET    /api/v1/threatmodel/components       # List system components
POST   /api/v1/threatmodel/components       # Add component
GET    /api/v1/threatmodel/components/:id   # Get component details
PUT    /api/v1/threatmodel/components/:id   # Update component
DELETE /api/v1/threatmodel/components/:id   # Delete component
POST   /api/v1/threatmodel/components/:id/threats # Identify threats
```

### STRIDE Analysis
```
GET    /api/v1/threatmodel/stride            # List STRIDE analyses
POST   /api/v1/threatmodel/stride            # Create STRIDE analysis
GET    /api/v1/threatmodel/stride/:id        # Get STRIDE analysis
PUT    /api/v1/threatmodel/stride/:id        # Update STRIDE analysis
POST   /api/v1/threatmodel/stride/:id/automate # Automate STRIDE analysis
```

### Attack Tree Management
```
GET    /api/v1/threatmodel/attacktrees       # List attack trees
POST   /api/v1/threatmodel/attacktrees       # Create attack tree
GET    /api/v1/threatmodel/attacktrees/:id   # Get attack tree details
PUT    /api/v1/threatmodel/attacktrees/:id   # Update attack tree
POST   /api/v1/threatmodel/attacktrees/:id/calculate # Calculate probabilities
```

### Threat Catalog
```
GET    /api/v1/threatmodel/threats            # List threats
POST   /api/v1/threatmodel/threats            # Add threat
GET    /api/v1/threatmodel/threats/:id        # Get threat details
PUT    /api/v1/threatmodel/threats/:id        # Update threat
DELETE /api/v1/threatmodel/threats/:id        # Delete threat
POST   /api/v1/threatmodel/threats/:id/mitigate # Suggest mitigations
```

### AI Integration
```
POST   /api/v1/threatmodel/ai/discover        # AI threat discovery
POST   /api/v1/threatmodel/ai/stride          # AI STRIDE analysis
POST   /api/v1/threatmodel/ai/attacktree      # AI attack tree generation
POST   /api/v1/threatmodel/ai/risk            # AI risk assessment
GET    /api/v1/threatmodel/ai/recommendations # AI recommendations
```

## Database Schema

### ThreatModel
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  methodology: String, // 'stride', 'pasta', 'octave', etc.
  scope: {
    system: String,
    boundaries: [String],
    assumptions: [String],
    exclusions: [String]
  },
  components: [{
    componentId: ObjectId,
    name: String,
    type: String,
    trustLevel: String,
    interfaces: [String]
  }],
  threats: [{
    threatId: ObjectId,
    componentId: ObjectId,
    strideCategory: String,
    description: String,
    likelihood: Number,
    impact: Number
  }],
  mitigations: [{
    mitigationId: ObjectId,
    threatId: ObjectId,
    strategy: String,
    effectiveness: Number,
    cost: Number
  }],
  status: String, // 'draft', 'in_progress', 'completed', 'archived'
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### Component
```javascript
{
  _id: ObjectId,
  name: String,
  type: String, // 'process', 'data_store', 'external_entity', 'trust_boundary'
  description: String,
  properties: {
    confidentiality: String,
    integrity: String,
    availability: String
  },
  interfaces: [{
    name: String,
    type: String,
    protocols: [String]
  }],
  threats: [ObjectId],
  trustLevel: String,
  criticality: String
}
```

### Threat
```javascript
{
  _id: ObjectId,
  name: String,
  strideCategory: String, // 'spoofing', 'tampering', 'repudiation', 'information_disclosure', 'denial_of_service', 'elevation_of_privilege'
  description: String,
  preconditions: [String],
  postconditions: [String],
  examples: [String],
  likelihood: Number, // 1-5 scale
  impact: Number, // 1-5 scale
  riskScore: Number, // calculated
  affectedComponents: [ObjectId],
  mitigations: [ObjectId]
}
```

### AttackTree
```javascript
{
  _id: ObjectId,
  name: String,
  rootGoal: String,
  nodes: [{
    id: String,
    label: String,
    type: String, // 'goal', 'and', 'or'
    parent: String,
    children: [String],
    probability: Number,
    cost: Number
  }],
  calculatedRisk: Number,
  mitigationStrategies: [String]
}
```

## Environment Setup

### Backend Configuration
```bash
# Clone and setup
cd backend/tools/18-threatmodel/api
npm install

# Environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Clone and setup
cd frontend/tools/18-threatmodel
npm install

# Start development server
npm run dev
```

### Environment Variables
```env
# Server Configuration
PORT=4018
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/victorykit_threatmodel

# AI Integration
ANTHROPIC_API_KEY=your-anthropic-api-key
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Security Settings
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# Threat Modeling Settings
DEFAULT_METHODOLOGY=stride
MAX_COMPONENTS_PER_MODEL=100
ATTACK_TREE_MAX_DEPTH=10

# External Integrations
THREAT_INTELLIGENCE_API_KEY=your-threat-intel-key
CVE_DATABASE_API_KEY=your-cve-api-key
MITRE_ATTCK_API_KEY=your-mitre-api-key
```

## Development Workflow

### Phase 1: Backend Development
1. Set up Express server with middleware
2. Implement MongoDB models and schemas
3. Create API routes and controllers
4. Add authentication and authorization
5. Implement threat modeling engines

### Phase 2: Frontend Development
1. Create React components with TypeScript
2. Implement threat modeling canvas
3. Add STRIDE analysis interface
4. Create attack tree builder
5. Integrate AI assistant interface

### Phase 3: AI Integration
1. Set up Claude Opus/Sonnet 4.5 integration
2. Implement threat discovery AI
3. Add STRIDE automation
4. Create attack tree AI

### Phase 4: Testing & Deployment
1. Unit and integration testing
2. Security testing and validation
3. Production deployment setup
4. Monitoring and logging configuration

## Security Considerations

### Data Protection
- All threat model data encrypted at rest and in transit
- Role-based access control for sensitive threat information
- Audit logging for all threat modeling operations
- Data retention policies for compliance

### API Security
- JWT-based authentication with refresh tokens
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS configuration for cross-origin requests

### Threat Data Security
- Sensitive threat data encrypted using industry standards
- Access controls based on threat classification
- Secure data transmission protocols
- Regular security audits of threat data handling

## Performance Optimization

### Backend Optimization
- Database query optimization with proper indexing
- Caching layer for frequently accessed threat data
- Asynchronous processing for heavy threat calculations
- Horizontal scaling support with load balancing

### Frontend Optimization
- Code splitting and lazy loading for threat modeling canvas
- Optimized bundle size with tree shaking
- Progressive Web App (PWA) capabilities
- Responsive design for all device types

### Threat Analysis Optimization
- Parallel processing for attack tree calculations
- Optimized algorithms for large-scale threat models
- Caching of intermediate analysis results
- Batch processing for bulk threat analysis

## Monitoring & Alerting

### Application Monitoring
- Real-time performance metrics for threat analysis
- Error tracking and alerting for modeling failures
- User activity monitoring for threat operations
- API usage analytics for threat services

### Threat Monitoring
- New threat pattern detection
- Attack tree risk threshold alerts
- STRIDE analysis completion monitoring
- Threat model update notifications

### Infrastructure Monitoring
- Server resource utilization for analysis workloads
- Database performance metrics for threat data
- Network traffic analysis for threat operations
- Backup and recovery status monitoring

## Troubleshooting

### Common Issues

**Threat Model Not Loading**
- Check MongoDB connection and data integrity
- Verify threat model configuration parameters
- Review model validation logs

**STRIDE Analysis Failing**
- Verify component data completeness
- Check STRIDE analysis configuration
- Review analysis engine logs

**Attack Tree Calculation Error**
- Validate attack tree structure and logic
- Check probability calculation parameters
- Review calculation engine logs

**AI Integration Not Working**
- Verify API keys in environment variables
- Check network connectivity to AI services
- Review AI service rate limits and quotas

**Frontend Canvas Not Rendering**
- Clear browser cache and check console errors
- Verify API endpoints are accessible
- Check data format compatibility

### Database Connection Issues
- Verify MongoDB URI in environment variables
- Check database server status and credentials
- Review connection pool settings

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
DEBUG=threatmodel:*
THREAT_ANALYSIS_DEBUG=true
ATTACK_TREE_DEBUG=true
```

### Support
For technical support, contact:
- **Email**: support@victorykit.com
- **Documentation**: https://docs.victorykit.com/tools/threatmodel
- **GitHub Issues**: https://github.com/victorykit/threatmodel/issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### Version 2.0 (Current)
- ✅ STRIDE threat modeling methodology
- ✅ Attack tree analysis and visualization
- ✅ AI-powered threat discovery
- ✅ Component-based system modeling

### Version 2.1 (Next)
- 🔄 PASTA methodology integration
- 🔄 Real-time threat intelligence feeds
- 🔄 Automated threat model updates
- 🔄 Advanced attack tree simulations

### Version 3.0 (Future)
- 🔄 Machine learning threat prediction
- 🔄 Integration with vulnerability scanners
- 🔄 Automated mitigation deployment
- 🔄 Threat model compliance automation</content>
<parameter name="filePath">/workspaces/VictoryKit/backend/tools/18-threatmodel/README.md