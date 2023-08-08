export interface ActivePositionsDto {
  orderStatusesDetails: ActivePositionTypeInfo[];
}

export interface ActivePositionTypeInfo {
  orderStatus: number;
  statusName: string;
  count: number;
}


export interface OrderStatusesActivePositionsDto {
  orderStatusesAvgDetails: OrderStatusesAvgDetailsInfo[];
}

export interface OrderStatusesAvgDetailsInfo {
  orderStatus: number;
  statusName: string;
  count: number;
  average: number;
}