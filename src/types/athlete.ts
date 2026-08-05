import type { BaseUser } from './user';

/** Playing position (pt-BR labels + abbreviations live in `constants/positions.ts`). */
export type Position =
  | 'goleiro' // GOL
  | 'zagueiro' // ZAG
  | 'lateral_direito' // LAD
  | 'lateral_esquerdo' // LAE
  | 'volante' // VOL
  | 'meia_central' // MC
  | 'meia_esquerda' // ME
  | 'meia_direita' // MD
  | 'meia_ofensivo' // MCO
  | 'ala' // ALA
  | 'atacante' // ATA
  | 'ponta_direita' // PD
  | 'ponta_esquerda' // PE
  | 'centroavante'; // CA

export type DominantFoot = 'direito' | 'esquerdo' | 'ambidestro';

/** Gender — used for filtering / category browsing in the vitrine. */
export type Genero = 'masculino' | 'feminino';

/** Competitive level. */
export type PlayerLevel = 'profissional' | 'amador' | 'base';

/** Availability — `livre` shows green, `empregado` shows red (per spec). */
export type AvailabilityStatus = 'livre' | 'empregado';

/** Whether the athlete is represented by an agent. */
export type AgencyStatus = 'agenciado' | 'nao_agenciado';

/** Optional performance stats (current/most-recent season). */
export interface AthleteStats {
  /** Ano da temporada mais recente reportada (ex.: 2025). */
  ano?: number;
  gols?: number;
  assistencias?: number;
  jogosNaTemporada?: number;
  minutosNaTemporada?: number;
  cartoesAmarelos?: number;
  cartoesVermelhos?: number;
  ultimoClube?: string;
}

/** Single entry in the athlete's career timeline. */
export interface CareerEntry {
  ano: number;
  clube: string;
  minutos?: number;
  gols?: number;
}

/** A published vitrine media item (video file, photo, or external link). */
export interface AthleteMediaItem {
  id?: string;
  tipo: 'video' | 'foto' | 'link';
  url: string;
  titulo: string;
  categoria?: string;
  subcategoria?: string;
  jogoInfo?: string; // "Vitória 2 × 1 ABC · 14/10/2024"
  ano?: number;
  /** Duração em segundos (vídeos) — backend ainda não fornece. */
  duracaoSegundos?: number;
}

/**
 * Full athlete profile. Required vs optional mirror the cadastro spec:
 * everything outside `stats`, `redeSocial`, `informacoesAdicionais` is mandatory.
 */
export interface AthleteProfile extends BaseUser {
  role: 'athlete';

  // Obrigatórios
  cpf: string;
  dataNascimento: string; // ISO date
  idade: number;
  naturalidade: string;
  genero: Genero;
  posicao: Position;
  peDominante: DominantFoot;
  alturaCm: number;
  pesoKg: number;
  videos: string[]; // links de jogadas/vídeos
  nivel: PlayerLevel;
  disponibilidade: AvailabilityStatus;
  agenciamento: AgencyStatus;
  baseSalarial: number; // BRL pretendido em caso de vínculo

  // Opcionais
  /** Número da camisa — o artefato icônico da marca (exibido grande, em mono). */
  numero?: number;
  stats?: AthleteStats;
  trajetoria?: CareerEntry[];
  /** Mídias da vitrine com metadados (preserva título, categoria, jogo, etc.). */
  media?: AthleteMediaItem[];
}
