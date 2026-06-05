import type { AuthCredentials, AuthResult, SignUpPayload, UserRole } from '@/types';
import { ApiError } from './api/client';
import { authApi } from './api/auth-api';
import {
  toAthleteRegisterBody,
  toContractorRegisterBody,
  toUserProfile,
} from './api/mappers';

/** Domain error surfaced to the UI (pt-BR message + backend code + role context). */
export class AuthError extends Error {
  role?: UserRole;
  constructor(message: string, readonly code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
  }
}

/** Turns an ApiError into a user-facing AuthError (prefers field errors on 422). */
function toAuthError(err: unknown): AuthError {
  if (err instanceof ApiError) {
    if (err.code === 'VALIDATION_ERROR' && err.fieldErrors) {
      const first = Object.values(err.fieldErrors)[0]?.[0];
      return new AuthError(first ?? err.message, err.code);
    }
    return new AuthError(err.message, err.code);
  }
  return new AuthError('Não foi possível completar a operação. Tente novamente.');
}

/**
 * Auth boundary backed by the Empregol HTTP API.
 * Flow: register → verify-email (code) → login (returns JWT tokens + user).
 */
export interface AuthService {
  register(payload: SignUpPayload): Promise<void>;
  login(credentials: AuthCredentials): Promise<AuthResult>;
  /** Social login (Google/Apple) with a Firebase ID token; matches an account by e-mail. */
  socialLogin(provider: 'google' | 'apple', idToken: string): Promise<AuthResult>;
  verifyEmail(role: UserRole, email: string, code: string): Promise<void>;
  resendCode(role: UserRole, email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}

class ApiAuthService implements AuthService {
  async register(payload: SignUpPayload): Promise<void> {
    try {
      const body =
        payload.role === 'athlete'
          ? toAthleteRegisterBody(payload)
          : toContractorRegisterBody(payload);
      await authApi.register(payload.role, body);
    } catch (err) {
      throw toAuthError(err);
    }
  }

  /** Login tries the athlete endpoint first, then the contractor one. */
  async login({ email, senha }: AuthCredentials): Promise<AuthResult> {
    const attempt = async (role: UserRole): Promise<AuthResult> => {
      try {
        const { data } = await authApi.login(role, email.trim().toLowerCase(), senha);
        return {
          session: { accessToken: data.accessToken, refreshToken: data.refreshToken },
          user: toUserProfile(data.user),
        };
      } catch (err) {
        const authErr = toAuthError(err);
        authErr.role = role;
        throw authErr;
      }
    };

    try {
      return await attempt('athlete');
    } catch (err) {
      // An unverified athlete must surface immediately; other failures fall back to contractor.
      if (err instanceof AuthError && err.code === 'EMAIL_NOT_VERIFIED') throw err;
      return attempt('contractor');
    }
  }

  async socialLogin(provider: 'google' | 'apple', idToken: string): Promise<AuthResult> {
    try {
      const { data } = await authApi.socialLogin(provider, idToken);
      return {
        session: { accessToken: data.accessToken, refreshToken: data.refreshToken },
        user: toUserProfile(data.user),
      };
    } catch (err) {
      throw toAuthError(err);
    }
  }

  async verifyEmail(role: UserRole, email: string, code: string): Promise<void> {
    try {
      await authApi.verifyEmail(role, email, code);
    } catch (err) {
      throw toAuthError(err);
    }
  }

  async resendCode(role: UserRole, email: string): Promise<void> {
    try {
      await authApi.resendCode(role, email);
    } catch (err) {
      throw toAuthError(err);
    }
  }

  /** Role-agnostic: hits both endpoints (each returns a generic success). */
  async requestPasswordReset(email: string): Promise<void> {
    await Promise.allSettled([
      authApi.forgotPassword('athlete', email),
      authApi.forgotPassword('contractor', email),
    ]);
  }
}

export const authService: AuthService = new ApiAuthService();
