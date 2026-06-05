import { apiRequest } from './client';

export interface ApiConversation {
  id: string;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  athleteUnreadCount: number;
  contractorUnreadCount: number;
  contractor?: { id: string; name: string; type: 'AGENT' | 'CLUB'; companyName?: string | null; avatarUrl?: string | null };
  athlete?: { id: string; fullName: string; position: string; avatarUrl?: string | null; jerseyNumber?: number | null };
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  type: 'TEXT' | 'AUDIO' | 'INVITE_CARD';
  content: string | null;
  audioUrl: string | null;
  proposalId: string | null;
  readAt: string | null;
  createdAt: string;
}

export const conversationsApi = {
  async listMine(): Promise<ApiConversation[]> {
    const res = await apiRequest<{ status: string; data: ApiConversation[] }>('/conversations');
    return res.data;
  },

  /** Contractor opens (or retrieves existing) conversation with an athlete. */
  async open(athleteId: string): Promise<ApiConversation> {
    const res = await apiRequest<{ status: string; data: ApiConversation }>('/conversations', {
      method: 'POST',
      body: { athleteId },
    });
    return res.data;
  },

  /** Paged message history, newest-first. Pass cursor to load older messages. */
  async getMessages(conversationId: string, cursor?: string): Promise<{ data: ApiMessage[]; nextCursor: string | null }> {
    const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    const res = await apiRequest<{ status: string; data: ApiMessage[] }>(
      `/conversations/${conversationId}/messages${q}`,
    );
    const msgs = res.data;
    return { data: msgs, nextCursor: msgs.length === 30 ? (msgs.at(-1)?.id ?? null) : null };
  },

  async sendMessage(conversationId: string, content: string): Promise<ApiMessage> {
    const res = await apiRequest<{ status: string; data: { message: ApiMessage } }>(
      `/conversations/${conversationId}/messages`,
      { method: 'POST', body: { type: 'TEXT', content } },
    );
    return res.data.message;
  },

  async markRead(conversationId: string): Promise<void> {
    await apiRequest(`/conversations/${conversationId}/read`, { method: 'PATCH' });
  },
};
