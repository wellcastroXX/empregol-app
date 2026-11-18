import { POSITIONS } from "@/constants/positions";
import type {
    AthleteProfile,
    AvailabilityStatus,
    PlayerLevel,
    Position,
} from "@/types";
import { athletesApi } from "./api/athletes-api";
import { toPublicAthleteProfile } from "./api/mappers";

const AVAILABILITY_TO_API: Record<AvailabilityStatus, string> = {
  livre: "FREE",
  empregado: "EMPLOYED",
};
const LEVEL_TO_API: Record<PlayerLevel, string> = {
  profissional: "PROFESSIONAL",
  amador: "AMATEUR",
  base: "YOUTH",
};

export interface AthleteFilter {
  search?: string;
  posicao?: Position;
  nivel?: PlayerLevel;
  disponibilidade?: AvailabilityStatus;
  limit?: number;
  /** ISO — só atletas cadastrados a partir desta data. */
  cadastradosApos?: string;
}

/** Resultado paginado, para quem precisa saber o total real. */
export interface AthletePage {
  athletes: AthleteProfile[];
  /** Total de atletas que casam com o filtro no servidor, não só os carregados. */
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Teto de páginas do `listAllAthletes`.
 *
 * A API limita `limit` a 50, então isto cobre 500 atletas. É um teto de
 * segurança para não varrer o banco inteiro no cliente: quando a base passar
 * disso, as contagens por categoria precisam vir do servidor, porque hoje são
 * calculadas sobre a lista carregada.
 */
const MAX_PAGES = 10;
const PAGE_SIZE = 50;

/** Read access to public athlete data, backed by the Empregol API. */
export interface ProfileService {
  getAthlete(id: string): Promise<AthleteProfile | null>;
  listAthletes(filter?: AthleteFilter): Promise<AthleteProfile[]>;
  /** Uma página, com o total real do servidor. */
  listAthletePage(
    filter?: AthleteFilter & { page?: number },
  ): Promise<AthletePage>;
  /** Percorre as páginas e devolve tudo — para telas que contam por categoria. */
  listAllAthletes(filter?: AthleteFilter): Promise<AthletePage>;
}

class ApiProfileService implements ProfileService {
  async getAthlete(id: string): Promise<AthleteProfile | null> {
    const athlete = await athletesApi.getById(id);
    return athlete ? toPublicAthleteProfile(athlete) : null;
  }

  async listAthletes(filter: AthleteFilter = {}): Promise<AthleteProfile[]> {
    const { athletes } = await this.listAthletePage(filter);
    return athletes;
  }

  async listAthletePage(
    filter: AthleteFilter & { page?: number } = {},
  ): Promise<AthletePage> {
    const short = filter.posicao
      ? POSITIONS.find((p) => p.value === filter.posicao)?.short
      : undefined;
    const result = await athletesApi.explore({
      q: filter.search,
      positions: short ? [short] : undefined,
      availability: filter.disponibilidade
        ? AVAILABILITY_TO_API[filter.disponibilidade]
        : undefined,
      level: filter.nivel ? LEVEL_TO_API[filter.nivel] : undefined,
      createdAfter: filter.cadastradosApos,
      limit: filter.limit,
      page: filter.page,
    });
    return {
      athletes: result.athletes.map(toPublicAthleteProfile),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  async listAllAthletes(filter: AthleteFilter = {}): Promise<AthletePage> {
    const first = await this.listAthletePage({
      ...filter,
      limit: PAGE_SIZE,
      page: 1,
    });

    const athletes = [...first.athletes];
    const lastPage = Math.min(first.totalPages, MAX_PAGES);

    for (let page = 2; page <= lastPage; page++) {
      const next = await this.listAthletePage({
        ...filter,
        limit: PAGE_SIZE,
        page,
      });
      if (next.athletes.length === 0) break;
      athletes.push(...next.athletes);
    }

    // `total` é o do servidor de propósito: se o teto de páginas cortou a
    // varredura, a tela precisa saber que existe mais do que ela carregou.
    return { athletes, total: first.total, page: 1, totalPages: first.totalPages };
  }
}

export const profileService: ProfileService = new ApiProfileService();
