/**
 * Public entry point for the eligibility service layer. UI code imports the
 * interface and `getEligibilityService()` from here and never reaches for a
 * concrete implementation (spec §23). Phase 5: normal execution runs against
 * `ApiEligibilityService`; `MockEligibilityService` remains available for
 * tests and isolated frontend development (CLAUDE.md Step 8).
 */
import { createApiEligibilityService } from './apiEligibilityService';
import type { EligibilityService } from './types';

export * from './types';
export { formatLongDate, isIsoDate, evaluateEligibility } from './rules';
export { DEMO_MEMBERS, type DemoMember } from './data';
export { createMockEligibilityService } from './mockEligibilityService';
export { createApiEligibilityService } from './apiEligibilityService';

/** Local-development default; override with VITE_API_BASE_URL for other environments. */
const DEFAULT_API_BASE_URL = 'http://localhost:8092';

let singleton: EligibilityService | null = null;

/** The service the app runs against: the real FastAPI backend. */
export function getEligibilityService(): EligibilityService {
  if (!singleton) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
    singleton = createApiEligibilityService({ baseUrl });
  }
  return singleton;
}
