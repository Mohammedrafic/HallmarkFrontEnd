export enum Status {
  'Work In Progress',
  'Inactive',
  'Active',
  'Suspended'
}

export const STATUS_COLOR_GROUP = {
  'e-success': ['open', 'Active', 'Work In Progress'],
  'e-warning': ['incomplete', 'in progress', 'pending', 'accepted', 'filled', 'Suspended', 'Inactive'],
  'e-default': ['closed']
}
