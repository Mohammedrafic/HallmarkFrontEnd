import { OrderStatusSummaryReportRequest } from "../model/order-status-summary-report.model";

export class GetOrderStatusSummaryReportPage {
  static readonly type = '[Order Status Summary Report] Get Order Status Summary Report Page';
  constructor(public payload: OrderStatusSummaryReportRequest) { }
}

export class GetOrderStatusSummaryFiltersByOrganization {
  static readonly type = '[Order Status Summary Report] Get The List Of Order Status Summary Filters By Organization';
  constructor() { }
}

export class GetRegionsByOrganizations {
  static readonly type = '[Order Status Summary Report] Get The List Of Regions By Organizations';
  constructor(public organizationId: number[]) { }
}
export class GetLocationsByRegions {
  static readonly type = '[Order Status Summary Report] Get The List Of Locations By Regions';
  constructor(public regionIds: string, public organizationId: number[]) { }
}
export class GetDepartmentsByLocations {
  static readonly type = '[Order Status Summary Report] Get The List Of Departments By Locations';
  constructor(public locationIds: string, public organizationId: number[]) { }
}
export class GetSkillsByOrganizations {
  static readonly type = '[Order Status Summary Report] Get The List Of Regions By Organizations';
  constructor() { }
}
