import { apiClient } from './client';

export const venuesService = {
  getAll: () => apiClient.get('/venues').then(r => r.data),
};
