export class OrderStatusSummaryReportRequest {
  Region?: string;
  Location?: string;
  Department?: string;
  Skills?: string;
  OrderType?: string;
  OrderStatus?: string;
}

export class LocationFilter {
  RegionIds?: number[];
  OrganizationId: number[];
}

export class DepartmentFilter {
  LocationIds?: number[];
  OrganizationId: number[];
}

export class OrderStatusSummaryReportFilters {
  skills: Skills[];
  orderType: OrderTypeDto[];
}

export class Region {
  regionId: number | undefined;
  region: string
}

export class Location {
  locationId: number;
  location: string;
  regionId: number;
}

export class Department {
  departmentId: number;
  department: string;
  locationId: number;
  extDepartmentId?: string;
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
  locationExtId: string;
  department: string;
  departmentId: number;
  departmentExtId: string;
  calculatedStatus: string;
  skill: string;
  skillId: number;
  skillExtId: string;
}
