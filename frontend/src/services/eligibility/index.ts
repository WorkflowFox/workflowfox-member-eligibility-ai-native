/**
 * Public entry point for the eligibility service layer. UI code imports the
 * interface and `getEligibilityService()` from here and never reaches for a
 * concrete implementation — swapping the mock for the real API later is a
 * one-line change in this file (spec §23).
 */
import { createMockEligibilityService } from './mockEligibilityService';
import type { EligibilityService } from './types';

export * from './types';
export { formatLongDate, isIsoDate, evaluateEligibility } from './rules';
export { DEMO_MEMBERS, type DemoMember } from './data';
export { createMockEligibilityService } from './mockEligibilityService';

let singleton: EligibilityService | null = null;

/** The service the app runs against. Phase 2: the mock implementation. */
export function getEligibilityService(): EligibilityService {
  if (!singleton) {
    const latencyMs = Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 900);
    singleton = createMockEligibilityService({
      latencyMs: Number.isFinite(latencyMs) ? latencyMs : 900,
    });
  }
  return singleton;
}
