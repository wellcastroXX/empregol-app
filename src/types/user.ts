/** Shared user/account domain types. */

/** Top-level account kinds in the system. */
export type UserRole = 'athlete' | 'contractor';

/** A contractor is either an individual agent or a club/company. */
export type ContractorKind = 'agent' | 'club';

/** Account verification state (email + document checks). */
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

/** Fields common to every account, regardless of role. */
export interface BaseUser {
  id: string;
  role: UserRole;
  nome: string;
  email: string;
  telefone: string;
  emailVerificado: boolean;
  verificacao: VerificationStatus;
  /**
   * Campos que faltam para o perfil contar como completo, como a API calcula
   * (ex: `["avatarUrl", "city"]`). Alimenta o "complete seu perfil" — o selo
   * verificado é automático pela completude, com veto da administração.
   */
  verificacaoPendencias?: string[];
  fotoUrl?: string;
  redeSocial?: string;
  informacoesAdicionais?: string;
  criadoEm: string; // ISO date
}
