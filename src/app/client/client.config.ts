
import { GRID_CONFIG } from '../shared/constants/grid-config';

export const SIDEBAR_CONFIG = {
  isDock: true,
  dockSize: '68px',
  width: '260px',
  type: 'Push'
}

export enum SortingDirections {
  Descending = 'Descending',
  Ascending = 'Ascending'
}

export const ORDERS_GRID_CONFIG = {
  ...GRID_CONFIG,
  columns: [
    { field: 'orderId', direction: SortingDirections.Descending },
    { field: 'status', direction: SortingDirections.Descending },
    { field: 'jobTitle', direction: SortingDirections.Descending },
    { field: 'skill', direction: SortingDirections.Descending },
    { field: 'numberOfPosition', direction: SortingDirections.Descending },
    { field: 'location', direction: SortingDirections.Descending },
    { field: 'department', direction: SortingDirections.Descending },
    { field: 'type', direction: SortingDirections.Descending },
    { field: 'billRate', direction: SortingDirections.Descending },
    { field: 'candidates', direction: SortingDirections.Descending },
    { field: 'startDate', direction: SortingDirections.Descending }
  ]
}
