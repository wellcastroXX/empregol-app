import { apiRequest } from './client';

export const notificationsApi = {
  /** Regista o token de push (Expo) do usuário logado. */
  async registerDevice(token: string, platform?: 'ios' | 'android'): Promise<void> {
    await apiRequest('/notifications/devices', { method: 'POST', body: { token, platform } });
  },
  /** Remove o token (logout / opt-out). */
  async unregisterDevice(token: string): Promise<void> {
    await apiRequest(`/notifications/devices/${encodeURIComponent(token)}`, { method: 'DELETE' });
  },
};
