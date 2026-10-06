import { apiRequest } from "./client";

export interface FavoriteAthlete {
  id: string;
  fullName: string;
  position: string;
  level: string;
  availability: string;
  agencyStatus: string;
  gender: string;
  height: number;
  age: number | null;
  avatarUrl: string | null;
  goals: number | null;
  assists: number | null;
  minutesPlayed: number | null;
  state: string | null;
  favoritedAt: string;
}

export const favoritesApi = {
  async list(): Promise<FavoriteAthlete[]> {
    const res = await apiRequest<{ status: string; data: FavoriteAthlete[] }>(
      "/favorites",
    );
    return res.data;
  },

  async toggle(athleteId: string): Promise<boolean> {
    const res = await apiRequest<{
      status: string;
      data: { favorited: boolean };
    }>(`/favorites/${encodeURIComponent(athleteId)}`, { method: "POST" });
    return res.data.favorited;
  },
};
