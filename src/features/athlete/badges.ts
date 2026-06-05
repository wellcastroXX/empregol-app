import type { TagVariant } from '@/components/ui';
import { AGENCY, AVAILABILITY, PLAYER_LEVELS, labelOf } from '@/constants/positions';
import type { AgencyStatus, AvailabilityStatus, PlayerLevel } from '@/types';

/** Maps athlete status enums → `{ label, variant }` for the Tag component. */

export function availabilityTag(value: AvailabilityStatus): { label: string; variant: TagVariant } {
  return {
    label: labelOf(AVAILABILITY, value).toUpperCase(),
    variant: value === 'livre' ? 'live' : 'empregado',
  };
}

export function agencyTag(value: AgencyStatus): { label: string; variant: TagVariant } {
  return {
    label: labelOf(AGENCY, value).toUpperCase(),
    variant: value === 'agenciado' ? 'ink' : 'default',
  };
}

/** Nível: Profissional = filled ink, Amador = osso, Base = ghost (border only). */
export function levelTag(value: PlayerLevel): { label: string; variant: TagVariant } {
  const variants: Record<PlayerLevel, TagVariant> = {
    profissional: 'ink',
    amador: 'default',
    base: 'ghost',
  };
  return { label: labelOf(PLAYER_LEVELS, value).toUpperCase(), variant: variants[value] };
}
