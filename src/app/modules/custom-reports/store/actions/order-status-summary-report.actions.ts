import { OrderStatusSummaryReportRequest } from "../model/order-status-summary-report.model";

export class GetOrderStatusSummaryReportPage {
  static readonly type = '[Order Status Summary Report] Get Order Status Summary Report Page';
  constructor(public payload: OrderStatusSummaryReportRequest) { }
}

export class GetOrderStatusSummaryFiltersByOrganization {
  static readonly type = '[Order Status Summary Report] Get The List Of Order Status Summary Filters By Organization';
  constructor() { }
}

export class GetOrganizationRegions {
  static readonly type = '[candidate details] Get Candidate Regions';
  constructor() { }
}

export class GetOrganizationSkills {
  static readonly type = '[candidate details] Get Candidate Skills';
  constructor() { }
}
