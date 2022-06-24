export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active', 'Completed', 'active', 'completed','applied'],
  'e-warning': ['incomplete', 'suspended', 'Suspended', 'Incomplete', 'incomplete', 'shortlisted', 'in progress (pending)'],
  'e-default': ['closed', 'Inactive', 'inactive', 'Closed'],
  'e-pending': ['pending', 'Pending', 'offered'],
  'e-progress': ['in progress', 'In Progress', 'Verified', 'verified'],
  'e-accepted': ['accepted','Accepted', 'in progress (accepted)'],
  'e-filled': ['filled', 'Filled', 'onboard', "onboarded"],
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
