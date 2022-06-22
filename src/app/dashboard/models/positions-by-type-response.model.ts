import type { PositionTypeEnum } from '../enums/position-type.enum';

export type PositionsByTypeResponseModel = Record<PositionTypeEnum, number[]>;
