import { apiClient } from './client';

export const discoveryService = {
  getCandidates: (filters?: { gender?: string; religion?: string; city?: string; min_age?: number; max_age?: number }) =>
    apiClient.get('/discovery', { params: filters }).then((r) => r.data),
};
