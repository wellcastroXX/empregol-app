import { apiRequest, apiUpload } from './client';

/** Mídia da vitrine retornada pela API (modelo AthleteMedia). */
export interface AthleteMedia {
  id: string;
  mediaType: 'VIDEO' | 'PHOTO' | 'EXTERNAL_LINK';
  url: string;
  title: string;
  year: number;
  category?: string | null;
  subcategory?: string | null;
  gameInfo?: string | null;
  isPublic: boolean;
  fileSizeBytes?: number | null;
  createdAt: string;
}

/** Metadados comuns ao publicar qualquer mídia. */
export interface MediaMeta {
  title: string;
  year: number;
  category?: string;
  subcategory?: string;
  gameInfo?: string;
  isPublic: boolean;
}

/** Arquivo local escolhido pelo picker. */
export interface LocalFile {
  uri: string;
  fileName: string;
  mimeType: string;
}

function appendMeta(form: FormData, meta: MediaMeta): void {
  form.append('title', meta.title);
  form.append('year', String(meta.year));
  if (meta.category) form.append('category', meta.category);
  if (meta.subcategory) form.append('subcategory', meta.subcategory);
  if (meta.gameInfo) form.append('gameInfo', meta.gameInfo);
  form.append('isPublic', String(meta.isPublic));
}

// RN aceita { uri, name, type } como "arquivo" em FormData.
function filePart(file: LocalFile) {
  return { uri: file.uri, name: file.fileName, type: file.mimeType } as unknown as Blob;
}

export const mediaApi = {
  /** Lista a mídia do próprio atleta → GET /athletes/me/media. */
  async listMine(type?: 'VIDEO' | 'PHOTO' | 'EXTERNAL_LINK'): Promise<AthleteMedia[]> {
    const qs = type ? `?type=${type}` : '';
    const res = await apiRequest<{ status: string; data: AthleteMedia[] }>(`/athletes/me/media${qs}`);
    return res.data;
  },

  /** Upload de vídeo/foto (multipart) → POST /athletes/me/media/upload. */
  async upload(file: LocalFile, meta: MediaMeta): Promise<AthleteMedia> {
    const form = new FormData();
    form.append('file', filePart(file));
    appendMeta(form, meta);
    const res = await apiUpload<{ status: string; data: AthleteMedia }>('/athletes/me/media/upload', form);
    return res.data;
  },

  /** Link externo (YouTube/Vimeo/etc.) → POST /athletes/me/media (JSON). */
  async addLink(url: string, meta: MediaMeta): Promise<AthleteMedia> {
    const res = await apiRequest<{ status: string; data: AthleteMedia }>('/athletes/me/media', {
      method: 'POST',
      body: { mediaType: 'EXTERNAL_LINK', url, ...meta },
    });
    return res.data;
  },

  /** Edita metadados de uma mídia → PATCH /athletes/me/media/:id. */
  async update(id: string, patch: Partial<MediaMeta> & { url?: string }): Promise<AthleteMedia> {
    const res = await apiRequest<{ status: string; data: AthleteMedia }>(`/athletes/me/media/${id}`, {
      method: 'PATCH',
      body: patch,
    });
    return res.data;
  },

  /** Remove uma mídia → DELETE /athletes/me/media/:id. */
  async remove(id: string): Promise<void> {
    await apiRequest(`/athletes/me/media/${id}`, { method: 'DELETE' });
  },

  /** Foto do usuário (avatar) → PATCH /athletes/me/avatar (multipart). */
  async updateAvatar(file: LocalFile): Promise<{ avatarUrl: string }> {
    const form = new FormData();
    form.append('file', filePart(file));
    const res = await apiUpload<{ status: string; data: { avatarUrl: string } }>('/athletes/me/avatar', form, {
      method: 'PATCH',
    });
    return res.data;
  },
};
