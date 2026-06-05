import { POSITIONS } from '@/constants/positions';
import type {
  AgencyStatus,
  AthleteProfile,
  AvailabilityStatus,
  ContractorKind,
  ContractorProfile,
  DominantFoot,
  PlayerLevel,
  Position,
  SignUpPayload,
  UserProfile,
} from '@/types';
import { ageFromBirthdate, maskCnpj, maskCpf, maskPhone, unmask } from '@/utils';

/* ── Enum maps (domain ↔ API) ───────────────────────────────────────────────── */

const FOOT_TO_API: Record<DominantFoot, string> = {
  esquerdo: 'LEFT',
  direito: 'RIGHT',
  ambidestro: 'BOTH',
};
const FOOT_FROM_API: Record<string, DominantFoot> = { LEFT: 'esquerdo', RIGHT: 'direito', BOTH: 'ambidestro' };

const LEVEL_TO_API: Record<PlayerLevel, string> = {
  profissional: 'PROFESSIONAL',
  amador: 'AMATEUR',
  base: 'YOUTH',
};
const LEVEL_FROM_API: Record<string, PlayerLevel> = {
  PROFESSIONAL: 'profissional',
  AMATEUR: 'amador',
  YOUTH: 'base',
};

const AVAILABILITY_FROM_API: Record<string, AvailabilityStatus> = { FREE: 'livre', EMPLOYED: 'empregado' };
const AGENCY_FROM_API: Record<string, AgencyStatus> = { REPRESENTED: 'agenciado', UNREPRESENTED: 'nao_agenciado' };
const CONTRACTOR_TO_API: Record<ContractorKind, string> = { agent: 'AGENT', club: 'CLUB' };
const CONTRACTOR_FROM_API: Record<string, ContractorKind> = { AGENT: 'agent', CLUB: 'club' };

/** Position round-trips as its short code (e.g. "MCO"). */
function positionFromApi(short: string): Position {
  return POSITIONS.find((p) => p.short === short)?.value ?? POSITIONS[0].value;
}

/* ── Sign-up payload → API request body ─────────────────────────────────────── */

export function toAthleteRegisterBody(p: Extract<SignUpPayload, { role: 'athlete' }>) {
  const short = POSITIONS.find((pos) => pos.value === p.posicao)?.short ?? p.posicao;
  return {
    email: p.email,
    password: p.senha,
    fullName: p.nome,
    cpf: unmask(p.cpf),
    birthDate: p.dataNascimento,
    phone: unmask(p.telefone),
    naturalidade: p.naturalidade,
    position: short,
    dominantFoot: FOOT_TO_API[p.peDominante],
    height: p.alturaCm,
    weight: p.pesoKg,
    level: LEVEL_TO_API[p.nivel],
    ...(p.baseSalarial ? { expectedSalary: p.baseSalarial } : {}),
    ...(p.videos[0] ? { videoUrl: p.videos[0] } : {}),
  };
}

export function toContractorRegisterBody(p: Extract<SignUpPayload, { role: 'contractor' }>) {
  return {
    type: CONTRACTOR_TO_API[p.tipo],
    email: p.email,
    password: p.senha,
    name: p.nome,
    phone: unmask(p.telefone),
    ...(p.cpf ? { cpf: unmask(p.cpf) } : {}),
    ...(p.cnpj ? { cnpj: unmask(p.cnpj) } : {}),
    ...(p.razaoSocial ? { companyName: p.razaoSocial } : {}),
    ...(p.redeSocial ? { socialMedia: p.redeSocial } : {}),
    ...(p.informacoesAdicionais ? { additionalInfo: p.informacoesAdicionais } : {}),
  };
}

/* ── API `user` object → domain UserProfile ─────────────────────────────────── */

interface ApiUser {
  id: string;
  email: string;
  role: 'ATHLETE' | 'AGENT' | 'CLUB';
  emailVerified?: boolean;
  athlete?: ApiAthlete | null;
  contractor?: ApiContractor | null;
}
interface ApiAthlete {
  id: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  naturalidade: string;
  phone: string;
  position: string;
  dominantFoot: string;
  height: number;
  weight: number;
  level: string;
  availability: string;
  agencyStatus: string;
  jerseyNumber?: number | null;
  avatarUrl?: string | null;
  expectedSalary?: string | number | null;
  socialMedia?: string | null;
  additionalInfo?: string | null;
  lastClub?: string | null;
  goals?: number | null;
  assists?: number | null;
  gamesThisSeason?: number | null;
  createdAt?: string;
}
interface ApiContractor {
  id: string;
  type: string;
  name: string;
  phone: string;
  cpf?: string | null;
  cnpj?: string | null;
  companyName?: string | null;
  socialMedia?: string | null;
  additionalInfo?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

export function toUserProfile(user: ApiUser): UserProfile {
  if (user.role === 'ATHLETE' && user.athlete) {
    return toAthleteProfile(user, user.athlete);
  }
  if (user.contractor) {
    return toContractorProfile(user, user.contractor);
  }
  throw new Error('Perfil de usuário incompleto retornado pela API.');
}

function toAthleteProfile(user: ApiUser, a: ApiAthlete): AthleteProfile {
  return {
    id: user.id,
    role: 'athlete',
    nome: a.fullName,
    email: user.email,
    telefone: maskPhone(a.phone),
    emailVerificado: user.emailVerified ?? true,
    verificacao: 'verified',
    fotoUrl: a.avatarUrl ?? undefined,
    redeSocial: a.socialMedia ?? undefined,
    informacoesAdicionais: a.additionalInfo ?? undefined,
    criadoEm: a.createdAt ?? new Date().toISOString(),
    cpf: maskCpf(a.cpf),
    dataNascimento: a.birthDate,
    idade: ageFromBirthdate(a.birthDate),
    naturalidade: a.naturalidade,
    posicao: positionFromApi(a.position),
    peDominante: FOOT_FROM_API[a.dominantFoot] ?? 'direito',
    alturaCm: a.height,
    pesoKg: a.weight,
    videos: [],
    nivel: LEVEL_FROM_API[a.level] ?? 'profissional',
    disponibilidade: AVAILABILITY_FROM_API[a.availability] ?? 'livre',
    agenciamento: AGENCY_FROM_API[a.agencyStatus] ?? 'nao_agenciado',
    baseSalarial: a.expectedSalary != null ? Number(a.expectedSalary) : 0,
    numero: a.jerseyNumber ?? undefined,
    stats: {
      gols: a.goals ?? undefined,
      assistencias: a.assists ?? undefined,
      jogosNaTemporada: a.gamesThisSeason ?? undefined,
      ultimoClube: a.lastClub ?? undefined,
    },
  };
}

function toContractorProfile(user: ApiUser, c: ApiContractor): ContractorProfile {
  return {
    id: user.id,
    role: 'contractor',
    tipo: CONTRACTOR_FROM_API[c.type] ?? 'club',
    nome: c.name,
    email: user.email,
    telefone: maskPhone(c.phone),
    emailVerificado: user.emailVerified ?? true,
    verificacao: 'verified',
    fotoUrl: c.avatarUrl ?? undefined,
    redeSocial: c.socialMedia ?? undefined,
    informacoesAdicionais: c.additionalInfo ?? undefined,
    criadoEm: c.createdAt ?? new Date().toISOString(),
    cpf: c.cpf ? maskCpf(c.cpf) : undefined,
    cnpj: c.cnpj ? maskCnpj(c.cnpj) : undefined,
    razaoSocial: c.companyName ?? undefined,
  };
}

/* ── Public athlete (explore card / basic profile) → AthleteProfile ─────────── */

interface ApiMedia {
  url: string;
  mediaType: string;
}
interface ApiPublicAthlete extends Partial<ApiAthlete> {
  id: string;
  fullName: string;
  position: string;
  dominantFoot: string;
  level: string;
  availability: string;
  agencyStatus: string;
  height: number;
  weight: number;
  age?: number;
  media?: ApiMedia[];
}

/**
 * Maps a public athlete (no private contact data) to AthleteProfile.
 * Private fields are left empty — the profile UI hides them for non-own views.
 */
export function toPublicAthleteProfile(a: ApiPublicAthlete): AthleteProfile {
  const videos = (a.media ?? [])
    .filter((m) => m.mediaType === 'VIDEO' || m.mediaType === 'EXTERNAL_LINK')
    .map((m) => m.url);

  return {
    id: a.id,
    role: 'athlete',
    nome: a.fullName,
    email: '',
    telefone: '',
    emailVerificado: true,
    verificacao: 'verified',
    fotoUrl: a.avatarUrl ?? undefined,
    redeSocial: a.socialMedia ?? undefined,
    criadoEm: a.createdAt ?? new Date().toISOString(),
    cpf: '',
    dataNascimento: a.birthDate ?? '',
    idade: a.age ?? (a.birthDate ? ageFromBirthdate(a.birthDate) : 0),
    naturalidade: '',
    posicao: positionFromApi(a.position),
    peDominante: FOOT_FROM_API[a.dominantFoot] ?? 'direito',
    alturaCm: a.height,
    pesoKg: a.weight,
    videos,
    nivel: LEVEL_FROM_API[a.level] ?? 'profissional',
    disponibilidade: AVAILABILITY_FROM_API[a.availability] ?? 'livre',
    agenciamento: AGENCY_FROM_API[a.agencyStatus] ?? 'nao_agenciado',
    baseSalarial: a.expectedSalary != null ? Number(a.expectedSalary) : 0,
    numero: a.jerseyNumber ?? undefined,
    stats: {
      gols: a.goals ?? undefined,
      assistencias: a.assists ?? undefined,
      jogosNaTemporada: a.gamesThisSeason ?? undefined,
      ultimoClube: a.lastClub ?? undefined,
    },
  };
}

export type { ApiUser, ApiPublicAthlete };
