import { apiClient } from './client';

export const matchService = {
  getMatches: () => apiClient.get('/matches').then((r) => r.data),
};
