export enum Status {
  'In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active'],
  'e-warning': ['incomplete', 'Suspended'],
  'e-default': ['closed', 'Inactive'],
  'e-pending': ['pending'],
  'e-progress': ['in progress', 'In Progress'],
  'e-accepted': ['accepted'],
  'e-filled': ['filled']
}
