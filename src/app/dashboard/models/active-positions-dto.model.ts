export interface ActivePositionsDto {
  orderStatusesDetails: ActivePositionTypeInfo[];
}

export interface ActivePositionTypeInfo {
  orderStatus: number;
  statusName: string;
  count: number;
}