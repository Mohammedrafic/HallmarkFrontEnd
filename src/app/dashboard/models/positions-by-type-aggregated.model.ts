import type { PositionTrendTypeEnum } from '../enums/position-trend-type.enum';

export type PositionsByTypeAggregatedModel = Record<PositionTrendTypeEnum, PositionByTypeDataModel[]>;

export interface PositionByTypeDataModel {
  month: string;
  value: number;
}

export interface ITimeSlice {
  dateFrom: string;
  dateTo: string;
}
