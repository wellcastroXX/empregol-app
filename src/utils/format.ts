/** pt-BR display formatters (currency, dates, measurements, etc.). */

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** R$ 12.450,00 */
export function formatCurrency(value: number): string {
  return brl.format(value);
}

/** 1.234 — thousands with dot. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/** ISO date → 21/05/2026 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** 178 → "1,78 m" */
export function formatHeight(cm: number): string {
  return `${(cm / 100).toFixed(2).replace('.', ',')} m`;
}

/** 74 → "74 kg" */
export function formatWeight(kg: number): string {
  return `${kg} kg`;
}

/** Computes age in full years from an ISO birth date, relative to `now`. */
export function ageFromBirthdate(iso: string, now: Date = new Date()): number {
  const birth = new Date(iso);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Up-to-two-letter initials from a full name, for avatars. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Compact "time ago" label, e.g. "14H", "3D", "AGORA". */
export function timeAgoShort(iso: string, now: Date = new Date()): string {
  const ms = now.getTime() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'AGORA';
  if (mins < 60) return `${mins}MIN`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H`;
  return `${Math.floor(hours / 24)}D`;
}

/** Time-of-day greeting in pt-BR (Bom dia / Boa tarde / Boa noite). */
export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
