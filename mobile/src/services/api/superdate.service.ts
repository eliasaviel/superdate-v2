import { apiClient } from './client';

export const superdateService = {
  propose: (matchId: string, venueId: string, proposedDate?: string) =>
    apiClient.post('/superdate', { matchId, venueId, proposedDate }).then(r => r.data),

  getProposal: (matchId: string) =>
    apiClient.get(`/superdate/${matchId}`).then(r => r.data),

  payHalf: (matchId: string) =>
    apiClient.post(`/superdate/${matchId}/pay`).then(r => r.data),
};
