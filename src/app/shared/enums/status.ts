export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active'],
  'e-warning': ['incomplete', 'Suspended', 'Incomplete'],
  'e-default': ['closed', 'Inactive'],
  'e-pending': ['pending', 'Pending'],
  'e-progress': ['in progress', 'In Progress'],
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
