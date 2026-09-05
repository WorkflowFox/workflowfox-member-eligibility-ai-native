/**
 * ApiEligibilityService — implements EligibilityService against the real
 * FastAPI backend (`POST /api/eligibility/check`, see openapi.yaml). Same
 * interface as MockEligibilityService, so the UI is unaffected by this
 * swap (spec §23, CLAUDE.md Phase 5).
 */
import {
  STATUS,
  EligibilityServiceError,
  type EligibilityRequest,
  type EligibilityResult,
  type EligibilityService,
  type EligibilityStatus,
} from './types';

export interface ApiEligibilityServiceOptions {
  /** Backend origin, e.g. `http://localhost:8092`. No trailing slash required. */
  baseUrl: string;
}

const VALID_STATUSES = new Set<string>(Object.values(STATUS));

function isEligibilityStatus(value: unknown): value is EligibilityStatus {
  return typeof value === 'string' && VALID_STATUSES.has(value);
}

/** Narrows an arbitrary decoded response body into a trusted EligibilityResult. */
function toEligibilityResult(body: unknown): EligibilityResult | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;

  if (!isEligibilityStatus(data.status)) return null;
  if (typeof data.reason !== 'string') return null;
  if (typeof data.checkCoverageOn !== 'string') return null;

  return {
    status: data.status,
    reason: data.reason,
    checkCoverageOn: data.checkCoverageOn,
    member: data.member as EligibilityResult['member'],
    coverage: data.coverage as EligibilityResult['coverage'],
  };
}

export function createApiEligibilityService(
  options: ApiEligibilityServiceOptions,
): EligibilityService {
  const baseUrl = options.baseUrl.replace(/\/+$/, '');

  return {
    async checkEligibility(request: EligibilityRequest): Promise<EligibilityResult> {
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/api/eligibility/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
      } catch {
        // Network failure (backend unreachable, DNS, CORS, etc.) — technical error.
        throw new EligibilityServiceError();
      }

      // Every business outcome (including MEMBER_NOT_FOUND) is a 200 OK.
      // Anything else — 422/500/503/other — is a technical failure.
      if (!response.ok) {
        throw new EligibilityServiceError();
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new EligibilityServiceError();
      }

      const result = toEligibilityResult(body);
      if (!result) {
        throw new EligibilityServiceError();
      }

      return result;
    },
  };
}
