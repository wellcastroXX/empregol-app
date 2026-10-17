import { apiRequest } from "./client";

export const accountApi = {
  /** Exclui permanentemente a conta do usuário autenticado. */
  async deleteAccount(): Promise<void> {
    await apiRequest<{ status: string; message?: string }>("/account", {
      method: "DELETE",
    });
  },
};
