import { PositionTrendTypeEnum } from '../enums/position-trend-type.enum';

export const positionTrendLegendPalette: Record<PositionTrendTypeEnum, string> = {
  [PositionTrendTypeEnum.CLOSED]: 'var(--widget-status-accepted)',
  [PositionTrendTypeEnum.ONBOARD]: 'var(--widget-status-onboard-filled)',
  [PositionTrendTypeEnum.OPEN]: 'var(--widget-status-applied-open)',
  [PositionTrendTypeEnum.IN_PROGRESS]: 'var(--widget-status-in-progress)',
};
