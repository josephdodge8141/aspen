import { aspenClient } from './base';

export interface RunExpertRequest {
  expert_id: number;
  input_params: Record<string, any>;
  base?: Record<string, any>;
}

export interface RunExpertResponse {
  run_id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface RunWorkflowRequest {
  workflow_id: number;
  starting_inputs: Record<string, any>;
}

export interface WorkflowStep {
  node_id: number;
  node_type: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  status: string;
}

export interface RunWorkflowResponse {
  run_id: string;
  steps: WorkflowStep[];
}

export interface RunEvent {
  ts: string;
  level: string;
  message: string;
  data?: Record<string, any>;
}

class ChatService {
  async runExpert(data: RunExpertRequest): Promise<RunExpertResponse> {
    return aspenClient.post<RunExpertResponse>('/api/v1/chat/experts:run', data);
  }

  async runWorkflow(data: RunWorkflowRequest): Promise<RunWorkflowResponse> {
    return aspenClient.post<RunWorkflowResponse>('/api/v1/chat/workflows:run', data);
  }

  streamRunEvents(runId: string): EventSource {
    return aspenClient.createEventSource(`/api/v1/chat/runs/${runId}/events`);
  }
}

export const chatService = new ChatService(); 