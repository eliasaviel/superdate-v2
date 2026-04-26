import { apiClient } from './client';

export const photoService = {
  uploadPhoto: async (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('photo', { uri, name: filename, type } as any);

    return apiClient.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  deletePhoto: (photoId: string) =>
    apiClient.delete(`/photos/${photoId}`).then((r) => r.data),

  setPrimary: (photoId: string) =>
    apiClient.patch(`/photos/${photoId}/primary`).then((r) => r.data),
};
