import { POSITIONS } from '@/constants/positions';
import type {
  AthleteProfile,
  AvailabilityStatus,
  PlayerLevel,
  Position,
} from '@/types';
import { athletesApi } from './api/athletes-api';
import { toPublicAthleteProfile } from './api/mappers';

const AVAILABILITY_TO_API: Record<AvailabilityStatus, string> = { livre: 'FREE', empregado: 'EMPLOYED' };
const LEVEL_TO_API: Record<PlayerLevel, string> = { profissional: 'PROFESSIONAL', amador: 'AMATEUR', base: 'YOUTH' };

export interface AthleteFilter {
  search?: string;
  posicao?: Position;
  nivel?: PlayerLevel;
  disponibilidade?: AvailabilityStatus;
}

/** Read access to public athlete data, backed by the Empregol API. */
export interface ProfileService {
  getAthlete(id: string): Promise<AthleteProfile | null>;
  listAthletes(filter?: AthleteFilter): Promise<AthleteProfile[]>;
}

class ApiProfileService implements ProfileService {
  async getAthlete(id: string): Promise<AthleteProfile | null> {
    const athlete = await athletesApi.getById(id);
    return athlete ? toPublicAthleteProfile(athlete) : null;
  }

  async listAthletes(filter: AthleteFilter = {}): Promise<AthleteProfile[]> {
    const short = filter.posicao
      ? POSITIONS.find((p) => p.value === filter.posicao)?.short
      : undefined;
    const result = await athletesApi.explore({
      q: filter.search,
      positions: short ? [short] : undefined,
      availability: filter.disponibilidade ? AVAILABILITY_TO_API[filter.disponibilidade] : undefined,
      level: filter.nivel ? LEVEL_TO_API[filter.nivel] : undefined,
    });
    return result.athletes.map(toPublicAthleteProfile);
  }
}

export const profileService: ProfileService = new ApiProfileService();
