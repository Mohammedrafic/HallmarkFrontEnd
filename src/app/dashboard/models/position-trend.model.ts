import { WidgetTypeEnum } from '../enums/widget-type.enum';

export interface PositionTrend {
  id: WidgetTypeEnum;
  total: number;
  percentRatio: number;
  chartData: { x: number; y: number }[];
  title: string;
}

export interface PositionTrendDto {
  total: number;
  values: number[],
}
