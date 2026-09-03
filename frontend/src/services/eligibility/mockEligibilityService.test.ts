import { describe, expect, it } from 'vitest';
import { createMockEligibilityService } from './mockEligibilityService';
import { EligibilityServiceError } from './types';

const svc = createMockEligibilityService({ latencyMs: 0 });

describe('MockEligibilityService.checkEligibility', () => {
  it('returns ELIGIBLE with member and coverage for an active member', async () => {
    const res = await svc.checkEligibility({ memberId: 'WF10001', coverageDate: '2026-09-03' });
    expect(res.status).toBe('ELIGIBLE');
    expect(res.member).toEqual({ memberId: 'WF10001', firstName: 'Jordan', lastName: 'Miller' });
    expect(res.coverage?.planName).toBe('Gold PPO');
    expect(res.checkCoverageOn).toBe('2026-09-03');
  });

  it('returns ELIGIBLE for open-ended coverage', async () => {
    const res = await svc.checkEligibility({ memberId: 'WF10002', coverageDate: '2026-09-03' });
    expect(res.status).toBe('ELIGIBLE');
    expect(res.coverage?.terminationDate).toBeNull();
  });

  it('returns NOT_YET_ELIGIBLE for future coverage', async () => {
    const res = await svc.checkEligibility({ memberId: 'WF10003', coverageDate: '2026-09-03' });
    expect(res.status).toBe('NOT_YET_ELIGIBLE');
  });

  it('returns INELIGIBLE for terminated coverage', async () => {
    const res = await svc.checkEligibility({ memberId: 'WF10004', coverageDate: '2026-09-03' });
    expect(res.status).toBe('INELIGIBLE');
  });

  it('returns UNABLE_TO_DETERMINE for an inconsistent record', async () => {
    const res = await svc.checkEligibility({ memberId: 'WF10005', coverageDate: '2026-09-03' });
    expect(res.status).toBe('UNABLE_TO_DETERMINE');
  });

  it('trims and upper-cases the Member ID before the exact lookup (BR-002)', async () => {
    const res = await svc.checkEligibility({ memberId: '  wf10001 ', coverageDate: '2026-09-03' });
    expect(res.status).toBe('ELIGIBLE');
  });

  it('returns MEMBER_NOT_FOUND as a business outcome for an unknown ID', async () => {
    const res = await svc.checkEligibility({ memberId: 'WF99999', coverageDate: '2026-09-03' });
    expect(res.status).toBe('MEMBER_NOT_FOUND');
    expect(res.member).toBeUndefined();
  });

  it('rejects with EligibilityServiceError for the simulated outage member', async () => {
    await expect(
      svc.checkEligibility({ memberId: 'WF10099', coverageDate: '2026-09-03' }),
    ).rejects.toBeInstanceOf(EligibilityServiceError);
  });

  it('is deterministic — same input, same result', async () => {
    const a = await svc.checkEligibility({ memberId: 'WF10004', coverageDate: '2026-08-31' });
    const b = await svc.checkEligibility({ memberId: 'WF10004', coverageDate: '2026-08-31' });
    expect(a).toEqual(b);
    expect(a.status).toBe('ELIGIBLE'); // on the termination date itself
  });
});
