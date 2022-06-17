export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active', 'Completed', 'active', 'completed','applied'],
  'e-warning': ['incomplete', 'suspended', 'Suspended', 'Incomplete', 'incomplete', 'shortlisted'],
  'e-default': ['closed', 'Inactive', 'inactive', 'Closed'],
  'e-pending': ['pending', 'Pending', 'offered'],
  'e-progress': ['in progress', 'In Progress', 'Verified', 'verified'],
  'e-accepted': ['accepted','Accepted'],
  'e-filled': ['filled', 'Filled', 'onboard'],
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
