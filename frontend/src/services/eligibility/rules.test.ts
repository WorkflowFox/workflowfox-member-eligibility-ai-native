import { describe, expect, it } from 'vitest';
import { evaluateEligibility, formatLongDate } from './rules';

const coverage = (over: Partial<{
  planName: string | null;
  planType: string | null;
  effectiveDate: string | null;
  terminationDate: string | null;
}> = {}) => ({
  coverage: {
    planName: 'Gold PPO',
    planType: 'PPO',
    effectiveDate: '2026-01-01',
    terminationDate: '2026-12-31',
    ...over,
  },
});

describe('evaluateEligibility — business rules BR-003 … BR-006', () => {
  it('is ELIGIBLE inside the coverage period', () => {
    expect(evaluateEligibility(coverage(), '2026-09-03').status).toBe('ELIGIBLE');
  });

  it('is ELIGIBLE exactly on the effective date (inclusive boundary)', () => {
    expect(evaluateEligibility(coverage(), '2026-01-01').status).toBe('ELIGIBLE');
  });

  it('is ELIGIBLE exactly on the termination date (inclusive boundary)', () => {
    expect(evaluateEligibility(coverage(), '2026-12-31').status).toBe('ELIGIBLE');
  });

  it('is NOT_YET_ELIGIBLE the day before the effective date', () => {
    const decision = evaluateEligibility(coverage(), '2025-12-31');
    expect(decision.status).toBe('NOT_YET_ELIGIBLE');
    expect(decision.reason).toBe('Coverage begins on January 1, 2026.');
  });

  it('is INELIGIBLE the day after the termination date', () => {
    const decision = evaluateEligibility(coverage(), '2027-01-01');
    expect(decision.status).toBe('INELIGIBLE');
    expect(decision.reason).toBe('Coverage ended on December 31, 2026.');
  });

  it('stays ELIGIBLE after the effective date when there is no termination date', () => {
    expect(
      evaluateEligibility(coverage({ terminationDate: null }), '2999-01-01').status,
    ).toBe('ELIGIBLE');
  });

  it('is UNABLE_TO_DETERMINE when the effective date is missing', () => {
    expect(
      evaluateEligibility(coverage({ effectiveDate: null }), '2026-09-03').status,
    ).toBe('UNABLE_TO_DETERMINE');
  });

  it('is UNABLE_TO_DETERMINE when termination precedes effective', () => {
    expect(
      evaluateEligibility(
        coverage({ effectiveDate: '2026-06-01', terminationDate: '2026-02-28' }),
        '2026-09-03',
      ).status,
    ).toBe('UNABLE_TO_DETERMINE');
  });

  it('is UNABLE_TO_DETERMINE when the termination date is malformed', () => {
    expect(
      evaluateEligibility(coverage({ terminationDate: 'not-a-date' }), '2026-09-03').status,
    ).toBe('UNABLE_TO_DETERMINE');
  });

  it('is UNABLE_TO_DETERMINE when there is no coverage record at all', () => {
    expect(evaluateEligibility({ coverage: null }, '2026-09-03').status).toBe(
      'UNABLE_TO_DETERMINE',
    );
  });
});

describe('formatLongDate', () => {
  it('renders an ISO date in long US form', () => {
    expect(formatLongDate('2026-09-03')).toBe('September 3, 2026');
  });

  it('renders an em dash for an invalid date', () => {
    expect(formatLongDate('nope')).toBe('—');
    expect(formatLongDate(null)).toBe('—');
  });
});
