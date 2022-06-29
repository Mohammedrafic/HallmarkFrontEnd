import { ActivePositionsChartStatuses } from "../enums/active-positions-legend-palette.enum";

export const activePositionsLegendPalette: Record<ActivePositionsChartStatuses, string> = {
  [ActivePositionsChartStatuses.OPEN]: 'var(--widget-status-applied-open)',
  [ActivePositionsChartStatuses.IN_PROGRESS]: 'var(--widget-status-in-progress)',
  [ActivePositionsChartStatuses.PENDING]: 'var(--widget-status-offered-pending)',
  [ActivePositionsChartStatuses.ACCEPTED]: 'var(--widget-status-accepted)',
  [ActivePositionsChartStatuses.FILLED]: 'var(--widget-status-onboard-filled)',
  [ActivePositionsChartStatuses.CLOSED]: 'var(--widget-status-rejected-closed)',
  [ActivePositionsChartStatuses.INCOMPLETE]: 'var(--widget-status-shortlisted-incomplete)',
}
