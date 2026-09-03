/**
 * Eligibility service layer — the single boundary between UI and backend.
 *
 * UI components only ever call `eligibilityService.checkEligibility(request)`.
 * This phase ships `MockEligibilityService`; a later `ApiEligibilityService`
 * will implement the same interface (POST /api/eligibility/check) with no UI
 * changes (spec §23, §26).
 */

export const STATUS = {
  ELIGIBLE: 'ELIGIBLE',
  NOT_YET_ELIGIBLE: 'NOT_YET_ELIGIBLE',
  INELIGIBLE: 'INELIGIBLE',
  MEMBER_NOT_FOUND: 'MEMBER_NOT_FOUND',
  UNABLE_TO_DETERMINE: 'UNABLE_TO_DETERMINE',
} as const;

export type EligibilityStatus = (typeof STATUS)[keyof typeof STATUS];

export interface EligibilityRequest {
  /** Exact Member ID as entered (the service trims before lookup). */
  memberId: string;
  /** Coverage-check date, ISO `YYYY-MM-DD`. */
  coverageDate: string;
}

export interface MemberSummary {
  memberId: string;
  firstName: string;
  lastName: string;
}

export interface CoverageSummary {
  planName: string;
  planType: string;
  effectiveDate: string | null;
  terminationDate: string | null;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  /** Plain-language explanation shown next to the status (spec §13). */
  reason: string;
  checkCoverageOn: string;
  member?: MemberSummary;
  coverage?: CoverageSummary;
}

export interface EligibilityService {
  checkEligibility(request: EligibilityRequest): Promise<EligibilityResult>;
}

/** Thrown for technical failures only — never for business outcomes (spec §14). */
export class EligibilityServiceError extends Error {
  constructor(message = 'The eligibility service is unavailable.') {
    super(message);
    this.name = 'EligibilityServiceError';
  }
}
