import type { BaseUser, ContractorKind } from './user';

/**
 * Contractor profile — an Agente (pessoa física) or Clube (empresa).
 * `cpf` applies to individuals, `cnpj` + `razaoSocial` to companies/clubs.
 */
export interface ContractorProfile extends BaseUser {
  role: 'contractor';
  tipo: ContractorKind;

  // Obrigatórios (condicionais ao tipo)
  cpf?: string; // pessoa física
  cnpj?: string; // empresa / clube
  razaoSocial?: string; // quando aplicável
}
