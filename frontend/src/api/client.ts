import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  count?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Resources
  async getResources() {
    const { data } = await this.client.get('/api/resources');
    return data as ApiResponse<any[]>;
  }

  async getResource(id: number) {
    const { data } = await this.client.get(`/api/resources/${id}`);
    return data as ApiResponse<any>;
  }

  async createResource(payload: any) {
    const { data } = await this.client.post('/api/resources', payload);
    return data as ApiResponse<any>;
  }

  async updateResource(id: number, payload: any) {
    const { data } = await this.client.put(`/api/resources/${id}`, payload);
    return data as ApiResponse<any>;
  }

  async deleteResource(id: number) {
    const { data } = await this.client.delete(`/api/resources/${id}`);
    return data as ApiResponse<void>;
  }

  // Buildings
  async getBuildings() {
    const { data } = await this.client.get('/api/buildings');
    return data as ApiResponse<any[]>;
  }

  async getBuilding(id: number) {
    const { data } = await this.client.get(`/api/buildings/${id}`);
    return data as ApiResponse<any>;
  }

  async createBuilding(payload: any) {
    const { data } = await this.client.post('/api/buildings', payload);
    return data as ApiResponse<any>;
  }

  async updateBuilding(id: number, payload: any) {
    const { data } = await this.client.put(`/api/buildings/${id}`, payload);
    return data as ApiResponse<any>;
  }

  async deleteBuilding(id: number) {
    const { data } = await this.client.delete(`/api/buildings/${id}`);
    return data as ApiResponse<void>;
  }

  // Technologies
  async getTechnologies() {
    const { data } = await this.client.get('/api/technologies');
    return data as ApiResponse<any[]>;
  }

  async createTechnology(payload: any) {
    const { data } = await this.client.post('/api/technologies', payload);
    return data as ApiResponse<any>;
  }

  // Categories
  async getCategories() {
    const { data } = await this.client.get('/api/categories');
    return data as ApiResponse<any[]>;
  }

  async createCategory(payload: any) {
    const { data } = await this.client.post('/api/categories', payload);
    return data as ApiResponse<any>;
  }

  // Knowledge
  async getKnowledge() {
    const { data } = await this.client.get('/api/knowledge');
    return data as ApiResponse<any[]>;
  }

  async createKnowledge(payload: any) {
    const { data } = await this.client.post('/api/knowledge', payload);
    return data as ApiResponse<any>;
  }
}

export default new ApiClient();
