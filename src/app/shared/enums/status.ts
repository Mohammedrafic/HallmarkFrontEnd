export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active', 'Completed', 'active', 'completed'],
  'e-warning': ['incomplete', 'suspended', 'Suspended', 'Incomplete', 'incomplete'],
  'e-default': ['closed', 'Inactive', 'inactive', 'Closed'],
  'e-pending': ['pending', 'Pending'],
  'e-progress': ['in progress', 'In Progress', 'Verified', 'verified'],
  'e-accepted': ['accepted'],
  'e-filled': ['filled', 'Filled']
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

export enum OrderStatus {
  Open,
  InProgress,
  Filled,
  Closed
}
