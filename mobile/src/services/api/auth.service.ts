import { apiClient } from './client';

export const authService = {
  register: (data: { email?: string; phone?: string; password: string; first_name?: string; last_name?: string }) =>
    apiClient.post('/auth/register', data).then((r) => r.data),

  login: (data: { email?: string; phone?: string; password: string }) =>
    apiClient.post('/auth/login', data).then((r) => r.data),
};
