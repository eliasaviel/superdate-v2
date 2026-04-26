import { apiClient } from './client';

export const vibecheckService = {
  schedule: (matchId: string, scheduledAt?: string) =>
    apiClient.post('/vibe-checks', { matchId, scheduledAt }).then(r => r.data),

  get: (matchId: string) =>
    apiClient.get(`/vibe-checks/${matchId}`).then(r => r.data),

  confirm: (matchId: string) =>
    apiClient.post(`/vibe-checks/${matchId}/confirm`).then(r => r.data),
};
