export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active', 'In Progress'],
  'e-warning': ['incomplete', 'Suspended'],
  'e-default': ['closed', 'Inactive'],
  'e-pending': ['pending'],
  'e-progress': ['in progress'],
  'e-accepted': ['accepted'],
  'e-filled': ['filled']
}
