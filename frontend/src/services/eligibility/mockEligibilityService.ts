/**
 * MockEligibilityService — an in-browser implementation of EligibilityService
 * so the whole application works without a backend (spec §24). A later
 * ApiEligibilityService implements the same interface against
 * `POST /api/eligibility/check`.
 */
import { MEMBERS } from './data';
import { evaluateEligibility } from './rules';
import {
  STATUS,
  EligibilityServiceError,
  type EligibilityRequest,
  type EligibilityResult,
  type EligibilityService,
} from './types';

export interface MockEligibilityServiceOptions {
  /** Simulated round-trip latency in ms (spec §11 loading behaviour). */
  latencyMs?: number;
}

export function createMockEligibilityService(
  options: MockEligibilityServiceOptions = {},
): EligibilityService {
  const latencyMs = options.latencyMs ?? 900;

  return {
    async checkEligibility({
      memberId,
      coverageDate,
    }: EligibilityRequest): Promise<EligibilityResult> {
      if (latencyMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, latencyMs));
      }

      const key = String(memberId ?? '').trim().toUpperCase();
      const record = MEMBERS[key];

      // Technical failure — rejects, so the UI shows the friendly error state.
      if (record?.failing) {
        throw new EligibilityServiceError('Upstream eligibility service is unavailable.');
      }

      // BR-002 — exact lookup; a miss is a normal business outcome, not an error.
      if (!record) {
        return {
          status: STATUS.MEMBER_NOT_FOUND,
          reason: 'No member was found for the entered Member ID.',
          checkCoverageOn: coverageDate,
        };
      }

      const decision = evaluateEligibility(record, coverageDate);
      return {
        status: decision.status,
        reason: decision.reason,
        checkCoverageOn: coverageDate,
        member: record.member,
        coverage: record.coverage,
      };
    },
  };
}
