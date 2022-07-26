import type { PositionTypeEnum } from '../enums/position-type.enum';

export type PositionsByTypeAggregatedModel = Record<PositionTypeEnum, PositionByTypeDataModel[]>;

export interface PositionByTypeDataModel {
  month: string;
  value: number;
}

export interface ITimeSlice {
  startDate: string;
  endDate: string;
}
