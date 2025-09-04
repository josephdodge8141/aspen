import { aspenClient } from './base';

export interface Service {
  id: number;
  name: string;
  environment: 'dev' | 'stage' | 'prod';
  api_key_last4: string;
  api_key_plaintext?: string;
}

export interface CreateServiceRequest {
  name: string;
  environment: 'dev' | 'stage' | 'prod';
}

export interface ServiceSegment {
  id: number;
  service_id: number;
  name: string;
}

export interface CreateSegmentRequest {
  name: string;
}

export interface ServiceExposure {
  service_id: number;
  service_name: string;
  experts: Array<{
    id: number;
    name: string;
    model_name: string;
  }>;
  workflows: Array<{
    id: number;
    name: string;
    node_count: number;
  }>;
}

export interface WhoAmIResponse {
  type: 'user' | 'service';
  user_id?: number;
  email?: string;
  service_id?: number;
  name?: string;
  environment?: string;
  segments?: string[];
}

class ServicesService {
  async createService(data: CreateServiceRequest): Promise<Service> {
    return aspenClient.post<Service>('/api/v1/services', data);
  }

  async listServices(): Promise<Service[]> {
    return aspenClient.get<Service[]>('/api/v1/services');
  }

  async getService(serviceId: number): Promise<Service> {
    return aspenClient.get<Service>(`/api/v1/services/${serviceId}`);
  }

  async deleteService(serviceId: number): Promise<void> {
    return aspenClient.delete(`/api/v1/services/${serviceId}`);
  }

  async rotateApiKey(serviceId: number): Promise<Service> {
    return aspenClient.post<Service>(`/api/v1/services/${serviceId}:rotate-key`);
  }

  async createSegment(serviceId: number, data: CreateSegmentRequest): Promise<ServiceSegment> {
    return aspenClient.post<ServiceSegment>(`/api/v1/services/${serviceId}/segments`, data);
  }

  async listSegments(serviceId: number): Promise<ServiceSegment[]> {
    return aspenClient.get<ServiceSegment[]>(`/api/v1/services/${serviceId}/segments`);
  }

  async deleteSegment(serviceId: number, segmentId: number): Promise<void> {
    return aspenClient.delete(`/api/v1/services/${serviceId}/segments/${segmentId}`);
  }

  async linkToExperts(serviceId: number, expertIds: number[]): Promise<{ linked: number[] }> {
    return aspenClient.post(`/api/v1/services/${serviceId}/experts`, { expert_ids: expertIds });
  }

  async unlinkFromExpert(serviceId: number, expertId: number): Promise<void> {
    return aspenClient.delete(`/api/v1/services/${serviceId}/experts/${expertId}`);
  }

  async linkToWorkflows(serviceId: number, workflowIds: number[]): Promise<{ linked: number[] }> {
    return aspenClient.post(`/api/v1/services/${serviceId}/workflows`, { workflow_ids: workflowIds });
  }

  async unlinkFromWorkflow(serviceId: number, workflowId: number): Promise<void> {
    return aspenClient.delete(`/api/v1/services/${serviceId}/workflows/${workflowId}`);
  }

  async getServiceExposure(serviceId: number): Promise<ServiceExposure> {
    return aspenClient.get<ServiceExposure>(`/api/v1/services/${serviceId}/exposure`);
  }

  async whoAmI(): Promise<WhoAmIResponse> {
    return aspenClient.get<WhoAmIResponse>('/api/v1/services/whoami');
  }
}

export const servicesService = new ServicesService(); 