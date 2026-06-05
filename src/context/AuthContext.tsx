import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { authService, sessionStorage, AuthError } from '@/services';
import { setAccessToken } from '@/services/api/client';
import type {
  AuthCredentials,
  AuthStatus,
  Session,
  SignUpPayload,
  UserProfile,
  UserRole,
} from '@/types';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: UserProfile | null;
  /** E-mail awaiting verification (mirrors the in-memory pending creds for rendering). */
  pendingEmail: string | null;
}

type AuthAction =
  | { type: 'restore'; session: Session | null; user: UserProfile | null }
  | { type: 'authenticated'; session: Session; user: UserProfile }
  | { type: 'pending'; email: string }
  | { type: 'signOut' };

const initialState: AuthState = { status: 'loading', session: null, user: null, pendingEmail: null };

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'restore':
      return action.session && action.user
        ? { ...state, status: 'authenticated', session: action.session, user: action.user }
        : { ...state, status: 'unauthenticated', session: null, user: null };
    case 'authenticated':
      return { status: 'authenticated', session: action.session, user: action.user, pendingEmail: null };
    case 'pending':
      return { ...state, pendingEmail: action.email };
    case 'signOut':
      return { status: 'unauthenticated', session: null, user: null, pendingEmail: null };
    default:
      return state;
  }
}

/** Credentials held in memory between register/login and e-mail verification. */
interface Pending {
  role: UserRole;
  email: string;
  senha: string;
}

interface AuthContextValue extends AuthState {
  /** E-mail awaiting verification (drives the verify-email screen). */
  pendingEmail: string | null;
  /** Register → backend sends a code; does NOT authenticate yet. */
  register(payload: SignUpPayload): Promise<void>;
  /** Verify the e-mail code, then auto-login with the pending credentials. */
  verifyEmail(code: string): Promise<void>;
  resendCode(): Promise<void>;
  /** Login; throws AuthError (code EMAIL_NOT_VERIFIED routes to verification). */
  signIn(credentials: AuthCredentials): Promise<void>;
  /** Social login with a Firebase ID token (Google/Apple). */
  signInWithSocial(provider: 'google' | 'apple', idToken: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pending = useRef<Pending | null>(null);

  // Restore a persisted session on boot.
  useEffect(() => {
    let active = true;
    (async () => {
      const snapshot = await sessionStorage.load();
      if (snapshot?.session) setAccessToken(snapshot.session.accessToken);
      if (active) dispatch({ type: 'restore', session: snapshot?.session ?? null, user: snapshot?.user ?? null });
    })();
    return () => {
      active = false;
    };
  }, []);

  const authenticate = useCallback(async (session: Session, user: UserProfile) => {
    setAccessToken(session.accessToken);
    await sessionStorage.save({ session, user });
    pending.current = null;
    dispatch({ type: 'authenticated', session, user });
  }, []);

  const register = useCallback(async (payload: SignUpPayload) => {
    await authService.register(payload);
    pending.current = { role: payload.role, email: payload.email, senha: payload.senha };
    dispatch({ type: 'pending', email: payload.email });
  }, []);

  const verifyEmail = useCallback(
    async (code: string) => {
      const p = pending.current;
      if (!p) throw new AuthError('Sessão de cadastro expirada. Faça login novamente.');
      await authService.verifyEmail(p.role, p.email, code);
      const { session, user } = await authService.login({ email: p.email, senha: p.senha });
      await authenticate(session, user);
    },
    [authenticate]
  );

  const resendCode = useCallback(async () => {
    const p = pending.current;
    if (!p) throw new AuthError('Sessão de cadastro expirada.');
    await authService.resendCode(p.role, p.email);
  }, []);

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        const { session, user } = await authService.login(credentials);
        await authenticate(session, user);
      } catch (err) {
        if (err instanceof AuthError && err.code === 'EMAIL_NOT_VERIFIED') {
          // Stash credentials so the verify screen can resume + auto-login.
          pending.current = {
            role: err.role ?? 'athlete',
            email: credentials.email,
            senha: credentials.senha,
          };
          dispatch({ type: 'pending', email: credentials.email });
        }
        throw err;
      }
    },
    [authenticate]
  );

  const signInWithSocial = useCallback(
    async (provider: 'google' | 'apple', idToken: string) => {
      const { session, user } = await authService.socialLogin(provider, idToken);
      await authenticate(session, user);
    },
    [authenticate]
  );

  const signOut = useCallback(async () => {
    setAccessToken(null);
    await sessionStorage.clear();
    pending.current = null;
    dispatch({ type: 'signOut' });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, register, verifyEmail, resendCode, signIn, signInWithSocial, signOut }),
    [state, register, verifyEmail, resendCode, signIn, signInWithSocial, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
