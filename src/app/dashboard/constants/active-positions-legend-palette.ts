import { ActivePositionsChartStatuses } from "../enums/active-positions-legend-palette.enum";

export const activePositionsLegendPalette: Record<ActivePositionsChartStatuses, string> = {
  [ActivePositionsChartStatuses.OPEN]: 'var(--widget-status-applied-open)',
  [ActivePositionsChartStatuses.IN_PROGRESS]: 'var(--widget-status-in-progress)',
  [ActivePositionsChartStatuses.PENDING]: 'var(--widget-status-offered-pending)',
  [ActivePositionsChartStatuses.ACCEPTED]: 'var(--widget-status-accepted)',
  [ActivePositionsChartStatuses.FILLED]: 'var(--widget-status-onboard-filled)',
  [ActivePositionsChartStatuses.CLOSED]: 'var(--widget-status-rejected-closed)',
  [ActivePositionsChartStatuses.INCOMPLETE]: 'var(--widget-status-shortlisted-incomplete)',
  [ActivePositionsChartStatuses.CUSTOM]: 'var(--widget-status-custom)'
}

export const activePositionsLegendDisplayText: Record<ActivePositionsChartStatuses, string> = {
  [ActivePositionsChartStatuses.OPEN]: ActivePositionsChartStatuses.OPEN,
  [ActivePositionsChartStatuses.IN_PROGRESS]: 'In Progress',
  [ActivePositionsChartStatuses.PENDING]: 'In Progress (Pending)',
  [ActivePositionsChartStatuses.ACCEPTED]: 'In Progress (Accepted)',
  [ActivePositionsChartStatuses.FILLED]: ActivePositionsChartStatuses.FILLED,
  [ActivePositionsChartStatuses.CLOSED]: ActivePositionsChartStatuses.CLOSED,
  [ActivePositionsChartStatuses.INCOMPLETE]: ActivePositionsChartStatuses.INCOMPLETE,
  [ActivePositionsChartStatuses.CUSTOM]: ActivePositionsChartStatuses.CUSTOM
}
