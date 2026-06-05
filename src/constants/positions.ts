import type {
  AgencyStatus,
  AvailabilityStatus,
  ContractorKind,
  DominantFoot,
  PlayerLevel,
  Position,
} from '@/types';

/** Generic option shape used by SelectField / pills. */
export interface Option<T extends string> {
  value: T;
  label: string;
  /** short abbreviation for compact contexts (e.g. position badge). */
  short?: string;
}

export const POSITIONS: Option<Position>[] = [
  { value: 'goleiro', label: 'Goleiro', short: 'GOL' },
  { value: 'zagueiro', label: 'Zagueiro', short: 'ZAG' },
  { value: 'lateral_direito', label: 'Lateral direito', short: 'LAD' },
  { value: 'lateral_esquerdo', label: 'Lateral esquerdo', short: 'LAE' },
  { value: 'volante', label: 'Volante', short: 'VOL' },
  { value: 'meia_central', label: 'Meia central', short: 'MC' },
  { value: 'meia_esquerda', label: 'Meia esquerda', short: 'ME' },
  { value: 'meia_direita', label: 'Meia direita', short: 'MD' },
  { value: 'meia_ofensivo', label: 'Meia ofensivo', short: 'MCO' },
  { value: 'ala', label: 'Ala', short: 'ALA' },
  { value: 'atacante', label: 'Atacante', short: 'ATA' },
  { value: 'ponta_direita', label: 'Ponta direita', short: 'PD' },
  { value: 'ponta_esquerda', label: 'Ponta esquerda', short: 'PE' },
  { value: 'centroavante', label: 'Centroavante', short: 'CA' },
];

export const DOMINANT_FEET: Option<DominantFoot>[] = [
  { value: 'direito', label: 'Direito' },
  { value: 'esquerdo', label: 'Esquerdo' },
  { value: 'ambidestro', label: 'Ambidestro' },
];

export const PLAYER_LEVELS: Option<PlayerLevel>[] = [
  { value: 'profissional', label: 'Profissional' },
  { value: 'amador', label: 'Amador' },
  { value: 'base', label: 'Base' },
];

export const AVAILABILITY: Option<AvailabilityStatus>[] = [
  { value: 'livre', label: 'Livre' },
  { value: 'empregado', label: 'Empregado' },
];

export const AGENCY: Option<AgencyStatus>[] = [
  { value: 'agenciado', label: 'Agenciado' },
  { value: 'nao_agenciado', label: 'Não agenciado' },
];

export const CONTRACTOR_KINDS: Option<ContractorKind>[] = [
  { value: 'agent', label: 'Agente' },
  { value: 'club', label: 'Clube' },
];

/** Reverse lookup helper: value → label, for any option list. */
export function labelOf<T extends string>(options: Option<T>[], value: T): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
