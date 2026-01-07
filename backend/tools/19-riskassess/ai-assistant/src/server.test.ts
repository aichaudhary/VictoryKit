/**
 * RiskAssess AI Assistant Tests
 * Tool 19 - AI Assistant Testing Suite
 */

import { WebSocket } from 'ws';
import { RiskAssessAIAssistant } from './server';
import { RiskQuery, AnalysisType, AIResponse } from './types';

describe('RiskAssess AI Assistant', () => {
  let server: RiskAssessAIAssistant;
  const PORT = 6019;

  beforeAll(async () => {
    server = new RiskAssessAIAssistant();
    await server.start(PORT);
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('WebSocket Connection', () => {
    test('should establish WebSocket connection', (done) => {
      const ws = new WebSocket(`ws://localhost:${PORT}`);

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    test('should receive welcome message on connection', (done) => {
      const ws = new WebSocket(`ws://localhost:${PORT}`);

      ws.on('message', (data: Buffer) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('welcome');
        expect(message.content).toContain('RiskAssess AI Assistant');
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Risk Analysis', () => {
    test('should handle risk analysis query', (done) => {
      const ws = new WebSocket(`ws://localhost:${PORT}`);
      const testQuery: RiskQuery = {
        type: 'risk_analysis',
        data: {
          name: 'Test Risk',
          category: 'cybersecurity',
          probability: 4,
          impact: 3,
          description: 'Test risk scenario'
        }
      };

      ws.on('open', () => {
        ws.send(JSON.stringify(testQuery));
      });

      ws.on('message', (data: Buffer) => {
        const response: AIResponse = JSON.parse(data.toString());
        expect(response.type).toBe('risk_analysis');
        expect(response.id).toBeDefined();
        expect(response.content).toBeDefined();
        expect(response.timestamp).toBeInstanceOf(Date);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    test('should handle threat modeling query', (done) => {
      const ws = new WebSocket(`ws://localhost:${PORT}`);
      const testQuery: RiskQuery = {
        type: 'threat_modeling',
        data: {
          system: 'Test System',
          assets: ['user_data', 'payment_info'],
          attackSurface: ['web_app', 'api']
        }
      };

      ws.on('open', () => {
        ws.send(JSON.stringify(testQuery));
      });

      ws.on('message', (data: Buffer) => {
        const response: AIResponse = JSON.parse(data.toString());
        expect(response.type).toBe('threat_modeling');
        expect(response.content).toBeDefined();
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    test('should handle impact assessment query', (done) => {
      const ws = new WebSocket(`ws://localhost:${PORT}`);
      const testQuery: RiskQuery = {
        type: 'impact_assessment',
        data: {
          riskName: 'Data Breach',
          businessUnit: 'IT',
          financialImpact: {
            directCosts: 100000,
            indirectCosts: 50000,
            lostRevenue: 200000,
            recoveryCosts: 25000,
            currency: 'USD'
          }
        }
      };

      ws.on('open', () => {
        ws.send(JSON.stringify(testQuery));
      });

      ws.on('message', (data: Buffer) => {
        const response: AIResponse = JSON.parse(data.toString());
        expect(response.type).toBe('impact_assessment');
        expect(response.content).toBeDefined();
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid query type', (done) => {
      const ws = new WebSocket(`ws://localhost:${PORT}`);
      const invalidQuery = {
        type: 'invalid_type',
        data: {}
      };

      ws.on('open', () => {
        ws.send(JSON.stringify(invalidQuery));
      });

      ws.on('message', (data: Buffer) => {
        const response: AIResponse = JSON.parse(data.toString());
        expect(response.type).toBe('unknown');
        expect(response.content).toContain('not sure how to help');
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    test('should handle malformed JSON', (done) => {
      const ws = new WebSocket(`ws://localhost:${PORT}`);

      ws.on('open', () => {
        ws.send('invalid json');
      });

      ws.on('message', (data: Buffer) => {
        const response = JSON.parse(data.toString());
        expect(response.type).toBe('error');
        expect(response.content).toContain('error processing');
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Utility Functions', () => {
    test('should calculate risk score correctly', () => {
      const riskData = { probability: 4, impact: 3 };
      const score = calculateRiskScore(riskData);
      expect(score).toBe(12); // 4 * 3
    });

    test('should cap risk score at maximum', () => {
      const riskData = { probability: 5, impact: 5 };
      const score = calculateRiskScore(riskData);
      expect(score).toBe(25); // Capped at 25
    });

    test('should extract recommendations from content', () => {
      const content = `
        Risk Analysis Results:
        1. Implement multi-factor authentication
        2. Regular security training recommended
        3. Consider encryption for data at rest
        4. Establish monitoring systems
        5. Develop incident response plan
      `;
      const recommendations = extractRecommendations(content);
      expect(recommendations).toHaveLength(5);
      expect(recommendations[0]).toContain('authentication');
    });
  });
});

// Mock implementations for testing
function calculateRiskScore(data: any): number {
  const probability = data.probability || 3;
  const impact = data.impact || 3;
  return Math.min(probability * impact, 25);
}

function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.includes('recommend') || line.includes('should') || line.includes('consider') ||
        line.includes('implement') || line.includes('establish') || line.includes('develop')) {
      recommendations.push(line.trim());
    }
  }

  return recommendations.slice(0, 5);
}

// Mock server class for testing
class RiskAssessAIAssistant {
  private server: any;

  async start(port: number): Promise<void> {
    // Mock implementation
    return Promise.resolve();
  }

  async stop(): Promise<void> {
    // Mock implementation
    return Promise.resolve();
  }
}