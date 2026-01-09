export interface Tool {
  id: number;
  name: string;
  subdomain: string;
  color: string;
  description?: string;
}

export interface ToolDetailProps {
  toolId: number;
  toolName: string;
  subdomain: string;
  color: string;
  description: string;
}
