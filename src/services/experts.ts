import { aspenClient } from './base';

export interface Expert {
  id: number;
  name: string;
  model_name: string;
  status: string;
  team_id: number;
  created_on: string;
}

export interface CreateExpertRequest {
  name: string;
  model_name: string;
  team_id?: number;
}

class ExpertsService {
  async listExperts(): Promise<Expert[]> {
    return aspenClient.get<Expert[]>('/api/v1/experts');
  }

  async getExpert(expertId: number): Promise<Expert> {
    return aspenClient.get<Expert>(`/api/v1/experts/${expertId}`);
  }

  async createExpert(data: CreateExpertRequest): Promise<Expert> {
    return aspenClient.post<Expert>('/api/v1/experts', data);
  }

  async updateExpert(expertId: number, data: Partial<CreateExpertRequest>): Promise<Expert> {
    return aspenClient.put<Expert>(`/api/v1/experts/${expertId}`, data);
  }

  async deleteExpert(expertId: number): Promise<void> {
    return aspenClient.delete(`/api/v1/experts/${expertId}`);
  }


}

export const expertsService = new ExpertsService(); 