//export enum OrderType {
//  'Contract to Perm' = 0,
//  'Open Per Diem' = 1,
//  'Perm Placement' = 2,
//  'LTA' = 3,
//  'Reorder' = 10
//}
export class OrderStatusSummaryReportRequest {
  Region?: string;
  Location?: string;
  Department?: string;
  Skills?: string;
  OrderType?: string;
  OrderStatus?: string;
}

export class OrderStatusSummaryReportFilters {
  region: Region[];
  location: Location[];
  department: Department[];
  skills: Skills[];
  orderType: OrderTypeDto[];
}

export class Region {
  regionId: number;
  region: string
}

export class Location {
  locationId: number;
  location: string;
  regionId: number
}

export class Department {
  departmentId: number;
  department: string;
  locationId: number
}

export class Skills {
  skillId: number;
  skill: string
}

export class OrderTypeDto {
  orderTypeId: number;
  orderTypeName: string
}

export class OrderStatusSummaryCustomReport {
  totalPositions: number;
  openPositions: number;
  closed: number;
  filled: number;
  accepted: number;
  applied: number;
  offered: number;
  inProgress: number;
  organizationID: number;
  orderID: string;
  orderType: string;
  region: string;
  regionId: number;
  location: string;
  locationId: number;
  department: string;
  departmentId: number;
  calculatedStatus: string;
  skill: string;
  skillId: number;
}
