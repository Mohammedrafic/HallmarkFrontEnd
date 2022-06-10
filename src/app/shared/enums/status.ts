export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active', 'Completed', 'active', 'completed','Applied'],
  'e-warning': ['incomplete', 'suspended', 'Suspended', 'Incomplete', 'incomplete', 'Shortlisted'],
  'e-default': ['closed', 'Inactive', 'inactive', 'Closed', 'Not applied'],
  'e-pending': ['pending', 'Pending', 'Offered'],
  'e-progress': ['in progress', 'In Progress', 'Verified', 'verified'],
  'e-accepted': ['accepted','Accepted'],
  'e-filled': ['filled', 'Filled', 'Onboarded']
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
