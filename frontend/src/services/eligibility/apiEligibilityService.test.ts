import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiEligibilityService } from './apiEligibilityService';
import { EligibilityServiceError } from './types';

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as Response;
}

const svc = createApiEligibilityService({ baseUrl: 'http://localhost:8092' });

describe('ApiEligibilityService.checkEligibility', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs the request body to the exact contract endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        status: 'ELIGIBLE',
        reason: 'The member has active coverage on September 3, 2026.',
        checkCoverageOn: '2026-09-03',
        member: { memberId: 'WF10001', firstName: 'Jordan', lastName: 'Miller' },
        coverage: {
          planName: 'Gold PPO',
          planType: 'PPO',
          effectiveDate: '2026-01-01',
          terminationDate: '2026-12-31',
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await svc.checkEligibility({ memberId: 'WF10001', coverageDate: '2026-09-03' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8092/api/eligibility/check');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({ memberId: 'WF10001', coverageDate: '2026-09-03' });

    expect(result.status).toBe('ELIGIBLE');
    expect(result.member).toEqual({ memberId: 'WF10001', firstName: 'Jordan', lastName: 'Miller' });
    expect(result.coverage?.planName).toBe('Gold PPO');
  });

  it('maps a MEMBER_NOT_FOUND 200 response as a business outcome, not an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          status: 'MEMBER_NOT_FOUND',
          reason: 'No member was found for the entered Member ID.',
          checkCoverageOn: '2026-09-03',
        }),
      ),
    );

    const result = await svc.checkEligibility({ memberId: 'WF99999', coverageDate: '2026-09-03' });
    expect(result.status).toBe('MEMBER_NOT_FOUND');
    expect(result.member).toBeUndefined();
  });

  it('maps an UNABLE_TO_DETERMINE 200 response correctly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          status: 'UNABLE_TO_DETERMINE',
          reason: 'The coverage termination date precedes the effective date.',
          checkCoverageOn: '2026-09-03',
          member: { memberId: 'WF10005', firstName: 'Marcus', lastName: 'Ellery' },
          coverage: {
            planName: 'Silver HMO',
            planType: 'HMO',
            effectiveDate: '2026-06-01',
            terminationDate: '2026-02-28',
          },
        }),
      ),
    );

    const result = await svc.checkEligibility({ memberId: 'WF10005', coverageDate: '2026-09-03' });
    expect(result.status).toBe('UNABLE_TO_DETERMINE');
  });

  it('rejects with EligibilityServiceError when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(
      svc.checkEligibility({ memberId: 'WF10001', coverageDate: '2026-09-03' }),
    ).rejects.toBeInstanceOf(EligibilityServiceError);
  });

  it('rejects with EligibilityServiceError on a 422 validation response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'The request is invalid.',
            details: [{ field: 'memberId', message: 'Enter a Member ID.' }],
          },
          { ok: false, status: 422 },
        ),
      ),
    );

    await expect(
      svc.checkEligibility({ memberId: '', coverageDate: '2026-09-03' }),
    ).rejects.toBeInstanceOf(EligibilityServiceError);
  });

  it('rejects with EligibilityServiceError on a 500 server error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          { code: 'INTERNAL_ERROR', message: "We couldn't complete the eligibility check right now." },
          { ok: false, status: 500 },
        ),
      ),
    );

    await expect(
      svc.checkEligibility({ memberId: 'WF10001', coverageDate: '2026-09-03' }),
    ).rejects.toBeInstanceOf(EligibilityServiceError);
  });

  it('rejects with EligibilityServiceError on a malformed 200 body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ unexpected: 'shape' })));

    await expect(
      svc.checkEligibility({ memberId: 'WF10001', coverageDate: '2026-09-03' }),
    ).rejects.toBeInstanceOf(EligibilityServiceError);
  });
});
