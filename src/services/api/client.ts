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

  const url = `${env.apiUrl}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    console.warn(`[api] ${method} ${url} falhou:`, e);
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

type UploadOptions = {
  method?: 'POST' | 'PUT' | 'PATCH';
  token?: string;
};

/**
 * Multipart variant of {@link apiRequest} for file uploads.
 *
 * Uses XMLHttpRequest (not `fetch`): React Native's XHR accepts the
 * `{ uri, name, type }` file-part shape, while the WinterCG `fetch` rejects it
 * with "Unsupported FormDataPart implementation". Content-Type is left unset so
 * the multipart boundary is generated automatically.
 */
export function apiUpload<T = unknown>(path: string, form: FormData, options: UploadOptions = {}): Promise<T> {
  const { method = 'POST', token = accessToken } = options;
  const url = `${env.apiUrl}${path}`;

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Accept', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.onload = () => {
      let payload: any = null;
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        payload = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload as T);
      } else {
        reject(
          new ApiError(
            payload?.message ?? 'Falha no envio do arquivo. Tente novamente.',
            payload?.code ?? 'UNKNOWN',
            xhr.status,
            payload?.errors,
          ),
        );
      }
    };
    xhr.onerror = () => {
      console.warn(`[api upload] ${method} ${url} falhou (xhr)`);
      reject(new ApiError('Sem conexão com o servidor. Verifique sua internet.', 'NETWORK_ERROR', 0));
    };
    xhr.ontimeout = () => reject(new ApiError('Tempo de envio esgotado. Tente novamente.', 'TIMEOUT', 0));

    xhr.send(form);
  });
}
