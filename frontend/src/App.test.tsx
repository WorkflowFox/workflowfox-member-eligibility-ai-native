import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { renderWithClient } from './test/renderApp';
import { todayIso } from './lib/date';
import {
  createMockEligibilityService,
  type EligibilityRequest,
  type EligibilityService,
} from './services/eligibility';

/** A mock service that records calls and resolves with zero latency. */
function spyService(): EligibilityService & { calls: EligibilityRequest[] } {
  const real = createMockEligibilityService({ latencyMs: 0 });
  const calls: EligibilityRequest[] = [];
  return {
    calls,
    checkEligibility: vi.fn((req: EligibilityRequest) => {
      calls.push(req);
      return real.checkEligibility(req);
    }),
  };
}

/** A mock service whose response is held open until `release()` is called. */
function gatedService() {
  const real = createMockEligibilityService({ latencyMs: 0 });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const service: EligibilityService = {
    checkEligibility: async (req) => {
      await gate;
      return real.checkEligibility(req);
    },
  };
  return { service, release };
}

async function submitFor(memberId: string, coverageDate = '2026-09-03') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Member ID/i), memberId);
  fireEvent.change(screen.getByLabelText(/Check Coverage On/i), {
    target: { value: coverageDate },
  });
  await user.click(screen.getByRole('button', { name: /check eligibility/i }));
}

describe('Member Eligibility app', () => {
  it('renders the inquiry form', () => {
    renderWithClient(<App service={spyService()} />);
    expect(screen.getByLabelText(/Member ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Check Coverage On/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check eligibility/i })).toBeInTheDocument();
  });

  it("defaults Check Coverage On to today's date", () => {
    renderWithClient(<App service={spyService()} />);
    expect(screen.getByLabelText(/Check Coverage On/i)).toHaveValue(todayIso());
  });

  it('requires a Member ID and does not call the service when it is empty', async () => {
    const svc = spyService();
    const user = userEvent.setup();
    renderWithClient(<App service={svc} />);

    await user.click(screen.getByRole('button', { name: /check eligibility/i }));

    expect(await screen.findByText('Enter a Member ID.')).toBeInTheDocument();
    expect(svc.checkEligibility).not.toHaveBeenCalled();
  });

  it('shows a loading state while the inquiry is in flight, then the result', async () => {
    const { service, release } = gatedService();
    renderWithClient(<App service={service} />);

    await submitFor('WF10001');

    expect(await screen.findByText('Checking eligibility…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /checking/i })).toBeDisabled();

    release();

    expect(await screen.findByRole('heading', { name: 'Eligible' })).toBeInTheDocument();
    expect(screen.queryByText('Checking eligibility…')).not.toBeInTheDocument();
  });

  it('renders an ELIGIBLE result with member and coverage detail', async () => {
    renderWithClient(<App service={spyService()} />);
    await submitFor('WF10001');

    expect(await screen.findByRole('heading', { name: 'Eligible' })).toBeInTheDocument();
    expect(
      screen.getByText('The member has active coverage on September 3, 2026.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Jordan Miller')).toBeInTheDocument();
    expect(screen.getByText('Gold PPO')).toBeInTheDocument();
  });

  it('renders a NOT_YET_ELIGIBLE result', async () => {
    renderWithClient(<App service={spyService()} />);
    await submitFor('WF10003');
    expect(await screen.findByRole('heading', { name: 'Not Yet Eligible' })).toBeInTheDocument();
    expect(screen.getByText('Coverage begins on October 1, 2026.')).toBeInTheDocument();
  });

  it('renders an INELIGIBLE result', async () => {
    renderWithClient(<App service={spyService()} />);
    await submitFor('WF10004');
    expect(await screen.findByRole('heading', { name: 'Ineligible' })).toBeInTheDocument();
    expect(screen.getByText('Coverage ended on August 31, 2026.')).toBeInTheDocument();
  });

  it('renders a MEMBER_NOT_FOUND result as a normal business outcome', async () => {
    renderWithClient(<App service={spyService()} />);
    await submitFor('WF99999');
    expect(await screen.findByRole('heading', { name: 'Member Not Found' })).toBeInTheDocument();
    expect(screen.getByText('No member was found for the entered Member ID.')).toBeInTheDocument();
  });

  it('renders an UNABLE_TO_DETERMINE result', async () => {
    renderWithClient(<App service={spyService()} />);
    await submitFor('WF10005');
    expect(
      await screen.findByRole('heading', { name: 'Unable to Determine' }),
    ).toBeInTheDocument();
  });

  it('renders a friendly technical-error state with a retry action', async () => {
    renderWithClient(<App service={spyService()} />);
    await submitFor('WF10099');

    expect(
      await screen.findByText(
        "We couldn't complete the eligibility check right now. Please try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    // No leaked internals.
    expect(screen.queryByText(/EligibilityServiceError/)).not.toBeInTheDocument();
  });

  it('lets the representative start another inquiry without reloading', async () => {
    const user = userEvent.setup();
    renderWithClient(<App service={spyService()} />);

    await submitFor('WF10001');
    expect(await screen.findByRole('heading', { name: 'Eligible' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /new inquiry/i }));

    expect(screen.getByLabelText(/Member ID/i)).toHaveValue('');
    expect(
      screen.getByText('Enter a Member ID and a coverage date, then select Check Eligibility.'),
    ).toBeInTheDocument();

    await submitFor('WF10003');
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Not Yet Eligible' })).toBeInTheDocument(),
    );
  });
});
