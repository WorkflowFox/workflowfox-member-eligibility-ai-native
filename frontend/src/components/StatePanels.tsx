import { BlueprintCorners } from './BlueprintCorners';
import { AlertTriangleIcon, SearchIcon, SpinnerIcon } from './icons';

/** Nothing checked yet (spec §15). */
export function IdlePanel() {
  return (
    <div
      style={{
        border: '1px dashed var(--color-divider)',
        padding: '38px 22px',
        textAlign: 'center',
      }}
    >
      <SearchIcon size={26} stroke="var(--color-accent)" style={{ margin: '0 auto 10px' }} />
      <p style={{ margin: 0, fontSize: 13.5 }} className="text-muted">
        Enter a Member ID and a coverage date, then select Check Eligibility.
      </p>
    </div>
  );
}

/** Inquiry in flight (spec §11). */
export function LoadingPanel() {
  return (
    <div
      className="blueprint wf-in"
      style={{
        padding: '30px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'center',
      }}
    >
      <BlueprintCorners />
      <SpinnerIcon size={18} stroke="var(--color-accent)" />
      <span style={{ font: '600 17px/1.2 var(--font-heading)' }}>Checking eligibility…</span>
    </div>
  );
}

interface ErrorPanelProps {
  lastMemberId: string;
  lastDateLong: string;
  onRetry: () => void;
}

/** Technical failure — a friendly message, never internals (spec §14.2). */
export function ErrorPanel({ lastMemberId, lastDateLong, onRetry }: ErrorPanelProps) {
  return (
    <div className="blueprint wf-in">
      <BlueprintCorners />
      <div
        style={{
          display: 'flex',
          gap: 13,
          alignItems: 'flex-start',
          padding: '18px 20px',
          background: 'var(--color-neutral-100)',
          borderBottom: '1px solid var(--color-divider)',
        }}
      >
        <AlertTriangleIcon
          size={20}
          stroke="var(--color-neutral-800)"
          style={{ flex: 'none', marginTop: 2 }}
        />
        <div>
          <h2 style={{ fontSize: 19, margin: '0 0 3px' }}>Eligibility check unavailable</h2>
          <p style={{ margin: 0, fontSize: 13.5 }}>
            We couldn't complete the eligibility check right now. Please try again.
          </p>
        </div>
      </div>
      <div
        style={{
          padding: '14px 20px',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={onRetry}
          style={{
            height: 34,
            paddingInline: 15,
            letterSpacing: '.03em',
            textTransform: 'uppercase',
            fontSize: 12.5,
          }}
        >
          Try again
        </button>
        {lastMemberId && (
          <span className="text-muted" style={{ fontSize: 12 }}>
            Member ID {lastMemberId} · {lastDateLong}
          </span>
        )}
      </div>
    </div>
  );
}
