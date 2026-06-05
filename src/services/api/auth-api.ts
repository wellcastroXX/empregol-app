import type { UserRole } from '@/types';
import { apiRequest } from './client';
import type { ApiUser } from './mappers';

export interface ApiLoginResponse {
  status: string;
  data: { accessToken: string; refreshToken: string; user: ApiUser };
}
type MessageResponse = { status: string; message: string };

/** Auth endpoints are split by role: /auth/athletes/* and /auth/contractors/*. */
const segment = (role: UserRole) => (role === 'athlete' ? 'athletes' : 'contractors');

export const authApi = {
  register(role: UserRole, body: object) {
    return apiRequest<MessageResponse>(`/auth/${segment(role)}/register`, { method: 'POST', body });
  },
  login(role: UserRole, email: string, password: string) {
    return apiRequest<ApiLoginResponse>(`/auth/${segment(role)}/login`, {
      method: 'POST',
      body: { email, password },
    });
  },
  verifyEmail(role: UserRole, email: string, code: string) {
    return apiRequest<MessageResponse>(`/auth/${segment(role)}/verify-email`, {
      method: 'POST',
      body: { email, code },
    });
  },
  resendCode(role: UserRole, email: string) {
    return apiRequest<MessageResponse>(`/auth/${segment(role)}/resend-code`, {
      method: 'POST',
      body: { email },
    });
  },
  forgotPassword(role: UserRole, email: string) {
    return apiRequest<MessageResponse>(`/auth/${segment(role)}/forgot-password`, {
      method: 'POST',
      body: { email },
    });
  },
  /** Role-agnostic social login (Google/Apple via Firebase). Matches by e-mail. */
  socialLogin(provider: 'google' | 'apple', idToken: string) {
    return apiRequest<ApiLoginResponse>('/auth/social/login', {
      method: 'POST',
      body: { provider, idToken },
    });
  },
};
