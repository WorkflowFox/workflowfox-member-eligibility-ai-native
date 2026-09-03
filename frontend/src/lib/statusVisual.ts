/**
 * Per-status presentation. The visible label and the icon carry the meaning;
 * colour is only reinforcement (spec §13, §17). Band/badge colours are derived
 * in OKLCH from one hue+chroma per status so the five states stay a family —
 * ported from the design prototype's STATUS_META.
 */
import type { CSSProperties } from 'react';
import type { EligibilityStatus } from '../services/eligibility';

interface StatusMeta {
  label: string;
  hue: number;
  chroma: number;
}

const STATUS_META: Record<EligibilityStatus, StatusMeta> = {
  ELIGIBLE: { label: 'Eligible', hue: 152, chroma: 0.055 },
  NOT_YET_ELIGIBLE: { label: 'Not Yet Eligible', hue: 78, chroma: 0.055 },
  INELIGIBLE: { label: 'Ineligible', hue: 30, chroma: 0.06 },
  MEMBER_NOT_FOUND: { label: 'Member Not Found', hue: 250, chroma: 0.012 },
  UNABLE_TO_DETERMINE: { label: 'Unable to Determine', hue: 300, chroma: 0.028 },
};

export interface StatusVisual {
  label: string;
  band: CSSProperties;
  badge: CSSProperties;
}

export function statusVisual(status: EligibilityStatus): StatusVisual {
  const { label, hue, chroma } = STATUS_META[status];
  return {
    label,
    band: {
      display: 'flex',
      gap: '15px',
      alignItems: 'flex-start',
      padding: '20px',
      background: `oklch(0.955 ${chroma * 0.55} ${hue})`,
      borderBottom: `1px solid oklch(0.8 ${chroma * 0.9} ${hue})`,
      color: `oklch(0.34 ${chroma * 1.1} ${hue})`,
    },
    badge: {
      flex: 'none',
      width: '38px',
      height: '38px',
      display: 'grid',
      placeItems: 'center',
      border: `1px solid oklch(0.62 ${chroma * 1.1} ${hue})`,
      color: `oklch(0.4 ${chroma * 1.2} ${hue})`,
    },
  };
}
