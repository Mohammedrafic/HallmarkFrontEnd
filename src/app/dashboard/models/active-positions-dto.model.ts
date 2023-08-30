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
  customStatusName: string;
}

export interface PositionsCountByDayRange {
  orderStatusesAvgDetails: StatusesAvgDetails[];
}

export interface StatusesAvgDetails {
  orderStatus: number;
  statusName: string;
  totalCount: number;
  count30Positions: number;
  count30PlusPositions: number;
  count15Positions: number;
  count7Positions: number;
  count3Positions: number;
}

export interface PositionsCountByDayRangeDataset {
  id: string;
  title: string;
  chartData: PositionsCountByDayRangeData[];
}


export interface PositionsCountByDayRangeData {
  label: string;
  value: number;
  count3?: number;
  count7?: number;
  count15?: number;
  count30?: number;
  count30Plus?: number;
}

export interface OrdersPendingInCustom {
  orderPendingApprovalCustom : CustomStatusesAvgDetails[];
}

export interface CustomStatusesAvgDetails {
  customStatus: string;
  initialOrderDtos: InitialOrderDtos[];
  extensionOrderDtos: extensionOrderDtos[];
}

export interface OrdersPendingInCustomDataset {
  id: string;
  title: string;
  chartData: CustomStatusesAvgDetails[];
}

export interface InitialOrderDtos{
  orderCount?:number,
  avgDays?:string,
}

export interface extensionOrderDtos{
  orderCount?:number,
  avgDays?:string,
}

