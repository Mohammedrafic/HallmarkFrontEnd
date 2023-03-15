import { TIMETHEETS_STATUSES } from '../../modules/timesheets/enums';
import { INVOICES_STATUSES } from '../../modules/invoices/enums';

export enum Status {
  'Active',
  'In Progress',
  'Inactive',
  'Suspended',
}

export enum OrganizationStatus {
  'In Progress' = 0,
  Inactive = 1,
  Active = 2,
  Suspended = 3,
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
    'new',
  ], // green
  'e-warning': [
    'incomplete',
    'suspended',
    'Suspended',
    'Incomplete',
    'shortlisted',
    'in progress (pending)',
    'ex',
    'OnHold',
    'On Hold',
    INVOICES_STATUSES.PENDING_PAYMENT,
    TIMETHEETS_STATUSES.NO_MILEAGES_EXIST,
  ], // yellow
  'e-default': [
    'closed',
    'Inactive',
    'inactive',
    'Closed',
    'withdraw',
    'Cancelled',
    'cancelled',
    TIMETHEETS_STATUSES.REJECTED,
    TIMETHEETS_STATUSES.ARCHIVED,
  ], // hard gray
  'e-pending': ['pending', 'Pending', 'offered', TIMETHEETS_STATUSES.MISSING, 'deleted', 'Terminated'], // red
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
  InProgress,
  Inactive,
  Active,
  Suspended,
  Terminated,
}

export const AgencyStatuses = [
  { id: AgencyStatus.Active, text: 'Active' },
  { id: AgencyStatus.Inactive, text: 'Inactive' },
  { id: AgencyStatus.InProgress, text: 'In Progress' },
  { id: AgencyStatus.Suspended, text: 'Suspended' },
  { id: AgencyStatus.Terminated, text: 'Terminated' },
]

export enum CandidateStatus {
  Inactive,
  Active,
  Incomplete,
}

export enum EmployeeStatus {
  Inactive,
  Active,
  'On Hold',
  Terminated
}

export enum CreatedCandidateStatus {
  Inactive,
  Active,
}

export enum CredentialStatus {
  Pending,
  Verified,
  Completed,
  Rejected,
  Reviewed,
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

export enum FilterOrderStatusText {
  Open = 'Open',
  'In Progress' = 'InProgress',
  Filled = 'Filled',
  Closed = 'Closed',
  NoRecordsFound = "No Pending Orders"
}

export enum LocalStorageStatus {
  Ordercountzero = "Ordercountzero",
  OrdersforApproval = "OrdersforApproval"
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
  Cancelled = 110,
}

export const CandidateStatusOptions = [
  { id: CandidateStatus.Active, name: 'Active' },
  { id: CandidateStatus.Inactive, name: 'Inactive' },
];
