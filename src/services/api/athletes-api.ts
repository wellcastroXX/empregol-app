import { apiRequest } from './client';
import type { ApiPublicAthlete } from './mappers';

export interface ExploreParams {
  q?: string;
  positions?: string[]; // short codes (e.g. "MCO")
  availability?: string; // FREE | EMPLOYED
  level?: string; // PROFESSIONAL | AMATEUR | YOUTH
  page?: number;
  limit?: number;
}

export interface ExploreResult {
  athletes: ApiPublicAthlete[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function buildQuery(params: ExploreParams): string {
  const q = new URLSearchParams();
  if (params.q) q.set('q', params.q);
  if (params.positions?.length) q.set('positions', params.positions.join(','));
  if (params.availability) q.set('availability', params.availability);
  if (params.level) q.set('level', params.level);
  q.set('page', String(params.page ?? 1));
  q.set('limit', String(params.limit ?? 30));
  return q.toString();
}

export const athletesApi = {
  async explore(params: ExploreParams = {}): Promise<ExploreResult> {
    const res = await apiRequest<{ status: string; data: ExploreResult }>(`/explore/athletes?${buildQuery(params)}`);
    return res.data;
  },
  /** Basic public profile (works for any authenticated role; records a view for contractors). */
  async getById(id: string): Promise<ApiPublicAthlete> {
    const res = await apiRequest<{ status: string; data: ApiPublicAthlete }>(`/athletes/${id}/basic`);
    return res.data;
  },
};
