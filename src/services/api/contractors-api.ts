import { apiRequest } from './client';

export type ContractorType = 'CLUB' | 'AGENT';

/** Clube/agente listado no "Mercado". */
export interface MarketContractor {
  id: string;
  name: string;
  type: ContractorType;
  companyName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface ContractorsResult {
  contractors: MarketContractor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExploreContractorsParams {
  q?: string;
  type?: ContractorType;
  page?: number;
  limit?: number;
}

export const contractorsApi = {
  /** Mercado — clubes/agentes da plataforma (GET /explore/contractors). */
  async explore(params: ExploreContractorsParams = {}): Promise<ContractorsResult> {
    const qs = new URLSearchParams();
    if (params.q?.trim()) qs.set('q', params.q.trim());
    if (params.type) qs.set('type', params.type);
    qs.set('page', String(params.page ?? 1));
    qs.set('limit', String(params.limit ?? 40));
    const res = await apiRequest<{ status: string; data: ContractorsResult }>(
      `/explore/contractors?${qs.toString()}`,
    );
    return res.data;
  },
};
