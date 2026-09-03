import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AppHeader } from './components/AppHeader';
import { PrototypeBar } from './components/PrototypeBar';
import { InquiryForm } from './components/InquiryForm';
import { EligibilityResultView } from './components/EligibilityResultView';
import { ErrorPanel, IdlePanel, LoadingPanel } from './components/StatePanels';
import { todayIso, isValidIsoDate } from './lib/date';
import {
  formatLongDate,
  getEligibilityService,
  type EligibilityRequest,
  type EligibilityService,
} from './services/eligibility';

interface AppProps {
  /** Injected in tests; defaults to the app's configured (mock) service. */
  service?: EligibilityService;
}

export default function App({ service }: AppProps) {
  const svc = service ?? getEligibilityService();

  const [memberId, setMemberId] = useState('');
  const [coverageDate, setCoverageDate] = useState(todayIso());
  const [memberIdError, setMemberIdError] = useState('');
  const [dateError, setDateError] = useState('');
  const [showPrototypeBar, setShowPrototypeBar] = useState(import.meta.env.DEV);

  const memberIdRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (request: EligibilityRequest) => svc.checkEligibility(request),
  });

  const isLoading = mutation.isPending;

  /** Validate, then run the check. Invalid inquiries never reach the service. */
  function runCheck(rawMemberId: string) {
    if (isLoading) return;

    const trimmed = rawMemberId.trim();
    const nextMemberIdError = trimmed ? '' : 'Enter a Member ID.';
    const nextDateError = isValidIsoDate(coverageDate) ? '' : 'Enter a valid coverage date.';
    setMemberIdError(nextMemberIdError);
    setDateError(nextDateError);

    if (nextMemberIdError || nextDateError) {
      if (nextMemberIdError) memberIdRef.current?.focus();
      return;
    }

    mutation.mutate({ memberId: trimmed, coverageDate });
  }

  function handleNewInquiry() {
    setMemberId('');
    setCoverageDate(todayIso());
    setMemberIdError('');
    setDateError('');
    mutation.reset();
    memberIdRef.current?.focus();
  }

  function handlePrototypePick(id: string) {
    setMemberId(id);
    setMemberIdError('');
    runCheck(id);
  }

  const lastRequest = mutation.variables;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
      }}
    >
      {showPrototypeBar && (
        <PrototypeBar onPick={handlePrototypePick} onHide={() => setShowPrototypeBar(false)} />
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          background: 'var(--color-neutral-200)',
        }}
      >
        <div
          style={{
            width: '100%',
            background: 'var(--color-bg)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
          }}
        >
          <AppHeader />

          <main style={{ padding: '26px 22px 48px', maxWidth: 1060, margin: '0 auto', width: '100%' }}>
            <h1 style={{ fontSize: 28, margin: '0 0 3px' }}>Check Member Coverage</h1>
            <p className="text-muted" style={{ margin: '0 0 20px', fontSize: 13.5 }}>
              Verify member coverage for a specific date. This inquiry is read-only.
            </p>

            <InquiryForm
              memberId={memberId}
              coverageDate={coverageDate}
              memberIdError={memberIdError}
              dateError={dateError}
              isLoading={isLoading}
              memberIdRef={memberIdRef}
              onMemberIdChange={(v) => {
                setMemberId(v);
                setMemberIdError('');
              }}
              onDateChange={(v) => {
                setCoverageDate(v);
                setDateError('');
              }}
              onSubmit={() => runCheck(memberId)}
            />

            <div aria-live="polite" aria-atomic="true" style={{ marginTop: 26 }}>
              {mutation.isIdle && <IdlePanel />}

              {isLoading && <LoadingPanel />}

              {mutation.isError && (
                <ErrorPanel
                  lastMemberId={lastRequest?.memberId ?? ''}
                  lastDateLong={
                    lastRequest ? formatLongDate(lastRequest.coverageDate) : ''
                  }
                  onRetry={() => lastRequest && mutation.mutate(lastRequest)}
                />
              )}

              {mutation.isSuccess && (
                <EligibilityResultView
                  result={mutation.data}
                  requestedMemberId={lastRequest?.memberId ?? ''}
                  onNewInquiry={handleNewInquiry}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
