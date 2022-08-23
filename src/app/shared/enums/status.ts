import { TIMETHEETS_STATUSES } from '../../modules/timesheets/enums';
import { INVOICES_STATUSES } from '../../modules/invoices/enums/invoices.enum';
import { OrderType } from './order-type';

export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended',
}

export const STATUS_COLOR_GROUP = {
  'e-success': [
    'open',
    'Active',
    'Completed',
    'active',
    'completed',
    'applied',
    TIMETHEETS_STATUSES.PENDING_APPROVE,
    TIMETHEETS_STATUSES.PENDING_APPROVE_ASTERIX,
    INVOICES_STATUSES.PENDING_APPROVAL,
  ], // green
  'e-warning': [
    'incomplete',
    'suspended',
    'Suspended',
    'Incomplete',
    'shortlisted',
    'in progress (pending)',
    'ex',
    INVOICES_STATUSES.PENDING_PAYMENT,
  ], // yellow
  'e-default': ['closed', 'Inactive', 'inactive', 'Closed', 'withdraw', 'Rejected', TIMETHEETS_STATUSES.REJECTED], // hard gray
  'e-pending': ['pending', 'Pending', 'offered', TIMETHEETS_STATUSES.MISSING], // red
  'e-progress': ['in progress', 'In Progress', 'Verified', 'verified', INVOICES_STATUSES.SUBMITED_PEND_APPR], // blue
  'e-accepted': [
    'accepted',
    'Accepted',
    'in progress (accepted)',
    TIMETHEETS_STATUSES.ORG_APPROVED,
    TIMETHEETS_STATUSES.APPROVED,
  ], // purple
  'e-filled': ['filled', 'Filled', 'onboarded', 'onboard'], // light blue
  'e-awaiting': ['not applied', 'Not Applied'], // gray
};

export enum AgencyStatus {
  Pending,
  Inactive,
  Active,
  Suspended,
}

export enum CandidateStatus {
  Inactive,
  Active,
  Incomplete,
}

export enum CreatedCandidateStatus {
  Inactive,
  Active,
}

export enum CredentialVerifiedStatus {
  Pending,
  Verified,
  Completed,
  Rejected,
}

export enum CreateUserStatus {
  Inactive,
  Active,
}

export enum OrderStatusText {
  Incomplete = 1,
  PreOpen = 5,
  Open = 20,
  'In progress' = 30,
  'In Progress (Pending)' = 31,
  'In Progress (Accepted)' = 32,
  Filled = 50,
  Closed = 60,
}

export enum CandidatesStatusText {
  Applied = 10,
  Shortlisted = 20,
  Offered = 40,
  Accepted = 50,
  Onboard = 60,
  'Bill Rate Pending' = 44,
  'Offered Bill Rate' = 47,
  Rejected = 100,
}

export const CandidateStatusOptions = [
  { id: CandidateStatus.Inactive, name: 'Inactive' },
  { id: CandidateStatus.Active, name: 'Active' },
];
