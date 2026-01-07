# DDoSShield Backend API

## Overview

DDoSShield is a comprehensive DDoS Protection and Traffic Analysis Platform that provides enterprise-grade protection against distributed denial-of-service attacks. The platform combines real-time traffic monitoring, advanced detection algorithms, and automated mitigation strategies to ensure service availability and performance.

## Architecture

### Core Components

- **Traffic Monitoring Engine**: Real-time traffic analysis and anomaly detection
- **DDoS Detection System**: Multi-vector attack identification and classification
- **Mitigation Controller**: Automated response and traffic filtering
- **Traffic Scrubbing**: Advanced traffic cleaning and rate limiting
- **Analytics Dashboard**: Real-time metrics and attack visualization
- **Incident Response**: Automated alerting and escalation procedures

### Technology Stack

- **Runtime**: Node.js 18+ with Express.js framework
- **Database**: MongoDB with Mongoose ODM for attack logs and configurations
- **Time-Series Database**: InfluxDB for high-frequency traffic metrics
- **Caching**: Redis for session management and rate limiting data
- **Message Queue**: Kafka/RabbitMQ for real-time event processing
- **ML Engine**: Python-based machine learning for attack pattern recognition

## Database Schema

### Collections

#### ddos_attacks
```javascript
{
  _id: ObjectId,
  attackId: String, // Unique attack identifier
  type: String, // 'syn_flood', 'udp_flood', 'http_flood', 'amplification', 'slowloris'
  status: String, // 'detected', 'mitigating', 'mitigated', 'false_positive'
  severity: String, // 'low', 'medium', 'high', 'critical'
  startTime: Date,
  endTime: Date,
  duration: Number, // in seconds
  peakTraffic: {
    pps: Number, // packets per second
    bps: Number, // bits per second
    rps: Number  // requests per second
  },
  target: {
    ip: String,
    port: Number,
    protocol: String,
    service: String
  },
  sourceAnalysis: {
    topSources: [{
      ip: String,
      packets: Number,
      bytes: Number,
      country: String
    }],
    totalUniqueIPs: Number,
    geographicDistribution: Object,
    asnDistribution: Object
  },
  mitigation: {
    method: String, // 'rate_limiting', 'blackhole', 'scrubbing', 'waf'
    effectiveness: Number, // 0-100
    trafficReduced: Number, // percentage
    falsePositives: Number
  },
  detection: {
    method: String, // 'threshold', 'statistical', 'ml', 'signature'
    confidence: Number, // 0-1
    signatures: [String]
  },
  metadata: {
    userAgent: String,
    referrer: String,
    headers: Object
  }
}
```

#### traffic_metrics
```javascript
{
  _id: ObjectId,
  timestamp: Date,
  interface: String,
  protocol: String,
  metrics: {
    packetsIn: Number,
    packetsOut: Number,
    bytesIn: Number,
    bytesOut: Number,
    connections: Number,
    activeConnections: Number,
    newConnections: Number,
    droppedPackets: Number,
    errorPackets: Number
  },
  anomalies: [{
    type: String,
    severity: Number,
    description: String
  }],
  geoStats: {
    topCountries: [{
      country: String,
      packets: Number,
      bytes: Number
    }]
  }
}
```

#### mitigation_rules
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  type: String, // 'rate_limit', 'geo_block', 'signature', 'behavioral'
  conditions: [{
    field: String,
    operator: String,
    value: any,
    threshold: Number
  }],
  actions: [{
    type: String, // 'block', 'rate_limit', 'redirect', 'log'
    parameters: Object,
    duration: Number // in seconds
  }],
  priority: Number,
  enabled: Boolean,
  scope: String, // 'global', 'service', 'endpoint'
  createdAt: Date,
  updatedAt: Date,
  lastTriggered: Date,
  triggerCount: Number
}
```

#### protected_services
```javascript
{
  _id: ObjectId,
  name: String,
  type: String, // 'web', 'api', 'dns', 'smtp', 'custom'
  endpoints: [{
    url: String,
    method: String,
    protected: Boolean
  }],
  configuration: {
    rateLimit: {
      requests: Number,
      period: String, // 'second', 'minute', 'hour'
      burst: Number
    },
    geoBlocking: {
      allowedCountries: [String],
      blockedCountries: [String]
    },
    waf: {
      enabled: Boolean,
      rules: [String]
    }
  },
  monitoring: {
    enabled: Boolean,
    metrics: [String],
    alerts: [{
      type: String,
      threshold: Number,
      channels: [String]
    }]
  },
  status: String, // 'active', 'inactive', 'maintenance'
  createdAt: Date,
  updatedAt: Date
}
```

#### attack_signatures
```javascript
{
  _id: ObjectId,
  signatureId: String,
  name: String,
  description: String,
  type: String, // 'packet', 'behavioral', 'statistical'
  pattern: {
    protocol: String,
    ports: [Number],
    payload: String, // regex or signature
    flags: Object
  },
  severity: String,
  confidence: Number,
  falsePositiveRate: Number,
  tags: [String],
  createdAt: Date,
  lastMatched: Date,
  matchCount: Number
}
```

#### incidents
```javascript
{
  _id: ObjectId,
  incidentId: String,
  title: String,
  description: String,
  severity: String,
  status: String, // 'open', 'investigating', 'resolved', 'closed'
  attacks: [ObjectId], // Related attack IDs
  affectedServices: [ObjectId],
  timeline: [{
    timestamp: Date,
    event: String,
    details: Object,
    user: String
  }],
  impact: {
    downtime: Number, // in minutes
    trafficLoss: Number, // percentage
    financialImpact: Number
  },
  resolution: {
    method: String,
    effectiveness: Number,
    lessonsLearned: String
  },
  assignedTo: String,
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

## API Endpoints

### Attack Detection & Monitoring
- `GET /api/attacks` - List recent attacks
- `GET /api/attacks/:id` - Get attack details
- `GET /api/attacks/active` - Get currently active attacks
- `POST /api/attacks/:id/mitigate` - Trigger mitigation for attack
- `GET /api/attacks/stats` - Attack statistics and trends

### Traffic Analysis
- `GET /api/traffic/metrics` - Real-time traffic metrics
- `GET /api/traffic/anomalies` - Detected traffic anomalies
- `GET /api/traffic/baseline` - Traffic baseline data
- `GET /api/traffic/forecast` - Traffic forecasting

### Mitigation Management
- `GET /api/mitigation/rules` - List mitigation rules
- `POST /api/mitigation/rules` - Create mitigation rule
- `PUT /api/mitigation/rules/:id` - Update mitigation rule
- `DELETE /api/mitigation/rules/:id` - Delete mitigation rule
- `POST /api/mitigation/manual` - Manual mitigation action

### Service Protection
- `GET /api/services` - List protected services
- `POST /api/services` - Add protected service
- `PUT /api/services/:id` - Update service configuration
- `DELETE /api/services/:id` - Remove service protection
- `GET /api/services/:id/status` - Service protection status

### Analytics & Reporting
- `GET /api/analytics/attacks` - Attack analytics
- `GET /api/analytics/traffic` - Traffic analytics
- `GET /api/analytics/effectiveness` - Mitigation effectiveness
- `GET /api/analytics/threats` - Threat intelligence
- `POST /api/reports/generate` - Generate custom reports

### Incident Management
- `GET /api/incidents` - List security incidents
- `POST /api/incidents` - Create incident report
- `PUT /api/incidents/:id` - Update incident status
- `GET /api/incidents/:id/timeline` - Incident timeline

## Detection Algorithms

### Statistical Detection
```javascript
const detectStatisticalAnomaly = (trafficData, baseline) => {
  const metrics = ['pps', 'bps', 'rps', 'connections'];

  const anomalies = metrics.map(metric => {
    const current = trafficData[metric];
    const mean = baseline[metric].mean;
    const stdDev = baseline[metric].stdDev;

    const zScore = Math.abs((current - mean) / stdDev);

    return {
      metric,
      zScore,
      threshold: 3.0, // 3 standard deviations
      isAnomaly: zScore > 3.0
    };
  });

  const anomalyScore = anomalies.filter(a => a.isAnomaly).length / metrics.length;

  return {
    isAttack: anomalyScore > 0.5,
    confidence: anomalyScore,
    anomalies
  };
};
```

### Signature-Based Detection
```javascript
const detectSignatureBased = (packet) => {
  const signatures = [
    {
      name: 'SYN Flood',
      pattern: { flags: { syn: true, ack: false }, payload: null },
      threshold: 1000 // packets per second
    },
    {
      name: 'UDP Amplification',
      pattern: { protocol: 'udp', ports: [53, 123, 1900] },
      threshold: 5000
    }
  ];

  return signatures.map(sig => ({
    signature: sig.name,
    matched: matchesPattern(packet, sig.pattern),
    severity: calculateSeverity(packet, sig)
  })).filter(match => match.matched);
};
```

### Machine Learning Detection
```javascript
const detectMLBased = async (features) => {
  const response = await axios.post('http://ml-engine:5000/predict', {
    model: 'ddos_detector_v3',
    features: {
      packetRate: features.pps,
      byteRate: features.bps,
      connectionRate: features.connections,
      entropy: calculateEntropy(features),
      timeSeriesFeatures: extractTimeSeriesFeatures(features),
      behavioralFeatures: extractBehavioralFeatures(features)
    }
  });

  return {
    isAttack: response.data.prediction === 'attack',
    confidence: response.data.confidence,
    attackType: response.data.attack_type,
    features: response.data.feature_importance
  };
};
```

## Mitigation Strategies

### Rate Limiting
```javascript
const applyRateLimiting = (config) => {
  const limiter = new RateLimiter({
    keyPrefix: 'ddos_shield',
    points: config.requests, // Number of requests
    duration: getDurationInSeconds(config.period), // Per duration
    blockDuration: config.blockDuration || 60 // Block for 60 seconds
  });

  return async (req, res, next) => {
    try {
      await limiter.consume(req.ip);
      next();
    } catch (rejRes) {
      res.status(429).send('Too Many Requests');
    }
  };
};
```

### Traffic Scrubbing
```javascript
const initiateTrafficScrubbing = (attackId, target) => {
  // Redirect traffic through scrubbing centers
  const scrubbingConfig = {
    attackId,
    target,
    scrubbingCenters: [
      'scrub1.ddosshield.com',
      'scrub2.ddosshield.com'
    ],
    filters: [
      'rate_limit_1000_pps',
      'geo_filter_china',
      'signature_filter_syn_flood'
    ]
  };

  return deployScrubbingRules(scrubbingConfig);
};
```

### Blackhole Routing
```javascript
const applyBlackholeRouting = (targetIP, duration = 3600) => {
  // Configure BGP blackhole routing
  const blackholeConfig = {
    target: targetIP,
    duration,
    communities: ['65535:666'], // Blackhole community
    description: `DDoS mitigation for ${targetIP}`
  };

  return bgpManager.injectBlackholeRoute(blackholeConfig);
};
```

## Configuration

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ddosshield
INFLUXDB_URL=http://localhost:8086
REDIS_URI=redis://localhost:6379

# ML Engine
ML_ENGINE_URL=http://localhost:5000

# Network Monitoring
SNIFFING_INTERFACE=eth0
PROMISCUOUS_MODE=true

# BGP Configuration
BGP_ROUTER_IP=192.168.1.1
BGP_ASN=65000

# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EMAIL_SMTP_HOST=smtp.gmail.com
```

### Detection Configuration
```javascript
const detectionConfig = {
  statistical: {
    enabled: true,
    sensitivity: 'medium', // 'low', 'medium', 'high'
    baselineWindow: 7 * 24 * 60 * 60 * 1000, // 7 days
    updateInterval: 60 * 60 * 1000 // 1 hour
  },
  signature: {
    enabled: true,
    updateInterval: 24 * 60 * 60 * 1000, // Daily
    customSignatures: []
  },
  ml: {
    enabled: true,
    modelVersion: 'v3.1',
    confidenceThreshold: 0.85,
    retrainingInterval: 7 * 24 * 60 * 60 * 1000 // Weekly
  },
  thresholds: {
    synFlood: 10000, // pps
    udpFlood: 50000, // pps
    httpFlood: 1000,  // rps
    amplification: 100000 // pps
  }
};
```

## Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  ddosshield-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/ddosshield
      - REDIS_URI=redis://redis:6379
    depends_on:
      - mongodb
      - redis
    cap_add:
      - NET_ADMIN
    network_mode: host

  packet-capture:
    image: ddosshield/packet-capture
    network_mode: host
    cap_add:
      - NET_RAW
      - NET_ADMIN

  ml-engine:
    build: ../ml-engine
    ports:
      - "5000:5000"

  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"

  redis:
    image: redis:7.0
    ports:
      - "6379:6379"
```

## Monitoring & Observability

### Key Metrics
- Attack detection rate and accuracy
- Mitigation effectiveness
- False positive/negative rates
- Traffic throughput and latency
- System resource utilization
- Network interface statistics

### Real-time Dashboards
- Live traffic visualization
- Attack heatmaps
- Geographic attack distribution
- Mitigation status overview
- Performance metrics

### Alerting
```javascript
const alertConfig = {
  attacks: {
    highSeverity: {
      channels: ['slack', 'email', 'sms'],
      escalation: true
    },
    mediumSeverity: {
      channels: ['slack'],
      escalation: false
    }
  },
  thresholds: {
    pps: 100000,
    bps: 1000000000, // 1Gbps
    connections: 50000
  }
};
```

## Security Considerations

### Network Security
- Traffic encryption for sensitive communications
- Secure API authentication and authorization
- Input validation and sanitization
- Rate limiting on API endpoints

### Data Protection
- Encryption of stored attack data
- Data retention policies
- Anonymization of sensitive information
- Secure backup procedures

### Operational Security
- Regular security audits
- Penetration testing
- Incident response procedures
- Access control and monitoring

## Development

### Local Setup
```bash
# Install dependencies
npm install

# Start databases
docker-compose up -d mongodb redis influxdb

# Configure network interface for packet capture
sudo chmod +x configure_interface.sh
./configure_interface.sh

# Start development server
npm run dev

# Start packet capture (requires root)
sudo npm run capture
```

### Testing
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Load testing
npm run test:load

# DDoS simulation testing
npm run test:ddos-simulation
```

## Contributing

1. Follow the established code style and architecture patterns
2. Add comprehensive tests for new detection algorithms
3. Update documentation for configuration changes
4. Ensure ML models are properly versioned and tested
5. Test mitigation strategies in isolated environments

## License

This project is licensed under the MIT License.