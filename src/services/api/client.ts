import { env } from '@/config/env';

/** Error thrown for any non-2xx API response, carrying the backend's code/message. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly httpStatus: number,
    readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Bearer access token for authenticated routes (defaults to the stored token). */
  token?: string;
  signal?: AbortSignal;
};

/** Current access token, set by the AuthContext; auto-injected into requests. */
let accessToken: string | null = null;
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * Thin typed fetch wrapper around the Empregol API.
 * Parses the `{ status, ... }` envelope and throws `ApiError` on failure.
 */
export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token = accessToken, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new ApiError('Sem conexão com o servidor. Verifique sua internet.', 'NETWORK_ERROR', 0);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const code = payload?.code ?? 'UNKNOWN';
    const message = payload?.message ?? 'Algo deu errado. Tente novamente.';
    throw new ApiError(message, code, response.status, payload?.errors);
  }

  return payload as T;
}
