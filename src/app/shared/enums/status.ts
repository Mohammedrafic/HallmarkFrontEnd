import { TIMETHEETS_STATUSES } from '../../modules/timesheets/enums/timesheets.enum';

export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active', 'Completed', 'active', 'completed','applied', TIMETHEETS_STATUSES.PENDING_APPROVE],
  'e-warning': ['incomplete', 'suspended', 'Suspended', 'Incomplete', 'shortlisted', 'in progress (pending)'],
  'e-default': ['closed', 'Inactive', 'inactive', 'Closed', TIMETHEETS_STATUSES.REJECTED],
  'e-pending': ['pending', 'Pending', 'offered', TIMETHEETS_STATUSES.MISSING],
  'e-progress': ['in progress', 'In Progress', 'Verified', 'verified'],
  'e-accepted': ['accepted','Accepted', 'in progress (accepted)', TIMETHEETS_STATUSES.ORG_APPROVED],
  'e-filled': ['filled', 'Filled', 'onboarded', "onboarded"],
  'e-awaiting': ['not applied', 'Not Applied']
}

export enum AgencyStatus {
  Pending,
  Inactive,
  Active,
  Suspended,
}

export enum CandidateStatus {
  Inactive,
  Active,
  Incomplete
}

export enum CreatedCandidateStatus {
  Inactive,
  Active
}

export enum CredentialVerifiedStatus {
  Pending,
  Verified,
  Completed
}

export enum CreateUserStatus {
  Inactive,
  Active,
}

export enum OrderStatusText {
  Incomplete = 1,
  PreOpen = 5,
  Open = 20,
  "In progress" = 30,
  "In Progress (Pending)" = 31,
  "In Progress (Accepted)" = 32,
  Filled = 50,
  Closed = 60
}
