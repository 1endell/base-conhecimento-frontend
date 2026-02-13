
import { NoteType, NoteResponse, NoteDetail, GraphStats, UserResponse, TagBrief, JobStatusResponse } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://notes-api.reverse.eng.br';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('kd_access_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('kd_access_token');
      window.location.hash = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || 'API request failed');
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  // Auth
  async login(credentials: any) {
    return this.request<{ access_token: string }>('/auth/token', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: any) {
    return this.request<UserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request<UserResponse>('/auth/me');
  }

  // Notes
  async listNotes(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ items: NoteResponse[], total: number }>(`/notes?${query}`);
  }

  async getNote(id: string) {
    return this.request<NoteDetail>(`/notes/${id}`);
  }

  async createNote(note: any) {
    return this.request<NoteResponse>('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: string, note: any) {
    return this.request<NoteResponse>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  }

  async deleteNote(id: string) {
    return this.request<void>(`/notes/${id}`, { method: 'DELETE' });
  }

  async pinNote(id: string) {
    return this.request<NoteResponse>(`/notes/${id}/pin`, { method: 'PATCH' });
  }

  async unpinNote(id: string) {
    return this.request<NoteResponse>(`/notes/${id}/unpin`, { method: 'PATCH' });
  }

  async archiveNote(id: string) {
    return this.request<NoteResponse>(`/notes/${id}/archive`, { method: 'PATCH' });
  }

  // Tags
  async listTags() {
    return this.request<TagBrief[]>('/tags');
  }

  async getTagTree() {
    return this.request<any[]>('/tags/tree');
  }

  // Graph
  async getGraphStats() {
    return this.request<GraphStats>('/graph/stats');
  }

  async getFullGraph() {
    return this.request<any>('/graph/full');
  }

  // Documents
  async listJobs() {
    return this.request<{ items: JobStatusResponse[], total: number }>('/documents/jobs');
  }

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<any>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // Search
  async advancedSearch(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/search/advanced?${query}`);
  }
}

export const api = new ApiService();
