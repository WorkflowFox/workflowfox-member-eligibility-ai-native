/**
 * Eligibility business rules (BR-001 … BR-006, spec §8–§9).
 *
 * Framework-free and deterministic: no React, no HTTP. The same record and
 * coverage date always produce the same decision. Boundary dates are
 * inclusive — on the effective date and on the termination date the member
 * can be ELIGIBLE (spec §9).
 */
import { STATUS, type EligibilityStatus } from './types';

export interface CoverageRecordInput {
  planName?: string | null;
  planType?: string | null;
  effectiveDate?: string | null;
  terminationDate?: string | null;
}

export interface MemberRecordInput {
  coverage?: CoverageRecordInput | null;
}

export interface RuleDecision {
  status: EligibilityStatus;
  reason: string;
}

export const isIsoDate = (v: unknown): v is string =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Render an ISO date as e.g. "September 3, 2026" (spec §13). */
export const formatLongDate = (iso: string | null | undefined): string => {
  if (!isIsoDate(iso)) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Evaluate a member's coverage record against the requested date.
 * The system never manufactures missing coverage information to force a
 * decision — insufficient or contradictory data yields UNABLE_TO_DETERMINE
 * (BR-006).
 */
export function evaluateEligibility(
  record: MemberRecordInput | null | undefined,
  coverageDate: string,
): RuleDecision {
  const cov = record?.coverage;

  // BR-006 — required coverage data missing or unusable.
  if (!cov || !isIsoDate(cov.effectiveDate) || !cov.planName) {
    return {
      status: STATUS.UNABLE_TO_DETERMINE,
      reason:
        'Coverage information for this member is missing or incomplete, so eligibility cannot be determined.',
    };
  }
  if (cov.terminationDate != null && !isIsoDate(cov.terminationDate)) {
    return {
      status: STATUS.UNABLE_TO_DETERMINE,
      reason:
        'The coverage termination date on this record is not valid, so eligibility cannot be determined.',
    };
  }
  if (cov.terminationDate && cov.terminationDate < cov.effectiveDate) {
    return {
      status: STATUS.UNABLE_TO_DETERMINE,
      reason:
        'The coverage termination date precedes the effective date, so eligibility cannot be determined.',
    };
  }

  // BR-003 — before coverage begins.
  if (coverageDate < cov.effectiveDate) {
    return {
      status: STATUS.NOT_YET_ELIGIBLE,
      reason: `Coverage begins on ${formatLongDate(cov.effectiveDate)}.`,
    };
  }

  // BR-004 — after coverage ends (a missing termination date means coverage
  // stays active after the effective date).
  if (cov.terminationDate && coverageDate > cov.terminationDate) {
    return {
      status: STATUS.INELIGIBLE,
      reason: `Coverage ended on ${formatLongDate(cov.terminationDate)}.`,
    };
  }

  // BR-005 — the requested date falls inside the active coverage period.
  return {
    status: STATUS.ELIGIBLE,
    reason: `The member has active coverage on ${formatLongDate(coverageDate)}.`,
  };
}
