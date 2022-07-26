import { PositionTrendChartStatuses } from '../enums/position-trend-legend-palette.enum';

export const positionTrendLegendPalette: Record<PositionTrendChartStatuses, string> = {
  [PositionTrendChartStatuses.CLOSED]: 'var(--widget-status-accepted)',
  [PositionTrendChartStatuses.ONBOARD]: 'var(--widget-status-onboard-filled)',
  [PositionTrendChartStatuses.OPEN]: 'var(--widget-status-applied-open)',
  [PositionTrendChartStatuses.IN_PROGRESS]: 'var(--widget-status-in-progress)',
};
