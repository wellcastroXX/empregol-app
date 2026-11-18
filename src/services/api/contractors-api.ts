import { apiRequest } from "./client";

export type ContractorType = "CLUB" | "AGENT";

/** Clube/Agência listado no "Mercado". */
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

/**
 * Clube/agência como o atleta vê (GET /contractors/:id/basic).
 *
 * A API devolve só esta lista branca. Telefone, e-mail, CNPJ, razão social,
 * redes sociais e plano não saem da API — não é o app que esconde.
 */
export interface PublicContractor {
  id: string;
  type: ContractorType;
  name: string;
  avatarUrl?: string | null;
  about?: string | null;
  /** ISO — "na Empregol desde". */
  memberSince: string;
  verified: boolean;
  /** Acessou nos últimos 7 dias. */
  activeThisWeek: boolean;
  status?: string;
}

export const contractorsApi = {
  /** Perfil público de um clube/agência. */
  async getById(id: string): Promise<PublicContractor> {
    const res = await apiRequest<{ status: string; data: PublicContractor }>(
      `/contractors/${id}/basic`,
    );
    return res.data;
  },

  /** Mercado — clubes/Agências da plataforma (GET /explore/contractors). */
  async explore(
    params: ExploreContractorsParams = {},
  ): Promise<ContractorsResult> {
    const qs = new URLSearchParams();
    if (params.q?.trim()) qs.set("q", params.q.trim());
    if (params.type) qs.set("type", params.type);
    qs.set("page", String(params.page ?? 1));
    qs.set("limit", String(params.limit ?? 40));
    const res = await apiRequest<{ status: string; data: ContractorsResult }>(
      `/explore/contractors?${qs.toString()}`,
    );
    return res.data;
  },
};
