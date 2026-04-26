import { apiClient } from './client';

export const swipeService = {
  swipe: (swiped_id: string, action: 'LIKE' | 'PASS') =>
    apiClient.post('/swipes', { swiped_id, action }).then((r) => r.data),
};
