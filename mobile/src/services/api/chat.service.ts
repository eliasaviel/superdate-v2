import { apiClient } from './client';

export const chatService = {
  getMessages: (matchId: string) =>
    apiClient.get(`/chat/${matchId}/messages`).then((r) => r.data),
  sendMessage: (matchId: string, message_text: string) =>
    apiClient.post(`/chat/${matchId}/messages`, { message_text }).then((r) => r.data),
};
