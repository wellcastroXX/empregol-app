import { apiRequest } from "./client";

export type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "fake"
  | "other";
export type ReportContext = "profile" | "chat" | "media";

export interface BlockedUser {
  userId: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export const moderationApi = {
  /** Denuncia um usuário (conteúdo impróprio, assédio, etc.). */
  async report(input: {
    reportedUserId: string;
    reason: ReportReason;
    details?: string;
    context?: ReportContext;
  }): Promise<void> {
    await apiRequest("/moderation/reports", { method: "POST", body: input });
  },

  /** Bloqueia um usuário. */
  async block(userId: string): Promise<void> {
    await apiRequest("/moderation/blocks", {
      method: "POST",
      body: { userId },
    });
  },

  /** Desbloqueia um usuário. */
  async unblock(userId: string): Promise<void> {
    await apiRequest(`/moderation/blocks/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
  },

  /** Lista os usuários bloqueados. */
  async listBlocks(): Promise<BlockedUser[]> {
    const res = await apiRequest<{ status: string; data: BlockedUser[] }>(
      "/moderation/blocks",
    );
    return res.data;
  },
};
