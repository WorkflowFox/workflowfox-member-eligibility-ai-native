/**
 * Synthetic dataset — fictional, no PHI/PII (spec §18–§19). Enough scenarios
 * to demonstrate every eligibility outcome. Ported from the design prototype's
 * `services/eligibility-service.js`.
 */
import type { CoverageSummary, MemberSummary } from './types';

export interface MemberRecord {
  member: MemberSummary;
  coverage?: CoverageSummary;
  /** When true the mock service simulates a technical failure (spec §24). */
  failing?: boolean;
}

export const MEMBERS: Record<string, MemberRecord> = {
  WF10001: {
    member: { memberId: 'WF10001', firstName: 'Jordan', lastName: 'Miller' },
    coverage: {
      planName: 'Gold PPO',
      planType: 'PPO',
      effectiveDate: '2026-01-01',
      terminationDate: '2026-12-31',
    },
  },
  WF10002: {
    member: { memberId: 'WF10002', firstName: 'Alicia', lastName: 'Nakamura' },
    coverage: {
      planName: 'Core HMO',
      planType: 'HMO',
      effectiveDate: '2024-03-15',
      terminationDate: null,
    },
  },
  WF10003: {
    member: { memberId: 'WF10003', firstName: 'Devon', lastName: 'Alvarez' },
    coverage: {
      planName: 'Silver PPO',
      planType: 'PPO',
      effectiveDate: '2026-10-01',
      terminationDate: null,
    },
  },
  WF10004: {
    member: { memberId: 'WF10004', firstName: 'Priya', lastName: 'Raman' },
    coverage: {
      planName: 'Bronze HMO',
      planType: 'HMO',
      effectiveDate: '2025-02-01',
      terminationDate: '2026-08-31',
    },
  },
  WF10005: {
    member: { memberId: 'WF10005', firstName: 'Marcus', lastName: 'Ellery' },
    // Inconsistent record: termination precedes effective date.
    coverage: {
      planName: 'Silver HMO',
      planType: 'HMO',
      effectiveDate: '2026-06-01',
      terminationDate: '2026-02-28',
    },
  },
  WF10006: {
    member: { memberId: 'WF10006', firstName: 'Renata', lastName: 'Cole' },
    // Missing effective date.
    coverage: {
      planName: 'Gold HMO',
      planType: 'HMO',
      effectiveDate: null,
      terminationDate: null,
    },
  },
  WF10099: {
    failing: true,
    member: { memberId: 'WF10099', firstName: 'Sam', lastName: 'Okafor' },
  },
};

export interface DemoMember {
  memberId: string;
  label: string;
  expected: string;
}

export const DEMO_MEMBERS: DemoMember[] = [
  { memberId: 'WF10001', label: 'Active, future term date', expected: 'Eligible' },
  { memberId: 'WF10002', label: 'Open-ended coverage', expected: 'Eligible' },
  { memberId: 'WF10003', label: 'Coverage begins later', expected: 'Not Yet Eligible' },
  { memberId: 'WF10004', label: 'Coverage terminated', expected: 'Ineligible' },
  { memberId: 'WF10005', label: 'Inconsistent dates', expected: 'Unable to Determine' },
  { memberId: 'WF99999', label: 'No such member', expected: 'Member Not Found' },
  { memberId: 'WF10099', label: 'Service outage', expected: 'Technical error' },
];
