import {
  CheckCircleIcon,
  ClockIcon,
  HelpCircleIcon,
  PlusIcon,
  SearchXIcon,
  XCircleIcon,
} from './icons';
import { statusVisual } from '../lib/statusVisual';
import { formatLongDate, type EligibilityResult, type EligibilityStatus } from '../services/eligibility';

interface EligibilityResultViewProps {
  result: EligibilityResult;
  /** Falls back for the Member ID row when the record has no member block. */
  requestedMemberId: string;
  onNewInquiry: () => void;
}

function StatusIcon({ status }: { status: EligibilityStatus }) {
  switch (status) {
    case 'ELIGIBLE':
      return <CheckCircleIcon size={19} />;
    case 'NOT_YET_ELIGIBLE':
      return <ClockIcon size={19} />;
    case 'INELIGIBLE':
      return <XCircleIcon size={19} />;
    case 'MEMBER_NOT_FOUND':
      return <SearchXIcon size={19} />;
    case 'UNABLE_TO_DETERMINE':
      return <HelpCircleIcon size={19} />;
  }
}

const kicker: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  margin: '0 0 10px',
  color: 'var(--color-accent-700)',
};
const dt: React.CSSProperties = { fontSize: 11.5 };
const dd: React.CSSProperties = { margin: '1px 0 0', fontSize: 14 };
const cell: React.CSSProperties = {
  padding: '16px 20px',
  borderTop: '1px solid var(--color-divider)',
};

/** The result panel (spec §12–§13): status first, then why, then who, then
 *  which plan, then the dates that support the decision. */
export function EligibilityResultView({
  result,
  requestedMemberId,
  onNewInquiry,
}: EligibilityResultViewProps) {
  const visual = statusVisual(result.status);
  const cov = result.coverage ?? null;

  const memberIdOut = result.member?.memberId ?? requestedMemberId ?? '—';
  const memberName = result.member
    ? `${result.member.firstName} ${result.member.lastName}`
    : 'Not available';
  const planName = cov?.planName ?? 'Not available';
  const planType = cov?.planType ?? 'Not available';
  const effectiveDate = cov?.effectiveDate ? formatLongDate(cov.effectiveDate) : 'Not on record';
  const terminationDate = cov
    ? cov.terminationDate
      ? formatLongDate(cov.terminationDate)
      : 'None — coverage is open-ended'
    : 'Not on record';

  return (
    <section className="blueprint wf-in">
      <h2
        style={{
          fontSize: 13,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          margin: 0,
          padding: '11px 20px',
          borderBottom: '1px solid var(--color-divider)',
          color: 'color-mix(in srgb, var(--color-text) 60%, transparent)',
        }}
      >
        Eligibility result
      </h2>

      <div style={visual.band}>
        <div style={visual.badge}>
          <StatusIcon status={result.status} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: '0 0 2px',
              font: '600 10px/1 var(--font-heading)',
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            Status
          </p>
          <h3 style={{ fontSize: 29, margin: '0 0 5px', letterSpacing: '-.01em' }}>
            {visual.label}
          </h3>
          <p style={{ margin: 0, fontSize: 14.5, maxWidth: '62ch', textWrap: 'pretty' }}>
            {result.reason}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 12.5, opacity: 0.75 }}>
            Coverage checked on {formatLongDate(result.checkCoverageOn)}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))' }}>
        <div style={cell}>
          <h4 style={kicker}>Member</h4>
          <dl style={{ margin: 0, display: 'grid', gap: 8 }}>
            <div>
              <dt className="text-muted" style={dt}>
                Member ID
              </dt>
              <dd style={{ ...dd, fontFamily: 'ui-monospace, Menlo, monospace' }}>{memberIdOut}</dd>
            </div>
            <div>
              <dt className="text-muted" style={dt}>
                Member name
              </dt>
              <dd style={dd}>{memberName}</dd>
            </div>
          </dl>
        </div>

        <div style={{ ...cell, borderLeft: '1px solid var(--color-divider)' }}>
          <h4 style={kicker}>Plan</h4>
          <dl style={{ margin: 0, display: 'grid', gap: 8 }}>
            <div>
              <dt className="text-muted" style={dt}>
                Plan name
              </dt>
              <dd style={dd}>{planName}</dd>
            </div>
            <div>
              <dt className="text-muted" style={dt}>
                Plan type
              </dt>
              <dd style={dd}>{planType}</dd>
            </div>
          </dl>
        </div>

        <div style={{ ...cell, borderLeft: '1px solid var(--color-divider)' }}>
          <h4 style={kicker}>Coverage dates</h4>
          <dl style={{ margin: 0, display: 'grid', gap: 8 }}>
            <div>
              <dt className="text-muted" style={dt}>
                Effective
              </dt>
              <dd style={dd}>{effectiveDate}</dd>
            </div>
            <div>
              <dt className="text-muted" style={dt}>
                Termination
              </dt>
              <dd style={dd}>{terminationDate}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div
        style={{
          padding: '13px 20px',
          borderTop: '1px solid var(--color-divider)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onNewInquiry}
          style={{
            height: 34,
            paddingInline: 14,
            letterSpacing: '.03em',
            textTransform: 'uppercase',
            fontSize: 12.5,
            gap: 7,
          }}
        >
          <PlusIcon size={14} />
          New inquiry
        </button>
        <span className="text-muted" style={{ fontSize: 11.5 }}>
          Read-only inquiry · no member or coverage data was changed
        </span>
      </div>
    </section>
  );
}
