import wordmark from '../assets/workflowfox-primary.svg';

/** The product header: brand + app name on the left, the signed-in rep on the right. */
export function AppHeader() {
  return (
    <header
      className="nav"
      style={{ padding: '13px 22px', borderBottom: '1px solid var(--color-divider)', gap: 14 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginRight: 'auto',
          minWidth: 0,
        }}
      >
        <img
          src={wordmark}
          alt="WorkflowFox"
          style={{ height: 20, width: 'auto', opacity: 0.92 }}
        />
        <span style={{ width: 1, height: 16, background: 'var(--color-divider)' }} />
        <span
          style={{
            font: '600 15px/1 var(--font-heading)',
            letterSpacing: '.01em',
            whiteSpace: 'nowrap',
          }}
        >
          Member Eligibility
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--color-divider)',
            font: '600 11px/1 var(--font-heading)',
            letterSpacing: '.04em',
            color: 'var(--color-accent-700)',
          }}
        >
          RK
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap' }}>R. Keene</span>
          <span className="text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
            Service Representative
          </span>
        </span>
      </div>
    </header>
  );
}
