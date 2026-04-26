import { apiClient } from './client';

export const userService = {
  getMe: () => apiClient.get('/users/me').then((r) => r.data),
  updateMe: (data: Record<string, any>) => apiClient.patch('/users/me', data).then((r) => r.data),
  updatePreferences: (data: { min_age_pref?: number; max_age_pref?: number; interested_in?: string }) =>
    apiClient.patch('/users/me/preferences', data).then((r) => r.data),
};
