import { apiRequest } from './client';

/** Estatística de uma temporada retornada pela API. */
export interface ApiSeasonStats {
  id: string;
  year: number;
  goals: number;
  assists: number;
  gamesPlayed: number;
  minutesPlayed: number;
  position: string;
  height: number;
  weight: number;
  dominantFoot: 'LEFT' | 'RIGHT' | 'BOTH';
  lastClub?: string | null;
}

/** Corpo do upsert (PUT) — cria ou atualiza a temporada do `year`. */
export interface UpsertSeasonStats {
  year: number;
  goals: number;
  assists: number;
  gamesPlayed: number;
  minutesPlayed: number;
  position: string;
  height: number;
  weight: number;
  dominantFoot: 'LEFT' | 'RIGHT' | 'BOTH';
  lastClub?: string | null;
}

export const seasonStatsApi = {
  /** Lista todas as temporadas do atleta → GET /athletes/me/season-stats. */
  async list(): Promise<ApiSeasonStats[]> {
    const res = await apiRequest<{ status: string; data: ApiSeasonStats[] }>('/athletes/me/season-stats');
    return res.data;
  },

  /** Cria/atualiza uma temporada (denormaliza no perfil) → PUT /athletes/me/season-stats. */
  async upsert(dto: UpsertSeasonStats): Promise<ApiSeasonStats> {
    const res = await apiRequest<{ status: string; data: ApiSeasonStats }>('/athletes/me/season-stats', {
      method: 'PUT',
      body: dto,
    });
    return res.data;
  },

  /** Remove a temporada de um ano → DELETE /athletes/me/season-stats/:year. */
  async remove(year: number): Promise<void> {
    await apiRequest(`/athletes/me/season-stats/${year}`, { method: 'DELETE' });
  },
};
