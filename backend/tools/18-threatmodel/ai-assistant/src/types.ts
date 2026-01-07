import { z } from 'zod';

// Threat Modeling Types
export const ThreatCategorySchema = z.enum([
  'STRIDE_Spoofing',
  'STRIDE_Tampering',
  'STRIDE_Repudiation',
  'STRIDE_Information_Disclosure',
  'STRIDE_Denial_of_Service',
  'STRIDE_Elevation_of_Privilege',
  'PASTA_Broken_Access_Control',
  'PASTA_Broken_Authentication',
  'PASTA_Injection',
  'PASTA_Insecure_Design',
  'PASTA_Security_Misconfiguration',
  'PASTA_Insecure_Cryptography',
  'PASTA_Insecure_Communication',
  'PASTA_Insecure_Data_Handling',
  'OCTAVE_Information_Asset',
  'OCTAVE_Process',
  'OCTAVE_Personnel',
  'OCTAVE_Technology',
  'OCTAVE_Physical',
  'Custom'
]);

export const ThreatSeveritySchema = z.enum(['Critical', 'High', 'Medium', 'Low', 'Info']);

export const ThreatLikelihoodSchema = z.enum(['Very_High', 'High', 'Medium', 'Low', 'Very_Low']);

export const MitigationStatusSchema = z.enum(['Not_Implemented', 'Partially_Implemented', 'Implemented', 'Not_Applicable']);

export const ComponentTypeSchema = z.enum([
  'Web_Application',
  'API',
  'Database',
  'Authentication_System',
  'Authorization_System',
  'Network_Infrastructure',
  'External_Service',
  'Mobile_App',
  'Desktop_App',
  'IoT_Device',
  'Cloud_Service',
  'Third_Party_Service',
  'Custom'
]);

// AI Assistant Types
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);

export const AIModelSchema = z.enum([
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229'
]);

export const AnalysisTypeSchema = z.enum([
  'threat_identification',
  'risk_assessment',
  'mitigation_suggestions',
  'architecture_review',
  'compliance_check',
  'attack_vector_analysis'
]);

// WebSocket Message Types
export const WebSocketMessageTypeSchema = z.enum([
  'threat_analysis_request',
  'threat_analysis_response',
  'model_update',
  'component_analysis',
  'mitigation_recommendation',
  'risk_calculation',
  'session_sync',
  'error'
]);

// Data Transfer Objects
export const ThreatModelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  components: z.array(z.string().uuid()),
  threats: z.array(z.string().uuid()),
  mitigations: z.array(z.string().uuid()),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid(),
  tags: z.array(z.string()).optional()
});

export const ComponentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: ComponentTypeSchema,
  description: z.string().max(500),
  properties: z.record(z.any()),
  trustLevel: z.number().min(0).max(10),
  dataSensitivity: z.enum(['Public', 'Internal', 'Confidential', 'Restricted']),
  interfaces: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    type: z.enum(['API', 'UI', 'Database', 'Network', 'File_System']),
    direction: z.enum(['Inbound', 'Outbound', 'Bidirectional'])
  }))
});

export const ThreatSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  category: ThreatCategorySchema,
  severity: ThreatSeveritySchema,
  likelihood: ThreatLikelihoodSchema,
  impact: z.number().min(1).max(10),
  affectedComponents: z.array(z.string().uuid()),
  prerequisites: z.array(z.string()),
  examples: z.array(z.string()),
  references: z.array(z.string().url()),
  discoveredAt: z.date(),
  status: z.enum(['Open', 'Investigating', 'Mitigated', 'Accepted', 'Closed'])
});

export const MitigationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  threatId: z.string().uuid(),
  type: z.enum(['Technical', 'Administrative', 'Physical']),
  cost: z.enum(['Low', 'Medium', 'High', 'Very_High']),
  complexity: z.enum(['Low', 'Medium', 'High', 'Very_High']),
  effectiveness: z.number().min(0).max(100),
  status: MitigationStatusSchema,
  implementationNotes: z.string().max(2000),
  responsibleParty: z.string(),
  deadline: z.date().optional(),
  verificationMethod: z.string()
});

// AI Assistant Schemas
export const AIMessageSchema = z.object({
  id: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional()
});

export const AIConversationSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  messages: z.array(AIMessageSchema),
  model: AIModelSchema,
  context: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ThreatAnalysisRequestSchema = z.object({
  type: z.literal('threat_analysis_request'),
  sessionId: z.string().uuid(),
  modelId: z.string().uuid().optional(),
  componentId: z.string().uuid().optional(),
  analysisType: AnalysisTypeSchema,
  context: z.record(z.any()),
  userPrompt: z.string().optional()
});

export const ThreatAnalysisResponseSchema = z.object({
  type: z.literal('threat_analysis_response'),
  sessionId: z.string().uuid(),
  analysisId: z.string().uuid(),
  results: z.array(z.object({
    threat: ThreatSchema.partial(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    recommendations: z.array(z.string())
  })),
  metadata: z.object({
    model: AIModelSchema,
    processingTime: z.number(),
    tokensUsed: z.number()
  })
});

// WebSocket Schemas
export const WebSocketMessageSchema = z.discriminatedUnion('type', [
  ThreatAnalysisRequestSchema,
  ThreatAnalysisResponseSchema,
  z.object({
    type: z.literal('model_update'),
    sessionId: z.string().uuid(),
    modelData: ThreatModelSchema.partial()
  }),
  z.object({
    type: z.literal('component_analysis'),
    sessionId: z.string().uuid(),
    componentId: z.string().uuid(),
    analysis: z.record(z.any())
  }),
  z.object({
    type: z.literal('mitigation_recommendation'),
    sessionId: z.string().uuid(),
    threatId: z.string().uuid(),
    recommendations: z.array(MitigationSchema.partial())
  }),
  z.object({
    type: z.literal('risk_calculation'),
    sessionId: z.string().uuid(),
    riskScore: z.number().min(0).max(10),
    breakdown: z.record(z.number())
  }),
  z.object({
    type: z.literal('session_sync'),
    sessionId: z.string().uuid(),
    data: z.record(z.any())
  }),
  z.object({
    type: z.literal('error'),
    sessionId: z.string().uuid(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.any()
    })
  })
]);

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime?: number;
  };
}

// Session Management
export interface AISession {
  id: string;
  userId: string;
  modelId?: string;
  createdAt: Date;
  lastActivity: Date;
  context: Record<string, any>;
  conversationHistory: AIMessage[];
}

// Type Exports
export type ThreatCategory = z.infer<typeof ThreatCategorySchema>;
export type ThreatSeverity = z.infer<typeof ThreatSeveritySchema>;
export type ThreatLikelihood = z.infer<typeof ThreatLikelihoodSchema>;
export type MitigationStatus = z.infer<typeof MitigationStatusSchema>;
export type ComponentType = z.infer<typeof ComponentTypeSchema>;
export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type AIModel = z.infer<typeof AIModelSchema>;
export type AnalysisType = z.infer<typeof AnalysisTypeSchema>;
export type WebSocketMessageType = z.infer<typeof WebSocketMessageTypeSchema>;

export type ThreatModel = z.infer<typeof ThreatModelSchema>;
export type Component = z.infer<typeof ComponentSchema>;
export type Threat = z.infer<typeof ThreatSchema>;
export type Mitigation = z.infer<typeof MitigationSchema>;
export type AIMessage = z.infer<typeof AIMessageSchema>;
export type AIConversation = z.infer<typeof AIConversationSchema>;
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;