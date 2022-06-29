import { ActivePositionsLegendPalette } from "../enums/active-positions-legend-palette.enum";

export const activePositionsLegendPalette: Record<ActivePositionsLegendPalette, string> = {
  [ActivePositionsLegendPalette.OPEN]: 'var(--widget-status-applied-open)',
  [ActivePositionsLegendPalette.IN_PROGRESS]: 'var(--widget-status-in-progress)',
  [ActivePositionsLegendPalette.PENDING]: 'var(--widget-status-offered-pending)',
  [ActivePositionsLegendPalette.ACCEPTED]: 'var(--widget-status-accepted)',
  [ActivePositionsLegendPalette.FILLED]: 'var(--widget-status-onboard-filled)',
  [ActivePositionsLegendPalette.CLOSED]: 'var(--widget-status-rejected-closed)',
  [ActivePositionsLegendPalette.INCOMPLETE]: 'var(--widget-status-shortlisted-incomplete)',
}
