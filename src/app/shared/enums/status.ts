export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active', 'Completed'],
  'e-warning': ['incomplete', 'Suspended', 'Incomplete'],
  'e-default': ['closed', 'Inactive'],
  'e-pending': ['pending', 'Pending'],
  'e-progress': ['in progress', 'In Progress', 'Verified'],
  'e-accepted': ['accepted'],
  'e-filled': ['filled']
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
