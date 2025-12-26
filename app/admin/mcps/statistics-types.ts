// Types for statistics (can be imported in client components)
export interface ToolStatistics {
  toolId: string;
  toolName: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  avgResponseTimeMs: number;
  lastCalledAt: string | null;
}

export interface MCPStatistics {
  mcpId: string;
  totalToolCalls: number;
  totalTools: number;
  mostUsedTool: {
    name: string;
    callCount: number;
  } | null;
  successRate: number;
  avgResponseTimeMs: number;
}

export interface DashboardStatistics {
  totalToolCalls: number;
  totalMCPs: number;
  totalTools: number;
  overallSuccessRate: number;
  topTools: Array<{ toolName: string; mcpName: string; callCount: number }>;
}
