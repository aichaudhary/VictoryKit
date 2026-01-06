/**
 * SOAR Engine AI Tools
 * Function definitions for LLM integration
 */

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  enum?: string[];
  default?: any;
}

export interface AITool {
  name: string;
  description: string;
  category: string;
  parameters: ToolParameter[];
  returns: {
    type: string;
    description: string;
  };
}

export const soarTools: AITool[] = [
  // ========== Case Management Tools ==========
  {
    name: 'create_case',
    description: 'Create a new security case from an alert, incident, or manual report',
    category: 'case_management',
    parameters: [
      { name: 'title', type: 'string', description: 'Case title describing the security incident', required: true },
      { name: 'description', type: 'string', description: 'Detailed description of the security incident', required: true },
      { name: 'priority', type: 'string', description: 'Case priority level', required: true, enum: ['low', 'medium', 'high', 'critical'] },
      { name: 'tags', type: 'array', description: 'Tags for categorization', required: false },
      { name: 'assignee', type: 'string', description: 'User to assign the case to', required: false },
      { name: 'source_alert_ids', type: 'array', description: 'Related alert IDs', required: false },
    ],
    returns: { type: 'Case', description: 'The created case object with ID' },
  },
  {
    name: 'update_case',
    description: 'Update an existing security case status, priority, or details',
    category: 'case_management',
    parameters: [
      { name: 'case_id', type: 'string', description: 'ID of the case to update', required: true },
      { name: 'status', type: 'string', description: 'New case status', required: false, enum: ['open', 'in_progress', 'pending', 'resolved', 'closed'] },
      { name: 'priority', type: 'string', description: 'New priority level', required: false, enum: ['low', 'medium', 'high', 'critical'] },
      { name: 'assignee', type: 'string', description: 'New assignee', required: false },
      { name: 'notes', type: 'string', description: 'Note to add to case timeline', required: false },
    ],
    returns: { type: 'Case', description: 'The updated case object' },
  },
  {
    name: 'escalate_case',
    description: 'Escalate a case to a higher priority or escalation tier',
    category: 'case_management',
    parameters: [
      { name: 'case_id', type: 'string', description: 'ID of the case to escalate', required: true },
      { name: 'reason', type: 'string', description: 'Reason for escalation', required: true },
      { name: 'escalation_tier', type: 'number', description: 'Escalation tier (1-3)', required: false, default: 1 },
      { name: 'notify', type: 'array', description: 'Users or groups to notify', required: false },
    ],
    returns: { type: 'Case', description: 'The escalated case with updated status' },
  },
  {
    name: 'get_case_details',
    description: 'Retrieve detailed information about a specific case',
    category: 'case_management',
    parameters: [
      { name: 'case_id', type: 'string', description: 'ID of the case', required: true },
      { name: 'include_timeline', type: 'boolean', description: 'Include full timeline', required: false, default: true },
      { name: 'include_artifacts', type: 'boolean', description: 'Include associated artifacts', required: false, default: true },
    ],
    returns: { type: 'Case', description: 'Complete case details' },
  },
  {
    name: 'search_cases',
    description: 'Search for cases matching specific criteria',
    category: 'case_management',
    parameters: [
      { name: 'query', type: 'string', description: 'Search query', required: false },
      { name: 'status', type: 'array', description: 'Filter by status', required: false },
      { name: 'priority', type: 'array', description: 'Filter by priority', required: false },
      { name: 'date_range', type: 'object', description: 'Date range filter', required: false },
      { name: 'tags', type: 'array', description: 'Filter by tags', required: false },
    ],
    returns: { type: 'array', description: 'Array of matching cases' },
  },

  // ========== Playbook Tools ==========
  {
    name: 'run_playbook',
    description: 'Execute an automated playbook for incident response',
    category: 'playbook',
    parameters: [
      { name: 'playbook_id', type: 'string', description: 'ID of the playbook to run', required: true },
      { name: 'case_id', type: 'string', description: 'Case to associate with execution', required: false },
      { name: 'parameters', type: 'object', description: 'Runtime parameters for playbook', required: false },
      { name: 'dry_run', type: 'boolean', description: 'Execute in dry-run mode', required: false, default: false },
    ],
    returns: { type: 'PlaybookExecution', description: 'Execution result with step outcomes' },
  },
  {
    name: 'get_playbook_status',
    description: 'Get the current status of a running playbook execution',
    category: 'playbook',
    parameters: [
      { name: 'execution_id', type: 'string', description: 'Playbook execution ID', required: true },
    ],
    returns: { type: 'PlaybookExecution', description: 'Current execution status and progress' },
  },
  {
    name: 'list_playbooks',
    description: 'List available playbooks, optionally filtered by category',
    category: 'playbook',
    parameters: [
      { name: 'category', type: 'string', description: 'Filter by category', required: false, enum: ['incident_response', 'threat_hunting', 'enrichment', 'remediation', 'identity', 'custom'] },
      { name: 'enabled_only', type: 'boolean', description: 'Only return enabled playbooks', required: false, default: true },
    ],
    returns: { type: 'array', description: 'Array of playbook summaries' },
  },

  // ========== Enrichment Tools ==========
  {
    name: 'enrich_ioc',
    description: 'Enrich an indicator of compromise with threat intelligence',
    category: 'enrichment',
    parameters: [
      { name: 'ioc_value', type: 'string', description: 'The IOC value (IP, domain, hash, etc.)', required: true },
      { name: 'ioc_type', type: 'string', description: 'Type of IOC', required: true, enum: ['ip', 'domain', 'hash', 'email', 'url', 'file'] },
      { name: 'sources', type: 'array', description: 'Specific sources to query', required: false },
      { name: 'add_to_case', type: 'string', description: 'Case ID to add results to', required: false },
    ],
    returns: { type: 'EnrichmentResult', description: 'Enrichment results from all sources' },
  },
  {
    name: 'bulk_enrich',
    description: 'Enrich multiple IOCs in a single request',
    category: 'enrichment',
    parameters: [
      { name: 'iocs', type: 'array', description: 'Array of IOCs with value and type', required: true },
      { name: 'sources', type: 'array', description: 'Sources to query', required: false },
    ],
    returns: { type: 'array', description: 'Array of enrichment results' },
  },
  {
    name: 'query_threat_intel',
    description: 'Query threat intelligence for indicators related to a threat actor or campaign',
    category: 'enrichment',
    parameters: [
      { name: 'query', type: 'string', description: 'Search query (actor name, campaign, malware family)', required: true },
      { name: 'type', type: 'string', description: 'Query type', required: false, enum: ['actor', 'campaign', 'malware', 'vulnerability'] },
    ],
    returns: { type: 'object', description: 'Threat intelligence report' },
  },

  // ========== Integration Tools ==========
  {
    name: 'query_integration',
    description: 'Query a specific integration for data',
    category: 'integration',
    parameters: [
      { name: 'integration_id', type: 'string', description: 'ID of the integration', required: true },
      { name: 'query', type: 'string', description: 'Query string (format depends on integration)', required: true },
      { name: 'time_range', type: 'object', description: 'Time range for query', required: false },
      { name: 'limit', type: 'number', description: 'Maximum results to return', required: false, default: 100 },
    ],
    returns: { type: 'object', description: 'Query results from integration' },
  },
  {
    name: 'execute_action',
    description: 'Execute an action through an integration (block IP, isolate host, etc.)',
    category: 'integration',
    parameters: [
      { name: 'integration_id', type: 'string', description: 'ID of the integration', required: true },
      { name: 'action', type: 'string', description: 'Action to execute', required: true },
      { name: 'target', type: 'string', description: 'Target of the action', required: true },
      { name: 'parameters', type: 'object', description: 'Additional action parameters', required: false },
    ],
    returns: { type: 'object', description: 'Action execution result' },
  },

  // ========== Automation Tools ==========
  {
    name: 'create_automation',
    description: 'Create a new automation rule',
    category: 'automation',
    parameters: [
      { name: 'name', type: 'string', description: 'Automation rule name', required: true },
      { name: 'description', type: 'string', description: 'Rule description', required: true },
      { name: 'trigger', type: 'object', description: 'Trigger configuration', required: true },
      { name: 'conditions', type: 'array', description: 'Conditions that must be met', required: true },
      { name: 'actions', type: 'array', description: 'Actions to execute', required: true },
      { name: 'enabled', type: 'boolean', description: 'Enable immediately', required: false, default: false },
    ],
    returns: { type: 'Automation', description: 'Created automation rule' },
  },
  {
    name: 'toggle_automation',
    description: 'Enable or disable an automation rule',
    category: 'automation',
    parameters: [
      { name: 'automation_id', type: 'string', description: 'Automation rule ID', required: true },
      { name: 'enabled', type: 'boolean', description: 'Enable or disable', required: true },
    ],
    returns: { type: 'Automation', description: 'Updated automation rule' },
  },

  // ========== Reporting Tools ==========
  {
    name: 'generate_report',
    description: 'Generate a security report',
    category: 'reporting',
    parameters: [
      { name: 'report_type', type: 'string', description: 'Type of report', required: true, enum: ['executive', 'incident', 'compliance', 'performance', 'threat'] },
      { name: 'format', type: 'string', description: 'Output format', required: true, enum: ['pdf', 'html', 'json'] },
      { name: 'date_range', type: 'object', description: 'Date range for report', required: false },
      { name: 'case_ids', type: 'array', description: 'Specific cases to include', required: false },
    ],
    returns: { type: 'object', description: 'Generated report or download link' },
  },
  {
    name: 'get_metrics',
    description: 'Get SOC performance metrics',
    category: 'reporting',
    parameters: [
      { name: 'metric_type', type: 'string', description: 'Type of metrics', required: true, enum: ['cases', 'playbooks', 'automations', 'response_times', 'sla'] },
      { name: 'time_range', type: 'string', description: 'Time range', required: false, enum: ['24h', '7d', '30d', '90d'] },
      { name: 'group_by', type: 'string', description: 'Grouping period', required: false, enum: ['hour', 'day', 'week', 'month'] },
    ],
    returns: { type: 'object', description: 'Metrics data with trends' },
  },

  // ========== Alert Tools ==========
  {
    name: 'create_alert',
    description: 'Create a new security alert',
    category: 'alert',
    parameters: [
      { name: 'title', type: 'string', description: 'Alert title', required: true },
      { name: 'description', type: 'string', description: 'Alert description', required: true },
      { name: 'severity', type: 'string', description: 'Alert severity', required: true, enum: ['low', 'medium', 'high', 'critical'] },
      { name: 'source', type: 'string', description: 'Alert source', required: true },
      { name: 'artifacts', type: 'array', description: 'Associated artifacts/IOCs', required: false },
    ],
    returns: { type: 'object', description: 'Created alert' },
  },
  {
    name: 'acknowledge_alert',
    description: 'Acknowledge an alert',
    category: 'alert',
    parameters: [
      { name: 'alert_id', type: 'string', description: 'Alert ID', required: true },
      { name: 'notes', type: 'string', description: 'Acknowledgment notes', required: false },
    ],
    returns: { type: 'object', description: 'Updated alert' },
  },
];

// Tool execution helper
export const getToolByName = (name: string): AITool | undefined => {
  return soarTools.find(tool => tool.name === name);
};

// Get tools by category
export const getToolsByCategory = (category: string): AITool[] => {
  return soarTools.filter(tool => tool.category === category);
};

// Get all tool categories
export const getToolCategories = (): string[] => {
  return [...new Set(soarTools.map(tool => tool.category))];
};

// Format tools for LLM function calling
export const formatToolsForLLM = (): object[] => {
  return soarTools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: tool.parameters.reduce((acc, param) => ({
          ...acc,
          [param.name]: {
            type: param.type,
            description: param.description,
            ...(param.enum && { enum: param.enum }),
            ...(param.default !== undefined && { default: param.default }),
          },
        }), {}),
        required: tool.parameters.filter(p => p.required).map(p => p.name),
      },
    },
  }));
};

export default soarTools;
