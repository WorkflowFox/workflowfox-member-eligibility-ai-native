import type { RefObject } from 'react';
import { AlertCircleIcon, SpinnerIcon } from './icons';

interface InquiryFormProps {
  memberId: string;
  coverageDate: string;
  memberIdError: string;
  dateError: string;
  isLoading: boolean;
  memberIdRef: RefObject<HTMLInputElement | null>;
  onMemberIdChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSubmit: () => void;
}

const fieldError: React.CSSProperties = {
  minHeight: 18,
  margin: '5px 0 0',
  fontSize: 12,
  lineHeight: 1.4,
  color: 'var(--color-accent-800)',
  display: 'flex',
  gap: 6,
  alignItems: 'flex-start',
};

/** The eligibility inquiry form (spec §10). Validation messages are wired to
 *  their fields with aria-describedby + role="alert" (spec §17). */
export function InquiryForm({
  memberId,
  coverageDate,
  memberIdError,
  dateError,
  isLoading,
  memberIdRef,
  onMemberIdChange,
  onDateChange,
  onSubmit,
}: InquiryFormProps) {
  return (
    <form
      className="card blueprint"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
      style={{ padding: '18px 20px 20px', gap: 0, background: 'transparent' }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 16px', alignItems: 'flex-start' }}>
        <div className="field" style={{ flex: '1 1 250px', minWidth: 200 }}>
          <label htmlFor="memberId">
            Member ID <span style={{ color: 'var(--color-accent-700)' }}>(required)</span>
          </label>
          <input
            id="memberId"
            className="input"
            type="text"
            name="memberId"
            autoComplete="off"
            placeholder="e.g. WF10001"
            value={memberId}
            onChange={(e) => onMemberIdChange(e.target.value)}
            aria-invalid={memberIdError ? true : undefined}
            aria-describedby="memberId-error"
            ref={memberIdRef}
            style={{ fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.02em' }}
          />
          <p id="memberId-error" role="alert" style={fieldError}>
            {memberIdError && (
              <AlertCircleIcon size={13} style={{ flex: 'none', marginTop: 2 }} />
            )}
            {memberIdError}
          </p>
        </div>

        <div className="field" style={{ flex: '0 1 190px', minWidth: 170 }}>
          <label htmlFor="coverageDate">
            Check Coverage On <span style={{ color: 'var(--color-accent-700)' }}>(required)</span>
          </label>
          <input
            id="coverageDate"
            className="input"
            type="date"
            name="coverageDate"
            value={coverageDate}
            onChange={(e) => onDateChange(e.target.value)}
            aria-invalid={dateError ? true : undefined}
            aria-describedby="coverageDate-error"
          />
          <p id="coverageDate-error" role="alert" style={fieldError}>
            {dateError && <AlertCircleIcon size={13} style={{ flex: 'none', marginTop: 2 }} />}
            {dateError}
          </p>
        </div>

        <div
          style={{
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            paddingTop: 19,
          }}
        >
          <button
            type="submit"
            className="btn btn-primary blueprint"
            disabled={isLoading}
            style={{
              height: 36,
              paddingInline: 18,
              letterSpacing: '.03em',
              textTransform: 'uppercase',
              fontSize: 13,
              gap: 8,
            }}
          >
            {isLoading && <SpinnerIcon size={14} />}
            {isLoading ? 'Checking…' : 'Check Eligibility'}
          </button>
        </div>
      </div>
    </form>
  );
}
