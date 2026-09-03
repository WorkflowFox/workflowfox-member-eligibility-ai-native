import { DEMO_MEMBERS } from '../services/eligibility';

interface PrototypeBarProps {
  /** Fill the Member ID with this value and immediately run the check. */
  onPick: (memberId: string) => void;
  onHide: () => void;
}

const chipStyle: React.CSSProperties = {
  font: '500 11px/1 var(--font-body)',
  padding: '6px 9px',
  background: 'rgba(245,245,248,.07)',
  color: 'inherit',
  border: '1px solid rgba(245,245,248,.2)',
  cursor: 'pointer',
  display: 'inline-flex',
  gap: 7,
  alignItems: 'center',
};

/**
 * Dev-only affordance (not part of the product UI). One click per synthetic
 * member so every eligibility outcome — including the simulated technical
 * failure — is demoable without typing IDs (spec §19, §24).
 */
export function PrototypeBar({ onPick, onHide }: PrototypeBarProps) {
  return (
    <div
      className="wf-demobar"
      style={{
        background: 'var(--color-neutral-900)',
        color: 'var(--color-neutral-100)',
        padding: '9px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '10px 18px',
      }}
    >
      <span
        style={{
          font: '600 10px/1 var(--font-heading)',
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          border: '1px solid rgba(245,245,248,.32)',
          padding: '5px 8px',
        }}
      >
        Prototype
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, opacity: 0.55 }}>Synthetic members</span>
        {DEMO_MEMBERS.map((m) => (
          <button
            key={m.memberId}
            type="button"
            onClick={() => onPick(m.memberId)}
            title={`${m.label} → ${m.expected}`}
            style={chipStyle}
          >
            <span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>{m.memberId}</span>
            <span style={{ opacity: 0.5 }}>{m.expected}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onHide}
        style={{ ...chipStyle, marginLeft: 'auto' }}
        aria-label="Hide prototype tools"
      >
        Hide
      </button>
    </div>
  );
}
