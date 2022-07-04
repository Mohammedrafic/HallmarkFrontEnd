import { WidgetTypeEnum } from '../enums/widget-type.enum';

export interface PositionTrend {
  id: WidgetTypeEnum;
  value: number;
  percentRatio: number;
  chartData: { x: number; y: number }[];
}

export interface PositionTrendDto {
  values: number[],
}
