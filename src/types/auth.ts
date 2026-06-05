import type { AthleteProfile } from './athlete';
import type { ContractorProfile } from './contractor';
import type { ContractorKind } from './user';

/** Any authenticated profile. */
export type UserProfile = AthleteProfile | ContractorProfile;

/** Auth lifecycle as seen by the UI. */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface Session {
  accessToken: string;
  refreshToken: string;
}

export interface AuthCredentials {
  email: string;
  senha: string;
}

/** Sign-up payload for an athlete (id/criadoEm are assigned by the service). */
export type AthleteSignUp = Omit<
  AthleteProfile,
  'id' | 'criadoEm' | 'emailVerificado' | 'verificacao'
> & { senha: string };

/** Sign-up payload for a contractor. */
export type ContractorSignUp = Omit<
  ContractorProfile,
  'id' | 'criadoEm' | 'emailVerificado' | 'verificacao'
> & { senha: string };

/** Discriminated union over role used by the auth service. */
export type SignUpPayload =
  | ({ role: 'athlete' } & AthleteSignUp)
  | ({ role: 'contractor'; tipo: ContractorKind } & ContractorSignUp);

/** Result returned after a successful sign-in/sign-up. */
export interface AuthResult {
  session: Session;
  user: UserProfile;
}
