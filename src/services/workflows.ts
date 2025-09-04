import { aspenClient } from './base';

export interface Workflow {
  id: number;
  name: string;
  description: string;
  team_id: number;
  node_count: number;
  created_on: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  team_id?: number;
}

class WorkflowsService {
  async listWorkflows(): Promise<Workflow[]> {
    return aspenClient.get<Workflow[]>('/api/v1/workflows');
  }

  async getWorkflow(workflowId: number): Promise<Workflow> {
    return aspenClient.get<Workflow>(`/api/v1/workflows/${workflowId}`);
  }

  async createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    return aspenClient.post<Workflow>('/api/v1/workflows', data);
  }

  async updateWorkflow(workflowId: number, data: Partial<CreateWorkflowRequest>): Promise<Workflow> {
    return aspenClient.put<Workflow>(`/api/v1/workflows/${workflowId}`, data);
  }

  async deleteWorkflow(workflowId: number): Promise<void> {
    return aspenClient.delete(`/api/v1/workflows/${workflowId}`);
  }
}

export const workflowsService = new WorkflowsService(); 